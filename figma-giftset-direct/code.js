const MM = 72 / 25.4;
const mm = (v) => v * MM;

const CREAM = '#ECE8DF';
const INK = '#171714';
const MUTED = '#68635B';
const GUIDE = '#4F4A43';
const VIAL = '#24231F';
const LABEL = '#DCD6CA';

const TWYNE_LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1867 163"><path d="M1255 4L1255 158L1256 159L1301 159L1302 158L1302 49L1304 46L1305 46L1309 50L1309 51L1318 61L1318 62L1322 66L1322 67L1326 71L1326 72L1331 77L1331 78L1335 82L1335 83L1342 91L1342 92L1345 95L1345 96L1349 100L1349 101L1352 104L1352 105L1356 109L1356 110L1359 113L1359 114L1363 118L1363 119L1367 123L1367 124L1374 132L1374 133L1377 136L1377 137L1381 141L1381 142L1384 145L1384 146L1388 150L1388 151L1391 154L1391 155L1395 159L1471 159L1472 158L1472 2L1471 1L1427 1L1425 2L1425 4L1424 5L1424 113L1423 114L1421 114L1417 110L1417 109L1414 106L1414 105L1410 101L1410 100L1406 96L1406 95L1403 92L1403 91L1395 82L1395 81L1392 78L1392 77L1380 63L1380 62L1377 59L1377 58L1369 49L1369 48L1366 45L1366 44L1358 35L1358 34L1355 31L1355 30L1347 21L1347 20L1340 12L1340 11L1336 7L1336 6L1333 3L1333 2L1331 1L1257 1ZM848 3L850 5L850 6L856 12L856 13L862 19L862 20L868 26L868 27L874 33L874 34L880 40L880 41L886 47L886 48L892 54L892 55L898 61L898 62L905 69L905 70L911 76L911 77L917 83L917 84L923 90L923 91L934 103L934 106L935 107L935 158L936 159L981 159L982 158L982 107L983 106L983 103L989 97L989 96L996 89L996 88L1010 73L1010 72L1016 66L1016 65L1023 58L1023 57L1030 50L1030 49L1037 42L1037 41L1044 34L1044 33L1051 26L1051 25L1057 19L1057 18L1070 4L1070 2L1068 1L1014 1L1012 2L1002 13L1002 14L998 18L998 19L993 24L993 25L989 29L989 30L984 35L984 36L975 46L975 47L970 52L970 53L964 59L964 60L960 64L958 64L951 57L951 56L940 44L940 43L936 39L936 38L932 34L932 33L928 29L928 28L924 24L924 23L920 19L920 18L916 14L916 13L907 2L905 1L850 1ZM368 3L369 5L369 7L370 8L370 10L371 11L371 13L372 14L372 16L373 17L373 19L374 20L374 22L375 23L375 25L376 26L376 28L377 29L377 31L378 32L378 34L379 35L379 37L380 38L380 40L381 41L381 43L383 46L383 48L384 49L384 51L385 52L385 54L386 55L387 60L389 63L389 65L390 66L390 68L391 69L392 74L394 77L394 79L395 80L395 82L396 83L397 88L399 91L399 93L400 94L400 96L401 97L402 102L404 105L404 107L405 108L405 110L406 111L406 113L407 114L407 116L408 117L408 119L409 120L409 122L410 123L410 125L411 126L411 128L412 129L412 131L413 132L413 134L414 135L414 137L415 138L415 140L416 141L416 143L417 144L417 146L418 147L418 149L419 150L419 152L420 153L420 155L422 159L486 159L488 155L488 153L489 152L489 150L490 149L490 147L491 146L491 144L492 143L492 141L493 140L493 138L494 137L494 135L495 134L495 132L496 131L496 129L497 128L497 126L498 125L498 123L499 122L500 117L501 116L502 109L503 108L503 106L504 105L504 103L505 102L505 100L506 99L506 97L507 96L507 94L508 93L508 91L509 90L509 88L510 87L510 85L511 84L511 82L512 81L512 79L513 78L513 76L514 75L514 73L515 72L516 67L518 64L518 62L519 61L520 56L522 54L524 55L526 59L526 61L527 62L527 64L528 65L528 67L529 68L529 70L530 71L530 73L531 74L532 79L534 82L535 87L537 90L537 92L538 93L538 95L539 96L539 98L540 99L540 101L542 105L542 108L543 109L543 111L544 112L544 114L546 118L546 121L547 122L547 124L548 125L548 127L550 131L550 134L551 135L551 137L552 138L552 140L553 141L553 143L554 144L554 146L555 147L555 149L556 150L556 152L557 153L558 158L559 159L623 159L625 155L625 153L627 150L627 146L628 145L628 143L630 140L630 138L631 137L631 135L632 134L632 132L633 131L633 129L634 128L635 123L637 120L637 118L638 117L638 115L639 114L639 112L640 111L640 109L641 108L641 106L642 105L643 100L645 97L645 95L646 94L646 92L647 91L647 89L648 88L648 86L649 85L649 83L650 82L651 77L653 74L653 72L654 71L654 69L655 68L655 66L656 65L656 63L657 62L657 60L658 59L658 57L659 56L659 54L660 53L660 51L661 50L661 48L662 47L662 45L663 44L663 42L664 41L664 39L665 38L665 36L666 35L666 33L667 32L667 30L668 29L668 27L669 26L669 24L670 23L670 21L671 20L671 18L672 17L672 15L673 14L673 12L674 11L674 9L676 5L676 2L674 1L630 1L628 3L627 5L627 7L626 8L626 10L625 11L625 13L624 14L624 17L623 18L623 20L622 21L622 23L621 24L621 26L620 27L620 29L618 33L618 36L617 37L617 39L616 40L616 42L615 43L615 45L614 46L614 48L612 52L612 55L611 56L611 58L610 59L610 61L609 62L609 64L608 65L608 67L606 71L606 74L605 75L605 77L604 78L604 80L603 81L603 83L602 84L602 86L601 87L601 89L600 90L600 92L599 93L599 95L598 96L598 98L597 99L597 101L596 102L596 104L594 108L594 110L592 114L590 115L587 112L587 110L586 109L586 107L585 106L585 104L584 103L584 101L583 100L583 98L582 97L582 95L581 94L580 89L578 86L578 84L577 83L577 81L576 80L576 78L575 77L575 75L574 74L574 72L573 71L573 69L572 68L572 66L571 65L571 63L570 62L570 60L569 59L568 54L566 51L566 49L565 48L565 46L564 45L564 43L563 42L563 40L562 39L562 37L561 36L561 34L560 33L560 31L559 30L559 28L558 27L558 25L557 24L557 22L556 21L556 19L555 18L555 16L554 15L554 13L553 12L553 10L552 9L552 7L551 6L551 4L550 2L547 2L546 1L516 1L515 2L497 2L494 6L494 8L493 9L493 11L492 12L492 14L491 15L491 17L490 18L490 20L489 21L489 23L488 24L487 29L485 32L485 34L484 35L484 37L483 38L483 40L482 41L482 43L481 44L481 46L480 47L480 49L479 50L479 52L478 53L478 55L477 56L477 58L476 59L475 64L473 67L473 69L472 70L472 72L471 73L470 78L468 81L468 83L467 84L467 86L466 87L465 92L463 95L463 97L462 98L462 100L461 101L460 106L458 109L458 111L457 113L455 115L454 115L451 111L451 109L450 108L450 106L448 102L448 99L447 98L447 96L446 95L446 93L445 92L445 90L444 89L444 87L443 86L443 84L441 80L441 77L440 76L440 74L439 73L439 71L438 70L438 68L437 67L437 65L436 64L436 62L434 58L434 55L433 54L433 52L432 51L431 46L429 43L429 41L428 40L428 38L426 34L426 31L424 27L424 24L423 23L423 21L422 20L422 18L421 17L421 15L420 14L420 12L419 11L419 9L418 8L418 6L416 2L414 2L413 1L370 1ZM3 1L1 3L1 38L3 40L70 40L72 43L72 158L73 159L118 159L120 157L120 42L122 40L188 40L189 39L191 39L191 36L192 35L192 3L189 1ZM1677 15L1672 25L1672 27L1671 28L1671 34L1670 35L1670 127L1671 128L1671 133L1672 134L1672 136L1676 144L1678 146L1678 147L1683 152L1688 154L1690 156L1692 156L1696 158L1700 158L1701 159L1708 159L1709 160L1841 160L1842 159L1849 159L1850 158L1854 158L1860 154L1860 153L1862 151L1862 148L1863 147L1863 143L1864 142L1864 127L1862 125L1729 125L1728 124L1726 124L1724 123L1720 119L1719 117L1719 115L1718 114L1718 100L1721 97L1842 97L1843 96L1862 96L1863 94L1863 66L1861 63L1846 63L1845 62L1727 62L1726 61L1724 61L1722 60L1719 57L1719 51L1718 50L1719 49L1719 44L1720 42L1725 37L1727 36L1729 36L1730 35L1862 35L1864 34L1864 19L1863 18L1863 14L1861 10L1855 4L1853 3L1850 3L1849 2L1846 2L1845 1L1837 1L1836 0L1713 0L1712 1L1704 1L1703 2L1700 2L1699 3L1696 3L1695 4L1690 5L1688 7L1682 10Z" fill="#171714" fill-rule="evenodd"/></svg>';

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

function masterLogo(parent, centerX, centerY, widthMM = 62) {
  const mark = figma.createNodeFromSvg(TWYNE_LOGO_SVG);
  parent.appendChild(mark);
  mark.name = 'TWYNE — MASTER WORDMARK — EXACT ARTWORK';
  const hMM = widthMM * (163 / 1867);
  mark.resize(mm(widthMM), mm(hMM));
  mark.x = centerX - mark.width / 2;
  mark.y = centerY - mark.height / 2;
  return mark;
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
  text(parent, 'VOLUME I — KENOPSIA', mm(18), mm(28), mm(150), mm(10), {
    size: 10.5, bold: true, align: 'CENTER', tracking: 1.1
  });
  text(parent, 'The warmth a place keeps after everyone leaves.', mm(20), mm(41), mm(146), mm(8), {
    size: 7.2, align: 'CENTER', color: MUTED
  });

  const centersMM = [18, 68, 118, 168];
  const groupWidthMM = 36;
  PIECES.forEach((p, i) => {
    const centerMM = centersMM[i];
    const leftMM = centerMM - groupWidthMM / 2;
    const cx = mm(centerMM);
    vial(parent, cx, mm(118));
    text(parent, p.no, mm(leftMM), mm(154), mm(groupWidthMM), mm(7), {
      size: 5.5, align: 'CENTER', color: MUTED, tracking: 0.7
    });
    text(parent, p.name, mm(leftMM), mm(162), mm(groupWidthMM), mm(8), {
      size: 6.7, bold: true, align: 'CENTER', tracking: 0.25
    });
    text(parent, p.notes, mm(leftMM), mm(172), mm(groupWidthMM), mm(13), {
      size: 5.2, align: 'CENTER', color: MUTED, lineHeight: 6.4
    });
  });

  text(parent, 'Wear each piece on skin.\nOne day at a time.', mm(18), mm(193), mm(150), mm(10), {
    size: 6.3, align: 'CENTER', lineHeight: 7.8
  });
}

function createProductionGuide() {
  const board = figma.createFrame();
  board.name = 'PRODUCTION GUIDE — CUT + FOLD';
  board.resize(mm(216), mm(244));
  board.fills = [solid('#F5F2EB')];
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

  foldGuide(sheet, true);

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
  text(sheet, 'VOLUME I — KENOPSIA', mm(18), mm(36), mm(150), mm(10), {
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
  text(sheet, 'BOTTLE CENTERS — 18 / 68 / 118 / 168 MM', mm(8), mm(123), mm(170), mm(8), {
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

  masterLogo(folded, folded.width / 2, folded.height / 2, 62);
  return folded;
}

Promise.all([
  figma.loadFontAsync({ family: 'Inter', style: 'Regular' }),
  figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' })
]).then(() => {
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

  masterLogo(outside, outside.width / 2, mm(156), 62);

  const spec = figma.createText();
  spec.fontName = { family: 'Inter', style: 'Regular' };
  spec.characters = 'FINISHED FOLDED SIZE 186 × 104 MM  /  OPEN SIZE 186 × 208 MM  /  SCORE + FOLD AT 104 MM  /  BOTTLE CENTERS 18 / 68 / 118 / 168 MM  /  CUT ONLY 4 OUTER EDGES  /  CREAMY #ECE8DF  /  EXACT TWYNE MASTER WORDMARK';
  spec.fontSize = 7;
  spec.fills = [solid(MUTED)];
  spec.x = inside.x;
  spec.y = inside.y + inside.height + mm(10);
  spec.name = 'PRODUCTION SPEC — NON PRINT';

  figma.currentPage.selection = [inside, outside, guide, folded];
  figma.viewport.scrollAndZoomIntoView([inside, outside, guide, folded]);
  figma.closePlugin('TWYNE Gift Set insert updated — creamy paper + wider bottle spacing');
}).catch((err) => {
  figma.closePlugin('TWYNE plugin error: ' + String(err));
});
