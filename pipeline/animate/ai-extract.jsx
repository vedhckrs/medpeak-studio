// Illustrator (ExtendScript): cut a character constructor sheet into separate parts.
// Each part is one group (or path) of the source, found by its index path in the group tree
// (see structure.txt from ai-inspect.jsx). It is exported as a transparent PNG at 400%, and its
// place on the sheet is written to parts.json, so the figure can be put together again exactly.
//   ARGS[0] = source .ai   ARGS[1] = output folder   ARGS[2] = spec file (JSON: [{name, path, each?}])
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
  opt.horizontalScale = 400;
  opt.verticalScale = 400;
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
  for (var s = 0; s < spec.length; s++) {
    var it = find(spec[s].path);
    if (spec[s].each) {
      for (var k = 0; k < it.pageItems.length; k++) one(it.pageItems[k], spec[s].name + '-' + (k < 10 ? '0' : '') + k, k); // z 0 = in front
    } else one(it, spec[s].name, 0);
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
