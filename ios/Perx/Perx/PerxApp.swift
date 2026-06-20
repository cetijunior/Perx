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
        .task { await session.restore() }
    }
}
