const MM = 72 / 25.4;

const COLORS = {
  cream: '#E7E4DD',
  ink: '#171714',
  muted: '#68635B',
  vial: '#24231F',
  label: '#DCD6CA'
};

const PIECES = [
  { no: '01', name: 'SOTTO VOCE', notes: 'Suede · Vanilla · Amber' },
  { no: '02', name: 'LOW FEVER', notes: 'Amber · Cedar · Musk' },
  { no: '03', name: 'LACUNA', notes: 'Iris · Spice · Air' },
  { no: '04', name: 'PALE HUM', notes: 'White Musk · Soft Citrus · Skin' }
];

function mm(value) {
  return value * MM;
}

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  const n = parseInt(value, 16);
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255
  };
}

function paint(hex, opacity = 1) {
  return { type: 'SOLID', color: hexToRgb(hex), opacity };
}

async function loadFonts() {
  await Promise.all([
    figma.loadFontAsync({ family: 'Inter', style: 'Regular' }),
    figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' })
  ]);
}

function addText(parent, text, x, y, w, h, options = {}) {
  const node = figma.createText();
  parent.appendChild(node);
  node.fontName = {
    family: 'Inter',
    style: options.weight === 'semibold' ? 'Semi Bold' : 'Regular'
  };
  node.characters = text;
  node.fontSize = options.size || 8;
  node.fills = [paint(options.color || COLORS.ink)];
  node.textAlignHorizontal = options.align || 'LEFT';
  node.textAlignVertical = options.vAlign || 'CENTER';
  node.textAutoResize = 'NONE';
  node.resize(w, h);
  node.x = x;
  node.y = y;
  node.lineHeight = { value: options.lineHeight || (options.size || 8) * 1.25, unit: 'PIXELS' };
  node.letterSpacing = { value: options.tracking || 0, unit: 'PIXELS' };
  if (options.opacity !== undefined) node.opacity = options.opacity;
  return node;
}

function createPaperFrame(name, widthMm, heightMm) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.resize(mm(widthMm), mm(heightMm));
  frame.fills = [paint(COLORS.cream)];
  frame.clipsContent = true;
  frame.strokeWeight = 0;
  return frame;
}

function createHiddenFoldGuide(parent, yMm) {
  const line = figma.createLine();
  parent.appendChild(line);
  line.name = `FOLD GUIDE — ${yMm} MM — NON PRINT`;
  line.resize(parent.width, 0);
  line.x = 0;
  line.y = mm(yMm);
  line.strokes = [paint('#918B81', 0.5)];
  line.strokeWeight = 0.5;
  line.dashPattern = [4, 4];
  line.visible = false;
  return line;
}

function createVial(parent, centerX, topY) {
  const cap = figma.createRectangle();
  parent.appendChild(cap);
  cap.name = '2ML VIAL CAP';
  cap.resize(mm(7.5), mm(6));
  cap.x = centerX - cap.width / 2;
  cap.y = topY;
  cap.cornerRadius = mm(0.6);
  cap.fills = [paint('#121210')];

  const body = figma.createRectangle();
  parent.appendChild(body);
  body.name = '2ML VIAL BODY';
  body.resize(mm(9.5), mm(27));
  body.x = centerX - body.width / 2;
  body.y = topY + mm(5.5);
  body.cornerRadius = mm(0.7);
  body.fills = [paint(COLORS.vial)];

  const label = figma.createRectangle();
  parent.appendChild(label);
  label.name = '2ML VIAL LABEL';
  label.resize(mm(7.2), mm(8));
  label.x = centerX - label.width / 2;
  label.y = body.y + mm(10.5);
  label.fills = [paint(COLORS.label)];

  return [cap, body, label];
}

function makeGiftSetInsert() {
  const page = figma.createPage();
  page.name = 'GIFT SET INSERT — 186 × 208 MM';

  const openW = mm(186);
  const openH = mm(208);
  const panelH = mm(104);
  const gap = mm(18);

  const inside = createPaperFrame('INSIDE PRINT — 186 × 208 MM', 186, 208);
  inside.x = 0;
  inside.y = 0;
  page.appendChild(inside);
  createHiddenFoldGuide(inside, 104);

  addText(
    inside,
    'VOLUME I — KENOPSIA',
    mm(18), mm(29), mm(150), mm(10),
    { size: 10.5, weight: 'semibold', align: 'CENTER', tracking: 1.1 }
  );
  addText(
    inside,
    'The warmth a place keeps after everyone leaves.',
    mm(20), mm(41), mm(146), mm(8),
    { size: 7.2, align: 'CENTER', color: COLORS.muted }
  );

  const columnW = 186 / 4;
  const vialTop = mm(117);

  PIECES.forEach((piece, i) => {
    const leftMm = i * columnW;
    const centerX = mm(leftMm + columnW / 2);
    createVial(inside, centerX, vialTop);

    addText(
      inside,
      piece.no,
      mm(leftMm + 4), mm(153), mm(columnW - 8), mm(7),
      { size: 5.5, align: 'CENTER', color: COLORS.muted, tracking: 0.7 }
    );
    addText(
      inside,
      piece.name,
      mm(leftMm + 3), mm(160), mm(columnW - 6), mm(8),
      { size: 6.7, weight: 'semibold', align: 'CENTER', tracking: 0.25 }
    );
    addText(
      inside,
      piece.notes,
      mm(leftMm + 4), mm(169), mm(columnW - 8), mm(15),
      { size: 5.2, align: 'CENTER', color: COLORS.muted, lineHeight: 6.4 }
    );
  });

  addText(
    inside,
    'Wear each piece on skin.\nOne day at a time.',
    mm(18), mm(192), mm(150), mm(11),
    { size: 6.3, align: 'CENTER', lineHeight: 7.8 }
  );

  const outside = createPaperFrame('OUTSIDE PRINT — 186 × 208 MM', 186, 208);
  outside.x = openW + gap;
  outside.y = 0;
  page.appendChild(outside);
  createHiddenFoldGuide(outside, 104);

  addText(
    outside,
    'TWYNE',
    mm(20), panelH + mm(40), mm(146), mm(18),
    { size: 17, weight: 'semibold', align: 'CENTER', tracking: 3.2 }
  );

  const spec = figma.createText();
  page.appendChild(spec);
  spec.name = 'PRODUCTION SPEC — NON PRINT';
  spec.fontName = { family: 'Inter', style: 'Regular' };
  spec.characters = 'FINISHED FOLDED SIZE 186 × 104 MM   /   OPEN SIZE 186 × 208 MM   /   FOLD AT 104 MM   /   PAPER: CREAMY #E7E4DD';
  spec.fontSize = 7;
  spec.fills = [paint(COLORS.muted)];
  spec.x = 0;
  spec.y = openH + mm(10);

  return { page, inside, outside };
}

function makeSottoVoceCard() {
  const page = figma.createPage();
  page.name = '50ML CARD — SOTTO VOCE';

  const w = 86;
  const h = 56;
  const gap = 14;

  const front = createPaperFrame('FRONT — 86 × 56 MM', w, h);
  front.x = 0;
  front.y = 0;
  page.appendChild(front);

  addText(front, 'TWYNE', mm(8), mm(7), mm(70), mm(8), {
    size: 7.5, weight: 'semibold', align: 'CENTER', tracking: 1.5
  });
  addText(front, 'VOLUME I — KENOPSIA', mm(8), mm(18), mm(70), mm(6), {
    size: 5.2, align: 'CENTER', color: COLORS.muted, tracking: 0.45
  });
  addText(front, 'SOTTO VOCE', mm(8), mm(28), mm(70), mm(8), {
    size: 9.2, weight: 'semibold', align: 'CENTER', tracking: 0.7
  });
  addText(front, 'Some things are only understood\nwhen spoken quietly.', mm(10), mm(39), mm(66), mm(10), {
    size: 5.8, align: 'CENTER', color: COLORS.muted, lineHeight: 7.1
  });

  const back = createPaperFrame('BACK — 86 × 56 MM', w, h);
  back.x = mm(w + gap);
  back.y = 0;
  page.appendChild(back);

  addText(back, '01', mm(8), mm(7), mm(70), mm(6), {
    size: 5.4, align: 'CENTER', color: COLORS.muted, tracking: 0.7
  });
  addText(back, 'Suede · Vanilla · Amber', mm(8), mm(18), mm(70), mm(8), {
    size: 7, weight: 'semibold', align: 'CENTER'
  });
  addText(back, 'TWO STATES. A THIRD FORM.', mm(8), mm(34), mm(70), mm(7), {
    size: 5.4, align: 'CENTER', tracking: 0.6
  });
  addText(back, 'A HAUS OF VOLUMES', mm(8), mm(44), mm(70), mm(6), {
    size: 5.2, align: 'CENTER', color: COLORS.muted, tracking: 0.8
  });

  return { page, front, back };
}

figma.showUI(__html__, {
  width: 360,
  height: 360,
  title: 'TWYNE Production Tools',
  themeColors: true
});

figma.ui.onmessage = async (message) => {
  try {
    await loadFonts();

    if (message.type === 'create-gift-set-insert') {
      const result = makeGiftSetInsert();
      await figma.setCurrentPageAsync(result.page);
      figma.currentPage.selection = [result.inside, result.outside];
      figma.viewport.scrollAndZoomIntoView([result.inside, result.outside]);
      figma.ui.postMessage({ type: 'status', text: 'Gift Set insert created.' });
      return;
    }

    if (message.type === 'create-sotto-card') {
      const result = makeSottoVoceCard();
      await figma.setCurrentPageAsync(result.page);
      figma.currentPage.selection = [result.front, result.back];
      figma.viewport.scrollAndZoomIntoView([result.front, result.back]);
      figma.ui.postMessage({ type: 'status', text: 'SOTTO VOCE 50ml card created.' });
      return;
    }

    if (message.type === 'close') {
      figma.closePlugin();
    }
  } catch (error) {
    figma.ui.postMessage({
      type: 'status',
      text: `Error: ${error && error.message ? error.message : String(error)}`,
      isError: true
    });
  }
};
