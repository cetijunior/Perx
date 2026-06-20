import SwiftUI
import UIKit
import Combine
import CoreImage.CIFilterBuiltins

// MARK: - QR generation

enum QRGenerator {
    private static let context = CIContext()

    static func image(from string: String, scale: CGFloat = 10) -> UIImage? {
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(string.utf8)
        filter.correctionLevel = "M"
        guard let output = filter.outputImage else { return nil }
        let transformed = output.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
        guard let cg = context.createCGImage(transformed, from: transformed.extent) else { return nil }
        return UIImage(cgImage: cg)
    }
}

// MARK: - Per-benefit QR popup (single-use, short-lived discount code)

struct BenefitQRSheet: View {
    let benefit: MemberBenefit
    @Environment(\.dismiss) private var dismiss

    @State private var qrImage: UIImage?
    @State private var secondsLeft: Int = 0
    @State private var loading = true
    @State private var errorMessage: String?
    @State private var appear = false

    private let tickTimer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(spacing: 18) {
            Capsule()
                .fill(Color.clear)
                .frame(width: 0, height: 0)

            VStack(spacing: 4) {
                Text(benefit.name)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(PerxTheme.text)
                Text(benefit.category)
                    .font(.caption)
                    .foregroundColor(PerxTheme.muted)
            }
            .padding(.top, 8)

            ZStack {
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color.white)
                    .frame(width: 232, height: 232)
                    .shadow(color: .black.opacity(0.06), radius: 12, y: 4)

                if let qrImage, secondsLeft > 0 {
                    Image(uiImage: qrImage)
                        .interpolation(.none)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 196, height: 196)
                        .transition(.scale.combined(with: .opacity))
                } else if loading {
                    ProgressView()
                } else if secondsLeft <= 0 {
                    VStack(spacing: 8) {
                        Image(systemName: "clock.arrow.circlepath")
                            .font(.system(size: 28))
                            .foregroundColor(PerxTheme.muted)
                        Text("Expired")
                            .font(.caption).foregroundColor(PerxTheme.muted)
                    }
                } else {
                    VStack(spacing: 8) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 24))
                            .foregroundColor(.orange)
                        Text(errorMessage ?? "Couldn't generate code")
                            .font(.caption2).foregroundColor(PerxTheme.muted)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 20)
                    }
                }
            }
            .scaleEffect(appear ? 1 : 0.9)
            .opacity(appear ? 1 : 0)

            if secondsLeft > 0 && qrImage != nil {
                HStack(spacing: 6) {
                    Image(systemName: "timer")
                        .font(.system(size: 11))
                        .foregroundColor(PerxTheme.faint)
                    Text("Expires in \(secondsLeft)s — single use only")
                        .font(.caption2)
                        .foregroundColor(PerxTheme.faint)
                }
            } else if !loading {
                Button {
                    Task { await mint() }
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "arrow.triangle.2.circlepath")
                        Text("Generate new code")
                    }
                    .font(.system(size: 13, weight: .semibold))
                }
                .buttonStyle(.borderedProminent)
                .tint(PerxTheme.ember)
            }

            Spacer(minLength: 0)

            Button("Done") { dismiss() }
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(PerxTheme.muted)
                .padding(.bottom, 8)
        }
        .padding(.horizontal, 24)
        .padding(.top, 28)
        .task { await mint() }
        .onReceive(tickTimer) { _ in tick() }
        .onAppear {
            withAnimation(.spring(response: 0.45, dampingFraction: 0.75)) { appear = true }
        }
    }

    private func tick() {
        guard secondsLeft > 0 else { return }
        secondsLeft -= 1
        if secondsLeft == 0 {
            withAnimation { qrImage = nil }
        }
    }

    private func mint() async {
        loading = true
        errorMessage = nil
        do {
            let res = try await API.shared.benefitQR(slug: benefit.slug)
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                qrImage = QRGenerator.image(from: res.qrToken)
            }
            secondsLeft = res.expiresInSeconds
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
            secondsLeft = 0
        }
        loading = false
    }
}
