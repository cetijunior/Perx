import SwiftUI
import MapKit

// MARK: - Deals Engine
// A live, AI-style partner-discovery console for admins. Real MapKit map of Tirana
// with the office and every partner pinned at its location; "Auto-discover" scans the
// city and drops freshly-found partners onto the map in real time. Each partner is
// scored against what the team already loves (category demand + rating + proximity).

// Office anchor — central Tirana (Skanderbeg Square area).
private let officeCoordinate = CLLocationCoordinate2D(latitude: 41.3275, longitude: 19.8187)

// The catalog stores positions on a 0–100 design grid. Project that onto a few-km
// box around the office so pins land on real streets.
private func mapCoordinate(for p: MapPoint) -> CLLocationCoordinate2D {
    let latSpan = 0.050, lonSpan = 0.068
    return CLLocationCoordinate2D(
        latitude: officeCoordinate.latitude + (50 - p.y) / 100 * latSpan,
        longitude: officeCoordinate.longitude + (p.x - 50) / 100 * lonSpan
    )
}

private struct DiscoveredDeal: Identifiable {
    let id: String
    let name: String
    let category: String
    let cost: Double
    let rating: Double
    let blurb: String
    let map: MapPoint
}

private let extraDiscovered: [DiscoveredDeal] = [
    DiscoveredDeal(id: "newpartner-1", name: "Bllok Ramen", category: "food", cost: 1700, rating: 4.6, blurb: "Fresh ramen bar, perfect lunch run.", map: MapPoint(x: 64, y: 64)),
    DiscoveredDeal(id: "newpartner-2", name: "Skyline Padel", category: "sport", cost: 2400, rating: 4.7, blurb: "Padel courts on the roof.", map: MapPoint(x: 26, y: 50)),
    DiscoveredDeal(id: "newpartner-3", name: "Calm Studio", category: "wellness", cost: 2800, rating: 4.5, blurb: "Sound baths & breathwork.", map: MapPoint(x: 78, y: 22)),
    DiscoveredDeal(id: "newpartner-4", name: "CodeAcademy AL", category: "learning", cost: 5500, rating: 4.8, blurb: "Evening web-dev bootcamps.", map: MapPoint(x: 18, y: 78)),
    DiscoveredDeal(id: "newpartner-5", name: "Riviera Escapes", category: "travel", cost: 4800, rating: 4.7, blurb: "Curated Albanian Riviera getaways.", map: MapPoint(x: 84, y: 70)),
    DiscoveredDeal(id: "newpartner-6", name: "Lumo Dental", category: "health", cost: 3200, rating: 4.9, blurb: "Modern dental & whitening clinic.", map: MapPoint(x: 36, y: 20)),
]

private struct RankedDeal: Identifiable {
    let id: String
    let name: String
    let category: String
    let cost: Double
    let rating: Double
    let blurb: String
    let map: MapPoint
    let score: Int
    let usage: Int
    let distance: Double
    let isNew: Bool
    var coordinate: CLLocationCoordinate2D { mapCoordinate(for: map) }
}

private let dealCategories = ["wellness", "food", "sport", "travel", "learning", "selfcare", "health"]

struct DealsEngineView: View {
    @EnvironmentObject var session: SessionStore

    @State private var scanning = false
    @State private var discovered: [DiscoveredDeal] = []
    @State private var invited: Set<String> = []
    @State private var filterCategory: String = "all"
    @State private var radius: Double = 100
    @State private var minScore: Double = 50
    @State private var selectedId: String?
    @State private var camera: MapCameraPosition = .region(
        MKCoordinateRegion(center: officeCoordinate,
                           span: MKCoordinateSpan(latitudeDelta: 0.062, longitudeDelta: 0.085))
    )
    @State private var pulse = false

    /// Team category demand — how many active benefits, across all employees, fall in each category.
    private var categoryWeights: [String: Double] {
        var counts: [String: Double] = [:]
        for emp in session.allEmployees {
            for slug in emp.activeBenefits {
                guard let cat = session.provider(slug: slug)?.category else { continue }
                counts[cat, default: 0] += 1
            }
        }
        return counts
    }

    private func distanceFromOffice(_ p: MapPoint) -> Double {
        let dx = p.x - 50, dy = p.y - 50
        return (dx * dx + dy * dy).squareRoot() / 70
    }

    private var ranked: [RankedDeal] {
        let weights = categoryWeights
        let totalWeight = max(weights.values.reduce(0, +), 1)

        let base: [(id: String, name: String, category: String, cost: Double, rating: Double, blurb: String, map: MapPoint, isNew: Bool)] =
            session.providers.map { ($0.slug, $0.name, $0.category, $0.cost, $0.rating ?? 4.5, $0.blurb ?? "", $0.map ?? MapPoint(x: 50, y: 50), false) }
            + discovered.map { ($0.id, $0.name, $0.category, $0.cost, $0.rating, $0.blurb, $0.map, true) }

        return base.map { item in
            let w = (weights[item.category] ?? 0) / totalWeight
            let dist = distanceFromOffice(item.map)
            let ratingPart = (item.rating - 4) * 10
            let distPart = (1 - dist) * 18
            let popPart = w * 100 * 0.55
            let rawScore: Double = 40 + popPart + ratingPart + distPart
            let score: Int = max(15, min(99, Int(rawScore.rounded())))
            let usageJitter: Int = Int(item.id.hashValue.magnitude % 7)
            let usageBase: Int = Int((Double(score) * 0.8).rounded())
            let usage: Int = min(95, usageBase + usageJitter)
            let distance: Double = (dist * 4.2 * 10).rounded() / 10
            return RankedDeal(id: item.id, name: item.name, category: item.category, cost: item.cost, rating: item.rating, blurb: item.blurb, map: item.map, score: score, usage: usage, distance: distance, isNew: item.isNew)
        }.sorted { $0.score > $1.score }
    }

    private var visible: [RankedDeal] {
        ranked.filter { d in
            (filterCategory == "all" || d.category == filterCategory) &&
            d.score >= Int(minScore) &&
            distanceFromOffice(d.map) * 100 <= radius
        }
    }

    private var selected: RankedDeal? { ranked.first { $0.id == selectedId } }
    private var newCount: Int { ranked.filter { $0.isNew }.count }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    header
                    mapPanel
                    filterPanel

                    if let selected {
                        selectedCard(selected)
                    }

                    HStack {
                        SectionHeader("Ranked partners")
                        Spacer()
                        Text("\(visible.count) shown").font(.caption2).foregroundColor(PerxTheme.faint)
                    }
                    if visible.isEmpty {
                        EmptyCard(icon: "tag", title: "No partners match these filters.")
                    } else {
                        ForEach(visible) { d in
                            Button { select(d) } label: { rankedRow(d) }
                                .buttonStyle(.plain)
                        }
                    }
                }
                .padding(20)
            }
            .background(PerxTheme.bg.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) { PerxLogoTitle() }
            }
            .refreshable { await session.refreshProviders() }
            .onAppear { pulse = true }
        }
    }

    // MARK: Header

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 9).fill(PerxTheme.emberGradient).frame(width: 36, height: 36)
                        .shadow(color: PerxTheme.ember.opacity(0.35), radius: 10, x: 0, y: 4)
                    Image(systemName: "dot.radiowaves.left.and.right").font(.system(size: 15, weight: .semibold)).foregroundColor(.white)
                }
                Text("Deals Engine").font(.system(size: 24, weight: .bold, design: .serif)).foregroundColor(PerxTheme.text)
                Spacer()
                Text("\(ranked.count) partners")
                    .font(.system(size: 11, weight: .semibold))
                    .padding(.horizontal, 9).padding(.vertical, 5)
                    .background(Capsule().fill(PerxTheme.bgElevated2))
                    .foregroundColor(PerxTheme.muted)
            }
            Text("AI-ranked local partners, scored against what your team already loves.")
                .font(.caption).foregroundColor(PerxTheme.muted)

            Button { autoDiscover() } label: {
                HStack(spacing: 7) {
                    if scanning {
                        ProgressView().tint(.white).scaleEffect(0.8)
                        Text("Scanning Tirana\u{2026}")
                    } else {
                        Image(systemName: "sparkles")
                        Text("Auto-discover partners")
                    }
                }
                .font(.system(size: 14, weight: .semibold))
                .frame(maxWidth: .infinity).padding(.vertical, 13)
                .background(PerxTheme.emberGradient)
                .foregroundColor(.white)
                .clipShape(RoundedRectangle(cornerRadius: 11))
                .shadow(color: PerxTheme.ember.opacity(0.32), radius: 12, x: 0, y: 5)
            }
            .disabled(scanning)
        }
    }

    // MARK: Live map

    private var mapPanel: some View {
        Map(position: $camera, interactionModes: [.pan, .zoom]) {
            Annotation("Your office", coordinate: officeCoordinate, anchor: .center) {
                officePin
            }
            ForEach(visible) { d in
                Annotation(d.name, coordinate: d.coordinate, anchor: .bottom) {
                    partnerPin(d)
                }
                .annotationTitles(.hidden)
            }
        }
        .mapStyle(.standard(elevation: .flat, pointsOfInterest: .excludingAll, showsTraffic: false))
        .frame(height: 290)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(PerxTheme.line, lineWidth: 1))
        .overlay(alignment: .topLeading) { mapLegend }
        .overlay(alignment: .bottomTrailing) {
            if scanning {
                HStack(spacing: 6) {
                    Image(systemName: "antenna.radiowaves.left.and.right").font(.system(size: 10, weight: .bold))
                    Text("Live scan").font(.system(size: 10, weight: .bold))
                }
                .padding(.horizontal, 9).padding(.vertical, 5)
                .background(.ultraThinMaterial, in: Capsule())
                .foregroundColor(PerxTheme.ember)
                .padding(10)
            }
        }
        .shadow(color: .black.opacity(0.08), radius: 12, x: 0, y: 6)
    }

    private var mapLegend: some View {
        Text("TIRANA \u{00B7} PARTNER NETWORK")
            .font(.system(size: 9, weight: .bold)).tracking(0.8)
            .padding(.horizontal, 8).padding(.vertical, 4)
            .background(.ultraThinMaterial, in: Capsule())
            .foregroundColor(PerxTheme.text)
            .padding(10)
    }

    private var officePin: some View {
        ZStack {
            if scanning {
                Circle()
                    .stroke(PerxTheme.ember.opacity(0.5), lineWidth: 2)
                    .frame(width: 44, height: 44)
                    .scaleEffect(pulse ? 2.6 : 1)
                    .opacity(pulse ? 0 : 0.8)
                    .animation(.easeOut(duration: 1.6).repeatForever(autoreverses: false), value: pulse)
            }
            VStack(spacing: 2) {
                ZStack {
                    RoundedRectangle(cornerRadius: 8).fill(PerxTheme.emberGradient).frame(width: 30, height: 30)
                        .shadow(color: PerxTheme.ember.opacity(0.5), radius: 6, y: 2)
                    Image(systemName: "building.2.fill").font(.system(size: 13, weight: .semibold)).foregroundColor(.white)
                }
                Text("Office")
                    .font(.system(size: 9, weight: .bold))
                    .padding(.horizontal, 5).padding(.vertical, 1)
                    .background(.ultraThinMaterial, in: Capsule())
                    .foregroundColor(PerxTheme.text)
            }
        }
    }

    private func partnerPin(_ d: RankedDeal) -> some View {
        let isSelected = selectedId == d.id
        let color = PerxTheme.categoryColor(d.category)
        return VStack(spacing: 2) {
            if isSelected {
                Text(d.name)
                    .font(.system(size: 10, weight: .bold))
                    .padding(.horizontal, 7).padding(.vertical, 3)
                    .background(.ultraThinMaterial, in: Capsule())
                    .foregroundColor(PerxTheme.text)
                    .fixedSize()
                    .transition(.scale.combined(with: .opacity))
            }
            ZStack {
                Circle()
                    .fill(LinearGradient(colors: [color, color.opacity(0.7)], startPoint: .top, endPoint: .bottom))
                    .frame(width: isSelected ? 24 : 16, height: isSelected ? 24 : 16)
                    .overlay(Circle().stroke(.white, lineWidth: 2))
                    .shadow(color: color.opacity(0.7), radius: isSelected ? 8 : 3, y: 1)
                if d.isNew {
                    Circle().fill(PerxTheme.gold)
                        .frame(width: 7, height: 7)
                        .overlay(Circle().stroke(.white, lineWidth: 1))
                        .offset(x: isSelected ? 9 : 6, y: isSelected ? -9 : -6)
                }
            }
        }
        .onTapGesture { select(d) }
        .animation(.spring(response: 0.32, dampingFraction: 0.7), value: selectedId)
    }

    // MARK: Filters

    private var filterPanel: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader("Filters")
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    filterPill("all", label: "All")
                    ForEach(dealCategories, id: \.self) { c in
                        filterPill(c, label: c.capitalized)
                    }
                }
            }
            VStack(alignment: .leading, spacing: 4) {
                Text("Radius: \(Int(radius))%").font(.caption2).foregroundColor(PerxTheme.faint)
                Slider(value: $radius, in: 20...100).tint(PerxTheme.ember)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text("Min match score: \(Int(minScore))").font(.caption2).foregroundColor(PerxTheme.faint)
                Slider(value: $minScore, in: 0...95).tint(PerxTheme.ember)
            }
        }
        .perxCard()
    }

    private func filterPill(_ id: String, label: String) -> some View {
        Button { filterCategory = id } label: {
            HStack(spacing: 5) {
                if id != "all" {
                    Circle().fill(PerxTheme.categoryColor(id)).frame(width: 7, height: 7)
                }
                Text(label).font(.system(size: 12, weight: .medium))
            }
            .padding(.horizontal, 10).padding(.vertical, 6)
            .background(filterCategory == id ? PerxTheme.ember.opacity(0.18) : PerxTheme.bgElevated2)
            .foregroundColor(filterCategory == id ? PerxTheme.ember : PerxTheme.muted)
            .overlay(Capsule().stroke(filterCategory == id ? PerxTheme.ember : PerxTheme.line, lineWidth: 1))
            .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }

    // MARK: Selected card

    private func selectedCard(_ d: RankedDeal) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                LogoChip(name: d.name, size: 48)
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text(d.name).font(.system(size: 15, weight: .semibold)).foregroundColor(PerxTheme.text)
                        if d.isNew { newBadge }
                    }
                    HStack(spacing: 6) {
                        categoryBadge(d.category)
                        Label(String(format: "%.1f", d.rating), systemImage: "star.fill")
                            .font(.system(size: 10, weight: .semibold)).foregroundColor(PerxTheme.gold)
                    }
                }
                Spacer()
            }
            Text(d.blurb).font(.caption).foregroundColor(PerxTheme.muted)

            // Match-score meter
            VStack(alignment: .leading, spacing: 5) {
                HStack {
                    Text("AI MATCH").font(.system(size: 9, weight: .bold)).tracking(0.8).foregroundColor(PerxTheme.faint)
                    Spacer()
                    Text("\(d.score)%").font(.system(size: 13, weight: .bold)).foregroundColor(PerxTheme.gold)
                }
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule().fill(PerxTheme.bg).frame(height: 7)
                        Capsule().fill(LinearGradient(colors: [PerxTheme.gold, PerxTheme.ember], startPoint: .leading, endPoint: .trailing))
                            .frame(width: geo.size.width * CGFloat(d.score) / 100, height: 7)
                    }
                }
                .frame(height: 7)
            }

            HStack(spacing: 14) {
                metric(String(format: "%.1f km", d.distance), "mappin.and.ellipse")
                metric("\(d.usage)% used", "chart.line.uptrend.xyaxis")
                metric("\(Int(d.cost).formatted()) LEK", "tag.fill")
                Spacer()
                Button { invited.insert(d.id) } label: {
                    Group {
                        if invited.contains(d.id) {
                            Label("Invited", systemImage: "checkmark")
                        } else {
                            Label("Invite", systemImage: "paperplane.fill")
                        }
                    }
                    .font(.system(size: 12, weight: .semibold))
                    .padding(.horizontal, 12).padding(.vertical, 8)
                    .background {
                        if invited.contains(d.id) {
                            PerxTheme.success.opacity(0.15)
                        } else {
                            PerxTheme.emberGradient
                        }
                    }
                    .foregroundColor(invited.contains(d.id) ? PerxTheme.success : .white)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
                .disabled(invited.contains(d.id))
            }
        }
        .padding(14)
        .background(PerxTheme.bgElevated)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(PerxTheme.ember.opacity(0.4), lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .shadow(color: PerxTheme.ember.opacity(0.16), radius: 14, x: 0, y: 6)
        .transition(.move(edge: .top).combined(with: .opacity))
    }

    private func metric(_ text: String, _ icon: String) -> some View {
        Label(text, systemImage: icon)
            .font(.system(size: 11, weight: .medium)).foregroundColor(PerxTheme.faint)
            .labelStyle(.titleAndIcon)
    }

    private var newBadge: some View {
        Text("NEW")
            .font(.system(size: 9, weight: .bold)).tracking(0.5)
            .padding(.horizontal, 6).padding(.vertical, 2)
            .background(Capsule().fill(PerxTheme.gold))
            .foregroundColor(.white)
    }

    private func categoryBadge(_ category: String) -> some View {
        let c = PerxTheme.categoryColor(category)
        return Text(category.capitalized)
            .font(.system(size: 10, weight: .medium))
            .padding(.horizontal, 8).padding(.vertical, 3)
            .background(c.opacity(0.14))
            .foregroundColor(c)
            .clipShape(Capsule())
    }

    // MARK: Ranked row

    private func rankedRow(_ d: RankedDeal) -> some View {
        HStack(spacing: 10) {
            LogoChip(name: d.name, size: 38)
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(d.name).font(.system(size: 13, weight: .semibold)).foregroundColor(PerxTheme.text).lineLimit(1)
                    if d.isNew { newBadge }
                }
                HStack(spacing: 6) {
                    categoryBadge(d.category)
                    Text("\(d.distance, specifier: "%.1f") km").font(.caption2).foregroundColor(PerxTheme.faint)
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 0) {
                Text("\(d.score)").font(.system(size: 17, weight: .bold)).foregroundColor(PerxTheme.gold)
                Text("MATCH").font(.system(size: 8, weight: .semibold)).tracking(0.6).foregroundColor(PerxTheme.faint)
            }
        }
        .padding(10)
        .background(selectedId == d.id ? PerxTheme.ember.opacity(0.10) : PerxTheme.bgElevated2)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(selectedId == d.id ? PerxTheme.ember.opacity(0.5) : PerxTheme.line, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    // MARK: Actions

    private func select(_ d: RankedDeal) {
        withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
            selectedId = d.id
            camera = .region(MKCoordinateRegion(
                center: d.coordinate,
                span: MKCoordinateSpan(latitudeDelta: 0.03, longitudeDelta: 0.04)
            ))
        }
    }

    private func autoDiscover() {
        scanning = true
        selectedId = nil
        withAnimation(.easeInOut(duration: 0.8)) {
            camera = .region(MKCoordinateRegion(center: officeCoordinate,
                                                span: MKCoordinateSpan(latitudeDelta: 0.075, longitudeDelta: 0.1)))
        }
        Task {
            // Drop newly-found partners onto the live map one at a time for a real "discovery" feel.
            let existingIds = Set(discovered.map(\.id))
            let toAdd = extraDiscovered.filter { !existingIds.contains($0.id) }
            for deal in toAdd {
                try? await Task.sleep(nanoseconds: 600_000_000)
                await MainActor.run {
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                        discovered.append(deal)
                    }
                }
            }
            try? await Task.sleep(nanoseconds: 400_000_000)
            await MainActor.run { scanning = false }
        }
    }
}
