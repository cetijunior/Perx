import SwiftUI

struct AdminTabView: View {
    @State private var selection = AdminTabView.initialTab

    // Optional launch override, e.g. `-startTab deals`, handy for jumping straight to a screen.
    static var initialTab: Int {
        let args = ProcessInfo.processInfo.arguments
        guard let i = args.firstIndex(of: "-startTab"), i + 1 < args.count else { return 0 }
        switch args[i + 1] {
        case "employees": return 1
        case "deals":     return 2
        case "requests":  return 3
        case "profile":   return 4
        default:          return 0
        }
    }

    var body: some View {
        TabView(selection: $selection) {
            AdminDashboardView()
                .tabItem { Label("Overview", systemImage: "chart.bar") }.tag(0)
            AdminEmployeesView()
                .tabItem { Label("Employees", systemImage: "person.2") }.tag(1)
            DealsEngineView()
                .tabItem { Label("Deals", systemImage: "dot.radiowaves.left.and.right") }.tag(2)
            AdminRequestsView()
                .tabItem { Label("Requests", systemImage: "tray.full") }.tag(3)
            ProfileView()
                .tabItem { Label("Profile", systemImage: "person") }.tag(4)
        }
        .tint(PerxTheme.ember)
    }
}

struct AdminDashboardView: View {
    @EnvironmentObject var session: SessionStore
    @State private var showScanner = false

    var pending: [BenefitRequest] { session.requests.filter { $0.status == "pending" } }
    var approvedTotal: Double {
        let approved: [BenefitRequest] = session.requests.filter { $0.status == "approved" }
        let totals: [Double] = approved.map { $0.total }
        return totals.reduce(0, +)
    }
    var employeeCount: Int { session.allUsers.filter { $0.role == "employee" }.count }
    var totalBudgetSpent: Double {
        var sum: Double = 0
        for emp in session.allEmployees {
            for slug in emp.activeBenefits {
                if let cost = session.provider(slug: slug)?.cost { sum += cost }
            }
        }
        return sum
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Team overview")
                        .font(.system(size: 26, weight: .bold, design: .serif))
                        .foregroundColor(PerxTheme.text)

                    Button { showScanner = true } label: {
                        HStack(spacing: 10) {
                            Image(systemName: "qrcode.viewfinder").font(.system(size: 18, weight: .semibold))
                            VStack(alignment: .leading, spacing: 1) {
                                Text("Scan & redeem").font(.system(size: 14, weight: .semibold))
                                Text("Validate a member's benefit QR").font(.caption2).opacity(0.85)
                            }
                            Spacer()
                            Image(systemName: "chevron.right").font(.caption)
                        }
                        .padding(14)
                        .background(PerxTheme.emberGradient)
                        .foregroundColor(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        kpi("Pending", value: "\(pending.count)", color: PerxTheme.gold, icon: "clock")
                        kpi("Employees", value: "\(employeeCount)", color: .blue, icon: "person.2")
                        kpi("Providers", value: "\(session.providers.count)", color: PerxTheme.ember, icon: "tag")
                        kpi("Budget used", value: "\(Int(totalBudgetSpent).formatted())", color: PerxTheme.success, icon: "creditcard")
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
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    PerxLogoTitle()
                }
            }
            .refreshable { await session.refreshAll() }
            .sheet(isPresented: $showScanner) { ValidateCardView() }
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
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .top) {
                HStack(spacing: 8) {
                    if let emp = session.employee(for: r) {
                        PersonAvatar(name: emp.name, size: 26)
                        VStack(alignment: .leading, spacing: 1) {
                            Text(emp.name).font(.system(size: 13, weight: .semibold)).foregroundColor(PerxTheme.text).lineLimit(1)
                            Text(session.benefitNames(r.items)).font(.system(size: 11)).foregroundColor(PerxTheme.muted).lineLimit(1)
                        }
                    } else {
                        Text(session.benefitNames(r.items)).font(.system(size: 13, weight: .medium)).foregroundColor(PerxTheme.text).lineLimit(1)
                    }
                }
                Spacer(minLength: 8)
                RequestStatusChip(status: r.status, compact: true)
            }
            Text("\(Int(r.total).formatted()) LEK").font(.caption).foregroundColor(PerxTheme.ember)
        }
        .padding(12)
        .background(PerxTheme.bgElevated)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(PerxTheme.line, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
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
                                HStack(alignment: .center) {
                                    if let emp = session.employee(for: r) {
                                        PersonAvatar(name: emp.name, size: 34)
                                        VStack(alignment: .leading, spacing: 1) {
                                            Text(emp.name).font(.system(size: 14, weight: .semibold)).foregroundColor(PerxTheme.text)
                                            Text(emp.department ?? "Employee").font(.caption2).foregroundColor(PerxTheme.faint)
                                        }
                                    } else {
                                        Text("Employee request").font(.system(size: 14, weight: .semibold)).foregroundColor(PerxTheme.text)
                                    }
                                    Spacer(minLength: 8)
                                    RequestStatusChip(status: r.status)
                                }

                                HStack(alignment: .top) {
                                    Image(systemName: "tag").font(.system(size: 11)).foregroundColor(PerxTheme.faint).padding(.top, 2)
                                    Text(session.benefitNames(r.items)).font(.system(size: 13)).foregroundColor(PerxTheme.muted).lineLimit(3)
                                    Spacer(minLength: 8)
                                    Text("\(Int(r.total).formatted()) LEK").font(.system(size: 13, weight: .semibold)).foregroundColor(PerxTheme.ember)
                                }
                                if r.status == "pending" {
                                    HStack(spacing: 10) {
                                        Button {
                                            Task { await session.decide(id: r.id, decision: "rejected") }
                                        } label: {
                                            Label("Decline", systemImage: "xmark")
                                                .font(.system(size: 13, weight: .semibold))
                                                .frame(maxWidth: .infinity).padding(.vertical, 9)
                                                .foregroundColor(PerxTheme.danger)
                                                .overlay(RoundedRectangle(cornerRadius: 9).stroke(PerxTheme.danger.opacity(0.5)))
                                        }
                                        Button {
                                            Task { await session.decide(id: r.id, decision: "approved") }
                                        } label: {
                                            Label("Approve", systemImage: "checkmark")
                                                .font(.system(size: 13, weight: .semibold))
                                                .frame(maxWidth: .infinity).padding(.vertical, 9)
                                                .background(PerxTheme.emberGradient)
                                                .foregroundColor(.white)
                                                .clipShape(RoundedRectangle(cornerRadius: 9))
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
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    PerxLogoTitle()
                }
            }
            .refreshable { await session.refreshRequests() }
        }
    }
}
