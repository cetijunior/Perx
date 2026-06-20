# PERX Digital Membership Card + QR Redemption — Web Implementation Plan

## What this is

Every employee gets a digital membership card (à la "Nje") inside the web app: their
name, department, a card ID, and a QR code. Admins/businesses scan that QR with a
"Validate" screen to confirm the employee's identity and which benefits they currently
have active, then log a redemption (e.g. "Sara used her Aqua Spa Tirana discount").

The backend API for this already exists (implemented in `server/`, see "API reference"
below) — this plan covers the **web frontend only**. The iOS app's card/scanner is being
implemented separately.

## API reference (already implemented, do not modify unless a bug is found)

Base URL: same as existing API client (`VITE_API_URL` / whatever `src/lib/api.js` uses).
All routes require `Authorization: Bearer <jwt>` like the rest of the app.

### `GET /employees/me/card` (employee or admin, any authenticated user)
Returns the current user's card + a freshly-signed QR token, valid ~90 seconds:
```json
{
  "card": {
    "cardId": "A1B2C3D4",
    "name": "Sara Hoxha",
    "company": "PERX",
    "department": "Engineering",
    "activeBenefits": ["aqua-spa-tirana", "burger-lab"],
    "qrToken": "<jwt, ~90s expiry>",
    "expiresInSeconds": 90
  }
}
```
The token is single-use server-side (once redeemed via `/admin/card/redeem`, that exact
token can never be redeemed again — `409 token_already_used`). It also just expires
naturally after ~90s. **The frontend must re-fetch this endpoint periodically (e.g. every
60–75s) while the card screen is open**, and regenerate the QR image each time.

### `POST /admin/card/lookup` (admin only) — body: `{ "token": "<scanned qr token>" }`
Decodes a scanned token without consuming it. Use this right after a scan to show the
admin who they're looking at and let them pick which benefit to redeem.
```json
{
  "employee": { "name": "Sara Hoxha", "department": "Engineering", "employeeId": "A1B2C3D4" },
  "benefits": [{ "slug": "aqua-spa-tirana", "name": "Aqua Spa Tirana", "category": "wellness" }]
}
```
Errors: `400 invalid_or_expired_token`, `404 employee_not_found`, `409 token_already_used`.

### `POST /admin/card/redeem` (admin only) — body: `{ "token": "...", "providerSlug": "..." }`
Consumes the token, logs a `Redemption` record. Errors: `400`, `403 benefit_not_active_for_employee`,
`404`, `409 token_already_used` (scan again — it produces a new token).

## Frontend work

### 1. Dependencies
- `qrcode` (npm) — generate QR PNG/SVG from the `qrToken` string. Lightweight, no camera
  permissions needed for this half.
- `html5-qrcode` (npm) — for the admin scanner (wraps `getUserMedia` + jsQR/zxing under
  the hood, works in any browser, no native app needed).

### 2. Employee: "My Card" view
- New route, e.g. `src/pages/employee/Card.jsx`, linked from the employee nav/profile.
- Renders a polished card UI (use existing `bg-elevated`/`border-line`/gold-gradient
  classes already in the design system — see `BudgetCard` in `BudgetGames.jsx` or
  `ScratchCard.jsx` for the visual language to match).
  - Card face: PERX logo, employee name, department, masked card ID (e.g. `•••• C3D4`).
  - QR code rendered from `card.qrToken` via the `qrcode` lib (`QRCode.toDataURL` or
    `<canvas>` via `QRCode.toCanvas`).
  - Small countdown/progress ring showing seconds until the QR refreshes (cosmetic, ties
    to the refetch interval below).
- Data fetching: call `GET /employees/me/card` on mount, then `setInterval` every ~60s
  to refetch and redraw the QR (token rotates each fetch). Clear the interval on unmount.
- Handle errors (network failure) by showing a "Tap to refresh" fallback state instead of
  a stale/dead QR code.

### 3. Admin: "Validate" / scanner view
- New route, e.g. `src/pages/admin/Validate.jsx`, in the admin nav.
- Flow:
  1. Big "Start Scan" button → opens an `html5-qrcode` scanner (camera permission
     prompt). On successful decode, stop the camera immediately (don't keep scanning
     while showing results).
  2. Call `POST /admin/card/lookup` with the decoded string as `token`.
     - On `409`/`400` show a clear inline error ("This code already used" / "Expired —
       ask them to reopen their card") with a "Scan again" button.
     - On success, show the employee's name/department and a list of their
       `benefits` as selectable cards/radio buttons.
  3. Admin selects the benefit being redeemed (e.g. the discount the customer is
     claiming right now) and taps "Confirm redemption".
  4. Call `POST /admin/card/redeem` with the same `token` + chosen `providerSlug`.
     - Success → show a green confirmation ("✓ Aqua Spa Tirana redeemed for Sara
       Hoxha") and reset back to the "Start Scan" state after a couple seconds.
     - `409 token_already_used` → the QR rotated/expired between lookup and confirm
       (rare race, e.g. admin took too long); show "Code expired, scan again."
- If the employee has zero active benefits, show that plainly ("No active benefits to
  redeem") instead of an empty/broken list.

### 4. Nice-to-haves (skip if time-constrained)
- Manual code entry fallback for when the camera isn't available (paste the raw token
  string into a text field — useful for desktop admin testing).
- A small "recent redemptions" list on the admin validate page (would need a new
  `GET /admin/redemptions` endpoint — not built yet, flag to backend if wanted).

## Out of scope for this plan
- iOS app card/scanner — implemented natively (SwiftUI + CoreImage QR generation +
  AVFoundation/VisionKit scanning), being done separately.
- Any backend route changes — the three endpoints above are final; if something seems
  missing (e.g. redemption history), note it rather than improvising new routes.
