// Force a clean, legible modern sans for all supporting packaging copy.
// TWYNE itself remains the custom geometric wordmark drawn in main-v2.js.
const canvasFontDescriptor = Object.getOwnPropertyDescriptor(
  CanvasRenderingContext2D.prototype,
  'font'
);

if (canvasFontDescriptor?.set && canvasFontDescriptor?.get) {
  Object.defineProperty(CanvasRenderingContext2D.prototype, 'font', {
    configurable: true,
    enumerable: canvasFontDescriptor.enumerable,
    get() {
      return canvasFontDescriptor.get.call(this);
    },
    set(value) {
      let next = String(value)
        .replace(/"Bodoni Moda",\s*Didot,\s*"Times New Roman",\s*serif/g, '"Manrope", "Helvetica Neue", Arial, sans-serif')
        .replace(/^500\s+/, '600 ');
      canvasFontDescriptor.set.call(this, next);
    },
  });
}

await document.fonts?.load?.('600 90px "Manrope"');
await document.fonts?.ready;

await import('./main-v2.js');
