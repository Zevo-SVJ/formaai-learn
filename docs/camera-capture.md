# Camera capture: known limitation

## The report

On some Android/Chrome devices, choosing **Take a photo** opens the camera but the
preview is black. On other browsers and devices the same action works.

## What the app does

Nothing browser-specific. The camera is opened by a plain file input:

```html
<input type="file" accept="image/*" capture="environment" />
```

Tapping the option calls `.click()` on that input. The operating system or the
browser then supplies the photo. The app has no further part in it until a file
comes back through `onChange`.

## What was ruled out, with evidence

| Candidate | Finding |
|---|---|
| App holding the camera open | No `getUserMedia`, `mediaDevices` or `MediaStream` anywhere in `src/` — the app never acquires the camera. |
| Wrong or mangled attribute | Live DOM inspection confirms `capture="environment"` and `accept="image/*"` render correctly. React does not alter them. |
| Permissions-Policy blocking camera | No `Permissions-Policy` or `Feature-Policy` in the repo or in the generated `_headers`. |
| Browser-conditional code | No `userAgent`, platform or vendor branching anywhere in `src/`. Every browser receives byte-identical markup. |
| Page CSS hiding the preview | The Android camera preview is drawn by a separate activity; page CSS cannot affect it. |

Because the markup is identical across browsers and the app never touches the
camera, a result that differs by browser cannot originate in application code.
The differing variable is the browser or the device.

## Hardening applied anyway

Two app-side factors were removed so they are excluded rather than merely
suspected. Neither is confirmed to be the cause.

1. The action sheet is now dismissed as soon as the picker is opened. Its scrim
   and panel both use `backdrop-filter`, which forces a compositing surface the
   camera UI would otherwise have to draw over. The `.click()` still happens
   inside the user gesture, so iOS is unaffected.
2. The capture inputs use `sr-only` instead of `display: none`. Chrome builds
   that use an in-page capture surface rather than the system camera activity
   need a layout box to draw into. Gallery and PDF inputs are untouched.

## Diagnosing it on an affected device

`/camera-test` runs the candidate configurations side by side and measures what
comes back, so a black frame is identified objectively rather than from what the
preview looked like.

Open it on the affected phone and tap each button. Each result reports the file,
its dimensions and the mean luminance of the returned frame (`0` is pure black;
below `3` is reported as `BLACK IMAGE`). The page also prints `isSecureContext`,
the origin and the user agent, since camera access is gated on secure origins.

How to read the outcome:

- **All five black** — the device or the browser, not the app.
- **Variant 5 (no `capture`) works, the rest black** — the camera intent
  specifically; the fallback is to drop `capture` and let the user pick.
- **Variant 3 (`capture` with no value) or 4 (`capture="user"`) works** — the
  `environment` hint is being mishandled; the fix is to drop the value.
- **`secureContext: false`** — the page is on an insecure origin and the browser
  is gating the camera.

Delete this route once the cause is known.

## Workaround for affected users

Gallery upload and PDF upload are unaffected. A user whose camera preview is
black can take the photo with their normal camera app and pick it through
**Choose an image**.
