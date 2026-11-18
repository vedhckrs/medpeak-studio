// Illustrator (ExtendScript): trace a flat-colour picture into vectors and sort the result into parts.
// For a character sheet whose body parts are drawn apart on white: every part becomes its own named
// group, ready to be rigged. Run from PowerShell with pipeline/animate/run-ai.ps1.
//   ARGS[0] = picture (png/jpg)   ARGS[1] = output folder   ARGS[2] = name   ARGS[3] = colours (default 24)
//   ARGS[4] = how far two shapes' boxes must overlap to count as one part (default -6: boxes that only
//             touch, like a pelvis and the thigh drawn just below it, stay apart)
(function () {
  var out = new Folder(ARGS[1]);
  if (!out.exists) out.create();
  var name = ARGS[2];
  app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
  var src = new File(ARGS[0]);
  var doc = app.documents.add(DocumentColorSpace.RGB, 3072, 2048);
  var fit = function () { try { app.executeMenuCommand('fitin'); } catch (e) {} };
  var placed = doc.placedItems.add();
  placed.file = src;
  // the page takes the picture's size
  var pb = placed.geometricBounds;
  doc.artboards[0].artboardRect = [pb[0], pb[1], pb[2], pb[3]];
  fit();
  var traced = placed.trace();
  var o = traced.tracing.tracingOptions;
  var notes = [];
  var set = function (key, value) { try { o[key] = value; } catch (e) { notes.push(key + ': ' + e); } };
  set('tracingMode', TracingModeType.TRACINGMODECOLOR);
  set('tracingColorTypeValue', TracingColorType.TRACINGLIMITEDCOLOR);
  set('maxColors', ARGS.length > 3 ? Number(ARGS[3]) : 24);
  set('tracingMethod', TracingMethodType.TRACINGMETHODABUTTING);
  set('fills', true);
  set('strokes', false);
  set('pathFidelity', 75);
  set('cornerFidelity', 60);
  set('noiseFidelity', 100); // drop specks: they show as blotches on flat cloth
  set('ignoreWhite', false); // white is kept (eyes, teeth); the page's own white is taken out below
  app.redraw();
  var group = traced.tracing.expandTracing();
  fit();
  // every traced shape, with its box
  var paths = [];
  var collect = function (parent) {
    for (var i = 0; i < parent.pageItems.length; i++) {
      var it = parent.pageItems[i];
      if (it.typename === 'GroupItem') collect(it); else paths.push(it);
    }
  };
  collect(group);
  // the white background: white shapes about as big as the page
  var page = doc.artboards[0].artboardRect;
  var pageW = page[2] - page[0], pageH = page[1] - page[3];
  var kept = [];
  var removed = 0;
  for (var w0 = 0; w0 < paths.length; w0++) {
    var it0 = paths[w0];
    var c0 = null;
    try { c0 = it0.typename === 'CompoundPathItem' ? it0.pathItems[0].fillColor : it0.fillColor; } catch (e0) {}
    var white = c0 && c0.typename === 'RGBColor' && c0.red > 244 && c0.green > 244 && c0.blue > 244;
    var gb = it0.geometricBounds;
    if (white && (gb[2] - gb[0] > pageW * 0.5 || gb[1] - gb[3] > pageH * 0.5)) { it0.remove(); removed++; } else kept.push(it0);
  }
  paths = kept;
  notes.push('background shapes removed ' + removed);
  var n = paths.length;
  var box = [];
  for (var a = 0; a < n; a++) box.push(paths[a].geometricBounds); // left, top, right, bottom
  // shapes whose boxes touch belong to one part (the parts are drawn apart on the sheet)
  var root = [];
  for (var r = 0; r < n; r++) root.push(r);
  var find = function (x) { while (root[x] !== x) { root[x] = root[root[x]]; x = root[x]; } return x; };
  var pad = ARGS.length > 4 ? Number(ARGS[4]) : -6;
  for (var p = 0; p < n; p++) for (var q = p + 1; q < n; q++) {
    if (box[p][2] + pad < box[q][0] || box[q][2] + pad < box[p][0] || box[p][3] - pad > box[q][1] || box[q][3] - pad > box[p][1]) continue;
    root[find(p)] = find(q);
  }
  var parts = {};
  var order = [];
  for (var s = 0; s < n; s++) {
    var k = find(s);
    if (!parts[k]) { parts[k] = {items: [], b: [box[s][0], box[s][1], box[s][2], box[s][3]]}; order.push(k); }
    var P = parts[k];
    P.items.push(s);
    P.b = [Math.min(P.b[0], box[s][0]), Math.max(P.b[1], box[s][1]), Math.max(P.b[2], box[s][2]), Math.min(P.b[3], box[s][3])];
  }
  // name the parts in reading order (rows from the top, then left to right) and group them
  order.sort(function (x, y) {
    var A = parts[x].b, B = parts[y].b;
    var rowA = Math.round(-(A[1] + A[3]) / 2 / 300), rowB = Math.round(-(B[1] + B[3]) / 2 / 300);
    return rowA !== rowB ? rowA - rowB : A[0] - B[0];
  });
  var lines = [];
  var ab = doc.artboards[0].artboardRect;
  for (var t = 0; t < order.length; t++) {
    var part = parts[order[t]];
    var g = doc.groupItems.add();
    g.name = 'part-' + (t < 9 ? '0' : '') + (t + 1);
    // keep the stacking order of the trace inside the part
    for (var u = part.items.length - 1; u >= 0; u--) paths[part.items[u]].move(g, ElementPlacement.PLACEATBEGINNING);
    lines.push('{"name": "' + g.name + '", "x": ' + (part.b[0] - ab[0]).toFixed(1) + ', "y": ' + (ab[1] - part.b[1]).toFixed(1) + ', "w": ' + (part.b[2] - part.b[0]).toFixed(1) + ', "h": ' + (part.b[1] - part.b[3]).toFixed(1) + ', "shapes": ' + part.items.length + '}');
  }
  var f = new File(out.fsName + '/' + name + '-parts.json');
  f.encoding = 'UTF-8';
  f.open('w');
  f.write('[\n' + lines.join(',\n') + '\n]\n');
  f.close();
  var ai = new IllustratorSaveOptions();
  doc.saveAs(new File(out.fsName + '/' + name + '.ai'), ai);
  var svg = new ExportOptionsSVG();
  svg.fontSubsetting = SVGFontSubsetting.None;
  doc.exportFile(new File(out.fsName + '/' + name + '.svg'), ExportType.SVG, svg);
  var png = new ExportOptionsPNG24();
  png.artBoardClipping = true;
  png.transparency = true;
  png.horizontalScale = 60;
  png.verticalScale = 60;
  doc.exportFile(new File(out.fsName + '/' + name + '-traced.png'), ExportType.PNG24, png);
  doc.close(SaveOptions.DONOTSAVECHANGES);
  return n + ' shapes in ' + order.length + ' parts' + (notes.length ? '; ' + notes.join('; ') : '');
})();
