import SwiftUI

// MARK: - Perky: on-device AI benefits concierge

struct PerkyMessage: Identifiable, Equatable {
    enum Role: Equatable { case user, assistant }
    let id = UUID()
    var role: Role
    var content: String
    var streaming: Bool = false
    var mentions: [Provider] = []
}

struct PerkyView: View {
    @EnvironmentObject var session: SessionStore
    @State private var messages: [PerkyMessage] = [
        PerkyMessage(role: .assistant, content: "Hey! I'm Perky 👋 Ask me about budget, a category, or what's worth trying this week — I'll point you to the right perk.")
    ]
    @State private var input = ""
    @State private var busy = false
    @FocusState private var inputFocused: Bool

    private let prompts = ["Help me relax", "Find me a gym", "Plan a weekend trip", "What fits my budget?"]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                header

                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: 12) {
                            ForEach(messages) { m in
                                PerkyBubble(message: m) { slug in
                                    Task { await session.addToCart(slug) }
                                }
                            }
                            if busy { PerkyTyping() }
                            Color.clear.frame(height: 1).id("bottom")
                        }
                        .padding(16)
                    }
                    .scrollDismissesKeyboard(.interactively)
                    .onChange(of: messages.count) {
                        withAnimation(.easeOut(duration: 0.25)) { proxy.scrollTo("bottom", anchor: .bottom) }
                    }
                    .onChange(of: busy) {
                        withAnimation(.easeOut(duration: 0.25)) { proxy.scrollTo("bottom", anchor: .bottom) }
                    }
                }

                promptRow
                inputBar
            }
            .background(PerxTheme.bg.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) { PerxLogoTitle() }
                ToolbarItemGroup(placement: .keyboard) {
                    Spacer()
                    Button("Done") { inputFocused = false }
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(PerxTheme.ember)
                }
            }
        }
    }

    private var header: some View {
        HStack(spacing: 12) {
            PerkyOrb(breathing: true)
            VStack(alignment: .leading, spacing: 1) {
                Text("Perky").font(.system(size: 16, weight: .bold, design: .serif)).foregroundColor(PerxTheme.text)
                Text("Your AI benefits concierge").font(.caption).foregroundColor(PerxTheme.muted)
            }
            Spacer()
            HStack(spacing: 4) {
                Circle().fill(PerxTheme.success).frame(width: 6, height: 6)
                Text("Online").font(.system(size: 10, weight: .semibold)).foregroundColor(PerxTheme.success)
            }
            .padding(.horizontal, 8).padding(.vertical, 4)
            .background(PerxTheme.success.opacity(0.12))
            .clipShape(Capsule())
        }
        .padding(16)
        .background(PerxTheme.bgElevated)
        .overlay(Rectangle().frame(height: 1).foregroundColor(PerxTheme.line), alignment: .bottom)
    }

    private var promptRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(prompts, id: \.self) { p in
                    Button { send(p) } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "sparkle").font(.system(size: 10))
                            Text(p)
                        }
                        .font(.system(size: 12, weight: .semibold))
                        .padding(.horizontal, 12).padding(.vertical, 7)
                        .background(PerxTheme.bgElevated)
                        .foregroundColor(PerxTheme.muted)
                        .overlay(Capsule().stroke(PerxTheme.line, lineWidth: 1))
                        .clipShape(Capsule())
                    }
                    .disabled(busy)
                }
            }
            .padding(.horizontal, 16)
        }
        .padding(.vertical, 10)
    }

    private var inputBar: some View {
        HStack(spacing: 8) {
            TextField("Ask Perky anything…", text: $input)
                .font(.system(size: 14))
                .focused($inputFocused)
                .submitLabel(.send)
                .onSubmit { send(input) }
                .padding(.horizontal, 14).padding(.vertical, 11)
                .background(PerxTheme.bgElevated2)
                .clipShape(Capsule())
            Button { send(input) } label: {
                Image(systemName: "arrow.up")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)
                    .frame(width: 38, height: 38)
                    .background(input.trimmingCharacters(in: .whitespaces).isEmpty || busy ? PerxTheme.faint : PerxTheme.ember)
                    .clipShape(Circle())
            }
            .disabled(input.trimmingCharacters(in: .whitespaces).isEmpty || busy)
        }
        .padding(.horizontal, 16).padding(.vertical, 10)
        .background(PerxTheme.bgElevated.opacity(0.95))
    }

    private func send(_ text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, !busy else { return }
        inputFocused = false
        input = ""
        messages.append(PerkyMessage(role: .user, content: trimmed))
        busy = true

        let (reply, mentions) = PerkyBrain.reply(to: trimmed, providers: session.providers, budgetRemaining: session.budgetRemaining)

        DispatchQueue.main.asyncAfter(deadline: .now() + Double.random(in: 0.5...0.9)) {
            busy = false
            messages.append(PerkyMessage(role: .assistant, content: reply, mentions: mentions))
        }
    }
}

// MARK: - Local "brain" — keyword-matched suggestions over the real catalog.
// No network call needed: fast, always available, and grounded in actual providers/prices.

enum PerkyBrain {
    private static let patterns: [(keywords: [String], category: String, intro: String)] = [
        (["relax", "wellness", "spa", "massage", "stress", "calm"], "wellness", "For a real reset, this is worth booking:"),
        (["gym", "sport", "fitness", "workout", "exercise", "run"], "sport", "Strongest pick for staying active:"),
        (["food", "eat", "lunch", "coffee", "meal", "snack"], "food", "Good everyday fuel:"),
        (["travel", "trip", "weekend", "vacation", "coast", "flight"], "travel", "Worth planning a getaway around:"),
        (["learn", "book", "read", "course", "language", "study"], "learning", "Great for leveling up outside of work:"),
        (["health", "doctor", "checkup", "clinic", "medical"], "health", "Don't put this off — it's covered:"),
    ]

    static func reply(to message: String, providers: [Provider], budgetRemaining: Double) -> (String, [Provider]) {
        let lower = message.lowercased()

        if lower.contains("budget") || lower.contains("afford") || lower.contains("fit") {
            let affordable = providers.filter { $0.cost <= budgetRemaining }.sorted { ($0.rating ?? 0) > ($1.rating ?? 0) }.prefix(2)
            let text = "You've got \(Int(budgetRemaining).formatted()) LEK left. " + (affordable.isEmpty ? "Nothing fits right now — check back after your next budget cycle." : "These fit comfortably:")
            return (text, Array(affordable))
        }

        for pattern in patterns {
            guard pattern.keywords.contains(where: { lower.contains($0) }) else { continue }
            let matches = providers
                .filter { $0.category == pattern.category }
                .sorted { ($0.rating ?? 0) > ($1.rating ?? 0) }
                .prefix(2)
            if !matches.isEmpty {
                return (pattern.intro, Array(matches))
            }
        }

        let top = providers.sorted { ($0.rating ?? 0) > ($1.rating ?? 0) }.prefix(2)
        let text = "I can help you find benefits that fit your budget (\(Int(budgetRemaining).formatted()) LEK left). Try asking about something relaxing, a gym, food, or weekend trips — or check out these top-rated picks:"
        return (text, Array(top))
    }
}

// MARK: - UI pieces

struct PerkyOrb: View {
    var breathing: Bool = false
    @State private var animate = false

    var body: some View {
        ZStack {
            Circle()
                .fill(PerxTheme.emberGradient)
                .frame(width: 36, height: 36)
                .scaleEffect(breathing && animate ? 1.08 : 1.0)
                .shadow(color: PerxTheme.ember.opacity(0.35), radius: animate ? 8 : 4)
            Image(systemName: "sparkles")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.white)
        }
        .onAppear {
            guard breathing else { return }
            withAnimation(.easeInOut(duration: 1.6).repeatForever(autoreverses: true)) { animate = true }
        }
    }
}

struct PerkyTyping: View {
    var body: some View {
        HStack(spacing: 8) {
            PerkyOrb()
            HStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { i in
                    Circle().fill(PerxTheme.ember).frame(width: 5, height: 5)
                        .modifier(PulseDot(delay: Double(i) * 0.15))
                }
            }
            .padding(.horizontal, 12).padding(.vertical, 10)
            .background(PerxTheme.bgElevated)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(PerxTheme.line, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }
}

private struct PulseDot: ViewModifier {
    let delay: Double
    @State private var on = false
    func body(content: Content) -> some View {
        content
            .opacity(on ? 1 : 0.3)
            .onAppear {
                withAnimation(.easeInOut(duration: 0.6).repeatForever().delay(delay)) { on = true }
            }
    }
}

struct PerkyBubble: View {
    let message: PerkyMessage
    let onAdd: (String) -> Void
    @EnvironmentObject var session: SessionStore

    var isUser: Bool { message.role == .user }

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            if isUser { Spacer(minLength: 40) } else { PerkyOrb() }

            VStack(alignment: .leading, spacing: 8) {
                Text(message.content)
                    .font(.system(size: 14))
                    .foregroundColor(isUser ? .white : PerxTheme.text)
                    .padding(.horizontal, 14).padding(.vertical, 10)
                    .background(isUser ? PerxTheme.emberGradient : LinearGradient(colors: [PerxTheme.bgElevated, PerxTheme.bgElevated], startPoint: .top, endPoint: .bottom))
                    .overlay(
                        Group { if !isUser { RoundedRectangle(cornerRadius: 14).stroke(PerxTheme.line, lineWidth: 1) } }
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 14))

                if !message.mentions.isEmpty {
                    VStack(spacing: 6) {
                        ForEach(message.mentions) { p in
                            mentionRow(p)
                        }
                    }
                }
            }
            .frame(maxWidth: 280, alignment: isUser ? .trailing : .leading)

            if !isUser { Spacer(minLength: 40) }
        }
        .frame(maxWidth: .infinity, alignment: isUser ? .trailing : .leading)
    }

    private func mentionRow(_ p: Provider) -> some View {
        let isActive = session.employee?.activeBenefits.contains(p.slug) ?? false
        let inCart = session.employee?.cart.contains(p.slug) ?? false
        return HStack(spacing: 10) {
            VStack(alignment: .leading, spacing: 1) {
                Text(p.name).font(.system(size: 12, weight: .semibold)).foregroundColor(PerxTheme.text).lineLimit(1)
                Text("\(Int(p.cost).formatted()) LEK").font(.caption2).foregroundColor(PerxTheme.faint)
            }
            Spacer()
            Button {
                if !isActive && !inCart { onAdd(p.slug) }
            } label: {
                Text(isActive ? "Active" : (inCart ? "In cart" : "Add"))
                    .font(.system(size: 10, weight: .semibold))
                    .padding(.horizontal, 8).padding(.vertical, 4)
                    .background(isActive ? PerxTheme.success.opacity(0.18) : (inCart ? PerxTheme.bgElevated2 : PerxTheme.ember.opacity(0.18)))
                    .foregroundColor(isActive ? PerxTheme.success : PerxTheme.ember)
                    .clipShape(Capsule())
            }
            .disabled(isActive || inCart)
        }
        .padding(10)
        .background(PerxTheme.bgElevated2)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(PerxTheme.line, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}
