// Animate (JSFL): draw a rigged character from a job file and export every frame as a transparent PNG.
// The job (an-rig.json beside this file, written by rig-doctor.mjs) holds:
//   {width, height, fps, out, name, fla, pieces: [{name, uri}], frames: [[ [a,b,c,d,tx,ty] | 0, ... ]]}
// pieces are listed back to front; each gets its own layer. frames[f][p] is the matrix of piece p
// on frame f (0 = hidden on that frame). Every frame is a keyframe, so the joints never drift.
var here = fl.scriptURI.substring(0, fl.scriptURI.lastIndexOf('/') + 1);
var log = [];
function finish(ok) { FLfile.write(here + 'an-rig.log', log.join('\n') + '\nRESULT ' + (ok ? 'OK' : 'FAILED') + '\n'); }
function pad(n) { var s = '' + n; while (s.length < 4) s = '0' + s; return s; }
try {
  var job = eval('(' + FLfile.read(here + 'an-rig.json') + ')');
  var doc = fl.createDocument('timeline');
  doc.width = job.width;
  doc.height = job.height;
  doc.frameRate = job.fps;
  var lib = doc.library;
  var tl = doc.getTimeline();
  var n = job.pieces.length;
  var count = job.frames.length;
  var placed = 0;
  for (var i = 0; i < n; i++) {
    var p = job.pieces[i];
    if (i === 0) tl.layers[0].name = p.name; else tl.addNewLayer(p.name, 'normal', true);
    var file = p.uri.substring(p.uri.lastIndexOf('/') + 1);
    if (!lib.itemExists(file)) doc.importFile(p.uri, true);
    if (lib.itemExists(file)) {
      lib.addItemToDocument({x: 0, y: 0}, file);
      placed++;
    }
    doc.selectNone();
  }
  log.push('pieces ' + placed + ' of ' + n);
  if (count > 1) tl.insertFrames(count - 1, true);
  for (var L = 0; L < n; L++) {
    tl.setSelectedLayers(L);
    tl.currentLayer = L;
    if (count > 1) tl.convertToKeyframes(0, count);
  }
  var set = 0;
  for (var f = 0; f < count; f++) {
    var row = job.frames[f];
    for (var q = 0; q < n; q++) {
      var layer = tl.layers[n - 1 - q]; // piece 0 is the bottom layer
      var el = layer.frames[f].elements[0];
      if (!el) continue;
      var m = el.matrix;
      var v = row[q];
      if (v) { m.a = v[0]; m.b = v[1]; m.c = v[2]; m.d = v[3]; m.tx = v[4]; m.ty = v[5]; }
      else { m.a = 1; m.b = 0; m.c = 0; m.d = 1; m.tx = -9000; m.ty = -9000; }
      el.matrix = m;
      set++;
    }
  }
  log.push('matrices ' + set);
  var made = 0;
  for (var g = 0; g < count; g++) {
    tl.currentFrame = g;
    doc.exportPNG(job.out + job.name + pad(g) + '.png', true, true);
    if (FLfile.exists(job.out + job.name + pad(g) + '.png')) made++;
  }
  log.push('frames ' + made + ' of ' + count);
  if (job.fla) { fl.saveDocument(doc, job.fla); log.push('fla ' + FLfile.exists(job.fla)); }
  doc.close(false);
  finish(made === count);
} catch (e) {
  log.push('ERROR ' + e);
  finish(false);
}
fl.quit(false);
