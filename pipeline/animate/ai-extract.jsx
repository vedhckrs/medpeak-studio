// Illustrator (ExtendScript): cut a character constructor sheet into separate parts.
// Each part is one group (or path) of the source, found by its index path in the group tree
// (see structure.txt from ai-inspect.jsx). It is exported as a transparent PNG (at 400% unless ARGS[3] says otherwise), and its
// place on the sheet is written to parts.json, so the figure can be put together again exactly.
//   ARGS[0] = source .ai   ARGS[1] = output folder   ARGS[2] = spec file (JSON: [{name, path, each?, z?}])
//   ARGS[3] = export scale in percent (400 when left out)
//   {name, rect: [x, y, w, h]} takes every top-level item that lies fully inside that rectangle of the
//   sheet (x to the right, y down, from the artboard's top-left corner) as one part: for things the
//   artist left as loose pieces, like a hand and its nails.
//   "each": true exports every child of that group as <name>-<index> (a figure's own parts, in order).
(function () {
  var outDir = new Folder(ARGS[1]);
  if (!outDir.exists) outDir.create();
  var sf = new File(ARGS[2]);
  sf.open('r');
  var spec = eval('(' + sf.read() + ')');
  sf.close();
  app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
  var doc = app.open(new File(ARGS[0]));
  var ab = doc.artboards[0].artboardRect;
  var find = function (path) {
    var p = path.split('.');
    var it = doc.layers[0];
    for (var i = 0; i < p.length; i++) it = it.pageItems[Number(p[i])];
    return it;
  };
  var tmp = app.documents.add(DocumentColorSpace.RGB, 2000, 2000);
  var opt = new ExportOptionsPNG24();
  opt.artBoardClipping = true;
  opt.transparency = true;
  opt.antiAliasing = true;
  var scale = ARGS.length > 3 ? Number(ARGS[3]) : 400;
  opt.horizontalScale = scale;
  opt.verticalScale = scale;
  var parts = [];
  var one = function (item, name, z) {
    app.activeDocument = tmp;
    var copy = item.duplicate(tmp.layers[0], ElementPlacement.PLACEATBEGINNING);
    var b = copy.visibleBounds; // left, top, right, bottom
    tmp.artboards[0].artboardRect = [b[0] - 1, b[1] + 1, b[2] + 1, b[3] - 1];
    tmp.exportFile(new File(outDir.fsName + '/' + name + '.png'), ExportType.PNG24, opt);
    copy.remove();
    var g = item.visibleBounds;
    parts.push('{"name": "' + name + '", "x": ' + (g[0] - ab[0] - 1).toFixed(2) + ', "y": ' + (ab[1] - g[1] - 1).toFixed(2) + ', "w": ' + (g[2] - g[0] + 2).toFixed(2) + ', "h": ' + (g[1] - g[3] + 2).toFixed(2) + ', "z": ' + z + ', "type": "' + item.typename + '"}');
  };
  var boundsOf = null; // the bounds of every top-level item, read once (reading them is slow)
  var region = function (name, r) {
    var top = doc.layers[0].pageItems;
    if (!boundsOf) { boundsOf = []; for (var b0 = 0; b0 < top.length; b0++) { try { boundsOf.push(top[b0].visibleBounds); } catch (eb) { boundsOf.push(null); } } }
    var L = ab[0] + r[0], T = ab[1] - r[1], R = L + r[2], B = T - r[3];
    app.activeDocument = tmp;
    var copies = [];
    var u = null;
    for (var i = top.length - 1; i >= 0; i--) {
      var g = boundsOf[i];
      if (!g || g[0] < L || g[2] > R || g[1] > T || g[3] < B) continue;
      copies.push(top[i].duplicate(tmp.layers[0], ElementPlacement.PLACEATBEGINNING));
      u = u ? [Math.min(u[0], g[0]), Math.max(u[1], g[1]), Math.max(u[2], g[2]), Math.min(u[3], g[3])] : [g[0], g[1], g[2], g[3]];
    }
    if (!u) return;
    var ok = true;
    try {
      // where the copies landed in the temporary document (its coordinates are not the sheet's)
      var t = null;
      for (var c0 = 0; c0 < copies.length; c0++) {
        var cb = copies[c0].visibleBounds;
        t = t ? [Math.min(t[0], cb[0]), Math.max(t[1], cb[1]), Math.max(t[2], cb[2]), Math.min(t[3], cb[3])] : [cb[0], cb[1], cb[2], cb[3]];
      }
      tmp.artboards[0].artboardRect = [t[0] - 1, t[1] + 1, t[2] + 1, t[3] - 1];
      tmp.exportFile(new File(outDir.fsName + '/' + name + '.png'), ExportType.PNG24, opt);
    } catch (er) { ok = false; }
    for (var c = 0; c < copies.length; c++) copies[c].remove();
    if (!ok) return; // a cell that cannot be exported is left out, the rest goes on
    parts.push('{"name": "' + name + '", "x": ' + (u[0] - ab[0] - 1).toFixed(2) + ', "y": ' + (ab[1] - u[1] - 1).toFixed(2) + ', "w": ' + (u[2] - u[0] + 2).toFixed(2) + ', "h": ' + (u[1] - u[3] + 2).toFixed(2) + ', "z": 0, "type": "region", "items": ' + copies.length + '}');
  };
  for (var s = 0; s < spec.length; s++) {
    if (spec[s].rect) { region(spec[s].name, spec[s].rect); continue; }
    var it = find(spec[s].path);
    if (spec[s].each) {
      for (var k = 0; k < it.pageItems.length; k++) one(it.pageItems[k], spec[s].name + '-' + (k < 10 ? '0' : '') + k, k); // z 0 = in front
    } else one(it, spec[s].name, spec[s].z || 0);
  }
  tmp.close(SaveOptions.DONOTSAVECHANGES);
  doc.close(SaveOptions.DONOTSAVECHANGES);
  var f = new File(outDir.fsName + '/parts.json');
  f.encoding = 'UTF-8';
  f.open('w');
  f.write('[\n' + parts.join(',\n') + '\n]\n');
  f.close();
  return parts.length + ' parts';
})();
