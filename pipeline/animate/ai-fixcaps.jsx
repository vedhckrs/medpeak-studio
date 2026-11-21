// Illustrator (ExtendScript): give the joint ends of clothed body parts the colour of the part.
// An AI parts sheet draws each limb as if it were cut open: a skin-coloured oval at every end. Joined
// up, those ovals would show as skin rings at the elbows, knees, hips and shoulders. This finds the skin
// shapes at the edges of each clothed part and fills them with that part's own colour, so the round end
// stays (it is what makes a joint bend without a gap) and only the colour changes.
//   ARGS[0] = traced .ai (groups named part-NN, from ai-trace.jsx)   ARGS[1] = output folder   ARGS[2] = name
(function () {
  var out = new Folder(ARGS[1]);
  app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
  var doc = app.open(new File(ARGS[0]));
  try { app.executeMenuCommand('fitin'); } catch (e) {}
  var page = doc.artboards[0].artboardRect;
  var pageH = page[1] - page[3];
  var fillOf = function (it) {
    try { return it.typename === 'CompoundPathItem' ? it.pathItems[0].fillColor : it.fillColor; } catch (e) { return null; }
  };
  var setFill = function (it, c) {
    if (it.typename === 'CompoundPathItem') { for (var i = 0; i < it.pathItems.length; i++) it.pathItems[i].fillColor = c; } else it.fillColor = c;
  };
  var isSkin = function (c) {
    if (!c || c.typename !== 'RGBColor') return false;
    return c.red > 215 && c.green > 145 && c.green < 210 && c.blue > 105 && c.blue < 180 && c.red - c.blue > 55 && c.red > c.green && c.green > c.blue;
  };
  var isTeal = function (c) { return c && c.typename === 'RGBColor' && c.green > c.red + 30 && c.blue > c.red + 20; };
  var area = function (b) { return (b[2] - b[0]) * (b[1] - b[3]); };
  var log = [];
  var changed = 0;
  var caps = [];
  // the whole figure: its own skin is real skin, and so is everything inside its box (its shoes may
  // have been traced as parts of their own)
  var fig = null;
  for (var f0 = 0; f0 < doc.groupItems.length; f0++) {
    var b0 = doc.groupItems[f0].geometricBounds;
    if (/^part-/.test(doc.groupItems[f0].name) && (!fig || b0[1] - b0[3] > fig[1] - fig[3])) fig = b0;
  }
  var inFigure = function (b) { return fig && b[0] >= fig[0] - 2 && b[2] <= fig[2] + 2 && b[1] <= fig[1] + 2 && b[3] >= fig[3] - 60; };
  for (var g = 0; g < doc.groupItems.length; g++) {
    var grp = doc.groupItems[g];
    if (!/^part-/.test(grp.name)) continue;
    var gb = grp.geometricBounds;
    var gw = gb[2] - gb[0], gh = gb[1] - gb[3];
    if (inFigure(gb)) continue;
    if (page[1] - gb[1] > pageH * 0.88) continue; // the bottom row: mouths, eyes, brows, gesture hands
    var items = grp.pageItems;
    var skinArea = 0, total = 0, biggest = null, biggestArea = 0, torso = false;
    for (var i = 0; i < items.length; i++) {
      var c = fillOf(items[i]);
      var a = area(items[i].geometricBounds);
      total += a;
      if (isSkin(c)) skinArea += a;
      else if (a > biggestArea) { biggestArea = a; biggest = c; }
      if (isTeal(c)) torso = true;
    }
    if (!biggest || skinArea > total * 0.35) continue; // a head, neck or hand: skin is what it is
    var n = 0;
    for (var j = 0; j < items.length; j++) {
      var it = items[j];
      if (!isSkin(fillOf(it))) continue;
      var b = it.geometricBounds;
      var cx = (b[0] + b[2]) / 2;
      var mx = gw * 0.04, my = gh * 0.04;
      var atEdge = b[0] - gb[0] < mx || gb[2] - b[2] < mx || gb[1] - b[1] < my || b[3] - gb[3] < my;
      if (torso) {
        // on the torso the neck opening at the top middle is real skin; the shoulder ovals sit in the
        // top third, away from the middle (the coat is wider below them, so they do not touch the box)
        var cy = (b[1] + b[3]) / 2;
        if (Math.abs(cx - (gb[0] + gb[2]) / 2) < gw * 0.3 || gb[1] - cy > gh * 0.35) continue;
      } else if (!atEdge) continue;
      setFill(it, biggest);
      caps.push('{"part": "' + grp.name + '", "x": ' + ((b[0] + b[2]) / 2 - page[0]).toFixed(1) + ', "y": ' + (page[1] - (b[1] + b[3]) / 2).toFixed(1) + ', "w": ' + (b[2] - b[0]).toFixed(1) + ', "h": ' + (b[1] - b[3]).toFixed(1) + '}');
      n++;
    }
    if (n) { log.push(grp.name + ': ' + n); changed += n; }
  }
  var name = ARGS[2];
  var cf = new File(out.fsName + '/' + name + '-caps.json');
  cf.encoding = 'UTF-8';
  cf.open('w');
  var NL = String.fromCharCode(10);
  cf.write('[' + NL + caps.join(',' + NL) + NL + ']' + NL);
  cf.close();
  doc.saveAs(new File(out.fsName + '/' + name + '.ai'), new IllustratorSaveOptions());
  var svg = new ExportOptionsSVG();
  svg.fontSubsetting = SVGFontSubsetting.None;
  doc.exportFile(new File(out.fsName + '/' + name + '.svg'), ExportType.SVG, svg);
  var png = new ExportOptionsPNG24();
  png.artBoardClipping = true;
  png.transparency = true;
  png.horizontalScale = 60;
  png.verticalScale = 60;
  doc.exportFile(new File(out.fsName + '/' + name + '.png'), ExportType.PNG24, png);
  doc.close(SaveOptions.DONOTSAVECHANGES);
  return changed + ' joint ends recoloured (' + log.join(', ') + ')';
})();
