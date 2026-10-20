# HandyCon 1.0.0

Your hand. Your remote.

Control the active YouTube or Netflix video with hand gestures, with on-device camera processing and a compact remote.

| Gesture (hold 0.25 seconds) | Action |
| --- | --- |
| Thumbs up | Play / pause |
| Index | Back 5 seconds |
| V sign | Forward 5 seconds |
| Okay sign | Toggle captions |
| Index + pinky | Toggle player fullscreen |

Make a fist for 0.25 seconds or move your hand out of view for 0.45 seconds to prepare the next command.

## Install

1. Download and unzip **HandyCon-1.0.0.zip**.
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Choose **Load unpacked** and select the extracted folder containing `manifest.json`.
4. Open or reload a YouTube or Netflix video, click the HandyCon extension icon, and turn on the camera.

## Notes

- Camera frames and hand recognition are processed locally.
- The extension uses the debugger permission briefly for the site's player fullscreen control; Chrome may display a debugging notice.
- Netflix captions depend on its private player interface and may vary with player updates.
- Automated checks pass. Live camera and signed-in player integration have not been independently verified for this release.

The ZIP is an unpacked Chrome extension, not a Chrome Web Store installation package.
