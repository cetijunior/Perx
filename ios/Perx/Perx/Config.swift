import Foundation

enum Config {
    /// Base URL of the PERX API.
    ///
    /// Production: the deployed Vercel backend. The Vercel rewrites serve the API
    /// routes (`/auth`, `/users`, `/providers`, `/employees`, `/requests`, `/admin`,
    /// `/health`) same-origin, so this domain is all the app needs.
    ///
    /// Local dev: point at your running server instead, e.g.
    /// `http://localhost:4000` (simulator) or `http://192.168.1.10:4000` (device).
    static let apiBaseURL = URL(string: "https://perx-roan.vercel.app")!
}
