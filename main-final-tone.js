// FINAL SUPPORTING-TYPE TONE
// Keep the approved Inter Tight typography and current hierarchy exactly as-is.
// Only lift very-dark supporting canvas text one tonal step on Mineral Graphite.
// TWYNE vector logos are unaffected because they are drawn as vector geometry/paths.

const nativeFillText = CanvasRenderingContext2D.prototype.fillText;

function liftedTonalInk(fillStyle) {
  const value = String(fillStyle || '').trim();
  const m = value.match(/^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*(\d*\.?\d+)\s*)?\)$/i);
  if (!m) return null;

  const r = Number(m[1]);
  const g = Number(m[2]);
  const b = Number(m[3]);
  const a = m[4] === undefined ? 1 : Number(m[4]);

  // Only touch the near-black tonal ink used by supporting packaging copy.
  if (r > 14 || g > 14 || b > 14) return null;

  // One controlled lift: still darker than Mineral Graphite #4D4D49,
  // but no longer reads as almost-black. Preserve the original opacity hierarchy.
  return `rgba(34,34,31,${a})`;
}

CanvasRenderingContext2D.prototype.fillText = function(text, ...args) {
  const previousFill = this.fillStyle;
  const lifted = liftedTonalInk(previousFill);
  if (lifted) this.fillStyle = lifted;

  try {
    return nativeFillText.call(this, text, ...args);
  } finally {
    this.fillStyle = previousFill;
  }
};

await import('./main-front-dvn.js');
