# PERX iOS

Native SwiftUI app that mirrors the PERX website, talking to the same `perx-api` backend (`/server`) and the same MongoDB Atlas database.

## Run it

1. Start the API:
   ```bash
   cd ../server && npm run dev
   ```
2. Open the Xcode project:
   ```bash
   open Perx/Perx.xcodeproj
   ```
3. Pick an iPhone simulator and hit Run.

The simulator can reach `http://localhost:4000` directly. To test on a real device, edit `Perx/Perx/Config.swift` and set `apiBaseURL` to your Mac's LAN IP (e.g. `http://192.168.1.10:4000`).

## Demo accounts

Same as the web:

| role     | email                | password   |
| -------- | -------------------- | ---------- |
| employee | arta.koci@perx.al    | perx123    |
| employee | blend.hoxha@perx.al  | perx123    |
| admin    | admin@perx.al        | admin2026  |

## Screens

- **LoginView** — email/password + one-tap demo accounts.
- **EmployeeTabView** — Home / Benefits / Cart / Profile, mirrors the website's employee shell.
- **AdminTabView** — Overview KPIs and pending-request approvals.
- Shared `SessionStore` is the source of truth; views render off it and call `API.shared` for changes.

## Regenerating the project

The Xcode project is generated from `project.yml` with [XcodeGen](https://github.com/yonaskolb/XcodeGen):
```bash
brew install xcodegen   # one time
cd Perx && xcodegen generate
```
