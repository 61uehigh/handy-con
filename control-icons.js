const svg=body=>`<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">${body}</svg>`;
export const CONTROL_ICONS={
 back:svg('<path fill="currentColor" d="M12,5V1L7,6l5,5V7c3.31,0,6,2.69,6,6s-2.69,6-6,6s-6-2.69-6-6H4c0,4.42,3.58,8,8,8s8-3.58,8-8S16.42,5,12,5z"/><path fill="currentColor" d="M10.69,13.9l0.25-2.17h2.39v0.71h-1.7l-0.11,0.92c0.03-0.02,0.07-0.03,0.11-0.05s0.09-0.04,0.15-0.05 s0.12-0.03,0.18-0.04s0.13-0.02,0.2-0.02c0.21,0,0.39,0.03,0.55,0.1s0.3,0.16,0.41,0.28s0.2,0.27,0.25,0.45s0.09,0.38,0.09,0.6 c0,0.19-0.03,0.37-0.09,0.54s-0.15,0.32-0.27,0.45s-0.27,0.24-0.45,0.31s-0.39,0.12-0.64,0.12c-0.18,0-0.36-0.03-0.53-0.08 s-0.32-0.14-0.46-0.24s-0.24-0.24-0.32-0.39s-0.13-0.33-0.13-0.53h0.84c0.02,0.18,0.08,0.32,0.19,0.41s0.25,0.15,0.42,0.15 c0.11,0,0.2-0.02,0.27-0.06s0.14-0.1,0.18-0.17s0.08-0.15,0.11-0.25s0.03-0.2,0.03-0.31s-0.01-0.21-0.04-0.31 s-0.07-0.17-0.13-0.24s-0.13-0.12-0.21-0.15s-0.19-0.05-0.3-0.05c-0.08,0-0.15,0.01-0.2,0.02s-0.11,0.03-0.15,0.05 s-0.08,0.05-0.12,0.07s-0.07,0.06-0.1,0.09L10.69,13.9z"/>'),
 forward:svg('<path fill="currentColor" d="M18,13c0,3.31-2.69,6-6,6s-6-2.69-6-6s2.69-6,6-6v4l5-5l-5-5v4c-4.42,0-8,3.58-8,8c0,4.42,3.58,8,8,8c4.42,0,8-3.58,8-8 H18z"/><path fill="currentColor" d="M12.03,15.38c-0.44,0-0.58-0.31-0.6-0.56h-0.84c0.03,0.85,0.79,1.25,1.44,1.25c0.93,0,1.44-0.63,1.44-1.43 c0-1.33-0.97-1.44-1.3-1.44c-0.2,0-0.43,0.05-0.64,0.16l0.11-0.92h1.7v-0.71h-2.39l-0.25,2.17l0.67,0.17 c0.13-0.13,0.28-0.23,0.57-0.23c0.4,0,0.69,0.23,0.69,0.75C12.62,14.64,12.65,15.38,12.03,15.38z"/>'),
 play:svg('<path fill="currentColor" d="M7 4.5a1 1 0 0 1 1.5-.86l12 7.5a1 1 0 0 1 0 1.72l-12 7.5A1 1 0 0 1 7 19.5z"/>'),
 pause:svg('<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>'),
 captionsOff:svg('<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 10h3m4 0h3M7 14h6m3 0h1"/></g>'),
 captionsOn:svg('<path fill="currentColor" fill-rule="evenodd" d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 5a1 1 0 0 0 0 2h3a1 1 0 0 0 0-2Zm7 0a1 1 0 0 0 0 2h3a1 1 0 0 0 0-2ZM7 13a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2Zm9 0a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Z"/>'),
 fullscreenEnter:svg('<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10V4h6M4 4l6 6M14 20h6v-6m0 6-6-6"/></g>'),
 fullscreenExit:svg('<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l6 6m-6 0h6V4M20 20l-6-6m0 6v-6h6"/></g>')
};
export function controlPresentation(state){
 return {
  back:{icon:'back',label:'Back 5 seconds',pressed:null},
  forward:{icon:'forward',label:'Forward 5 seconds',pressed:null},
  playPause:{icon:state?.paused===false?'pause':'play',label:state?.paused===false?'Pause':'Play',pressed:null},
  captions:{icon:state?.captions?'captionsOn':'captionsOff',label:state?.captions?'Disable captions':'Enable captions',pressed:!!state?.captions},
  fullscreenToggle:{icon:state?.fullscreen?'fullscreenExit':'fullscreenEnter',label:state?.fullscreen?'Exit fullscreen':'Enter fullscreen',pressed:!!state?.fullscreen}
 };
}
