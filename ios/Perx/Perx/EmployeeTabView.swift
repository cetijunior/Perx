import SwiftUI
import AVKit

struct EmployeeTabView: View {
    var body: some View {
        TabView {
            EmployeeDashboardView()
                .tabItem { Label("Home", systemImage: "house") }
            BenefitsView()
                .tabItem { Label("Benefits", systemImage: "gift") }
            CartView()
                .tabItem { Label("Cart", systemImage: "bag") }
            ProfileView()
                .tabItem { Label("Profile", systemImage: "person") }
        }
        .tint(PerxTheme.ember)
    }
}

struct EmployeeDashboardView: View {
    @EnvironmentObject var session: SessionStore

    var firstName: String {
        let n = session.user?.name ?? "friend"
        return n.split(separator: " ").first.map(String.init) ?? n
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    Text("Hello, \(firstName) 👋")
                        .font(.system(size: 26, weight: .bold, design: .serif))
                        .foregroundColor(PerxTheme.text)
                    Text("Your benefits, on your terms.")
                        .font(.subheadline)
                        .foregroundColor(PerxTheme.muted)

                    BudgetCard()

                    SectionHeader("Active benefits")
                    let active = (session.employee?.activeBenefits ?? []).compactMap { session.provider(slug: $0) }
                    if active.isEmpty {
                        EmptyCard(icon: "safari", title: "Nothing active yet — explore the marketplace.")
                    } else {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                ForEach(active) { p in
                                    ProviderCardCompact(provider: p)
                                        .frame(width: 220)
                                }
                            }
                        }
                    }

                    SectionHeader("Recommended for you")
                    let recs = recommendations(from: session.providers, active: session.employee?.activeBenefits ?? [])
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        ForEach(recs) { p in
                            ProviderCardCompact(provider: p)
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

    private func recommendations(from all: [Provider], active: [String]) -> [Provider] {
        all.filter { !active.contains($0.slug) }
            .sorted { ($0.rating ?? 0) > ($1.rating ?? 0) }
            .prefix(4)
            .map { $0 }
    }
}

struct BudgetCard: View {
    @EnvironmentObject var session: SessionStore
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("BUDGET · REMAINING")
                .font(.system(size: 11, weight: .semibold)).tracking(1.2)
                .foregroundColor(PerxTheme.faint)
            HStack(alignment: .firstTextBaseline) {
                Text("\(Int(session.budgetRemaining).formatted())")
                    .font(.system(size: 36, weight: .bold, design: .serif))
                    .foregroundColor(PerxTheme.text)
                Text("LEK").font(.caption).foregroundColor(PerxTheme.faint)
                Spacer()
            }
            Text("Spent \(Int(session.budgetSpent).formatted()) · \(Int(session.budgetTotal).formatted()) total")
                .font(.caption).foregroundColor(PerxTheme.muted)
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(PerxTheme.bg).frame(height: 8)
                    Capsule().fill(PerxTheme.emberGradient).frame(width: geo.size.width * session.budgetPct, height: 8)
                }
            }
            .frame(height: 8)
        }
        .perxCard()
    }
}

struct ProviderCardCompact: View {
    let provider: Provider
    @EnvironmentObject var session: SessionStore
    @State private var showVideo = false

    var inCart: Bool { session.employee?.cart.contains(provider.slug) ?? false }
    var isActive: Bool { session.employee?.activeBenefits.contains(provider.slug) ?? false }
    var hasVideo: Bool { !(provider.videoUrl ?? "").isEmpty }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Button { if hasVideo { showVideo = true } } label: {
                BenefitMedia(provider: provider, height: 110)
            }
            .buttonStyle(.plain)

            HStack {
                Text(provider.name)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(PerxTheme.text)
                    .lineLimit(2)
                Spacer()
                if let r = provider.rating {
                    HStack(spacing: 2) {
                        Image(systemName: "star.fill").font(.system(size: 9)).foregroundColor(PerxTheme.gold)
                        Text(String(format: "%.1f", r)).font(.caption2).foregroundColor(PerxTheme.muted)
                    }
                }
            }
            if let blurb = provider.blurb, !blurb.isEmpty {
                Text(blurb).font(.caption).foregroundColor(PerxTheme.muted).lineLimit(2)
            }
            HStack {
                Text("\(Int(provider.cost).formatted()) LEK")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(PerxTheme.ember)
                Spacer()
                Button {
                    Task { isActive ? () : await session.addToCart(provider.slug) }
                } label: {
                    Text(isActive ? "Active" : (inCart ? "In cart" : "Add"))
                        .font(.system(size: 12, weight: .semibold))
                        .padding(.horizontal, 12).padding(.vertical, 7)
                        .background(isActive ? PerxTheme.success.opacity(0.18) : (inCart ? PerxTheme.bgElevated2 : PerxTheme.ember.opacity(0.18)))
                        .foregroundColor(isActive ? PerxTheme.success : PerxTheme.ember)
                        .clipShape(Capsule())
                }
                .disabled(isActive)
            }
        }
        .perxCard()
        .sheet(isPresented: $showVideo) {
            VideoSheet(provider: provider)
        }
    }
}

struct VideoSheet: View {
    let provider: Provider
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            if let s = provider.videoUrl, let url = URL(string: s) {
                VideoPlayer(player: AVPlayer(url: url))
                    .ignoresSafeArea(edges: .horizontal)
            }
            VStack {
                HStack {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark").font(.system(size: 14, weight: .bold))
                            .padding(10).background(.ultraThinMaterial, in: Circle())
                            .foregroundColor(.white)
                    }
                    Spacer()
                    Text(provider.name).foregroundColor(.white).font(.headline)
                    Spacer()
                    Color.clear.frame(width: 36, height: 36)
                }
                .padding(.horizontal, 16).padding(.top, 16)
                Spacer()
            }
        }
    }
}

struct SectionHeader: View {
    let title: String
    init(_ t: String) { self.title = t }
    var body: some View {
        Text(title)
            .font(.system(size: 13, weight: .semibold))
            .foregroundColor(PerxTheme.muted)
            .padding(.top, 4)
    }
}

struct EmptyCard: View {
    let icon: String
    let title: String
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon).font(.system(size: 22)).foregroundColor(PerxTheme.faint)
            Text(title).font(.subheadline).foregroundColor(PerxTheme.muted).multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity).padding(20)
        .background(PerxTheme.bgElevated.opacity(0.4))
        .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(PerxTheme.line, style: StrokeStyle(lineWidth: 1, dash: [4])))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
