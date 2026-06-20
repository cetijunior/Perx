import SwiftUI

struct LoginView: View {
    @EnvironmentObject var session: SessionStore
    @State private var email = ""
    @State private var password = ""

    private let demo: [(name: String, email: String, password: String, role: String)] = [
        ("Arta Koçi",     "arta.koci@perx.al",   "perx123",   "employee"),
        ("Blend Hoxha",   "blend.hoxha@perx.al", "perx123",   "employee"),
        ("Endrit Leka",   "admin@perx.al",       "admin2026", "admin"),
    ]

    var body: some View {
        ZStack {
            PerxTheme.bg.ignoresSafeArea()
            RadialGradient(colors: [PerxTheme.ember.opacity(0.25), .clear], center: .top, startRadius: 0, endRadius: 360)
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 24) {
                    HStack {
                        Text("PERX")
                            .font(.system(size: 28, weight: .bold, design: .serif))
                            .foregroundStyle(PerxTheme.emberGradient)
                        Spacer()
                    }
                    .padding(.top, 20)

                    VStack(alignment: .leading, spacing: 16) {
                        Text("Welcome back")
                            .font(.system(size: 28, weight: .bold, design: .serif))
                            .foregroundColor(PerxTheme.text)
                        Text("Sign in to your benefits universe.")
                            .font(.subheadline)
                            .foregroundColor(PerxTheme.muted)

                        VStack(spacing: 10) {
                            field(icon: "envelope", placeholder: "Email", text: $email, keyboard: .emailAddress)
                            field(icon: "lock", placeholder: "Password", text: $password, secure: true)
                        }
                        .padding(.top, 4)

                        if let err = session.error {
                            Text(err).font(.caption).foregroundColor(PerxTheme.danger)
                        }

                        Button {
                            Task { await session.login(email: email, password: password) }
                        } label: {
                            HStack {
                                if session.loading { ProgressView().tint(.white) }
                                Text(session.loading ? "Signing in…" : "Sign in")
                                    .font(.system(size: 16, weight: .semibold))
                                Image(systemName: "arrow.right")
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(PerxTheme.emberGradient)
                            .foregroundColor(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                        .disabled(session.loading)
                    }
                    .perxCard()

                    VStack(alignment: .leading, spacing: 8) {
                        Text("DEMO ACCOUNTS")
                            .font(.system(size: 11, weight: .semibold))
                            .tracking(1.2)
                            .foregroundColor(PerxTheme.faint)
                        ForEach(demo, id: \.email) { d in
                            Button {
                                email = d.email; password = d.password
                                Task { await session.login(email: d.email, password: d.password) }
                            } label: {
                                HStack {
                                    Image(systemName: d.role == "admin" ? "checkmark.shield" : "person")
                                        .frame(width: 32, height: 32)
                                        .background(PerxTheme.bgElevated2)
                                        .foregroundColor(PerxTheme.ember)
                                        .clipShape(RoundedRectangle(cornerRadius: 8))
                                    VStack(alignment: .leading, spacing: 1) {
                                        Text(d.name).foregroundColor(PerxTheme.text).font(.system(size: 14, weight: .medium))
                                        Text(d.email).foregroundColor(PerxTheme.faint).font(.caption)
                                    }
                                    Spacer()
                                    Text(d.role.uppercased())
                                        .font(.system(size: 10, weight: .semibold))
                                        .padding(.horizontal, 8).padding(.vertical, 3)
                                        .background(PerxTheme.bgElevated2)
                                        .foregroundColor(PerxTheme.muted)
                                        .clipShape(Capsule())
                                }
                                .padding(10)
                                .background(PerxTheme.bgElevated.opacity(0.6))
                                .overlay(RoundedRectangle(cornerRadius: 10).stroke(PerxTheme.line, lineWidth: 1))
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                .padding(20)
            }
        }
    }

    @ViewBuilder
    private func field(icon: String, placeholder: String, text: Binding<String>, secure: Bool = false, keyboard: UIKeyboardType = .default) -> some View {
        HStack {
            Image(systemName: icon).foregroundColor(PerxTheme.faint)
            Group {
                if secure {
                    SecureField(placeholder, text: text)
                } else {
                    TextField(placeholder, text: text)
                        .keyboardType(keyboard)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                }
            }
            .foregroundColor(PerxTheme.text)
        }
        .padding(.horizontal, 12)
        .frame(height: 46)
        .background(PerxTheme.bgElevated2)
        .overlay(RoundedRectangle(cornerRadius: 8).stroke(PerxTheme.line, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}
