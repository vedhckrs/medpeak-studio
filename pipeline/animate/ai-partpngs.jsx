// Illustrator (ExtendScript): export every named group of a sheet (part-NN, head-...) as its own transparent
// PNG, and write where each one sits (sheet units, from the artboard's top-left corner) to <name>-pngs.json.
// Each copy is moved near the page origin before export (an artboard far from it is refused or exported
// at the wrong size).
//   ARGS[0] = .ai   ARGS[1] = output folder   ARGS[2] = name   ARGS[3] = scale in percent (default 200)
(function () {
  var out = new Folder(ARGS[1]);
  if (!out.exists) out.create();
  app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
  var doc = app.open(new File(ARGS[0]));
  try { app.executeMenuCommand('fitin'); } catch (e) {}
  var ab = doc.artboards[0].artboardRect;
  var scale = ARGS.length > 3 ? Number(ARGS[3]) : 200;
  var opt = new ExportOptionsPNG24();
  opt.artBoardClipping = true;
  opt.transparency = true;
  opt.antiAliasing = true;
  opt.horizontalScale = scale;
  opt.verticalScale = scale;
  var tmp = app.documents.add(DocumentColorSpace.RGB, 2000, 2000);
  var lines = [];
  var groups = [];
  for (var g = 0; g < doc.groupItems.length; g++) {
    var it = doc.groupItems[g];
    if (/^(part|head)-/.test(it.name)) groups.push(it);
  }
  for (var i = 0; i < groups.length; i++) {
    var item = groups[i];
    var b = item.visibleBounds;
    app.activeDocument = tmp;
    var copy = item.duplicate(tmp.layers[0], ElementPlacement.PLACEATBEGINNING);
    var c0 = copy.visibleBounds;
    copy.translate(100 - c0[0], -100 - c0[1]);
    var c = copy.visibleBounds;
    tmp.artboards[0].artboardRect = [c[0] - 1, c[1] + 1, c[2] + 1, c[3] - 1];
    try { app.executeMenuCommand('fitin'); } catch (e2) {}
    tmp.exportFile(new File(out.fsName + '/' + item.name + '.png'), ExportType.PNG24, opt);
    copy.remove();
    lines.push('{"name": "' + item.name + '", "x": ' + (b[0] - ab[0] - 1).toFixed(2) + ', "y": ' + (ab[1] - b[1] - 1).toFixed(2) + ', "w": ' + (b[2] - b[0] + 2).toFixed(2) + ', "h": ' + (b[1] - b[3] + 2).toFixed(2) + '}');
  }
  tmp.close(SaveOptions.DONOTSAVECHANGES);
  doc.close(SaveOptions.DONOTSAVECHANGES);
  var f = new File(out.fsName + '/' + ARGS[2] + '-pngs.json');
  f.encoding = 'UTF-8';
  f.open('w');
  f.write('[' + String.fromCharCode(10) + lines.join(',' + String.fromCharCode(10)) + String.fromCharCode(10) + ']' + String.fromCharCode(10));
  f.close();
  return lines.length + ' parts exported at ' + scale + '%';
})();
