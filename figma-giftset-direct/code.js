const MM = 72 / 25.4;
const mm = (v) => v * MM;

const CREAM = '#ECE8DF';
const INK = '#171714';
const MUTED = '#5E5A54';
const GUIDE = '#4F4A43';
const VIAL = '#24231F';
const LABEL = '#DCD6CA';

const PIECES = [
  { no: '01', name: 'SOTTO VOCE', notes: 'SUEDE · VANILLA · AMBER' },
  { no: '02', name: 'LOW FEVER', notes: 'AMBER · CEDAR · MUSK' },
  { no: '03', name: 'LACUNA', notes: 'IRIS · SPICE · AIR' },
  { no: '04', name: 'PALE HUM', notes: 'WHITE MUSK · SOFT CITRUS · SKIN' }
];

function rgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

function solid(hex, opacity = 1) {
  return { type: 'SOLID', color: rgb(hex), opacity };
}

function addText(parent, value, x, y, w, h, opts = {}) {
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

function makePaper(name) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(mm(186), mm(208));
  f.fills = [solid(CREAM)];
  f.clipsContent = true;
  return f;
}

function addFold(parent, visible) {
  const l = figma.createLine();
  parent.appendChild(l);
  l.name = visible ? 'FOLD / SCORE — 104 MM' : 'FOLD GUIDE — 104 MM — NON PRINT';
  l.resize(parent.width, 0);
  l.x = 0;
  l.y = mm(104);
  l.strokes = [solid(GUIDE, visible ? 0.9 : 0.35)];
  l.strokeWeight = visible ? 1.1 : 0.5;
  l.dashPattern = [8, 5];
  l.visible = !!visible;
  return l;
}

function addVial(parent, cx, top) {
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

function findMasterLogo() {
  return figma.currentPage.findOne(function (n) {
    return n.name === 'TWYNE — MASTER WORDMARK — EXACT ARTWORK';
  });
}

function placeLogo(parent, master, centerX, centerY, widthMM) {
  if (master && master.clone) {
    const mark = master.clone();
    parent.appendChild(mark);
    mark.name = 'TWYNE — MASTER WORDMARK — EXACT ARTWORK';
    const ratio = master.height / master.width;
    mark.resize(mm(widthMM), mm(widthMM) * ratio);
    mark.x = centerX - mark.width / 2;
    mark.y = centerY - mark.height / 2;
    return mark;
  }

  const fallback = addText(parent, 'TWYNE', centerX - mm(35), centerY - mm(7), mm(70), mm(14), {
    size: 18,
    bold: true,
    align: 'CENTER',
    tracking: 3.2
  });
  fallback.name = 'TWYNE — FALLBACK WORDMARK';
  return fallback;
}

function addInside(parent) {
  addText(parent, 'VOLUME I — KENOPSIA', mm(18), mm(28), mm(150), mm(10), {
    size: 10.2,
    bold: true,
    align: 'CENTER',
    tracking: 1.05
  });

  addText(parent, 'The warmth a place keeps after everyone leaves.', mm(20), mm(41), mm(146), mm(8), {
    size: 7.1,
    align: 'CENTER',
    color: MUTED,
    tracking: 0.12
  });

  const centersMM = [23, 70, 116, 163];
  const groupWidthMM = 40;

  PIECES.forEach(function (p, i) {
    const centerMM = centersMM[i];
    const leftMM = centerMM - groupWidthMM / 2;
    const cx = mm(centerMM);

    addVial(parent, cx, mm(118));

    addText(parent, p.no, mm(leftMM), mm(153), mm(groupWidthMM), mm(6), {
      size: 5.2,
      align: 'CENTER',
      color: MUTED,
      tracking: 0.95
    });

    addText(parent, p.name, mm(leftMM), mm(160), mm(groupWidthMM), mm(8), {
      size: 6.6,
      align: 'CENTER',
      color: INK,
      tracking: 1.05
    });

    addText(parent, p.notes, mm(leftMM - 1), mm(170), mm(groupWidthMM + 2), mm(11), {
      size: 6.6,
      align: 'CENTER',
      color: INK,
      tracking: 0.58,
      lineHeight: 8.0
    });
  });

  addText(parent, 'Wear each piece on skin.\nOne day at a time.', mm(18), mm(192), mm(150), mm(11), {
    size: 6.2,
    align: 'CENTER',
    lineHeight: 7.7,
    tracking: 0.15
  });
}

function makeGuide() {
  const board = figma.createFrame();
  board.name = 'PRODUCTION GUIDE — CUT + FOLD';
  board.resize(mm(216), mm(244));
  board.fills = [solid('#F5F2EB')];
  board.clipsContent = false;

  const sheet = makePaper('FINAL SHEET — 186 × 208 MM');
  board.appendChild(sheet);
  sheet.x = mm(15);
  sheet.y = mm(20);
  sheet.strokes = [solid(INK)];
  sheet.strokeWeight = 1.2;
  addFold(sheet, true);

  addText(board, 'CUT EDGE — 186 MM', mm(15), mm(4), mm(186), mm(8), {
    size: 7,
    bold: true,
    align: 'CENTER',
    tracking: 0.55
  });
  addText(board, 'CUT ALL 4 OUTER EDGES', mm(15), mm(12), mm(186), mm(6), {
    size: 5.5,
    align: 'CENTER',
    color: MUTED,
    tracking: 0.35
  });
  addText(sheet, 'FOLD / SCORE AT 104 MM — DO NOT CUT', mm(12), mm(99), mm(162), mm(10), {
    size: 6.8,
    bold: true,
    align: 'CENTER',
    color: GUIDE,
    tracking: 0.4
  });

  const centersMM = [23, 70, 116, 163];
  PIECES.forEach(function (p, i) {
    const centerMM = centersMM[i];
    addText(sheet, p.name, mm(centerMM - 20), mm(157), mm(40), mm(8), {
      size: 5.7,
      align: 'CENTER',
      tracking: 0.85
    });
    addText(sheet, p.notes, mm(centerMM - 21), mm(168), mm(42), mm(11), {
      size: 5.2,
      align: 'CENTER',
      color: INK,
      tracking: 0.34,
      lineHeight: 6.2
    });
  });

  addText(board, '208 MM OPEN HEIGHT', mm(15), mm(230), mm(186), mm(6), {
    size: 5.8,
    bold: true,
    align: 'CENTER',
    tracking: 0.45
  });
  addText(board, 'SOLID OUTER BORDER = CUT  /  DASHED CENTER LINE = SCORE + FOLD', mm(15), mm(236), mm(186), mm(6), {
    size: 5.4,
    align: 'CENTER',
    color: GUIDE,
    tracking: 0.25
  });

  return board;
}

Promise.all([
  figma.loadFontAsync({ family: 'Inter', style: 'Regular' }),
  figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' })
]).then(function () {
  const master = findMasterLogo();
  const inside = makePaper('INSIDE PRINT — 186 × 208 MM — NOTES VISIBLE');
  const outside = makePaper('OUTSIDE PRINT — 186 × 208 MM');
  const guide = makeGuide();
  const folded = figma.createFrame();

  folded.name = 'FOLDED PREVIEW — 186 × 104 MM';
  folded.resize(mm(186), mm(104));
  folded.fills = [solid(CREAM)];
  folded.strokes = [solid(INK, 0.3)];
  folded.strokeWeight = 0.8;

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

  addFold(inside, false);
  addFold(outside, false);
  addInside(inside);

  placeLogo(outside, master, outside.width / 2, mm(156), 62);
  placeLogo(folded, master, folded.width / 2, folded.height / 2, 62);

  const spec = figma.createText();
  spec.fontName = { family: 'Inter', style: 'Regular' };
  spec.characters = 'OPEN 186 × 208 MM  /  FOLDED 186 × 104 MM  /  SCORE AT 104 MM  /  CREAMY #ECE8DF  /  BOTTLE CENTERS 23 / 70 / 116 / 163 MM  /  NOTES LARGE + VISIBLE UNDER EVERY BOTTLE';
  spec.fontSize = 7;
  spec.fills = [solid(MUTED)];
  spec.x = inside.x;
  spec.y = inside.y + inside.height + mm(10);
  spec.name = 'PRODUCTION SPEC — NON PRINT';

  figma.currentPage.selection = [inside, outside, guide, folded];
  figma.viewport.scrollAndZoomIntoView([inside, outside, guide, folded]);
  figma.closePlugin('TWYNE Gift Set updated — notes forced visible in original code.js entrypoint');
}).catch(function (err) {
  figma.closePlugin('TWYNE plugin error: ' + String(err));
});
