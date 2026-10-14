# Loose Seller

Loose Seller is a Chrome/Edge extension that helps sellers fill product information in the Shopee Seller Center and TikTok Shop. It automates fiscal and shipping fields for Shopee and fiscal fields for TikTok Shop.

## What it is for

The extension fills recurring values directly in the Shopee product form. It does not log in, submit the form, save the product, or publish anything automatically.

Fiscal and shipping values must be reviewed before saving or publishing. Fiscal settings should be validated with an accountant.

## Current options

### Fiscal information

- NCM
- Invoice origin
- Same-state CFOP
- CSOSN
- Different-state CFOP
- Measurement unit
- PIS/COFINS CST
- CEST

### Shipping information

- Package weight
- Package width, length, and height
- Made-to-order status
- Days to post the order

When **Made to order** is set to **Yes**, Loose Seller enables that option first and then fills the posting time. Shopee accepts values from 3 to 15 days.

All values can be edited in the popup and are stored locally with `chrome.storage.local`.

### TikTok Shop

The TikTok Shop option fills the fiscal registration screen named “Informações fiscais dos produtos necessárias para emissão de notas fiscais eletrônicas (NF-e)”. It selects “Vendas (pedidos padrão)” first so the CFOP fields become available, then fills NCM, CEST, CFOPs, PIS/COFINS CST, origin, CSOSN, and measurement unit.

## Installation

1. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this project folder.
5. Open Shopee Seller Center or TikTok Shop Seller Center.
6. Open the extensions menu and select **Loose Seller**.

## How to use

1. Open Loose Seller.
2. Choose **Continue with Shopee** or **Continue with TikTok**.
3. Expand **Fiscal information** and/or **Shipping information**.
4. Review or edit the saved values.
5. Click **Save values** after changing the configuration.
6. Click **Fill now** while the Shopee product form is open.
7. Review every field before saving or publishing the product.

## Architecture

The project uses a lightweight layered architecture designed for browser extensions:

```text
src/
├── domain/                  # Settings model, defaults, and pure rules
├── application/             # Application use cases (future growth area)
├── infrastructure/
│   └── browser/             # Chrome storage and browser adapters
├── content/                 # Platform content-script entry points
└── presentation/
    └── popup/               # Popup UI and interaction flow
```

Shopee and TikTok content scripts are isolated from each other. DOM selectors and platform-specific behavior stay inside their own content layer, while the popup and settings model are shared.

## Project files

- `manifest.json` — metadata, permissions, version, and entry points.
- `src/domain/product-settings.js` — shared settings model and defaults.
- `src/infrastructure/browser/local-settings-storage.js` — Chrome storage adapter.
- `src/content/content-shopee.js` — Shopee field detection and filling.
- `src/content/content-tiktok.js` — TikTok Shop field detection and filling.
- `src/presentation/popup/` — popup layout, behavior, and icon.

## Version control

The extension version is defined in `manifest.json`:

```json
"version": "1.0.0"
```

For a new version:

1. Update `version` in `manifest.json` using Chrome's format, such as `0.1.1` or `0.2.0`.
2. Update the visible version in `popup.html`.
3. Reload and test the extension locally.
4. Commit the changes and push the feature branch.
5. Open a Pull Request into `trunk`.

Example:

```powershell
git switch -c feature/update-shopee-fields
git add manifest.json popup.html content-shopee.js
git commit -m "feat: update Shopee shipping fields"
git push -u origin feature/update-shopee-fields
```

The `trunk` branch requires changes to be merged through a Pull Request.

## Limitations

- Shopee may change its layout or field identifiers.
- The extension currently targets `seller.shopee.com.br` and `seller-br.tiktok.com`.
- It does not submit or publish products.
- It is intended for local use as an unpacked extension.

