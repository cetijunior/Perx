import Foundation

@MainActor
final class SessionStore: ObservableObject {
    @Published var user: User?
    @Published var providers: [Provider] = []
    @Published var employee: EmployeeProfile?
    @Published var requests: [BenefitRequest] = []
    @Published var error: String?
    @Published var loading: Bool = false

    func restore() async {
        guard API.shared.token != nil, user == nil else { return }
        do {
            self.user = try await API.shared.me()
            await refreshAll()
        } catch {
            API.shared.token = nil
        }
    }

    func login(email: String, password: String) async {
        loading = true; error = nil
        do {
            let res = try await API.shared.login(email: email, password: password)
            self.user = res.user
            await refreshAll()
        } catch {
            self.error = (error as? LocalizedError)?.errorDescription ?? "Login failed"
        }
        loading = false
    }

    func logout() {
        API.shared.token = nil
        user = nil
        employee = nil
        requests = []
    }

    func refreshAll() async {
        await refreshProviders()
        if user?.role == "employee" { await refreshEmployee() }
        await refreshRequests()
    }

    func refreshProviders() async {
        do { providers = try await API.shared.providers() } catch { self.error = error.localizedDescription }
    }

    func refreshEmployee() async {
        do { employee = try await API.shared.employeeMe() } catch { self.error = error.localizedDescription }
    }

    func refreshRequests() async {
        do { requests = try await API.shared.listRequests() } catch { self.error = error.localizedDescription }
    }

    func addToCart(_ slug: String) async {
        do { employee = try await API.shared.addToCart(slug: slug) } catch { self.error = error.localizedDescription }
    }

    func removeFromCart(_ slug: String) async {
        do { employee = try await API.shared.removeFromCart(slug: slug) } catch { self.error = error.localizedDescription }
    }

    func submitCart() async {
        guard let items = employee?.cart, !items.isEmpty else { return }
        do {
            _ = try await API.shared.submitRequest(items: items)
            for s in items { _ = try? await API.shared.removeFromCart(slug: s) }
            await refreshEmployee()
            await refreshRequests()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func decide(id: String, decision: String) async {
        do {
            _ = try await API.shared.decide(id: id, decision: decision)
            await refreshRequests()
        } catch { self.error = error.localizedDescription }
    }

    func provider(slug: String) -> Provider? { providers.first { $0.slug == slug } }

    var budgetSpent: Double {
        (employee?.activeBenefits ?? []).compactMap { provider(slug: $0)?.cost }.reduce(0, +)
    }
    var budgetTotal: Double { user?.budget ?? 30000 }
    var budgetRemaining: Double { max(0, budgetTotal - budgetSpent) }
    var budgetPct: Double { budgetTotal > 0 ? min(1, budgetSpent / budgetTotal) : 0 }
}
