// Animate (JSFL): build a rigged character from a job file and export every frame as a transparent PNG.
// The job (an-rig.json beside this file, written by rig-doctor.mjs) holds:
//   {width, height, fps, out, name, fla, sound?, camera?: [[x, y, zoomPercent], ...],
//    pieces: [{name, parent?, cels: [{uri, m: [a,b,c,d,tx,ty]}]}],
//    frames: [[ [a,b,c,d,tx,ty,cel] | 0, ... ]]}
// Each piece becomes a graphic symbol whose origin is its joint; its cels (a hand's shapes, the mouth's
// shapes) are the frames of that symbol and "cel" picks one. Pieces are listed back to front, one layer
// each, and a piece with a parent is parented to that layer (hand to forearm, forearm to upper arm).
// frames[f][p] is the matrix of piece p on frame f (0 = hidden). Every frame is a keyframe.
var here = fl.scriptURI.substring(0, fl.scriptURI.lastIndexOf('/') + 1);
var log = [];
function finish(ok) { FLfile.write(here + 'an-rig.log', log.join('\n') + '\nRESULT ' + (ok ? 'OK' : 'FAILED') + '\n'); }
function pad(n) { var s = '' + n; while (s.length < 4) s = '0' + s; return s; }
function setM(el, v) { var m = el.matrix; m.a = v[0]; m.b = v[1]; m.c = v[2]; m.d = v[3]; m.tx = v[4]; m.ty = v[5]; el.matrix = m; }
try {
  var job = eval('(' + FLfile.read(here + 'an-rig.json') + ')');
  var doc = fl.createDocument('timeline');
  doc.width = job.width;
  doc.height = job.height;
  doc.frameRate = job.fps;
  var lib = doc.library;
  var n = job.pieces.length;
  var count = job.frames.length;
  // 1 the symbols
  var cels = 0;
  for (var i = 0; i < n; i++) {
    var p = job.pieces[i];
    lib.addNewItem('graphic', p.name);
    lib.editItem(p.name);
    var st = doc.getTimeline();
    for (var c = 0; c < p.cels.length; c++) {
      if (c > 0) st.insertBlankKeyframe(c);
      st.currentFrame = c;
      var file = p.cels[c].uri.substring(p.cels[c].uri.lastIndexOf('/') + 1);
      if (!lib.itemExists(file)) doc.importFile(p.cels[c].uri, true);
      if (!lib.itemExists(file)) { log.push('missing ' + file); continue; }
      lib.addItemToDocument({x: 0, y: 0}, file);
      var be = st.layers[0].frames[c].elements[0];
      if (be) { setM(be, p.cels[c].m); cels++; }
      doc.selectNone();
    }
    doc.exitEditMode();
  }
  log.push('symbols ' + n + '  cels ' + cels);
  // 2 one layer per piece, back to front
  var tl = doc.getTimeline();
  for (var j = 0; j < n; j++) {
    if (j === 0) tl.layers[0].name = job.pieces[j].name; else tl.addNewLayer(job.pieces[j].name, 'normal', true);
    lib.addItemToDocument({x: 0, y: 0}, job.pieces[j].name);
    doc.selectNone();
  }
  var layerOf = function (q) { return n - 1 - q; }; // piece 0 is the bottom layer
  var index = {};
  for (var k = 0; k < n; k++) index[job.pieces[k].name] = k;
  // 3 keyframes and matrices
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
      var el = tl.layers[layerOf(q)].frames[f].elements[0];
      if (!el) continue;
      var v = row[q];
      el.symbolType = 'graphic';
      el.loop = 'single frame';
      el.firstFrame = v ? v[6] : 0;
      setM(el, v ? v : [1, 0, 0, 1, -9000, -9000]);
      set++;
    }
  }
  log.push('matrices ' + set);
  // 4 parenting, after the poses are in place (a layer that gets a parent keeps where it is drawn):
  // hand to forearm to upper arm, head to body, on every keyframe
  var parented = 0;
  if (job.parenting !== false) {
    try {
      tl.advancedLayersEnabled = true;
      for (var a = 0; a < n; a++) {
        var par = job.pieces[a].parent;
        if (!par || index[par] === undefined) continue;
        for (var pf = 0; pf < count; pf++) tl.layers[layerOf(a)].setRigParentAtFrame(tl.layers[layerOf(index[par])], pf);
        parented++;
      }
    } catch (e1) { log.push('parenting: ' + e1); }
  }
  log.push('parented ' + parented);
  // 5 the camera
  if (job.camera) {
    try {
      tl.camera.cameraEnabled = true;
      for (var cf = 0; cf < count; cf++) {
        var cam = job.camera[cf];
        tl.camera.setPosition(cf, cam[0], cam[1]);
        tl.camera.setZoom(cf, cam[2]);
      }
      log.push('camera ok');
    } catch (e2) { log.push('camera: ' + e2); }
  }
  // 6 the voice, on its own layer (the exported frames are silent; this is for the .fla)
  if (job.sound) {
    try {
      doc.importFile(job.sound, true);
      var sname = job.sound.substring(job.sound.lastIndexOf('/') + 1);
      tl.addNewLayer('voice', 'normal', true);
      var sf = tl.layers[0].frames[0];
      sf.soundLibraryItem = lib.items[lib.findItemIndex(sname)];
      sf.soundSync = 'stream';
      log.push('sound ok');
    } catch (e3) { log.push('sound: ' + e3); }
  }
  // 7 frames out
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
