import SwiftUI

// MARK: - Admin: employee directory with budget utilization

struct AdminEmployeesView: View {
    @EnvironmentObject var session: SessionStore
    @State private var query: String = ""
    @State private var selected: User?

    var employeeUsers: [User] {
        session.allUsers.filter { $0.role == "employee" }
    }

    var filtered: [User] {
        guard !query.isEmpty else { return employeeUsers }
        return employeeUsers.filter {
            $0.name.localizedCaseInsensitiveContains(query) ||
            ($0.department ?? "").localizedCaseInsensitiveContains(query)
        }
    }

    func profile(for u: User) -> EmployeeProfile? {
        session.allEmployees.first { $0.userId == u.id }
    }

    func spent(_ p: EmployeeProfile?) -> Double {
        (p?.activeBenefits ?? []).compactMap { session.provider(slug: $0)?.cost }.reduce(0, +)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Employees")
                        .font(.system(size: 26, weight: .bold, design: .serif))
                        .foregroundColor(PerxTheme.text)

                    HStack(spacing: 8) {
                        Image(systemName: "magnifyingglass").foregroundColor(PerxTheme.faint)
                        TextField("Search name or department", text: $query)
                            .font(.system(size: 14))
                            .autocorrectionDisabled()
                    }
                    .padding(10)
                    .background(PerxTheme.bgElevated2)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(PerxTheme.line, lineWidth: 1))
                    .clipShape(RoundedRectangle(cornerRadius: 10))

                    if employeeUsers.isEmpty {
                        EmptyCard(icon: "person.2", title: "No employees yet.")
                    } else if filtered.isEmpty {
                        EmptyCard(icon: "magnifyingglass", title: "No matches for \u{201C}\(query)\u{201D}.")
                    } else {
                        ForEach(filtered) { u in
                            Button { selected = u } label: {
                                employeeRow(u)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                .padding(20)
            }
            .background(PerxTheme.bg.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) { PerxLogoTitle() }
            }
            .refreshable { await session.refreshAdminOverview() }
            .sheet(item: $selected) { u in
                EmployeeDetailSheet(user: u, profile: profile(for: u), spent: spent(profile(for: u)))
            }
        }
    }

    private func employeeRow(_ u: User) -> some View {
        let p = profile(for: u)
        let total = u.budget ?? 30000
        let used = spent(p)
        let pct = total > 0 ? min(1, used / total) : 0

        return VStack(alignment: .leading, spacing: 10) {
            HStack {
                PersonAvatar(name: u.name, size: 38)
                VStack(alignment: .leading, spacing: 2) {
                    Text(u.name).font(.system(size: 14, weight: .semibold)).foregroundColor(PerxTheme.text)
                    Text(u.department ?? "\u{2014}").font(.caption2).foregroundColor(PerxTheme.faint)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(p?.activeBenefits.count ?? 0) active")
                        .font(.caption2).foregroundColor(PerxTheme.muted)
                    Text("\(Int(used).formatted())/\(Int(total).formatted()) LEK")
                        .font(.caption2).fontWeight(.semibold).foregroundColor(PerxTheme.ember)
                }
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(PerxTheme.bg).frame(height: 6)
                    Group {
                        if pct > 0.9 {
                            Capsule().fill(PerxTheme.danger)
                        } else {
                            Capsule().fill(PerxTheme.emberGradient)
                        }
                    }
                    .frame(width: geo.size.width * pct, height: 6)
                }
            }
            .frame(height: 6)
        }
        .perxCard()
    }
}

private struct EmployeeDetailSheet: View {
    @EnvironmentObject var session: SessionStore
    let user: User
    let profile: EmployeeProfile?
    let spent: Double
    @Environment(\.dismiss) private var dismiss

    var activeProviders: [Provider] {
        (profile?.activeBenefits ?? []).compactMap { session.provider(slug: $0) }
    }
    var cartProviders: [Provider] {
        (profile?.cart ?? []).compactMap { session.provider(slug: $0) }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(user.name).font(.system(size: 22, weight: .bold, design: .serif)).foregroundColor(PerxTheme.text)
                        Text("\(user.department ?? "") \u{00B7} \(user.email)").font(.caption).foregroundColor(PerxTheme.muted)
                    }

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        statTile("Budget", "\(Int(user.budget ?? 30000).formatted()) LEK", PerxTheme.gold, "creditcard")
                        statTile("Spent", "\(Int(spent).formatted()) LEK", PerxTheme.ember, "flame")
                    }

                    SectionHeader("Active benefits")
                    if activeProviders.isEmpty {
                        EmptyCard(icon: "ticket", title: "No active benefits.")
                    } else {
                        ForEach(activeProviders) { p in
                            HStack {
                                Text(p.name).font(.system(size: 13, weight: .semibold)).foregroundColor(PerxTheme.text)
                                Spacer()
                                Text("\(Int(p.cost).formatted()) LEK").font(.caption).foregroundColor(PerxTheme.ember)
                            }
                            .padding(12)
                            .background(PerxTheme.bgElevated2)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                    }

                    if !cartProviders.isEmpty {
                        SectionHeader("In cart (pending submission)")
                        ForEach(cartProviders) { p in
                            HStack {
                                Text(p.name).font(.system(size: 13)).foregroundColor(PerxTheme.muted)
                                Spacer()
                                Text("\(Int(p.cost).formatted()) LEK").font(.caption).foregroundColor(PerxTheme.faint)
                            }
                            .padding(12)
                            .background(PerxTheme.bgElevated2.opacity(0.6))
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                    }
                }
                .padding(20)
            }
            .background(PerxTheme.bg.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    private func statTile(_ label: String, _ value: String, _ color: Color, _ icon: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: icon).foregroundColor(color)
            Text(value).font(.system(size: 16, weight: .bold)).foregroundColor(PerxTheme.text)
            Text(label.uppercased()).font(.system(size: 10, weight: .semibold)).tracking(1.0).foregroundColor(PerxTheme.faint)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .perxCard()
    }
}
