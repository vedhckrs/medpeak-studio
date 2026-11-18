// Illustrator (ExtendScript): open a stock source file and report how it is built, then save an .ai copy
// and a flat PNG to look at. Run from PowerShell with pipeline/animate/run-ai.ps1 (no screen control).
//   ARGS[0] = source file (eps/ai)   ARGS[1] = output folder
(function () {
  var src = new File(ARGS[0]);
  var outDir = new Folder(ARGS[1]);
  if (!outDir.exists) outDir.create();
  app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
  var doc = app.open(src);
  var lines = [];
  var ab = doc.artboards[0].artboardRect; // left, top, right, bottom
  lines.push('artboard ' + Math.round(ab[2] - ab[0]) + ' x ' + Math.round(ab[1] - ab[3]) + '  layers ' + doc.layers.length + '  pageItems ' + doc.pageItems.length);
  for (var i = 0; i < doc.layers.length; i++) {
    var L = doc.layers[i];
    lines.push('layer ' + i + ' "' + L.name + '"  top-level items ' + L.pageItems.length + '  groups ' + L.groupItems.length + '  paths ' + L.pathItems.length);
    // the tree of groups, four levels deep: path of indexes, type, x, y, width, height, children
    var walk = function (parent, path, depth) {
      var n = Math.min(parent.pageItems.length, 300);
      for (var j = 0; j < n; j++) {
        var it = parent.pageItems[j];
        var b = it.geometricBounds; // left, top, right, bottom
        var isGroup = it.typename === 'GroupItem';
        var kids = isGroup ? it.pageItems.length : 0;
        var w = Math.round(b[2] - b[0]);
        var h = Math.round(b[1] - b[3]);
        if (isGroup || depth <= 1) lines.push(path + j + '\t' + it.typename + '\t' + Math.round(b[0] - ab[0]) + '\t' + Math.round(ab[1] - b[1]) + '\t' + w + '\t' + h + '\t' + kids);
        if (isGroup && depth < 4 && (w > 60 || h > 60)) walk(it, path + j + '.', depth + 1);
      }
    };
    walk(L, '', 0);
  }
  var f = new File(outDir.fsName + '/structure.txt');
  f.encoding = 'UTF-8';
  f.open('w');
  f.write(lines.join('\n'));
  f.close();
  var opt = new ExportOptionsPNG24();
  opt.artBoardClipping = true;
  opt.horizontalScale = 300;
  opt.verticalScale = 300;
  doc.exportFile(new File(outDir.fsName + '/full.png'), ExportType.PNG24, opt);
  var ai = new IllustratorSaveOptions();
  doc.saveAs(new File(outDir.fsName + '/doctor-source.ai'), ai);
  doc.close(SaveOptions.DONOTSAVECHANGES);
  return lines.length + ' lines';
})();
