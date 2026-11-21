import type { RealtimeChannel } from '@supabase/supabase-js';
import { hasSupabaseConfig } from '../config/providers';
import type { HazardKind, HazardReport } from '../types';
import { getSupabaseClient } from './supabaseClient';

export interface RealtimeHazardEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  hazard?: HazardReport;
  deletedId?: string;
}

interface RawHazardPayload {
  id?: string;
  user_id?: string | null;
  kind?: HazardKind;
  title?: string;
  note?: string | null;
  lng?: number;
  lat?: number;
  confirmations?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * Subscribes to Supabase Realtime `postgres_changes` on `public.hazard_reports`.
 * Gracefully no-ops in Guest/Local mode or if Realtime publication isn't enabled yet.
 */
export function subscribeRealtimeHazards(
  onEvent: (ev: RealtimeHazardEvent) => void,
  onStatusChange?: (connected: boolean) => void
): () => void {
  if (!hasSupabaseConfig()) {
    onStatusChange?.(false);
    return () => {};
  }

  const client = getSupabaseClient();
  if (!client || typeof client.channel !== 'function') {
    onStatusChange?.(false);
    return () => {};
  }

  let channel: RealtimeChannel | null = null;
  try {
    channel = client
      .channel('eixoverde-live-hazards')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hazard_reports' },
        (payload) => {
          const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
          if (eventType === 'DELETE') {
            const oldRow = (payload.old ?? {}) as RawHazardPayload;
            if (oldRow.id) {
              onEvent({ eventType: 'DELETE', deletedId: oldRow.id });
            }
            return;
          }
          const row = (payload.new ?? {}) as RawHazardPayload;
          if (!row.id || typeof row.lng !== 'number' || typeof row.lat !== 'number') return;
          if (row.deleted_at) {
            onEvent({ eventType: 'DELETE', deletedId: row.id });
            return;
          }
          const hazard: HazardReport = {
            id: row.id,
            kind: row.kind || 'buraco',
            title: row.title || 'Alerta na ciclovia',
            note: row.note ?? undefined,
            coords: [Number(row.lng), Number(row.lat)],
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
            confirmations: Math.max(1, Number(row.confirmations) || 1),
            userId: row.user_id ?? undefined,
            isCommunity: true,
          };
          onEvent({ eventType, hazard });
        }
      )
      .subscribe((status) => {
        onStatusChange?.(status === 'SUBSCRIBED');
      });
  } catch {
    onStatusChange?.(false);
    return () => {};
  }

  return () => {
    onStatusChange?.(false);
    if (channel) {
      try {
        void client.removeChannel(channel);
      } catch {
        // Ignore cleanup errors
      }
    }
  };
}
