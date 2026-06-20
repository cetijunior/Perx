import SwiftUI
import UIKit
import AVFoundation

// MARK: - Admin: scan + redeem a member's QR card

struct ValidateCardView: View {
    @State private var scannedToken: String?
    @State private var lookup: CardLookupResponse?
    @State private var selectedSlug: String?
    @State private var phase: Phase = .scanning
    @State private var errorMessage: String?

    enum Phase { case scanning, lookingUp, ready, redeeming, success, error }

    var body: some View {
        NavigationStack {
            ZStack {
                PerxTheme.bg.ignoresSafeArea()
                switch phase {
                case .scanning:
                    QRScannerView { token in handleScan(token) }
                        .ignoresSafeArea()
                    VStack {
                        Spacer()
                        Text("Point the camera at the member's QR card")
                            .font(.system(size: 13, weight: .semibold))
                            .padding(.horizontal, 14).padding(.vertical, 8)
                            .background(.ultraThinMaterial, in: Capsule())
                            .padding(.bottom, 40)
                    }
                case .lookingUp:
                    ProgressView("Looking up member…")
                case .ready:
                    if let lookup {
                        resultView(lookup)
                    }
                case .redeeming:
                    ProgressView("Redeeming…")
                case .success:
                    successView
                case .error:
                    errorView
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .navigationTitle("Validate")
        }
    }

    private func handleScan(_ token: String) {
        guard scannedToken == nil else { return }
        scannedToken = token
        phase = .lookingUp
        Task {
            do {
                let res = try await API.shared.lookupCard(token: token)
                lookup = res
                selectedSlug = res.lockedBenefit ?? res.benefits.first?.slug
                phase = .ready
            } catch {
                errorMessage = friendlyMessage(error)
                phase = .error
            }
        }
    }

    @ViewBuilder
    private func resultView(_ lookup: CardLookupResponse) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                Text(lookup.employee.name)
                    .font(.system(size: 22, weight: .bold, design: .serif))
                    .foregroundColor(PerxTheme.text)
                Text("\(lookup.employee.department ?? "") · #\(lookup.employee.employeeId)")
                    .font(.caption).foregroundColor(PerxTheme.muted)
            }

            if lookup.benefits.isEmpty {
                Text("No active benefits to redeem.")
                    .font(.subheadline).foregroundColor(PerxTheme.muted)
            } else if let locked = lookup.lockedBenefit, let b = lookup.benefits.first(where: { $0.slug == locked }) {
                HStack(spacing: 12) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 10)
                            .fill(PerxTheme.ember.opacity(0.12))
                            .frame(width: 40, height: 40)
                        Image(systemName: "ticket.fill").foregroundColor(PerxTheme.ember)
                    }
                    VStack(alignment: .leading, spacing: 2) {
                        Text(b.name).font(.system(size: 15, weight: .semibold)).foregroundColor(PerxTheme.text)
                        Text(b.category.capitalized).font(.caption2).foregroundColor(PerxTheme.faint)
                    }
                    Spacer()
                }
                .padding(12)
                .background(PerxTheme.ember.opacity(0.12))
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(PerxTheme.ember, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 10))

                Button { redeem() } label: {
                    Text("Confirm redemption")
                        .font(.system(size: 15, weight: .semibold))
                        .frame(maxWidth: .infinity).padding(.vertical, 14)
                        .background(PerxTheme.emberGradient)
                        .foregroundColor(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            } else {
                Text("Select benefit to redeem")
                    .font(.system(size: 12, weight: .semibold)).foregroundColor(PerxTheme.faint)
                VStack(spacing: 8) {
                    ForEach(lookup.benefits) { b in
                        Button { selectedSlug = b.slug } label: {
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(b.name).font(.system(size: 14, weight: .semibold)).foregroundColor(PerxTheme.text)
                                    Text(b.category.capitalized).font(.caption2).foregroundColor(PerxTheme.faint)
                                }
                                Spacer()
                                if selectedSlug == b.slug {
                                    Image(systemName: "checkmark.circle.fill").foregroundColor(PerxTheme.ember)
                                }
                            }
                            .padding(12)
                            .background(selectedSlug == b.slug ? PerxTheme.ember.opacity(0.12) : PerxTheme.bgElevated)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(selectedSlug == b.slug ? PerxTheme.ember : PerxTheme.line, lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                        .buttonStyle(.plain)
                    }
                }

                Button { redeem() } label: {
                    Text("Confirm redemption")
                        .font(.system(size: 15, weight: .semibold))
                        .frame(maxWidth: .infinity).padding(.vertical, 14)
                        .background(PerxTheme.emberGradient)
                        .foregroundColor(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .disabled(selectedSlug == nil)
            }

            Button("Scan again", action: reset)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(PerxTheme.muted)
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var successView: some View {
        VStack(spacing: 14) {
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 48)).foregroundColor(PerxTheme.success)
            Text("Redeemed").font(.system(size: 20, weight: .bold, design: .serif)).foregroundColor(PerxTheme.text)
            if let lookup, let slug = selectedSlug, let b = lookup.benefits.first(where: { $0.slug == slug }) {
                Text("\(b.name) for \(lookup.employee.name)")
                    .font(.subheadline).foregroundColor(PerxTheme.muted)
            }
            Button("Scan next", action: reset)
                .font(.system(size: 14, weight: .semibold))
                .padding(.horizontal, 16).padding(.vertical, 10)
                .background(PerxTheme.bgElevated2)
                .foregroundColor(PerxTheme.ember)
                .clipShape(Capsule())
        }
    }

    private var errorView: some View {
        VStack(spacing: 14) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 40)).foregroundColor(PerxTheme.danger)
            Text(errorMessage ?? "Something went wrong")
                .font(.subheadline).foregroundColor(PerxTheme.muted)
                .multilineTextAlignment(.center).padding(.horizontal, 30)
            Button("Scan again", action: reset)
                .font(.system(size: 14, weight: .semibold))
                .padding(.horizontal, 16).padding(.vertical, 10)
                .background(PerxTheme.bgElevated2)
                .foregroundColor(PerxTheme.ember)
                .clipShape(Capsule())
        }
    }

    private func redeem() {
        guard let token = scannedToken, let slug = selectedSlug else { return }
        phase = .redeeming
        Task {
            do {
                _ = try await API.shared.redeemCard(token: token, providerSlug: slug)
                phase = .success
            } catch {
                errorMessage = friendlyMessage(error)
                phase = .error
            }
        }
    }

    private func reset() {
        scannedToken = nil
        lookup = nil
        selectedSlug = nil
        errorMessage = nil
        phase = .scanning
    }

    private func friendlyMessage(_ error: Error) -> String {
        switch (error as? APIError)?.serverCode {
        case "invalid_or_expired_token": return "This code is invalid or expired — ask them to reopen their card."
        case "token_already_used": return "This code has already been redeemed."
        case "employee_not_found": return "No matching member found."
        case "benefit_not_active_for_employee": return "This member doesn't have that benefit active."
        default: return (error as? APIError)?.errorDescription ?? "Something went wrong."
        }
    }
}

// MARK: - Camera scanner

struct QRScannerView: UIViewControllerRepresentable {
    var onCode: (String) -> Void

    func makeUIViewController(context: Context) -> ScannerViewController {
        let vc = ScannerViewController()
        vc.onCode = onCode
        return vc
    }

    func updateUIViewController(_ uiViewController: ScannerViewController, context: Context) {}
}

final class ScannerViewController: UIViewController, AVCaptureMetadataOutputObjectsDelegate {
    var onCode: ((String) -> Void)?
    private let session = AVCaptureSession()
    private let sessionQueue = DispatchQueue(label: "perx.scanner.session")
    private var didEmit = false
    private var isConfigured = false
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var permissionLabel: UILabel?

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        requestAccessAndStart()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        didEmit = false
        sessionQueue.async {
            if self.isConfigured, !self.session.isRunning {
                self.session.startRunning()
            }
        }
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        sessionQueue.async {
            if self.session.isRunning { self.session.stopRunning() }
        }
    }

    private func requestAccessAndStart() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            sessionQueue.async { self.configureAndStart() }
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                DispatchQueue.main.async {
                    if granted {
                        self.sessionQueue.async { self.configureAndStart() }
                    } else {
                        self.showPermissionDenied()
                    }
                }
            }
        case .denied, .restricted:
            showPermissionDenied()
        @unknown default:
            showPermissionDenied()
        }
    }

    private func showPermissionDenied() {
        let label = UILabel()
        label.text = "Camera access is off.\nEnable it in Settings to scan codes."
        label.textColor = .white
        label.numberOfLines = 0
        label.textAlignment = .center
        label.font = .systemFont(ofSize: 14, weight: .semibold)
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: view.centerYAnchor, constant: -20),
            label.leadingAnchor.constraint(greaterThanOrEqualTo: view.leadingAnchor, constant: 30),
            label.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor, constant: -30),
        ])

        let button = UIButton(type: .system)
        button.setTitle("Open Settings", for: .normal)
        button.setTitleColor(.white, for: .normal)
        button.backgroundColor = UIColor.white.withAlphaComponent(0.18)
        button.layer.cornerRadius = 16
        button.titleLabel?.font = .systemFont(ofSize: 14, weight: .semibold)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.addAction(UIAction { _ in
            if let url = URL(string: UIApplication.openSettingsURLString) {
                UIApplication.shared.open(url)
            }
        }, for: .touchUpInside)
        view.addSubview(button)
        NSLayoutConstraint.activate([
            button.topAnchor.constraint(equalTo: label.bottomAnchor, constant: 16),
            button.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            button.widthAnchor.constraint(equalToConstant: 160),
            button.heightAnchor.constraint(equalToConstant: 36),
        ])
        permissionLabel = label
    }

    private func configureAndStart() {
        guard let device = AVCaptureDevice.default(for: .video),
              let input = try? AVCaptureDeviceInput(device: device),
              session.canAddInput(input) else { return }
        session.beginConfiguration()
        session.addInput(input)

        let output = AVCaptureMetadataOutput()
        guard session.canAddOutput(output) else {
            session.commitConfiguration()
            return
        }
        session.addOutput(output)
        output.setMetadataObjectsDelegate(self, queue: .main)
        output.metadataObjectTypes = [.qr]
        session.commitConfiguration()
        isConfigured = true

        DispatchQueue.main.async {
            let preview = AVCaptureVideoPreviewLayer(session: self.session)
            preview.videoGravity = .resizeAspectFill
            preview.frame = self.view.bounds
            self.view.layer.insertSublayer(preview, at: 0)
            self.previewLayer = preview
        }
        session.startRunning()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewLayer?.frame = view.bounds
    }

    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        guard !didEmit,
              let obj = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
              obj.type == .qr,
              let value = obj.stringValue else { return }
        didEmit = true
        onCode?(value)
    }
}
