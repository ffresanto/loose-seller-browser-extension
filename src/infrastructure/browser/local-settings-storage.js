import { DEFAULT_PRODUCT_SETTINGS } from '../../domain/product-settings.js';

export async function loadProductSettings() {
  return chrome.storage.local.get(DEFAULT_PRODUCT_SETTINGS);
}

export async function saveProductSettings(settings) {
  await chrome.storage.local.set(settings);
  return settings;
}
