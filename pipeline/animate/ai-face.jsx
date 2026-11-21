// Illustrator (ExtendScript): finish a traced character sheet's face for animation.
//  1 Adds back the white catchlights a trace drops (small white spots inside the irises), as vector circles,
//    into whichever part each one sits in.
//  2 Splits the head into a base and its features: every shape that lies inside an eye box goes to its own
//    group (head-eyeL, head-eyeR) and every shape inside the mouth box to head-mouth. With a stacked trace
//    the skin is whole under them, so the base head stays a complete face without eyes and mouth, and the
//    features can be hidden for a blink or swapped for lip sync.
//   ARGS[0] = .ai (from ai-fixcaps.jsx)   ARGS[1] = output folder   ARGS[2] = name   ARGS[3] = face.json (face-find.py)
(function () {
  var out = new Folder(ARGS[1]);
  app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
  var doc = app.open(new File(ARGS[0]));
  try { app.executeMenuCommand('fitin'); } catch (e) {}
  var jf = new File(ARGS[3]);
  jf.open('r');
  var face = eval('(' + jf.read() + ')');
  jf.close();
  var ab = doc.artboards[0].artboardRect;
  var X = function (px) { return ab[0] + px; };
  var Y = function (py) { return ab[1] - py; };
  var parts = [];
  for (var g = 0; g < doc.groupItems.length; g++) if (/^part-/.test(doc.groupItems[g].name)) parts.push(doc.groupItems[g]);
  var inside = function (b, L, T, R, B) { return b[0] >= L && b[2] <= R && b[1] <= T && b[3] >= B; };
  // 1 catchlights
  var white = new RGBColor();
  white.red = 255; white.green = 255; white.blue = 255;
  var added = 0;
  for (var i = 0; i < face.lights.length; i++) {
    var l = face.lights[i];
    var w = l.w + 1.2, h = l.h + 1.2;
    var cx = X(l.x), cy = Y(l.y);
    var home = null, homeArea = 1e12;
    for (var p = 0; p < parts.length; p++) {
      var b = parts[p].geometricBounds;
      if (!inside([cx, cy, cx, cy], b[0], b[1], b[2], b[3])) continue;
      var a = (b[2] - b[0]) * (b[1] - b[3]);
      if (a < homeArea) { homeArea = a; home = parts[p]; }
    }
    if (!home) continue;
    var dot = doc.pathItems.ellipse(cy + h / 2, cx - w / 2, w, h);
    dot.filled = true;
    dot.stroked = false;
    dot.fillColor = white;
    dot.move(home, ElementPlacement.PLACEATBEGINNING); // on top inside its part
    added++;
  }
  // 2 the head's features
  var head = null;
  for (var q = 0; q < parts.length; q++) if (parts[q].name === face.head.name) head = parts[q];
  var split = function (box, name) {
    if (!box || !head) return 0;
    var L = X(box.x), T = Y(box.y), R = X(box.x + box.w), B = Y(box.y + box.h);
    var grp = doc.groupItems.add();
    grp.name = name;
    grp.move(head, ElementPlacement.PLACEBEFORE);
    var moved = [];
    for (var k = 0; k < head.pageItems.length; k++) if (inside(head.pageItems[k].geometricBounds, L, T, R, B)) moved.push(head.pageItems[k]);
    // keep their order: the last one stays at the bottom
    for (var m = moved.length - 1; m >= 0; m--) moved[m].move(grp, ElementPlacement.PLACEATBEGINNING);
    if (!moved.length) grp.remove();
    return moved.length;
  };
  // an eye box is the iris box made wide enough for the white of the eye and the lashes
  // (the lashes reach further out on the outer side: left for the left eye, right for the right one)
  var eyeBox = function (e, outerLeft) {
    if (!e) return null;
    var outer = 1.0, inner = 0.5;
    var left = outerLeft ? outer : inner, right = outerLeft ? inner : outer;
    return {x: e.x - e.w * left, y: e.y - e.h * 0.45, w: e.w * (1 + left + right), h: e.h * 1.65};
  };
  // a patch of the face's own skin under each feature, inside the base head: with the feature hidden (a
  // blink) or swapped (lip sync) the face shows no hole
  var skinOf = function (c) { return c && c.typename === 'RGBColor' && c.red > 215 && c.green > 150 && c.blue > 110 && c.red > c.green && c.green > c.blue; };
  var patch = function (box, shrink) {
    if (!box || !head) return;
    var big = null, bigArea = 0;
    for (var k = 0; k < head.pageItems.length; k++) {
      var it = head.pageItems[k];
      var c = null;
      try { c = it.typename === 'CompoundPathItem' ? it.pathItems[0].fillColor : it.fillColor; } catch (e) {}
      if (!skinOf(c)) continue;
      var b = it.geometricBounds;
      var a = (b[2] - b[0]) * (b[1] - b[3]);
      if (a > bigArea) { bigArea = a; big = it; }
    }
    if (!big) return;
    var fc = big.typename === 'CompoundPathItem' ? big.pathItems[0].fillColor : big.fillColor;
    var w = box.w * shrink, h = box.h * shrink;
    var cx = X(box.x + box.w / 2), cy = Y(box.y + box.h / 2);
    var e2 = doc.pathItems.ellipse(cy + h / 2, cx - w / 2, w, h);
    e2.filled = true;
    e2.stroked = false;
    e2.fillColor = fc;
    e2.move(big, ElementPlacement.PLACEBEFORE); // just above the face's skin, under the brows, nose and features
  };
  var bL = eyeBox(face.eyes[0], true), bR = eyeBox(face.eyes[1], false);
  var nL = split(bL, 'head-eyeL');
  var nR = split(bR, 'head-eyeR');
  var nM = split(face.mouth, 'head-mouth');
  patch(bL, 0.92);
  patch(bR, 0.92);
  patch(face.mouth, 0.9);
  doc.saveAs(new File(out.fsName + '/' + ARGS[2] + '.ai'), new IllustratorSaveOptions());
  var svg = new ExportOptionsSVG();
  svg.fontSubsetting = SVGFontSubsetting.None;
  doc.exportFile(new File(out.fsName + '/' + ARGS[2] + '.svg'), ExportType.SVG, svg);
  doc.close(SaveOptions.DONOTSAVECHANGES);
  return added + ' catchlights added; head features: left eye ' + nL + ', right eye ' + nR + ', mouth ' + nM + ' shapes';
})();
