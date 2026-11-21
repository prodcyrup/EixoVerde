import type { LngLat, PlaceResult, SavedRoute } from '../types';

export type BrazilRegion = 'Centro-Oeste' | 'Sudeste' | 'Sul' | 'Nordeste' | 'Norte';

export interface BrazilCapitalCity {
  slug: string;
  name: string;
  stateCode: string;
  stateName: string;
  label: string;
  region: BrazilRegion;
  center: LngLat;
  zoom: number;
  /** Nominatim viewbox [minLng, maxLat, maxLng, minLat] */
  viewbox: [number, number, number, number];
  totalKm: number;
  cicloviaKm: number;
  ciclofaixaKm: number;
  lanesCount: number;
  poisCount: number;
  bikeShareBrand: string;
  highlights: string;
  lanesUrl: string;
  poisUrl: string;
}

export const BRAZIL_REGIONS: BrazilRegion[] = [
  'Centro-Oeste',
  'Sudeste',
  'Sul',
  'Nordeste',
  'Norte',
];

export const BRAZIL_CAPITALS: BrazilCapitalCity[] = [
  {
    "slug": "brasilia",
    "name": "Brasília",
    "stateCode": "DF",
    "stateName": "Distrito Federal",
    "label": "Brasília, DF",
    "region": "Centro-Oeste",
    "center": [
      -47.8828,
      -15.7939
    ],
    "zoom": 12.2,
    "viewbox": [
      -48.1628,
      -15.5539,
      -47.6028,
      -16.0339
    ],
    "totalKm": 690.4,
    "cicloviaKm": 614.2,
    "ciclofaixaKm": 62.8,
    "lanesCount": 2729,
    "poisCount": 254,
    "bikeShareBrand": "Bike Brasília (Tembici) & JET",
    "highlights": "Eixo Monumental, Parque da Cidade, Orla do Lago Paranoá e Ciclovia W4/W5",
    "lanesUrl": "data/cities/brasilia-lanes.geojson",
    "poisUrl": "data/cities/brasilia-pois.geojson"
  },
  {
    "slug": "goiania",
    "name": "Goiânia",
    "stateCode": "GO",
    "stateName": "Goiás",
    "label": "Goiânia, GO",
    "region": "Centro-Oeste",
    "center": [
      -49.2648,
      -16.6869
    ],
    "zoom": 12.5,
    "viewbox": [
      -49.5448,
      -16.4469,
      -48.9848,
      -16.9269
    ],
    "totalKm": 126.7,
    "cicloviaKm": 66.8,
    "ciclofaixaKm": 23.6,
    "lanesCount": 591,
    "poisCount": 30,
    "bikeShareBrand": "GynDebike",
    "highlights": "Parque Flamboyant, Parque Vaca Brava, Av. T-63 e Alameda das Rosas",
    "lanesUrl": "data/cities/goiania-lanes.geojson",
    "poisUrl": "data/cities/goiania-pois.geojson"
  },
  {
    "slug": "campo-grande",
    "name": "Campo Grande",
    "stateCode": "MS",
    "stateName": "Mato Grosso do Sul",
    "label": "Campo Grande, MS",
    "region": "Centro-Oeste",
    "center": [
      -54.6201,
      -20.4697
    ],
    "zoom": 12.4,
    "viewbox": [
      -54.9001,
      -20.2297,
      -54.3401,
      -20.7097
    ],
    "totalKm": 126.1,
    "cicloviaKm": 117.4,
    "ciclofaixaKm": 8.6,
    "lanesCount": 403,
    "poisCount": 315,
    "bikeShareBrand": "Ciclovias Morena",
    "highlights": "Parque das Nações Indígenas, Av. Afonso Pena e Orla Morena",
    "lanesUrl": "data/cities/campo-grande-lanes.geojson",
    "poisUrl": "data/cities/campo-grande-pois.geojson"
  },
  {
    "slug": "cuiaba",
    "name": "Cuiabá",
    "stateCode": "MT",
    "stateName": "Mato Grosso",
    "label": "Cuiabá, MT",
    "region": "Centro-Oeste",
    "center": [
      -56.0979,
      -15.6014
    ],
    "zoom": 12.4,
    "viewbox": [
      -56.3779,
      -15.3614,
      -55.8179,
      -15.8414
    ],
    "totalKm": 152.6,
    "cicloviaKm": 66.3,
    "ciclofaixaKm": 80.7,
    "lanesCount": 756,
    "poisCount": 9,
    "bikeShareBrand": "Ciclovias Cuiabá",
    "highlights": "Parque das Águas, Orla do Porto e Parque Mãe Bonifácia",
    "lanesUrl": "data/cities/cuiaba-lanes.geojson",
    "poisUrl": "data/cities/cuiaba-pois.geojson"
  },
  {
    "slug": "sao-paulo",
    "name": "São Paulo",
    "stateCode": "SP",
    "stateName": "São Paulo",
    "label": "São Paulo, SP",
    "region": "Sudeste",
    "center": [
      -46.6559,
      -23.5614
    ],
    "zoom": 12.1,
    "viewbox": [
      -46.9359,
      -23.3214,
      -46.3759,
      -23.8014
    ],
    "totalKm": 815.4,
    "cicloviaKm": 297.8,
    "ciclofaixaKm": 495.9,
    "lanesCount": 7414,
    "poisCount": 808,
    "bikeShareBrand": "Bike Itaú (Tembici)",
    "highlights": "Ciclovia Av. Paulista, Ciclovia Rio Pinheiros, Parque Ibirapuera e Faria Lima",
    "lanesUrl": "data/cities/sao-paulo-lanes.geojson",
    "poisUrl": "data/cities/sao-paulo-pois.geojson"
  },
  {
    "slug": "rio-de-janeiro",
    "name": "Rio de Janeiro",
    "stateCode": "RJ",
    "stateName": "Rio de Janeiro",
    "label": "Rio de Janeiro, RJ",
    "region": "Sudeste",
    "center": [
      -43.1882,
      -22.9694
    ],
    "zoom": 12.1,
    "viewbox": [
      -43.4682,
      -22.7294,
      -42.9082,
      -23.2094
    ],
    "totalKm": 401,
    "cicloviaKm": 235.3,
    "ciclofaixaKm": 31.4,
    "lanesCount": 2051,
    "poisCount": 1975,
    "bikeShareBrand": "Bike Itaú (Tembici)",
    "highlights": "Orla Copacabana–Ipanema–Leblon, Lagoa Rodrigo de Freitas e Aterro do Flamengo",
    "lanesUrl": "data/cities/rio-de-janeiro-lanes.geojson",
    "poisUrl": "data/cities/rio-de-janeiro-pois.geojson"
  },
  {
    "slug": "belo-horizonte",
    "name": "Belo Horizonte",
    "stateCode": "MG",
    "stateName": "Minas Gerais",
    "label": "Belo Horizonte, MG",
    "region": "Sudeste",
    "center": [
      -43.9378,
      -19.9208
    ],
    "zoom": 12.2,
    "viewbox": [
      -44.2178,
      -19.6808,
      -43.6578,
      -20.1608
    ],
    "totalKm": 140.5,
    "cicloviaKm": 76.1,
    "ciclofaixaKm": 30.2,
    "lanesCount": 1812,
    "poisCount": 62,
    "bikeShareBrand": "Ciclovias BH",
    "highlights": "Orla da Lagoa da Pampulha, Praça da Liberdade e Av. dos Andradas",
    "lanesUrl": "data/cities/belo-horizonte-lanes.geojson",
    "poisUrl": "data/cities/belo-horizonte-pois.geojson"
  },
  {
    "slug": "vitoria",
    "name": "Vitória",
    "stateCode": "ES",
    "stateName": "Espírito Santo",
    "label": "Vitória, ES",
    "region": "Sudeste",
    "center": [
      -40.2958,
      -20.2976
    ],
    "zoom": 12.7,
    "viewbox": [
      -40.5758,
      -20.0576,
      -40.0158,
      -20.5376
    ],
    "totalKm": 54.1,
    "cicloviaKm": 42.6,
    "ciclofaixaKm": 8.9,
    "lanesCount": 582,
    "poisCount": 32,
    "bikeShareBrand": "Bike Vitória",
    "highlights": "Orla de Camburi, Praça dos Namorados, Ilha do Boi e Parque Pedra da Cebola",
    "lanesUrl": "data/cities/vitoria-lanes.geojson",
    "poisUrl": "data/cities/vitoria-pois.geojson"
  },
  {
    "slug": "curitiba",
    "name": "Curitiba",
    "stateCode": "PR",
    "stateName": "Paraná",
    "label": "Curitiba, PR",
    "region": "Sul",
    "center": [
      -49.2733,
      -25.4284
    ],
    "zoom": 12.4,
    "viewbox": [
      -49.5533,
      -25.1884,
      -48.9933,
      -25.6684
    ],
    "totalKm": 246.9,
    "cicloviaKm": 220.4,
    "ciclofaixaKm": 4.8,
    "lanesCount": 2991,
    "poisCount": 292,
    "bikeShareBrand": "Bike Curitiba",
    "highlights": "Parque Barigui, Jardim Botânico, Centro Cívico, Passeio Público e Via Calma Sete de Setembro",
    "lanesUrl": "data/cities/curitiba-lanes.geojson",
    "poisUrl": "data/cities/curitiba-pois.geojson"
  },
  {
    "slug": "florianopolis",
    "name": "Florianópolis",
    "stateCode": "SC",
    "stateName": "Santa Catarina",
    "label": "Florianópolis, SC",
    "region": "Sul",
    "center": [
      -48.5496,
      -27.5973
    ],
    "zoom": 12.4,
    "viewbox": [
      -48.8296,
      -27.3573,
      -48.2696,
      -27.8373
    ],
    "totalKm": 142.7,
    "cicloviaKm": 53.2,
    "ciclofaixaKm": 62.5,
    "lanesCount": 1159,
    "poisCount": 111,
    "bikeShareBrand": "Floripa Bike",
    "highlights": "Ciclovia Beira-Mar Norte, Ponte Hercílio Luz, UFSC e Lagoa da Conceição",
    "lanesUrl": "data/cities/florianopolis-lanes.geojson",
    "poisUrl": "data/cities/florianopolis-pois.geojson"
  },
  {
    "slug": "porto-alegre",
    "name": "Porto Alegre",
    "stateCode": "RS",
    "stateName": "Rio Grande do Sul",
    "label": "Porto Alegre, RS",
    "region": "Sul",
    "center": [
      -51.2304,
      -30.0325
    ],
    "zoom": 12.4,
    "viewbox": [
      -51.5104,
      -29.7925,
      -50.9504,
      -30.2725
    ],
    "totalKm": 88.9,
    "cicloviaKm": 48.1,
    "ciclofaixaKm": 39.1,
    "lanesCount": 2357,
    "poisCount": 512,
    "bikeShareBrand": "Bike PoA (Tembici)",
    "highlights": "Orla do Guaíba, Usina do Gasômetro, Parque Farroupilha (Redenção) e Ciclovia Ipiranga",
    "lanesUrl": "data/cities/porto-alegre-lanes.geojson",
    "poisUrl": "data/cities/porto-alegre-pois.geojson"
  },
  {
    "slug": "fortaleza",
    "name": "Fortaleza",
    "stateCode": "CE",
    "stateName": "Ceará",
    "label": "Fortaleza, CE",
    "region": "Nordeste",
    "center": [
      -38.5218,
      -3.7305
    ],
    "zoom": 12.3,
    "viewbox": [
      -38.8018,
      -3.4905,
      -38.2418,
      -3.9705
    ],
    "totalKm": 481.6,
    "cicloviaKm": 172.2,
    "ciclofaixaKm": 286.6,
    "lanesCount": 3637,
    "poisCount": 502,
    "bikeShareBrand": "Bicicletar Fortaleza",
    "highlights": "Nova Beira-Mar (Iracema–Mucuripe), Parque do Cocó e Campus do Pici",
    "lanesUrl": "data/cities/fortaleza-lanes.geojson",
    "poisUrl": "data/cities/fortaleza-pois.geojson"
  },
  {
    "slug": "salvador",
    "name": "Salvador",
    "stateCode": "BA",
    "stateName": "Bahia",
    "label": "Salvador, BA",
    "region": "Nordeste",
    "center": [
      -38.5014,
      -12.9714
    ],
    "zoom": 12.2,
    "viewbox": [
      -38.7814,
      -12.7314,
      -38.2214,
      -13.2114
    ],
    "totalKm": 236.2,
    "cicloviaKm": 130.9,
    "ciclofaixaKm": 93.6,
    "lanesCount": 1826,
    "poisCount": 266,
    "bikeShareBrand": "Bike Salvador (Tembici)",
    "highlights": "Orla Barra–Ondina–Rio Vermelho, Dique do Tororó e Orla de Pituba/Itapuã",
    "lanesUrl": "data/cities/salvador-lanes.geojson",
    "poisUrl": "data/cities/salvador-pois.geojson"
  },
  {
    "slug": "recife",
    "name": "Recife",
    "stateCode": "PE",
    "stateName": "Pernambuco",
    "label": "Recife, PE",
    "region": "Nordeste",
    "center": [
      -34.8848,
      -8.0585
    ],
    "zoom": 12.4,
    "viewbox": [
      -35.1648,
      -7.8185,
      -34.6048,
      -8.2985
    ],
    "totalKm": 194.3,
    "cicloviaKm": 45.4,
    "ciclofaixaKm": 102.2,
    "lanesCount": 1602,
    "poisCount": 671,
    "bikeShareBrand": "Bike PE (Tembici)",
    "highlights": "Orla de Boa Viagem, Marco Zero (Recife Antigo) e Parque da Jaqueira",
    "lanesUrl": "data/cities/recife-lanes.geojson",
    "poisUrl": "data/cities/recife-pois.geojson"
  },
  {
    "slug": "natal",
    "name": "Natal",
    "stateCode": "RN",
    "stateName": "Rio Grande do Norte",
    "label": "Natal, RN",
    "region": "Nordeste",
    "center": [
      -35.2081,
      -5.8054
    ],
    "zoom": 12.5,
    "viewbox": [
      -35.4881,
      -5.5654,
      -34.9281,
      -6.0454
    ],
    "totalKm": 74.6,
    "cicloviaKm": 29.3,
    "ciclofaixaKm": 27.8,
    "lanesCount": 587,
    "poisCount": 29,
    "bikeShareBrand": "Ciclovias Natal",
    "highlights": "Orla de Ponta Negra, Via Costeira, Parque das Dunas e Campus UFRN",
    "lanesUrl": "data/cities/natal-lanes.geojson",
    "poisUrl": "data/cities/natal-pois.geojson"
  },
  {
    "slug": "joao-pessoa",
    "name": "João Pessoa",
    "stateCode": "PB",
    "stateName": "Paraíba",
    "label": "João Pessoa, PB",
    "region": "Nordeste",
    "center": [
      -34.845,
      -7.1195
    ],
    "zoom": 12.6,
    "viewbox": [
      -35.125,
      -6.8795,
      -34.565,
      -7.3595
    ],
    "totalKm": 102.4,
    "cicloviaKm": 31.3,
    "ciclofaixaKm": 50.1,
    "lanesCount": 469,
    "poisCount": 14,
    "bikeShareBrand": "Ciclovias Jampa",
    "highlights": "Orla de Tambaú e Cabo Branco, Estação Cabo Branco e Parque Solon de Lucena",
    "lanesUrl": "data/cities/joao-pessoa-lanes.geojson",
    "poisUrl": "data/cities/joao-pessoa-pois.geojson"
  },
  {
    "slug": "maceio",
    "name": "Maceió",
    "stateCode": "AL",
    "stateName": "Alagoas",
    "label": "Maceió, AL",
    "region": "Nordeste",
    "center": [
      -35.7189,
      -9.6658
    ],
    "zoom": 12.6,
    "viewbox": [
      -35.9989,
      -9.4258,
      -35.4389,
      -9.9058
    ],
    "totalKm": 101.4,
    "cicloviaKm": 74.1,
    "ciclofaixaKm": 26.1,
    "lanesCount": 341,
    "poisCount": 3,
    "bikeShareBrand": "Ciclovias Maceió",
    "highlights": "Orla de Pajuçara, Ponta Verde e Jatiúca, e Ciclovia Fernandes Lima",
    "lanesUrl": "data/cities/maceio-lanes.geojson",
    "poisUrl": "data/cities/maceio-pois.geojson"
  },
  {
    "slug": "aracaju",
    "name": "Aracaju",
    "stateCode": "SE",
    "stateName": "Sergipe",
    "label": "Aracaju, SE",
    "region": "Nordeste",
    "center": [
      -37.0574,
      -10.9472
    ],
    "zoom": 12.6,
    "viewbox": [
      -37.3374,
      -10.7072,
      -36.7774,
      -11.1872
    ],
    "totalKm": 103.5,
    "cicloviaKm": 92,
    "ciclofaixaKm": 10,
    "lanesCount": 358,
    "poisCount": 39,
    "bikeShareBrand": "CajuBike",
    "highlights": "Orla de Atalaia, Parque da Sementeira e Calçadão 13 de Julho",
    "lanesUrl": "data/cities/aracaju-lanes.geojson",
    "poisUrl": "data/cities/aracaju-pois.geojson"
  },
  {
    "slug": "teresina",
    "name": "Teresina",
    "stateCode": "PI",
    "stateName": "Piauí",
    "label": "Teresina, PI",
    "region": "Nordeste",
    "center": [
      -42.8019,
      -5.0892
    ],
    "zoom": 12.6,
    "viewbox": [
      -43.0819,
      -4.8492,
      -42.5219,
      -5.3292
    ],
    "totalKm": 85.8,
    "cicloviaKm": 45.3,
    "ciclofaixaKm": 36.6,
    "lanesCount": 457,
    "poisCount": 8,
    "bikeShareBrand": "Ciclovias Teresina",
    "highlights": "Ponte Estaiada, Parque Potycabana, Av. Raul Lopes e Encontro dos Rios",
    "lanesUrl": "data/cities/teresina-lanes.geojson",
    "poisUrl": "data/cities/teresina-pois.geojson"
  },
  {
    "slug": "sao-luis",
    "name": "São Luís",
    "stateCode": "MA",
    "stateName": "Maranhão",
    "label": "São Luís, MA",
    "region": "Nordeste",
    "center": [
      -44.2825,
      -2.5184
    ],
    "zoom": 12.5,
    "viewbox": [
      -44.5625,
      -2.2784,
      -44.0025,
      -2.7584
    ],
    "totalKm": 46.6,
    "cicloviaKm": 28.8,
    "ciclofaixaKm": 3.8,
    "lanesCount": 796,
    "poisCount": 3,
    "bikeShareBrand": "Ciclovias Ilha do Amor",
    "highlights": "Avenida Litorânea, Espigão Costeiro, Lagoa da Jansen e Centro Histórico",
    "lanesUrl": "data/cities/sao-luis-lanes.geojson",
    "poisUrl": "data/cities/sao-luis-pois.geojson"
  },
  {
    "slug": "belem",
    "name": "Belém",
    "stateCode": "PA",
    "stateName": "Pará",
    "label": "Belém, PA",
    "region": "Norte",
    "center": [
      -48.4898,
      -1.4558
    ],
    "zoom": 12.6,
    "viewbox": [
      -48.7698,
      -1.2158,
      -48.2098,
      -1.6958
    ],
    "totalKm": 177,
    "cicloviaKm": 51.4,
    "ciclofaixaKm": 120.2,
    "lanesCount": 1003,
    "poisCount": 45,
    "bikeShareBrand": "Bike Belém",
    "highlights": "Estação das Docas, Ver-o-Peso, Av. Duque de Caxias e Parque Estadual do Utinga",
    "lanesUrl": "data/cities/belem-lanes.geojson",
    "poisUrl": "data/cities/belem-pois.geojson"
  },
  {
    "slug": "manaus",
    "name": "Manaus",
    "stateCode": "AM",
    "stateName": "Amazonas",
    "label": "Manaus, AM",
    "region": "Norte",
    "center": [
      -60.0217,
      -3.119
    ],
    "zoom": 12.3,
    "viewbox": [
      -60.3017,
      -2.879,
      -59.7417,
      -3.359
    ],
    "totalKm": 18.2,
    "cicloviaKm": 12.1,
    "ciclofaixaKm": 6,
    "lanesCount": 356,
    "poisCount": 6,
    "bikeShareBrand": "Ciclovias Manaus",
    "highlights": "Orla da Praia da Ponta Negra, Teatro Amazonas e Passeio do Mindu",
    "lanesUrl": "data/cities/manaus-lanes.geojson",
    "poisUrl": "data/cities/manaus-pois.geojson"
  },
  {
    "slug": "palmas",
    "name": "Palmas",
    "stateCode": "TO",
    "stateName": "Tocantins",
    "label": "Palmas, TO",
    "region": "Norte",
    "center": [
      -48.3336,
      -10.184
    ],
    "zoom": 12.6,
    "viewbox": [
      -48.6136,
      -9.944,
      -48.0536,
      -10.424
    ],
    "totalKm": 60.9,
    "cicloviaKm": 60.1,
    "ciclofaixaKm": 0,
    "lanesCount": 192,
    "poisCount": 1,
    "bikeShareBrand": "Ciclovias Palmas",
    "highlights": "Praça dos Girassóis, Orla da Praia da Graciosa e Parque Cesamar",
    "lanesUrl": "data/cities/palmas-lanes.geojson",
    "poisUrl": "data/cities/palmas-pois.geojson"
  },
  {
    "slug": "rio-branco",
    "name": "Rio Branco",
    "stateCode": "AC",
    "stateName": "Acre",
    "label": "Rio Branco, AC",
    "region": "Norte",
    "center": [
      -67.8105,
      -9.9747
    ],
    "zoom": 12.8,
    "viewbox": [
      -68.0905,
      -9.7347,
      -67.5305,
      -10.2147
    ],
    "totalKm": 30.3,
    "cicloviaKm": 21.9,
    "ciclofaixaKm": 5,
    "lanesCount": 247,
    "poisCount": 3,
    "bikeShareBrand": "Ciclovias Rio Branco",
    "highlights": "Passarela Joaquim Macedo, Gameleira, Parque da Maternidade e Horto Florestal",
    "lanesUrl": "data/cities/rio-branco-lanes.geojson",
    "poisUrl": "data/cities/rio-branco-pois.geojson"
  },
  {
    "slug": "porto-velho",
    "name": "Porto Velho",
    "stateCode": "RO",
    "stateName": "Rondônia",
    "label": "Porto Velho, RO",
    "region": "Norte",
    "center": [
      -63.8999,
      -8.7608
    ],
    "zoom": 12.7,
    "viewbox": [
      -64.1799,
      -8.5208,
      -63.6199,
      -9.0008
    ],
    "totalKm": 16,
    "cicloviaKm": 16,
    "ciclofaixaKm": 0,
    "lanesCount": 41,
    "poisCount": 3,
    "bikeShareBrand": "Ciclovias Madeira",
    "highlights": "Espaço Alternativo, Estrada de Ferro Madeira-Mamoré e Parque da Cidade",
    "lanesUrl": "data/cities/porto-velho-lanes.geojson",
    "poisUrl": "data/cities/porto-velho-pois.geojson"
  },
  {
    "slug": "boa-vista",
    "name": "Boa Vista",
    "stateCode": "RR",
    "stateName": "Roraima",
    "label": "Boa Vista, RR",
    "region": "Norte",
    "center": [
      -60.6758,
      2.8235
    ],
    "zoom": 12.8,
    "viewbox": [
      -60.9558,
      3.0635,
      -60.3958,
      2.5835
    ],
    "totalKm": 41.6,
    "cicloviaKm": 41.4,
    "ciclofaixaKm": 0.2,
    "lanesCount": 179,
    "poisCount": 8,
    "bikeShareBrand": "Ciclovias Boa Vista",
    "highlights": "Orla Taumanan (Rio Branco), Praça das Águas e Parque Anauá",
    "lanesUrl": "data/cities/boa-vista-lanes.geojson",
    "poisUrl": "data/cities/boa-vista-pois.geojson"
  },
  {
    "slug": "macapa",
    "name": "Macapá",
    "stateCode": "AP",
    "stateName": "Amapá",
    "label": "Macapá, AP",
    "region": "Norte",
    "center": [
      -51.0694,
      0.0349
    ],
    "zoom": 12.8,
    "viewbox": [
      -51.3494,
      0.2749,
      -50.7894,
      -0.2051
    ],
    "totalKm": 15.7,
    "cicloviaKm": 14.9,
    "ciclofaixaKm": 0.3,
    "lanesCount": 58,
    "poisCount": 13,
    "bikeShareBrand": "Ciclovias Meio do Mundo",
    "highlights": "Orla do Rio Amazonas, Fortaleza de São José e Marco Zero do Equador",
    "lanesUrl": "data/cities/macapa-lanes.geojson",
    "poisUrl": "data/cities/macapa-pois.geojson"
  }
];

export const NATIONAL_CURATED_ROUTES: SavedRoute[] = [
  {
    "id": "curated-goiania-flamboyant-vaca-brava",
    "name": "Parque Flamboyant → Parque Vaca Brava",
    "description": "Conexão arborizada entre os dois parques mais famosos de Goiânia pelos setores Jardim Goiás e Bueno.",
    "tag": "Parques Urbanos • GO",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Goiânia, GO",
    "profile": "safe",
    "coords": [
      [
        -49.23834,
        -16.70259,
        800
      ],
      [
        -49.23869,
        -16.7031,
        801.8
      ],
      [
        -49.23904,
        -16.7033,
        802
      ],
      [
        -49.2392,
        -16.70267,
        801.8
      ],
      [
        -49.23969,
        -16.70222,
        800.3
      ],
      [
        -49.23954,
        -16.70079,
        796.3
      ],
      [
        -49.23983,
        -16.6999,
        791.3
      ],
      [
        -49.24202,
        -16.70069,
        793
      ],
      [
        -49.24285,
        -16.70096,
        786
      ],
      [
        -49.24396,
        -16.7015,
        778.8
      ],
      [
        -49.24424,
        -16.70168,
        778.3
      ],
      [
        -49.24459,
        -16.70186,
        779.8
      ],
      [
        -49.24534,
        -16.70235,
        784.8
      ],
      [
        -49.24724,
        -16.70201,
        791.3
      ],
      [
        -49.2508,
        -16.7052,
        806.8
      ],
      [
        -49.25356,
        -16.70728,
        815.8
      ],
      [
        -49.25436,
        -16.70694,
        811.8
      ],
      [
        -49.25567,
        -16.70793,
        814
      ],
      [
        -49.2576,
        -16.7097,
        824
      ],
      [
        -49.25892,
        -16.70986,
        824.8
      ],
      [
        -49.26045,
        -16.70808,
        820.3
      ],
      [
        -49.26156,
        -16.70625,
        827
      ],
      [
        -49.26411,
        -16.70631,
        832.3
      ],
      [
        -49.26611,
        -16.70792,
        823.5
      ],
      [
        -49.26936,
        -16.70938,
        806.8
      ],
      [
        -49.27063,
        -16.71132,
        815.8
      ],
      [
        -49.27133,
        -16.71004,
        802
      ],
      [
        -49.27153,
        -16.7093,
        799.5
      ]
    ],
    "waypoints": [
      [
        -49.2383,
        -16.7028
      ],
      [
        -49.2711,
        -16.7091
      ]
    ],
    "distanceKm": 4.9,
    "ascentM": 75,
    "descentM": 76,
    "safetyScore": 88,
    "originName": "Parque Flamboyant (Jardim Goiás)",
    "destName": "Parque Vaca Brava (Setor Bueno)"
  },
  {
    "id": "curated-goiania-civica-lago-rosas",
    "name": "Praça Cívica → Parque Lago das Rosas",
    "description": "Eixo histórico Art Déco do Centro de Goiânia até a ciclovia do Lago das Rosas no Setor Oeste.",
    "tag": "Centro Art Déco • GO",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Goiânia, GO",
    "profile": "safe",
    "coords": [
      [
        -49.25739,
        -16.67985,
        771
      ],
      [
        -49.2575,
        -16.68,
        772.8
      ],
      [
        -49.25816,
        -16.68019,
        770.5
      ],
      [
        -49.25906,
        -16.67938,
        770.3
      ],
      [
        -49.25922,
        -16.67802,
        769.8
      ],
      [
        -49.25908,
        -16.67785,
        768.8
      ],
      [
        -49.25971,
        -16.67583,
        757.5
      ],
      [
        -49.25985,
        -16.67539,
        756.8
      ],
      [
        -49.26124,
        -16.6745,
        756.5
      ],
      [
        -49.26252,
        -16.67492,
        754
      ],
      [
        -49.26357,
        -16.6752,
        753.8
      ],
      [
        -49.26554,
        -16.67578,
        753.5
      ],
      [
        -49.26636,
        -16.67601,
        752
      ],
      [
        -49.2673,
        -16.6763,
        750.3
      ],
      [
        -49.26841,
        -16.67518,
        745.8
      ],
      [
        -49.26926,
        -16.67542,
        746
      ],
      [
        -49.27146,
        -16.67605,
        745.5
      ],
      [
        -49.27331,
        -16.67661,
        740.8
      ],
      [
        -49.27348,
        -16.67661,
        739.8
      ],
      [
        -49.27371,
        -16.67643,
        738
      ],
      [
        -49.27454,
        -16.67669,
        734
      ],
      [
        -49.27479,
        -16.67682,
        733.5
      ],
      [
        -49.27541,
        -16.67701,
        733
      ],
      [
        -49.27585,
        -16.67707,
        733
      ],
      [
        -49.27622,
        -16.67573,
        730.8
      ],
      [
        -49.27656,
        -16.67534,
        731.5
      ],
      [
        -49.27679,
        -16.67492,
        731
      ],
      [
        -49.2775,
        -16.67429,
        737.8
      ]
    ],
    "waypoints": [
      [
        -49.2575,
        -16.6798
      ],
      [
        -49.2775,
        -16.6742
      ]
    ],
    "distanceKm": 2.9,
    "ascentM": 10,
    "descentM": 43,
    "safetyScore": 86,
    "originName": "Praça Cívica (Centro)",
    "destName": "Parque Lago das Rosas (Setor Oeste)"
  },
  {
    "id": "curated-goiania-areiao-universitario",
    "name": "Parque Areião → Praça Universitária",
    "description": "Rota sombreada saindo da pista do Parque Areião no Setor Marista até o corredor cultural da Praça Universitária.",
    "tag": "Corredor Verde • GO",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Moderado",
    "city": "Goiânia, GO",
    "profile": "safe",
    "coords": [
      [
        -49.257,
        -16.70377,
        819
      ],
      [
        -49.25629,
        -16.70421,
        814.5
      ],
      [
        -49.25404,
        -16.70348,
        803
      ],
      [
        -49.25283,
        -16.70268,
        799.8
      ],
      [
        -49.25267,
        -16.70139,
        803
      ],
      [
        -49.25256,
        -16.69957,
        807
      ],
      [
        -49.25217,
        -16.69787,
        807
      ],
      [
        -49.25201,
        -16.69736,
        807.3
      ],
      [
        -49.25184,
        -16.6955,
        813.3
      ],
      [
        -49.25093,
        -16.69524,
        807.8
      ],
      [
        -49.25004,
        -16.69398,
        805.3
      ],
      [
        -49.24986,
        -16.69245,
        802.8
      ],
      [
        -49.24961,
        -16.69169,
        798.3
      ],
      [
        -49.25064,
        -16.68843,
        792
      ],
      [
        -49.25105,
        -16.68732,
        789.3
      ],
      [
        -49.24985,
        -16.68612,
        779.3
      ],
      [
        -49.25037,
        -16.68476,
        774.3
      ],
      [
        -49.24964,
        -16.68234,
        762.5
      ],
      [
        -49.24895,
        -16.68113,
        755.5
      ],
      [
        -49.24976,
        -16.67959,
        753.3
      ],
      [
        -49.25007,
        -16.67879,
        753
      ],
      [
        -49.24898,
        -16.67846,
        750.8
      ],
      [
        -49.24688,
        -16.67785,
        764.3
      ],
      [
        -49.24549,
        -16.67728,
        774.3
      ],
      [
        -49.24532,
        -16.67685,
        775
      ],
      [
        -49.2448,
        -16.67681,
        778.5
      ],
      [
        -49.24373,
        -16.67647,
        785.3
      ],
      [
        -49.24349,
        -16.67682,
        786.8
      ]
    ],
    "waypoints": [
      [
        -49.2571,
        -16.7039
      ],
      [
        -49.2435,
        -16.6768
      ]
    ],
    "distanceKm": 4.2,
    "ascentM": 50,
    "descentM": 82,
    "safetyScore": 84,
    "originName": "Parque Areião (Setor Marista)",
    "destName": "Praça Universitária (Setor Leste)"
  },
  {
    "id": "curated-cg-afonso-pena-parque-nacoes",
    "name": "Praça Ary Coelho → Parque das Nações Indígenas",
    "description": "Ciclovia central da Av. Afonso Pena ligando o coração de Campo Grande ao Parque das Nações Indígenas.",
    "tag": "Ciclovia Afonso Pena • MS",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Campo Grande, MS",
    "profile": "safe",
    "coords": [
      [
        -54.61645,
        -20.46253,
        547.8
      ],
      [
        -54.6122,
        -20.46182,
        553.3
      ],
      [
        -54.60697,
        -20.46095,
        574.8
      ],
      [
        -54.6049,
        -20.46061,
        577.8
      ],
      [
        -54.60327,
        -20.46034,
        582
      ],
      [
        -54.60069,
        -20.46122,
        579.3
      ],
      [
        -54.60004,
        -20.4612,
        580.5
      ],
      [
        -54.59937,
        -20.46105,
        580.8
      ],
      [
        -54.598,
        -20.46086,
        582.3
      ],
      [
        -54.59653,
        -20.46056,
        584.8
      ],
      [
        -54.59541,
        -20.46045,
        585
      ],
      [
        -54.59303,
        -20.46006,
        575.3
      ],
      [
        -54.58911,
        -20.45942,
        568.5
      ],
      [
        -54.58757,
        -20.45904,
        567
      ],
      [
        -54.58668,
        -20.45901,
        568
      ],
      [
        -54.58549,
        -20.45866,
        568.3
      ],
      [
        -54.5848,
        -20.45855,
        566.5
      ],
      [
        -54.58354,
        -20.45729,
        565.5
      ],
      [
        -54.58362,
        -20.4559,
        566
      ],
      [
        -54.58154,
        -20.45654,
        572.8
      ],
      [
        -54.58092,
        -20.45635,
        577
      ],
      [
        -54.58012,
        -20.45617,
        578.8
      ],
      [
        -54.57956,
        -20.45544,
        568
      ],
      [
        -54.57882,
        -20.45561,
        572.8
      ],
      [
        -54.57831,
        -20.45504,
        570.8
      ],
      [
        -54.57809,
        -20.45436,
        576
      ],
      [
        -54.57815,
        -20.45374,
        583.3
      ],
      [
        -54.5786,
        -20.45341,
        586.3
      ]
    ],
    "waypoints": [
      [
        -54.6164,
        -20.4628
      ],
      [
        -54.5786,
        -20.4534
      ]
    ],
    "distanceKm": 4.6,
    "ascentM": 75,
    "descentM": 36,
    "safetyScore": 93,
    "originName": "Praça Ary Coelho (Centro)",
    "destName": "Parque das Nações Indígenas (Altos da Afonso Pena)"
  },
  {
    "id": "curated-cg-orla-morena",
    "name": "Ciclovia Orla Morena (Cabreúva → Vila Planalto)",
    "description": "Parque linear construído sobre a antiga ferrovia com pista exclusiva para ciclistas e iluminação LED.",
    "tag": "Parque Linear • MS",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Campo Grande, MS",
    "profile": "safe",
    "coords": [
      [
        -54.62923,
        -20.46311,
        546.8
      ],
      [
        -54.62945,
        -20.46193,
        548
      ],
      [
        -54.62974,
        -20.46054,
        551.8
      ],
      [
        -54.62987,
        -20.4604,
        552.5
      ],
      [
        -54.63001,
        -20.46031,
        553.3
      ],
      [
        -54.63005,
        -20.46018,
        553.8
      ],
      [
        -54.63094,
        -20.45935,
        562.8
      ],
      [
        -54.63144,
        -20.45837,
        572.3
      ],
      [
        -54.63129,
        -20.45605,
        578
      ],
      [
        -54.63112,
        -20.45358,
        579
      ],
      [
        -54.63096,
        -20.45189,
        577.3
      ],
      [
        -54.63126,
        -20.45155,
        576.8
      ],
      [
        -54.633,
        -20.45106,
        580.8
      ],
      [
        -54.63348,
        -20.45069,
        580.8
      ],
      [
        -54.63436,
        -20.44924,
        579.8
      ],
      [
        -54.63513,
        -20.44775,
        582.3
      ],
      [
        -54.63524,
        -20.44761,
        582.8
      ],
      [
        -54.63514,
        -20.44719,
        583.8
      ],
      [
        -54.63524,
        -20.44686,
        583.8
      ],
      [
        -54.63523,
        -20.44661,
        583.8
      ],
      [
        -54.6354,
        -20.44639,
        582.8
      ],
      [
        -54.63613,
        -20.44588,
        583.3
      ],
      [
        -54.63598,
        -20.44547,
        584
      ],
      [
        -54.6362,
        -20.4446,
        586
      ],
      [
        -54.63634,
        -20.44419,
        587
      ],
      [
        -54.63664,
        -20.44389,
        588.3
      ],
      [
        -54.63525,
        -20.44394,
        582
      ],
      [
        -54.6348,
        -20.44389,
        578.5
      ]
    ],
    "waypoints": [
      [
        -54.6292,
        -20.4631
      ],
      [
        -54.6348,
        -20.4435
      ]
    ],
    "distanceKm": 2.7,
    "ascentM": 46,
    "descentM": 14,
    "safetyScore": 95,
    "originName": "Orla Morena (Bairro Cabreúva)",
    "destName": "Mirante Orla Morena (Vila Planalto)"
  },
  {
    "id": "curated-cg-lago-amor-ufms",
    "name": "Lago do Amor → Cidade Universitária UFMS",
    "description": "Trajeto escênico margeando o Lago do Amor e o campus arborizado da UFMS.",
    "tag": "Lago & Campus • MS",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Campo Grande, MS",
    "profile": "safe",
    "coords": [
      [
        -54.61427,
        -20.50211,
        542
      ],
      [
        -54.61416,
        -20.50221,
        543.5
      ],
      [
        -54.61406,
        -20.50182,
        541.8
      ],
      [
        -54.61347,
        -20.50094,
        543.8
      ],
      [
        -54.61315,
        -20.50033,
        545.8
      ],
      [
        -54.61269,
        -20.49908,
        546
      ],
      [
        -54.61248,
        -20.49857,
        544.5
      ],
      [
        -54.61243,
        -20.49851,
        544.5
      ],
      [
        -54.61245,
        -20.4984,
        544.3
      ],
      [
        -54.61253,
        -20.49825,
        544
      ],
      [
        -54.61276,
        -20.49684,
        550
      ],
      [
        -54.61285,
        -20.49675,
        551
      ],
      [
        -54.61301,
        -20.49678,
        551.8
      ],
      [
        -54.6139,
        -20.49688,
        551.8
      ],
      [
        -54.61434,
        -20.49694,
        550.5
      ],
      [
        -54.6144,
        -20.49689,
        550.5
      ],
      [
        -54.6147,
        -20.49695,
        550
      ],
      [
        -54.61504,
        -20.49712,
        548.8
      ],
      [
        -54.61505,
        -20.49758,
        547.3
      ],
      [
        -54.61512,
        -20.49784,
        547.8
      ],
      [
        -54.61485,
        -20.49801,
        548.3
      ],
      [
        -54.61498,
        -20.49838,
        548.8
      ],
      [
        -54.61558,
        -20.49813,
        548.3
      ],
      [
        -54.61616,
        -20.49801,
        548
      ],
      [
        -54.61654,
        -20.49803,
        547.8
      ],
      [
        -54.61942,
        -20.49837,
        547.8
      ],
      [
        -54.61967,
        -20.49645,
        547
      ],
      [
        -54.61976,
        -20.49585,
        547
      ]
    ],
    "waypoints": [
      [
        -54.6143,
        -20.5021
      ],
      [
        -54.6194,
        -20.4958
      ]
    ],
    "distanceKm": 1.8,
    "ascentM": 15,
    "descentM": 10,
    "safetyScore": 91,
    "originName": "Lago do Amor (Vila Ipiranga)",
    "destName": "Reitoria UFMS (Cidade Universitária)"
  },
  {
    "id": "curated-cuiaba-mae-bonifacia-aguas",
    "name": "Parque Mãe Bonifácia → Parque das Águas",
    "description": "Rota ligando o pulmão verde do Parque Mãe Bonifácia à ciclovia iluminada do Parque das Águas.",
    "tag": "Parques de Cuiabá • MT",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Cuiabá, MT",
    "profile": "safe",
    "coords": [
      [
        -56.08836,
        -15.57786,
        200.5
      ],
      [
        -56.08788,
        -15.5766,
        199.3
      ],
      [
        -56.0872,
        -15.57714,
        199.8
      ],
      [
        -56.08695,
        -15.57627,
        199.5
      ],
      [
        -56.08655,
        -15.57595,
        197.5
      ],
      [
        -56.08543,
        -15.57672,
        194
      ],
      [
        -56.08447,
        -15.57716,
        202
      ],
      [
        -56.08239,
        -15.5771,
        208.8
      ],
      [
        -56.08122,
        -15.57858,
        207.3
      ],
      [
        -56.07893,
        -15.58006,
        228.5
      ],
      [
        -56.07752,
        -15.57926,
        230.3
      ],
      [
        -56.07675,
        -15.57813,
        228.5
      ],
      [
        -56.076,
        -15.57837,
        229.5
      ],
      [
        -56.07525,
        -15.57742,
        229.5
      ],
      [
        -56.07507,
        -15.57722,
        231.5
      ],
      [
        -56.07411,
        -15.57607,
        226.5
      ],
      [
        -56.07395,
        -15.57585,
        226.3
      ],
      [
        -56.07382,
        -15.57568,
        225.8
      ],
      [
        -56.07366,
        -15.57515,
        224.8
      ],
      [
        -56.07339,
        -15.57492,
        224
      ],
      [
        -56.07302,
        -15.57445,
        223
      ],
      [
        -56.07276,
        -15.57428,
        222.5
      ],
      [
        -56.07213,
        -15.57327,
        222
      ],
      [
        -56.07173,
        -15.57263,
        220.3
      ],
      [
        -56.07013,
        -15.5706,
        216
      ],
      [
        -56.07038,
        -15.5699,
        224
      ],
      [
        -56.07128,
        -15.56921,
        237
      ],
      [
        -56.07126,
        -15.56827,
        239.3
      ]
    ],
    "waypoints": [
      [
        -56.0884,
        -15.5778
      ],
      [
        -56.0715,
        -15.5681
      ]
    ],
    "distanceKm": 3.2,
    "ascentM": 65,
    "descentM": 26,
    "safetyScore": 89,
    "originName": "Parque Mãe Bonifácia (Duque de Caxias)",
    "destName": "Parque das Águas (Centro Político)"
  },
  {
    "id": "curated-cuiaba-orla-porto-centro",
    "name": "Orla do Porto → Praça Alencastro",
    "description": "Passeio revitalizado às margens do Rio Cuiabá conectando a Orla do Porto ao Centro Histórico.",
    "tag": "Orla Rio Cuiabá • MT",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Cuiabá, MT",
    "profile": "safe",
    "coords": [
      [
        -56.10756,
        -15.61109,
        159.8
      ],
      [
        -56.10641,
        -15.60811,
        176.3
      ],
      [
        -56.10539,
        -15.60705,
        182
      ],
      [
        -56.10487,
        -15.60652,
        181.5
      ],
      [
        -56.10577,
        -15.60575,
        181
      ],
      [
        -56.10829,
        -15.60355,
        175.8
      ],
      [
        -56.10754,
        -15.60221,
        173.5
      ],
      [
        -56.10686,
        -15.60139,
        179.3
      ],
      [
        -56.10612,
        -15.60055,
        181.3
      ],
      [
        -56.10451,
        -15.59891,
        189.5
      ],
      [
        -56.10356,
        -15.59785,
        191.5
      ],
      [
        -56.10268,
        -15.59692,
        195.3
      ],
      [
        -56.10214,
        -15.59727,
        194.8
      ],
      [
        -56.10136,
        -15.59677,
        186.8
      ],
      [
        -56.10102,
        -15.59715,
        185.8
      ],
      [
        -56.10105,
        -15.59722,
        186.5
      ],
      [
        -56.09962,
        -15.59765,
        179.3
      ],
      [
        -56.09959,
        -15.59763,
        179
      ],
      [
        -56.09939,
        -15.59757,
        178
      ],
      [
        -56.09929,
        -15.59753,
        177.5
      ],
      [
        -56.09788,
        -15.59748,
        183.3
      ],
      [
        -56.0964,
        -15.59848,
        182.5
      ],
      [
        -56.09599,
        -15.59792,
        184
      ],
      [
        -56.09605,
        -15.59791,
        184
      ],
      [
        -56.0961,
        -15.59793,
        184
      ],
      [
        -56.0964,
        -15.59771,
        184.5
      ],
      [
        -56.09674,
        -15.5981,
        183.3
      ],
      [
        -56.09668,
        -15.59817,
        183.3
      ]
    ],
    "waypoints": [
      [
        -56.1079,
        -15.6114
      ],
      [
        -56.0967,
        -15.5982
      ]
    ],
    "distanceKm": 3,
    "ascentM": 53,
    "descentM": 29,
    "safetyScore": 87,
    "originName": "Orla do Porto (Rio Cuiabá)",
    "destName": "Praça Alencastro (Centro Histórico)"
  },
  {
    "id": "curated-cuiaba-ufmt-tia-nair",
    "name": "Campus UFMT → Parque Tia Nair",
    "description": "Corredor universitário e gastronômico da zona leste de Cuiabá até o mirante do Parque Tia Nair.",
    "tag": "Zona Leste • MT",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Moderado",
    "city": "Cuiabá, MT",
    "profile": "safe",
    "coords": [
      [
        -56.06289,
        -15.60859,
        182
      ],
      [
        -56.06256,
        -15.60834,
        182.8
      ],
      [
        -56.06282,
        -15.60806,
        181
      ],
      [
        -56.0628,
        -15.60799,
        180.8
      ],
      [
        -56.06135,
        -15.60769,
        182
      ],
      [
        -56.06053,
        -15.60821,
        185
      ],
      [
        -56.06003,
        -15.60786,
        186.3
      ],
      [
        -56.05971,
        -15.60752,
        187.3
      ],
      [
        -56.05951,
        -15.60754,
        187.3
      ],
      [
        -56.05937,
        -15.60736,
        187
      ],
      [
        -56.05925,
        -15.60738,
        187.3
      ],
      [
        -56.05902,
        -15.60757,
        187.8
      ],
      [
        -56.05777,
        -15.60826,
        183
      ],
      [
        -56.0566,
        -15.60737,
        186.5
      ],
      [
        -56.05542,
        -15.60609,
        176.8
      ],
      [
        -56.05456,
        -15.60515,
        170
      ],
      [
        -56.05405,
        -15.60462,
        171.3
      ],
      [
        -56.05375,
        -15.60438,
        174.5
      ],
      [
        -56.05316,
        -15.60451,
        177.5
      ],
      [
        -56.05249,
        -15.60301,
        184
      ],
      [
        -56.0518,
        -15.60307,
        185.5
      ],
      [
        -56.04884,
        -15.60436,
        185.3
      ],
      [
        -56.0474,
        -15.60496,
        187.8
      ],
      [
        -56.04591,
        -15.6056,
        187
      ],
      [
        -56.04539,
        -15.60569,
        188
      ],
      [
        -56.04621,
        -15.60509,
        187
      ],
      [
        -56.04573,
        -15.60403,
        190.5
      ],
      [
        -56.04678,
        -15.60215,
        187.3
      ]
    ],
    "waypoints": [
      [
        -56.0628,
        -15.6087
      ],
      [
        -56.0468,
        -15.6022
      ]
    ],
    "distanceKm": 2.9,
    "ascentM": 34,
    "descentM": 29,
    "safetyScore": 85,
    "originName": "Universidade Federal de Mato Grosso (UFMT)",
    "destName": "Parque Tia Nair (Jardim Itália)"
  },
  {
    "id": "curated-sp-paulista-ibirapuera",
    "name": "Ciclovia Av. Paulista → Parque Ibirapuera",
    "description": "A rota cicloviária mais famosa de São Paulo: canteiro central da Av. Paulista descendo até o Parque Ibirapuera.",
    "tag": "Clássico SP • 94% segura",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "São Paulo, SP",
    "profile": "safe",
    "coords": [
      [
        -46.65582,
        -23.56144,
        820.5
      ],
      [
        -46.65731,
        -23.56503,
        817.5
      ],
      [
        -46.65903,
        -23.56697,
        781.3
      ],
      [
        -46.65892,
        -23.56714,
        781
      ],
      [
        -46.65864,
        -23.56874,
        777.3
      ],
      [
        -46.6575,
        -23.57017,
        783
      ],
      [
        -46.6555,
        -23.57204,
        780.3
      ],
      [
        -46.65488,
        -23.57327,
        772.3
      ],
      [
        -46.656,
        -23.57441,
        771
      ],
      [
        -46.65497,
        -23.57537,
        769.5
      ],
      [
        -46.65564,
        -23.57612,
        766.5
      ],
      [
        -46.65724,
        -23.57752,
        755.8
      ],
      [
        -46.65886,
        -23.57836,
        756
      ],
      [
        -46.65996,
        -23.57898,
        754.8
      ],
      [
        -46.6607,
        -23.57956,
        754
      ],
      [
        -46.66116,
        -23.58022,
        756.3
      ],
      [
        -46.66101,
        -23.58045,
        755.3
      ],
      [
        -46.66175,
        -23.58087,
        771.3
      ],
      [
        -46.66246,
        -23.58195,
        757
      ],
      [
        -46.66236,
        -23.58298,
        756.3
      ],
      [
        -46.66178,
        -23.58329,
        757.3
      ],
      [
        -46.66067,
        -23.58337,
        761.3
      ],
      [
        -46.6602,
        -23.58389,
        761.8
      ],
      [
        -46.66016,
        -23.58456,
        760.3
      ],
      [
        -46.66069,
        -23.58564,
        764.5
      ],
      [
        -46.66042,
        -23.58633,
        757.5
      ],
      [
        -46.65886,
        -23.58671,
        752.5
      ],
      [
        -46.65757,
        -23.58736,
        756.8
      ]
    ],
    "waypoints": [
      [
        -46.6559,
        -23.5614
      ],
      [
        -46.6576,
        -23.5874
      ]
    ],
    "distanceKm": 3.9,
    "ascentM": 38,
    "descentM": 102,
    "safetyScore": 94,
    "originName": "MASP / Av. Paulista (Bela Vista)",
    "destName": "Parque Ibirapuera (Portão 10)"
  },
  {
    "id": "curated-sp-rio-pinheiros-vila-lobos",
    "name": "Ciclovia Rio Pinheiros (Vila Olímpia → Villa-Lobos)",
    "description": "Pista expressa 100% segregada às margens do Rio Pinheiros, ideal para treinos, e-bikes e deslocamento rápido.",
    "tag": "100% Segregada • SP",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "São Paulo, SP",
    "profile": "safe",
    "coords": [
      [
        -46.69117,
        -23.59469,
        729.8
      ],
      [
        -46.69228,
        -23.59423,
        726.5
      ],
      [
        -46.69291,
        -23.59398,
        723.3
      ],
      [
        -46.69317,
        -23.59383,
        722.8
      ],
      [
        -46.69183,
        -23.58987,
        724.3
      ],
      [
        -46.6912,
        -23.58771,
        722.5
      ],
      [
        -46.69296,
        -23.58199,
        728.5
      ],
      [
        -46.70002,
        -23.57287,
        721.3
      ],
      [
        -46.70203,
        -23.56963,
        722.8
      ],
      [
        -46.70266,
        -23.56824,
        725.8
      ],
      [
        -46.70469,
        -23.56289,
        724.8
      ],
      [
        -46.70837,
        -23.55946,
        726
      ],
      [
        -46.71167,
        -23.55793,
        724.3
      ],
      [
        -46.71103,
        -23.5573,
        726.3
      ],
      [
        -46.70938,
        -23.55461,
        726
      ],
      [
        -46.70954,
        -23.55335,
        724.8
      ],
      [
        -46.7119,
        -23.55097,
        729.3
      ],
      [
        -46.71403,
        -23.54917,
        728.8
      ],
      [
        -46.71564,
        -23.54761,
        727
      ],
      [
        -46.71675,
        -23.54876,
        728
      ],
      [
        -46.7176,
        -23.54873,
        730.8
      ],
      [
        -46.71762,
        -23.54856,
        731.5
      ],
      [
        -46.71789,
        -23.54848,
        732.8
      ],
      [
        -46.71872,
        -23.54606,
        731
      ],
      [
        -46.72018,
        -23.54549,
        732.8
      ],
      [
        -46.72056,
        -23.54684,
        732.5
      ],
      [
        -46.72102,
        -23.54634,
        732.3
      ],
      [
        -46.72154,
        -23.54674,
        732
      ]
    ],
    "waypoints": [
      [
        -46.6915,
        -23.5947
      ],
      [
        -46.7218,
        -23.5469
      ]
    ],
    "distanceKm": 7.5,
    "ascentM": 27,
    "descentM": 25,
    "safetyScore": 98,
    "originName": "Acesso Vila Olímpia (Ciclovia Rio Pinheiros)",
    "destName": "Parque Villa-Lobos (Alto de Pinheiros)"
  },
  {
    "id": "curated-sp-faria-lima-usp",
    "name": "Ciclovia Faria Lima (Pinheiros → Cidade Universitária USP)",
    "description": "Corredor financeiro e gastronômico da Av. Brigadeiro Faria Lima conectando o Largo da Batata à USP.",
    "tag": "Eixo Faria Lima • SP",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "São Paulo, SP",
    "profile": "safe",
    "coords": [
      [
        -46.69402,
        -23.56709,
        740.3
      ],
      [
        -46.69426,
        -23.5667,
        739
      ],
      [
        -46.69457,
        -23.56533,
        739.5
      ],
      [
        -46.69436,
        -23.56303,
        744.5
      ],
      [
        -46.69527,
        -23.56093,
        740.8
      ],
      [
        -46.69881,
        -23.55859,
        732.3
      ],
      [
        -46.70121,
        -23.55746,
        732.8
      ],
      [
        -46.70326,
        -23.55651,
        733.5
      ],
      [
        -46.70525,
        -23.55555,
        731.5
      ],
      [
        -46.70766,
        -23.5568,
        730.3
      ],
      [
        -46.71014,
        -23.55622,
        728
      ],
      [
        -46.71052,
        -23.55625,
        727.8
      ],
      [
        -46.71212,
        -23.55941,
        725.8
      ],
      [
        -46.71255,
        -23.55981,
        726.3
      ],
      [
        -46.71327,
        -23.56028,
        726.3
      ],
      [
        -46.7152,
        -23.55912,
        725.3
      ],
      [
        -46.71918,
        -23.55732,
        726
      ],
      [
        -46.72136,
        -23.55639,
        725.5
      ],
      [
        -46.72372,
        -23.55518,
        728.3
      ],
      [
        -46.72513,
        -23.55434,
        726
      ],
      [
        -46.72559,
        -23.55493,
        728.8
      ],
      [
        -46.72638,
        -23.55636,
        731
      ],
      [
        -46.72718,
        -23.55774,
        728.5
      ],
      [
        -46.72817,
        -23.55947,
        727.5
      ],
      [
        -46.72934,
        -23.55927,
        729.8
      ],
      [
        -46.73012,
        -23.55964,
        733.8
      ],
      [
        -46.73063,
        -23.56053,
        733
      ],
      [
        -46.73024,
        -23.56124,
        739.3
      ]
    ],
    "waypoints": [
      [
        -46.6941,
        -23.5672
      ],
      [
        -46.7302,
        -23.5612
      ]
    ],
    "distanceKm": 5.5,
    "ascentM": 28,
    "descentM": 29,
    "safetyScore": 93,
    "originName": "Largo da Batata / Estação Faria Lima (Pinheiros)",
    "destName": "Praça do Relógio (Cidade Universitária USP)"
  },
  {
    "id": "curated-rj-copacabana-leblon",
    "name": "Orla Zona Sul: Leme & Copacabana → Ipanema & Leblon",
    "description": "Ciclovia beira-mar contínua passando pelo Forte de Copacabana, Arpoador, Praia de Ipanema e Mirante do Leblon.",
    "tag": "Cartão-Postal • RJ",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Rio de Janeiro, RJ",
    "profile": "safe",
    "coords": [
      [
        -43.16717,
        -22.9629,
        10.8
      ],
      [
        -43.16645,
        -22.96263,
        10.5
      ],
      [
        -43.1678,
        -22.96297,
        15
      ],
      [
        -43.17298,
        -22.96508,
        17
      ],
      [
        -43.17474,
        -22.96589,
        21.8
      ],
      [
        -43.17989,
        -22.96864,
        4
      ],
      [
        -43.18298,
        -22.9707,
        16
      ],
      [
        -43.18468,
        -22.97218,
        13
      ],
      [
        -43.18616,
        -22.97385,
        15.8
      ],
      [
        -43.18734,
        -22.97554,
        12.8
      ],
      [
        -43.18853,
        -22.97788,
        6.8
      ],
      [
        -43.18943,
        -22.98077,
        11.8
      ],
      [
        -43.1896,
        -22.98266,
        12.3
      ],
      [
        -43.18873,
        -22.98598,
        13
      ],
      [
        -43.18883,
        -22.98643,
        17.5
      ],
      [
        -43.19212,
        -22.98733,
        18.8
      ],
      [
        -43.19434,
        -22.98794,
        15.3
      ],
      [
        -43.19451,
        -22.98797,
        15.3
      ],
      [
        -43.19668,
        -22.98738,
        15
      ],
      [
        -43.20078,
        -22.98686,
        13.8
      ],
      [
        -43.2114,
        -22.9863,
        16.3
      ],
      [
        -43.21531,
        -22.98632,
        8.8
      ],
      [
        -43.22005,
        -22.98685,
        10.8
      ],
      [
        -43.22512,
        -22.98766,
        15.3
      ],
      [
        -43.22737,
        -22.98852,
        16.3
      ],
      [
        -43.22757,
        -22.98827,
        18.3
      ],
      [
        -43.22847,
        -22.98764,
        14.3
      ],
      [
        -43.22902,
        -22.98802,
        23.8
      ]
    ],
    "waypoints": [
      [
        -43.1669,
        -22.9634
      ],
      [
        -43.2291,
        -22.9879
      ]
    ],
    "distanceKm": 8.2,
    "ascentM": 60,
    "descentM": 47,
    "safetyScore": 97,
    "originName": "Praia do Leme / Av. Atlântica (Copacabana)",
    "destName": "Mirante do Leblon (Posto 12)"
  },
  {
    "id": "curated-rj-volta-lagoa-rodrigo-freitas",
    "name": "Circuito Lagoa Rodrigo de Freitas → Jardim Botânico",
    "description": "Percurso plano em ciclovia exclusiva ao redor da Lagoa com vista para o Cristo Redentor e chegada ao Jardim Botânico.",
    "tag": "Volta da Lagoa • RJ",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Rio de Janeiro, RJ",
    "profile": "safe",
    "coords": [
      [
        -43.21662,
        -22.9674,
        11
      ],
      [
        -43.21673,
        -22.96738,
        11.5
      ],
      [
        -43.217,
        -22.96721,
        13
      ],
      [
        -43.21665,
        -22.96672,
        13.5
      ],
      [
        -43.21661,
        -22.96643,
        13.5
      ],
      [
        -43.2168,
        -22.96644,
        14
      ],
      [
        -43.21751,
        -22.96607,
        14.5
      ],
      [
        -43.21762,
        -22.96601,
        13.8
      ],
      [
        -43.21837,
        -22.96548,
        12
      ],
      [
        -43.21845,
        -22.96543,
        12.5
      ],
      [
        -43.2188,
        -22.96526,
        14.3
      ],
      [
        -43.22061,
        -22.96599,
        21.3
      ],
      [
        -43.22184,
        -22.96546,
        23.5
      ],
      [
        -43.2221,
        -22.96534,
        24.3
      ],
      [
        -43.22223,
        -22.96536,
        24
      ],
      [
        -43.22369,
        -22.96582,
        14.5
      ],
      [
        -43.22737,
        -22.96543,
        17.5
      ],
      [
        -43.22811,
        -22.96543,
        16.3
      ],
      [
        -43.22824,
        -22.96548,
        16
      ],
      [
        -43.22795,
        -22.96606,
        17.5
      ],
      [
        -43.22754,
        -22.96686,
        22.3
      ],
      [
        -43.22733,
        -22.96727,
        21.3
      ],
      [
        -43.22726,
        -22.96739,
        20.8
      ],
      [
        -43.22665,
        -22.96721,
        18.3
      ],
      [
        -43.22586,
        -22.96753,
        19.3
      ],
      [
        -43.22548,
        -22.96772,
        19
      ],
      [
        -43.22526,
        -22.96796,
        18.5
      ],
      [
        -43.22489,
        -22.96784,
        16.3
      ]
    ],
    "waypoints": [
      [
        -43.2165,
        -22.9672
      ],
      [
        -43.2248,
        -22.9679
      ]
    ],
    "distanceKm": 1.9,
    "ascentM": 26,
    "descentM": 21,
    "safetyScore": 96,
    "originName": "Parque dos Patins (Lagoa Rodrigo de Freitas)",
    "destName": "Jardim Botânico do Rio de Janeiro"
  },
  {
    "id": "curated-rj-aterro-flamengo-marina",
    "name": "Aterro do Flamengo (Enseada de Botafogo → Museu do Amanhã)",
    "description": "Ciclovia panorâmica pela Baía de Guanabara, Parque do Flamengo, Marina da Glória e Boulevard Olímpico.",
    "tag": "Baía de Guanabara • RJ",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Rio de Janeiro, RJ",
    "profile": "safe",
    "coords": [
      [
        -43.17978,
        -22.94879,
        9.3
      ],
      [
        -43.18142,
        -22.94749,
        9.3
      ],
      [
        -43.17967,
        -22.94297,
        17.3
      ],
      [
        -43.17565,
        -22.94412,
        9.5
      ],
      [
        -43.17087,
        -22.94143,
        10
      ],
      [
        -43.16996,
        -22.93951,
        10.3
      ],
      [
        -43.17092,
        -22.93695,
        9
      ],
      [
        -43.1721,
        -22.93516,
        4.5
      ],
      [
        -43.17234,
        -22.93182,
        6.8
      ],
      [
        -43.17266,
        -22.93041,
        8
      ],
      [
        -43.17076,
        -22.92651,
        6.8
      ],
      [
        -43.17096,
        -22.9251,
        7.3
      ],
      [
        -43.16986,
        -22.92414,
        7.8
      ],
      [
        -43.1697,
        -22.92208,
        8.5
      ],
      [
        -43.17103,
        -22.921,
        5.8
      ],
      [
        -43.17281,
        -22.9194,
        5.8
      ],
      [
        -43.17302,
        -22.91766,
        6.5
      ],
      [
        -43.17197,
        -22.91461,
        7.5
      ],
      [
        -43.17125,
        -22.91347,
        8.8
      ],
      [
        -43.17212,
        -22.91247,
        16.3
      ],
      [
        -43.17288,
        -22.91171,
        33.5
      ],
      [
        -43.17226,
        -22.90971,
        17.8
      ],
      [
        -43.17326,
        -22.90648,
        37
      ],
      [
        -43.17382,
        -22.90496,
        25.8
      ],
      [
        -43.17433,
        -22.90271,
        12.5
      ],
      [
        -43.17554,
        -22.89995,
        4.5
      ],
      [
        -43.17689,
        -22.89655,
        7
      ],
      [
        -43.17942,
        -22.89513,
        9.5
      ]
    ],
    "waypoints": [
      [
        -43.1794,
        -22.9488
      ],
      [
        -43.1795,
        -22.8951
      ]
    ],
    "distanceKm": 7.5,
    "ascentM": 66,
    "descentM": 66,
    "safetyScore": 95,
    "originName": "Enseada de Botafogo (Mourisco)",
    "destName": "Praça Mauá / Museu do Amanhã (Centro)"
  },
  {
    "id": "curated-bh-volta-lagoa-pampulha",
    "name": "Orla da Lagoa da Pampulha (Igrejinha → Mineirão)",
    "description": "Ciclovia plana e contínua pelo Conjunto Moderno da Pampulha (Patrimônio UNESCO), Casa do Baile e Estádio Mineirão.",
    "tag": "Patrimônio UNESCO • MG",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Belo Horizonte, MG",
    "profile": "safe",
    "coords": [
      [
        -43.97885,
        -19.85843,
        805.8
      ],
      [
        -43.97896,
        -19.85859,
        807.8
      ],
      [
        -43.97871,
        -19.85879,
        806.8
      ],
      [
        -43.97854,
        -19.85896,
        807
      ],
      [
        -43.97817,
        -19.8594,
        807.3
      ],
      [
        -43.97707,
        -19.86064,
        805.5
      ],
      [
        -43.97664,
        -19.86121,
        804.8
      ],
      [
        -43.97601,
        -19.86268,
        807.3
      ],
      [
        -43.97611,
        -19.86284,
        809
      ],
      [
        -43.9761,
        -19.86298,
        809.5
      ],
      [
        -43.97605,
        -19.86301,
        809.3
      ],
      [
        -43.97592,
        -19.86302,
        808
      ],
      [
        -43.97548,
        -19.86313,
        807.8
      ],
      [
        -43.97517,
        -19.86311,
        808
      ],
      [
        -43.97468,
        -19.86288,
        809.5
      ],
      [
        -43.97451,
        -19.86283,
        811
      ],
      [
        -43.97433,
        -19.86291,
        813.5
      ],
      [
        -43.97386,
        -19.86413,
        823.5
      ],
      [
        -43.97347,
        -19.86408,
        828.3
      ],
      [
        -43.97225,
        -19.86375,
        840
      ],
      [
        -43.97208,
        -19.8637,
        841
      ],
      [
        -43.97124,
        -19.86343,
        848
      ],
      [
        -43.97116,
        -19.86365,
        849.3
      ],
      [
        -43.97113,
        -19.86373,
        849.8
      ],
      [
        -43.97119,
        -19.86442,
        850.3
      ],
      [
        -43.97147,
        -19.86448,
        848.3
      ],
      [
        -43.97209,
        -19.86501,
        847.3
      ],
      [
        -43.97207,
        -19.86521,
        847.8
      ]
    ],
    "waypoints": [
      [
        -43.9789,
        -19.8584
      ],
      [
        -43.9711,
        -19.8658
      ]
    ],
    "distanceKm": 1.5,
    "ascentM": 50,
    "descentM": 8,
    "safetyScore": 96,
    "originName": "Igreja São Francisco de Assis (Pampulha)",
    "destName": "Esplanada do Mineirão (Pampulha)"
  },
  {
    "id": "curated-bh-liberdade-savassi-mangabeiras",
    "name": "Circuito Praça da Liberdade → Savassi & Praça do Papa",
    "description": "Eixo cultural da Praça da Liberdade passando pelas ciclofaixas da Savassi até o mirante da Serra do Curral.",
    "tag": "Circuito Cultural • MG",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Moderado",
    "city": "Belo Horizonte, MG",
    "profile": "safe",
    "coords": [
      [
        -43.93821,
        -19.9321,
        903.5
      ],
      [
        -43.93785,
        -19.93299,
        901.3
      ],
      [
        -43.93763,
        -19.93314,
        900.8
      ],
      [
        -43.93662,
        -19.93265,
        896.5
      ],
      [
        -43.93423,
        -19.93197,
        885.3
      ],
      [
        -43.93392,
        -19.93208,
        884.5
      ],
      [
        -43.9326,
        -19.93239,
        884.3
      ],
      [
        -43.93047,
        -19.93284,
        884.8
      ],
      [
        -43.92994,
        -19.93327,
        887.8
      ],
      [
        -43.92898,
        -19.93477,
        906
      ],
      [
        -43.92719,
        -19.93759,
        931
      ],
      [
        -43.92682,
        -19.93818,
        942.3
      ],
      [
        -43.92617,
        -19.93923,
        950.3
      ],
      [
        -43.92508,
        -19.94099,
        957.5
      ],
      [
        -43.92374,
        -19.94317,
        979.3
      ],
      [
        -43.92259,
        -19.94499,
        995.3
      ],
      [
        -43.92138,
        -19.94692,
        998.5
      ],
      [
        -43.9203,
        -19.94883,
        1015.5
      ],
      [
        -43.92022,
        -19.94931,
        1018.5
      ],
      [
        -43.91969,
        -19.94918,
        1021
      ],
      [
        -43.91881,
        -19.94876,
        1024
      ],
      [
        -43.91774,
        -19.94928,
        1027
      ],
      [
        -43.9162,
        -19.95117,
        1053.5
      ],
      [
        -43.91507,
        -19.9531,
        1076.8
      ],
      [
        -43.91494,
        -19.95419,
        1087.5
      ],
      [
        -43.91461,
        -19.95455,
        1096.3
      ],
      [
        -43.9145,
        -19.95458,
        1099
      ],
      [
        -43.91399,
        -19.9561,
        1119.5
      ]
    ],
    "waypoints": [
      [
        -43.9382,
        -19.9321
      ],
      [
        -43.9142,
        -19.9562
      ]
    ],
    "distanceKm": 4.2,
    "ascentM": 235,
    "descentM": 19,
    "safetyScore": 86,
    "originName": "Praça da Liberdade (Funcionários)",
    "destName": "Praça do Papa (Mangabeiras)"
  },
  {
    "id": "curated-bh-andradas-parque-municipal",
    "name": "Ciclovia Av. dos Andradas → Parque Municipal Américo Renné",
    "description": "Corredor cicloviário leste-centro acompanhando a Av. dos Andradas até o Parque Municipal no coração de BH.",
    "tag": "Eixo Andradas • MG",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Belo Horizonte, MG",
    "profile": "safe",
    "coords": [
      [
        -43.91765,
        -19.92255,
        849
      ],
      [
        -43.91812,
        -19.92232,
        850.8
      ],
      [
        -43.91892,
        -19.92253,
        854.5
      ],
      [
        -43.91934,
        -19.92247,
        854.8
      ],
      [
        -43.9195,
        -19.92243,
        854.5
      ],
      [
        -43.92026,
        -19.92224,
        853
      ],
      [
        -43.92125,
        -19.922,
        852
      ],
      [
        -43.92164,
        -19.92191,
        850
      ],
      [
        -43.92276,
        -19.92164,
        844.3
      ],
      [
        -43.92392,
        -19.92135,
        845
      ],
      [
        -43.92405,
        -19.92125,
        844.8
      ],
      [
        -43.92412,
        -19.92115,
        844.3
      ],
      [
        -43.92429,
        -19.9209,
        842.5
      ],
      [
        -43.92464,
        -19.92109,
        845
      ],
      [
        -43.92511,
        -19.92103,
        844.3
      ],
      [
        -43.9258,
        -19.92045,
        838.5
      ],
      [
        -43.92653,
        -19.92041,
        838.8
      ],
      [
        -43.92737,
        -19.92095,
        836.8
      ],
      [
        -43.92842,
        -19.92092,
        838
      ],
      [
        -43.92979,
        -19.92132,
        837.8
      ],
      [
        -43.93113,
        -19.92184,
        839.3
      ],
      [
        -43.93196,
        -19.92202,
        843
      ],
      [
        -43.93233,
        -19.92194,
        843.3
      ],
      [
        -43.9333,
        -19.92152,
        842
      ],
      [
        -43.93342,
        -19.92171,
        842.3
      ],
      [
        -43.93368,
        -19.92212,
        845.3
      ],
      [
        -43.93393,
        -19.92269,
        848.8
      ],
      [
        -43.93429,
        -19.92331,
        851
      ]
    ],
    "waypoints": [
      [
        -43.9175,
        -19.9225
      ],
      [
        -43.9344,
        -19.9234
      ]
    ],
    "distanceKm": 2,
    "ascentM": 25,
    "descentM": 23,
    "safetyScore": 90,
    "originName": "Estação Santa Efigênia (Av. dos Andradas)",
    "destName": "Parque Municipal Américo Renné Giannetti (Centro)"
  },
  {
    "id": "curated-vitoria-orla-camburi",
    "name": "Ciclovia Orla de Camburi (Píer de Iemanjá → Jardim Camburi)",
    "description": "Ciclovia beira-mar plana e arborizada ao longo de toda a Praia de Camburi, cartão-postal de Vitória.",
    "tag": "Orla de Camburi • ES",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Vitória, ES",
    "profile": "safe",
    "coords": [
      [
        -40.29071,
        -20.28956,
        6.8
      ],
      [
        -40.29027,
        -20.29074,
        6.8
      ],
      [
        -40.29059,
        -20.28927,
        6.8
      ],
      [
        -40.29073,
        -20.28689,
        6.8
      ],
      [
        -40.29062,
        -20.28586,
        6.8
      ],
      [
        -40.29022,
        -20.28489,
        4.5
      ],
      [
        -40.29001,
        -20.28416,
        6
      ],
      [
        -40.28885,
        -20.2821,
        7.3
      ],
      [
        -40.2882,
        -20.28096,
        7.5
      ],
      [
        -40.28766,
        -20.27995,
        4.8
      ],
      [
        -40.28674,
        -20.27906,
        9.3
      ],
      [
        -40.28538,
        -20.27765,
        8.5
      ],
      [
        -40.28385,
        -20.27643,
        7.5
      ],
      [
        -40.28034,
        -20.27361,
        5
      ],
      [
        -40.27952,
        -20.27306,
        4.5
      ],
      [
        -40.27842,
        -20.27206,
        3.5
      ],
      [
        -40.27669,
        -20.27099,
        2.5
      ],
      [
        -40.27448,
        -20.26959,
        0
      ],
      [
        -40.27388,
        -20.26926,
        -0.5
      ],
      [
        -40.27049,
        -20.26744,
        0.8
      ],
      [
        -40.26872,
        -20.26675,
        4.8
      ],
      [
        -40.26681,
        -20.26582,
        5.5
      ],
      [
        -40.26702,
        -20.26399,
        5.3
      ],
      [
        -40.2671,
        -20.26258,
        8.3
      ],
      [
        -40.26717,
        -20.26094,
        5.8
      ],
      [
        -40.26614,
        -20.25886,
        6.3
      ],
      [
        -40.26488,
        -20.25908,
        6
      ],
      [
        -40.26482,
        -20.25867,
        6.5
      ]
    ],
    "waypoints": [
      [
        -40.2909,
        -20.2896
      ],
      [
        -40.2649,
        -20.2586
      ]
    ],
    "distanceKm": 5.1,
    "ascentM": 18,
    "descentM": 18,
    "safetyScore": 97,
    "originName": "Píer de Iemanjá (Praia de Camburi)",
    "destName": "Final da Orla de Jardim Camburi"
  },
  {
    "id": "curated-vitoria-namorados-curva-jurema",
    "name": "Praça dos Namorados → Curva da Jurema & Shopping Vitória",
    "description": "Percurso costeiro pela Praia do Canto, Praça dos Desejos e Curva da Jurema com vista para a Terceira Ponte.",
    "tag": "Praia do Canto • ES",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Vitória, ES",
    "profile": "safe",
    "coords": [
      [
        -40.2931,
        -20.29936,
        11.3
      ],
      [
        -40.29241,
        -20.30013,
        11.8
      ],
      [
        -40.29199,
        -20.30152,
        11
      ],
      [
        -40.29201,
        -20.30259,
        8.5
      ],
      [
        -40.29188,
        -20.30306,
        9
      ],
      [
        -40.29172,
        -20.30323,
        8.8
      ],
      [
        -40.29138,
        -20.30307,
        6.5
      ],
      [
        -40.29079,
        -20.30289,
        4.3
      ],
      [
        -40.29044,
        -20.30293,
        6
      ],
      [
        -40.29117,
        -20.30417,
        5
      ],
      [
        -40.29129,
        -20.30497,
        3
      ],
      [
        -40.29099,
        -20.30702,
        2.3
      ],
      [
        -40.29016,
        -20.30853,
        0
      ],
      [
        -40.28983,
        -20.30912,
        0
      ],
      [
        -40.28979,
        -20.30933,
        0.5
      ],
      [
        -40.28988,
        -20.30978,
        2.8
      ],
      [
        -40.28982,
        -20.31006,
        3.8
      ],
      [
        -40.2892,
        -20.31105,
        3.5
      ],
      [
        -40.28896,
        -20.31154,
        5.5
      ],
      [
        -40.28882,
        -20.31162,
        6.5
      ],
      [
        -40.28902,
        -20.31115,
        4
      ],
      [
        -40.28879,
        -20.31095,
        4.3
      ],
      [
        -40.28845,
        -20.31076,
        4.5
      ],
      [
        -40.28774,
        -20.31084,
        4.3
      ],
      [
        -40.28728,
        -20.31103,
        4.8
      ],
      [
        -40.28692,
        -20.31176,
        9.3
      ],
      [
        -40.28691,
        -20.3119,
        8.8
      ],
      [
        -40.28715,
        -20.31191,
        9.8
      ]
    ],
    "waypoints": [
      [
        -40.2932,
        -20.2995
      ],
      [
        -40.2874,
        -20.3118
      ]
    ],
    "distanceKm": 2.1,
    "ascentM": 16,
    "descentM": 18,
    "safetyScore": 94,
    "originName": "Praça dos Namorados (Praia do Canto)",
    "destName": "Curva da Jurema (Enseada do Suá)"
  },
  {
    "id": "curated-vitoria-ufes-pedra-cebola",
    "name": "Campus UFES → Parque Pedra da Cebola",
    "description": "Conexão universitária entre a UFES em Goiabeiras e as alamedas internas do Parque Pedra da Cebola.",
    "tag": "Parques & Campus • ES",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Vitória, ES",
    "profile": "safe",
    "coords": [
      [
        -40.30468,
        -20.27674,
        3.3
      ],
      [
        -40.30505,
        -20.27646,
        3.3
      ],
      [
        -40.3051,
        -20.27635,
        3.3
      ],
      [
        -40.30494,
        -20.27634,
        3.3
      ],
      [
        -40.30486,
        -20.27638,
        3.3
      ],
      [
        -40.30479,
        -20.27634,
        3.3
      ],
      [
        -40.30462,
        -20.27619,
        3.5
      ],
      [
        -40.30427,
        -20.27641,
        3.5
      ],
      [
        -40.30376,
        -20.27634,
        3.3
      ],
      [
        -40.30337,
        -20.27606,
        2.5
      ],
      [
        -40.30318,
        -20.27608,
        2.3
      ],
      [
        -40.30288,
        -20.2759,
        1
      ],
      [
        -40.30213,
        -20.27655,
        2.3
      ],
      [
        -40.30157,
        -20.27601,
        0.3
      ],
      [
        -40.30176,
        -20.27557,
        0.8
      ],
      [
        -40.30173,
        -20.27542,
        1.3
      ],
      [
        -40.30098,
        -20.27513,
        2.5
      ],
      [
        -40.3007,
        -20.27501,
        4
      ],
      [
        -40.30052,
        -20.27494,
        5.5
      ],
      [
        -40.29996,
        -20.27483,
        9.8
      ],
      [
        -40.29848,
        -20.27449,
        15.5
      ],
      [
        -40.29755,
        -20.27556,
        7.3
      ],
      [
        -40.29729,
        -20.27586,
        6.8
      ],
      [
        -40.29689,
        -20.27585,
        6
      ],
      [
        -40.29662,
        -20.27594,
        5.5
      ],
      [
        -40.29658,
        -20.27609,
        5.3
      ],
      [
        -40.29665,
        -20.27609,
        5.3
      ],
      [
        -40.2968,
        -20.2761,
        5.8
      ]
    ],
    "waypoints": [
      [
        -40.3046,
        -20.2768
      ],
      [
        -40.2968,
        -20.2761
      ]
    ],
    "distanceKm": 1.3,
    "ascentM": 17,
    "descentM": 15,
    "safetyScore": 91,
    "originName": "Teatro Universitário UFES (Goiabeiras)",
    "destName": "Parque Pedra da Cebola (Mata da Praia)"
  },
  {
    "id": "curated-curitiba-barigui-centro-civico",
    "name": "Parque Barigui → Passeio Público & Centro Cívico",
    "description": "Trajeto clássico curitibano conectando a ciclovia do Parque Barigui ao Centro Cívico e Museu Oscar Niemeyer.",
    "tag": "Clássico Curitiba • PR",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Curitiba, PR",
    "profile": "safe",
    "coords": [
      [
        -49.30723,
        -25.42626,
        900.5
      ],
      [
        -49.3066,
        -25.42422,
        901.8
      ],
      [
        -49.30632,
        -25.4232,
        901
      ],
      [
        -49.30552,
        -25.42296,
        904.8
      ],
      [
        -49.30443,
        -25.42295,
        908.8
      ],
      [
        -49.30169,
        -25.42319,
        910
      ],
      [
        -49.30052,
        -25.42294,
        911.3
      ],
      [
        -49.29866,
        -25.42222,
        921
      ],
      [
        -49.29751,
        -25.42181,
        925.5
      ],
      [
        -49.29679,
        -25.42155,
        929.8
      ],
      [
        -49.29518,
        -25.42097,
        940
      ],
      [
        -49.29271,
        -25.42033,
        950.8
      ],
      [
        -49.29133,
        -25.41966,
        943.3
      ],
      [
        -49.28593,
        -25.41958,
        932.3
      ],
      [
        -49.28314,
        -25.41569,
        922.3
      ],
      [
        -49.28036,
        -25.41626,
        925
      ],
      [
        -49.27911,
        -25.41218,
        915.5
      ],
      [
        -49.27761,
        -25.41089,
        923
      ],
      [
        -49.27597,
        -25.41037,
        927
      ],
      [
        -49.27539,
        -25.41049,
        927.3
      ],
      [
        -49.27326,
        -25.41085,
        921.8
      ],
      [
        -49.27145,
        -25.41007,
        915.8
      ],
      [
        -49.27189,
        -25.40805,
        912.8
      ],
      [
        -49.27162,
        -25.40734,
        910.3
      ],
      [
        -49.26957,
        -25.40711,
        910.5
      ],
      [
        -49.268,
        -25.40897,
        922.3
      ],
      [
        -49.26777,
        -25.41014,
        922.3
      ],
      [
        -49.26712,
        -25.4103,
        922.8
      ]
    ],
    "waypoints": [
      [
        -49.3072,
        -25.4264
      ],
      [
        -49.2671,
        -25.4103
      ]
    ],
    "distanceKm": 5.6,
    "ascentM": 78,
    "descentM": 56,
    "safetyScore": 93,
    "originName": "Parque Barigui (Santo Inácio)",
    "destName": "Museu Oscar Niemeyer (Centro Cívico)"
  },
  {
    "id": "curated-curitiba-jardim-botanico-sete-setembro",
    "name": "Jardim Botânico → Via Calma Av. Sete de Setembro (Batel)",
    "description": "Sai da estufa do Jardim Botânico pela Via Calma da Av. Sete de Setembro até a Praça do Japão no Batel.",
    "tag": "Via Calma • PR",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Curitiba, PR",
    "profile": "safe",
    "coords": [
      [
        -49.23909,
        -25.44289,
        920
      ],
      [
        -49.24055,
        -25.44219,
        915
      ],
      [
        -49.24116,
        -25.44205,
        915.3
      ],
      [
        -49.24109,
        -25.44173,
        913
      ],
      [
        -49.2392,
        -25.43985,
        911.5
      ],
      [
        -49.24085,
        -25.43872,
        907.8
      ],
      [
        -49.24592,
        -25.4371,
        905.3
      ],
      [
        -49.24938,
        -25.43594,
        897.3
      ],
      [
        -49.25101,
        -25.43573,
        900.5
      ],
      [
        -49.25392,
        -25.43587,
        893
      ],
      [
        -49.2553,
        -25.43587,
        898.8
      ],
      [
        -49.2566,
        -25.43583,
        894.5
      ],
      [
        -49.25919,
        -25.43584,
        892.8
      ],
      [
        -49.26038,
        -25.43566,
        893.8
      ],
      [
        -49.2605,
        -25.43525,
        897.3
      ],
      [
        -49.26141,
        -25.43549,
        899
      ],
      [
        -49.26364,
        -25.43636,
        897.5
      ],
      [
        -49.26657,
        -25.43748,
        903.5
      ],
      [
        -49.26847,
        -25.43821,
        906.3
      ],
      [
        -49.27051,
        -25.439,
        911.5
      ],
      [
        -49.2726,
        -25.4398,
        916.5
      ],
      [
        -49.27411,
        -25.44038,
        920.8
      ],
      [
        -49.27652,
        -25.4413,
        931.5
      ],
      [
        -49.27867,
        -25.44213,
        939
      ],
      [
        -49.27995,
        -25.44262,
        946.3
      ],
      [
        -49.28249,
        -25.44359,
        945.3
      ],
      [
        -49.28493,
        -25.44452,
        942.3
      ],
      [
        -49.2869,
        -25.4446,
        935.3
      ]
    ],
    "waypoints": [
      [
        -49.2391,
        -25.4429
      ],
      [
        -49.2869,
        -25.4446
      ]
    ],
    "distanceKm": 5.7,
    "ascentM": 64,
    "descentM": 49,
    "safetyScore": 92,
    "originName": "Jardim Botânico de Curitiba",
    "destName": "Praça do Japão (Batel)"
  },
  {
    "id": "curated-curitiba-sao-lourenco-tingui",
    "name": "Ciclovia dos Parques: Parque São Lourenço → Parque Tingui",
    "description": "Rota verde pela zona norte acompanhando o eixo do Rio Barigui entre a Ópera de Arame, São Lourenço e Tingui.",
    "tag": "Rota dos Parques • PR",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Curitiba, PR",
    "profile": "safe",
    "coords": [
      [
        -49.26546,
        -25.38449,
        933.8
      ],
      [
        -49.26597,
        -25.38507,
        930.5
      ],
      [
        -49.26589,
        -25.38644,
        936.3
      ],
      [
        -49.2668,
        -25.38713,
        922
      ],
      [
        -49.26732,
        -25.38664,
        922
      ],
      [
        -49.2676,
        -25.38754,
        925
      ],
      [
        -49.26919,
        -25.38721,
        934
      ],
      [
        -49.27152,
        -25.38709,
        942.3
      ],
      [
        -49.27507,
        -25.38564,
        951.3
      ],
      [
        -49.27867,
        -25.38584,
        975.8
      ],
      [
        -49.2795,
        -25.38551,
        982.3
      ],
      [
        -49.27999,
        -25.38537,
        986
      ],
      [
        -49.2819,
        -25.38558,
        980.5
      ],
      [
        -49.28243,
        -25.38557,
        979.5
      ],
      [
        -49.28419,
        -25.38589,
        985.5
      ],
      [
        -49.28516,
        -25.38453,
        976
      ],
      [
        -49.28625,
        -25.38396,
        978.3
      ],
      [
        -49.28776,
        -25.38302,
        974
      ],
      [
        -49.28953,
        -25.38406,
        962.8
      ],
      [
        -49.29344,
        -25.38315,
        963.5
      ],
      [
        -49.29519,
        -25.38433,
        952.3
      ],
      [
        -49.29801,
        -25.38486,
        931.5
      ],
      [
        -49.30071,
        -25.38691,
        913.5
      ],
      [
        -49.30262,
        -25.3872,
        907.5
      ],
      [
        -49.304,
        -25.38756,
        909
      ],
      [
        -49.30486,
        -25.38828,
        909.5
      ],
      [
        -49.3053,
        -25.38969,
        906.5
      ],
      [
        -49.30506,
        -25.39084,
        906
      ]
    ],
    "waypoints": [
      [
        -49.2654,
        -25.3845
      ],
      [
        -49.3054,
        -25.3911
      ]
    ],
    "distanceKm": 5,
    "ascentM": 81,
    "descentM": 109,
    "safetyScore": 95,
    "originName": "Parque São Lourenço",
    "destName": "Memorial Ucraniano (Parque Tingui)"
  },
  {
    "id": "curated-floripa-beira-mar-hercilio-luz",
    "name": "Ciclovia Beira-Mar Norte → Ponte Hercílio Luz",
    "description": "Ciclovia litorânea ampla e plana com vista para a Baía Norte até a histórica Ponte Hercílio Luz.",
    "tag": "Beira-Mar Norte • SC",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Florianópolis, SC",
    "profile": "safe",
    "coords": [
      [
        -48.54706,
        -27.58501,
        16.8
      ],
      [
        -48.54735,
        -27.58574,
        14.5
      ],
      [
        -48.54751,
        -27.58585,
        15
      ],
      [
        -48.54878,
        -27.58671,
        16
      ],
      [
        -48.54896,
        -27.58678,
        15.5
      ],
      [
        -48.5496,
        -27.5869,
        14.5
      ],
      [
        -48.55055,
        -27.58708,
        14
      ],
      [
        -48.55135,
        -27.58723,
        14.5
      ],
      [
        -48.55161,
        -27.58727,
        14.5
      ],
      [
        -48.55233,
        -27.58741,
        13
      ],
      [
        -48.55351,
        -27.58761,
        11.3
      ],
      [
        -48.55474,
        -27.58801,
        13.8
      ],
      [
        -48.55488,
        -27.58806,
        14
      ],
      [
        -48.55658,
        -27.58865,
        12.5
      ],
      [
        -48.55763,
        -27.58898,
        11
      ],
      [
        -48.55781,
        -27.58904,
        11.5
      ],
      [
        -48.55852,
        -27.58928,
        12.5
      ],
      [
        -48.56177,
        -27.59039,
        18.8
      ],
      [
        -48.56202,
        -27.59055,
        15.3
      ],
      [
        -48.56219,
        -27.59077,
        13.8
      ],
      [
        -48.56223,
        -27.59121,
        13.3
      ],
      [
        -48.56204,
        -27.59169,
        17
      ],
      [
        -48.56216,
        -27.59235,
        19.3
      ],
      [
        -48.56226,
        -27.59269,
        18.8
      ],
      [
        -48.56222,
        -27.59281,
        19
      ],
      [
        -48.5619,
        -27.59316,
        19.8
      ],
      [
        -48.56236,
        -27.59333,
        18
      ],
      [
        -48.56225,
        -27.59387,
        8
      ]
    ],
    "waypoints": [
      [
        -48.5472,
        -27.5851
      ],
      [
        -48.5621,
        -27.5938
      ]
    ],
    "distanceKm": 2.1,
    "ascentM": 20,
    "descentM": 28,
    "safetyScore": 97,
    "originName": "Trapiche da Beira-Mar Norte (Centro)",
    "destName": "Mirante da Ponte Hercílio Luz"
  },
  {
    "id": "curated-floripa-ufsc-carianos",
    "name": "Campus UFSC (Trindade) → Parque Linear Córrego Grande",
    "description": "Conexão universitária pelas ciclovias da Trindade e Santa Mônica até o Parque Ecológico do Córrego Grande.",
    "tag": "Eixo UFSC • SC",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Florianópolis, SC",
    "profile": "safe",
    "coords": [
      [
        -48.5194,
        -27.60044,
        11
      ],
      [
        -48.51915,
        -27.60039,
        11.3
      ],
      [
        -48.5191,
        -27.60012,
        11
      ],
      [
        -48.51903,
        -27.59982,
        10.5
      ],
      [
        -48.5189,
        -27.59978,
        10.5
      ],
      [
        -48.5186,
        -27.59945,
        9.8
      ],
      [
        -48.51848,
        -27.5995,
        9.8
      ],
      [
        -48.5182,
        -27.59959,
        10.3
      ],
      [
        -48.5172,
        -27.59982,
        11
      ],
      [
        -48.51677,
        -27.59987,
        11
      ],
      [
        -48.51667,
        -27.59996,
        11
      ],
      [
        -48.51635,
        -27.60014,
        13.5
      ],
      [
        -48.51558,
        -27.60016,
        16.8
      ],
      [
        -48.51517,
        -27.60025,
        17.5
      ],
      [
        -48.5145,
        -27.60048,
        18
      ],
      [
        -48.51406,
        -27.60064,
        18
      ],
      [
        -48.51359,
        -27.60072,
        17
      ],
      [
        -48.51329,
        -27.60062,
        15
      ],
      [
        -48.51294,
        -27.60042,
        13.5
      ],
      [
        -48.51256,
        -27.60018,
        12
      ],
      [
        -48.51214,
        -27.6,
        13.5
      ],
      [
        -48.51143,
        -27.59988,
        17.3
      ],
      [
        -48.51102,
        -27.59982,
        19.5
      ],
      [
        -48.50994,
        -27.59966,
        28
      ],
      [
        -48.50957,
        -27.59966,
        28.5
      ],
      [
        -48.509,
        -27.59974,
        28.5
      ],
      [
        -48.50842,
        -27.59976,
        26.8
      ],
      [
        -48.50787,
        -27.59716,
        6
      ]
    ],
    "waypoints": [
      [
        -48.5194,
        -27.6005
      ],
      [
        -48.5082,
        -27.5971
      ]
    ],
    "distanceKm": 1.5,
    "ascentM": 25,
    "descentM": 30,
    "safetyScore": 92,
    "originName": "Praça da Cidadania (UFSC Trindade)",
    "destName": "Parque Ecológico do Córrego Grande"
  },
  {
    "id": "curated-floripa-beira-mar-continental",
    "name": "Ciclovia Beira-Mar Continental (Estreito → Coqueiros)",
    "description": "Pista exclusiva à beira-mar no continente com vista panorâmica da Ilha de Santa Catarina.",
    "tag": "Orla Continental • SC",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Florianópolis, SC",
    "profile": "safe",
    "coords": [
      [
        -48.57735,
        -27.58587,
        4.8
      ],
      [
        -48.5772,
        -27.58624,
        4.8
      ],
      [
        -48.57589,
        -27.58793,
        4.8
      ],
      [
        -48.57477,
        -27.58894,
        4.8
      ],
      [
        -48.5734,
        -27.58997,
        4.8
      ],
      [
        -48.57085,
        -27.59156,
        4.8
      ],
      [
        -48.56985,
        -27.59273,
        4.8
      ],
      [
        -48.56923,
        -27.59416,
        4.8
      ],
      [
        -48.56901,
        -27.5952,
        7.3
      ],
      [
        -48.56938,
        -27.59656,
        6
      ],
      [
        -48.56968,
        -27.59689,
        6.3
      ],
      [
        -48.56998,
        -27.59793,
        5.8
      ],
      [
        -48.57029,
        -27.59861,
        5.3
      ],
      [
        -48.57138,
        -27.59932,
        4.5
      ],
      [
        -48.57209,
        -27.59939,
        5.3
      ],
      [
        -48.57286,
        -27.59932,
        7.8
      ],
      [
        -48.57339,
        -27.59952,
        8.8
      ],
      [
        -48.57358,
        -27.59978,
        7.8
      ],
      [
        -48.57402,
        -27.60014,
        6.5
      ],
      [
        -48.57496,
        -27.601,
        3.8
      ],
      [
        -48.57553,
        -27.60236,
        6.8
      ],
      [
        -48.57588,
        -27.60267,
        8.5
      ],
      [
        -48.57606,
        -27.60337,
        8
      ],
      [
        -48.57675,
        -27.60462,
        10.5
      ],
      [
        -48.57726,
        -27.60554,
        12.8
      ],
      [
        -48.57791,
        -27.6065,
        11.3
      ],
      [
        -48.57843,
        -27.60601,
        18.8
      ],
      [
        -48.57876,
        -27.60594,
        19
      ]
    ],
    "waypoints": [
      [
        -48.5754,
        -27.5849
      ],
      [
        -48.5789,
        -27.6061
      ]
    ],
    "distanceKm": 3.1,
    "ascentM": 24,
    "descentM": 10,
    "safetyScore": 95,
    "originName": "Beira-Mar Continental (Balneário do Estreito)",
    "destName": "Parque de Coqueiros"
  },
  {
    "id": "curated-poa-orla-guaiba-marinha",
    "name": "Orla do Guaíba: Usina do Gasômetro → Parque Marinha do Brasil",
    "description": "A ciclovia mais vibrante de Porto Alegre acompanhando o pôr do sol do Guaíba, Skate Park e Praia de Belas.",
    "tag": "Orla do Guaíba • RS",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Porto Alegre, RS",
    "profile": "safe",
    "coords": [
      [
        -51.24116,
        -30.03429,
        8
      ],
      [
        -51.24064,
        -30.03449,
        10.3
      ],
      [
        -51.24121,
        -30.03549,
        5.5
      ],
      [
        -51.24149,
        -30.03651,
        4.8
      ],
      [
        -51.24146,
        -30.03736,
        6
      ],
      [
        -51.24142,
        -30.038,
        6
      ],
      [
        -51.2414,
        -30.03856,
        6
      ],
      [
        -51.24136,
        -30.03957,
        5.8
      ],
      [
        -51.24106,
        -30.04095,
        5.8
      ],
      [
        -51.24021,
        -30.04185,
        5.3
      ],
      [
        -51.23881,
        -30.04235,
        5.5
      ],
      [
        -51.23378,
        -30.04279,
        5.3
      ],
      [
        -51.23312,
        -30.04302,
        4.8
      ],
      [
        -51.23255,
        -30.04362,
        5.5
      ],
      [
        -51.23246,
        -30.04393,
        6.3
      ],
      [
        -51.2327,
        -30.04645,
        4.3
      ],
      [
        -51.23283,
        -30.04762,
        4.3
      ],
      [
        -51.23288,
        -30.04944,
        7
      ],
      [
        -51.23236,
        -30.05031,
        6.5
      ],
      [
        -51.23199,
        -30.05034,
        6.8
      ],
      [
        -51.23112,
        -30.0505,
        6.8
      ],
      [
        -51.23058,
        -30.05074,
        7.3
      ],
      [
        -51.22988,
        -30.0508,
        8
      ],
      [
        -51.22992,
        -30.05202,
        8.5
      ],
      [
        -51.23047,
        -30.0565,
        7
      ],
      [
        -51.23075,
        -30.05819,
        8.8
      ],
      [
        -51.23099,
        -30.0597,
        8.5
      ],
      [
        -51.23158,
        -30.0598,
        8
      ]
    ],
    "waypoints": [
      [
        -51.2412,
        -30.0342
      ],
      [
        -51.2315,
        -30.0598
      ]
    ],
    "distanceKm": 3.8,
    "ascentM": 12,
    "descentM": 12,
    "safetyScore": 98,
    "originName": "Usina do Gasômetro (Orla Trecho 1)",
    "destName": "Parque Marinha do Brasil (Praia de Belas)"
  },
  {
    "id": "curated-poa-redencao-ipiranga",
    "name": "Parque da Redenção → Ciclovia Av. Ipiranga (PUCRS)",
    "description": "Sai do Parque Farroupilha (Redenção) e segue pela ciclovia segregada do Arroio Dilúvio na Av. Ipiranga.",
    "tag": "Eixo Ipiranga • RS",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Porto Alegre, RS",
    "profile": "safe",
    "coords": [
      [
        -51.21797,
        -30.03783,
        14
      ],
      [
        -51.21833,
        -30.03607,
        17.5
      ],
      [
        -51.21806,
        -30.03529,
        19.3
      ],
      [
        -51.21759,
        -30.0346,
        17.8
      ],
      [
        -51.21666,
        -30.03401,
        20
      ],
      [
        -51.21537,
        -30.03333,
        18
      ],
      [
        -51.21352,
        -30.03139,
        28
      ],
      [
        -51.20958,
        -30.0318,
        30.3
      ],
      [
        -51.20715,
        -30.03212,
        28.8
      ],
      [
        -51.20431,
        -30.03271,
        25.5
      ],
      [
        -51.20418,
        -30.03265,
        25.8
      ],
      [
        -51.20392,
        -30.03277,
        26.5
      ],
      [
        -51.20399,
        -30.03322,
        25.8
      ],
      [
        -51.20402,
        -30.03639,
        27.3
      ],
      [
        -51.20405,
        -30.03751,
        24.3
      ],
      [
        -51.20397,
        -30.03792,
        23
      ],
      [
        -51.20385,
        -30.03822,
        22
      ],
      [
        -51.20395,
        -30.04079,
        18.3
      ],
      [
        -51.20397,
        -30.04214,
        13.5
      ],
      [
        -51.20397,
        -30.04245,
        12.8
      ],
      [
        -51.20072,
        -30.04326,
        10
      ],
      [
        -51.19882,
        -30.04485,
        9.8
      ],
      [
        -51.19499,
        -30.05035,
        12.5
      ],
      [
        -51.1916,
        -30.05406,
        15
      ],
      [
        -51.18444,
        -30.05759,
        14.3
      ],
      [
        -51.18411,
        -30.05813,
        15.8
      ],
      [
        -51.18196,
        -30.059,
        15.8
      ],
      [
        -51.17543,
        -30.05752,
        22.5
      ]
    ],
    "waypoints": [
      [
        -51.2179,
        -30.0378
      ],
      [
        -51.1755,
        -30.0574
      ]
    ],
    "distanceKm": 6.5,
    "ascentM": 36,
    "descentM": 27,
    "safetyScore": 92,
    "originName": "Arco da Redenção (Parque Farroupilha)",
    "destName": "Museu de Ciências e Tecnologia PUCRS (Partenon)"
  },
  {
    "id": "curated-poa-moinhos-parcão-redencao",
    "name": "Parcão (Moinhos de Vento) → Cidade Baixa & Redenção",
    "description": "Rota arborizada conectando o Parque Moinhos de Vento (Parcão) às ciclofaixas da Cidade Baixa.",
    "tag": "Moinhos & Cidade Baixa • RS",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Porto Alegre, RS",
    "profile": "safe",
    "coords": [
      [
        -51.20142,
        -30.02654,
        8
      ],
      [
        -51.20145,
        -30.02642,
        9.7
      ],
      [
        -51.20186,
        -30.02684,
        11.1
      ],
      [
        -51.20193,
        -30.02858,
        11.9
      ],
      [
        -51.20094,
        -30.02859,
        11.9
      ],
      [
        -51.20081,
        -30.02866,
        11.1
      ],
      [
        -51.20075,
        -30.02874,
        9.7
      ],
      [
        -51.20072,
        -30.02887,
        8
      ],
      [
        -51.20074,
        -30.02902,
        6.2
      ],
      [
        -51.20142,
        -30.02975,
        4.8
      ],
      [
        -51.20258,
        -30.03098,
        4.1
      ],
      [
        -51.20373,
        -30.032,
        4.1
      ],
      [
        -51.20418,
        -30.03265,
        4.9
      ],
      [
        -51.20431,
        -30.03271,
        6.3
      ],
      [
        -51.20627,
        -30.0323,
        8.1
      ],
      [
        -51.20739,
        -30.03207,
        9.8
      ],
      [
        -51.21086,
        -30.03175,
        11.2
      ],
      [
        -51.21106,
        -30.03556,
        11.9
      ],
      [
        -51.21085,
        -30.03593,
        11.9
      ],
      [
        -51.21107,
        -30.03669,
        11.1
      ],
      [
        -51.21158,
        -30.03699,
        9.6
      ],
      [
        -51.21305,
        -30.03786,
        7.9
      ],
      [
        -51.21439,
        -30.03864,
        6.2
      ],
      [
        -51.21685,
        -30.04007,
        4.8
      ],
      [
        -51.21711,
        -30.04039,
        4.1
      ],
      [
        -51.21753,
        -30.04001,
        4.1
      ],
      [
        -51.21884,
        -30.04048,
        5
      ],
      [
        -51.22204,
        -30.04161,
        10
      ]
    ],
    "waypoints": [
      [
        -51.2015,
        -30.0266
      ],
      [
        -51.2219,
        -30.0419
      ]
    ],
    "distanceKm": 3.4,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 89,
    "originName": "Parque Moinhos de Vento (Parcão)",
    "destName": "Largo Zumbi dos Palmares (Cidade Baixa)"
  },
  {
    "id": "curated-fortaleza-beira-mar-mucuripe",
    "name": "Ciclovia Beira-Mar: Praia de Iracema → Mercado dos Peixes (Mucuripe)",
    "description": "Ciclovia costeira contínua pela Ponte dos Ingleses, Meireles, Feirinha da Beira-Mar e enseada do Mucuripe.",
    "tag": "Orla Beira-Mar • CE",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Fortaleza, CE",
    "profile": "safe",
    "coords": [
      [
        -38.51419,
        -3.71945,
        8
      ],
      [
        -38.51314,
        -3.71997,
        9.7
      ],
      [
        -38.51137,
        -3.72024,
        11.1
      ],
      [
        -38.50926,
        -3.72108,
        11.9
      ],
      [
        -38.50837,
        -3.72207,
        11.9
      ],
      [
        -38.50714,
        -3.72265,
        11.1
      ],
      [
        -38.50605,
        -3.72313,
        9.7
      ],
      [
        -38.5054,
        -3.72344,
        8
      ],
      [
        -38.50516,
        -3.72303,
        6.2
      ],
      [
        -38.50315,
        -3.7239,
        4.8
      ],
      [
        -38.50183,
        -3.72437,
        4.1
      ],
      [
        -38.5002,
        -3.72482,
        4.1
      ],
      [
        -38.49891,
        -3.72518,
        4.9
      ],
      [
        -38.49749,
        -3.72543,
        6.3
      ],
      [
        -38.49689,
        -3.72561,
        8.1
      ],
      [
        -38.49547,
        -3.72596,
        9.8
      ],
      [
        -38.49412,
        -3.72594,
        11.2
      ],
      [
        -38.49133,
        -3.72547,
        11.9
      ],
      [
        -38.48969,
        -3.72478,
        11.9
      ],
      [
        -38.48833,
        -3.72465,
        11.1
      ],
      [
        -38.48454,
        -3.72517,
        9.6
      ],
      [
        -38.48408,
        -3.72537,
        7.9
      ],
      [
        -38.48234,
        -3.72448,
        6.2
      ],
      [
        -38.48053,
        -3.72432,
        4.8
      ],
      [
        -38.48016,
        -3.72429,
        4.1
      ],
      [
        -38.4792,
        -3.7231,
        4.1
      ],
      [
        -38.47857,
        -3.72315,
        5
      ],
      [
        -38.4778,
        -3.7229,
        10
      ]
    ],
    "waypoints": [
      [
        -38.5142,
        -3.7195
      ],
      [
        -38.4778,
        -3.7229
      ]
    ],
    "distanceKm": 4.4,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 97,
    "originName": "Estátua de Iracema Guardiã (Praia de Iracema)",
    "destName": "Mercado dos Peixes (Mucuripe)"
  },
  {
    "id": "curated-fortaleza-coco-aldeota",
    "name": "Parque Estadual do Cocó → Praça Portugal (Aldeota)",
    "description": "Corredor cicloviário da Aldeota ligando a área verde do Parque do Cocó às ciclofaixas da Av. Dom Luís.",
    "tag": "Cocó & Aldeota • CE",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Fortaleza, CE",
    "profile": "safe",
    "coords": [
      [
        -38.48584,
        -3.74515,
        8
      ],
      [
        -38.48604,
        -3.74501,
        9.7
      ],
      [
        -38.48635,
        -3.74484,
        11.1
      ],
      [
        -38.48658,
        -3.74472,
        11.9
      ],
      [
        -38.4869,
        -3.74472,
        11.9
      ],
      [
        -38.48746,
        -3.74437,
        11.1
      ],
      [
        -38.48752,
        -3.74415,
        9.7
      ],
      [
        -38.48788,
        -3.74407,
        8
      ],
      [
        -38.48801,
        -3.74391,
        6.2
      ],
      [
        -38.48856,
        -3.74364,
        4.8
      ],
      [
        -38.49075,
        -3.74293,
        4.1
      ],
      [
        -38.49108,
        -3.74285,
        4.1
      ],
      [
        -38.49177,
        -3.7427,
        4.9
      ],
      [
        -38.49273,
        -3.74239,
        6.3
      ],
      [
        -38.49377,
        -3.74205,
        8.1
      ],
      [
        -38.49483,
        -3.7417,
        9.8
      ],
      [
        -38.49569,
        -3.74138,
        11.2
      ],
      [
        -38.49447,
        -3.73757,
        11.9
      ],
      [
        -38.49425,
        -3.7369,
        11.9
      ],
      [
        -38.49351,
        -3.7346,
        11.1
      ],
      [
        -38.49429,
        -3.73432,
        9.6
      ],
      [
        -38.4948,
        -3.73416,
        7.9
      ],
      [
        -38.49549,
        -3.73394,
        6.2
      ],
      [
        -38.49641,
        -3.73364,
        4.8
      ],
      [
        -38.49695,
        -3.73346,
        4.1
      ],
      [
        -38.49711,
        -3.73343,
        4.1
      ],
      [
        -38.49707,
        -3.73329,
        5
      ],
      [
        -38.49708,
        -3.73316,
        10
      ]
    ],
    "waypoints": [
      [
        -38.4859,
        -3.7453
      ],
      [
        -38.4972,
        -3.7332
      ]
    ],
    "distanceKm": 2.4,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 93,
    "originName": "Anfiteatro do Parque do Cocó",
    "destName": "Praça Portugal (Aldeota)"
  },
  {
    "id": "curated-fortaleza-benfica-dragao-mar",
    "name": "Campus Benfica (UFC) → Centro Dragão do Mar",
    "description": "Eixo universitário e cultural pela Av. da Universidade até o Centro Dragão do Mar de Arte e Cultura.",
    "tag": "Rota Cultural • CE",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Fortaleza, CE",
    "profile": "safe",
    "coords": [
      [
        -38.53855,
        -3.74045,
        8
      ],
      [
        -38.53866,
        -3.74045,
        9.7
      ],
      [
        -38.53693,
        -3.73855,
        11.1
      ],
      [
        -38.5356,
        -3.73708,
        11.9
      ],
      [
        -38.53501,
        -3.73645,
        11.9
      ],
      [
        -38.53416,
        -3.73553,
        11.1
      ],
      [
        -38.53348,
        -3.73477,
        9.7
      ],
      [
        -38.53291,
        -3.73407,
        8
      ],
      [
        -38.53254,
        -3.73318,
        6.2
      ],
      [
        -38.53234,
        -3.73317,
        4.8
      ],
      [
        -38.53158,
        -3.73337,
        4.1
      ],
      [
        -38.52996,
        -3.7339,
        4.1
      ],
      [
        -38.52934,
        -3.73403,
        4.9
      ],
      [
        -38.52905,
        -3.73312,
        6.3
      ],
      [
        -38.52874,
        -3.7322,
        8.1
      ],
      [
        -38.52844,
        -3.73129,
        9.8
      ],
      [
        -38.52795,
        -3.72983,
        11.2
      ],
      [
        -38.52712,
        -3.7273,
        11.9
      ],
      [
        -38.52677,
        -3.72629,
        11.9
      ],
      [
        -38.52643,
        -3.72522,
        11.1
      ],
      [
        -38.52554,
        -3.72446,
        9.6
      ],
      [
        -38.52504,
        -3.72362,
        7.9
      ],
      [
        -38.52465,
        -3.72374,
        6.2
      ],
      [
        -38.52394,
        -3.72277,
        4.8
      ],
      [
        -38.5238,
        -3.72252,
        4.1
      ],
      [
        -38.52113,
        -3.72228,
        4.1
      ],
      [
        -38.51945,
        -3.72239,
        5
      ],
      [
        -38.51933,
        -3.7219,
        10
      ]
    ],
    "waypoints": [
      [
        -38.5385,
        -3.7405
      ],
      [
        -38.5194,
        -3.7219
      ]
    ],
    "distanceKm": 3.5,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 91,
    "originName": "Reitoria UFC (Benfica)",
    "destName": "Centro Dragão do Mar (Praia de Iracema)"
  },
  {
    "id": "curated-salvador-barra-rio-vermelho",
    "name": "Orla Atlântica: Farol da Barra → Ondina & Rio Vermelho",
    "description": "Ciclovia litorânea passando pelo Porto da Barra, Morro do Cristo, Praia de Ondina e Largo da Mariquita.",
    "tag": "Orla da Barra • BA",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Salvador, BA",
    "profile": "safe",
    "coords": [
      [
        -38.53276,
        -13.01027,
        8
      ],
      [
        -38.53178,
        -13.01008,
        9.7
      ],
      [
        -38.5256,
        -13.0093,
        11.1
      ],
      [
        -38.52358,
        -13.01021,
        11.9
      ],
      [
        -38.51995,
        -13.00835,
        11.9
      ],
      [
        -38.51881,
        -13.00794,
        11.1
      ],
      [
        -38.5163,
        -13.00815,
        9.7
      ],
      [
        -38.51518,
        -13.0091,
        8
      ],
      [
        -38.51369,
        -13.00976,
        6.2
      ],
      [
        -38.5096,
        -13.01054,
        4.8
      ],
      [
        -38.5088,
        -13.0108,
        4.1
      ],
      [
        -38.50718,
        -13.01132,
        4.1
      ],
      [
        -38.50663,
        -13.01135,
        4.9
      ],
      [
        -38.50524,
        -13.01147,
        6.3
      ],
      [
        -38.50253,
        -13.01053,
        8.1
      ],
      [
        -38.50131,
        -13.01087,
        9.8
      ],
      [
        -38.49953,
        -13.01056,
        11.2
      ],
      [
        -38.4972,
        -13.01032,
        11.9
      ],
      [
        -38.49627,
        -13.01047,
        11.9
      ],
      [
        -38.49592,
        -13.01119,
        11.1
      ],
      [
        -38.49431,
        -13.01111,
        9.6
      ],
      [
        -38.49338,
        -13.0114,
        7.9
      ],
      [
        -38.49313,
        -13.01121,
        6.2
      ],
      [
        -38.49186,
        -13.01199,
        4.8
      ],
      [
        -38.49133,
        -13.01277,
        4.1
      ],
      [
        -38.49048,
        -13.01319,
        4.1
      ],
      [
        -38.48975,
        -13.01347,
        5
      ],
      [
        -38.48918,
        -13.0132,
        10
      ]
    ],
    "waypoints": [
      [
        -38.5328,
        -13.0103
      ],
      [
        -38.4892,
        -13.0132
      ]
    ],
    "distanceKm": 5.1,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 96,
    "originName": "Farol da Barra (Santo Antônio da Barra)",
    "destName": "Casa do Rio Vermelho / Largo da Mariquita"
  },
  {
    "id": "curated-salvador-pituba-jardim-alah",
    "name": "Ciclovia Orla Pituba → Jardim de Alah & Costa Azul",
    "description": "Trecho plano e ventilado da nova orla de Salvador com ciclovia segregada e estações Bike Salvador.",
    "tag": "Nova Orla • BA",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Salvador, BA",
    "profile": "safe",
    "coords": [
      [
        -38.46016,
        -13.00538,
        8
      ],
      [
        -38.45949,
        -13.00556,
        9.7
      ],
      [
        -38.45762,
        -13.00605,
        11.1
      ],
      [
        -38.45654,
        -13.00592,
        11.9
      ],
      [
        -38.45504,
        -13.0055,
        11.9
      ],
      [
        -38.45419,
        -13.0053,
        11.1
      ],
      [
        -38.45338,
        -13.0047,
        9.7
      ],
      [
        -38.45246,
        -13.00366,
        8
      ],
      [
        -38.45193,
        -13.00321,
        6.2
      ],
      [
        -38.45154,
        -13.00293,
        4.8
      ],
      [
        -38.45096,
        -13.003,
        4.1
      ],
      [
        -38.45012,
        -13.00209,
        4.1
      ],
      [
        -38.44923,
        -13.00076,
        4.9
      ],
      [
        -38.44883,
        -13.00054,
        6.3
      ],
      [
        -38.44874,
        -13.00034,
        8.1
      ],
      [
        -38.44857,
        -13.00031,
        9.8
      ],
      [
        -38.44765,
        -12.99945,
        11.2
      ],
      [
        -38.44617,
        -12.99845,
        11.9
      ],
      [
        -38.44442,
        -12.99788,
        11.9
      ],
      [
        -38.44329,
        -12.99762,
        11.1
      ],
      [
        -38.4427,
        -12.9972,
        9.6
      ],
      [
        -38.44175,
        -12.99669,
        7.9
      ],
      [
        -38.44023,
        -12.99402,
        6.2
      ],
      [
        -38.43892,
        -12.99219,
        4.8
      ],
      [
        -38.43807,
        -12.99122,
        4.1
      ],
      [
        -38.43707,
        -12.98976,
        4.1
      ],
      [
        -38.43745,
        -12.98903,
        5
      ],
      [
        -38.43751,
        -12.98789,
        10
      ]
    ],
    "waypoints": [
      [
        -38.4602,
        -13.0054
      ],
      [
        -38.4375,
        -12.9879
      ]
    ],
    "distanceKm": 3.5,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 95,
    "originName": "Parque Cidade Jovem / Orla da Pituba",
    "destName": "Jardim de Alah (Costa Azul)"
  },
  {
    "id": "curated-salvador-dique-tororo-campo-grande",
    "name": "Dique do Tororó → Praça do Campo Grande",
    "description": "Contorno cicloviário da lagoa do Dique do Tororó subindo até o Teatro Castro Alves no Campo Grande.",
    "tag": "Centro & Dique • BA",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Moderado",
    "city": "Salvador, BA",
    "profile": "safe",
    "coords": [
      [
        -38.50587,
        -12.98311,
        8
      ],
      [
        -38.5064,
        -12.98344,
        9.7
      ],
      [
        -38.50685,
        -12.98298,
        11.1
      ],
      [
        -38.50685,
        -12.98148,
        11.9
      ],
      [
        -38.50777,
        -12.97951,
        11.9
      ],
      [
        -38.50807,
        -12.97958,
        11.1
      ],
      [
        -38.50825,
        -12.97972,
        9.7
      ],
      [
        -38.50902,
        -12.97903,
        8
      ],
      [
        -38.50995,
        -12.97912,
        6.2
      ],
      [
        -38.51155,
        -12.97974,
        4.8
      ],
      [
        -38.51283,
        -12.97978,
        4.1
      ],
      [
        -38.51511,
        -12.98021,
        4.1
      ],
      [
        -38.51524,
        -12.98168,
        4.9
      ],
      [
        -38.51544,
        -12.98219,
        6.3
      ],
      [
        -38.51682,
        -12.98314,
        8.1
      ],
      [
        -38.51774,
        -12.98373,
        9.8
      ],
      [
        -38.51931,
        -12.98476,
        11.2
      ],
      [
        -38.52003,
        -12.98526,
        11.9
      ],
      [
        -38.52007,
        -12.98578,
        11.9
      ],
      [
        -38.52014,
        -12.986,
        11.1
      ],
      [
        -38.52067,
        -12.98638,
        9.6
      ],
      [
        -38.52115,
        -12.98678,
        7.9
      ],
      [
        -38.52207,
        -12.98815,
        6.2
      ],
      [
        -38.52315,
        -12.98892,
        4.8
      ],
      [
        -38.52166,
        -12.98967,
        4.1
      ],
      [
        -38.52137,
        -12.98923,
        4.1
      ],
      [
        -38.52123,
        -12.98903,
        5
      ],
      [
        -38.52139,
        -12.98884,
        10
      ]
    ],
    "waypoints": [
      [
        -38.5059,
        -12.9831
      ],
      [
        -38.5214,
        -12.9889
      ]
    ],
    "distanceKm": 3.1,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 88,
    "originName": "Dique do Tororó (Arena Fonte Nova)",
    "destName": "Praça 2 de Julho (Campo Grande)"
  },
  {
    "id": "curated-recife-orla-boa-viagem",
    "name": "Ciclovia Orla de Boa Viagem (Pina → Pracinha de Boa Viagem)",
    "description": "Ciclovia beira-mar plana ao longo dos arrecifes naturais das praias do Pina e de Boa Viagem.",
    "tag": "Orla Boa Viagem • PE",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Recife, PE",
    "profile": "safe",
    "coords": [
      [
        -34.88321,
        -8.09542,
        8
      ],
      [
        -34.88299,
        -8.09531,
        9.7
      ],
      [
        -34.88353,
        -8.09796,
        11.1
      ],
      [
        -34.8844,
        -8.09981,
        11.9
      ],
      [
        -34.88524,
        -8.1016,
        11.9
      ],
      [
        -34.88566,
        -8.10256,
        11.1
      ],
      [
        -34.88639,
        -8.10408,
        9.7
      ],
      [
        -34.88679,
        -8.10504,
        8
      ],
      [
        -34.88724,
        -8.10603,
        6.2
      ],
      [
        -34.88761,
        -8.1068,
        4.8
      ],
      [
        -34.88812,
        -8.10801,
        4.1
      ],
      [
        -34.88879,
        -8.10948,
        4.1
      ],
      [
        -34.88922,
        -8.11033,
        4.9
      ],
      [
        -34.88969,
        -8.11144,
        6.3
      ],
      [
        -34.89019,
        -8.11241,
        8.1
      ],
      [
        -34.89075,
        -8.11336,
        9.8
      ],
      [
        -34.89134,
        -8.11427,
        11.2
      ],
      [
        -34.89201,
        -8.11519,
        11.9
      ],
      [
        -34.89281,
        -8.11656,
        11.9
      ],
      [
        -34.89319,
        -8.11711,
        11.1
      ],
      [
        -34.89373,
        -8.11811,
        9.6
      ],
      [
        -34.89448,
        -8.11936,
        7.9
      ],
      [
        -34.89498,
        -8.12012,
        6.2
      ],
      [
        -34.89555,
        -8.12125,
        4.8
      ],
      [
        -34.89623,
        -8.12266,
        4.1
      ],
      [
        -34.8966,
        -8.12367,
        4.1
      ],
      [
        -34.898,
        -8.12789,
        5
      ],
      [
        -34.89934,
        -8.13118,
        10
      ]
    ],
    "waypoints": [
      [
        -34.8832,
        -8.0954
      ],
      [
        -34.8975,
        -8.1319
      ]
    ],
    "distanceKm": 4.4,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 97,
    "originName": "Praia do Pina (Início da Orla)",
    "destName": "Pracinha de Boa Viagem (Igreja N. Sra. da Boa Viagem)"
  },
  {
    "id": "curated-recife-marco-zero-aurora",
    "name": "Marco Zero (Recife Antigo) → Rua da Aurora",
    "description": "Passeio histórico pelas pontes do Rio Capibaribe, Cais do Sertão e casario colorido da Rua da Aurora.",
    "tag": "Recife Antigo • PE",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Recife, PE",
    "profile": "safe",
    "coords": [
      [
        -34.87087,
        -8.06319,
        8
      ],
      [
        -34.87088,
        -8.06324,
        9.7
      ],
      [
        -34.87108,
        -8.06363,
        11.1
      ],
      [
        -34.87139,
        -8.06351,
        11.9
      ],
      [
        -34.87146,
        -8.06352,
        11.9
      ],
      [
        -34.87157,
        -8.06364,
        11.1
      ],
      [
        -34.87222,
        -8.06378,
        9.7
      ],
      [
        -34.8731,
        -8.06313,
        8
      ],
      [
        -34.8738,
        -8.06258,
        6.2
      ],
      [
        -34.87379,
        -8.06239,
        4.8
      ],
      [
        -34.87396,
        -8.06235,
        4.1
      ],
      [
        -34.87642,
        -8.06163,
        4.1
      ],
      [
        -34.87673,
        -8.06156,
        4.9
      ],
      [
        -34.87719,
        -8.06146,
        6.3
      ],
      [
        -34.87806,
        -8.06119,
        8.1
      ],
      [
        -34.87802,
        -8.06075,
        9.8
      ],
      [
        -34.87798,
        -8.06032,
        11.2
      ],
      [
        -34.87828,
        -8.0603,
        11.9
      ],
      [
        -34.87867,
        -8.0603,
        11.9
      ],
      [
        -34.87987,
        -8.05959,
        11.1
      ],
      [
        -34.87992,
        -8.05943,
        9.6
      ],
      [
        -34.88018,
        -8.05851,
        7.9
      ],
      [
        -34.87984,
        -8.05662,
        6.2
      ],
      [
        -34.88045,
        -8.05631,
        4.8
      ],
      [
        -34.88057,
        -8.05642,
        4.1
      ],
      [
        -34.88052,
        -8.05651,
        4.1
      ],
      [
        -34.88054,
        -8.05663,
        5
      ],
      [
        -34.88088,
        -8.0569,
        10
      ]
    ],
    "waypoints": [
      [
        -34.8711,
        -8.0631
      ],
      [
        -34.8808,
        -8.0568
      ]
    ],
    "distanceKm": 1.8,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 93,
    "originName": "Praça do Marco Zero (Recife Antigo)",
    "destName": "Rua da Aurora / Parque Treze de Maio"
  },
  {
    "id": "curated-recife-jaqueira-casa-forte",
    "name": "Parque da Jaqueira → Praça de Casa Forte",
    "description": "Rota arborizada pela Zona Norte conectando a pista de ciclismo do Parque da Jaqueira aos jardins de Burle Marx.",
    "tag": "Zona Norte • PE",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Recife, PE",
    "profile": "safe",
    "coords": [
      [
        -34.90443,
        -8.03724,
        8
      ],
      [
        -34.90463,
        -8.03679,
        9.7
      ],
      [
        -34.90392,
        -8.0361,
        11.1
      ],
      [
        -34.90491,
        -8.03497,
        11.9
      ],
      [
        -34.90572,
        -8.0341,
        11.9
      ],
      [
        -34.90586,
        -8.0343,
        11.1
      ],
      [
        -34.90619,
        -8.03516,
        9.7
      ],
      [
        -34.90678,
        -8.03574,
        8
      ],
      [
        -34.90769,
        -8.03644,
        6.2
      ],
      [
        -34.90817,
        -8.03666,
        4.8
      ],
      [
        -34.90877,
        -8.03687,
        4.1
      ],
      [
        -34.90998,
        -8.03756,
        4.1
      ],
      [
        -34.91036,
        -8.03778,
        4.9
      ],
      [
        -34.91077,
        -8.03785,
        6.3
      ],
      [
        -34.91143,
        -8.03778,
        8.1
      ],
      [
        -34.91272,
        -8.03752,
        9.8
      ],
      [
        -34.91361,
        -8.03735,
        11.2
      ],
      [
        -34.9141,
        -8.03727,
        11.9
      ],
      [
        -34.91462,
        -8.03714,
        11.9
      ],
      [
        -34.91525,
        -8.03757,
        11.1
      ],
      [
        -34.9164,
        -8.03786,
        9.6
      ],
      [
        -34.9171,
        -8.03791,
        7.9
      ],
      [
        -34.91803,
        -8.03795,
        6.2
      ],
      [
        -34.91864,
        -8.03787,
        4.8
      ],
      [
        -34.91928,
        -8.03741,
        4.1
      ],
      [
        -34.91937,
        -8.03663,
        4.1
      ],
      [
        -34.91897,
        -8.03621,
        5
      ],
      [
        -34.91826,
        -8.03462,
        10
      ]
    ],
    "waypoints": [
      [
        -34.9041,
        -8.0372
      ],
      [
        -34.9182,
        -8.0345
      ]
    ],
    "distanceKm": 2.5,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 91,
    "originName": "Parque da Jaqueira (Graças)",
    "destName": "Praça de Casa Forte"
  },
  {
    "id": "curated-natal-ponta-negra-via-costeira",
    "name": "Orla de Ponta Negra → Via Costeira (Parque das Dunas)",
    "description": "Ciclovia panorâmica com vista para o Morro do Careca e as dunas costeiras de Natal.",
    "tag": "Orla & Dunas • RN",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Natal, RN",
    "profile": "safe",
    "coords": [
      [
        -35.17041,
        -5.88226,
        8
      ],
      [
        -35.17203,
        -5.88077,
        9.7
      ],
      [
        -35.1736,
        -5.87893,
        11.1
      ],
      [
        -35.17397,
        -5.87858,
        11.9
      ],
      [
        -35.17495,
        -5.87826,
        11.9
      ],
      [
        -35.17628,
        -5.87807,
        11.1
      ],
      [
        -35.17682,
        -5.87738,
        9.7
      ],
      [
        -35.17855,
        -5.87496,
        8
      ],
      [
        -35.18048,
        -5.87193,
        6.2
      ],
      [
        -35.18134,
        -5.87021,
        4.8
      ],
      [
        -35.18182,
        -5.86924,
        4.1
      ],
      [
        -35.18243,
        -5.86792,
        4.1
      ],
      [
        -35.18224,
        -5.86707,
        4.9
      ],
      [
        -35.18114,
        -5.86601,
        6.3
      ],
      [
        -35.18081,
        -5.86537,
        8.1
      ],
      [
        -35.18072,
        -5.8644,
        9.8
      ],
      [
        -35.18097,
        -5.86245,
        11.2
      ],
      [
        -35.18147,
        -5.85891,
        11.9
      ],
      [
        -35.18209,
        -5.85427,
        11.9
      ],
      [
        -35.18218,
        -5.84943,
        11.1
      ],
      [
        -35.18268,
        -5.84424,
        9.6
      ],
      [
        -35.18255,
        -5.84251,
        7.9
      ],
      [
        -35.18206,
        -5.8394,
        6.2
      ],
      [
        -35.18253,
        -5.83465,
        4.8
      ],
      [
        -35.18298,
        -5.83278,
        4.1
      ],
      [
        -35.18295,
        -5.83154,
        4.1
      ],
      [
        -35.18271,
        -5.82988,
        5
      ],
      [
        -35.18194,
        -5.82848,
        10
      ]
    ],
    "waypoints": [
      [
        -35.1695,
        -5.8812
      ],
      [
        -35.1778,
        -5.8265
      ]
    ],
    "distanceKm": 6.7,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 93,
    "originName": "Calçadão de Ponta Negra (Morro do Careca)",
    "destName": "Farol de Mãe Luíza (Via Costeira)"
  },
  {
    "id": "curated-natal-ufrn-bosque-namorados",
    "name": "Anel Cicloviário UFRN → Bosque dos Namorados",
    "description": "Trajeto seguro pelo anel cicloviário do campus central da UFRN até a entrada do Parque das Dunas.",
    "tag": "Anel UFRN • RN",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Natal, RN",
    "profile": "safe",
    "coords": [
      [
        -35.2008,
        -5.83962,
        8
      ],
      [
        -35.20096,
        -5.83884,
        9.7
      ],
      [
        -35.20108,
        -5.83843,
        11.1
      ],
      [
        -35.2011,
        -5.83756,
        11.9
      ],
      [
        -35.20187,
        -5.83672,
        11.9
      ],
      [
        -35.20221,
        -5.83644,
        11.1
      ],
      [
        -35.20287,
        -5.83557,
        9.7
      ],
      [
        -35.20309,
        -5.83465,
        8
      ],
      [
        -35.20312,
        -5.83406,
        6.2
      ],
      [
        -35.20314,
        -5.83355,
        4.8
      ],
      [
        -35.20317,
        -5.83349,
        4.1
      ],
      [
        -35.20324,
        -5.83267,
        4.1
      ],
      [
        -35.20438,
        -5.83214,
        4.9
      ],
      [
        -35.20406,
        -5.83166,
        6.3
      ],
      [
        -35.20397,
        -5.83145,
        8.1
      ],
      [
        -35.20399,
        -5.83099,
        9.8
      ],
      [
        -35.20445,
        -5.8287,
        11.2
      ],
      [
        -35.2035,
        -5.82558,
        11.9
      ],
      [
        -35.20288,
        -5.82377,
        11.9
      ],
      [
        -35.20223,
        -5.82225,
        11.1
      ],
      [
        -35.20219,
        -5.82213,
        9.6
      ],
      [
        -35.2017,
        -5.82071,
        7.9
      ],
      [
        -35.20106,
        -5.81901,
        6.2
      ],
      [
        -35.20048,
        -5.81741,
        4.8
      ],
      [
        -35.19992,
        -5.81581,
        4.1
      ],
      [
        -35.19953,
        -5.81486,
        4.1
      ],
      [
        -35.19915,
        -5.81381,
        5
      ],
      [
        -35.19736,
        -5.8128,
        10
      ]
    ],
    "waypoints": [
      [
        -35.2008,
        -5.8396
      ],
      [
        -35.1972,
        -5.8124
      ]
    ],
    "distanceKm": 3.4,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 95,
    "originName": "Reitoria UFRN (Lagoa Nova)",
    "destName": "Bosque dos Namorados (Parque das Dunas)"
  },
  {
    "id": "curated-natal-praia-meio-forte-reis-magos",
    "name": "Praia dos Artistas → Forte dos Reis Magos",
    "description": "Passeio beira-mar pela Praia do Meio e Praia do Forte até a fortaleza histórica na foz do Rio Potengi.",
    "tag": "Orla Histórica • RN",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Natal, RN",
    "profile": "safe",
    "coords": [
      [
        -35.19343,
        -5.77985,
        8
      ],
      [
        -35.19351,
        -5.77961,
        9.7
      ],
      [
        -35.19427,
        -5.77592,
        11.1
      ],
      [
        -35.19457,
        -5.7747,
        11.9
      ],
      [
        -35.19483,
        -5.7734,
        11.9
      ],
      [
        -35.195,
        -5.77295,
        11.1
      ],
      [
        -35.19554,
        -5.7704,
        9.7
      ],
      [
        -35.19576,
        -5.76987,
        8
      ],
      [
        -35.19617,
        -5.76932,
        6.2
      ],
      [
        -35.19644,
        -5.76842,
        4.8
      ],
      [
        -35.19648,
        -5.76783,
        4.1
      ],
      [
        -35.19646,
        -5.76753,
        4.1
      ],
      [
        -35.19651,
        -5.7655,
        4.9
      ],
      [
        -35.19665,
        -5.76481,
        6.3
      ],
      [
        -35.19678,
        -5.76397,
        8.1
      ],
      [
        -35.19679,
        -5.76332,
        9.8
      ],
      [
        -35.19679,
        -5.76259,
        11.2
      ],
      [
        -35.19659,
        -5.76172,
        11.9
      ],
      [
        -35.19582,
        -5.76044,
        11.9
      ],
      [
        -35.19569,
        -5.76008,
        11.1
      ],
      [
        -35.19592,
        -5.7596,
        9.6
      ],
      [
        -35.19621,
        -5.75935,
        7.9
      ],
      [
        -35.19656,
        -5.75914,
        6.2
      ],
      [
        -35.19798,
        -5.75797,
        4.8
      ],
      [
        -35.19788,
        -5.75665,
        4.1
      ],
      [
        -35.19661,
        -5.75607,
        4.1
      ],
      [
        -35.19527,
        -5.75649,
        5
      ],
      [
        -35.19501,
        -5.7566,
        10
      ]
    ],
    "waypoints": [
      [
        -35.1932,
        -5.7798
      ],
      [
        -35.1948,
        -5.7568
      ]
    ],
    "distanceKm": 3.1,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 92,
    "originName": "Praia dos Artistas (Areia Preta)",
    "destName": "Forte dos Reis Magos (Praia do Forte)"
  },
  {
    "id": "curated-jp-tambau-cabo-branco",
    "name": "Orla de Tambaú → Farol do Cabo Branco (Ponto Mais Oriental)",
    "description": "Ciclovia costeira interditada para carros nas manhãs, ligando o Busto de Tamandaré à falésia do Cabo Branco.",
    "tag": "Orla Cabo Branco • PB",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "João Pessoa, PB",
    "profile": "safe",
    "coords": [
      [
        -34.82358,
        -7.11888,
        8
      ],
      [
        -34.82388,
        -7.1208,
        9.7
      ],
      [
        -34.82392,
        -7.12289,
        11.1
      ],
      [
        -34.82358,
        -7.12616,
        11.9
      ],
      [
        -34.82269,
        -7.12936,
        11.9
      ],
      [
        -34.82133,
        -7.1328,
        11.1
      ],
      [
        -34.8199,
        -7.13541,
        9.7
      ],
      [
        -34.81816,
        -7.13788,
        8
      ],
      [
        -34.81716,
        -7.13911,
        6.2
      ],
      [
        -34.81576,
        -7.14073,
        4.8
      ],
      [
        -34.81508,
        -7.14149,
        4.1
      ],
      [
        -34.81344,
        -7.14317,
        4.1
      ],
      [
        -34.81157,
        -7.14475,
        4.9
      ],
      [
        -34.80927,
        -7.14586,
        6.3
      ],
      [
        -34.80917,
        -7.14608,
        8.1
      ],
      [
        -34.80897,
        -7.14606,
        9.8
      ],
      [
        -34.80822,
        -7.14608,
        11.2
      ],
      [
        -34.8076,
        -7.146,
        11.9
      ],
      [
        -34.80686,
        -7.14566,
        11.9
      ],
      [
        -34.80602,
        -7.14559,
        11.1
      ],
      [
        -34.80246,
        -7.14625,
        9.6
      ],
      [
        -34.8028,
        -7.14646,
        7.9
      ],
      [
        -34.80214,
        -7.14642,
        6.2
      ],
      [
        -34.80149,
        -7.14638,
        4.8
      ],
      [
        -34.79911,
        -7.14681,
        4.1
      ],
      [
        -34.79895,
        -7.14682,
        4.1
      ],
      [
        -34.79885,
        -7.14765,
        5
      ],
      [
        -34.79818,
        -7.14838,
        10
      ]
    ],
    "waypoints": [
      [
        -34.8235,
        -7.1189
      ],
      [
        -34.7982,
        -7.1485
      ]
    ],
    "distanceKm": 5.1,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 98,
    "originName": "Busto de Tamandaré (Praia de Tambaú)",
    "destName": "Farol do Cabo Branco / Estação Ciência"
  },
  {
    "id": "curated-jp-epitacio-lagoa",
    "name": "Av. Epitácio Pessoa → Parque Solon de Lucena (Lagoa)",
    "description": "Eixo principal da capital paraibana conectando a orla marítima ao anel cicloviário da Lagoa no Centro.",
    "tag": "Eixo Epitácio • PB",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "João Pessoa, PB",
    "profile": "safe",
    "coords": [
      [
        -34.8648,
        -7.1187,
        8
      ],
      [
        -34.86586,
        -7.11869,
        9.7
      ],
      [
        -34.86752,
        -7.11872,
        11.1
      ],
      [
        -34.86801,
        -7.11868,
        11.9
      ],
      [
        -34.86827,
        -7.11861,
        11.9
      ],
      [
        -34.86881,
        -7.11832,
        11.1
      ],
      [
        -34.86918,
        -7.11812,
        9.7
      ],
      [
        -34.86996,
        -7.11765,
        8
      ],
      [
        -34.87093,
        -7.11711,
        6.2
      ],
      [
        -34.87183,
        -7.11658,
        4.8
      ],
      [
        -34.87227,
        -7.11632,
        4.1
      ],
      [
        -34.87281,
        -7.11601,
        4.1
      ],
      [
        -34.87379,
        -7.11544,
        4.9
      ],
      [
        -34.87418,
        -7.11524,
        6.3
      ],
      [
        -34.87565,
        -7.11583,
        8.1
      ],
      [
        -34.8758,
        -7.11601,
        9.8
      ],
      [
        -34.87622,
        -7.11714,
        11.2
      ],
      [
        -34.87651,
        -7.11791,
        11.9
      ],
      [
        -34.877,
        -7.11903,
        11.9
      ],
      [
        -34.87745,
        -7.12011,
        11.1
      ],
      [
        -34.8776,
        -7.12044,
        9.6
      ],
      [
        -34.87792,
        -7.12055,
        7.9
      ],
      [
        -34.87886,
        -7.1203,
        6.2
      ],
      [
        -34.87903,
        -7.1203,
        4.8
      ],
      [
        -34.87922,
        -7.12101,
        4.1
      ],
      [
        -34.87955,
        -7.12153,
        4.1
      ],
      [
        -34.88026,
        -7.12151,
        5
      ],
      [
        -34.88097,
        -7.12091,
        10
      ]
    ],
    "waypoints": [
      [
        -34.8648,
        -7.1185
      ],
      [
        -34.8812,
        -7.1211
      ]
    ],
    "distanceKm": 2.4,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 90,
    "originName": "Praça da Independência (Tambiá)",
    "destName": "Parque Solon de Lucena (Lagoa)"
  },
  {
    "id": "curated-jp-bessa-manaira",
    "name": "Ciclovia Orla de Manaíra → Parque Parahyba (Bessa)",
    "description": "Percurso litorâneo plano pela Praia de Manaíra até as praças arborizadas do Parque Parahyba no Bessa.",
    "tag": "Manaíra & Bessa • PB",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "João Pessoa, PB",
    "profile": "safe",
    "coords": [
      [
        -34.83286,
        -7.09851,
        8
      ],
      [
        -34.833,
        -7.09819,
        9.7
      ],
      [
        -34.83332,
        -7.09723,
        11.1
      ],
      [
        -34.83342,
        -7.09716,
        11.9
      ],
      [
        -34.83383,
        -7.09716,
        11.9
      ],
      [
        -34.83422,
        -7.09719,
        11.1
      ],
      [
        -34.83448,
        -7.09722,
        9.7
      ],
      [
        -34.83462,
        -7.09708,
        8
      ],
      [
        -34.83462,
        -7.09564,
        6.2
      ],
      [
        -34.83461,
        -7.09312,
        4.8
      ],
      [
        -34.83454,
        -7.09195,
        4.1
      ],
      [
        -34.83452,
        -7.09132,
        4.1
      ],
      [
        -34.83438,
        -7.08937,
        4.9
      ],
      [
        -34.83407,
        -7.08757,
        6.3
      ],
      [
        -34.8338,
        -7.08665,
        8.1
      ],
      [
        -34.83369,
        -7.08611,
        9.8
      ],
      [
        -34.83346,
        -7.08538,
        11.2
      ],
      [
        -34.8325,
        -7.08299,
        11.9
      ],
      [
        -34.83215,
        -7.08206,
        11.9
      ],
      [
        -34.8316,
        -7.08092,
        11.1
      ],
      [
        -34.83088,
        -7.07906,
        9.6
      ],
      [
        -34.83063,
        -7.07654,
        7.9
      ],
      [
        -34.8307,
        -7.07523,
        6.2
      ],
      [
        -34.83084,
        -7.07449,
        4.8
      ],
      [
        -34.83115,
        -7.07358,
        4.1
      ],
      [
        -34.83226,
        -7.07349,
        4.1
      ],
      [
        -34.83496,
        -7.07443,
        5
      ],
      [
        -34.83583,
        -7.07506,
        10
      ]
    ],
    "waypoints": [
      [
        -34.8318,
        -7.0982
      ],
      [
        -34.8358,
        -7.0752
      ]
    ],
    "distanceKm": 3.6,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 94,
    "originName": "Orla de Manaíra (Mag Shopping)",
    "destName": "Parque Parahyba I (Bessa)"
  },
  {
    "id": "curated-maceio-pajucara-jatiuca",
    "name": "Orla Marítima: Pajuçara → Farol da Ponta Verde & Jatiúca",
    "description": "Ciclovia beira-mar de águas turquesas passando pelas piscinas naturais de Pajuçara e o Marco dos Corais.",
    "tag": "Caribe Brasileiro • AL",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Maceió, AL",
    "profile": "safe",
    "coords": [
      [
        -35.71578,
        -9.67225,
        8
      ],
      [
        -35.71637,
        -9.67215,
        9.7
      ],
      [
        -35.71539,
        -9.67036,
        11.1
      ],
      [
        -35.71452,
        -9.66911,
        11.9
      ],
      [
        -35.71388,
        -9.66833,
        11.9
      ],
      [
        -35.71353,
        -9.6679,
        11.1
      ],
      [
        -35.71266,
        -9.66711,
        9.7
      ],
      [
        -35.71189,
        -9.66642,
        8
      ],
      [
        -35.71122,
        -9.66591,
        6.2
      ],
      [
        -35.70933,
        -9.66463,
        4.8
      ],
      [
        -35.70875,
        -9.6643,
        4.1
      ],
      [
        -35.70813,
        -9.66403,
        4.1
      ],
      [
        -35.70717,
        -9.66371,
        4.9
      ],
      [
        -35.70584,
        -9.6634,
        6.3
      ],
      [
        -35.7035,
        -9.66333,
        8.1
      ],
      [
        -35.70302,
        -9.66205,
        9.8
      ],
      [
        -35.70301,
        -9.65951,
        11.2
      ],
      [
        -35.7015,
        -9.65892,
        11.9
      ],
      [
        -35.69918,
        -9.65892,
        11.9
      ],
      [
        -35.69825,
        -9.65877,
        11.1
      ],
      [
        -35.69824,
        -9.65863,
        9.6
      ],
      [
        -35.69844,
        -9.65668,
        7.9
      ],
      [
        -35.69857,
        -9.65554,
        6.2
      ],
      [
        -35.69958,
        -9.65055,
        4.8
      ],
      [
        -35.69982,
        -9.64959,
        4.1
      ],
      [
        -35.70002,
        -9.64899,
        4.1
      ],
      [
        -35.70002,
        -9.64854,
        5
      ],
      [
        -35.69998,
        -9.64787,
        10
      ]
    ],
    "waypoints": [
      [
        -35.7145,
        -9.6731
      ],
      [
        -35.6992,
        -9.6481
      ]
    ],
    "distanceKm": 4.1,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 98,
    "originName": "Feirinha de Artesanato da Pajuçara",
    "destName": "Orla de Jatiúca / Cruz das Almas"
  },
  {
    "id": "curated-maceio-jaragua-pontal",
    "name": "Porto de Jaraguá → Orla Lagunar & Pontal da Barra",
    "description": "Rota histórica do bairro de Jaraguá até o polo das rendeiras no Pontal da Barra.",
    "tag": "Jaraguá & Lagoa • AL",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Maceió, AL",
    "profile": "safe",
    "coords": [
      [
        -35.7246,
        -9.67316,
        8
      ],
      [
        -35.72436,
        -9.67258,
        9.7
      ],
      [
        -35.72544,
        -9.67275,
        11.1
      ],
      [
        -35.72635,
        -9.67213,
        11.9
      ],
      [
        -35.72741,
        -9.67126,
        11.9
      ],
      [
        -35.72839,
        -9.67097,
        11.1
      ],
      [
        -35.72954,
        -9.67048,
        9.7
      ],
      [
        -35.7301,
        -9.67015,
        8
      ],
      [
        -35.7307,
        -9.67004,
        6.2
      ],
      [
        -35.73172,
        -9.66989,
        4.8
      ],
      [
        -35.7333,
        -9.66972,
        4.1
      ],
      [
        -35.73493,
        -9.6699,
        4.1
      ],
      [
        -35.73567,
        -9.66998,
        4.9
      ],
      [
        -35.73748,
        -9.67016,
        6.3
      ],
      [
        -35.74077,
        -9.6706,
        8.1
      ],
      [
        -35.74406,
        -9.67161,
        9.8
      ],
      [
        -35.74767,
        -9.67301,
        11.2
      ],
      [
        -35.75257,
        -9.67574,
        11.9
      ],
      [
        -35.75569,
        -9.67781,
        11.9
      ],
      [
        -35.75805,
        -9.67938,
        11.1
      ],
      [
        -35.76112,
        -9.68174,
        9.6
      ],
      [
        -35.76245,
        -9.68295,
        7.9
      ],
      [
        -35.76333,
        -9.68378,
        6.2
      ],
      [
        -35.76623,
        -9.68666,
        4.8
      ],
      [
        -35.76844,
        -9.68862,
        4.1
      ],
      [
        -35.76994,
        -9.69015,
        4.1
      ],
      [
        -35.77201,
        -9.69222,
        5
      ],
      [
        -35.77272,
        -9.69282,
        10
      ]
    ],
    "waypoints": [
      [
        -35.7248,
        -9.6738
      ],
      [
        -35.7695,
        -9.6962
      ]
    ],
    "distanceKm": 6.3,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 90,
    "originName": "Praça Marcílio Dias (Jaraguá)",
    "destName": "Pontal da Barra (Orla Lagunar)"
  },
  {
    "id": "curated-maceio-ufal-fernandes-lima",
    "name": "Canteiro Central Av. Fernandes Lima (Farol → UFAL)",
    "description": "Ciclovia estruturante da parte alta de Maceió ligando a Praça do Centenário à Cidade Universitária.",
    "tag": "Eixo Fernandes Lima • AL",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Maceió, AL",
    "profile": "safe",
    "coords": [
      [
        -35.73899,
        -9.63965,
        8
      ],
      [
        -35.73939,
        -9.63962,
        9.7
      ],
      [
        -35.74104,
        -9.64034,
        11.1
      ],
      [
        -35.74056,
        -9.64145,
        11.9
      ],
      [
        -35.74002,
        -9.64247,
        11.9
      ],
      [
        -35.7402,
        -9.64234,
        11.1
      ],
      [
        -35.7409,
        -9.64242,
        9.7
      ],
      [
        -35.74114,
        -9.64287,
        8
      ],
      [
        -35.74203,
        -9.64349,
        6.2
      ],
      [
        -35.74318,
        -9.64405,
        4.8
      ],
      [
        -35.74377,
        -9.64421,
        4.1
      ],
      [
        -35.74405,
        -9.64571,
        4.1
      ],
      [
        -35.7441,
        -9.64648,
        4.9
      ],
      [
        -35.74415,
        -9.6482,
        6.3
      ],
      [
        -35.74343,
        -9.6496,
        8.1
      ],
      [
        -35.74244,
        -9.65121,
        9.8
      ],
      [
        -35.74174,
        -9.65245,
        11.2
      ],
      [
        -35.74098,
        -9.65443,
        11.9
      ],
      [
        -35.74014,
        -9.65658,
        11.9
      ],
      [
        -35.73981,
        -9.65793,
        11.1
      ],
      [
        -35.74073,
        -9.65904,
        9.6
      ],
      [
        -35.74088,
        -9.65979,
        7.9
      ],
      [
        -35.74073,
        -9.66133,
        6.2
      ],
      [
        -35.74053,
        -9.66353,
        4.8
      ],
      [
        -35.7387,
        -9.6661,
        4.1
      ],
      [
        -35.7372,
        -9.66566,
        4.1
      ],
      [
        -35.73653,
        -9.66559,
        5
      ],
      [
        -35.73515,
        -9.66602,
        10
      ]
    ],
    "waypoints": [
      [
        -35.7385,
        -9.6392
      ],
      [
        -35.7351,
        -9.6661
      ]
    ],
    "distanceKm": 4,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 88,
    "originName": "Praça do Centenário (Farol)",
    "destName": "Praça Visconde de Sinimbu / Centro"
  },
  {
    "id": "curated-aracaju-orla-atalaia",
    "name": "Ciclovia Orla de Atalaia (Arcos da Orla → Passarela do Caranguejo)",
    "description": "Considerada uma das melhores orlas cicloviárias do Nordeste, totalmente plana, larga e segregada.",
    "tag": "Orla de Atalaia • SE",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Aracaju, SE",
    "profile": "safe",
    "coords": [
      [
        -37.03991,
        -10.97642,
        8
      ],
      [
        -37.04048,
        -10.97724,
        9.7
      ],
      [
        -37.04055,
        -10.97719,
        11.1
      ],
      [
        -37.04131,
        -10.97809,
        11.9
      ],
      [
        -37.04146,
        -10.9783,
        11.9
      ],
      [
        -37.04228,
        -10.97948,
        11.1
      ],
      [
        -37.04237,
        -10.97961,
        9.7
      ],
      [
        -37.04337,
        -10.98102,
        8
      ],
      [
        -37.0443,
        -10.98233,
        6.2
      ],
      [
        -37.04518,
        -10.98356,
        4.8
      ],
      [
        -37.04523,
        -10.98362,
        4.1
      ],
      [
        -37.04557,
        -10.98415,
        4.1
      ],
      [
        -37.04583,
        -10.98455,
        4.9
      ],
      [
        -37.0461,
        -10.98495,
        6.3
      ],
      [
        -37.04628,
        -10.98522,
        8.1
      ],
      [
        -37.04737,
        -10.98683,
        9.8
      ],
      [
        -37.04824,
        -10.98802,
        11.2
      ],
      [
        -37.0487,
        -10.98867,
        11.9
      ],
      [
        -37.04902,
        -10.98913,
        11.9
      ],
      [
        -37.04982,
        -10.99024,
        11.1
      ],
      [
        -37.05077,
        -10.99148,
        9.6
      ],
      [
        -37.05144,
        -10.9924,
        7.9
      ],
      [
        -37.05161,
        -10.99262,
        6.2
      ],
      [
        -37.05251,
        -10.99388,
        4.8
      ],
      [
        -37.05246,
        -10.99391,
        4.1
      ],
      [
        -37.05233,
        -10.99401,
        4.1
      ],
      [
        -37.05208,
        -10.99368,
        5
      ],
      [
        -37.05171,
        -10.99388,
        10
      ]
    ],
    "waypoints": [
      [
        -37.0398,
        -10.9765
      ],
      [
        -37.0512,
        -10.9942
      ]
    ],
    "distanceKm": 2.5,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 98,
    "originName": "Oceanário / Arcos da Orla de Atalaia",
    "destName": "Passarela do Caranguejo (Atalaia)"
  },
  {
    "id": "curated-aracaju-13-julho-sementeira",
    "name": "Mirante da 13 de Julho → Parque da Sementeira",
    "description": "Ciclovia beira-rio pelo manguezal da Praia 13 de Julho até o circuito interno do Parque da Sementeira.",
    "tag": "Rio Sergipe & Parque • SE",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Aracaju, SE",
    "profile": "safe",
    "coords": [
      [
        -37.04756,
        -10.93231,
        8
      ],
      [
        -37.0477,
        -10.9322,
        9.7
      ],
      [
        -37.04782,
        -10.93221,
        11.1
      ],
      [
        -37.0483,
        -10.93253,
        11.9
      ],
      [
        -37.04894,
        -10.93309,
        11.9
      ],
      [
        -37.04933,
        -10.93358,
        11.1
      ],
      [
        -37.04979,
        -10.93436,
        9.7
      ],
      [
        -37.05,
        -10.93511,
        8
      ],
      [
        -37.05019,
        -10.93575,
        6.2
      ],
      [
        -37.05043,
        -10.93702,
        4.8
      ],
      [
        -37.0505,
        -10.93786,
        4.1
      ],
      [
        -37.05059,
        -10.93839,
        4.1
      ],
      [
        -37.0506,
        -10.93968,
        4.9
      ],
      [
        -37.0504,
        -10.94057,
        6.3
      ],
      [
        -37.0505,
        -10.94067,
        8.1
      ],
      [
        -37.0508,
        -10.94139,
        9.8
      ],
      [
        -37.05107,
        -10.94202,
        11.2
      ],
      [
        -37.05116,
        -10.94397,
        11.9
      ],
      [
        -37.05145,
        -10.94409,
        11.9
      ],
      [
        -37.05161,
        -10.94407,
        11.1
      ],
      [
        -37.05568,
        -10.94291,
        9.6
      ],
      [
        -37.05624,
        -10.94269,
        7.9
      ],
      [
        -37.05638,
        -10.94283,
        6.2
      ],
      [
        -37.05633,
        -10.94312,
        4.8
      ],
      [
        -37.05635,
        -10.94342,
        4.1
      ],
      [
        -37.0569,
        -10.94536,
        4.1
      ],
      [
        -37.05667,
        -10.94526,
        5
      ],
      [
        -37.05691,
        -10.94607,
        10
      ]
    ],
    "waypoints": [
      [
        -37.0472,
        -10.9331
      ],
      [
        -37.0568,
        -10.9461
      ]
    ],
    "distanceKm": 2.5,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 96,
    "originName": "Calçadão e Mirante da 13 de Julho",
    "destName": "Parque Augusto Franco (Sementeira)"
  },
  {
    "id": "curated-aracaju-mercados-centro",
    "name": "Mercados Municipais → Orla do Bairro Industrial",
    "description": "Passeio plano às margens do estuário do Rio Sergipe com vista para a Ponte Construtor João Alves.",
    "tag": "Orla Centro • SE",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Aracaju, SE",
    "profile": "safe",
    "coords": [
      [
        -37.0488,
        -10.90934,
        8
      ],
      [
        -37.04802,
        -10.90896,
        9.7
      ],
      [
        -37.04792,
        -10.90884,
        11.1
      ],
      [
        -37.04797,
        -10.90822,
        11.9
      ],
      [
        -37.04798,
        -10.90773,
        11.9
      ],
      [
        -37.04803,
        -10.90754,
        11.1
      ],
      [
        -37.04809,
        -10.90711,
        9.7
      ],
      [
        -37.04812,
        -10.90565,
        8
      ],
      [
        -37.04812,
        -10.9051,
        6.2
      ],
      [
        -37.04813,
        -10.90437,
        4.8
      ],
      [
        -37.04815,
        -10.90363,
        4.1
      ],
      [
        -37.04813,
        -10.90307,
        4.1
      ],
      [
        -37.04816,
        -10.90276,
        4.9
      ],
      [
        -37.04825,
        -10.90259,
        6.3
      ],
      [
        -37.0484,
        -10.90245,
        8.1
      ],
      [
        -37.04874,
        -10.90221,
        9.8
      ],
      [
        -37.0488,
        -10.90196,
        11.2
      ],
      [
        -37.0489,
        -10.89938,
        11.9
      ],
      [
        -37.04897,
        -10.89776,
        11.9
      ],
      [
        -37.04886,
        -10.89711,
        11.1
      ],
      [
        -37.04881,
        -10.89683,
        9.6
      ],
      [
        -37.04894,
        -10.89626,
        7.9
      ],
      [
        -37.04901,
        -10.89591,
        6.2
      ],
      [
        -37.04908,
        -10.89516,
        4.8
      ],
      [
        -37.04909,
        -10.89507,
        4.1
      ],
      [
        -37.04889,
        -10.89365,
        4.1
      ],
      [
        -37.04873,
        -10.89267,
        5
      ],
      [
        -37.0486,
        -10.89228,
        10
      ]
    ],
    "waypoints": [
      [
        -37.0488,
        -10.9092
      ],
      [
        -37.0482,
        -10.8924
      ]
    ],
    "distanceKm": 2,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 93,
    "originName": "Mercado Thales Ferraz (Centro Histórico)",
    "destName": "Orla do Bairro Industrial (Ponte Aracaju-Barra)"
  },
  {
    "id": "curated-teresina-raul-lopes-estaiada",
    "name": "Ciclovia Av. Raul Lopes (Potycabana → Complexo Ponte Estaiada)",
    "description": "Ciclovia arborizada às margens do Rio Poti ligando o Parque Potycabana ao mirante da Ponte Estaiada.",
    "tag": "Margem Rio Poti • PI",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Teresina, PI",
    "profile": "safe",
    "coords": [
      [
        -42.7905,
        -5.08719,
        8
      ],
      [
        -42.79036,
        -5.08716,
        9.7
      ],
      [
        -42.79026,
        -5.08703,
        11.1
      ],
      [
        -42.79022,
        -5.08678,
        11.9
      ],
      [
        -42.79033,
        -5.08664,
        11.9
      ],
      [
        -42.79069,
        -5.08621,
        11.1
      ],
      [
        -42.79106,
        -5.08566,
        9.7
      ],
      [
        -42.79131,
        -5.08531,
        8
      ],
      [
        -42.79251,
        -5.08345,
        6.2
      ],
      [
        -42.79269,
        -5.0831,
        4.8
      ],
      [
        -42.79291,
        -5.08253,
        4.1
      ],
      [
        -42.79325,
        -5.08234,
        4.1
      ],
      [
        -42.79353,
        -5.08212,
        4.9
      ],
      [
        -42.79375,
        -5.0817,
        6.3
      ],
      [
        -42.79414,
        -5.08088,
        8.1
      ],
      [
        -42.79432,
        -5.08069,
        9.8
      ],
      [
        -42.79469,
        -5.08046,
        11.2
      ],
      [
        -42.79503,
        -5.08015,
        11.9
      ],
      [
        -42.79547,
        -5.07968,
        11.9
      ],
      [
        -42.79587,
        -5.07911,
        11.1
      ],
      [
        -42.79657,
        -5.0779,
        9.6
      ],
      [
        -42.79668,
        -5.07782,
        7.9
      ],
      [
        -42.79715,
        -5.07709,
        6.2
      ],
      [
        -42.79609,
        -5.07601,
        4.8
      ],
      [
        -42.79658,
        -5.07429,
        4.1
      ],
      [
        -42.79726,
        -5.07209,
        4.1
      ],
      [
        -42.79816,
        -5.07096,
        5
      ],
      [
        -42.79861,
        -5.06942,
        10
      ]
    ],
    "waypoints": [
      [
        -42.7905,
        -5.0872
      ],
      [
        -42.7989,
        -5.0695
      ]
    ],
    "distanceKm": 2.4,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 96,
    "originName": "Parque Potycabana (Noivos)",
    "destName": "Complexo Turístico Ponte Estaiada"
  },
  {
    "id": "curated-teresina-cidadania-ufpi",
    "name": "Parque da Cidadania → Campus UFPI (Ininga)",
    "description": "Conexão entre o Parque da Cidadania (antiga estação ferroviária) e o campus arborizado da UFPI.",
    "tag": "Eixo Universitário • PI",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Teresina, PI",
    "profile": "safe",
    "coords": [
      [
        -42.80537,
        -5.08518,
        8
      ],
      [
        -42.8051,
        -5.08446,
        9.7
      ],
      [
        -42.80494,
        -5.08351,
        11.1
      ],
      [
        -42.80604,
        -5.08231,
        11.9
      ],
      [
        -42.8071,
        -5.08168,
        11.9
      ],
      [
        -42.80766,
        -5.08131,
        11.1
      ],
      [
        -42.80653,
        -5.07867,
        9.7
      ],
      [
        -42.80692,
        -5.07771,
        8
      ],
      [
        -42.80744,
        -5.07686,
        6.2
      ],
      [
        -42.80833,
        -5.07508,
        4.8
      ],
      [
        -42.80931,
        -5.07304,
        4.1
      ],
      [
        -42.80691,
        -5.07184,
        4.1
      ],
      [
        -42.80499,
        -5.071,
        4.9
      ],
      [
        -42.80177,
        -5.06972,
        6.3
      ],
      [
        -42.79953,
        -5.06924,
        8.1
      ],
      [
        -42.79867,
        -5.06921,
        9.8
      ],
      [
        -42.79796,
        -5.06952,
        11.2
      ],
      [
        -42.79721,
        -5.06986,
        11.9
      ],
      [
        -42.79602,
        -5.06989,
        11.9
      ],
      [
        -42.79429,
        -5.06993,
        11.1
      ],
      [
        -42.79252,
        -5.06998,
        9.6
      ],
      [
        -42.79264,
        -5.06919,
        7.9
      ],
      [
        -42.79314,
        -5.06729,
        6.2
      ],
      [
        -42.7939,
        -5.06441,
        4.8
      ],
      [
        -42.79423,
        -5.06316,
        4.1
      ],
      [
        -42.794,
        -5.06182,
        4.1
      ],
      [
        -42.79179,
        -5.05981,
        5
      ],
      [
        -42.78917,
        -5.058,
        10
      ]
    ],
    "waypoints": [
      [
        -42.8054,
        -5.0852
      ],
      [
        -42.7892,
        -5.0581
      ]
    ],
    "distanceKm": 5.2,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 90,
    "originName": "Parque da Cidadania (Av. Frei Serafim)",
    "destName": "Reitoria UFPI (Ininga)"
  },
  {
    "id": "curated-teresina-encontro-rios",
    "name": "Parque Lagoas do Norte → Encontro dos Rios (Poti & Parnaíba)",
    "description": "Trajeto ecológico pela zona norte de Teresina até o monumento do Cabeça de Cuia no Encontro dos Rios.",
    "tag": "Encontro dos Rios • PI",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Teresina, PI",
    "profile": "safe",
    "coords": [
      [
        -42.82128,
        -5.05274,
        8
      ],
      [
        -42.8217,
        -5.05189,
        9.7
      ],
      [
        -42.82273,
        -5.04975,
        11.1
      ],
      [
        -42.82289,
        -5.0493,
        11.9
      ],
      [
        -42.82305,
        -5.04877,
        11.9
      ],
      [
        -42.8232,
        -5.04854,
        11.1
      ],
      [
        -42.82357,
        -5.04822,
        9.7
      ],
      [
        -42.82382,
        -5.04775,
        8
      ],
      [
        -42.82446,
        -5.04756,
        6.2
      ],
      [
        -42.8255,
        -5.04785,
        4.8
      ],
      [
        -42.82582,
        -5.04752,
        4.1
      ],
      [
        -42.82606,
        -5.04715,
        4.1
      ],
      [
        -42.82756,
        -5.04439,
        4.9
      ],
      [
        -42.82777,
        -5.04397,
        6.3
      ],
      [
        -42.82787,
        -5.04369,
        8.1
      ],
      [
        -42.82789,
        -5.04322,
        9.8
      ],
      [
        -42.82791,
        -5.04255,
        11.2
      ],
      [
        -42.828,
        -5.04049,
        11.9
      ],
      [
        -42.82803,
        -5.03947,
        11.9
      ],
      [
        -42.82837,
        -5.03702,
        11.1
      ],
      [
        -42.82851,
        -5.03621,
        9.6
      ],
      [
        -42.82903,
        -5.03258,
        7.9
      ],
      [
        -42.82924,
        -5.03135,
        6.2
      ],
      [
        -42.8296,
        -5.0315,
        4.8
      ],
      [
        -42.8308,
        -5.03209,
        4.1
      ],
      [
        -42.83146,
        -5.03222,
        4.1
      ],
      [
        -42.83275,
        -5.03253,
        5
      ],
      [
        -42.83388,
        -5.03262,
        10
      ]
    ],
    "waypoints": [
      [
        -42.8214,
        -5.0528
      ],
      [
        -42.8338,
        -5.0338
      ]
    ],
    "distanceKm": 3.3,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 89,
    "originName": "Parque Ambiental Lagoas do Norte",
    "destName": "Parque Ambiental Encontro dos Rios"
  },
  {
    "id": "curated-slz-litoranea-calhau",
    "name": "Ciclovia Av. Litorânea (Praia de São Marcos → Calhau)",
    "description": "Ciclovia costeira ventilada ao longo das dunas e praias de São Marcos e Calhau.",
    "tag": "Av. Litorânea • MA",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "São Luís, MA",
    "profile": "safe",
    "coords": [
      [
        -44.2833,
        -2.4883,
        8
      ],
      [
        -44.28239,
        -2.48838,
        9.7
      ],
      [
        -44.2816,
        -2.48836,
        11.1
      ],
      [
        -44.27867,
        -2.48837,
        11.9
      ],
      [
        -44.27664,
        -2.48839,
        11.9
      ],
      [
        -44.2742,
        -2.48809,
        11.1
      ],
      [
        -44.27284,
        -2.48789,
        9.7
      ],
      [
        -44.27186,
        -2.48766,
        8
      ],
      [
        -44.27112,
        -2.48734,
        6.2
      ],
      [
        -44.26977,
        -2.48655,
        4.8
      ],
      [
        -44.26918,
        -2.48633,
        4.1
      ],
      [
        -44.26877,
        -2.48635,
        4.1
      ],
      [
        -44.26828,
        -2.48645,
        4.9
      ],
      [
        -44.26807,
        -2.48643,
        6.3
      ],
      [
        -44.26774,
        -2.48629,
        8.1
      ],
      [
        -44.26754,
        -2.48614,
        9.8
      ],
      [
        -44.26692,
        -2.48574,
        11.2
      ],
      [
        -44.26652,
        -2.48561,
        11.9
      ],
      [
        -44.26542,
        -2.4853,
        11.9
      ],
      [
        -44.26403,
        -2.48475,
        11.1
      ],
      [
        -44.26232,
        -2.48408,
        9.6
      ],
      [
        -44.26066,
        -2.48377,
        7.9
      ],
      [
        -44.25892,
        -2.48346,
        6.2
      ],
      [
        -44.25659,
        -2.4832,
        4.8
      ],
      [
        -44.25603,
        -2.48319,
        4.1
      ],
      [
        -44.25524,
        -2.48326,
        4.1
      ],
      [
        -44.25413,
        -2.4834,
        5
      ],
      [
        -44.25425,
        -2.48322,
        10
      ]
    ],
    "waypoints": [
      [
        -44.2835,
        -2.4865
      ],
      [
        -44.2542,
        -2.4828
      ]
    ],
    "distanceKm": 3.4,
    "ascentM": 18,
    "descentM": 16,
    "safetyScore": 95,
    "originName": "Praça dos Pescadores (Praia de São Marcos)",
    "destName": "Orla da Praia do Calhau"
  },
  {
    "id": "curated-slz-lagoa-jansen-espigao",
    "name": "Volta da Lagoa da Jansen → Espigão Costeiro (Ponta d’Areia)",
    "description": "Percurso plano ao redor do Parque Ecológico da Lagoa da Jansen até o pôr do sol no Espigão Costeiro.",
    "tag": "Lagoa & Espigão • MA",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "São Luís, MA",
    "profile": "safe",
    "coords": [
      [
        -44.29824,
        -2.49657,
        15.3
      ],
      [
        -44.29805,
        -2.49663,
        16.3
      ],
      [
        -44.29794,
        -2.49651,
        15.5
      ],
      [
        -44.29657,
        -2.49642,
        12
      ],
      [
        -44.29605,
        -2.49616,
        8.5
      ],
      [
        -44.29574,
        -2.49567,
        4.3
      ],
      [
        -44.29539,
        -2.49492,
        5.5
      ],
      [
        -44.29497,
        -2.49468,
        6
      ],
      [
        -44.29438,
        -2.49432,
        8.5
      ],
      [
        -44.29471,
        -2.4938,
        7.3
      ],
      [
        -44.29619,
        -2.49366,
        4.5
      ],
      [
        -44.29714,
        -2.49339,
        4.3
      ],
      [
        -44.29822,
        -2.49353,
        1.8
      ],
      [
        -44.29891,
        -2.49346,
        3.5
      ],
      [
        -44.30079,
        -2.49274,
        1
      ],
      [
        -44.30136,
        -2.49281,
        1.8
      ],
      [
        -44.30284,
        -2.49378,
        4.8
      ],
      [
        -44.30347,
        -2.49411,
        4.3
      ],
      [
        -44.30423,
        -2.49478,
        8
      ],
      [
        -44.3049,
        -2.49496,
        5.8
      ],
      [
        -44.30615,
        -2.49501,
        4.5
      ],
      [
        -44.30621,
        -2.4948,
        4.5
      ],
      [
        -44.30512,
        -2.49309,
        12.5
      ],
      [
        -44.30503,
        -2.49283,
        13.8
      ],
      [
        -44.30535,
        -2.49324,
        11.8
      ],
      [
        -44.30646,
        -2.493,
        6.8
      ],
      [
        -44.30637,
        -2.4924,
        7.5
      ],
      [
        -44.30634,
        -2.49191,
        5.3
      ]
    ],
    "waypoints": [
      [
        -44.3018,
        -2.4982
      ],
      [
        -44.3168,
        -2.4892
      ]
    ],
    "distanceKm": 2.6,
    "ascentM": 24,
    "descentM": 34,
    "safetyScore": 94,
    "originName": "Parque Ecológico da Lagoa da Jansen",
    "destName": "Espigão Costeiro da Ponta d’Areia"
  },
  {
    "id": "curated-slz-centro-historico-remedios",
    "name": "Praça Dom Pedro II (Palácio dos Leões) → Praça Gonçalves Dias",
    "description": "Passeio pelo Centro Histórico de azulejos coloniais (Patrimônio Mundial UNESCO) com vista para a Baía de São Marcos.",
    "tag": "Centro UNESCO • MA",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "São Luís, MA",
    "profile": "safe",
    "coords": [
      [
        -44.3068,
        -2.52818,
        18.3
      ],
      [
        -44.30691,
        -2.52786,
        16.3
      ],
      [
        -44.30578,
        -2.52784,
        24.5
      ],
      [
        -44.30518,
        -2.52783,
        25.8
      ],
      [
        -44.3047,
        -2.52819,
        28.5
      ],
      [
        -44.30406,
        -2.52825,
        27.5
      ],
      [
        -44.30375,
        -2.52807,
        26.5
      ],
      [
        -44.30364,
        -2.52804,
        26.3
      ],
      [
        -44.30334,
        -2.52805,
        26
      ],
      [
        -44.30209,
        -2.52811,
        21.3
      ],
      [
        -44.30192,
        -2.52781,
        19.8
      ],
      [
        -44.30168,
        -2.52679,
        15.5
      ],
      [
        -44.30019,
        -2.52685,
        22
      ],
      [
        -44.30016,
        -2.52617,
        17.3
      ],
      [
        -44.29923,
        -2.52506,
        7.3
      ],
      [
        -44.2992,
        -2.52498,
        7
      ],
      [
        -44.29921,
        -2.52492,
        6.8
      ],
      [
        -44.29921,
        -2.52449,
        6.3
      ],
      [
        -44.29902,
        -2.52438,
        6.3
      ],
      [
        -44.2989,
        -2.52429,
        6.3
      ],
      [
        -44.29891,
        -2.52414,
        6
      ],
      [
        -44.29898,
        -2.52396,
        4.5
      ],
      [
        -44.29859,
        -2.52379,
        3.8
      ],
      [
        -44.29856,
        -2.52359,
        2.5
      ],
      [
        -44.29841,
        -2.52352,
        2.3
      ],
      [
        -44.29824,
        -2.52363,
        3.5
      ],
      [
        -44.29745,
        -2.52349,
        9.3
      ],
      [
        -44.29651,
        -2.52309,
        7
      ]
    ],
    "waypoints": [
      [
        -44.3068,
        -2.5282
      ],
      [
        -44.2974,
        -2.5218
      ]
    ],
    "distanceKm": 1.6,
    "ascentM": 26,
    "descentM": 37,
    "safetyScore": 88,
    "originName": "Palácio dos Leões (Centro Histórico)",
    "destName": "Mirante da Praça Gonçalves Dias (Remédios)"
  },
  {
    "id": "curated-belem-docas-forte-presepio",
    "name": "Estação das Docas → Mercado Ver-o-Peso & Forte do Presépio",
    "description": "Rota histórica à beira da Baía do Guajará ligando a Estação das Docas ao complexo do Ver-o-Peso e Cidade Velha.",
    "tag": "Baía do Guajará • PA",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Belém, PA",
    "profile": "safe",
    "coords": [
      [
        -48.49704,
        -1.44863,
        18.8
      ],
      [
        -48.49653,
        -1.4492,
        16.5
      ],
      [
        -48.49609,
        -1.44955,
        16.3
      ],
      [
        -48.49565,
        -1.45014,
        17.3
      ],
      [
        -48.49645,
        -1.45161,
        25
      ],
      [
        -48.49738,
        -1.4526,
        16.8
      ],
      [
        -48.49798,
        -1.45335,
        13.8
      ],
      [
        -48.49838,
        -1.45391,
        13.3
      ],
      [
        -48.49931,
        -1.45409,
        13
      ],
      [
        -48.49989,
        -1.45366,
        14.3
      ],
      [
        -48.50077,
        -1.45307,
        15.3
      ],
      [
        -48.50142,
        -1.45255,
        16.3
      ],
      [
        -48.50213,
        -1.45323,
        10.3
      ],
      [
        -48.50315,
        -1.45406,
        10.8
      ],
      [
        -48.5036,
        -1.45444,
        12
      ],
      [
        -48.50419,
        -1.45389,
        7.3
      ],
      [
        -48.50435,
        -1.45365,
        4
      ],
      [
        -48.5044,
        -1.45361,
        3.5
      ],
      [
        -48.5046,
        -1.45402,
        8.5
      ],
      [
        -48.50471,
        -1.45428,
        10.8
      ],
      [
        -48.50488,
        -1.45467,
        12.8
      ],
      [
        -48.50497,
        -1.45478,
        13.5
      ],
      [
        -48.50507,
        -1.45502,
        14.5
      ],
      [
        -48.50536,
        -1.4549,
        12.3
      ],
      [
        -48.50537,
        -1.45473,
        10.5
      ],
      [
        -48.50548,
        -1.45469,
        9.3
      ],
      [
        -48.50553,
        -1.45462,
        8.5
      ],
      [
        -48.50552,
        -1.45457,
        7.8
      ]
    ],
    "waypoints": [
      [
        -48.4969,
        -1.4485
      ],
      [
        -48.5056,
        -1.4545
      ]
    ],
    "distanceKm": 1.9,
    "ascentM": 25,
    "descentM": 36,
    "safetyScore": 92,
    "originName": "Estação das Docas (Campina)",
    "destName": "Forte do Presépio / Feliz Lusitânia (Cidade Velha)"
  },
  {
    "id": "curated-belem-duque-caxias-bosque",
    "name": "Ciclovia Av. Duque de Caxias → Bosque Rodrigues Alves",
    "description": "Um dos corredores cicloviários mais arborizados da Amazônia no canteiro central da Av. Duque de Caxias.",
    "tag": "Túnel de Mangueiras • PA",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Belém, PA",
    "profile": "safe",
    "coords": [
      [
        -48.47444,
        -1.44357,
        6.5
      ],
      [
        -48.47475,
        -1.44256,
        7.5
      ],
      [
        -48.47488,
        -1.44264,
        7.5
      ],
      [
        -48.47441,
        -1.4441,
        7.5
      ],
      [
        -48.47444,
        -1.44421,
        7.5
      ],
      [
        -48.47442,
        -1.44502,
        6.3
      ],
      [
        -48.47324,
        -1.44591,
        8
      ],
      [
        -48.47091,
        -1.4464,
        8
      ],
      [
        -48.47003,
        -1.44657,
        11
      ],
      [
        -48.46906,
        -1.44656,
        9.5
      ],
      [
        -48.46799,
        -1.44507,
        13.8
      ],
      [
        -48.46632,
        -1.44262,
        16.5
      ],
      [
        -48.46514,
        -1.4408,
        17
      ],
      [
        -48.46402,
        -1.43911,
        18.8
      ],
      [
        -48.4635,
        -1.43832,
        18.8
      ],
      [
        -48.46302,
        -1.4376,
        17
      ],
      [
        -48.4618,
        -1.43579,
        16.5
      ],
      [
        -48.46062,
        -1.43398,
        18.3
      ],
      [
        -48.46034,
        -1.43358,
        19
      ],
      [
        -48.45898,
        -1.43143,
        21.5
      ],
      [
        -48.4582,
        -1.43017,
        27.5
      ],
      [
        -48.45654,
        -1.42765,
        20.5
      ],
      [
        -48.45552,
        -1.42884,
        37
      ],
      [
        -48.45602,
        -1.4296,
        41.3
      ],
      [
        -48.45633,
        -1.42975,
        39.5
      ],
      [
        -48.45663,
        -1.4298,
        38.5
      ],
      [
        -48.45669,
        -1.43007,
        38
      ],
      [
        -48.4571,
        -1.43005,
        36.5
      ]
    ],
    "waypoints": [
      [
        -48.4742,
        -1.4435
      ],
      [
        -48.4572,
        -1.4302
      ]
    ],
    "distanceKm": 4,
    "ascentM": 47,
    "descentM": 17,
    "safetyScore": 95,
    "originName": "Início Av. Duque de Caxias (Marco)",
    "destName": "Bosque Rodrigues Alves (Jardim Zoobotânico)"
  },
  {
    "id": "curated-belem-portal-amazonia-mangal",
    "name": "Orla Portal da Amazônia → Mangal das Garças",
    "description": "Ciclovia fluvial ao longo da orla do Rio Guamá até o parque ecológico Mangal das Garças.",
    "tag": "Orla Portal da Amazônia • PA",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Belém, PA",
    "profile": "safe",
    "coords": [
      [
        -48.49893,
        -1.47568,
        0
      ],
      [
        -48.49067,
        -1.47891,
        0.8
      ],
      [
        -48.48889,
        -1.47887,
        1.5
      ],
      [
        -48.4885,
        -1.47753,
        4
      ],
      [
        -48.48795,
        -1.477,
        5.5
      ],
      [
        -48.48785,
        -1.47642,
        6.5
      ],
      [
        -48.48823,
        -1.47597,
        7.5
      ],
      [
        -48.4892,
        -1.47504,
        7.8
      ],
      [
        -48.49032,
        -1.47395,
        6.3
      ],
      [
        -48.49065,
        -1.47348,
        6.8
      ],
      [
        -48.49047,
        -1.47328,
        6.5
      ],
      [
        -48.49033,
        -1.47304,
        6.3
      ],
      [
        -48.49065,
        -1.47266,
        6.8
      ],
      [
        -48.49105,
        -1.47207,
        6.8
      ],
      [
        -48.4924,
        -1.47092,
        5
      ],
      [
        -48.49345,
        -1.47009,
        6.8
      ],
      [
        -48.49491,
        -1.46892,
        4.5
      ],
      [
        -48.49674,
        -1.46873,
        5.5
      ],
      [
        -48.49824,
        -1.46756,
        5.3
      ],
      [
        -48.4989,
        -1.46705,
        6.5
      ],
      [
        -48.5009,
        -1.4654,
        6
      ],
      [
        -48.5019,
        -1.46399,
        5.3
      ],
      [
        -48.50294,
        -1.46257,
        7
      ],
      [
        -48.50348,
        -1.46322,
        5.5
      ],
      [
        -48.5049,
        -1.46359,
        2.8
      ],
      [
        -48.50526,
        -1.46367,
        2.3
      ],
      [
        -48.50538,
        -1.46381,
        1.8
      ],
      [
        -48.50569,
        -1.46415,
        1.3
      ]
    ],
    "waypoints": [
      [
        -48.4988,
        -1.4754
      ],
      [
        -48.5059,
        -1.4642
      ]
    ],
    "distanceKm": 4.2,
    "ascentM": 15,
    "descentM": 13,
    "safetyScore": 94,
    "originName": "Orla Portal da Amazônia (Jurunas)",
    "destName": "Mangal das Garças (Cidade Velha)"
  },
  {
    "id": "curated-manaus-orla-ponta-negra",
    "name": "Ciclovia Orla da Ponta Negra (Mirante → Anfiteatro)",
    "description": "Ciclovia panorâmica às margens do Rio Negro no complexo turístico da Praia da Ponta Negra.",
    "tag": "Orla Rio Negro • AM",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Manaus, AM",
    "profile": "safe",
    "coords": [
      [
        -60.09264,
        -3.07012,
        30.8
      ],
      [
        -60.09409,
        -3.06896,
        25.8
      ],
      [
        -60.09405,
        -3.06881,
        26.3
      ],
      [
        -60.09409,
        -3.06865,
        26.3
      ],
      [
        -60.0942,
        -3.06853,
        26.5
      ],
      [
        -60.09427,
        -3.0685,
        26.5
      ],
      [
        -60.09444,
        -3.06849,
        26.8
      ],
      [
        -60.09473,
        -3.06843,
        27
      ],
      [
        -60.095,
        -3.06831,
        28
      ],
      [
        -60.09572,
        -3.06708,
        30
      ],
      [
        -60.09559,
        -3.06691,
        30.3
      ],
      [
        -60.09556,
        -3.06685,
        30.3
      ],
      [
        -60.09575,
        -3.0667,
        30
      ],
      [
        -60.09875,
        -3.0644,
        26.5
      ],
      [
        -60.09881,
        -3.06435,
        26.5
      ],
      [
        -60.10003,
        -3.06342,
        29
      ],
      [
        -60.10126,
        -3.0625,
        28
      ],
      [
        -60.10179,
        -3.0621,
        30
      ],
      [
        -60.10306,
        -3.06113,
        31.8
      ],
      [
        -60.10389,
        -3.06216,
        32.5
      ],
      [
        -60.10401,
        -3.06213,
        32.5
      ],
      [
        -60.10413,
        -3.06219,
        32.3
      ],
      [
        -60.10444,
        -3.06211,
        32.5
      ],
      [
        -60.10449,
        -3.0622,
        32.5
      ],
      [
        -60.10419,
        -3.0627,
        30.8
      ],
      [
        -60.10448,
        -3.06331,
        25.8
      ],
      [
        -60.10473,
        -3.0636,
        21.5
      ],
      [
        -60.10514,
        -3.06366,
        19.8
      ]
    ],
    "waypoints": [
      [
        -60.0924,
        -3.0698
      ],
      [
        -60.1052,
        -3.0631
      ]
    ],
    "distanceKm": 2,
    "ascentM": 12,
    "descentM": 23,
    "safetyScore": 97,
    "originName": "Rotatória da Ponta Negra (Rio Negro)",
    "destName": "Anfiteatro da Ponta Negra"
  },
  {
    "id": "curated-manaus-teatro-amazonas-mercado",
    "name": "Largo de São Sebastião (Teatro Amazonas) → Mercado Adolpho Lisboa",
    "description": "Percurso cultural pelo Centro Histórico de Manaus até a orla fluvial do Mercado Municipal.",
    "tag": "Centro Histórico • AM",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Manaus, AM",
    "profile": "safe",
    "coords": [
      [
        -60.02341,
        -3.13049,
        41
      ],
      [
        -60.02315,
        -3.1305,
        41
      ],
      [
        -60.0231,
        -3.13044,
        40.8
      ],
      [
        -60.02279,
        -3.13008,
        39
      ],
      [
        -60.02278,
        -3.12994,
        39.3
      ],
      [
        -60.02278,
        -3.13013,
        39
      ],
      [
        -60.02319,
        -3.13088,
        40.3
      ],
      [
        -60.0241,
        -3.13085,
        39
      ],
      [
        -60.02422,
        -3.13065,
        39.8
      ],
      [
        -60.02506,
        -3.13175,
        32.5
      ],
      [
        -60.02574,
        -3.13314,
        27.3
      ],
      [
        -60.02623,
        -3.13335,
        28.8
      ],
      [
        -60.02619,
        -3.13431,
        29.3
      ],
      [
        -60.02616,
        -3.13466,
        28
      ],
      [
        -60.02618,
        -3.13576,
        24
      ],
      [
        -60.02616,
        -3.13591,
        23.5
      ],
      [
        -60.0261,
        -3.13604,
        23.3
      ],
      [
        -60.02571,
        -3.13653,
        23.5
      ],
      [
        -60.02565,
        -3.13665,
        23.8
      ],
      [
        -60.02582,
        -3.13669,
        24
      ],
      [
        -60.02618,
        -3.13706,
        22.3
      ],
      [
        -60.02617,
        -3.13718,
        22.3
      ],
      [
        -60.02622,
        -3.13729,
        21.8
      ],
      [
        -60.02554,
        -3.13838,
        18.8
      ],
      [
        -60.02487,
        -3.13924,
        15.5
      ],
      [
        -60.02464,
        -3.13959,
        16
      ],
      [
        -60.02444,
        -3.13981,
        17
      ],
      [
        -60.02428,
        -3.13977,
        19
      ]
    ],
    "waypoints": [
      [
        -60.0234,
        -3.1303
      ],
      [
        -60.0242,
        -3.1398
      ]
    ],
    "distanceKm": 1.6,
    "ascentM": 9,
    "descentM": 31,
    "safetyScore": 88,
    "originName": "Teatro Amazonas (Largo de São Sebastião)",
    "destName": "Mercado Municipal Adolpho Lisboa"
  },
  {
    "id": "curated-manaus-parque-mindu-bilhares",
    "name": "Parque dos Bilhares → Parque Municipal do Mindu",
    "description": "Conexão entre os dois principais parques urbanos da zona centro-sul de Manaus (Parque 10 de Novembro).",
    "tag": "Parques Amazônicos • AM",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Manaus, AM",
    "profile": "safe",
    "coords": [
      [
        -60.02404,
        -3.1012,
        22
      ],
      [
        -60.02406,
        -3.09909,
        26.8
      ],
      [
        -60.02407,
        -3.09782,
        27.3
      ],
      [
        -60.02407,
        -3.09634,
        31.8
      ],
      [
        -60.02406,
        -3.09471,
        43
      ],
      [
        -60.02411,
        -3.09226,
        38.5
      ],
      [
        -60.02417,
        -3.09092,
        35.8
      ],
      [
        -60.0242,
        -3.08966,
        38.5
      ],
      [
        -60.02374,
        -3.08923,
        41
      ],
      [
        -60.02083,
        -3.08812,
        44.5
      ],
      [
        -60.01945,
        -3.08754,
        40.5
      ],
      [
        -60.01908,
        -3.08747,
        39.3
      ],
      [
        -60.01884,
        -3.08739,
        40
      ],
      [
        -60.01858,
        -3.08722,
        40.3
      ],
      [
        -60.01779,
        -3.08736,
        44.8
      ],
      [
        -60.01725,
        -3.08691,
        44.8
      ],
      [
        -60.01573,
        -3.0853,
        43.3
      ],
      [
        -60.01461,
        -3.08406,
        44.3
      ],
      [
        -60.01332,
        -3.0838,
        51.3
      ],
      [
        -60.01348,
        -3.08307,
        51.5
      ],
      [
        -60.0136,
        -3.0823,
        50.8
      ],
      [
        -60.01365,
        -3.08202,
        51.3
      ],
      [
        -60.0109,
        -3.08154,
        52
      ],
      [
        -60.00902,
        -3.08188,
        46.3
      ],
      [
        -60.00855,
        -3.0822,
        43.8
      ],
      [
        -60.00813,
        -3.08299,
        38.8
      ],
      [
        -60.0079,
        -3.08376,
        35.8
      ],
      [
        -60.00849,
        -3.08409,
        34.3
      ]
    ],
    "waypoints": [
      [
        -60.0238,
        -3.1012
      ],
      [
        -60.0085,
        -3.0842
      ]
    ],
    "distanceKm": 3.8,
    "ascentM": 45,
    "descentM": 32,
    "safetyScore": 90,
    "originName": "Parque Ponte dos Bilhares (Chapada)",
    "destName": "Parque Municipal do Mindu (Parque 10)"
  },
  {
    "id": "curated-palmas-girassois-graciosa",
    "name": "Praça dos Girassóis → Orla da Praia da Graciosa",
    "description": "Ciclovia reta e ampla saindo da maior praça da América Latina até o pôr do sol no Lago de Palmas.",
    "tag": "Orla Graciosa • TO",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Palmas, TO",
    "profile": "safe",
    "coords": [
      [
        -48.33347,
        -10.18425,
        268
      ],
      [
        -48.33402,
        -10.18423,
        265.5
      ],
      [
        -48.33403,
        -10.18413,
        265
      ],
      [
        -48.33529,
        -10.18447,
        258.8
      ],
      [
        -48.33652,
        -10.18451,
        256
      ],
      [
        -48.33708,
        -10.18417,
        255.8
      ],
      [
        -48.33749,
        -10.18452,
        254
      ],
      [
        -48.3374,
        -10.18491,
        253.3
      ],
      [
        -48.33716,
        -10.18568,
        254
      ],
      [
        -48.341,
        -10.18572,
        247.8
      ],
      [
        -48.34225,
        -10.18481,
        244.5
      ],
      [
        -48.34232,
        -10.18443,
        245.3
      ],
      [
        -48.34278,
        -10.18449,
        244
      ],
      [
        -48.34389,
        -10.18458,
        239.8
      ],
      [
        -48.34519,
        -10.18437,
        232.8
      ],
      [
        -48.34661,
        -10.18449,
        226
      ],
      [
        -48.34714,
        -10.18371,
        227.5
      ],
      [
        -48.3475,
        -10.18456,
        224
      ],
      [
        -48.34967,
        -10.18457,
        224.5
      ],
      [
        -48.35237,
        -10.18435,
        223.3
      ],
      [
        -48.35271,
        -10.1846,
        224.3
      ],
      [
        -48.35572,
        -10.18444,
        225.5
      ],
      [
        -48.35624,
        -10.18454,
        226
      ],
      [
        -48.35928,
        -10.18448,
        223.8
      ],
      [
        -48.35942,
        -10.1838,
        222
      ],
      [
        -48.35981,
        -10.18439,
        222.3
      ],
      [
        -48.36015,
        -10.18464,
        222.3
      ],
      [
        -48.3621,
        -10.18459,
        219.3
      ]
    ],
    "waypoints": [
      [
        -48.3336,
        -10.1844
      ],
      [
        -48.3621,
        -10.1845
      ]
    ],
    "distanceKm": 3.6,
    "ascentM": 7,
    "descentM": 55,
    "safetyScore": 96,
    "originName": "Palácio Araguaia / Praça dos Girassóis",
    "destName": "Orla da Praia da Graciosa (Lago de Palmas)"
  },
  {
    "id": "curated-palmas-girassois-cesamar",
    "name": "Praça dos Girassóis → Parque Cesamar",
    "description": "Eixo cicloviário central conectando o plano diretor de Palmas à pista arborizada do Parque Cesamar.",
    "tag": "Parque Cesamar • TO",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Palmas, TO",
    "profile": "safe",
    "coords": [
      [
        -48.33226,
        -10.1892,
        254.8
      ],
      [
        -48.33291,
        -10.19194,
        252.5
      ],
      [
        -48.3329,
        -10.1921,
        252.8
      ],
      [
        -48.33223,
        -10.19552,
        255
      ],
      [
        -48.33222,
        -10.19709,
        256.3
      ],
      [
        -48.33283,
        -10.19757,
        255.3
      ],
      [
        -48.3329,
        -10.19781,
        254
      ],
      [
        -48.33223,
        -10.1979,
        255
      ],
      [
        -48.33184,
        -10.198,
        255
      ],
      [
        -48.33123,
        -10.19782,
        256
      ],
      [
        -48.33076,
        -10.19879,
        254
      ],
      [
        -48.33065,
        -10.19903,
        254
      ],
      [
        -48.33033,
        -10.19895,
        255.3
      ],
      [
        -48.33022,
        -10.19902,
        255.5
      ],
      [
        -48.33018,
        -10.20387,
        240.5
      ],
      [
        -48.33051,
        -10.20427,
        241.8
      ],
      [
        -48.33051,
        -10.20469,
        244
      ],
      [
        -48.33023,
        -10.20509,
        245.3
      ],
      [
        -48.33005,
        -10.20785,
        251.8
      ],
      [
        -48.32855,
        -10.20762,
        250.8
      ],
      [
        -48.32705,
        -10.20825,
        250.3
      ],
      [
        -48.32621,
        -10.20892,
        250.3
      ],
      [
        -48.32515,
        -10.20918,
        250
      ],
      [
        -48.32494,
        -10.20949,
        250.3
      ],
      [
        -48.32448,
        -10.20958,
        250
      ],
      [
        -48.32427,
        -10.2096,
        250
      ],
      [
        -48.32413,
        -10.20934,
        248.5
      ],
      [
        -48.32378,
        -10.20889,
        244.8
      ]
    ],
    "waypoints": [
      [
        -48.3324,
        -10.1892
      ],
      [
        -48.3238,
        -10.2089
      ]
    ],
    "distanceKm": 3.2,
    "ascentM": 19,
    "descentM": 29,
    "safetyScore": 94,
    "originName": "Bosque dos Pioneiros (Centro)",
    "destName": "Parque Cesamar (Av. LO-05)"
  },
  {
    "id": "curated-palmas-teotonio-uft",
    "name": "Av. Teotônio Segurado → Campus UFT (Beira-Lago)",
    "description": "Corredor norte-sul pela ciclovia da Av. Teotônio Segurado e acesso universitário.",
    "tag": "Eixo Teotônio • TO",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Palmas, TO",
    "profile": "safe",
    "coords": [
      [
        -48.33305,
        -10.1972,
        255.5
      ],
      [
        -48.33328,
        -10.19712,
        255.5
      ],
      [
        -48.33381,
        -10.19795,
        252.3
      ],
      [
        -48.33376,
        -10.20247,
        236
      ],
      [
        -48.33375,
        -10.20492,
        248.3
      ],
      [
        -48.33373,
        -10.20609,
        251
      ],
      [
        -48.33372,
        -10.20658,
        252.3
      ],
      [
        -48.33371,
        -10.20754,
        250.5
      ],
      [
        -48.33399,
        -10.20792,
        249.8
      ],
      [
        -48.3347,
        -10.20815,
        249
      ],
      [
        -48.3348,
        -10.20904,
        252.8
      ],
      [
        -48.3348,
        -10.20982,
        253.3
      ],
      [
        -48.33479,
        -10.21028,
        253
      ],
      [
        -48.33495,
        -10.21071,
        253
      ],
      [
        -48.33497,
        -10.21084,
        253
      ],
      [
        -48.33475,
        -10.21262,
        253.8
      ],
      [
        -48.33472,
        -10.21458,
        254.3
      ],
      [
        -48.3347,
        -10.21535,
        254.3
      ],
      [
        -48.33481,
        -10.21753,
        253
      ],
      [
        -48.33485,
        -10.21763,
        253
      ],
      [
        -48.33477,
        -10.21779,
        253
      ],
      [
        -48.33416,
        -10.21786,
        253.3
      ],
      [
        -48.33364,
        -10.21834,
        254.5
      ],
      [
        -48.33383,
        -10.21912,
        253.8
      ],
      [
        -48.33362,
        -10.2203,
        253.5
      ],
      [
        -48.33314,
        -10.22031,
        253.5
      ],
      [
        -48.33308,
        -10.21926,
        255.3
      ],
      [
        -48.33286,
        -10.2185,
        255
      ]
    ],
    "waypoints": [
      [
        -48.3331,
        -10.1972
      ],
      [
        -48.3328,
        -10.2185
      ]
    ],
    "distanceKm": 3,
    "ascentM": 25,
    "descentM": 26,
    "safetyScore": 92,
    "originName": "Espaço Cultural José Gomes Sobrinho",
    "destName": "Praça do Bosque / Av. Teotônio Segurado"
  },
  {
    "id": "curated-rb-parque-maternidade",
    "name": "Ciclovia Parque da Maternidade (Centro → Skate Park)",
    "description": "Parque linear de 6 km que corta o coração de Rio Branco com ciclovia segregada e pontes para ciclistas.",
    "tag": "Parque da Maternidade • AC",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Rio Branco, AC",
    "profile": "safe",
    "coords": [
      [
        -67.8099,
        -9.97484,
        152.8
      ],
      [
        -67.81028,
        -9.9742,
        155.5
      ],
      [
        -67.81165,
        -9.97481,
        152.5
      ],
      [
        -67.81224,
        -9.97343,
        156.8
      ],
      [
        -67.81338,
        -9.97383,
        151
      ],
      [
        -67.81366,
        -9.9738,
        150.8
      ],
      [
        -67.81388,
        -9.97347,
        154.3
      ],
      [
        -67.81422,
        -9.97266,
        153.3
      ],
      [
        -67.81561,
        -9.97324,
        150.8
      ],
      [
        -67.81567,
        -9.97321,
        150.5
      ],
      [
        -67.81763,
        -9.97249,
        158.8
      ],
      [
        -67.81841,
        -9.97083,
        153.5
      ],
      [
        -67.81859,
        -9.97045,
        151.5
      ],
      [
        -67.81876,
        -9.96997,
        148.8
      ],
      [
        -67.81886,
        -9.9696,
        146.8
      ],
      [
        -67.81894,
        -9.9694,
        146
      ],
      [
        -67.81901,
        -9.96925,
        145.3
      ],
      [
        -67.81928,
        -9.9685,
        148.3
      ],
      [
        -67.81967,
        -9.96752,
        153.3
      ],
      [
        -67.81974,
        -9.96706,
        154.3
      ],
      [
        -67.8198,
        -9.9666,
        155
      ],
      [
        -67.81989,
        -9.9661,
        153.5
      ],
      [
        -67.82008,
        -9.96461,
        151.8
      ],
      [
        -67.82138,
        -9.96358,
        152.3
      ],
      [
        -67.82267,
        -9.9635,
        152
      ],
      [
        -67.82264,
        -9.96287,
        151.3
      ],
      [
        -67.82365,
        -9.96289,
        151.3
      ],
      [
        -67.82366,
        -9.9632,
        152.3
      ]
    ],
    "waypoints": [
      [
        -67.8098,
        -9.9748
      ],
      [
        -67.8235,
        -9.9632
      ]
    ],
    "distanceKm": 2.6,
    "ascentM": 30,
    "descentM": 31,
    "safetyScore": 96,
    "originName": "Palácio Rio Branco / Terminal Urbano",
    "destName": "Parque da Maternidade (Setor Ipê)"
  },
  {
    "id": "curated-rb-gameleira-tucuma",
    "name": "Calçadão da Gameleira → Parque do Tucumã",
    "description": "Sai da orla histórica do Rio Acre na Gameleira e segue pelas ciclovias da zona oeste até o Parque do Tucumã.",
    "tag": "Rio Acre & Tucumã • AC",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Rio Branco, AC",
    "profile": "safe",
    "coords": [
      [
        -67.80604,
        -9.97699,
        136.3
      ],
      [
        -67.80724,
        -9.97453,
        142.3
      ],
      [
        -67.80966,
        -9.97006,
        147.5
      ],
      [
        -67.81039,
        -9.96845,
        146.8
      ],
      [
        -67.81149,
        -9.96664,
        148.5
      ],
      [
        -67.812,
        -9.96356,
        149.3
      ],
      [
        -67.812,
        -9.96284,
        150
      ],
      [
        -67.81248,
        -9.96227,
        149.8
      ],
      [
        -67.81334,
        -9.96084,
        151.8
      ],
      [
        -67.81339,
        -9.96047,
        150.5
      ],
      [
        -67.81553,
        -9.95832,
        145.3
      ],
      [
        -67.81876,
        -9.95874,
        146.5
      ],
      [
        -67.81921,
        -9.95769,
        147
      ],
      [
        -67.82154,
        -9.9587,
        147.8
      ],
      [
        -67.82182,
        -9.95892,
        147.8
      ],
      [
        -67.8234,
        -9.95908,
        148.8
      ],
      [
        -67.82557,
        -9.95832,
        140.3
      ],
      [
        -67.82724,
        -9.9579,
        145.8
      ],
      [
        -67.82853,
        -9.95654,
        147.3
      ],
      [
        -67.82992,
        -9.95336,
        149.8
      ],
      [
        -67.83175,
        -9.95115,
        146.8
      ],
      [
        -67.8347,
        -9.95185,
        148
      ],
      [
        -67.83593,
        -9.95276,
        148.3
      ],
      [
        -67.8379,
        -9.95297,
        147
      ],
      [
        -67.84113,
        -9.95266,
        139.5
      ],
      [
        -67.84619,
        -9.95222,
        150.8
      ],
      [
        -67.84794,
        -9.95314,
        151.8
      ],
      [
        -67.84816,
        -9.95471,
        151.3
      ]
    ],
    "waypoints": [
      [
        -67.8065,
        -9.9772
      ],
      [
        -67.8482,
        -9.9548
      ]
    ],
    "distanceKm": 6.7,
    "ascentM": 43,
    "descentM": 28,
    "safetyScore": 93,
    "originName": "Calçadão da Gameleira (Segundo Distrito)",
    "destName": "Parque do Tucumã (Distrito Industrial)"
  },
  {
    "id": "curated-rb-ufac-horto-florestal",
    "name": "Campus UFAC → Parque Ambiental Horto Florestal",
    "description": "Trajeto arborizado ligando a Universidade Federal do Acre ao Horto Florestal.",
    "tag": "Rota Verde • AC",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Rio Branco, AC",
    "profile": "safe",
    "coords": [
      [
        -67.86318,
        -9.95542,
        155.3
      ],
      [
        -67.86323,
        -9.95429,
        154.5
      ],
      [
        -67.86313,
        -9.9538,
        153.3
      ],
      [
        -67.86237,
        -9.95306,
        152.8
      ],
      [
        -67.86209,
        -9.953,
        153
      ],
      [
        -67.86204,
        -9.9527,
        153.3
      ],
      [
        -67.86429,
        -9.94984,
        153
      ],
      [
        -67.86364,
        -9.94671,
        153.3
      ],
      [
        -67.86289,
        -9.94577,
        152.3
      ],
      [
        -67.86099,
        -9.94619,
        150
      ],
      [
        -67.8596,
        -9.94623,
        150.3
      ],
      [
        -67.85771,
        -9.94743,
        151.3
      ],
      [
        -67.85663,
        -9.94798,
        151.3
      ],
      [
        -67.85489,
        -9.94814,
        149.8
      ],
      [
        -67.85343,
        -9.94782,
        149.3
      ],
      [
        -67.85076,
        -9.94617,
        146.8
      ],
      [
        -67.84889,
        -9.94794,
        145.5
      ],
      [
        -67.84809,
        -9.94872,
        145.5
      ],
      [
        -67.84774,
        -9.95101,
        145.3
      ],
      [
        -67.84738,
        -9.95204,
        151.3
      ],
      [
        -67.84303,
        -9.95247,
        145.3
      ],
      [
        -67.83961,
        -9.95281,
        144.3
      ],
      [
        -67.83615,
        -9.95314,
        148.8
      ],
      [
        -67.83601,
        -9.95185,
        147.5
      ],
      [
        -67.8357,
        -9.94885,
        143.3
      ],
      [
        -67.83307,
        -9.948,
        143.3
      ],
      [
        -67.82974,
        -9.94829,
        145
      ],
      [
        -67.82854,
        -9.94809,
        147.8
      ]
    ],
    "waypoints": [
      [
        -67.8632,
        -9.9554
      ],
      [
        -67.8285,
        -9.9482
      ]
    ],
    "distanceKm": 6,
    "ascentM": 17,
    "descentM": 25,
    "safetyScore": 91,
    "originName": "Universidade Federal do Acre (UFAC)",
    "destName": "Horto Florestal de Rio Branco"
  },
  {
    "id": "curated-pvh-espaco-alternativo",
    "name": "Ciclovia do Espaço Alternativo (Av. Jorge Teixeira)",
    "description": "Pista exclusiva de lazer e ciclismo de Porto Velho com iluminação cênica e pavimento liso.",
    "tag": "Espaço Alternativo • RO",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Porto Velho, RO",
    "profile": "safe",
    "coords": [
      [
        -63.88229,
        -8.73645,
        87.5
      ],
      [
        -63.88273,
        -8.73597,
        86.5
      ],
      [
        -63.88405,
        -8.73628,
        83.8
      ],
      [
        -63.8852,
        -8.73652,
        83.8
      ],
      [
        -63.88665,
        -8.73682,
        86.3
      ],
      [
        -63.88852,
        -8.73722,
        89
      ],
      [
        -63.89014,
        -8.73756,
        87.5
      ],
      [
        -63.89058,
        -8.73764,
        86.5
      ],
      [
        -63.89063,
        -8.73808,
        86.3
      ],
      [
        -63.89224,
        -8.73842,
        86
      ],
      [
        -63.89263,
        -8.73844,
        85.3
      ],
      [
        -63.89499,
        -8.73835,
        84
      ],
      [
        -63.89496,
        -8.73767,
        83.8
      ],
      [
        -63.89495,
        -8.73681,
        81.3
      ],
      [
        -63.895,
        -8.73597,
        80
      ],
      [
        -63.89635,
        -8.73593,
        84.3
      ],
      [
        -63.89704,
        -8.73543,
        85.8
      ],
      [
        -63.89776,
        -8.73493,
        85.5
      ],
      [
        -63.89898,
        -8.73509,
        85.8
      ],
      [
        -63.90114,
        -8.73545,
        85.5
      ],
      [
        -63.901,
        -8.73417,
        87.3
      ],
      [
        -63.90097,
        -8.734,
        87.5
      ],
      [
        -63.90121,
        -8.72727,
        83.8
      ],
      [
        -63.90125,
        -8.72323,
        86.8
      ],
      [
        -63.89984,
        -8.7219,
        85.8
      ],
      [
        -63.89721,
        -8.71999,
        85.5
      ],
      [
        -63.89668,
        -8.71877,
        88.5
      ],
      [
        -63.89665,
        -8.71849,
        89.8
      ]
    ],
    "waypoints": [
      [
        -63.8825,
        -8.7365
      ],
      [
        -63.8962,
        -8.7185
      ]
    ],
    "distanceKm": 4.6,
    "ascentM": 21,
    "descentM": 18,
    "safetyScore": 96,
    "originName": "Início do Espaço Alternativo (Hospital de Base)",
    "destName": "Final do Espaço Alternativo (Aeroporto)"
  },
  {
    "id": "curated-pvh-madeira-mamore-tres-caixas",
    "name": "Complexo Madeira-Mamoré → Praça das Três Caixas d’Água",
    "description": "Passeio histórico às margens do Rio Madeira até o símbolo ferroviário das Três Caixas d’Água.",
    "tag": "Histórico Rio Madeira • RO",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Porto Velho, RO",
    "profile": "safe",
    "coords": [
      [
        -63.90829,
        -8.76515,
        68.3
      ],
      [
        -63.90836,
        -8.76483,
        70
      ],
      [
        -63.90836,
        -8.7648,
        70.3
      ],
      [
        -63.90763,
        -8.76463,
        74.8
      ],
      [
        -63.90667,
        -8.76442,
        75.3
      ],
      [
        -63.90674,
        -8.76404,
        79.3
      ],
      [
        -63.90693,
        -8.7633,
        86
      ],
      [
        -63.90634,
        -8.76317,
        85.3
      ],
      [
        -63.90626,
        -8.76316,
        85.3
      ],
      [
        -63.90579,
        -8.76306,
        85.5
      ],
      [
        -63.90439,
        -8.76276,
        85.5
      ],
      [
        -63.90338,
        -8.76253,
        85.8
      ],
      [
        -63.90353,
        -8.76187,
        88.3
      ]
    ],
    "waypoints": [
      [
        -63.9085,
        -8.7652
      ],
      [
        -63.9032,
        -8.7618
      ]
    ],
    "distanceKm": 0.8,
    "ascentM": 21,
    "descentM": 1,
    "safetyScore": 91,
    "originName": "Museu Estrada de Ferro Madeira-Mamoré",
    "destName": "Praça das Três Caixas d’Água (Centro)"
  },
  {
    "id": "curated-pvh-parque-cidade-circuito",
    "name": "Parque da Cidade de Porto Velho → Porto Velho Shopping",
    "description": "Rota urbana na zona norte passando pelo lago e pista interna do Parque da Cidade.",
    "tag": "Parque da Cidade • RO",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Porto Velho, RO",
    "profile": "safe",
    "coords": [
      [
        -63.87679,
        -8.74625,
        90.3
      ],
      [
        -63.8762,
        -8.74611,
        89.5
      ],
      [
        -63.87611,
        -8.74628,
        88.8
      ],
      [
        -63.87646,
        -8.74654,
        89.5
      ],
      [
        -63.87685,
        -8.74682,
        89.8
      ],
      [
        -63.87743,
        -8.74695,
        91
      ],
      [
        -63.87752,
        -8.74697,
        91.3
      ],
      [
        -63.87814,
        -8.7471,
        91.3
      ],
      [
        -63.87885,
        -8.74725,
        91.5
      ],
      [
        -63.87915,
        -8.74731,
        91.8
      ],
      [
        -63.879,
        -8.74801,
        91
      ],
      [
        -63.87884,
        -8.74867,
        90.3
      ],
      [
        -63.8787,
        -8.74934,
        89.8
      ],
      [
        -63.87931,
        -8.74945,
        91
      ],
      [
        -63.8799,
        -8.74957,
        92.3
      ],
      [
        -63.88082,
        -8.74978,
        91
      ],
      [
        -63.87985,
        -8.75416,
        91.5
      ],
      [
        -63.87929,
        -8.75675,
        94.3
      ],
      [
        -63.88022,
        -8.75696,
        93.8
      ],
      [
        -63.88029,
        -8.75698,
        93.8
      ],
      [
        -63.88125,
        -8.75718,
        92.3
      ],
      [
        -63.88162,
        -8.75549,
        90.3
      ]
    ],
    "waypoints": [
      [
        -63.8768,
        -8.7462
      ],
      [
        -63.8812,
        -8.7554
      ]
    ],
    "distanceKm": 2.1,
    "ascentM": 9,
    "descentM": 9,
    "safetyScore": 92,
    "originName": "Parque da Cidade (Flodoaldo Pontes Pinto)",
    "destName": "Av. Rio Madeira (Nova Porto Velho)"
  },
  {
    "id": "curated-bv-orla-taumanan-aguas",
    "name": "Orla Taumanan → Centro Cívico & Praça das Águas",
    "description": "Percurso radial pelo centro planejado em leque de Boa Vista às margens do Rio Branco.",
    "tag": "Centro em Leque • RR",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Boa Vista, RR",
    "profile": "safe",
    "coords": [
      [
        -60.66932,
        2.818,
        83.8
      ],
      [
        -60.66895,
        2.81768,
        84.5
      ],
      [
        -60.66983,
        2.81857,
        83
      ],
      [
        -60.66923,
        2.81934,
        83.3
      ],
      [
        -60.66912,
        2.81937,
        83.3
      ],
      [
        -60.66897,
        2.81948,
        83.8
      ],
      [
        -60.66903,
        2.81961,
        84
      ],
      [
        -60.66915,
        2.81959,
        84
      ],
      [
        -60.66935,
        2.81947,
        83.5
      ],
      [
        -60.67051,
        2.8195,
        83.3
      ],
      [
        -60.67061,
        2.81983,
        83
      ],
      [
        -60.67052,
        2.82038,
        84
      ],
      [
        -60.6708,
        2.82079,
        85.8
      ],
      [
        -60.67127,
        2.82119,
        83.5
      ],
      [
        -60.67151,
        2.82109,
        83
      ],
      [
        -60.67184,
        2.82136,
        82.3
      ],
      [
        -60.67208,
        2.82136,
        82.3
      ],
      [
        -60.67241,
        2.8212,
        82.5
      ],
      [
        -60.67271,
        2.82094,
        83.3
      ],
      [
        -60.67293,
        2.82054,
        83.5
      ],
      [
        -60.67306,
        2.82025,
        83
      ],
      [
        -60.67323,
        2.82024,
        82.8
      ],
      [
        -60.67344,
        2.82041,
        83.5
      ],
      [
        -60.67362,
        2.82076,
        84.8
      ],
      [
        -60.67366,
        2.82105,
        84.3
      ],
      [
        -60.67352,
        2.82151,
        82.8
      ],
      [
        -60.67379,
        2.82167,
        83
      ],
      [
        -60.67385,
        2.82178,
        83.3
      ]
    ],
    "waypoints": [
      [
        -60.6695,
        2.8178
      ],
      [
        -60.6738,
        2.8219
      ]
    ],
    "distanceKm": 1.2,
    "ascentM": 8,
    "descentM": 9,
    "safetyScore": 95,
    "originName": "Orla Taumanan (Centro Histórico)",
    "destName": "Praça das Águas / Portal do Milênio"
  },
  {
    "id": "curated-bv-parque-anaua-ene-garcez",
    "name": "Praça do Centro Cívico → Parque Anauá (Av. Ene Garcez)",
    "description": "Ciclovia reta e larga da Av. Capitão Ene Garcez até o maior parque urbano do Norte do Brasil.",
    "tag": "Eixo Ene Garcez • RR",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Boa Vista, RR",
    "profile": "safe",
    "coords": [
      [
        -60.67218,
        2.81986,
        83.8
      ],
      [
        -60.67186,
        2.81957,
        83.8
      ],
      [
        -60.67141,
        2.8191,
        83.8
      ],
      [
        -60.67092,
        2.81912,
        83.8
      ],
      [
        -60.67068,
        2.81917,
        83.8
      ],
      [
        -60.67061,
        2.81928,
        83.5
      ],
      [
        -60.67059,
        2.81944,
        83.3
      ],
      [
        -60.67062,
        2.81966,
        83.3
      ],
      [
        -60.67012,
        2.8204,
        84
      ],
      [
        -60.66962,
        2.82094,
        84.8
      ],
      [
        -60.66934,
        2.82125,
        84.3
      ],
      [
        -60.66758,
        2.82327,
        85
      ],
      [
        -60.66588,
        2.82523,
        84.3
      ],
      [
        -60.6658,
        2.82525,
        84.3
      ],
      [
        -60.66576,
        2.82535,
        84.5
      ],
      [
        -60.66572,
        2.82544,
        84.8
      ],
      [
        -60.6647,
        2.82661,
        84.8
      ],
      [
        -60.6635,
        2.82799,
        81.8
      ],
      [
        -60.66337,
        2.82814,
        81.3
      ],
      [
        -60.663,
        2.82855,
        82.3
      ],
      [
        -60.662,
        2.82971,
        84.3
      ],
      [
        -60.66192,
        2.82981,
        84
      ],
      [
        -60.66301,
        2.83082,
        81
      ],
      [
        -60.6635,
        2.83128,
        81.5
      ],
      [
        -60.66344,
        2.83152,
        81.3
      ],
      [
        -60.66121,
        2.83413,
        82.3
      ],
      [
        -60.6615,
        2.834,
        82.3
      ],
      [
        -60.66329,
        2.83504,
        81.5
      ]
    ],
    "waypoints": [
      [
        -60.6722,
        2.8198
      ],
      [
        -60.6632,
        2.8352
      ]
    ],
    "distanceKm": 2.7,
    "ascentM": 7,
    "descentM": 10,
    "safetyScore": 96,
    "originName": "Monumento aos Garimpeiros (Centro Cívico)",
    "destName": "Parque Anauá (Estados)"
  },
  {
    "id": "curated-bv-mirante-edileusa-parque-rio-branco",
    "name": "Parque do Rio Branco & Mirante Edileusa Lóz → Caçari",
    "description": "Nova orla fluvial do Parque do Rio Branco com ciclovia iluminada e vista do Mirante.",
    "tag": "Orla Rio Branco • RR",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Boa Vista, RR",
    "profile": "safe",
    "coords": [
      [
        -60.6658,
        2.8254,
        84.3
      ],
      [
        -60.66572,
        2.82544,
        84.8
      ],
      [
        -60.66517,
        2.82606,
        86.5
      ],
      [
        -60.66463,
        2.82669,
        84.8
      ],
      [
        -60.6635,
        2.82799,
        81.8
      ],
      [
        -60.66345,
        2.82805,
        81.5
      ],
      [
        -60.66334,
        2.82818,
        81
      ],
      [
        -60.66296,
        2.82859,
        82.5
      ],
      [
        -60.662,
        2.82968,
        84.3
      ],
      [
        -60.66196,
        2.82976,
        84.3
      ],
      [
        -60.66189,
        2.82983,
        84
      ],
      [
        -60.66203,
        2.82995,
        84
      ],
      [
        -60.66347,
        2.83121,
        81.3
      ],
      [
        -60.66348,
        2.83136,
        81.5
      ],
      [
        -60.66338,
        2.83147,
        81
      ],
      [
        -60.66347,
        2.83155,
        81.5
      ],
      [
        -60.65922,
        2.8364,
        76.8
      ],
      [
        -60.65916,
        2.83647,
        76.5
      ],
      [
        -60.65618,
        2.83989,
        74.8
      ],
      [
        -60.65607,
        2.84001,
        73.8
      ],
      [
        -60.65522,
        2.84098,
        74.3
      ],
      [
        -60.65459,
        2.84165,
        79.8
      ],
      [
        -60.6531,
        2.84196,
        82.8
      ],
      [
        -60.65275,
        2.84167,
        81.8
      ],
      [
        -60.65202,
        2.84102,
        81
      ],
      [
        -60.65115,
        2.84026,
        79
      ],
      [
        -60.65107,
        2.84019,
        79
      ],
      [
        -60.65137,
        2.83896,
        76.3
      ]
    ],
    "waypoints": [
      [
        -60.6658,
        2.8254
      ],
      [
        -60.6512,
        2.8385
      ]
    ],
    "distanceKm": 3,
    "ascentM": 15,
    "descentM": 23,
    "safetyScore": 94,
    "originName": "Mirante Edileusa Lóz (Parque do Rio Branco)",
    "destName": "Bosque dos Papagaios (Paraviana)"
  },
  {
    "id": "curated-macapa-fortaleza-orla-amazonas",
    "name": "Fortaleza de São José → Orla de Santa Inês & Trapiche Eliezer Levy",
    "description": "Ciclovia panorâmica às margens do gigante Rio Amazonas passando pelo Trapiche e Praça Zagury.",
    "tag": "Orla Rio Amazonas • AP",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Macapá, AP",
    "profile": "safe",
    "coords": [
      [
        -51.04918,
        0.03127,
        9
      ],
      [
        -51.04914,
        0.03144,
        9
      ],
      [
        -51.04909,
        0.03163,
        8.8
      ],
      [
        -51.04929,
        0.03184,
        8
      ],
      [
        -51.0499,
        0.03217,
        6.3
      ],
      [
        -51.05005,
        0.03312,
        5
      ],
      [
        -51.05003,
        0.03328,
        5
      ],
      [
        -51.05084,
        0.03337,
        5
      ],
      [
        -51.05335,
        0.03354,
        6.8
      ],
      [
        -51.05336,
        0.0334,
        6.8
      ],
      [
        -51.05344,
        0.03241,
        6.3
      ],
      [
        -51.05354,
        0.03102,
        8.5
      ],
      [
        -51.0536,
        0.03017,
        9.5
      ],
      [
        -51.05361,
        0.02994,
        9.8
      ],
      [
        -51.05364,
        0.02902,
        11.5
      ],
      [
        -51.05377,
        0.02782,
        8
      ],
      [
        -51.05292,
        0.02703,
        4
      ],
      [
        -51.05221,
        0.02765,
        4.3
      ],
      [
        -51.05301,
        0.02683,
        3.5
      ],
      [
        -51.05484,
        0.0249,
        4
      ],
      [
        -51.05508,
        0.02455,
        3.8
      ],
      [
        -51.05511,
        0.02287,
        3
      ],
      [
        -51.05514,
        0.02232,
        4
      ],
      [
        -51.05535,
        0.02203,
        5
      ],
      [
        -51.05571,
        0.0217,
        5.8
      ],
      [
        -51.05623,
        0.02084,
        4.3
      ],
      [
        -51.05637,
        0.01993,
        3.3
      ],
      [
        -51.05665,
        0.01583,
        5.8
      ]
    ],
    "waypoints": [
      [
        -51.0492,
        0.0312
      ],
      [
        -51.0535,
        0.0148
      ]
    ],
    "distanceKm": 3,
    "ascentM": 13,
    "descentM": 16,
    "safetyScore": 96,
    "originName": "Fortaleza de São José de Macapá",
    "destName": "Complexo Beira-Rio (Santa Inês)"
  },
  {
    "id": "curated-macapa-marco-zero-equador",
    "name": "Orla do Araxá → Monumento Marco Zero do Equador",
    "description": "Pedale literalmente entre os hemisférios Norte e Sul na ciclovia do Meio do Mundo.",
    "tag": "Linha do Equador • AP",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Macapá, AP",
    "profile": "safe",
    "coords": [
      [
        -51.06135,
        -0.00167,
        8.8
      ],
      [
        -51.06231,
        -0.00117,
        13.5
      ],
      [
        -51.06236,
        -0.0001,
        10.3
      ],
      [
        -51.06236,
        0.00049,
        6.8
      ],
      [
        -51.06338,
        0.00052,
        7.3
      ],
      [
        -51.06487,
        0.00054,
        5.8
      ],
      [
        -51.06504,
        -0.00004,
        5
      ],
      [
        -51.06556,
        0.00003,
        5
      ],
      [
        -51.06651,
        -0.00003,
        5.8
      ],
      [
        -51.06699,
        0.00009,
        6
      ],
      [
        -51.06713,
        0.00019,
        6
      ],
      [
        -51.06734,
        0.00057,
        6.5
      ],
      [
        -51.06806,
        0.00058,
        6.5
      ],
      [
        -51.06828,
        0.00086,
        6.8
      ],
      [
        -51.06889,
        0.00104,
        6.3
      ],
      [
        -51.07013,
        0.00133,
        6.3
      ],
      [
        -51.07046,
        0.00155,
        6
      ],
      [
        -51.07076,
        0.00202,
        6.3
      ],
      [
        -51.07083,
        0.00232,
        6.8
      ],
      [
        -51.07192,
        0.00512,
        6.3
      ],
      [
        -51.07244,
        0.00513,
        6.3
      ],
      [
        -51.07294,
        0.00501,
        6.5
      ],
      [
        -51.07316,
        0.0048,
        7
      ],
      [
        -51.07318,
        0.0024,
        7.5
      ],
      [
        -51.07525,
        0.00242,
        9.5
      ],
      [
        -51.07594,
        0.00066,
        9
      ],
      [
        -51.07696,
        0.00007,
        12
      ],
      [
        -51.0778,
        0.0002,
        14
      ]
    ],
    "waypoints": [
      [
        -51.0612,
        -0.0021
      ],
      [
        -51.0778,
        0.0002
      ]
    ],
    "distanceKm": 2.8,
    "ascentM": 16,
    "descentM": 11,
    "safetyScore": 94,
    "originName": "Orla do Araxá (Rio Amazonas)",
    "destName": "Monumento Marco Zero do Equador"
  },
  {
    "id": "curated-macapa-floriano-peixoto-forte",
    "name": "Parque do Forte → Praça Floriano Peixoto",
    "description": "Percurso arborizado pelo centro de Macapá conectando o Parque do Forte à Praça Floriano Peixoto.",
    "tag": "Centro Macapá • AP",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "isFavorite": false,
    "isCurated": true,
    "difficulty": "Fácil",
    "city": "Macapá, AP",
    "profile": "safe",
    "coords": [
      [
        -51.05091,
        0.03241,
        5.8
      ],
      [
        -51.05092,
        0.03222,
        6.3
      ],
      [
        -51.05155,
        0.03226,
        6.5
      ],
      [
        -51.05213,
        0.03231,
        7.3
      ],
      [
        -51.05344,
        0.03241,
        6.3
      ],
      [
        -51.05536,
        0.03255,
        7.8
      ],
      [
        -51.05662,
        0.03264,
        10
      ],
      [
        -51.05841,
        0.03278,
        7.8
      ],
      [
        -51.05832,
        0.03366,
        7.3
      ],
      [
        -51.0583,
        0.03388,
        7.5
      ],
      [
        -51.05828,
        0.03472,
        7.3
      ],
      [
        -51.05823,
        0.03559,
        7
      ],
      [
        -51.06016,
        0.03571,
        8
      ],
      [
        -51.06109,
        0.03579,
        11.8
      ],
      [
        -51.0618,
        0.03583,
        15.3
      ]
    ],
    "waypoints": [
      [
        -51.0508,
        0.0324
      ],
      [
        -51.0618,
        0.0358
      ]
    ],
    "distanceKm": 1.6,
    "ascentM": 14,
    "descentM": 4,
    "safetyScore": 92,
    "originName": "Parque do Forte (Beira-Rio)",
    "destName": "Praça Floriano Peixoto (Centro)"
  }
];

export const NATIONAL_CURATED_PLACES: PlaceResult[] = [
  {
    "id": "place-curated-goiania-flamboyant-vaca-brava-orig",
    "name": "Parque Flamboyant (Jardim Goiás)",
    "subtitle": "Goiânia - GO",
    "coords": [
      -49.2383,
      -16.7028
    ],
    "district": "Goiânia",
    "city": "Goiânia",
    "state": "GO",
    "source": "curated"
  },
  {
    "id": "place-curated-goiania-flamboyant-vaca-brava-dest",
    "name": "Parque Vaca Brava (Setor Bueno)",
    "subtitle": "Goiânia - GO",
    "coords": [
      -49.2711,
      -16.7091
    ],
    "district": "Goiânia",
    "city": "Goiânia",
    "state": "GO",
    "source": "curated"
  },
  {
    "id": "place-curated-goiania-civica-lago-rosas-orig",
    "name": "Praça Cívica (Centro)",
    "subtitle": "Goiânia - GO",
    "coords": [
      -49.2575,
      -16.6798
    ],
    "district": "Goiânia",
    "city": "Goiânia",
    "state": "GO",
    "source": "curated"
  },
  {
    "id": "place-curated-goiania-civica-lago-rosas-dest",
    "name": "Parque Lago das Rosas (Setor Oeste)",
    "subtitle": "Goiânia - GO",
    "coords": [
      -49.2775,
      -16.6742
    ],
    "district": "Goiânia",
    "city": "Goiânia",
    "state": "GO",
    "source": "curated"
  },
  {
    "id": "place-curated-goiania-areiao-universitario-orig",
    "name": "Parque Areião (Setor Marista)",
    "subtitle": "Goiânia - GO",
    "coords": [
      -49.2571,
      -16.7039
    ],
    "district": "Goiânia",
    "city": "Goiânia",
    "state": "GO",
    "source": "curated"
  },
  {
    "id": "place-curated-goiania-areiao-universitario-dest",
    "name": "Praça Universitária (Setor Leste)",
    "subtitle": "Goiânia - GO",
    "coords": [
      -49.2435,
      -16.6768
    ],
    "district": "Goiânia",
    "city": "Goiânia",
    "state": "GO",
    "source": "curated"
  },
  {
    "id": "place-curated-cg-afonso-pena-parque-nacoes-orig",
    "name": "Praça Ary Coelho (Centro)",
    "subtitle": "Campo Grande - MS",
    "coords": [
      -54.6164,
      -20.4628
    ],
    "district": "Campo Grande",
    "city": "Campo Grande",
    "state": "MS",
    "source": "curated"
  },
  {
    "id": "place-curated-cg-afonso-pena-parque-nacoes-dest",
    "name": "Parque das Nações Indígenas (Altos da Afonso Pena)",
    "subtitle": "Campo Grande - MS",
    "coords": [
      -54.5786,
      -20.4534
    ],
    "district": "Campo Grande",
    "city": "Campo Grande",
    "state": "MS",
    "source": "curated"
  },
  {
    "id": "place-curated-cg-orla-morena-orig",
    "name": "Orla Morena (Bairro Cabreúva)",
    "subtitle": "Campo Grande - MS",
    "coords": [
      -54.6292,
      -20.4631
    ],
    "district": "Campo Grande",
    "city": "Campo Grande",
    "state": "MS",
    "source": "curated"
  },
  {
    "id": "place-curated-cg-orla-morena-dest",
    "name": "Mirante Orla Morena (Vila Planalto)",
    "subtitle": "Campo Grande - MS",
    "coords": [
      -54.6348,
      -20.4435
    ],
    "district": "Campo Grande",
    "city": "Campo Grande",
    "state": "MS",
    "source": "curated"
  },
  {
    "id": "place-curated-cg-lago-amor-ufms-orig",
    "name": "Lago do Amor (Vila Ipiranga)",
    "subtitle": "Campo Grande - MS",
    "coords": [
      -54.6143,
      -20.5021
    ],
    "district": "Campo Grande",
    "city": "Campo Grande",
    "state": "MS",
    "source": "curated"
  },
  {
    "id": "place-curated-cg-lago-amor-ufms-dest",
    "name": "Reitoria UFMS (Cidade Universitária)",
    "subtitle": "Campo Grande - MS",
    "coords": [
      -54.6194,
      -20.4958
    ],
    "district": "Campo Grande",
    "city": "Campo Grande",
    "state": "MS",
    "source": "curated"
  },
  {
    "id": "place-curated-cuiaba-mae-bonifacia-aguas-orig",
    "name": "Parque Mãe Bonifácia (Duque de Caxias)",
    "subtitle": "Cuiabá - MT",
    "coords": [
      -56.0884,
      -15.5778
    ],
    "district": "Cuiabá",
    "city": "Cuiabá",
    "state": "MT",
    "source": "curated"
  },
  {
    "id": "place-curated-cuiaba-mae-bonifacia-aguas-dest",
    "name": "Parque das Águas (Centro Político)",
    "subtitle": "Cuiabá - MT",
    "coords": [
      -56.0715,
      -15.5681
    ],
    "district": "Cuiabá",
    "city": "Cuiabá",
    "state": "MT",
    "source": "curated"
  },
  {
    "id": "place-curated-cuiaba-orla-porto-centro-orig",
    "name": "Orla do Porto (Rio Cuiabá)",
    "subtitle": "Cuiabá - MT",
    "coords": [
      -56.1079,
      -15.6114
    ],
    "district": "Cuiabá",
    "city": "Cuiabá",
    "state": "MT",
    "source": "curated"
  },
  {
    "id": "place-curated-cuiaba-orla-porto-centro-dest",
    "name": "Praça Alencastro (Centro Histórico)",
    "subtitle": "Cuiabá - MT",
    "coords": [
      -56.0967,
      -15.5982
    ],
    "district": "Cuiabá",
    "city": "Cuiabá",
    "state": "MT",
    "source": "curated"
  },
  {
    "id": "place-curated-cuiaba-ufmt-tia-nair-orig",
    "name": "Universidade Federal de Mato Grosso (UFMT)",
    "subtitle": "Cuiabá - MT",
    "coords": [
      -56.0628,
      -15.6087
    ],
    "district": "Cuiabá",
    "city": "Cuiabá",
    "state": "MT",
    "source": "curated"
  },
  {
    "id": "place-curated-cuiaba-ufmt-tia-nair-dest",
    "name": "Parque Tia Nair (Jardim Itália)",
    "subtitle": "Cuiabá - MT",
    "coords": [
      -56.0468,
      -15.6022
    ],
    "district": "Cuiabá",
    "city": "Cuiabá",
    "state": "MT",
    "source": "curated"
  },
  {
    "id": "place-curated-sp-paulista-ibirapuera-orig",
    "name": "MASP / Av. Paulista (Bela Vista)",
    "subtitle": "São Paulo - SP",
    "coords": [
      -46.6559,
      -23.5614
    ],
    "district": "São Paulo",
    "city": "São Paulo",
    "state": "SP",
    "source": "curated"
  },
  {
    "id": "place-curated-sp-paulista-ibirapuera-dest",
    "name": "Parque Ibirapuera (Portão 10)",
    "subtitle": "São Paulo - SP",
    "coords": [
      -46.6576,
      -23.5874
    ],
    "district": "São Paulo",
    "city": "São Paulo",
    "state": "SP",
    "source": "curated"
  },
  {
    "id": "place-curated-sp-rio-pinheiros-vila-lobos-orig",
    "name": "Acesso Vila Olímpia (Ciclovia Rio Pinheiros)",
    "subtitle": "São Paulo - SP",
    "coords": [
      -46.6915,
      -23.5947
    ],
    "district": "São Paulo",
    "city": "São Paulo",
    "state": "SP",
    "source": "curated"
  },
  {
    "id": "place-curated-sp-rio-pinheiros-vila-lobos-dest",
    "name": "Parque Villa-Lobos (Alto de Pinheiros)",
    "subtitle": "São Paulo - SP",
    "coords": [
      -46.7218,
      -23.5469
    ],
    "district": "São Paulo",
    "city": "São Paulo",
    "state": "SP",
    "source": "curated"
  },
  {
    "id": "place-curated-sp-faria-lima-usp-orig",
    "name": "Largo da Batata / Estação Faria Lima (Pinheiros)",
    "subtitle": "São Paulo - SP",
    "coords": [
      -46.6941,
      -23.5672
    ],
    "district": "São Paulo",
    "city": "São Paulo",
    "state": "SP",
    "source": "curated"
  },
  {
    "id": "place-curated-sp-faria-lima-usp-dest",
    "name": "Praça do Relógio (Cidade Universitária USP)",
    "subtitle": "São Paulo - SP",
    "coords": [
      -46.7302,
      -23.5612
    ],
    "district": "São Paulo",
    "city": "São Paulo",
    "state": "SP",
    "source": "curated"
  },
  {
    "id": "place-curated-rj-copacabana-leblon-orig",
    "name": "Praia do Leme / Av. Atlântica (Copacabana)",
    "subtitle": "Rio de Janeiro - RJ",
    "coords": [
      -43.1669,
      -22.9634
    ],
    "district": "Rio de Janeiro",
    "city": "Rio de Janeiro",
    "state": "RJ",
    "source": "curated"
  },
  {
    "id": "place-curated-rj-copacabana-leblon-dest",
    "name": "Mirante do Leblon (Posto 12)",
    "subtitle": "Rio de Janeiro - RJ",
    "coords": [
      -43.2291,
      -22.9879
    ],
    "district": "Rio de Janeiro",
    "city": "Rio de Janeiro",
    "state": "RJ",
    "source": "curated"
  },
  {
    "id": "place-curated-rj-volta-lagoa-rodrigo-freitas-orig",
    "name": "Parque dos Patins (Lagoa Rodrigo de Freitas)",
    "subtitle": "Rio de Janeiro - RJ",
    "coords": [
      -43.2165,
      -22.9672
    ],
    "district": "Rio de Janeiro",
    "city": "Rio de Janeiro",
    "state": "RJ",
    "source": "curated"
  },
  {
    "id": "place-curated-rj-volta-lagoa-rodrigo-freitas-dest",
    "name": "Jardim Botânico do Rio de Janeiro",
    "subtitle": "Rio de Janeiro - RJ",
    "coords": [
      -43.2248,
      -22.9679
    ],
    "district": "Rio de Janeiro",
    "city": "Rio de Janeiro",
    "state": "RJ",
    "source": "curated"
  },
  {
    "id": "place-curated-rj-aterro-flamengo-marina-orig",
    "name": "Enseada de Botafogo (Mourisco)",
    "subtitle": "Rio de Janeiro - RJ",
    "coords": [
      -43.1794,
      -22.9488
    ],
    "district": "Rio de Janeiro",
    "city": "Rio de Janeiro",
    "state": "RJ",
    "source": "curated"
  },
  {
    "id": "place-curated-rj-aterro-flamengo-marina-dest",
    "name": "Praça Mauá / Museu do Amanhã (Centro)",
    "subtitle": "Rio de Janeiro - RJ",
    "coords": [
      -43.1795,
      -22.8951
    ],
    "district": "Rio de Janeiro",
    "city": "Rio de Janeiro",
    "state": "RJ",
    "source": "curated"
  },
  {
    "id": "place-curated-bh-volta-lagoa-pampulha-orig",
    "name": "Igreja São Francisco de Assis (Pampulha)",
    "subtitle": "Belo Horizonte - MG",
    "coords": [
      -43.9789,
      -19.8584
    ],
    "district": "Belo Horizonte",
    "city": "Belo Horizonte",
    "state": "MG",
    "source": "curated"
  },
  {
    "id": "place-curated-bh-volta-lagoa-pampulha-dest",
    "name": "Esplanada do Mineirão (Pampulha)",
    "subtitle": "Belo Horizonte - MG",
    "coords": [
      -43.9711,
      -19.8658
    ],
    "district": "Belo Horizonte",
    "city": "Belo Horizonte",
    "state": "MG",
    "source": "curated"
  },
  {
    "id": "place-curated-bh-liberdade-savassi-mangabeiras-orig",
    "name": "Praça da Liberdade (Funcionários)",
    "subtitle": "Belo Horizonte - MG",
    "coords": [
      -43.9382,
      -19.9321
    ],
    "district": "Belo Horizonte",
    "city": "Belo Horizonte",
    "state": "MG",
    "source": "curated"
  },
  {
    "id": "place-curated-bh-liberdade-savassi-mangabeiras-dest",
    "name": "Praça do Papa (Mangabeiras)",
    "subtitle": "Belo Horizonte - MG",
    "coords": [
      -43.9142,
      -19.9562
    ],
    "district": "Belo Horizonte",
    "city": "Belo Horizonte",
    "state": "MG",
    "source": "curated"
  },
  {
    "id": "place-curated-bh-andradas-parque-municipal-orig",
    "name": "Estação Santa Efigênia (Av. dos Andradas)",
    "subtitle": "Belo Horizonte - MG",
    "coords": [
      -43.9175,
      -19.9225
    ],
    "district": "Belo Horizonte",
    "city": "Belo Horizonte",
    "state": "MG",
    "source": "curated"
  },
  {
    "id": "place-curated-bh-andradas-parque-municipal-dest",
    "name": "Parque Municipal Américo Renné Giannetti (Centro)",
    "subtitle": "Belo Horizonte - MG",
    "coords": [
      -43.9344,
      -19.9234
    ],
    "district": "Belo Horizonte",
    "city": "Belo Horizonte",
    "state": "MG",
    "source": "curated"
  },
  {
    "id": "place-curated-vitoria-orla-camburi-orig",
    "name": "Píer de Iemanjá (Praia de Camburi)",
    "subtitle": "Vitória - ES",
    "coords": [
      -40.2909,
      -20.2896
    ],
    "district": "Vitória",
    "city": "Vitória",
    "state": "ES",
    "source": "curated"
  },
  {
    "id": "place-curated-vitoria-orla-camburi-dest",
    "name": "Final da Orla de Jardim Camburi",
    "subtitle": "Vitória - ES",
    "coords": [
      -40.2649,
      -20.2586
    ],
    "district": "Vitória",
    "city": "Vitória",
    "state": "ES",
    "source": "curated"
  },
  {
    "id": "place-curated-vitoria-namorados-curva-jurema-orig",
    "name": "Praça dos Namorados (Praia do Canto)",
    "subtitle": "Vitória - ES",
    "coords": [
      -40.2932,
      -20.2995
    ],
    "district": "Vitória",
    "city": "Vitória",
    "state": "ES",
    "source": "curated"
  },
  {
    "id": "place-curated-vitoria-namorados-curva-jurema-dest",
    "name": "Curva da Jurema (Enseada do Suá)",
    "subtitle": "Vitória - ES",
    "coords": [
      -40.2874,
      -20.3118
    ],
    "district": "Vitória",
    "city": "Vitória",
    "state": "ES",
    "source": "curated"
  },
  {
    "id": "place-curated-vitoria-ufes-pedra-cebola-orig",
    "name": "Teatro Universitário UFES (Goiabeiras)",
    "subtitle": "Vitória - ES",
    "coords": [
      -40.3046,
      -20.2768
    ],
    "district": "Vitória",
    "city": "Vitória",
    "state": "ES",
    "source": "curated"
  },
  {
    "id": "place-curated-vitoria-ufes-pedra-cebola-dest",
    "name": "Parque Pedra da Cebola (Mata da Praia)",
    "subtitle": "Vitória - ES",
    "coords": [
      -40.2968,
      -20.2761
    ],
    "district": "Vitória",
    "city": "Vitória",
    "state": "ES",
    "source": "curated"
  },
  {
    "id": "place-curated-curitiba-barigui-centro-civico-orig",
    "name": "Parque Barigui (Santo Inácio)",
    "subtitle": "Curitiba - PR",
    "coords": [
      -49.3072,
      -25.4264
    ],
    "district": "Curitiba",
    "city": "Curitiba",
    "state": "PR",
    "source": "curated"
  },
  {
    "id": "place-curated-curitiba-barigui-centro-civico-dest",
    "name": "Museu Oscar Niemeyer (Centro Cívico)",
    "subtitle": "Curitiba - PR",
    "coords": [
      -49.2671,
      -25.4103
    ],
    "district": "Curitiba",
    "city": "Curitiba",
    "state": "PR",
    "source": "curated"
  },
  {
    "id": "place-curated-curitiba-jardim-botanico-sete-setembro-orig",
    "name": "Jardim Botânico de Curitiba",
    "subtitle": "Curitiba - PR",
    "coords": [
      -49.2391,
      -25.4429
    ],
    "district": "Curitiba",
    "city": "Curitiba",
    "state": "PR",
    "source": "curated"
  },
  {
    "id": "place-curated-curitiba-jardim-botanico-sete-setembro-dest",
    "name": "Praça do Japão (Batel)",
    "subtitle": "Curitiba - PR",
    "coords": [
      -49.2869,
      -25.4446
    ],
    "district": "Curitiba",
    "city": "Curitiba",
    "state": "PR",
    "source": "curated"
  },
  {
    "id": "place-curated-curitiba-sao-lourenco-tingui-orig",
    "name": "Parque São Lourenço",
    "subtitle": "Curitiba - PR",
    "coords": [
      -49.2654,
      -25.3845
    ],
    "district": "Curitiba",
    "city": "Curitiba",
    "state": "PR",
    "source": "curated"
  },
  {
    "id": "place-curated-curitiba-sao-lourenco-tingui-dest",
    "name": "Memorial Ucraniano (Parque Tingui)",
    "subtitle": "Curitiba - PR",
    "coords": [
      -49.3054,
      -25.3911
    ],
    "district": "Curitiba",
    "city": "Curitiba",
    "state": "PR",
    "source": "curated"
  },
  {
    "id": "place-curated-floripa-beira-mar-hercilio-luz-orig",
    "name": "Trapiche da Beira-Mar Norte (Centro)",
    "subtitle": "Florianópolis - SC",
    "coords": [
      -48.5472,
      -27.5851
    ],
    "district": "Florianópolis",
    "city": "Florianópolis",
    "state": "SC",
    "source": "curated"
  },
  {
    "id": "place-curated-floripa-beira-mar-hercilio-luz-dest",
    "name": "Mirante da Ponte Hercílio Luz",
    "subtitle": "Florianópolis - SC",
    "coords": [
      -48.5621,
      -27.5938
    ],
    "district": "Florianópolis",
    "city": "Florianópolis",
    "state": "SC",
    "source": "curated"
  },
  {
    "id": "place-curated-floripa-ufsc-carianos-orig",
    "name": "Praça da Cidadania (UFSC Trindade)",
    "subtitle": "Florianópolis - SC",
    "coords": [
      -48.5194,
      -27.6005
    ],
    "district": "Florianópolis",
    "city": "Florianópolis",
    "state": "SC",
    "source": "curated"
  },
  {
    "id": "place-curated-floripa-ufsc-carianos-dest",
    "name": "Parque Ecológico do Córrego Grande",
    "subtitle": "Florianópolis - SC",
    "coords": [
      -48.5082,
      -27.5971
    ],
    "district": "Florianópolis",
    "city": "Florianópolis",
    "state": "SC",
    "source": "curated"
  },
  {
    "id": "place-curated-floripa-beira-mar-continental-orig",
    "name": "Beira-Mar Continental (Balneário do Estreito)",
    "subtitle": "Florianópolis - SC",
    "coords": [
      -48.5754,
      -27.5849
    ],
    "district": "Florianópolis",
    "city": "Florianópolis",
    "state": "SC",
    "source": "curated"
  },
  {
    "id": "place-curated-floripa-beira-mar-continental-dest",
    "name": "Parque de Coqueiros",
    "subtitle": "Florianópolis - SC",
    "coords": [
      -48.5789,
      -27.6061
    ],
    "district": "Florianópolis",
    "city": "Florianópolis",
    "state": "SC",
    "source": "curated"
  },
  {
    "id": "place-curated-poa-orla-guaiba-marinha-orig",
    "name": "Usina do Gasômetro (Orla Trecho 1)",
    "subtitle": "Porto Alegre - RS",
    "coords": [
      -51.2412,
      -30.0342
    ],
    "district": "Porto Alegre",
    "city": "Porto Alegre",
    "state": "RS",
    "source": "curated"
  },
  {
    "id": "place-curated-poa-orla-guaiba-marinha-dest",
    "name": "Parque Marinha do Brasil (Praia de Belas)",
    "subtitle": "Porto Alegre - RS",
    "coords": [
      -51.2315,
      -30.0598
    ],
    "district": "Porto Alegre",
    "city": "Porto Alegre",
    "state": "RS",
    "source": "curated"
  },
  {
    "id": "place-curated-poa-redencao-ipiranga-orig",
    "name": "Arco da Redenção (Parque Farroupilha)",
    "subtitle": "Porto Alegre - RS",
    "coords": [
      -51.2179,
      -30.0378
    ],
    "district": "Porto Alegre",
    "city": "Porto Alegre",
    "state": "RS",
    "source": "curated"
  },
  {
    "id": "place-curated-poa-redencao-ipiranga-dest",
    "name": "Museu de Ciências e Tecnologia PUCRS (Partenon)",
    "subtitle": "Porto Alegre - RS",
    "coords": [
      -51.1755,
      -30.0574
    ],
    "district": "Porto Alegre",
    "city": "Porto Alegre",
    "state": "RS",
    "source": "curated"
  },
  {
    "id": "place-curated-poa-moinhos-parcão-redencao-orig",
    "name": "Parque Moinhos de Vento (Parcão)",
    "subtitle": "Porto Alegre - RS",
    "coords": [
      -51.2015,
      -30.0266
    ],
    "district": "Porto Alegre",
    "city": "Porto Alegre",
    "state": "RS",
    "source": "curated"
  },
  {
    "id": "place-curated-poa-moinhos-parcão-redencao-dest",
    "name": "Largo Zumbi dos Palmares (Cidade Baixa)",
    "subtitle": "Porto Alegre - RS",
    "coords": [
      -51.2219,
      -30.0419
    ],
    "district": "Porto Alegre",
    "city": "Porto Alegre",
    "state": "RS",
    "source": "curated"
  },
  {
    "id": "place-curated-fortaleza-beira-mar-mucuripe-orig",
    "name": "Estátua de Iracema Guardiã (Praia de Iracema)",
    "subtitle": "Fortaleza - CE",
    "coords": [
      -38.5142,
      -3.7195
    ],
    "district": "Fortaleza",
    "city": "Fortaleza",
    "state": "CE",
    "source": "curated"
  },
  {
    "id": "place-curated-fortaleza-beira-mar-mucuripe-dest",
    "name": "Mercado dos Peixes (Mucuripe)",
    "subtitle": "Fortaleza - CE",
    "coords": [
      -38.4778,
      -3.7229
    ],
    "district": "Fortaleza",
    "city": "Fortaleza",
    "state": "CE",
    "source": "curated"
  },
  {
    "id": "place-curated-fortaleza-coco-aldeota-orig",
    "name": "Anfiteatro do Parque do Cocó",
    "subtitle": "Fortaleza - CE",
    "coords": [
      -38.4859,
      -3.7453
    ],
    "district": "Fortaleza",
    "city": "Fortaleza",
    "state": "CE",
    "source": "curated"
  },
  {
    "id": "place-curated-fortaleza-coco-aldeota-dest",
    "name": "Praça Portugal (Aldeota)",
    "subtitle": "Fortaleza - CE",
    "coords": [
      -38.4972,
      -3.7332
    ],
    "district": "Fortaleza",
    "city": "Fortaleza",
    "state": "CE",
    "source": "curated"
  },
  {
    "id": "place-curated-fortaleza-benfica-dragao-mar-orig",
    "name": "Reitoria UFC (Benfica)",
    "subtitle": "Fortaleza - CE",
    "coords": [
      -38.5385,
      -3.7405
    ],
    "district": "Fortaleza",
    "city": "Fortaleza",
    "state": "CE",
    "source": "curated"
  },
  {
    "id": "place-curated-fortaleza-benfica-dragao-mar-dest",
    "name": "Centro Dragão do Mar (Praia de Iracema)",
    "subtitle": "Fortaleza - CE",
    "coords": [
      -38.5194,
      -3.7219
    ],
    "district": "Fortaleza",
    "city": "Fortaleza",
    "state": "CE",
    "source": "curated"
  },
  {
    "id": "place-curated-salvador-barra-rio-vermelho-orig",
    "name": "Farol da Barra (Santo Antônio da Barra)",
    "subtitle": "Salvador - BA",
    "coords": [
      -38.5328,
      -13.0103
    ],
    "district": "Salvador",
    "city": "Salvador",
    "state": "BA",
    "source": "curated"
  },
  {
    "id": "place-curated-salvador-barra-rio-vermelho-dest",
    "name": "Casa do Rio Vermelho / Largo da Mariquita",
    "subtitle": "Salvador - BA",
    "coords": [
      -38.4892,
      -13.0132
    ],
    "district": "Salvador",
    "city": "Salvador",
    "state": "BA",
    "source": "curated"
  },
  {
    "id": "place-curated-salvador-pituba-jardim-alah-orig",
    "name": "Parque Cidade Jovem / Orla da Pituba",
    "subtitle": "Salvador - BA",
    "coords": [
      -38.4602,
      -13.0054
    ],
    "district": "Salvador",
    "city": "Salvador",
    "state": "BA",
    "source": "curated"
  },
  {
    "id": "place-curated-salvador-pituba-jardim-alah-dest",
    "name": "Jardim de Alah (Costa Azul)",
    "subtitle": "Salvador - BA",
    "coords": [
      -38.4375,
      -12.9879
    ],
    "district": "Salvador",
    "city": "Salvador",
    "state": "BA",
    "source": "curated"
  },
  {
    "id": "place-curated-salvador-dique-tororo-campo-grande-orig",
    "name": "Dique do Tororó (Arena Fonte Nova)",
    "subtitle": "Salvador - BA",
    "coords": [
      -38.5059,
      -12.9831
    ],
    "district": "Salvador",
    "city": "Salvador",
    "state": "BA",
    "source": "curated"
  },
  {
    "id": "place-curated-salvador-dique-tororo-campo-grande-dest",
    "name": "Praça 2 de Julho (Campo Grande)",
    "subtitle": "Salvador - BA",
    "coords": [
      -38.5214,
      -12.9889
    ],
    "district": "Salvador",
    "city": "Salvador",
    "state": "BA",
    "source": "curated"
  },
  {
    "id": "place-curated-recife-orla-boa-viagem-orig",
    "name": "Praia do Pina (Início da Orla)",
    "subtitle": "Recife - PE",
    "coords": [
      -34.8832,
      -8.0954
    ],
    "district": "Recife",
    "city": "Recife",
    "state": "PE",
    "source": "curated"
  },
  {
    "id": "place-curated-recife-orla-boa-viagem-dest",
    "name": "Pracinha de Boa Viagem (Igreja N. Sra. da Boa Viagem)",
    "subtitle": "Recife - PE",
    "coords": [
      -34.8975,
      -8.1319
    ],
    "district": "Recife",
    "city": "Recife",
    "state": "PE",
    "source": "curated"
  },
  {
    "id": "place-curated-recife-marco-zero-aurora-orig",
    "name": "Praça do Marco Zero (Recife Antigo)",
    "subtitle": "Recife - PE",
    "coords": [
      -34.8711,
      -8.0631
    ],
    "district": "Recife",
    "city": "Recife",
    "state": "PE",
    "source": "curated"
  },
  {
    "id": "place-curated-recife-marco-zero-aurora-dest",
    "name": "Rua da Aurora / Parque Treze de Maio",
    "subtitle": "Recife - PE",
    "coords": [
      -34.8808,
      -8.0568
    ],
    "district": "Recife",
    "city": "Recife",
    "state": "PE",
    "source": "curated"
  },
  {
    "id": "place-curated-recife-jaqueira-casa-forte-orig",
    "name": "Parque da Jaqueira (Graças)",
    "subtitle": "Recife - PE",
    "coords": [
      -34.9041,
      -8.0372
    ],
    "district": "Recife",
    "city": "Recife",
    "state": "PE",
    "source": "curated"
  },
  {
    "id": "place-curated-recife-jaqueira-casa-forte-dest",
    "name": "Praça de Casa Forte",
    "subtitle": "Recife - PE",
    "coords": [
      -34.9182,
      -8.0345
    ],
    "district": "Recife",
    "city": "Recife",
    "state": "PE",
    "source": "curated"
  },
  {
    "id": "place-curated-natal-ponta-negra-via-costeira-orig",
    "name": "Calçadão de Ponta Negra (Morro do Careca)",
    "subtitle": "Natal - RN",
    "coords": [
      -35.1695,
      -5.8812
    ],
    "district": "Natal",
    "city": "Natal",
    "state": "RN",
    "source": "curated"
  },
  {
    "id": "place-curated-natal-ponta-negra-via-costeira-dest",
    "name": "Farol de Mãe Luíza (Via Costeira)",
    "subtitle": "Natal - RN",
    "coords": [
      -35.1778,
      -5.8265
    ],
    "district": "Natal",
    "city": "Natal",
    "state": "RN",
    "source": "curated"
  },
  {
    "id": "place-curated-natal-ufrn-bosque-namorados-orig",
    "name": "Reitoria UFRN (Lagoa Nova)",
    "subtitle": "Natal - RN",
    "coords": [
      -35.2008,
      -5.8396
    ],
    "district": "Natal",
    "city": "Natal",
    "state": "RN",
    "source": "curated"
  },
  {
    "id": "place-curated-natal-ufrn-bosque-namorados-dest",
    "name": "Bosque dos Namorados (Parque das Dunas)",
    "subtitle": "Natal - RN",
    "coords": [
      -35.1972,
      -5.8124
    ],
    "district": "Natal",
    "city": "Natal",
    "state": "RN",
    "source": "curated"
  },
  {
    "id": "place-curated-natal-praia-meio-forte-reis-magos-orig",
    "name": "Praia dos Artistas (Areia Preta)",
    "subtitle": "Natal - RN",
    "coords": [
      -35.1932,
      -5.7798
    ],
    "district": "Natal",
    "city": "Natal",
    "state": "RN",
    "source": "curated"
  },
  {
    "id": "place-curated-natal-praia-meio-forte-reis-magos-dest",
    "name": "Forte dos Reis Magos (Praia do Forte)",
    "subtitle": "Natal - RN",
    "coords": [
      -35.1948,
      -5.7568
    ],
    "district": "Natal",
    "city": "Natal",
    "state": "RN",
    "source": "curated"
  },
  {
    "id": "place-curated-jp-tambau-cabo-branco-orig",
    "name": "Busto de Tamandaré (Praia de Tambaú)",
    "subtitle": "João Pessoa - PB",
    "coords": [
      -34.8235,
      -7.1189
    ],
    "district": "João Pessoa",
    "city": "João Pessoa",
    "state": "PB",
    "source": "curated"
  },
  {
    "id": "place-curated-jp-tambau-cabo-branco-dest",
    "name": "Farol do Cabo Branco / Estação Ciência",
    "subtitle": "João Pessoa - PB",
    "coords": [
      -34.7982,
      -7.1485
    ],
    "district": "João Pessoa",
    "city": "João Pessoa",
    "state": "PB",
    "source": "curated"
  },
  {
    "id": "place-curated-jp-epitacio-lagoa-orig",
    "name": "Praça da Independência (Tambiá)",
    "subtitle": "João Pessoa - PB",
    "coords": [
      -34.8648,
      -7.1185
    ],
    "district": "João Pessoa",
    "city": "João Pessoa",
    "state": "PB",
    "source": "curated"
  },
  {
    "id": "place-curated-jp-epitacio-lagoa-dest",
    "name": "Parque Solon de Lucena (Lagoa)",
    "subtitle": "João Pessoa - PB",
    "coords": [
      -34.8812,
      -7.1211
    ],
    "district": "João Pessoa",
    "city": "João Pessoa",
    "state": "PB",
    "source": "curated"
  },
  {
    "id": "place-curated-jp-bessa-manaira-orig",
    "name": "Orla de Manaíra (Mag Shopping)",
    "subtitle": "João Pessoa - PB",
    "coords": [
      -34.8318,
      -7.0982
    ],
    "district": "João Pessoa",
    "city": "João Pessoa",
    "state": "PB",
    "source": "curated"
  },
  {
    "id": "place-curated-jp-bessa-manaira-dest",
    "name": "Parque Parahyba I (Bessa)",
    "subtitle": "João Pessoa - PB",
    "coords": [
      -34.8358,
      -7.0752
    ],
    "district": "João Pessoa",
    "city": "João Pessoa",
    "state": "PB",
    "source": "curated"
  },
  {
    "id": "place-curated-maceio-pajucara-jatiuca-orig",
    "name": "Feirinha de Artesanato da Pajuçara",
    "subtitle": "Maceió - AL",
    "coords": [
      -35.7145,
      -9.6731
    ],
    "district": "Maceió",
    "city": "Maceió",
    "state": "AL",
    "source": "curated"
  },
  {
    "id": "place-curated-maceio-pajucara-jatiuca-dest",
    "name": "Orla de Jatiúca / Cruz das Almas",
    "subtitle": "Maceió - AL",
    "coords": [
      -35.6992,
      -9.6481
    ],
    "district": "Maceió",
    "city": "Maceió",
    "state": "AL",
    "source": "curated"
  },
  {
    "id": "place-curated-maceio-jaragua-pontal-orig",
    "name": "Praça Marcílio Dias (Jaraguá)",
    "subtitle": "Maceió - AL",
    "coords": [
      -35.7248,
      -9.6738
    ],
    "district": "Maceió",
    "city": "Maceió",
    "state": "AL",
    "source": "curated"
  },
  {
    "id": "place-curated-maceio-jaragua-pontal-dest",
    "name": "Pontal da Barra (Orla Lagunar)",
    "subtitle": "Maceió - AL",
    "coords": [
      -35.7695,
      -9.6962
    ],
    "district": "Maceió",
    "city": "Maceió",
    "state": "AL",
    "source": "curated"
  },
  {
    "id": "place-curated-maceio-ufal-fernandes-lima-orig",
    "name": "Praça do Centenário (Farol)",
    "subtitle": "Maceió - AL",
    "coords": [
      -35.7385,
      -9.6392
    ],
    "district": "Maceió",
    "city": "Maceió",
    "state": "AL",
    "source": "curated"
  },
  {
    "id": "place-curated-maceio-ufal-fernandes-lima-dest",
    "name": "Praça Visconde de Sinimbu / Centro",
    "subtitle": "Maceió - AL",
    "coords": [
      -35.7351,
      -9.6661
    ],
    "district": "Maceió",
    "city": "Maceió",
    "state": "AL",
    "source": "curated"
  },
  {
    "id": "place-curated-aracaju-orla-atalaia-orig",
    "name": "Oceanário / Arcos da Orla de Atalaia",
    "subtitle": "Aracaju - SE",
    "coords": [
      -37.0398,
      -10.9765
    ],
    "district": "Aracaju",
    "city": "Aracaju",
    "state": "SE",
    "source": "curated"
  },
  {
    "id": "place-curated-aracaju-orla-atalaia-dest",
    "name": "Passarela do Caranguejo (Atalaia)",
    "subtitle": "Aracaju - SE",
    "coords": [
      -37.0512,
      -10.9942
    ],
    "district": "Aracaju",
    "city": "Aracaju",
    "state": "SE",
    "source": "curated"
  },
  {
    "id": "place-curated-aracaju-13-julho-sementeira-orig",
    "name": "Calçadão e Mirante da 13 de Julho",
    "subtitle": "Aracaju - SE",
    "coords": [
      -37.0472,
      -10.9331
    ],
    "district": "Aracaju",
    "city": "Aracaju",
    "state": "SE",
    "source": "curated"
  },
  {
    "id": "place-curated-aracaju-13-julho-sementeira-dest",
    "name": "Parque Augusto Franco (Sementeira)",
    "subtitle": "Aracaju - SE",
    "coords": [
      -37.0568,
      -10.9461
    ],
    "district": "Aracaju",
    "city": "Aracaju",
    "state": "SE",
    "source": "curated"
  },
  {
    "id": "place-curated-aracaju-mercados-centro-orig",
    "name": "Mercado Thales Ferraz (Centro Histórico)",
    "subtitle": "Aracaju - SE",
    "coords": [
      -37.0488,
      -10.9092
    ],
    "district": "Aracaju",
    "city": "Aracaju",
    "state": "SE",
    "source": "curated"
  },
  {
    "id": "place-curated-aracaju-mercados-centro-dest",
    "name": "Orla do Bairro Industrial (Ponte Aracaju-Barra)",
    "subtitle": "Aracaju - SE",
    "coords": [
      -37.0482,
      -10.8924
    ],
    "district": "Aracaju",
    "city": "Aracaju",
    "state": "SE",
    "source": "curated"
  },
  {
    "id": "place-curated-teresina-raul-lopes-estaiada-orig",
    "name": "Parque Potycabana (Noivos)",
    "subtitle": "Teresina - PI",
    "coords": [
      -42.7905,
      -5.0872
    ],
    "district": "Teresina",
    "city": "Teresina",
    "state": "PI",
    "source": "curated"
  },
  {
    "id": "place-curated-teresina-raul-lopes-estaiada-dest",
    "name": "Complexo Turístico Ponte Estaiada",
    "subtitle": "Teresina - PI",
    "coords": [
      -42.7989,
      -5.0695
    ],
    "district": "Teresina",
    "city": "Teresina",
    "state": "PI",
    "source": "curated"
  },
  {
    "id": "place-curated-teresina-cidadania-ufpi-orig",
    "name": "Parque da Cidadania (Av. Frei Serafim)",
    "subtitle": "Teresina - PI",
    "coords": [
      -42.8054,
      -5.0852
    ],
    "district": "Teresina",
    "city": "Teresina",
    "state": "PI",
    "source": "curated"
  },
  {
    "id": "place-curated-teresina-cidadania-ufpi-dest",
    "name": "Reitoria UFPI (Ininga)",
    "subtitle": "Teresina - PI",
    "coords": [
      -42.7892,
      -5.0581
    ],
    "district": "Teresina",
    "city": "Teresina",
    "state": "PI",
    "source": "curated"
  },
  {
    "id": "place-curated-teresina-encontro-rios-orig",
    "name": "Parque Ambiental Lagoas do Norte",
    "subtitle": "Teresina - PI",
    "coords": [
      -42.8214,
      -5.0528
    ],
    "district": "Teresina",
    "city": "Teresina",
    "state": "PI",
    "source": "curated"
  },
  {
    "id": "place-curated-teresina-encontro-rios-dest",
    "name": "Parque Ambiental Encontro dos Rios",
    "subtitle": "Teresina - PI",
    "coords": [
      -42.8338,
      -5.0338
    ],
    "district": "Teresina",
    "city": "Teresina",
    "state": "PI",
    "source": "curated"
  },
  {
    "id": "place-curated-slz-litoranea-calhau-orig",
    "name": "Praça dos Pescadores (Praia de São Marcos)",
    "subtitle": "São Luís - MA",
    "coords": [
      -44.2835,
      -2.4865
    ],
    "district": "São Luís",
    "city": "São Luís",
    "state": "MA",
    "source": "curated"
  },
  {
    "id": "place-curated-slz-litoranea-calhau-dest",
    "name": "Orla da Praia do Calhau",
    "subtitle": "São Luís - MA",
    "coords": [
      -44.2542,
      -2.4828
    ],
    "district": "São Luís",
    "city": "São Luís",
    "state": "MA",
    "source": "curated"
  },
  {
    "id": "place-curated-slz-lagoa-jansen-espigao-orig",
    "name": "Parque Ecológico da Lagoa da Jansen",
    "subtitle": "São Luís - MA",
    "coords": [
      -44.3018,
      -2.4982
    ],
    "district": "São Luís",
    "city": "São Luís",
    "state": "MA",
    "source": "curated"
  },
  {
    "id": "place-curated-slz-lagoa-jansen-espigao-dest",
    "name": "Espigão Costeiro da Ponta d’Areia",
    "subtitle": "São Luís - MA",
    "coords": [
      -44.3168,
      -2.4892
    ],
    "district": "São Luís",
    "city": "São Luís",
    "state": "MA",
    "source": "curated"
  },
  {
    "id": "place-curated-slz-centro-historico-remedios-orig",
    "name": "Palácio dos Leões (Centro Histórico)",
    "subtitle": "São Luís - MA",
    "coords": [
      -44.3068,
      -2.5282
    ],
    "district": "São Luís",
    "city": "São Luís",
    "state": "MA",
    "source": "curated"
  },
  {
    "id": "place-curated-slz-centro-historico-remedios-dest",
    "name": "Mirante da Praça Gonçalves Dias (Remédios)",
    "subtitle": "São Luís - MA",
    "coords": [
      -44.2974,
      -2.5218
    ],
    "district": "São Luís",
    "city": "São Luís",
    "state": "MA",
    "source": "curated"
  },
  {
    "id": "place-curated-belem-docas-forte-presepio-orig",
    "name": "Estação das Docas (Campina)",
    "subtitle": "Belém - PA",
    "coords": [
      -48.4969,
      -1.4485
    ],
    "district": "Belém",
    "city": "Belém",
    "state": "PA",
    "source": "curated"
  },
  {
    "id": "place-curated-belem-docas-forte-presepio-dest",
    "name": "Forte do Presépio / Feliz Lusitânia (Cidade Velha)",
    "subtitle": "Belém - PA",
    "coords": [
      -48.5056,
      -1.4545
    ],
    "district": "Belém",
    "city": "Belém",
    "state": "PA",
    "source": "curated"
  },
  {
    "id": "place-curated-belem-duque-caxias-bosque-orig",
    "name": "Início Av. Duque de Caxias (Marco)",
    "subtitle": "Belém - PA",
    "coords": [
      -48.4742,
      -1.4435
    ],
    "district": "Belém",
    "city": "Belém",
    "state": "PA",
    "source": "curated"
  },
  {
    "id": "place-curated-belem-duque-caxias-bosque-dest",
    "name": "Bosque Rodrigues Alves (Jardim Zoobotânico)",
    "subtitle": "Belém - PA",
    "coords": [
      -48.4572,
      -1.4302
    ],
    "district": "Belém",
    "city": "Belém",
    "state": "PA",
    "source": "curated"
  },
  {
    "id": "place-curated-belem-portal-amazonia-mangal-orig",
    "name": "Orla Portal da Amazônia (Jurunas)",
    "subtitle": "Belém - PA",
    "coords": [
      -48.4988,
      -1.4754
    ],
    "district": "Belém",
    "city": "Belém",
    "state": "PA",
    "source": "curated"
  },
  {
    "id": "place-curated-belem-portal-amazonia-mangal-dest",
    "name": "Mangal das Garças (Cidade Velha)",
    "subtitle": "Belém - PA",
    "coords": [
      -48.5059,
      -1.4642
    ],
    "district": "Belém",
    "city": "Belém",
    "state": "PA",
    "source": "curated"
  },
  {
    "id": "place-curated-manaus-orla-ponta-negra-orig",
    "name": "Rotatória da Ponta Negra (Rio Negro)",
    "subtitle": "Manaus - AM",
    "coords": [
      -60.0924,
      -3.0698
    ],
    "district": "Manaus",
    "city": "Manaus",
    "state": "AM",
    "source": "curated"
  },
  {
    "id": "place-curated-manaus-orla-ponta-negra-dest",
    "name": "Anfiteatro da Ponta Negra",
    "subtitle": "Manaus - AM",
    "coords": [
      -60.1052,
      -3.0631
    ],
    "district": "Manaus",
    "city": "Manaus",
    "state": "AM",
    "source": "curated"
  },
  {
    "id": "place-curated-manaus-teatro-amazonas-mercado-orig",
    "name": "Teatro Amazonas (Largo de São Sebastião)",
    "subtitle": "Manaus - AM",
    "coords": [
      -60.0234,
      -3.1303
    ],
    "district": "Manaus",
    "city": "Manaus",
    "state": "AM",
    "source": "curated"
  },
  {
    "id": "place-curated-manaus-teatro-amazonas-mercado-dest",
    "name": "Mercado Municipal Adolpho Lisboa",
    "subtitle": "Manaus - AM",
    "coords": [
      -60.0242,
      -3.1398
    ],
    "district": "Manaus",
    "city": "Manaus",
    "state": "AM",
    "source": "curated"
  },
  {
    "id": "place-curated-manaus-parque-mindu-bilhares-orig",
    "name": "Parque Ponte dos Bilhares (Chapada)",
    "subtitle": "Manaus - AM",
    "coords": [
      -60.0238,
      -3.1012
    ],
    "district": "Manaus",
    "city": "Manaus",
    "state": "AM",
    "source": "curated"
  },
  {
    "id": "place-curated-manaus-parque-mindu-bilhares-dest",
    "name": "Parque Municipal do Mindu (Parque 10)",
    "subtitle": "Manaus - AM",
    "coords": [
      -60.0085,
      -3.0842
    ],
    "district": "Manaus",
    "city": "Manaus",
    "state": "AM",
    "source": "curated"
  },
  {
    "id": "place-curated-palmas-girassois-graciosa-orig",
    "name": "Palácio Araguaia / Praça dos Girassóis",
    "subtitle": "Palmas - TO",
    "coords": [
      -48.3336,
      -10.1844
    ],
    "district": "Palmas",
    "city": "Palmas",
    "state": "TO",
    "source": "curated"
  },
  {
    "id": "place-curated-palmas-girassois-graciosa-dest",
    "name": "Orla da Praia da Graciosa (Lago de Palmas)",
    "subtitle": "Palmas - TO",
    "coords": [
      -48.3621,
      -10.1845
    ],
    "district": "Palmas",
    "city": "Palmas",
    "state": "TO",
    "source": "curated"
  },
  {
    "id": "place-curated-palmas-girassois-cesamar-orig",
    "name": "Bosque dos Pioneiros (Centro)",
    "subtitle": "Palmas - TO",
    "coords": [
      -48.3324,
      -10.1892
    ],
    "district": "Palmas",
    "city": "Palmas",
    "state": "TO",
    "source": "curated"
  },
  {
    "id": "place-curated-palmas-girassois-cesamar-dest",
    "name": "Parque Cesamar (Av. LO-05)",
    "subtitle": "Palmas - TO",
    "coords": [
      -48.3238,
      -10.2089
    ],
    "district": "Palmas",
    "city": "Palmas",
    "state": "TO",
    "source": "curated"
  },
  {
    "id": "place-curated-palmas-teotonio-uft-orig",
    "name": "Espaço Cultural José Gomes Sobrinho",
    "subtitle": "Palmas - TO",
    "coords": [
      -48.3331,
      -10.1972
    ],
    "district": "Palmas",
    "city": "Palmas",
    "state": "TO",
    "source": "curated"
  },
  {
    "id": "place-curated-palmas-teotonio-uft-dest",
    "name": "Praça do Bosque / Av. Teotônio Segurado",
    "subtitle": "Palmas - TO",
    "coords": [
      -48.3328,
      -10.2185
    ],
    "district": "Palmas",
    "city": "Palmas",
    "state": "TO",
    "source": "curated"
  },
  {
    "id": "place-curated-rb-parque-maternidade-orig",
    "name": "Palácio Rio Branco / Terminal Urbano",
    "subtitle": "Rio Branco - AC",
    "coords": [
      -67.8098,
      -9.9748
    ],
    "district": "Rio Branco",
    "city": "Rio Branco",
    "state": "AC",
    "source": "curated"
  },
  {
    "id": "place-curated-rb-parque-maternidade-dest",
    "name": "Parque da Maternidade (Setor Ipê)",
    "subtitle": "Rio Branco - AC",
    "coords": [
      -67.8235,
      -9.9632
    ],
    "district": "Rio Branco",
    "city": "Rio Branco",
    "state": "AC",
    "source": "curated"
  },
  {
    "id": "place-curated-rb-gameleira-tucuma-orig",
    "name": "Calçadão da Gameleira (Segundo Distrito)",
    "subtitle": "Rio Branco - AC",
    "coords": [
      -67.8065,
      -9.9772
    ],
    "district": "Rio Branco",
    "city": "Rio Branco",
    "state": "AC",
    "source": "curated"
  },
  {
    "id": "place-curated-rb-gameleira-tucuma-dest",
    "name": "Parque do Tucumã (Distrito Industrial)",
    "subtitle": "Rio Branco - AC",
    "coords": [
      -67.8482,
      -9.9548
    ],
    "district": "Rio Branco",
    "city": "Rio Branco",
    "state": "AC",
    "source": "curated"
  },
  {
    "id": "place-curated-rb-ufac-horto-florestal-orig",
    "name": "Universidade Federal do Acre (UFAC)",
    "subtitle": "Rio Branco - AC",
    "coords": [
      -67.8632,
      -9.9554
    ],
    "district": "Rio Branco",
    "city": "Rio Branco",
    "state": "AC",
    "source": "curated"
  },
  {
    "id": "place-curated-rb-ufac-horto-florestal-dest",
    "name": "Horto Florestal de Rio Branco",
    "subtitle": "Rio Branco - AC",
    "coords": [
      -67.8285,
      -9.9482
    ],
    "district": "Rio Branco",
    "city": "Rio Branco",
    "state": "AC",
    "source": "curated"
  },
  {
    "id": "place-curated-pvh-espaco-alternativo-orig",
    "name": "Início do Espaço Alternativo (Hospital de Base)",
    "subtitle": "Porto Velho - RO",
    "coords": [
      -63.8825,
      -8.7365
    ],
    "district": "Porto Velho",
    "city": "Porto Velho",
    "state": "RO",
    "source": "curated"
  },
  {
    "id": "place-curated-pvh-espaco-alternativo-dest",
    "name": "Final do Espaço Alternativo (Aeroporto)",
    "subtitle": "Porto Velho - RO",
    "coords": [
      -63.8962,
      -8.7185
    ],
    "district": "Porto Velho",
    "city": "Porto Velho",
    "state": "RO",
    "source": "curated"
  },
  {
    "id": "place-curated-pvh-madeira-mamore-tres-caixas-orig",
    "name": "Museu Estrada de Ferro Madeira-Mamoré",
    "subtitle": "Porto Velho - RO",
    "coords": [
      -63.9085,
      -8.7652
    ],
    "district": "Porto Velho",
    "city": "Porto Velho",
    "state": "RO",
    "source": "curated"
  },
  {
    "id": "place-curated-pvh-madeira-mamore-tres-caixas-dest",
    "name": "Praça das Três Caixas d’Água (Centro)",
    "subtitle": "Porto Velho - RO",
    "coords": [
      -63.9032,
      -8.7618
    ],
    "district": "Porto Velho",
    "city": "Porto Velho",
    "state": "RO",
    "source": "curated"
  },
  {
    "id": "place-curated-pvh-parque-cidade-circuito-orig",
    "name": "Parque da Cidade (Flodoaldo Pontes Pinto)",
    "subtitle": "Porto Velho - RO",
    "coords": [
      -63.8768,
      -8.7462
    ],
    "district": "Porto Velho",
    "city": "Porto Velho",
    "state": "RO",
    "source": "curated"
  },
  {
    "id": "place-curated-pvh-parque-cidade-circuito-dest",
    "name": "Av. Rio Madeira (Nova Porto Velho)",
    "subtitle": "Porto Velho - RO",
    "coords": [
      -63.8812,
      -8.7554
    ],
    "district": "Porto Velho",
    "city": "Porto Velho",
    "state": "RO",
    "source": "curated"
  },
  {
    "id": "place-curated-bv-orla-taumanan-aguas-orig",
    "name": "Orla Taumanan (Centro Histórico)",
    "subtitle": "Boa Vista - RR",
    "coords": [
      -60.6695,
      2.8178
    ],
    "district": "Boa Vista",
    "city": "Boa Vista",
    "state": "RR",
    "source": "curated"
  },
  {
    "id": "place-curated-bv-orla-taumanan-aguas-dest",
    "name": "Praça das Águas / Portal do Milênio",
    "subtitle": "Boa Vista - RR",
    "coords": [
      -60.6738,
      2.8219
    ],
    "district": "Boa Vista",
    "city": "Boa Vista",
    "state": "RR",
    "source": "curated"
  },
  {
    "id": "place-curated-bv-parque-anaua-ene-garcez-orig",
    "name": "Monumento aos Garimpeiros (Centro Cívico)",
    "subtitle": "Boa Vista - RR",
    "coords": [
      -60.6722,
      2.8198
    ],
    "district": "Boa Vista",
    "city": "Boa Vista",
    "state": "RR",
    "source": "curated"
  },
  {
    "id": "place-curated-bv-parque-anaua-ene-garcez-dest",
    "name": "Parque Anauá (Estados)",
    "subtitle": "Boa Vista - RR",
    "coords": [
      -60.6632,
      2.8352
    ],
    "district": "Boa Vista",
    "city": "Boa Vista",
    "state": "RR",
    "source": "curated"
  },
  {
    "id": "place-curated-bv-mirante-edileusa-parque-rio-branco-orig",
    "name": "Mirante Edileusa Lóz (Parque do Rio Branco)",
    "subtitle": "Boa Vista - RR",
    "coords": [
      -60.6658,
      2.8254
    ],
    "district": "Boa Vista",
    "city": "Boa Vista",
    "state": "RR",
    "source": "curated"
  },
  {
    "id": "place-curated-bv-mirante-edileusa-parque-rio-branco-dest",
    "name": "Bosque dos Papagaios (Paraviana)",
    "subtitle": "Boa Vista - RR",
    "coords": [
      -60.6512,
      2.8385
    ],
    "district": "Boa Vista",
    "city": "Boa Vista",
    "state": "RR",
    "source": "curated"
  },
  {
    "id": "place-curated-macapa-fortaleza-orla-amazonas-orig",
    "name": "Fortaleza de São José de Macapá",
    "subtitle": "Macapá - AP",
    "coords": [
      -51.0492,
      0.0312
    ],
    "district": "Macapá",
    "city": "Macapá",
    "state": "AP",
    "source": "curated"
  },
  {
    "id": "place-curated-macapa-fortaleza-orla-amazonas-dest",
    "name": "Complexo Beira-Rio (Santa Inês)",
    "subtitle": "Macapá - AP",
    "coords": [
      -51.0535,
      0.0148
    ],
    "district": "Macapá",
    "city": "Macapá",
    "state": "AP",
    "source": "curated"
  },
  {
    "id": "place-curated-macapa-marco-zero-equador-orig",
    "name": "Orla do Araxá (Rio Amazonas)",
    "subtitle": "Macapá - AP",
    "coords": [
      -51.0612,
      -0.0021
    ],
    "district": "Macapá",
    "city": "Macapá",
    "state": "AP",
    "source": "curated"
  },
  {
    "id": "place-curated-macapa-marco-zero-equador-dest",
    "name": "Monumento Marco Zero do Equador",
    "subtitle": "Macapá - AP",
    "coords": [
      -51.0778,
      0.0002
    ],
    "district": "Macapá",
    "city": "Macapá",
    "state": "AP",
    "source": "curated"
  },
  {
    "id": "place-curated-macapa-floriano-peixoto-forte-orig",
    "name": "Parque do Forte (Beira-Rio)",
    "subtitle": "Macapá - AP",
    "coords": [
      -51.0508,
      0.0324
    ],
    "district": "Macapá",
    "city": "Macapá",
    "state": "AP",
    "source": "curated"
  },
  {
    "id": "place-curated-macapa-floriano-peixoto-forte-dest",
    "name": "Praça Floriano Peixoto (Centro)",
    "subtitle": "Macapá - AP",
    "coords": [
      -51.0618,
      0.0358
    ],
    "district": "Macapá",
    "city": "Macapá",
    "state": "AP",
    "source": "curated"
  }
];

export function getCapitalBySlug(slug?: string | null): BrazilCapitalCity {
  if (!slug) return BRAZIL_CAPITALS[0];
  return BRAZIL_CAPITALS.find((c) => c.slug === slug) ?? BRAZIL_CAPITALS[0];
}

export function findNearestCapital(coords: LngLat): BrazilCapitalCity {
  let best = BRAZIL_CAPITALS[0];
  let bestDistSq = Infinity;
  for (const c of BRAZIL_CAPITALS) {
    const dx = c.center[0] - coords[0];
    const dy = c.center[1] - coords[1];
    const dSq = dx * dx + dy * dy;
    if (dSq < bestDistSq) {
      bestDistSq = dSq;
      best = c;
    }
  }
  return best;
}
