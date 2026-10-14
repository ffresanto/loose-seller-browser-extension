(() => {
  'use strict';

  const values = {
    ncm: '39269090',
    invoiceOrigin: '0-Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8',
    sameStateCfop: '5102',
    csosn: '102-Tributada pelo Simples Nacional sem permissão de crédito',
    diffStateCfop: '6102',
    measureUnit: 'UN (UNIDADE)',
    pisCofinsCst: '49-Outras Operações de Saída',
    cest: '2806100', weight: '0,5', width: '16', length: '4', height: '18', preOrder: 'true', dts: '4'
  };

  const field = (name) => document.querySelector(`[data-product-edit-field-unique-id="brTaxSetting.${name}"]`)
    || document.querySelector(`[data-product-edit-field-unique-id="${name}"]`);

  function fireInput(element) {
    element.focus();
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function setText(name, value) {
    const root = field(name);
    // O marcador data-product-edit-field-unique-id é um span irmão do input.
    // Por isso procuramos no contêiner do item, e não dentro do próprio span.
    const placeholders = { weight: 'Input', width: 'Largura', length: 'Comprimento', height: 'Altura', dts: '0' };
    const container = root?.closest('.product-edit-form-item-content') || root?.closest('.product-edit-form-item') || root?.parentElement;
    const input = container?.querySelector('input, textarea')
      || (placeholders[name] && [...document.querySelectorAll('input')].find(item => item.placeholder === placeholders[name]));
    if (!input) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      || Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    setter?.call(input, String(value));
    if (!setter) input.value = value;
    fireInput(input);
    const normalizeValue = (text) => String(text).replace(',', '.').trim();
    return input.value === String(value) || normalizeValue(input.value) === normalizeValue(value);
  }

  async function setSelect(name, wanted) {
    const root = field(name);
    const selector = root?.closest('.eds-select')?.querySelector('.eds-selector')
      || root?.parentElement?.querySelector('.eds-selector');
    if (!selector) return false;
    selector.click();
    await wait(150);
    const options = [...document.querySelectorAll('.eds-option, [role="option"]')];
    const normalize = (text) => text.replace(/\s+/g, ' ').trim().toLocaleLowerCase('pt-BR');
    const target = normalize(wanted);
    const option = options.find((item) => normalize(item.textContent || '') === target)
      || options.find((item) => normalize(item.textContent || '').startsWith(target));
    if (!option) return false;
    option.click();
    await wait(100);
    return normalize(selector.textContent || '') === target
      || normalize(selector.textContent || '').startsWith(target);
  }

  async function setPreOrder(wanted) {
    const root = field('preOrder');
    const input = root?.querySelector(`input[type="radio"][value="${wanted}"]`)
      || document.querySelector(`[data-product-edit-field-unique-id="preOrder"] input[type="radio"][value="${wanted}"]`);
    if (!input) return false;
    input.click();
    fireInput(input);
    await wait(700);
    return input.checked;
  }

  function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  async function fill(customValues = values) {
    const taxSection = document.querySelector('[data-product-edit-field-unique-id="brTaxSetting.ncm"]');
    if (!taxSection) return { message: 'A seção fiscal não foi encontrada. Avance para a segunda etapa e tente novamente.' };

    const result = {};
    for (const [name, value] of Object.entries(customValues)) {
      if (name === 'dts' && String(customValues.preOrder) !== 'true') {
        result[name] = true;
        continue;
      }
      result[name] = name === 'preOrder'
        ? await setPreOrder(value)
        : ['invoiceOrigin', 'csosn', 'measureUnit', 'pisCofinsCst'].includes(name)
          ? await setSelect(name, value)
          : setText(name, value);
    }

    const failed = Object.entries(result).filter(([, ok]) => !ok).map(([name]) => name);
    if (failed.length) {
      return { message: `Preenchimento parcial. Verifique: ${failed.join(', ')}.` };
    }
    return { message: 'Campos fiscais preenchidos. Revise os dados antes de salvar/publicar.' };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'FILL_TAX_FIELDS') {
      fill(message.values || values).then(sendResponse).catch(error => sendResponse({ message: `Erro: ${error.message}` }));
      return true;
    }
  });
})();
