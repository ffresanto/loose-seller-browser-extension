export const PRODUCT_SETTING_KEYS = [
  'ncm',
  'invoiceOrigin',
  'sameStateCfop',
  'csosn',
  'diffStateCfop',
  'measureUnit',
  'pisCofinsCst',
  'cest',
  'weight',
  'width',
  'length',
  'height',
  'preOrder',
  'dts'
];

export const DEFAULT_PRODUCT_SETTINGS = {
  ncm: '39269090',
  invoiceOrigin: '0-Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8',
  sameStateCfop: '5102',
  csosn: '102-Tributada pelo Simples Nacional sem permissão de crédito',
  diffStateCfop: '6102',
  measureUnit: 'UN (UNIDADE)',
  pisCofinsCst: '49-Outras Operações de Saída',
  cest: '2806100',
  weight: '0,5',
  width: '16',
  length: '4',
  height: '18',
  preOrder: 'true',
  dts: '4'
};

export function normalizeProductSettings(elements) {
  return Object.fromEntries(PRODUCT_SETTING_KEYS.map((key) => [
    key,
    elements[key]?.value?.trim() ?? ''
  ]));
}
