import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPublicDir('public');
Config.setConcurrency('50%');

// Cloud sessions cannot download Remotion's own browser; point it at the installed full Chromium
// (/opt/pw-browsers/chromium-*/chrome-linux64/chrome: the headless shell does not trust the proxy CA).
// Unset on the Mac and Windows PC, so nothing changes for them.
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
