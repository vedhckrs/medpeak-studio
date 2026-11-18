// Animate (JSFL): build a character sheet from the parts cut by ai-extract.jsx.
// Reads an-args.json beside this file: {parts: <folder URI of the PNGs and parts.json>, out: <folder URI>}.
// Every part becomes a library item; the front figure is put together again from its own parts (so
// it can be rigged), the other views, heads, faces, arms, hands and legs are laid out beside it.
var here = fl.scriptURI.substring(0, fl.scriptURI.lastIndexOf('/') + 1);
var log = [];
function finish(ok) { FLfile.write(here + 'an-sheet.log', log.join('\n') + '\nRESULT ' + (ok ? 'OK' : 'FAILED') + '\n'); }
try {
  var args = eval('(' + FLfile.read(here + 'an-args.json') + ')');
  var parts = eval('(' + FLfile.read(args.parts + 'parts.json') + ')');
  var byName = {};
  for (var i = 0; i < parts.length; i++) byName[parts[i].name] = parts[i];
  var doc = fl.createDocument('timeline');
  doc.width = 1920;
  doc.height = 1080;
  doc.frameRate = 30;
  doc.backgroundColor = '#faf6ef';
  var lib = doc.library;
  var tl = doc.getTimeline();
  tl.layers[0].name = 'sheet';
  // import every part into the library (no dialog: PNG, straight to the library)
  var imported = 0;
  for (var p = 0; p < parts.length; p++) {
    doc.importFile(args.parts + parts[p].name + '.png', true);
    if (lib.itemExists(parts[p].name + '.png')) imported++;
  }
  log.push('imported ' + imported + ' of ' + parts.length);
  // place one part: its top-left at (x, y), scaled by k (the PNGs are 4x the source size)
  var place = function (name, x, y, k) {
    var it = byName[name];
    if (!it || !lib.itemExists(name + '.png')) return null;
    var w = it.w * k;
    var h = it.h * k;
    lib.addItemToDocument({x: x + w / 2, y: y + h / 2}, name + '.png');
    var el = doc.selection[0];
    if (el) { el.width = w; el.height = h; el.x = x; el.y = y; }
    doc.selectNone();
    return {w: w, h: h};
  };
  // 1 the front figure, from its own parts, back to front (z 0 is the front-most part)
  var front = [];
  for (var q = 0; q < parts.length; q++) if (parts[q].name.indexOf('front-') === 0) front.push(parts[q]);
  front.sort(function (a, b) { return b.z - a.z; });
  var whole = byName['view-front'];
  var K = 1.9;
  var ox = 120;
  var oy = 250;
  for (var f = 0; f < front.length; f++) place(front[f].name, ox + (front[f].x - whole.x) * K, oy + (front[f].y - whole.y) * K, K);
  log.push('front figure from ' + front.length + ' parts');
  // 2 the other views
  var vx = 470;
  var views = ['view-q', 'view-side', 'view-sideback'];
  for (var v = 0; v < views.length; v++) { var r = place(views[v], vx, 250 + (v === 0 ? 0 : 0), 1.9); if (r) vx += r.w + 60; }
  // 3 heads (three hairstyles, five angles), faces, arms, hands, legs
  var row = function (prefix, x0, y0, k, gap, max) {
    var x = x0;
    var n = 0;
    for (var j = 0; j < parts.length && n < max; j++) {
      if (parts[j].name.indexOf(prefix) !== 0) continue;
      var rr = place(parts[j].name, x, y0, k);
      if (rr) { x += rr.w + gap; n++; }
    }
    return n;
  };
  log.push('heads ' + row('head-', 1290, 60, 0.62, 6, 15));
  log.push('faces ' + row('face-', 1290, 150, 0.62, 6, 15));
  log.push('arms ' + row('arm-', 1290, 250, 1.0, 14, 8));
  log.push('hands ' + row('hand-', 1290, 420, 1.5, 22, 9));
  log.push('legs ' + row('leg-', 1290, 520, 0.95, 10, 7));
  doc.exportPNG(args.out + 'doctor-sheet.png', true, true);
  fl.saveDocument(doc, args.out + 'doctor-sheet.fla');
  log.push('png ' + FLfile.exists(args.out + 'doctor-sheet.png') + '  fla ' + FLfile.exists(args.out + 'doctor-sheet.fla'));
  doc.close(false);
  finish(true);
} catch (e) {
  log.push('ERROR ' + e);
  finish(false);
}
fl.quit(false);
