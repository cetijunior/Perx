import SwiftUI

@main
struct PerxApp: App {
    @StateObject private var session = SessionStore()
    @StateObject private var theme = ThemeManager()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(session)
                .environmentObject(theme)
                .preferredColorScheme(theme.colorScheme)
                .tint(PerxTheme.ember)
        }
    }
}

struct RootView: View {
    @EnvironmentObject var session: SessionStore

    var body: some View {
        Group {
            if session.user == nil {
                LoginView()
            } else if session.user?.role == "admin" {
                AdminTabView()
            } else {
                EmployeeTabView()
            }
        }
        .task {
            await session.restore()
            // Demo/QA convenience: `-autoLogin admin|employee` signs in on launch.
            let args = ProcessInfo.processInfo.arguments
            if session.user == nil, let i = args.firstIndex(of: "-autoLogin"), i + 1 < args.count {
                let creds = args[i + 1] == "admin"
                    ? ("admin@perx.al", "admin2026")
                    : ("arta.koci@perx.al", "perx123")
                await session.login(email: creds.0, password: creds.1)
            }
        }
    }
}
