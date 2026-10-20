# HandyCon

Your hand. Your remote.

A compact Chrome extension that controls the active YouTube or Netflix video with hand gestures. Camera frames and hand recognition stay on your device.

## Install

Download **HandyCon-1.0.0.zip** from [Releases](https://github.com/61uehigh/handy-con/releases/latest), unzip it, open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**. Select the extracted folder containing `manifest.json`.

Open or reload a supported video tab, click the HandyCon extension icon, and turn on the camera. Allow camera access when prompted. Keep the remote window open while using gestures.

## Gestures

Hold each gesture for **0.25 seconds**. Either hand works.

| Gesture | Action |
| --- | --- |
| Thumbs up | Play / pause |
| Index | Back 5 seconds |
| V sign | Forward 5 seconds |
| Okay sign | Toggle captions |
| Index + pinky | Toggle player fullscreen |

Make a fist for 0.25 seconds or move your hand out of view for 0.45 seconds before the next command. The info tooltip shows the same guide. All controls also have manual buttons.

## Behavior and permissions

- Commands target the active tab in the most recently focused normal Chrome window. Unsupported tabs produce an error rather than silently controlling another tab.
- Camera processing uses the bundled MediaPipe model and WebAssembly runtime. Turning the camera off or closing the remote stops the camera tracks.
- `tabs` identifies the target tab; `scripting` supports player controls; `debugger` briefly delivers YouTube's F shortcut or a Netflix player fullscreen button click, then disconnects. Chrome may show a debugging notice.
- Host access is limited to `www.youtube.com` and `www.netflix.com`.
- Netflix captions use its private player interface and may need updates when Netflix changes its player.
- The active gesture icon is highlighted in sapphire blue. Playback, captions, and fullscreen icons synchronize with the player.

## Development

Load this repository as an unpacked extension. Reload the extension and video page after changing player code, and reopen the remote after changing its UI.

```sh
npm test
python3 scripts/package-release.py
```

The release script creates a runtime-only ZIP and SHA-256 checksum in `dist/`. Experimental artwork, tests, and development files are excluded from the installation package.

Automated tests cover gesture classification, gesture timing, player controls, and debugger dispatch. Live camera and signed-in player integration have not been independently verified for 1.0.0.

The bundled MediaPipe license is in `vendor/LICENSE`.
