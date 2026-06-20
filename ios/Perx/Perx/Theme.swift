import SwiftUI
import UIKit
import AVKit

// MARK: - Theme manager (light/dark toggle, persisted)

enum ThemePref: String, CaseIterable {
    case system, light, dark
    var icon: String {
        switch self {
        case .system: return "circle.lefthalf.filled"
        case .light:  return "sun.max"
        case .dark:   return "moon"
        }
    }
    var label: String { rawValue.capitalized }
}

@MainActor
final class ThemeManager: ObservableObject {
    @Published var pref: ThemePref {
        didSet { UserDefaults.standard.set(pref.rawValue, forKey: "perx.theme") }
    }
    init() {
        let raw = UserDefaults.standard.string(forKey: "perx.theme") ?? ThemePref.system.rawValue
        self.pref = ThemePref(rawValue: raw) ?? .system
    }
    var colorScheme: ColorScheme? {
        switch pref {
        case .system: return nil
        case .light:  return .light
        case .dark:   return .dark
        }
    }
}

// MARK: - Palette
// Mirrors the website's CSS tokens: warm cream / coral light, dusk-navy dark.

enum PerxTheme {
    // Light tokens (cream)
    private static let lightBg          = Color(red: 250/255, green: 249/255, blue: 245/255)
    private static let lightBgElevated  = Color.white
    private static let lightBgElevated2 = Color(red: 239/255, green: 233/255, blue: 222/255)
    private static let lightLine        = Color(red: 230/255, green: 223/255, blue: 216/255)
    private static let lightText        = Color(red: 20/255,  green: 20/255,  blue: 19/255)
    private static let lightMuted       = Color(red: 108/255, green: 106/255, blue: 100/255)
    private static let lightFaint       = Color(red: 142/255, green: 139/255, blue: 130/255)

    // Dark tokens (dusk)
    private static let darkBg          = Color(red: 17/255,  green: 19/255,  blue: 24/255)
    private static let darkBgElevated  = Color(red: 25/255,  green: 28/255,  blue: 35/255)
    private static let darkBgElevated2 = Color(red: 31/255,  green: 35/255,  blue: 43/255)
    private static let darkLine        = Color(red: 54/255,  green: 61/255,  blue: 73/255)
    private static let darkText        = Color(red: 242/255, green: 245/255, blue: 249/255)
    private static let darkMuted       = Color(red: 177/255, green: 184/255, blue: 194/255)
    private static let darkFaint       = Color(red: 125/255, green: 134/255, blue: 146/255)

    // Brand (same in both modes)
    static let ember   = Color(red: 204/255, green: 120/255, blue: 92/255)
    static let ember2  = Color(red: 169/255, green: 88/255,  blue: 62/255)
    static let gold    = Color(red: 232/255, green: 165/255, blue: 90/255)
    static let success = Color(red: 93/255,  green: 184/255, blue: 114/255)
    static let danger  = Color(red: 198/255, green: 69/255,  blue: 69/255)

    static let bg          = dyn(lightBg, darkBg)
    static let bgElevated  = dyn(lightBgElevated, darkBgElevated)
    static let bgElevated2 = dyn(lightBgElevated2, darkBgElevated2)
    static let line        = dyn(lightLine, darkLine)
    static let text        = dyn(lightText, darkText)
    static let muted       = dyn(lightMuted, darkMuted)
    static let faint       = dyn(lightFaint, darkFaint)

    static let emberGradient = LinearGradient(
        colors: [ember, gold],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    // Soft ambient like the web's `bg-grad-aurora`.
    static let auroraGradient = LinearGradient(
        colors: [ember.opacity(0.20), .clear, gold.opacity(0.08)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static func categoryColor(_ category: String) -> Color {
        switch category {
        case "wellness":  return Color(red: 93/255,  green: 184/255, blue: 166/255)
        case "food":      return gold
        case "sport":     return Color(red: 37/255,  green: 99/255,  blue: 235/255)
        case "travel":    return ember
        case "learning":  return Color(red: 8/255,   green: 145/255, blue: 178/255)
        case "selfcare":  return Color(red: 219/255, green: 39/255,  blue: 119/255)
        case "health":    return success
        default:          return faint
        }
    }

    /// Pick a color that adapts to the current trait collection (light/dark).
    private static func dyn(_ light: Color, _ dark: Color) -> Color {
        Color(UIColor { trait in
            trait.userInterfaceStyle == .dark ? UIColor(dark) : UIColor(light)
        })
    }
}

// MARK: - Card modifier

struct CardBackground: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(16)
            .background(PerxTheme.bgElevated)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(PerxTheme.line, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

extension View {
    func perxCard() -> some View { modifier(CardBackground()) }
}

// MARK: - Video / poster placeholder for benefits

struct BenefitMedia: View {
    let provider: Provider
    var height: CGFloat = 110
    var corner: CGFloat = 10
    @State private var loadFailed = false

    var body: some View {
        ZStack {
            // Always-present themed gradient — also the "placeholder" when no media.
            LinearGradient(
                colors: [
                    PerxTheme.categoryColor(provider.category).opacity(0.55),
                    PerxTheme.categoryColor(provider.category).opacity(0.18),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            if let s = provider.posterUrl, let url = URL(string: s), !s.isEmpty, !loadFailed {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .empty:
                        ProgressView().tint(.white)
                    case .success(let img):
                        img.resizable()
                            .scaledToFill()
                            .frame(maxWidth: .infinity, maxHeight: height)
                            .clipped()
                    case .failure:
                        Color.clear.onAppear { loadFailed = true }
                    @unknown default:
                        Color.clear
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: height)
            }

            // Bottom gradient + play hint
            LinearGradient(
                colors: [.clear, Color.black.opacity(0.45)],
                startPoint: .center,
                endPoint: .bottom
            )

            HStack {
                Text(provider.category.uppercased())
                    .font(.system(size: 9, weight: .bold)).tracking(1.0)
                    .padding(.horizontal, 6).padding(.vertical, 3)
                    .background(.ultraThinMaterial)
                    .foregroundColor(.white)
                    .clipShape(Capsule())
                Spacer()
                Image(systemName: "play.fill")
                    .font(.system(size: 11, weight: .bold))
                    .padding(6)
                    .background(.ultraThinMaterial, in: Circle())
                    .foregroundColor(.white)
            }
            .padding(8)
            .frame(maxHeight: .infinity, alignment: .bottom)
        }
        .frame(height: height)
        .clipShape(RoundedRectangle(cornerRadius: corner))
    }
}
