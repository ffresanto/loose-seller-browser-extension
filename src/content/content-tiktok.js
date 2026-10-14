(() => {
  'use strict';

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  async function waitFor(predicate, timeout = 5000) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeout) {
      const value = predicate();
      if (value) return value;
      await wait(150);
    }
    return null;
  }
  const normalize = (value) => String(value).replace(/\s+/g, ' ').trim().toLocaleLowerCase('pt-BR');

  function visible(element) {
    return element && element.getClientRects().length > 0;
  }

  function setInput(input, value) {
    if (!input) return false;
    const text = String(value);
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, text);
    if (!setter) input.value = text;
    input.click();
    input.focus();
    try {
      input.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        inputType: 'insertText',
        data: text
      }));
    } catch {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'End' }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    return input.value === text;
  }

  function inputNearLabel(text, occurrence = 0) {
    const target = normalize(text);
    const labels = [...document.querySelectorAll('label')].filter(label => normalize(label.textContent).includes(target));
    const label = labels[occurrence];
    if (!label) return null;
    let parent = label;
    for (let level = 0; level < 5 && parent; level++, parent = parent.parentElement) {
      const input = [...parent.querySelectorAll('input')].find(visible);
      if (input) return input;
    }
    return null;
  }

  function inputByPlaceholder(placeholder) {
    return [...document.querySelectorAll('input[placeholder]')]
      .find((input) => visible(input) && input.placeholder === placeholder);
  }

  function shippingInput(fieldId, placeholder) {
    return document.querySelector(`[data-id="${fieldId}"] input[placeholder="${placeholder}"]`)
      || inputByPlaceholder(placeholder);
  }

  async function selectShippingUnit() {
    const input = shippingInput('product.publish.package_weight', 'Insira o peso do pacote');
    const selector = input?.closest('.pulse-input-group-select')?.querySelector('[role="combobox"]');
    if (!selector) return false;
    selector.click();
    await wait(200);
    const option = [...document.querySelectorAll('[role="option"], .core-select-option, li')]
      .find((item) => visible(item) && normalize(item.textContent) === normalize('Gramas (g)'));
    if (!option) return false;
    option.click();
    await wait(150);
    return normalize(selector.textContent).includes(normalize('Gramas (g)'));
  }

  async function selectNearLabel(text, wanted) {
    const target = normalize(text);
    const label = [...document.querySelectorAll('label, span, div')]
      .find(element => normalize(element.textContent) === target && visible(element));
    let parent = label;
    let selector;
    for (let level = 0; level < 6 && parent; level++, parent = parent.parentElement) {
      selector = parent.querySelector('.core-select-view');
      if (selector) break;
    }
    if (!selector) return false;
    selector.click();
    await wait(200);
    const option = [...document.querySelectorAll('[role="option"], .core-select-option, .core-select-option-item, li')]
      .find(item => visible(item) && normalize(item.textContent).includes(normalize(wanted)));
    if (!option) return false;
    option.click();
    await wait(150);
    return normalize(selector.textContent).includes(normalize(wanted));
  }

  async function fill(values) {
    await waitFor(() => inputNearLabel('NCM') || inputByPlaceholder('Insira o peso do pacote'));
    const result = {};

    // Shipping must be completed first so TikTok updates its product state
    // before validating the fiscal section.
    result.shippingUnit = await selectShippingUnit();
    result.weight = setInput(
      shippingInput('product.publish.package_weight', 'Insira o peso do pacote'),
      '50'
    );
    await wait(150);
    result.height = setInput(
      shippingInput('product.publish.package_height', 'Altura'),
      values.height
    );
    await wait(150);
    result.width = setInput(
      shippingInput('product.publish.package_width', 'Largura'),
      values.width
    );
    await wait(150);
    result.length = setInput(
      shippingInput('product.publish.package_length', 'Comprimento'),
      values.length
    );
    // Click outside the inputs so TikTok commits the controlled field values.
    document.querySelector('#add_product_shipping_title h1')?.click();
    await wait(300);

    result.ncm = setInput(inputNearLabel('NCM'), values.ncm);
    result.cest = setInput(inputNearLabel('CEST'), values.cest);

    result.operation = await selectNearLabel('Natureza da operação', 'Vendas (pedidos padrão)');
    await wait(250);

    result.sameStateCfop = setInput(inputNearLabel('CFOP para intraestaduais'), values.sameStateCfop)
      || setInput(inputNearLabel('CFOP para interestaduais', 0), values.sameStateCfop);
    result.diffStateCfop = setInput(inputNearLabel('CFOP para interestaduais', 1), values.diffStateCfop)
      || setInput(inputNearLabel('CFOP para interestaduais', 0), values.diffStateCfop);
    result.pisCofinsCst = setInput(inputNearLabel('Código de Situação Tributária do PIS e COFINS'), values.pisCofinsCst);
    result.invoiceOrigin = await selectNearLabel('Origem', '0/Nacional');
    result.csosn = await selectNearLabel('CSOSN', '102/Tributado pelo Simples Nacional');
    result.measureUnit = await selectNearLabel('Unidade de medida', 'UN');

    const failed = Object.entries(result).filter(([, ok]) => !ok).map(([name]) => name);
    return failed.length
      ? { message: `Preenchimento parcial no TikTok Shop. Verifique: ${failed.join(', ')}.` }
      : { message: 'Campos do TikTok Shop preenchidos. Revise os dados antes de salvar.' };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'FILL_TIKTOK_FIELDS') {
      fill(message.values || {}).then(sendResponse).catch(error => sendResponse({ message: `Erro no TikTok Shop: ${error.message}` }));
      return true;
    }
  });
})();
