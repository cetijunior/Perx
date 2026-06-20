import SwiftUI

struct BenefitDetailView: View {
    let provider: Provider
    @EnvironmentObject var session: SessionStore
    @EnvironmentObject var router: TabRouter
    @Environment(\.dismiss) private var dismiss
    @State private var showQR = false

    var inCart: Bool { session.employee?.cart.contains(provider.slug) ?? false }
    var isActive: Bool { session.employee?.activeBenefits.contains(provider.slug) ?? false }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                BenefitMedia(provider: provider, height: 200, corner: 14)

                VStack(alignment: .leading, spacing: 8) {
                    Text(provider.category.uppercased())
                        .font(.system(size: 10, weight: .bold))
                        .tracking(1.2)
                        .foregroundColor(PerxTheme.faint)
                    Text(provider.name)
                        .font(.system(size: 26, weight: .bold, design: .serif))
                        .foregroundColor(PerxTheme.text)
                    if let blurb = provider.blurb {
                        Text(blurb)
                            .font(.subheadline)
                            .foregroundColor(PerxTheme.muted)
                    }
                    HStack(spacing: 12) {
                        Text("\(Int(provider.cost).formatted()) LEK")
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(PerxTheme.ember)
                        if let cadence = provider.cadence {
                            Text(cadence.capitalized)
                                .font(.caption)
                                .foregroundColor(PerxTheme.faint)
                        }
                        if let r = provider.rating {
                            HStack(spacing: 3) {
                                Image(systemName: "star.fill").font(.system(size: 10)).foregroundColor(PerxTheme.gold)
                                Text(String(format: "%.1f", r)).font(.caption).foregroundColor(PerxTheme.muted)
                            }
                        }
                    }
                }

                if isActive {
                    Label("Active benefit", systemImage: "checkmark.seal.fill")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(PerxTheme.success)
                        .padding(.horizontal, 12).padding(.vertical, 8)
                        .background(PerxTheme.success.opacity(0.12))
                        .clipShape(Capsule())
                } else if inCart {
                    Label("In your cart", systemImage: "bag.fill")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(PerxTheme.ember)
                        .padding(.horizontal, 12).padding(.vertical, 8)
                        .background(PerxTheme.ember.opacity(0.12))
                        .clipShape(Capsule())
                }

                VStack(alignment: .leading, spacing: 10) {
                    Text("About")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(PerxTheme.text)
                    Text(detailDescription)
                        .font(.subheadline)
                        .foregroundColor(PerxTheme.muted)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(16)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(PerxTheme.bgElevated)
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(PerxTheme.line, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 14))

                VStack(alignment: .leading, spacing: 12) {
                    Text("Explore PERX")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(PerxTheme.text)
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                        QuickLinkButton(title: "Ask Perky", icon: "sparkles") { router.selected = .perky; dismiss() }
                        QuickLinkButton(title: "Budget", icon: "wallet.pass") { router.selected = .home; dismiss() }
                        QuickLinkButton(title: "Games", icon: "gamecontroller") { router.selected = .games; dismiss() }
                        QuickLinkButton(title: "Redeem", icon: "qrcode") { router.selected = .profile; dismiss() }
                    }
                }
                .padding(16)
                .background(PerxTheme.bgElevated)
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(PerxTheme.line, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .padding(20)
        }
        .background(PerxTheme.bg.ignoresSafeArea())
        .navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .bottom) {
            HStack(spacing: 10) {
                if isActive {
                    Button { showQR = true } label: {
                        Label("Show QR", systemImage: "qrcode")
                            .font(.system(size: 15, weight: .semibold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(PerxTheme.ember)
                            .foregroundColor(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                } else {
                    Button {
                        Task { await session.addToCart(provider.slug) }
                    } label: {
                        Text(inCart ? "In cart" : "Add to cart")
                            .font(.system(size: 15, weight: .semibold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(inCart ? PerxTheme.bgElevated2 : PerxTheme.ember)
                            .foregroundColor(inCart ? PerxTheme.muted : .white)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .disabled(inCart)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(.ultraThinMaterial)
        }
        .sheet(isPresented: $showQR) {
            BenefitQRSheet(benefit: MemberBenefit(slug: provider.slug, name: provider.name, category: provider.category))
                .presentationDetents([.height(440)])
                .presentationDragIndicator(.visible)
                .presentationCornerRadius(28)
        }
    }

    private var detailDescription: String {
        if let blurb = provider.blurb, !blurb.isEmpty {
            return "\(blurb) Use your PERX budget to request this benefit — HR approves in one tap, then redeem with your membership QR at the partner."
        }
        return "Request this benefit through PERX and redeem with your membership QR once approved."
    }
}

private struct QuickLinkButton: View {
    let title: String
    let icon: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Image(systemName: icon).font(.system(size: 18)).foregroundColor(PerxTheme.ember)
                Text(title).font(.system(size: 11, weight: .medium)).foregroundColor(PerxTheme.muted)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(PerxTheme.bgElevated2)
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
        .buttonStyle(.plain)
    }
}
