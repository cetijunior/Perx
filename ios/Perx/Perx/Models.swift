import Foundation

struct User: Codable, Identifiable, Equatable {
    let id: String
    let email: String
    let name: String
    let role: String
    let company: String?
    let department: String?
    let budget: Double?
}

struct Provider: Codable, Identifiable, Equatable {
    var id: String { slug }
    let slug: String
    let name: String
    let category: String
    let cost: Double
    let cadence: String?
    let rating: Double?
    let blurb: String?
    let videoUrl: String?
    let posterUrl: String?
}

struct EmployeeProfile: Codable, Equatable {
    let id: String?
    let userId: String
    let activeBenefits: [String]
    let cart: [String]
    let bonus: Double?
}

struct BenefitRequest: Codable, Identifiable, Equatable {
    let id: String
    let userId: String
    let items: [String]
    let total: Double
    let status: String
    let createdAt: String?
}

struct LoginResponse: Codable {
    let token: String
    let user: User
}

struct MemberBenefit: Codable, Equatable, Identifiable {
    var id: String { slug }
    let slug: String
    let name: String
    let category: String
}

struct BenefitQRResponse: Codable, Equatable {
    let qrToken: String
    let expiresInSeconds: Int
    let benefit: MemberBenefit
}

struct CardLookupEmployee: Codable, Equatable {
    let name: String
    let department: String?
    let employeeId: String
}

struct CardLookupResponse: Codable, Equatable {
    let employee: CardLookupEmployee
    let benefits: [MemberBenefit]
    let lockedBenefit: String?
}

struct Redemption: Codable, Equatable {
    let id: String
    let providerSlug: String
}

struct RedeemResponse: Codable, Equatable { let redemption: Redemption }

struct ProvidersResponse: Codable { let providers: [Provider] }
struct EmployeeResponse: Codable { let employee: EmployeeProfile }
struct RequestsResponse: Codable { let requests: [BenefitRequest] }
struct RequestResponse: Codable { let request: BenefitRequest }
struct MeResponse: Codable { let user: User }
