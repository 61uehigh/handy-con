# HandyCon Privacy Policy

**Last updated: October 22, 2026**

HandyCon provides hand-gesture and manual video controls for YouTube and Netflix. This policy describes how the extension handles information when you use these features.

## Camera and gesture data

When you turn on the camera switch and grant camera access, HandyCon processes camera frames on your device to detect hand landmarks and recognize control gestures. The recognition model and its runtime are bundled with the extension.

Camera frames, hand landmarks, and gesture predictions are used for the live preview and video controls. They are not recorded, saved as files, or uploaded. HandyCon does not perform facial recognition or access your microphone.

Camera tracks are stopped when you turn off the camera or close the remote window.

## Tab and player information

HandyCon reads the active tab’s URL to determine whether it is a supported YouTube or Netflix page. For supported tabs, it uses the tab title and player information, including playback time, play/pause state, caption state, and fullscreen state, to display and operate the remote.

This information is processed locally for these features. HandyCon does not create a browsing-history log or transmit tab or player information to the developer or third parties.

## Extension permissions

- **tabs:** Identifies the active tab, checks its URL, and displays the supported tab’s title in the remote.
- **scripting:** Runs bundled player-control code on supported YouTube and Netflix pages, including Netflix caption controls.
- **debugger:** Briefly checks the supported player’s fullscreen state and sends YouTube’s fullscreen shortcut or a click on Netflix’s fullscreen button. The extension attempts to detach after the operation, including when an error occurs. This permission is not used to monitor network traffic, capture screenshots, read cookies, or inspect unrelated tabs.
- **Site access:** Player-control access is limited to `https://www.youtube.com/*` and `https://www.netflix.com/*`.

## Storage, retention, and sharing

HandyCon does not create persistent camera recordings, gesture histories, or browsing logs. It temporarily retains operational state, such as gesture timing and the selected caption language, in memory during use. This state is not maintained as a persistent user record by the extension.

The extension does not operate a server that receives user data, include advertising or analytics services, or sell or share user data. Camera, gesture, tab, and player information processed by the extension is not transmitted to the developer.

YouTube, Netflix, Chrome, and GitHub operate under their own privacy policies. This policy describes HandyCon’s behavior, not data processing performed independently by those services. Information you voluntarily post in a public GitHub issue is publicly visible and is handled by GitHub.

## Your choices

You can stop camera processing using the camera switch or by closing the remote window. You can also revoke camera access through Chrome’s settings, disable the extension, or uninstall it.

Because HandyCon does not transmit or retain user records on a developer-operated server, the developer has no server-side camera, gesture, or browsing records to provide or delete.

## Limited use

HandyCon’s use of user information complies with the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data), including its Limited Use requirements. Information is used only to provide the video-control features described in this policy, not for advertising, unrelated profiling, creditworthiness, or lending decisions.

## Changes to this policy

This policy will be updated when HandyCon’s data practices change. The date above identifies the latest revision. Changes that require additional disclosure or consent will be communicated through the extension as appropriate before the new processing begins.

## Contact

For privacy questions or support, [open an issue in the HandyCon repository](https://github.com/61uehigh/handy-con/issues).

Please do not include private information in public issues.
