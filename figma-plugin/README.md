# TWYNE Production Tools — Figma Plugin

This local Figma plugin creates TWYNE packaging layouts directly inside any open Figma Design file.

## Current tools

### 1. Gift Set Insert
- Finished folded size: **186 × 104 mm**
- Open size: **186 × 208 mm**
- Fold: **104 mm**
- Paper/background: **Creamy #E7E4DD**
- Closed visible face: **TWYNE** only
- Inside top panel: **VOLUME I — KENOPSIA** + `The warmth a place keeps after everyone leaves.`
- Collection starts **below the fold** with four 2ml vial illustrations
- Bottom line: `Wear each piece on skin. One day at a time.`
- Fold guides are created as hidden non-print layers.

### 2. SOTTO VOCE 50ml Card
- Double-sided card: **86 × 56 mm**
- Creamy **#E7E4DD**
- Front: TWYNE / VOLUME I — KENOPSIA / SOTTO VOCE / emotional line
- Back: 01 / **Suede · Vanilla · Amber** / TWO STATES. A THIRD FORM. / A HAUS OF VOLUMES

## Install in Figma Desktop

1. Download this repository as a ZIP from GitHub and extract it.
2. Open the **Figma desktop app**.
3. Open any Figma Design file.
4. Go to **Plugins → Development → Import plugin from manifest…**
5. Select:
   `figma-plugin/manifest.json`
6. Run **TWYNE Production Tools** from **Plugins → Development**.
7. Click **CREATE GIFT SET INSERT** or **CREATE SOTTO VOCE 50ML CARD**.

The plugin creates a new page automatically and opens the finished layout.

## If Figma rejects the plugin ID

The manifest includes a development-only ID so the files are ready to use. If your Figma installation says that the ID is invalid or already in use:

1. In Figma desktop go to **Plugins → Development → New plugin…**
2. Create a blank Figma Design plugin once.
3. Open the generated `manifest.json` and copy its numeric `id`.
4. Replace only the `id` value in this repo's `figma-plugin/manifest.json`.
5. Import this manifest again.

No other code needs to change.

## Print note

The plugin uses print-point-equivalent sizing for the specified millimeter dimensions. Export the production frame as **PDF at 1×** and confirm the final physical dimensions with the printer before mass production.
