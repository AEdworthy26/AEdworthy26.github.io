// rics-data.js
// Auto-updated 2026-04-14 — do not edit manually

var RICS_DATA = {
  date: "2026-04-14",
  topic: "Benchmark Land Value (BLV) vs Existing Use Value (EUV+) in Affordable Housing Viability Assessments",
  module: "Development Appraisals",
  level: 3,
  apc_competency: "Development Appraisals (Level 3)",
  focus: "This lesson examines the technical and policy distinction between Benchmark Land Value and Existing Use Value Plus in the context of housing association-led viability assessments. It covers how BLV is calculated, challenged, and defended in S106 negotiations, and how Latimer/Clarion's affordable housing pipeline interacts with the NPPF 2024 and PPG viability framework. Mastery of this topic is essential for Level 3 candidates who regularly manage appraisals and negotiate with LPAs on tenure mix and grant funding stacks.",
  image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop",
  content: [
    {
      type: "paragraph",
      text: "Viability in the planning system is fundamentally a land value argument. When an LPA requires 35–40% affordable housing on a Latimer scheme, the question of whether a scheme is viable pivots on what the landowner needs to receive to release the site. That threshold — the Benchmark Land Value — is where development economics and planning policy collide most intensely. Since the 2019 PPG updates and reinforced by NPPF 2024, BLV is no longer simply 'what a comparable site sold for recently.' It is a policy-constrained figure, anchored to the site's existing lawful use rather than its hope value, and practitioners who conflate BLV with Market Value consistently over-estimate what schemes can afford to pay for land, thereby undermining affordable housing delivery."
    },
    {
      type: "heading",
      text: "The Policy Framework: NPPF 2024 and PPG Viability"
    },
    {
      type: "paragraph",
      text: "Paragraph 58 of NPPF 2024 states that viability should not be used to undermine policy requirements without genuine justification. The PPG on Viability (updated iteratively since 2018) is unambiguous: Benchmark Land Value should be based on the Existing Use Value of the site, plus a 'premium' sufficient to incentivise a reasonable landowner to sell. This premium is not a market-derived uplift but rather a modest, policy-consistent addition — typically 10–30% above EUV in residential conversion contexts, though the exact margin depends on local market conditions, the nature of the existing use, and the LPA's adopted position. The critical point for APC candidates is that PPG explicitly states BLV should NOT incorporate hope value or reflect the full planning uplift that affordable housing policy is intended to capture."
    },
    {
      type: "key_term",
      term: "Benchmark Land Value (BLV)",
      text: "The minimum land value a landowner would need to receive to voluntarily release a site for development, as defined in the PPG. It must be based on Existing Use Value (EUV) plus a reasonable seller's premium. It is not the same as market value, and should not reflect planning hope value. In practice, BLV sets the floor of the landowner's position in viability negotiations — if GDV minus costs minus developer's return cannot exceed BLV, the scheme is argued to be unviable."
    },
    {
      type: "key_term",
      term: "Existing Use Value Plus (EUV+)",
      text: "A methodology for calculating BLV by starting with the site's value in its current lawful use (e.g. brownfield industrial at £500k/acre) and adding a seller's incentive premium. EUV+ is the PPG-preferred approach and is used by the majority of LPA-appointed viability consultants (e.g. BNP Paribas, Avison Young, HDH Planning) in Section 106 negotiations. For housing associations acquiring regeneration sites, EUV is often low (former social housing, vacant employment land), which significantly strengthens the affordable housing case."
    },
    {
      type: "paragraph",
      text: "At Latimer, the distinction between BLV and Market Value has direct operational consequences. When appraising a regeneration site — say, a vacant former council estate in an LPA area with a 40% affordable housing policy — the land cost agreed in heads of terms may reflect a negotiated position between EUV+ and market expectations. If the vendor has priced in planning hope value (i.e. a price that assumes full market residential permission with 20% affordable), Latimer's appraisal team must model whether Homes England grant can bridge the viability gap, or whether the land price itself is the constraint. This is a genuinely different analytical problem to the commercial development context, because the grant stack is a legitimate input that can shift what BLV is achievable at."
    },
    {
      type: "heading",
      text: "EUV+ in Practice: Calculating the Benchmark"
    },
    {
      type: "paragraph",
      text: "The EUV+ calculation follows a structured sequence. First, establish the EUV: what is the site worth in its existing lawful use, ignoring any development potential? For a brownfield employment site in outer London, this might be £1.5m per acre based on comparable industrial transactions. Second, apply the seller's premium: PPG does not prescribe a fixed percentage, but district-level viability studies and appeal decisions typically reference 10–30% above EUV as a starting point, rising to 50%+ in high-value markets where the EUV itself is modest relative to residential values. Third, test the resulting BLV against the residual land value (RLV) generated by the scheme — if RLV exceeds BLV, the scheme supports the policy requirement; if it falls short, a viability case for reduced affordable housing or grant funding can be made."
    },
    {
      type: "callout",
      label: "APC Worked Example",
      text: "Latimer is appraising a 2.5-acre brownfield site in the Outer London Borough of Sutton. The existing use is light industrial (B2), with a freehold EUV of £1.8m per acre (£4.5m total). The LPA's adopted viability study suggests a seller's premium of 20%, giving a BLV of £5.4m. The proposed scheme is 120 units, 40% affordable (48 units — mix of social rent and shared ownership). Appraisal inputs: GDV of private units (72 @ £425k average) = £30.6m; GDV of affordable units at nil receipt (grant funded) = £0 private contribution; construction costs at £2,200/sqm NIA, total build £18.4m; professional fees, finance, and contingency = £3.8m; developer's return 17.5% on GDV (private only) = £5.4m. Residual land value = £30.6m - £18.4m - £3.8m - £5.4m = £3.0m. The RLV of £3.0m is BELOW the BLV of £5.4m, confirming a viability gap of £2.4m. Homes England AHP grant at £80,000 per affordable unit (48 units) = £3.84m. With grant applied, adjusted RLV = £3.0m + £3.84m = £6.84m, which EXCEEDS BLV — the scheme is viable with grant. This is precisely the analysis Latimer would present to an LPA in a Section 106 negotiation to justify the grant-funded affordable housing model."
    },
    {
      type: "heading",
      text: "The Developer's Return and Its Interaction with BLV"
    },
    {
      type: "paragraph",
      text: "One of the most contested elements in any viability assessment is the quantum of developer's profit deducted before arriving at the residual. RICS Guidance Note: Financial Viability in Planning (2019) acknowledges that profit benchmarks vary by risk profile, but industry practice for speculative residential typically runs at 17–20% on GDV or 20–25% on cost. For housing association-led schemes where Latimer acts as both developer and RP, the profit assumption is more nuanced: the development surplus feeds back into the HA's balance sheet rather than to a third-party investor, so some LPAs argue for a lower return threshold. Assessors frequently probe whether the profit figure used is consistent with the developer's actual risk and tenure — a fully grant-funded affordable scheme has lower market risk than a mixed-tenure speculative scheme, and the profit deduction should reflect this."
    },
    {
      type: "callout",
      label: "APC Tip — Common Examiner Challenge",
      text: "Assessors will ask: 'If you're a housing association and you're keeping the affordable units, why are you deducting 17.5% profit on private GDV in your viability case?' The correct answer distinguishes between the development phase return (compensating for construction and planning risk, regardless of who retains the asset) and the investment return on the affordable portfolio (assessed separately through ROCE or NPV analysis). You should also note that Homes England's AHP funding conditions require Latimer to demonstrate scheme viability at the point of grant approval — the profit assumption used must be defensible to both the LPA's viability consultant and Homes England's own appraisal review team. Using an inconsistently low profit to inflate RLV and then justify less affordable housing would be professionally unacceptable and inconsistent with RICS guidance."
    },
    {
      type: "heading",
      text: "BLV Challenges in LPA Negotiations: Tactics and Evidence"
    },
    {
      type: "paragraph",
      text: "When Latimer submits a viability appraisal in support of a planning application, the LPA will typically appoint an independent consultant (often under the Queen's Printer's Licence or a framework agreement) to review and challenge the inputs. The most common challenges centre on: (1) whether the EUV used is market-tested and based on genuine comparables; (2) whether the seller's premium applied is consistent with the LPA's adopted viability study; (3) whether the construction cost benchmark (typically BCIS median for the relevant building typology) is appropriate; and (4) whether the assumed GDV reflects achievable values rather than optimistic projections. Latimer's development managers need to anticipate all four lines of challenge and be prepared to defend each with independent evidence — BCIS data for costs, RICS Red Book valuations for GDV, and Land Registry transactions plus CBRE/JLL comparable evidence for EUV."
    },
    {
      type: "paragraph",
      text: "A frequently overlooked dimension is the role of the 'clawback' or late-stage review mechanism. Since the Planning Practice Guidance embedded review mechanisms as standard practice (para. 10-017), most LPAs now require a late-stage viability review triggered when a certain percentage of units are sold or a defined profit threshold is breached. For Latimer schemes, this means the BLV agreed at application stage may be tested again at practical completion — if land values have risen (as has been the case in most outer London and commuter-belt markets since 2020), the late-stage review could result in additional affordable housing contributions or an equivalent financial payment. Development managers must model this scenario in the original appraisal and negotiate a capped review mechanism in the Section 106 agreement."
    },
    {
      type: "key_term",
      term: "Late-Stage Viability Review",
      text: "A mechanism embedded in S106 agreements requiring reappraisal of scheme viability at a defined stage (typically 75% of private units sold or 18 months post-completion of superstructure). If outturn profit exceeds the agreed benchmark, additional affordable housing contributions are triggered. PPG requires these reviews to be proportionate — they should not deter development by creating excessive uncertainty, but should ensure the public sector captures value uplift where it occurs. For Latimer, structuring the review mechanism carefully (e.g. agreeing a profit collar above which contributions are shared 50/50 with the LPA) is a key S106 negotiation objective."
    },
    {
      type: "heading",
      text: "Grant Funding as a BLV Bridge: The Homes England Interface"
    },
    {
      type: "paragraph",
      text: "The interaction between Homes England AHP grant and BLV is one of the most technically sophisticated aspects of affordable housing viability. From a pure residual appraisal perspective, grant income increases the RLV and therefore the amount available to pay for land — in theory, allowing schemes to meet a higher BLV while still delivering the required affordable housing quantum. However, Homes England's own Value for Money assessment requires that grant does not simply subsidise landowners' hope value expectations. The AHP funding conditions (Affordable Homes Programme 2021–2026 Prospectus) require RPs to demonstrate that grant is funding the affordable housing element specifically, not inflating land values paid to vendors. This creates a genuine tension in negotiations where land vendors know that Latimer, as an RP with AHP allocations, has access to grant that a private housebuilder would not — and they price accordingly."
    },
    {
      type: "callout",
      label: "APC Tip — Grant and Land Price Discipline",
      text: "If an assessor asks how Latimer prevents grant from simply inflating land prices, the answer has several components: (1) Latimer runs a 'grant-excluded' appraisal alongside the grant-included version, and the land price agreed with vendors is based on the grant-excluded RLV — grant uplift is ring-fenced to affordable housing delivery, not passed to the landowner; (2) Homes England's due diligence on AHP grant applications includes a review of the land cost relative to EUV+, and overpaying for land is a grant condition risk; (3) Latimer's internal investment committee requires that the land acquisition price does not exceed the BLV as calculated on EUV+ methodology, regardless of market comparables. This discipline is both a policy compliance requirement and a commercial protection against overpaying in a rising market."
    },
    {
      type: "heading",
      text: "NPPF 2024 Changes and Implications for BLV Methodology"
    },
    {
      type: "paragraph",
      text: "The December 2024 revision of the NPPF introduced several provisions with direct viability implications. Most significantly, the strengthened First Homes exception site policy and the revised affordable housing definition (re-including social rent as the primary tenure) have shifted the cost profile of affordable housing obligations. Social rent units have a significantly lower capital receipt than shared ownership or Affordable Rent, meaning the affordable housing 'cost' in the viability appraisal is higher per unit. For Latimer schemes targeting a high proportion of social rent (consistent with Clarion's core social purpose), this increases the viability gap and places greater reliance on AHP grant or a lower land acquisition cost to make schemes work. NPPF 2024 para. 63 also reinforces that where a viability assessment has been agreed at plan-making stage and is embedded in adopted policy, application-stage viability should only depart from it in genuinely exceptional circumstances — this limits the scope for landowners and developers to re-run viability arguments on a scheme-by-scheme basis."
    },
    {
      type: "paragraph",
      text: "For APC candidates at Level 3, the ability to critically evaluate a viability appraisal — rather than just construct one — is the defining competency. This means being able to identify when a BLV assumption is inflated beyond PPG guidance, when construction costs are unrealistically low, when a GDV is based on unachievable values, and when a grant assumption is not yet confirmed and therefore speculative. In a Latimer context, this critical appraisal skill is deployed daily: when reviewing vendor-submitted appraisals during land acquisition, when interrogating consultant appraisals on joint venture schemes, and when preparing evidence for appeal. The assessor will expect you to demonstrate not just that you can build a model, but that you understand the assumptions behind it and can defend or challenge each one with reference to policy, guidance, and market evidence."
    }
  ],
  summary: [
    "BLV must be grounded in EUV+ methodology per PPG — it should NOT incorporate planning hope value, and any premium above EUV must be modest, policy-consistent, and evidenced by comparables from the LPA's adopted viability study.",
    "The residual land value test is the core mechanism: if RLV < BLV, a viability gap exists; Homes England AHP grant is the primary tool for bridging this gap in HA-led schemes, but grant must not be used to subsidise inflated land prices.",
    "Developer's profit assumptions must be calibrated to actual risk profile — for HA-led schemes with grant certainty and no speculative market exposure on affordable units, a reduced profit benchmark may be defensible, but must be consistent across both the LPA submission and the Homes England AHP appraisal.",
    "Late-stage review mechanisms are now standard in S106 agreements following PPG guidance — Latimer must model the review scenario at appraisal stage and negotiate a capped or collared mechanism to limit exposure to additional contributions if private values outperform projections.",
    "NPPF 2024 strengthens the plan-led viability position: where BLV methodology is embedded in an adopted local plan, application-stage viability departures require exceptional justification — this is both a risk and an opportunity for Latimer depending on the LPA's adopted policies."
  ],
  qa: [
    {
      q: "An LPA's viability consultant argues that your EUV for a former employment site should be £2.5m per acre, based on recent industrial transactions in the area. Your appraisal uses £1.8m per acre. How would you defend your position?",
      a: "I would defend the £1.8m/acre figure by reference to the specific characteristics of the subject site — its condition, site constraints, flood risk or contamination status, lease structure, and achievable rental tone relative to the comparables cited. If the LPA's comparables are for prime, well-configured industrial units in active employment areas, they may not be appropriate for a constrained, redundant site. I would commission an independent RICS Red Book EUV assessment to provide evidential weight, and cross-reference against the LPA's own adopted viability study to establish whether the £2.5m figure is consistent with their own BLV framework. PPG requires EUV to reflect the site's actual lawful use value, not aspirational employment land values."
    },
    {
      q: "How does Homes England's AHP grant interact with the viability appraisal you submit to an LPA, and what are the risks of inconsistency between the two?",
      a: "The AHP grant increases the scheme's RLV by providing additional income against the affordable housing element, effectively reducing the viability gap. However, the grant must be shown in the LPA viability appraisal as confirmed or highly probable — Homes England grant allocation letters or indicative AHP confirmations are the standard evidence. The key risk is inconsistency: if the LPA appraisal assumes grant at £80k/unit but the Homes England submission assumes a different level or tenure mix, the two models will give different viability outcomes. I manage this by running a single master appraisal model that feeds both submissions, with a clear audit trail. Homes England's own appraisal review also checks that the land cost is consistent with EUV+, so an inflated land price that 'passes' the LPA test may fail the Homes England value for money assessment."
    },
    {
      q: "A landowner argues that because Latimer, as an RP, has access to AHP grant that a private developer doesn't, the land price should reflect the higher value Latimer can unlock. How do you respond in heads of terms negotiation?",
      a: "This is a well-known tension in the affordable housing land market. My response would be that the AHP grant is provided by Homes England specifically to fund affordable housing delivery, not to increase land values — and Homes England's own funding conditions and value for money criteria require that RPs do not pay above EUV+ for land. Latimer's internal investment committee policy mirrors this: land acquisition is appraised on a grant-excluded basis, and the agreed price must be supportable without grant. I would also make clear that if the land price assumes grant income, it creates a circular dependency — the scheme only works if Latimer secures grant, which is not guaranteed and exposes both parties to risk. The PPG-consistent position is that grant creates affordable housing, not land value uplift."
    },
    {
      q: "Explain how a late-stage viability review mechanism works in practice, and how you would negotiate its terms in a Section 106 agreement for a Latimer scheme.",
      a: "A late-stage review is triggered at a defined event — typically when 75% of private units are sold or a set profit threshold is reached. At that point, the appraisal is rerun with actual outturn costs and revenues. If the revised profit exceeds the agreed benchmark (e.g. 20% on GDV), the surplus above the benchmark is shared — usually 50/50 between the developer and the LPA as additional affordable housing or an in-lieu payment. In negotiation, I would seek: (1) a clearly defined trigger event and timeline to avoid ambiguity; (2) an agreed methodology for the review appraisal, ideally referencing the RICS GN on Financial Viability in Planning; (3) a profit collar — contributions only triggered above, say, 22% on GDV — to provide a buffer against minor outperformance; (4) a cap on total additional contribution to protect Latimer's investment committee projections; and (5) exclusion of affordable housing receipts from the review income calculation to avoid penalising grant-funded delivery."
    },
    {
      q: "NPPF 2024 has strengthened the role of plan-making viability assessments. How does this affect Latimer's ability to challenge affordable housing requirements on individual applications?",
      a: "Under NPPF 2024 para. 63 and the associated PPG, where a Local Plan has been prepared with a robust viability assessment underpinning its affordable housing policy, application-stage viability assessments should be used only in genuinely exceptional circumstances — for example, where a specific site has unusual constraints not anticipated at plan stage. This limits Latimer's ability to use scheme-specific viability to negotiate down affordable housing percentages in LPAs with recently adopted plans. In practice, this means Latimer's land acquisition strategy must be more sensitive to LPA viability baselines at the point of land pricing — if a site can only work at 25% affordable but the plan requires 40%, the land price must reflect that constraint at acquisition, not be resolved through a post-planning viability argument. It also means Latimer should actively engage in plan-making processes (Regulation 18/19 consultations) to ensure that BLV methodologies adopted in Local Plan viability studies are policy-consistent and don't lock in unrealistic land cost assumptions."
    }
  ],
  news: [
    {
      tag: "Viability Policy",
      headline: "DLUHC Confirms PPG Viability Update to Align with NPPF 2024 Social Rent Prioritisation",
      body: "The Department for Levelling Up, Housing and Communities has confirmed that the Planning Practice Guidance on Viability will be updated in Q2 2026 to reflect NPPF 2024's prioritisation of social rent as the primary affordable tenure. The update is expected to clarify how social rent's lower capital receipt should be treated in BLV calculations, potentially reducing what landowners can expect to receive on sites with high affordable housing obligations. Housing associations including Clarion Housing Group have welcomed the move, arguing it will reduce the scope for viability gaming on regeneration sites."
    },
    {
      tag: "Homes England AHP",
      headline: "Homes England Issues Grant Condition Guidance on Land Cost Benchmarking for 2026–2031 Programme",
      body: "Homes England has published updated guidance for registered providers bidding into the 2026–2031 Affordable Homes Programme, including strengthened requirements on land cost benchmarking. RPs must now submit an independent EUV+ assessment alongside any land acquisition where the agreed price exceeds £1m, and must demonstrate that the purchase price is consistent with PPG Viability methodology. The guidance is intended to prevent grant subsidy from inflating land values and to ensure public investment translates directly into affordable housing delivery rather than landowner returns."
    },
    {
      tag: "Planning Viability",
      headline: "Appeal Decision Confirms EUV+ as Correct BLV Methodology, Rejects Market Value Approach",
      body: "A Planning Inspector has dismissed an appeal by a major housebuilder against a refusal to reduce affordable housing obligations on a 350-unit scheme in the South East, confirming that the appellant's use of market value comparables to set BLV was inconsistent with PPG. The Inspector's report, widely circulated among housing practitioners, reaffirms that BLV must be anchored to EUV+ and that market transactions — which inherently price in hope value — cannot substitute for an EUV-based assessment. The decision is expected to strengthen LPA positions in viability negotiations across the region."
    }
  ]
};
