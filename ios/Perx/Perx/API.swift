import Foundation

enum APIError: Error, LocalizedError {
    case http(Int, String)
    case decoding(Error)
    case transport(Error)

    var errorDescription: String? {
        switch self {
        case .http(let code, let body): return "HTTP \(code): \(body)"
        case .decoding(let e): return "Decoding error: \(e.localizedDescription)"
        case .transport(let e): return "Network error: \(e.localizedDescription)"
        }
    }
}

@MainActor
final class API {
    static let shared = API()

    var token: String? {
        get { UserDefaults.standard.string(forKey: "perx.token") }
        set {
            if let v = newValue { UserDefaults.standard.set(v, forKey: "perx.token") }
            else { UserDefaults.standard.removeObject(forKey: "perx.token") }
        }
    }

    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        return d
    }()

    func login(email: String, password: String) async throws -> LoginResponse {
        let res: LoginResponse = try await send("/auth/login", method: "POST", body: ["email": email, "password": password])
        token = res.token
        return res
    }

    func me() async throws -> User {
        let res: MeResponse = try await send("/auth/me", auth: true)
        return res.user
    }

    func providers() async throws -> [Provider] {
        let res: ProvidersResponse = try await send("/providers")
        return res.providers
    }

    func employeeMe() async throws -> EmployeeProfile {
        let res: EmployeeResponse = try await send("/employees/me", auth: true)
        return res.employee
    }

    func addToCart(slug: String) async throws -> EmployeeProfile {
        let res: EmployeeResponse = try await send("/employees/me/cart", method: "POST", body: ["slug": slug], auth: true)
        return res.employee
    }

    func removeFromCart(slug: String) async throws -> EmployeeProfile {
        let res: EmployeeResponse = try await send("/employees/me/cart/\(slug)", method: "DELETE", auth: true)
        return res.employee
    }

    func submitRequest(items: [String]) async throws -> BenefitRequest {
        let res: RequestResponse = try await send("/requests", method: "POST", body: ["items": items], auth: true)
        return res.request
    }

    func listRequests() async throws -> [BenefitRequest] {
        let res: RequestsResponse = try await send("/requests", auth: true)
        return res.requests
    }

    func decide(id: String, decision: String) async throws -> BenefitRequest {
        let res: RequestResponse = try await send("/requests/\(id)/decide", method: "POST", body: ["decision": decision], auth: true)
        return res.request
    }

    // MARK: - Core
    private func send<T: Decodable>(_ path: String, method: String = "GET", body: [String: Any]? = nil, auth: Bool = false) async throws -> T {
        var req = URLRequest(url: Config.apiBaseURL.appendingPathComponent(path))
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if auth, let token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        if let body { req.httpBody = try JSONSerialization.data(withJSONObject: body) }

        let (data, resp): (Data, URLResponse)
        do {
            (data, resp) = try await URLSession.shared.data(for: req)
        } catch {
            throw APIError.transport(error)
        }

        guard let http = resp as? HTTPURLResponse else {
            throw APIError.http(0, "no response")
        }
        guard (200..<300).contains(http.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? ""
            throw APIError.http(http.statusCode, body)
        }
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decoding(error)
        }
    }
}
