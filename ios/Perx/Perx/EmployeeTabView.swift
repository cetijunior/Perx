import SwiftUI
import AVKit

// MARK: - Tab routing (lets any screen jump the user to another tab)

enum AppTab: Hashable { case home, benefits, perky, games, profile }

final class TabRouter: ObservableObject {
    @Published var selected: AppTab = .home
}

struct EmployeeTabView: View {
    @StateObject private var router = TabRouter()

    var body: some View {
        TabView(selection: $router.selected) {
            EmployeeDashboardView()
                .tabItem { Label("Home", systemImage: "house") }
                .tag(AppTab.home)
            BenefitsView()
                .tabItem { Label("Benefits", systemImage: "gift") }
                .tag(AppTab.benefits)
            PerkyView()
                .tabItem { Label("Perky", systemImage: "sparkles") }
                .tag(AppTab.perky)
            GamesView()
                .tabItem { Label("Games", systemImage: "gamecontroller") }
                .tag(AppTab.games)
            ProfileView()
                .tabItem { Label("Profile", systemImage: "person") }
                .tag(AppTab.profile)
        }
        .tint(PerxTheme.ember)
        .environmentObject(router)
    }
}

// MARK: - Dashboard

struct EmployeeDashboardView: View {
    @EnvironmentObject var session: SessionStore
    @EnvironmentObject var router: TabRouter
    @State private var showCart = false

    var firstName: String {
        let n = session.user?.name ?? "friend"
        return n.split(separator: " ").first.map(String.init) ?? n
    }

    var cartCount: Int { session.employee?.cart.count ?? 0 }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Greeting
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Hello, \(firstName) 👋")
                            .font(.system(size: 28, weight: .bold, design: .serif))
                            .foregroundColor(PerxTheme.text)
                        Text("Your benefits, on your terms.")
                            .font(.subheadline)
                            .foregroundColor(PerxTheme.muted)
                    }

                    BudgetCard()

                    PromoRow(router: router)

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
                    LazyVGrid(
                        columns: [
                            GridItem(.flexible(), spacing: 12),
                            GridItem(.flexible(), spacing: 12)
                        ],
                        alignment: .leading,
                        spacing: 12
                    ) {
                        ForEach(recs) { p in
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
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button { showCart = true } label: {
                        ZStack(alignment: .topTrailing) {
                            Image(systemName: "bag")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(PerxTheme.ember)
                            if cartCount > 0 {
                                Text("\(cartCount)")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundColor(.white)
                                    .frame(minWidth: 14, minHeight: 14)
                                    .background(PerxTheme.ember)
                                    .clipShape(Circle())
                                    .offset(x: 8, y: -8)
                            }
                        }
                    }
                }
            }
            .sheet(isPresented: $showCart) { CartView() }
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

// MARK: - Promo / cross-screen engagement cards

struct PromoRow: View {
    @ObservedObject var router: TabRouter

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                PromoCard(
                    icon: "sparkles",
                    title: "Meet Perky",
                    subtitle: "Your AI benefits concierge",
                    gradient: PerxTheme.emberGradient
                ) { router.selected = .perky }

                PromoCard(
                    icon: "gamecontroller.fill",
                    title: "Daily Minigames",
                    subtitle: "Play for bonus LEK",
                    gradient: LinearGradient(colors: [PerxTheme.gold, PerxTheme.ember], startPoint: .topLeading, endPoint: .bottomTrailing)
                ) { router.selected = .games }

                PromoCard(
                    icon: "gift.fill",
                    title: "Explore Benefits",
                    subtitle: "Find something new",
                    gradient: LinearGradient(colors: [PerxTheme.ember2, PerxTheme.ember], startPoint: .topLeading, endPoint: .bottomTrailing)
                ) { router.selected = .benefits }
            }
        }
    }
}

struct PromoCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let gradient: LinearGradient
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
                Spacer(minLength: 0)
                Text(title)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)
                Text(subtitle)
                    .font(.system(size: 11))
                    .foregroundColor(.white.opacity(0.85))
                    .lineLimit(1)
            }
            .padding(14)
            .frame(width: 160, height: 96, alignment: .topLeading)
            .background(gradient)
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Budget card

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
                    Capsule()
                        .fill(PerxTheme.emberGradient)
                        .frame(width: geo.size.width * session.budgetPct, height: 8)
                        .animation(.easeOut(duration: 0.9), value: session.budgetPct)
                }
            }
            .frame(height: 8)
        }
        .perxCard()
    }
}

// MARK: - Games

struct GamesView: View {
    @EnvironmentObject var session: SessionStore
    @State private var activeGame: GameTab = .scratch
    @State private var scratchPlayed = false
    @State private var spinPlayed = false
    @State private var guessPlayed = false
    @State private var memoryPlayed = false
    @State private var resultMessage: String? = nil
    @State private var showResult = false
    @AppStorage("perx.games.streak") private var streak: Int = 1

    enum GameTab { case scratch, spin, guess, memory }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {

                    // Daily minigames header
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Daily Minigames")
                            .font(.system(size: 26, weight: .bold, design: .serif))
                            .foregroundColor(PerxTheme.text)
                        Text("Play every day to earn bonus LEK.")
                            .font(.subheadline)
                            .foregroundColor(PerxTheme.muted)
                    }

                    // Result banner
                    if showResult, let msg = resultMessage {
                        HStack(spacing: 10) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(PerxTheme.success)
                            Text(msg)
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(PerxTheme.text)
                        }
                        .padding(14)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(PerxTheme.success.opacity(0.12))
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(PerxTheme.success.opacity(0.3), lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }

                    // Tab selector
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            gameTabButton(label: "🎴 Scratch", tab: .scratch)
                            gameTabButton(label: "🎡 Spin", tab: .spin)
                            gameTabButton(label: "🔢 Guess", tab: .guess)
                            gameTabButton(label: "🧠 Memory", tab: .memory)
                        }
                    }

                    // Game area
                    switch activeGame {
                    case .scratch:
                        ScratchCardGameView(played: $scratchPlayed, onWin: { _, label in
                            resultMessage = label
                            withAnimation { showResult = true }
                        })
                    case .spin:
                        SpinWheelGameView(played: $spinPlayed, onWin: { _, label in
                            resultMessage = label
                            withAnimation { showResult = true }
                        })
                    case .guess:
                        NumberGuessGameView(played: $guessPlayed, onWin: { _, label in
                            resultMessage = label
                            withAnimation { showResult = true }
                        })
                    case .memory:
                        MemoryMatchGameView(played: $memoryPlayed, onWin: { _, label in
                            resultMessage = label
                            withAnimation { showResult = true }
                        })
                    }

                    // Stats row
                    HStack(spacing: 12) {
                        miniStat(icon: "flame.fill", color: PerxTheme.gold, label: "Streak", value: "\(streak) days")
                        miniStat(icon: "trophy.fill", color: PerxTheme.ember, label: "Budget", value: "\(Int(session.budgetRemaining).formatted()) LEK")
                    }

                    Spacer(minLength: 20)
                }
                .padding(20)
            }
            .background(PerxTheme.bg.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    PerxLogoTitle()
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        scratchPlayed = false
                        spinPlayed = false
                        guessPlayed = false
                        memoryPlayed = false
                        showResult = false
                        resultMessage = nil
                    } label: {
                        Image(systemName: "arrow.clockwise")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(PerxTheme.ember)
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func gameTabButton(label: String, tab: GameTab) -> some View {
        Button { withAnimation(.easeInOut(duration: 0.2)) { activeGame = tab } } label: {
            Text(label)
                .font(.system(size: 13, weight: .semibold))
                .padding(.horizontal, 14).padding(.vertical, 9)
                .background(activeGame == tab ? PerxTheme.bgElevated : PerxTheme.bgElevated2)
                .foregroundColor(activeGame == tab ? PerxTheme.ember : PerxTheme.muted)
                .overlay(Capsule().stroke(activeGame == tab ? PerxTheme.ember : PerxTheme.line, lineWidth: 1))
                .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }

    private func miniStat(icon: String, color: Color, label: String, value: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .foregroundColor(color)
                .padding(8)
                .background(color.opacity(0.15))
                .clipShape(RoundedRectangle(cornerRadius: 8))
            VStack(alignment: .leading, spacing: 1) {
                Text(label.uppercased())
                    .font(.system(size: 9, weight: .semibold)).tracking(1.0)
                    .foregroundColor(PerxTheme.faint)
                Text(value)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(PerxTheme.text)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .perxCard()
    }
}

// MARK: - Scratch Card Game (SwiftUI)

struct ScratchCardGameView: View {
    @Binding var played: Bool
    let onWin: (Int, String) -> Void

    @State private var scratchedPoints: [CGPoint] = []
    @State private var revealPct: CGFloat = 0
    @State private var revealed = false

    private let prize = 300  // deterministic for demo

    var body: some View {
        VStack(spacing: 16) {
            if played {
                alreadyPlayedView
            } else {
                ZStack {
                    // Prize behind
                    VStack(spacing: 8) {
                        Text("🎁")
                            .font(.system(size: 48))
                        Text("+\(prize) LEK")
                            .font(.system(size: 28, weight: .bold, design: .serif))
                            .foregroundStyle(PerxTheme.emberGradient)
                        Text("Daily bonus!")
                            .font(.caption)
                            .foregroundColor(PerxTheme.muted)
                    }
                    .frame(maxWidth: .infinity, minHeight: 180)

                    // Scratch overlay using Canvas
                    if !revealed {
                        Canvas { ctx, size in
                            // Background
                            let grad = Gradient(colors: [
                                Color(red: 0.36, green: 0.13, blue: 0.74),
                                Color(red: 0.49, green: 0.23, blue: 0.93),
                                Color(red: 0.65, green: 0.55, blue: 0.98)
                            ])
                            ctx.fill(Path(CGRect(origin: .zero, size: size)), with: .linearGradient(
                                grad, startPoint: .zero, endPoint: CGPoint(x: size.width, y: size.height)
                            ))
                            // Label
                            ctx.draw(Text("Scratch to reveal").foregroundColor(.white.opacity(0.7)).font(.system(size: 14, weight: .semibold)), at: CGPoint(x: size.width / 2, y: size.height / 2))
                            // Erase scratched circles
                            ctx.blendMode = .destinationOut
                            for pt in scratchedPoints {
                                ctx.fill(Path(ellipseIn: CGRect(x: pt.x - 22, y: pt.y - 22, width: 44, height: 44)), with: .color(.black))
                            }
                        }
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .gesture(DragGesture(minimumDistance: 0)
                            .onChanged { val in
                                scratchedPoints.append(val.location)
                                let coverPct = min(1.0, CGFloat(scratchedPoints.count) / 60.0)
                                revealPct = coverPct
                                if coverPct >= 1.0 && !revealed {
                                    revealed = true
                                    played = true
                                    onWin(prize, "+\(prize) LEK earned! 🎉")
                                }
                            }
                        )
                        .onChange(of: played) { newValue in
                            if !newValue { scratchedPoints = []; revealed = false; revealPct = 0 }
                        }
                    }
                }
                .frame(maxWidth: .infinity, minHeight: 180)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(PerxTheme.line, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 16))

                if revealPct > 0 && !revealed {
                    ProgressView(value: revealPct)
                        .tint(PerxTheme.ember)
                        .frame(height: 4)
                }
                Text("Drag your finger across the card to scratch!")
                    .font(.caption)
                    .foregroundColor(PerxTheme.faint)
                    .multilineTextAlignment(.center)
            }
        }
        .perxCard()
    }

    private var alreadyPlayedView: some View {
        VStack(spacing: 12) {
            Text("🎴").font(.system(size: 40))
            Text("Already scratched today!")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(PerxTheme.text)
            Text("Come back tomorrow for a new card.")
                .font(.caption)
                .foregroundColor(PerxTheme.muted)
        }
        .frame(maxWidth: .infinity, minHeight: 160)
        .perxCard()
    }
}

// MARK: - Spin Wheel Game

struct SpinWheelGameView: View {
    @Binding var played: Bool
    let onWin: (Int, String) -> Void

    @State private var rotation: Double = 0
    @State private var isSpinning = false

    private let segments: [(label: String, color: Color, amount: Int)] = [
        ("500 LEK", .orange, 500),
        ("Try Again", .gray, 0),
        ("150 LEK", .purple, 150),
        ("300 LEK", .blue, 300),
        ("1000 LEK", .red, 1000),
        ("200 LEK", .green, 200),
        ("750 LEK", .pink, 750),
        ("50 LEK", .teal, 50),
    ]

    var body: some View {
        VStack(spacing: 20) {
            if played {
                alreadyPlayedView
            } else {
                // Pointer + Wheel in a VStack so the triangle stays outside the wheel bounds
                VStack(spacing: 0) {
                    Triangle()
                        .fill(PerxTheme.ember)
                        .frame(width: 20, height: 20)

                    ZStack {
                        ForEach(0..<segments.count, id: \.self) { i in
                            WedgeView(
                                index: i,
                                total: segments.count,
                                color: segments[i].color,
                                label: segments[i].label
                            )
                        }
                        // Center hub
                        Circle()
                            .fill(PerxTheme.bgElevated)
                            .frame(width: 44, height: 44)
                            .overlay(Circle().stroke(PerxTheme.line, lineWidth: 2))
                        Image(systemName: "star.fill")
                            .foregroundStyle(PerxTheme.emberGradient)
                            .font(.system(size: 16))
                    }
                    .frame(width: 240, height: 240)
                    .clipShape(Circle())
                    .rotationEffect(.degrees(rotation))
                }

                Button {
                    guard !isSpinning && !played else { return }
                    spin()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "arrow.clockwise")
                        Text(isSpinning ? "Spinning…" : "Spin!")
                            .font(.system(size: 16, weight: .semibold))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background {
                        if isSpinning { PerxTheme.bgElevated2 } else { PerxTheme.emberGradient }
                    }
                    .foregroundColor(isSpinning ? PerxTheme.muted : .white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .disabled(isSpinning || played)
            }
        }
        .perxCard()
        .onChange(of: played) { newValue in
            if !newValue { rotation = 0; isSpinning = false }
        }
    }

    private func spin() {
        isSpinning = true
        let extraSpins = Double.random(in: 4...6) * 360
        let segAngle = 360.0 / Double(segments.count)
        let targetSegment = Int.random(in: 0..<segments.count)
        let finalAngle = extraSpins + segAngle * Double(targetSegment) + segAngle / 2

        withAnimation(.timingCurve(0.17, 0.67, 0.12, 1.0, duration: 3.5)) {
            rotation += finalAngle
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 3.6) {
            isSpinning = false
            played = true
            let seg = segments[targetSegment]
            let msg = seg.amount > 0 ? "\(seg.label) earned! 🎉" : "Better luck tomorrow! 🍀"
            onWin(seg.amount, msg)
        }
    }

    private var alreadyPlayedView: some View {
        VStack(spacing: 12) {
            Text("🎡").font(.system(size: 40))
            Text("No spins left today!")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(PerxTheme.text)
            Text("Come back tomorrow for another spin.")
                .font(.caption)
                .foregroundColor(PerxTheme.muted)
        }
        .frame(maxWidth: .infinity, minHeight: 160)
    }
}

struct WedgeView: View {
    let index: Int
    let total: Int
    let color: Color
    let label: String

    private var startAngle: Double { Double(index) / Double(total) * 360 - 90 }
    private var endAngle: Double { Double(index + 1) / Double(total) * 360 - 90 }
    private var midAngle: Double { (startAngle + endAngle) / 2 }
    private var textRadius: Double { 80 }

    var body: some View {
        ZStack {
            Path { path in
                let center = CGPoint(x: 120, y: 120)
                let r = 120.0
                path.move(to: center)
                path.addArc(center: center, radius: r,
                            startAngle: .degrees(startAngle),
                            endAngle: .degrees(endAngle),
                            clockwise: false)
            }
            .fill(color.opacity(index % 2 == 0 ? 0.85 : 0.65))

            // Segment label
            Text(label)
                .font(.system(size: 9, weight: .bold))
                .foregroundColor(.white)
                .rotationEffect(.degrees(midAngle + 90))
                .offset(
                    x: cos((midAngle) * .pi / 180) * textRadius,
                    y: sin((midAngle) * .pi / 180) * textRadius
                )
        }
        .frame(width: 240, height: 240)
    }
}

struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.midX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.minY))
        path.closeSubpath()
        return path
    }
}

// MARK: - Number Guess Game

struct NumberGuessGameView: View {
    @Binding var played: Bool
    let onWin: (Int, String) -> Void

    @State private var target: Int = Int.random(in: 1...10)
    @State private var selected: Int = 5
    @State private var attemptsLeft: Int = 3
    @State private var hint: String? = nil
    @State private var gameOver = false

    var body: some View {
        VStack(spacing: 16) {
            if played && !gameOver {
                VStack(spacing: 12) {
                    Text("🔢").font(.system(size: 40))
                    Text("Already played today!")
                        .font(.system(size: 16, weight: .semibold)).foregroundColor(PerxTheme.text)
                    Text("Come back tomorrow for a new number.")
                        .font(.caption).foregroundColor(PerxTheme.muted)
                }
                .frame(maxWidth: .infinity, minHeight: 160)
            } else if gameOver {
                // outcome is shown via the result banner in GamesView
                VStack(spacing: 12) {
                    Text(attemptsLeft > 0 ? "🎉" : "🍀").font(.system(size: 40))
                    Text(attemptsLeft > 0 ? "Correct!" : "The number was \(target)")
                        .font(.system(size: 16, weight: .semibold)).foregroundColor(PerxTheme.text)
                    Text(attemptsLeft > 0 ? "Come back tomorrow for another round." : "Better luck next time!")
                        .font(.caption).foregroundColor(PerxTheme.muted)
                }
                .frame(maxWidth: .infinity, minHeight: 160)
            } else {
                Text("I'm thinking of a number\nbetween 1 and 10.")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(PerxTheme.text)
                    .multilineTextAlignment(.center)

                Text("\(attemptsLeft) attempt\(attemptsLeft == 1 ? "" : "s") left")
                    .font(.caption)
                    .foregroundColor(attemptsLeft == 1 ? PerxTheme.danger : PerxTheme.muted)

                // Number picker buttons
                let cols = Array(repeating: GridItem(.flexible(), spacing: 6), count: 5)
                LazyVGrid(columns: cols, spacing: 6) {
                    ForEach(1...10, id: \.self) { n in
                        Button { selected = n } label: {
                            Text("\(n)")
                                .font(.system(size: 15, weight: .bold))
                                .frame(maxWidth: .infinity).frame(height: 36)
                                .background(selected == n ? PerxTheme.ember.opacity(0.22) : PerxTheme.bgElevated2)
                                .foregroundColor(selected == n ? PerxTheme.ember : PerxTheme.text)
                                .overlay(RoundedRectangle(cornerRadius: 8).stroke(selected == n ? PerxTheme.ember : PerxTheme.line, lineWidth: 1))
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                        .buttonStyle(.plain)
                    }
                }

                if let h = hint {
                    Text(h)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(PerxTheme.gold)
                        .transition(.scale.combined(with: .opacity))
                }

                Button {
                    if selected == target {
                        let prize = attemptsLeft == 3 ? 500 : attemptsLeft == 2 ? 300 : 100
                        gameOver = true; played = true
                        onWin(prize, "Correct! +\(prize) LEK earned 🎉")
                    } else {
                        attemptsLeft -= 1
                        if attemptsLeft == 0 {
                            gameOver = true; played = true
                            onWin(0, "The number was \(target). Better luck next time! 🍀")
                        } else {
                            withAnimation { hint = selected < target ? "Too low — try higher ⬆️" : "Too high — try lower ⬇️" }
                        }
                    }
                } label: {
                    Text("Guess!")
                        .font(.system(size: 15, weight: .semibold))
                        .frame(maxWidth: .infinity).padding(.vertical, 12)
                        .background(PerxTheme.emberGradient)
                        .foregroundColor(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }
        }
        .perxCard()
        .onChange(of: played) { newValue in
            if !newValue {
                target = Int.random(in: 1...10)
                selected = 5; attemptsLeft = 3; hint = nil; gameOver = false
            }
        }
    }
}

// MARK: - Memory Match Game

struct MemoryCard: Identifiable {
    let id: Int
    let emoji: String
    var isFaceUp = false
    var isMatched = false
}

struct MemoryMatchGameView: View {
    @Binding var played: Bool
    let onWin: (Int, String) -> Void

    private let emojis = ["🏋️", "🍕", "✈️", "🧘", "📚", "🎵"]
    @State private var cards: [MemoryCard] = []
    @State private var flippedIds: [Int] = []
    @State private var isChecking = false
    @State private var matchedCount = 0

    var body: some View {
        VStack(spacing: 14) {
            if played && matchedCount < 6 {
                VStack(spacing: 12) {
                    Text("🧠").font(.system(size: 40))
                    Text("Memory matched today!")
                        .font(.system(size: 16, weight: .semibold)).foregroundColor(PerxTheme.text)
                    Text("Come back tomorrow for a new set.")
                        .font(.caption).foregroundColor(PerxTheme.muted)
                }
                .frame(maxWidth: .infinity, minHeight: 160)
            } else {
                Text("Match all \(emojis.count) pairs to win 300 LEK!")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(PerxTheme.muted)
                    .multilineTextAlignment(.center)

                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 4), spacing: 8) {
                    ForEach(cards) { card in
                        cardFace(card)
                            .onTapGesture {
                                guard !isChecking, !card.isFaceUp, !card.isMatched else { return }
                                flipCard(id: card.id)
                            }
                    }
                }

                if matchedCount == 6 {
                    Text("🎉 All matched!")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(PerxTheme.success)
                }
            }
        }
        .perxCard()
        .onAppear { if cards.isEmpty { setupCards() } }
        .onChange(of: played) { newValue in
            if !newValue { flippedIds = []; matchedCount = 0; isChecking = false; setupCards() }
        }
    }

    @ViewBuilder
    private func cardFace(_ card: MemoryCard) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .fill(card.isMatched ? PerxTheme.success.opacity(0.15) : (card.isFaceUp ? PerxTheme.bgElevated : PerxTheme.bgElevated2))
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(card.isMatched ? PerxTheme.success : PerxTheme.line, lineWidth: 1))
            if card.isFaceUp || card.isMatched {
                Text(card.emoji).font(.system(size: 20))
            } else {
                Image(systemName: "questionmark")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(PerxTheme.faint)
            }
        }
        .frame(height: 54)
        .animation(.easeInOut(duration: 0.18), value: card.isFaceUp)
    }

    private func setupCards() {
        let all = (emojis + emojis).enumerated().map { MemoryCard(id: $0.offset, emoji: $0.element) }
        cards = all.shuffled()
    }

    private func flipCard(id: Int) {
        guard let idx = cards.firstIndex(where: { $0.id == id }) else { return }
        cards[idx].isFaceUp = true
        flippedIds.append(id)
        guard flippedIds.count == 2 else { return }
        isChecking = true
        let ids = flippedIds
        flippedIds = []
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) {
            guard let i1 = cards.firstIndex(where: { $0.id == ids[0] }),
                  let i2 = cards.firstIndex(where: { $0.id == ids[1] }) else {
                isChecking = false; return
            }
            if cards[i1].emoji == cards[i2].emoji {
                cards[i1].isMatched = true
                cards[i2].isMatched = true
                matchedCount += 1
                if matchedCount == 6 {
                    played = true
                    onWin(300, "+300 LEK for matching all pairs! 🎉")
                }
            } else {
                cards[i1].isFaceUp = false
                cards[i2].isFaceUp = false
            }
            isChecking = false
        }
    }
}

// MARK: - Provider card

struct ProviderCardCompact: View {
    let provider: Provider
    @EnvironmentObject var session: SessionStore
    @State private var showVideo = false
    @State private var showQR = false

    var inCart: Bool { session.employee?.cart.contains(provider.slug) ?? false }
    var isActive: Bool { session.employee?.activeBenefits.contains(provider.slug) ?? false }
    var hasVideo: Bool { !(provider.videoUrl ?? "").isEmpty }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Image — fixed height, flush with top
            Button { if hasVideo { showVideo = true } } label: {
                BenefitMedia(provider: provider, height: 120)
            }
            .buttonStyle(.plain)

            // Text section — fixed height so all cards are identical
            VStack(alignment: .leading, spacing: 5) {
                HStack(alignment: .top, spacing: 4) {
                    Text(provider.name)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(PerxTheme.text)
                        .lineLimit(1)
                    Spacer()
                    if let r = provider.rating {
                        HStack(spacing: 2) {
                            Image(systemName: "star.fill").font(.system(size: 8)).foregroundColor(PerxTheme.gold)
                            Text(String(format: "%.1f", r)).font(.caption2).foregroundColor(PerxTheme.muted)
                        }
                    }
                }
                // Always render blurb row (space placeholder keeps layout consistent)
                Text(provider.blurb ?? " ")
                    .font(.caption)
                    .foregroundColor(PerxTheme.muted)
                    .lineLimit(1)
                Spacer(minLength: 0)
                HStack {
                    Text("\(Int(provider.cost).formatted()) LEK")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(PerxTheme.ember)
                    Spacer()
                    Button {
                        if isActive {
                            showQR = true
                        } else {
                            Task { await session.addToCart(provider.slug) }
                        }
                    } label: {
                        HStack(spacing: 4) {
                            if isActive { Image(systemName: "qrcode").font(.system(size: 10, weight: .semibold)) }
                            Text(isActive ? "Active" : (inCart ? "In cart" : "Add"))
                        }
                        .font(.system(size: 11, weight: .semibold))
                        .padding(.horizontal, 8).padding(.vertical, 5)
                        .background(isActive ? PerxTheme.success.opacity(0.18) : (inCart ? PerxTheme.bgElevated2 : PerxTheme.ember.opacity(0.18)))
                        .foregroundColor(isActive ? PerxTheme.success : PerxTheme.ember)
                        .clipShape(Capsule())
                    }
                    .disabled(!isActive && inCart)
                }
            }
            .padding(.horizontal, 10)
            .padding(.top, 8)
            .padding(.bottom, 10)
            .frame(maxWidth: .infinity, maxHeight: 86)
        }
        .frame(maxWidth: .infinity)
        .background(PerxTheme.bgElevated)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(PerxTheme.line, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .sheet(isPresented: $showVideo) {
            VideoSheet(provider: provider)
        }
        .sheet(isPresented: $showQR) {
            BenefitQRSheet(benefit: MemberBenefit(slug: provider.slug, name: provider.name, category: provider.category))
                .presentationDetents([.height(440)])
                .presentationDragIndicator(.visible)
                .presentationCornerRadius(28)
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

// MARK: - Shared UI helpers

struct PerxLogoTitle: View {
    var body: some View {
        HStack(spacing: 6) {
            Image("Logo")
                .resizable()
                .scaledToFit()
                .frame(width: 20, height: 20)
                .clipShape(RoundedRectangle(cornerRadius: 4))
            Text("PERX")
                .font(.system(size: 14, weight: .bold, design: .serif))
                .foregroundColor(PerxTheme.text)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(PerxTheme.bgElevated2)
        .overlay(Capsule().stroke(PerxTheme.line, lineWidth: 1))
        .clipShape(Capsule())
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

