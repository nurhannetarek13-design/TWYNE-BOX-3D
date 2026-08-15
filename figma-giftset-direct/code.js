const MM = 72 / 25.4;
const mm = (v) => v * MM;

const CREAM = '#E7E4DD';
const INK = '#171714';
const MUTED = '#68635B';
const GUIDE = '#4F4A43';
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

function foldGuide(parent, visible = false) {
  const l = figma.createLine();
  parent.appendChild(l);
  l.name = visible ? 'FOLD / SCORE — 104 MM — VISIBLE GUIDE' : 'FOLD GUIDE — 104 MM — NON PRINT';
  l.resize(parent.width, 0);
  l.x = 0;
  l.y = mm(104);
  l.strokes = [solid(GUIDE, visible ? 0.95 : 0.45)];
  l.strokeWeight = visible ? 1.2 : 0.5;
  l.dashPattern = visible ? [8, 5] : [4, 4];
  l.visible = visible;
  return l;
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

function addInsideArtwork(parent) {
  text(parent, 'VOLUME I — KENOPSIA', mm(18), mm(29), mm(150), mm(10), {
    size: 10.5, bold: true, align: 'CENTER', tracking: 1.1
  });
  text(parent, 'The warmth a place keeps after everyone leaves.', mm(20), mm(41), mm(146), mm(8), {
    size: 7.2, align: 'CENTER', color: MUTED
  });

  const col = 186 / 4;
  PIECES.forEach((p, i) => {
    const left = i * col;
    const cx = mm(left + col / 2);
    vial(parent, cx, mm(117));
    text(parent, p.no, mm(left + 4), mm(153), mm(col - 8), mm(7), {
      size: 5.5, align: 'CENTER', color: MUTED, tracking: 0.7
    });
    text(parent, p.name, mm(left + 3), mm(160), mm(col - 6), mm(8), {
      size: 6.7, bold: true, align: 'CENTER', tracking: 0.25
    });
    text(parent, p.notes, mm(left + 4), mm(169), mm(col - 8), mm(15), {
      size: 5.2, align: 'CENTER', color: MUTED, lineHeight: 6.4
    });
  });

  text(parent, 'Wear each piece on skin.\nOne day at a time.', mm(18), mm(192), mm(150), mm(11), {
    size: 6.3, align: 'CENTER', lineHeight: 7.8
  });
}

function createProductionGuide() {
  const board = figma.createFrame();
  board.name = 'PRODUCTION GUIDE — CUT + FOLD';
  board.resize(mm(216), mm(244));
  board.fills = [solid('#F4F1EA')];
  board.clipsContent = false;

  const sheet = figma.createFrame();
  board.appendChild(sheet);
  sheet.name = 'FINAL SHEET — 186 × 208 MM';
  sheet.resize(mm(186), mm(208));
  sheet.x = mm(15);
  sheet.y = mm(20);
  sheet.fills = [solid(CREAM)];
  sheet.strokes = [solid(INK)];
  sheet.strokeWeight = 1.4;
  sheet.clipsContent = true;

  const fold = foldGuide(sheet, true);

  text(board, 'CUT EDGE — 186 MM', mm(15), mm(4), mm(186), mm(8), {
    size: 7, bold: true, align: 'CENTER', tracking: 0.55
  });
  text(board, 'CUT ALL 4 OUTER EDGES', mm(15), mm(12), mm(186), mm(6), {
    size: 5.5, align: 'CENTER', color: MUTED, tracking: 0.35
  });
  text(board, '208 MM OPEN HEIGHT', mm(15), mm(230), mm(186), mm(6), {
    size: 5.8, bold: true, align: 'CENTER', tracking: 0.45
  });

  text(sheet, 'TOP PANEL — 104 MM', mm(8), mm(7), mm(65), mm(8), {
    size: 6.2, bold: true, color: GUIDE
  });
  text(sheet, 'VOLUME I — KENOPSIA', mm(18), mm(37), mm(150), mm(10), {
    size: 9.2, bold: true, align: 'CENTER', tracking: 0.8
  });
  text(sheet, 'The warmth a place keeps after everyone leaves.', mm(20), mm(48), mm(146), mm(8), {
    size: 6.3, align: 'CENTER', color: MUTED
  });

  text(sheet, 'FOLD / SCORE AT 104 MM — DO NOT CUT', mm(12), mm(99), mm(162), mm(10), {
    size: 6.8, bold: true, align: 'CENTER', color: GUIDE, tracking: 0.4
  });

  text(sheet, 'BOTTOM PANEL — 104 MM', mm(8), mm(111), mm(70), mm(8), {
    size: 6.2, bold: true, color: GUIDE
  });
  text(sheet, 'BOTTLE ROW STARTS ON THIS PANEL', mm(8), mm(123), mm(170), mm(8), {
    size: 6.4, align: 'CENTER', color: MUTED, tracking: 0.3
  });
  text(sheet, '01            02            03            04', mm(18), mm(150), mm(150), mm(8), {
    size: 7.2, bold: true, align: 'CENTER', tracking: 0.8
  });
  text(sheet, 'SOTTO VOCE        LOW FEVER        LACUNA        PALE HUM', mm(10), mm(163), mm(166), mm(8), {
    size: 5.6, align: 'CENTER', tracking: 0.2
  });

  text(board, 'SOLID OUTER BORDER = CUT  /  DASHED CENTER LINE = SCORE + FOLD', mm(15), mm(236), mm(186), mm(6), {
    size: 5.4, align: 'CENTER', color: GUIDE, tracking: 0.25
  });

  return board;
}

function createFoldedPreview() {
  const folded = figma.createFrame();
  folded.name = 'FOLDED PREVIEW — 186 × 104 MM';
  folded.resize(mm(186), mm(104));
  folded.fills = [solid(CREAM)];
  folded.strokes = [solid(INK, 0.35)];
  folded.strokeWeight = 0.8;

  text(folded, 'TWYNE', mm(20), mm(40), mm(146), mm(18), {
    size: 17, bold: true, align: 'CENTER', tracking: 3.2
  });
  return folded;
}

const inside = paper('INSIDE PRINT — 186 × 208 MM');
const outside = paper('OUTSIDE PRINT — 186 × 208 MM');
const guide = createProductionGuide();
const folded = createFoldedPreview();

const gap = mm(18);
const center = figma.viewport.center;
inside.x = center.x - inside.width - gap / 2;
inside.y = center.y - inside.height / 2;
outside.x = center.x + gap / 2;
outside.y = inside.y;

guide.x = outside.x + outside.width + gap;
guide.y = inside.y - mm(18);
folded.x = guide.x;
folded.y = guide.y + guide.height + mm(14);

foldGuide(inside, false);
foldGuide(outside, false);
addInsideArtwork(inside);

text(outside, 'TWYNE', mm(20), mm(144), mm(146), mm(18), {
  size: 17, bold: true, align: 'CENTER', tracking: 3.2
});

const spec = figma.createText();
spec.fontName = { family: 'Inter', style: 'Regular' };
spec.characters = 'FINISHED FOLDED SIZE 186 × 104 MM  /  OPEN SIZE 186 × 208 MM  /  ONE HORIZONTAL SCORE + FOLD AT 104 MM  /  CUT ONLY THE 4 OUTER EDGES  /  CREAMY #E7E4DD';
spec.fontSize = 7;
spec.fills = [solid(MUTED)];
spec.x = inside.x;
spec.y = inside.y + inside.height + mm(10);
spec.name = 'PRODUCTION SPEC — NON PRINT';

figma.currentPage.selection = [inside, outside, guide, folded];
figma.viewport.scrollAndZoomIntoView([inside, outside, guide, folded]);
figma.closePlugin('TWYNE Gift Set insert + production guides created');
