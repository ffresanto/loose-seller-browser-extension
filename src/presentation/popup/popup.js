import { normalizeProductSettings } from '../../domain/product-settings.js';
import { loadProductSettings, saveProductSettings } from '../../infrastructure/browser/local-settings-storage.js';

const elements = {
  fillButton: document.getElementById('fill'),
  saveButton: document.getElementById('save'),
  status: document.getElementById('status'),
  platformScreen: document.getElementById('platformScreen'),
  fillScreen: document.getElementById('fillScreen'),
  platformTitle: document.getElementById('platformTitle'),
  weightLabel: document.getElementById('weightLabel'),
  madeToOrderSettings: document.getElementById('madeToOrderSettings'),
  chooseShopee: document.getElementById('chooseShopee'),
  chooseTiktok: document.getElementById('chooseTiktok'),
  backButton: document.getElementById('back')
};

let selectedPlatform = 'shopee';

function getFormElements() {
  return Object.fromEntries([
    'ncm', 'invoiceOrigin', 'sameStateCfop', 'csosn', 'diffStateCfop',
    'measureUnit', 'pisCofinsCst', 'cest', 'weight', 'width', 'length',
    'height', 'preOrder', 'dts'
  ].map((key) => [key, document.getElementById(key)]));
}

async function loadSettings() {
  const settings = await loadProductSettings();
  Object.entries(settings).forEach(([key, value]) => {
    const input = document.getElementById(key);
    if (input) input.value = value ?? '';
  });
}

async function saveSettings(showMessage = true) {
  const settings = normalizeProductSettings(getFormElements());
  await saveProductSettings(settings);
  if (showMessage) elements.status.textContent = 'Valores salvos neste navegador.';
  return settings;
}

function selectPlatform(platform, title, message) {
  selectedPlatform = platform;
  elements.platformTitle.textContent = title;
  elements.platformScreen.classList.add('hidden');
  elements.fillScreen.classList.remove('hidden');
  elements.status.textContent = message;
  const isShopee = platform === 'shopee';
  elements.weightLabel.textContent = isShopee ? 'Peso (kg)' : 'Peso do pacote (g)';
  elements.madeToOrderSettings.hidden = !isShopee;
}

function isSupportedPage(url) {
  if (selectedPlatform === 'shopee') return url?.startsWith('https://seller.shopee.com.br/');
  return [
    'https://seller-br.tiktok.com/',
    'https://seller.tiktok.com/',
    'https://seller.tiktokglobalshop.com/'
  ].some((prefix) => url?.startsWith(prefix));
}

function getMessageType() {
  return selectedPlatform === 'shopee' ? 'FILL_TAX_FIELDS' : 'FILL_TIKTOK_FIELDS';
}

async function fillCurrentPage() {
  const settings = await saveSettings(false);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !isSupportedPage(tab.url)) {
    throw new Error(selectedPlatform === 'shopee'
      ? 'Abra uma página do Seller Center da Shopee.'
      : 'Abra uma página do TikTok Shop Seller Center.');
  }
  return chrome.tabs.sendMessage(tab.id, { type: getMessageType(), values: settings });
}

elements.chooseShopee.addEventListener('click', () => {
  selectPlatform('shopee', 'Plataforma selecionada - Shopee', 'Shopee selecionada.');
});

elements.chooseTiktok.addEventListener('click', () => {
  selectPlatform('tiktok', 'Plataforma selecionada - TikTok Shop', 'TikTok Shop selecionado.');
});

elements.backButton.addEventListener('click', () => {
  elements.fillScreen.classList.add('hidden');
  elements.platformScreen.classList.remove('hidden');
  elements.status.textContent = '';
});

elements.saveButton.addEventListener('click', () => saveSettings());

elements.fillButton.addEventListener('click', async () => {
  elements.fillButton.disabled = true;
  elements.saveButton.disabled = true;
  elements.status.textContent = 'Salvando e enviando comando...';
  try {
    const result = await fillCurrentPage();
    elements.status.textContent = result?.message || 'Concluído.';
  } catch (error) {
    elements.status.textContent = error.message || 'Não foi possível preencher.';
  } finally {
    elements.fillButton.disabled = false;
    elements.saveButton.disabled = false;
  }
});

loadSettings();
