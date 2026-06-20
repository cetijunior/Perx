import SwiftUI

struct LoginView: View {
    @EnvironmentObject var session: SessionStore

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
                        Image("Logo")
                            .resizable()
                            .scaledToFit()
                            .frame(height: 24)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 7)
                            .background(PerxTheme.bgElevated2)
                            .overlay(Capsule().stroke(PerxTheme.line, lineWidth: 1))
                            .clipShape(Capsule())
                        Spacer()
                    }
                    .padding(.top, 20)

                    VStack(alignment: .leading, spacing: 16) {
                        Text("Try the demo")
                            .font(.system(size: 28, weight: .bold, design: .serif))
                            .foregroundColor(PerxTheme.text)
                        Text("Pick an account to explore PerX.")
                            .font(.subheadline)
                            .foregroundColor(PerxTheme.muted)

                        if let err = session.error {
                            Text(err).font(.caption).foregroundColor(PerxTheme.danger)
                        }

                        if session.loading {
                            HStack {
                                Spacer()
                                ProgressView().tint(PerxTheme.ember)
                                Spacer()
                            }
                            .padding(.vertical, 8)
                        }

                        VStack(spacing: 8) {
                            ForEach(demo, id: \.email) { d in
                                Button {
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
                                .disabled(session.loading)
                            }
                        }
                    }
                    .perxCard()
                }
                .padding(20)
            }
        }
    }
}
