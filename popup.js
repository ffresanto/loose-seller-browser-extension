const button = document.getElementById('fill');
const saveButton = document.getElementById('save');
const status = document.getElementById('status');
const platformScreen = document.getElementById('platformScreen');
const fillScreen = document.getElementById('fillScreen');
const chooseShopee = document.getElementById('chooseShopee');
const backButton = document.getElementById('back');
const names = ['ncm', 'invoiceOrigin', 'sameStateCfop', 'csosn', 'diffStateCfop', 'measureUnit', 'pisCofinsCst', 'cest', 'weight', 'width', 'length', 'height', 'preOrder', 'dts'];
const defaults = {
  ncm: '39269090',
  invoiceOrigin: '0-Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8',
  sameStateCfop: '5102',
  csosn: '102-Tributada pelo Simples Nacional sem permissão de crédito',
  diffStateCfop: '6102',
  measureUnit: 'UN (UNIDADE)',
  pisCofinsCst: '49-Outras Operações de Saída',
  cest: '2806100', weight: '0,5', width: '16', length: '4', height: '18', preOrder: 'true', dts: '4'
};

async function loadSettings() {
  const saved = await chrome.storage.local.get(defaults);
  names.forEach(name => { document.getElementById(name).value = saved[name] ?? ''; });
}

function readSettings() {
  return Object.fromEntries(names.map(name => [name, document.getElementById(name).value.trim()]));
}

async function saveSettings(showMessage = true) {
  const settings = readSettings();
  await chrome.storage.local.set(settings);
  if (showMessage) status.textContent = 'Valores salvos neste navegador.';
  return settings;
}

saveButton.addEventListener('click', () => saveSettings());
loadSettings();

chooseShopee.addEventListener('click', () => {
  platformScreen.classList.add('hidden');
  fillScreen.classList.remove('hidden');
  status.textContent = 'Shopee selecionada.';
});

backButton.addEventListener('click', () => {
  fillScreen.classList.add('hidden');
  platformScreen.classList.remove('hidden');
  status.textContent = '';
});

button.addEventListener('click', async () => {
  button.disabled = true;
  saveButton.disabled = true;
  status.textContent = 'Salvando e enviando comando...';
  try {
    const settings = await saveSettings(false);
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url?.startsWith('https://seller.shopee.com.br/')) {
      throw new Error('Abra uma página do Seller Center da Shopee.');
    }
    const result = await chrome.tabs.sendMessage(tab.id, { type: 'FILL_TAX_FIELDS', values: settings });
    status.textContent = result?.message || 'Concluído.';
  } catch (error) {
    status.textContent = error.message || 'Não foi possível preencher.';
  } finally {
    button.disabled = false;
    saveButton.disabled = false;
  }
});
