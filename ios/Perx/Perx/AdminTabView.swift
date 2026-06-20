import SwiftUI

struct AdminTabView: View {
    var body: some View {
        TabView {
            AdminDashboardView()
                .tabItem { Label("Overview", systemImage: "chart.bar") }
            AdminRequestsView()
                .tabItem { Label("Requests", systemImage: "tray.full") }
            ProfileView()
                .tabItem { Label("Profile", systemImage: "person") }
        }
        .tint(PerxTheme.ember)
    }
}

struct AdminDashboardView: View {
    @EnvironmentObject var session: SessionStore

    var pending: [BenefitRequest] { session.requests.filter { $0.status == "pending" } }
    var approvedTotal: Double { session.requests.filter { $0.status == "approved" }.reduce(0) { $0 + $1.total } }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Team overview")
                        .font(.system(size: 26, weight: .bold, design: .serif))
                        .foregroundColor(PerxTheme.text)

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        kpi("Pending", value: "\(pending.count)", color: PerxTheme.gold, icon: "clock")
                        kpi("Approved", value: "\(Int(approvedTotal).formatted())", color: PerxTheme.success, icon: "checkmark.seal")
                        kpi("Providers", value: "\(session.providers.count)", color: PerxTheme.ember, icon: "tag")
                        kpi("Requests", value: "\(session.requests.count)", color: .blue, icon: "tray")
                    }

                    SectionHeader("Recent requests")
                    if session.requests.isEmpty {
                        EmptyCard(icon: "tray", title: "No requests yet.")
                    } else {
                        ForEach(session.requests.prefix(8).map { $0 }) { r in
                            requestRow(r)
                        }
                    }
                }
                .padding(20)
            }
            .background(PerxTheme.bg.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .refreshable { await session.refreshAll() }
        }
    }

    private func kpi(_ label: String, value: String, color: Color, icon: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon).foregroundColor(color)
                    .padding(8).background(color.opacity(0.18)).clipShape(RoundedRectangle(cornerRadius: 6))
                Spacer()
            }
            Text(value).font(.system(size: 22, weight: .bold)).foregroundColor(PerxTheme.text)
            Text(label.uppercased()).font(.system(size: 10, weight: .semibold)).tracking(1.1).foregroundColor(PerxTheme.faint)
        }
        .perxCard()
    }

    private func requestRow(_ r: BenefitRequest) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(r.items.joined(separator: " + ")).font(.system(size: 13)).foregroundColor(PerxTheme.text).lineLimit(1)
                Spacer()
                Text(r.status.capitalized).font(.caption2).foregroundColor(statusColor(r.status))
            }
            Text("\(Int(r.total).formatted()) LEK").font(.caption).foregroundColor(PerxTheme.ember)
        }
        .padding(12)
        .background(PerxTheme.bgElevated)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(PerxTheme.line, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    private func statusColor(_ s: String) -> Color {
        s == "approved" ? PerxTheme.success : s == "rejected" ? PerxTheme.danger : PerxTheme.gold
    }
}

struct AdminRequestsView: View {
    @EnvironmentObject var session: SessionStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 12) {
                    if session.requests.isEmpty {
                        EmptyCard(icon: "tray", title: "No requests yet.")
                    } else {
                        ForEach(session.requests) { r in
                            VStack(alignment: .leading, spacing: 10) {
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text(r.items.joined(separator: " + ")).font(.system(size: 14, weight: .semibold)).foregroundColor(PerxTheme.text)
                                        Text("\(Int(r.total).formatted()) LEK").font(.caption).foregroundColor(PerxTheme.ember)
                                    }
                                    Spacer()
                                    Text(r.status.capitalized).font(.caption2)
                                        .padding(.horizontal, 8).padding(.vertical, 3)
                                        .background(statusColor(r.status).opacity(0.18))
                                        .foregroundColor(statusColor(r.status))
                                        .clipShape(Capsule())
                                }
                                if r.status == "pending" {
                                    HStack {
                                        Button {
                                            Task { await session.decide(id: r.id, decision: "rejected") }
                                        } label: {
                                            Text("Reject").font(.system(size: 13, weight: .semibold))
                                                .frame(maxWidth: .infinity).padding(.vertical, 8)
                                                .foregroundColor(PerxTheme.danger)
                                                .overlay(RoundedRectangle(cornerRadius: 7).stroke(PerxTheme.danger.opacity(0.5)))
                                        }
                                        Button {
                                            Task { await session.decide(id: r.id, decision: "approved") }
                                        } label: {
                                            Text("Approve").font(.system(size: 13, weight: .semibold))
                                                .frame(maxWidth: .infinity).padding(.vertical, 8)
                                                .background(PerxTheme.emberGradient)
                                                .foregroundColor(.white)
                                                .clipShape(RoundedRectangle(cornerRadius: 7))
                                        }
                                    }
                                }
                            }
                            .perxCard()
                        }
                    }
                }
                .padding(20)
            }
            .background(PerxTheme.bg.ignoresSafeArea())
            .navigationTitle("Requests")
            .refreshable { await session.refreshRequests() }
        }
    }

    private func statusColor(_ s: String) -> Color {
        s == "approved" ? PerxTheme.success : s == "rejected" ? PerxTheme.danger : PerxTheme.gold
    }
}
