const MM = 72 / 25.4;
const mm = (v) => v * MM;

const CREAM = '#E7E4DD';
const INK = '#171714';
const MUTED = '#68635B';
const VIAL = '#24231F';
const LABEL = '#DCD6CA';

const PIECES = [
  { no: '01', name: 'SOTTO VOCE', notes: 'Suede · Vanilla · Amber' },
  { no: '02', name: 'LOW FEVER', notes: 'Amber · Cedar · Musk' },
  { no: '03', name: 'LACUNA', notes: 'Iris · Spice · Air' },
  { no: '04', name: 'PALE HUM', notes: 'White Musk · Soft Citrus · Skin' }
];

function rgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

function solid(hex, opacity = 1) {
  return { type: 'SOLID', color: rgb(hex), opacity };
}

await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });

function text(parent, value, x, y, w, h, opts = {}) {
  const t = figma.createText();
  parent.appendChild(t);
  t.fontName = { family: 'Inter', style: opts.bold ? 'Semi Bold' : 'Regular' };
  t.characters = value;
  t.fontSize = opts.size || 8;
  t.fills = [solid(opts.color || INK)];
  t.textAlignHorizontal = opts.align || 'LEFT';
  t.textAlignVertical = 'CENTER';
  t.textAutoResize = 'NONE';
  t.resize(w, h);
  t.x = x;
  t.y = y;
  t.lineHeight = { value: opts.lineHeight || (opts.size || 8) * 1.25, unit: 'PIXELS' };
  t.letterSpacing = { value: opts.tracking || 0, unit: 'PIXELS' };
  return t;
}

function paper(name) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(mm(186), mm(208));
  f.fills = [solid(CREAM)];
  f.clipsContent = true;
  return f;
}

function foldGuide(parent) {
  const l = figma.createLine();
  parent.appendChild(l);
  l.name = 'FOLD GUIDE — 104 MM — NON PRINT';
  l.resize(parent.width, 0);
  l.x = 0;
  l.y = mm(104);
  l.strokes = [solid('#918B81', 0.45)];
  l.strokeWeight = 0.5;
  l.dashPattern = [4, 4];
  l.visible = false;
}

function vial(parent, cx, top) {
  const cap = figma.createRectangle();
  parent.appendChild(cap);
  cap.resize(mm(7.5), mm(6));
  cap.x = cx - cap.width / 2;
  cap.y = top;
  cap.cornerRadius = mm(0.6);
  cap.fills = [solid('#121210')];

  const body = figma.createRectangle();
  parent.appendChild(body);
  body.resize(mm(9.5), mm(27));
  body.x = cx - body.width / 2;
  body.y = top + mm(5.5);
  body.cornerRadius = mm(0.7);
  body.fills = [solid(VIAL)];

  const lab = figma.createRectangle();
  parent.appendChild(lab);
  lab.resize(mm(7.2), mm(8));
  lab.x = cx - lab.width / 2;
  lab.y = body.y + mm(10.5);
  lab.fills = [solid(LABEL)];
}

const inside = paper('INSIDE PRINT — 186 × 208 MM');
const outside = paper('OUTSIDE PRINT — 186 × 208 MM');

const gap = mm(18);
const center = figma.viewport.center;
inside.x = center.x - inside.width - gap / 2;
inside.y = center.y - inside.height / 2;
outside.x = center.x + gap / 2;
outside.y = inside.y;

foldGuide(inside);
foldGuide(outside);

text(inside, 'VOLUME I — KENOPSIA', mm(18), mm(29), mm(150), mm(10), {
  size: 10.5, bold: true, align: 'CENTER', tracking: 1.1
});
text(inside, 'The warmth a place keeps after everyone leaves.', mm(20), mm(41), mm(146), mm(8), {
  size: 7.2, align: 'CENTER', color: MUTED
});

const col = 186 / 4;
PIECES.forEach((p, i) => {
  const left = i * col;
  const cx = mm(left + col / 2);
  vial(inside, cx, mm(117));
  text(inside, p.no, mm(left + 4), mm(153), mm(col - 8), mm(7), {
    size: 5.5, align: 'CENTER', color: MUTED, tracking: 0.7
  });
  text(inside, p.name, mm(left + 3), mm(160), mm(col - 6), mm(8), {
    size: 6.7, bold: true, align: 'CENTER', tracking: 0.25
  });
  text(inside, p.notes, mm(left + 4), mm(169), mm(col - 8), mm(15), {
    size: 5.2, align: 'CENTER', color: MUTED, lineHeight: 6.4
  });
});

text(inside, 'Wear each piece on skin.\nOne day at a time.', mm(18), mm(192), mm(150), mm(11), {
  size: 6.3, align: 'CENTER', lineHeight: 7.8
});

text(outside, 'TWYNE', mm(20), mm(144), mm(146), mm(18), {
  size: 17, bold: true, align: 'CENTER', tracking: 3.2
});

const spec = figma.createText();
spec.fontName = { family: 'Inter', style: 'Regular' };
spec.characters = 'FINISHED FOLDED SIZE 186 × 104 MM  /  OPEN SIZE 186 × 208 MM  /  FOLD AT 104 MM  /  CREAMY #E7E4DD';
spec.fontSize = 7;
spec.fills = [solid(MUTED)];
spec.x = inside.x;
spec.y = inside.y + inside.height + mm(10);
spec.name = 'PRODUCTION SPEC — NON PRINT';

figma.currentPage.selection = [inside, outside];
figma.viewport.scrollAndZoomIntoView([inside, outside]);
figma.closePlugin('TWYNE Gift Set insert created');
