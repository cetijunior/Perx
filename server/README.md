# PERX API

Express + Mongoose backend that connects the web app and the iOS app to a shared MongoDB Atlas database.

## Quick start

```bash
cd server
npm install
cp .env.example .env  # already populated with the project's Atlas URI
npm run seed          # creates demo users + providers
npm run dev           # http://localhost:4000
```

Health check: `GET /health` → `{ ok: true }`

## Demo accounts (post-seed)

| role     | email                | password   |
| -------- | -------------------- | ---------- |
| employee | arta.koci@perx.al    | perx123    |
| employee | blend.hoxha@perx.al  | perx123    |
| admin    | admin@perx.al        | admin2026  |

## Routes

```
POST   /auth/login              { email, password } → { token, user }
POST   /auth/register           { email, password, name, role? }
GET    /auth/me                 (Bearer)

GET    /providers               ?category=food
GET    /providers/:slug

GET    /employees/me            (Bearer)
PATCH  /employees/me            (Bearer) { activeBenefits?, cart?, ... }
POST   /employees/me/cart       (Bearer) { slug }
DELETE /employees/me/cart/:slug (Bearer)

GET    /requests                (Bearer) - admin sees all, employees see own
POST   /requests                (Bearer) { items: [slug] }
POST   /requests/:id/decide     (Bearer admin) { decision: 'approved'|'rejected' }
```

The web app reads `VITE_API_URL` (defaults to `http://localhost:4000`).
The iOS app reads the same base URL from `ios/Perx/Perx/Config.swift`.
