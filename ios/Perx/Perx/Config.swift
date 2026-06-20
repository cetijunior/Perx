import Foundation

enum Config {
    /// Base URL of the PERX API. Change to your machine's LAN IP (e.g. `http://192.168.1.10:4000`)
    /// to test on a physical device. The simulator can reach `localhost` directly.
    static let apiBaseURL = URL(string: "http://localhost:4000")!
}
