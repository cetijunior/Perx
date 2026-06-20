import SwiftUI

struct BenefitsView: View {
    @EnvironmentObject var session: SessionStore
    @EnvironmentObject var router: TabRouter
    @State private var category: String = "all"

    private let categories = ["all", "wellness", "food", "sport", "travel", "learning", "health"]

    var filtered: [Provider] {
        category == "all" ? session.providers : session.providers.filter { $0.category == category }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Button { router.selected = .perky } label: {
                        HStack(spacing: 10) {
                            PerkyOrb()
                            VStack(alignment: .leading, spacing: 1) {
                                Text("Not sure what to pick?").font(.system(size: 13, weight: .semibold)).foregroundColor(PerxTheme.text)
                                Text("Ask Perky for a recommendation").font(.caption).foregroundColor(PerxTheme.muted)
                            }
                            Spacer()
                            Image(systemName: "chevron.right").font(.system(size: 12, weight: .semibold)).foregroundColor(PerxTheme.faint)
                        }
                        .padding(12)
                        .background(PerxTheme.bgElevated)
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(PerxTheme.line, lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                    .buttonStyle(.plain)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(categories, id: \.self) { c in
                                Button {
                                    category = c
                                } label: {
                                    Text(c.capitalized)
                                        .font(.system(size: 12, weight: .semibold))
                                        .padding(.horizontal, 12).padding(.vertical, 7)
                                        .background(category == c ? PerxTheme.ember.opacity(0.18) : PerxTheme.bgElevated)
                                        .foregroundColor(category == c ? PerxTheme.ember : PerxTheme.muted)
                                        .overlay(Capsule().stroke(category == c ? PerxTheme.ember : PerxTheme.line, lineWidth: 1))
                                        .clipShape(Capsule())
                                }
                            }
                        }
                    }

                    LazyVGrid(
                        columns: [
                            GridItem(.flexible(), spacing: 12),
                            GridItem(.flexible(), spacing: 12)
                        ],
                        alignment: .leading,
                        spacing: 12
                    ) {
                        ForEach(filtered) { p in
                            ProviderCardCompact(provider: p)
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
            .refreshable { await session.refreshProviders() }
        }
    }
}

struct CartView: View {
    @EnvironmentObject var session: SessionStore
    @State private var showActiveBenefits = false

    var items: [Provider] {
        (session.employee?.cart ?? []).compactMap { session.provider(slug: $0) }
    }
    var total: Double { items.reduce(0) { $0 + $1.cost } }
    var activeBenefits: [Provider] {
        (session.employee?.activeBenefits ?? []).compactMap { session.provider(slug: $0) }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                PerxTheme.bg.ignoresSafeArea()
                if items.isEmpty {
                    VStack(spacing: 14) {
                        Image(systemName: "bag").font(.system(size: 36)).foregroundColor(PerxTheme.faint)
                        Text("Your cart is empty").font(.headline).foregroundColor(PerxTheme.muted)
                    }
                } else {
                    VStack(spacing: 0) {
                        ScrollView {
                            VStack(spacing: 8) {
                                ForEach(items) { p in
                                    HStack {
                                        VStack(alignment: .leading) {
                                            Text(p.name).font(.system(size: 14, weight: .semibold)).foregroundColor(PerxTheme.text)
                                            Text(p.category.capitalized).font(.caption).foregroundColor(PerxTheme.faint)
                                        }
                                        Spacer()
                                        Text("\(Int(p.cost).formatted())").font(.system(size: 14, weight: .bold)).foregroundColor(PerxTheme.ember)
                                        Button {
                                            Task { await session.removeFromCart(p.slug) }
                                        } label: {
                                            Image(systemName: "xmark.circle.fill").foregroundColor(PerxTheme.faint)
                                        }
                                    }
                                    .padding(12)
                                    .background(PerxTheme.bgElevated)
                                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(PerxTheme.line, lineWidth: 1))
                                    .clipShape(RoundedRectangle(cornerRadius: 10))
                                }
                            }
                            .padding(16)
                        }
                        VStack(spacing: 10) {
                            HStack {
                                Text("Total").foregroundColor(PerxTheme.muted)
                                Spacer()
                                Text("\(Int(total).formatted()) LEK")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(PerxTheme.text)
                            }
                            Button {
                                Task { await session.submitCart() }
                            } label: {
                                HStack {
                                    Image(systemName: "paperplane.fill")
                                    Text("Request approval").font(.system(size: 15, weight: .semibold))
                                }
                                .frame(maxWidth: .infinity).padding(.vertical, 14)
                                .background(PerxTheme.emberGradient)
                                .foregroundColor(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                            }
                        }
                        .padding(16)
                        .background(PerxTheme.bgElevated.opacity(0.9))
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    PerxLogoTitle()
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showActiveBenefits = true
                    } label: {
                        Image(systemName: "qrcode")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(PerxTheme.ember)
                    }
                }
            }
            .sheet(isPresented: $showActiveBenefits) {
                ActiveBenefitsSheet(benefits: activeBenefits)
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.visible)
                    .presentationCornerRadius(28)
            }
        }
    }
}

// MARK: - Active benefits modal (redeem from the cart screen)

struct ActiveBenefitsSheet: View {
    let benefits: [Provider]
    @Environment(\.dismiss) private var dismiss
    @State private var selected: MemberBenefit?

    var body: some View {
        NavigationStack {
            ZStack {
                PerxTheme.bg.ignoresSafeArea()
                if benefits.isEmpty {
                    VStack(spacing: 10) {
                        Image(systemName: "gift").font(.system(size: 32)).foregroundColor(PerxTheme.faint)
                        Text("No active benefits yet").font(.subheadline).foregroundColor(PerxTheme.muted)
                    }
                } else {
                    ScrollView {
                        VStack(spacing: 10) {
                            ForEach(benefits) { p in
                                Button {
                                    selected = MemberBenefit(slug: p.slug, name: p.name, category: p.category)
                                } label: {
                                    HStack(spacing: 12) {
                                        ZStack {
                                            RoundedRectangle(cornerRadius: 10)
                                                .fill(PerxTheme.ember.opacity(0.12))
                                                .frame(width: 40, height: 40)
                                            Image(systemName: "qrcode")
                                                .font(.system(size: 16, weight: .semibold))
                                                .foregroundColor(PerxTheme.ember)
                                        }
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(p.name).font(.system(size: 14, weight: .semibold)).foregroundColor(PerxTheme.text)
                                            Text(p.category.capitalized).font(.caption2).foregroundColor(PerxTheme.muted)
                                        }
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                            .font(.system(size: 12, weight: .semibold))
                                            .foregroundColor(PerxTheme.faint)
                                    }
                                    .padding(14)
                                    .background(PerxTheme.bgElevated)
                                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(PerxTheme.line, lineWidth: 1))
                                    .clipShape(RoundedRectangle(cornerRadius: 14))
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(16)
                    }
                }
            }
            .navigationTitle("Active benefits")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(PerxTheme.ember)
                }
            }
            .sheet(item: $selected) { benefit in
                BenefitQRSheet(benefit: benefit)
                    .presentationDetents([.height(440)])
                    .presentationDragIndicator(.visible)
                    .presentationCornerRadius(28)
            }
        }
    }
}

struct ProfileView: View {
    @EnvironmentObject var session: SessionStore
    @EnvironmentObject var theme: ThemeManager
    @EnvironmentObject var router: TabRouter
    @State private var showActiveBenefits = false

    var activeBenefits: [Provider] {
        (session.employee?.activeBenefits ?? []).compactMap { session.provider(slug: $0) }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    HStack(spacing: 10) {
                        Button { showActiveBenefits = true } label: {
                            HStack(spacing: 6) {
                                Image(systemName: "qrcode").font(.system(size: 12, weight: .semibold))
                                Text("My QR codes")
                            }
                            .font(.system(size: 12, weight: .semibold))
                            .frame(maxWidth: .infinity).padding(.vertical, 10)
                            .background(PerxTheme.bgElevated2)
                            .foregroundColor(PerxTheme.ember)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(PerxTheme.line, lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                        Button { router.selected = .perky } label: {
                            HStack(spacing: 6) {
                                Image(systemName: "sparkles").font(.system(size: 12, weight: .semibold))
                                Text("Ask Perky")
                            }
                            .font(.system(size: 12, weight: .semibold))
                            .frame(maxWidth: .infinity).padding(.vertical, 10)
                            .background(PerxTheme.bgElevated2)
                            .foregroundColor(PerxTheme.ember)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(PerxTheme.line, lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                    }
                    .buttonStyle(.plain)

                    VStack(alignment: .leading, spacing: 10) {
                        Text("APPEARANCE")
                            .font(.system(size: 11, weight: .semibold)).tracking(1.2)
                            .foregroundColor(PerxTheme.faint)
                        HStack(spacing: 8) {
                            ForEach(ThemePref.allCases, id: \.self) { p in
                                Button { theme.pref = p } label: {
                                    HStack(spacing: 6) {
                                        Image(systemName: p.icon)
                                        Text(p.label)
                                    }
                                    .font(.system(size: 13, weight: .semibold))
                                    .frame(maxWidth: .infinity).padding(.vertical, 9)
                                    .background(theme.pref == p ? PerxTheme.ember.opacity(0.18) : PerxTheme.bgElevated2)
                                    .foregroundColor(theme.pref == p ? PerxTheme.ember : PerxTheme.muted)
                                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(theme.pref == p ? PerxTheme.ember : PerxTheme.line, lineWidth: 1))
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    .perxCard()

                    HStack(spacing: 14) {
                        Circle()
                            .fill(PerxTheme.emberGradient)
                            .frame(width: 64, height: 64)
                            .overlay(Text(String(session.user?.name.prefix(1) ?? "P")).foregroundColor(.white).font(.system(size: 28, weight: .bold)))
                        VStack(alignment: .leading) {
                            Text(session.user?.name ?? "—").font(.system(size: 18, weight: .bold, design: .serif)).foregroundColor(PerxTheme.text)
                            Text(session.user?.email ?? "").font(.caption).foregroundColor(PerxTheme.muted)
                            Text(session.user?.department ?? "").font(.caption2).foregroundColor(PerxTheme.faint)
                        }
                        Spacer()
                    }
                    .perxCard()

                    VStack(alignment: .leading, spacing: 10) {
                        SectionHeader("My requests")
                        if session.requests.isEmpty {
                            EmptyCard(icon: "tray", title: "No requests yet.")
                        } else {
                            ForEach(session.requests) { r in
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text(r.items.joined(separator: " + ")).font(.system(size: 13)).foregroundColor(PerxTheme.text).lineLimit(1)
                                        Text("\(Int(r.total).formatted()) LEK").font(.caption).foregroundColor(PerxTheme.faint)
                                    }
                                    Spacer()
                                    statusChip(r.status)
                                }
                                .padding(10)
                                .background(PerxTheme.bgElevated)
                                .overlay(RoundedRectangle(cornerRadius: 8).stroke(PerxTheme.line, lineWidth: 1))
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                            }
                        }
                    }

                    Button {
                        session.logout()
                    } label: {
                        Text("Sign out").frame(maxWidth: .infinity).padding(.vertical, 12)
                            .background(PerxTheme.bgElevated)
                            .foregroundColor(PerxTheme.danger)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(PerxTheme.danger.opacity(0.4), lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: 10))
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
            .sheet(isPresented: $showActiveBenefits) {
                ActiveBenefitsSheet(benefits: activeBenefits)
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.visible)
                    .presentationCornerRadius(28)
            }
        }
    }

    private func statusChip(_ s: String) -> some View {
        let color: Color = s == "approved" ? PerxTheme.success : s == "rejected" ? PerxTheme.danger : PerxTheme.gold
        return Text(s.capitalized)
            .font(.system(size: 10, weight: .semibold))
            .padding(.horizontal, 8).padding(.vertical, 3)
            .background(color.opacity(0.18))
            .foregroundColor(color)
            .clipShape(Capsule())
    }
}
