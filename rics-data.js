// rics-data.js
// Auto-updated 2026-05-02 — do not edit manually

var RICS_DATA = {
  date: "2026-05-02",
  topic: "CIL Liability, Exemptions and Charging Schedule Mechanics",
  module: "Legal and Regulatory Compliance",
  level: 2,
  apc_competency: "Legal/Regulatory Compliance (Level 2)",
  focus: "This lesson examines the Community Infrastructure Levy in granular detail — how charging schedules are structured, how liability is calculated on mixed-tenure schemes, and how exemptions (social housing relief, self-build, charitable) interact with clawback risk. For Alfie, CIL is a live transactional issue on every land acquisition and appraisal, directly affecting residual land value and cashflow timing on Latimer\'s mixed-tenure schemes.",
  image: "https://images.unsplash.com/photo-1742552096036-53e5b7d9a364?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjYwODl8MHwxfHNlYXJjaHwxfHxDSUwlMjBMaWFiaWxpdHklMkMlMjBFeGVtcHRpb25zJTIwYW5kJTIwQ2hhcmdpbmclMjBTY2hlZHVsZSUyME1lY2hhbmljcyUyMGFyY2hpdGVjdHVyZXxlbnwwfDB8fHwxNzc3Njk4NTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
  content: [
    {
      type: "paragraph",
      text: "The Community Infrastructure Levy (CIL) was introduced under the Planning Act 2008 and the CIL Regulations 2010 (as amended) to provide a more consistent, tariff-based mechanism for funding infrastructure than the negotiated S106 route. For a development manager working on mixed-tenure, land-led schemes, CIL is not an abstract compliance exercise — it is a real cost line that must be quantified at appraisal stage, stress-tested in sensitivity analysis, and managed carefully through the development programme to avoid clawback. On a large scheme with social housing relief applied to 40% of units, the difference between correctly maintaining exemption and inadvertently triggering clawback can run into the millions of pounds."
    },
    {
      type: "heading",
      text: "How CIL is Calculated: The Core Mechanics"
    },
    {
      type: "paragraph",
      text: "CIL liability is calculated using the formula: Chargeable Amount = CIL Rate (£/m²) × Chargeable Net Floor Area × Index Adjustment. The chargeable net floor area is gross internal area (GIA) of new floorspace, minus existing lawful floorspace on site (the 'in-use' credit, sometimes called the vacancy test). This credit is only available where the existing building has been in lawful use for a continuous 6-month period in the 36 months preceding planning permission. This is a critical threshold — vacant or derelict buildings that fail the occupancy test receive no credit, meaning brownfield regeneration schemes can face a higher CIL liability than a greenfield equivalent if the existing buildings have sat empty too long."
    },
    {
      type: "key_term",
      term: "CIL Charging Schedule",
      text: "A document adopted by a CIL-charging authority (typically the LPA or, in London, the Mayor) setting out the rates per square metre applicable to different uses and zones. London has a two-tier system: the Mayoral CIL (MCIL2, currently £60/m² across most of London for residential) sits alongside borough-level CIL. Both apply cumulatively, so total CIL on a residential scheme in a charging London borough can be £60/m² (Mayoral) plus the borough rate — which varies widely, from nil in some authorities to £300+/m² in prime locations."
    },
    {
      type: "paragraph",
      text: "CIL rates are indexed to the RICS All-in Tender Price Index (BCIS). The index adjustment compares the TPI at the date planning permission is granted to the index at the date the charging schedule was adopted. In a period of construction cost inflation — as experienced post-2021 — this indexation can add meaningful uplift to nominal charging schedule rates. At appraisal stage, Alfie should always check the current indexed rate, not the headline rate in the charging schedule, as the two can diverge materially on older schedules."
    },
    {
      type: "key_term",
      term: "BCIS Tender Price Index (TPI)",
      text: "The Building Cost Information Service All-in Tender Price Index, produced by RICS, used to index CIL rates from the base date of the charging schedule to the date planning permission is granted. A higher TPI at permission date than at adoption date increases the actual CIL liability relative to the headline charging schedule rate. The adjustment factor is: (TPI at permission date) ÷ (TPI at adoption date)."
    },
    {
      type: "heading",
      text: "Social Housing Relief: The Most Important Exemption for RP Schemes"
    },
    {
      type: "paragraph",
      text: "Social housing relief (SHR) is the most financially significant CIL exemption for a registered provider or RP-partnered developer. Under Regulation 49 of the CIL Regulations 2010, dwellings that qualify as 'social housing' for CIL purposes are entirely exempt from CIL. The qualifying categories are: (i) affordable rent dwellings provided by a registered provider; (ii) social rent dwellings; (iii) shared ownership dwellings where the initial equity share is 25% or more and the property meets the qualifying criteria; and (iv) affordable housing in perpetuity. Market sale units, including those sold under Help to Buy or equivalent, do NOT qualify and remain fully liable."
    },
    {
      type: "paragraph",
      text: "To claim social housing relief, the Collecting Authority must be notified before commencement using Form 8 (Claiming Exemption or Relief). This is a hard procedural requirement — failure to submit Form 8 before commencement means the relief is lost entirely for the relevant units, regardless of whether they are genuinely affordable. On large phased schemes, where individual phases may commence at different dates, it is essential to track commencement triggers carefully and ensure Form 8 is submitted for each phase before any material operations begin on that phase. This is a live risk management issue, not a box-ticking exercise."
    },
    {
      type: "callout",
      label: "APC Tip — Worked Example: CIL on a Mixed-Tenure Scheme",
      text: "Scenario: Latimer secures planning permission on a brownfield London site for 120 units (8,400m² GIA residential). The existing building has been vacant for 4 years, so no in-use credit applies. The borough CIL rate is £150/m² (indexed to £165/m² at permission date). MCIL2 is £60/m². Tenure mix: 72 market sale, 24 affordable rent (RP), 24 shared ownership.\n\nStep 1 — Chargeable floorspace: 8,400m² total, no credit = 8,400m² chargeable.\nStep 2 — Identify exempt units: 24 affordable rent + 24 shared ownership = 48 units. Pro-rata by GIA: assume equal unit sizes, so 48/120 × 8,400 = 3,360m² exempt.\nStep 3 — Chargeable floorspace: 8,400 − 3,360 = 5,040m².\nStep 4 — CIL liability: 5,040 × (£165 + £60) = 5,040 × £225 = £1,134,000.\n\nAPC Examiner Angle: Note that if Form 8 was NOT submitted before commencement, the full 8,400m² would be chargeable: 8,400 × £225 = £1,890,000 — an additional £756,000 liability. This is the kind of procedural risk that must appear on Alfie\'s project risk register with clear ownership and programme triggers."
    },
    {
      type: "heading",
      text: "Clawback: When Social Housing Relief Is Lost"
    },
    {
      type: "paragraph",
      text: "Social housing relief is not permanent — it is subject to a clawback period of 7 years from the date of commencement of the chargeable development. If, during that 7-year window, a unit that claimed relief ceases to qualify (for example, the RP disposes of the unit other than in accordance with the applicable affordable housing restrictions, or a shared ownership unit staircases to 100% and is then resold at market value without reinvestment into qualifying housing), the Collecting Authority can demand the CIL that would have been payable. This clawback risk is a live concern in structuring JV exits and RP portfolio disposals — any transaction involving affordable units within 7 years of commencement should be reviewed against CIL clawback exposure."
    },
    {
      type: "key_term",
      term: "Clawback Period (CIL)",
      text: "The 7-year period following commencement of chargeable development during which CIL relief (including social housing relief and self-build exemption) is subject to withdrawal if qualifying conditions cease to be met. The Collecting Authority must be notified within 14 days of any disqualifying event. Failure to notify is itself an offence under the CIL Regulations."
    },
    {
      type: "heading",
      text: "Other Exemptions: Charitable Relief and Self-Build"
    },
    {
      type: "paragraph",
      text: "Charitable relief applies where a charity owns the chargeable interest in land and the development will be used wholly or mainly for charitable purposes. For Latimer as a charitable RP, this could apply to certain phases — but the relief only protects floorspace directly used for charitable purposes; commercial or market sale elements remain chargeable. Charitable relief also requires Form 8 submission before commencement and is subject to the same 7-year clawback period. Self-build exemption (Regulation 54A) applies to dwellings built or commissioned by individuals for their own primary residence — this is rarely relevant to Latimer\'s pipeline but can arise in community-led or CLT partnership structures."
    },
    {
      type: "heading",
      text: "CIL and S106: The Pooling Restriction and Infrastructure Levy Transition"
    },
    {
      type: "paragraph",
      text: "The CIL Regulations introduced a pooling restriction on S106 contributions: where CIL has been adopted, LPAs cannot pool more than five S106 contributions from separate developments toward a single infrastructure project. This was intended to prevent LPAs from circumventing CIL by continuing to use S106 for items that should be CIL-funded. In practice, this boundary has become increasingly blurred, particularly on large strategic sites where bespoke infrastructure — highways works, utilities diversions, new primary school provision — is being negotiated. The proposed Infrastructure Levy (IL) under the Levelling-Up and Regeneration Act 2023 (LURA) would replace both CIL and S106 with a single land value capture mechanism, but its implementation has been repeatedly delayed and, as of 2026, CIL and S106 remain the operative regime."
    },
    {
      type: "callout",
      label: "APC Tip — Appraisal Integration",
      text: "CIL must be modelled as a cashflow item, not just a headline cost. The CIL liability crystallises and becomes payable in instalments (for liabilities over £100,000, it can be phased into 3 or 4 instalments depending on the authority\'s instalment policy — typically tied to commencement and first/second anniversaries). For a phased scheme, each phase triggers its own commencement date and instalment schedule. In Alfie\'s cashflow model, CIL should appear as discrete line items at commencement and at each instalment date, discounted appropriately in an NPV or IRR calculation. Understating CIL timing or treating it as a day-one lump sum will distort the cashflow and potentially the project IRR. At IC level, always present CIL gross (pre-exemption) and net (post-exemption) to demonstrate the value of affordable tenure in the scheme."
    },
    {
      type: "heading",
      text: "CIL in Land Acquisition Due Diligence"
    },
    {
      type: "paragraph",
      text: "CIL liability is a material consideration in land acquisition due diligence. The key questions to resolve pre-acquisition are: (1) Has the LPA adopted a CIL charging schedule, and at what rate? (2) Has the indexation been applied to determine the current effective rate? (3) Is there an existing planning permission, and if so, what is the CIL liability notice position — has a liability notice already been issued, and if so to whom? (4) Does the existing permission pre-date the introduction of CIL (pre-April 2010 permissions may be CIL-exempt under transitional arrangements)? (5) What is the tenure mix, and what proportion of units will qualify for social housing relief? These questions directly feed into the residual land value calculation — a site with a pre-CIL permission, or one in a non-charging authority, will carry a higher residual land value than a comparable site subject to full borough and Mayoral CIL."
    },
    {
      type: "paragraph",
      text: "One practical complication arises when acquiring a site with an existing planning permission where a liability notice has already been issued to the landowner or a previous developer. On transfer of the chargeable interest, the incoming buyer (Latimer) assumes CIL liability unless an Assumption of Liability Notice (Form 1) is submitted to the Collecting Authority. This form allows the incoming developer to formally assume liability, which is normally desirable as it gives control over instalment timing and exemption claims. If no assumption is made, liability reverts to the landowning entity, which may create complications with lenders or JV partners if that entity is not the development vehicle. This is a point Alfie should flag to the legal team during conveyancing on any land acquisition."
    },
    {
      type: "key_term",
      term: "Assumption of Liability Notice (Form 1)",
      text: "A statutory CIL form submitted to the Collecting Authority by which a party assumes liability for CIL on a chargeable development. Submission of Form 1 before commencement is recommended to ensure the assuming party controls the CIL process, including instalment elections and exemption claims. If no Form 1 is submitted, CIL liability defaults to the owner of the chargeable interest at commencement."
    },
    {
      type: "callout",
      label: "APC Tip — Examiner Hotspot: Commencement Definition",
      text: "Assessors frequently test candidates on what constitutes 'commencement' for CIL purposes. Under Regulation 7 of the CIL Regulations, commencement means the date on which any material operation (as defined in s.56 TCPA 1990) is first carried out in relation to the chargeable development. This includes demolition, groundworks, foundation works and site clearance. Crucially, this is NOT the same as 'commencement' for planning condition purposes, which may be triggered by a more specific list of operations. A common risk scenario: a contractor carries out enabling works (demolition, asbestos removal) that constitute a material operation before Form 8 (social housing relief) has been submitted — this forfeits the relief. Alfie should ensure the programme milestone for 'earliest possible commencement' is flagged to the CIL team at least 4 weeks in advance."
    }
  ],
  summary: [
    "CIL liability = CIL rate (indexed by BCIS TPI) × chargeable net floor area; the in-use credit only applies if the existing building was lawfully occupied for 6 months in the preceding 36 months — vacant brownfield buildings often get no credit.",
    "London has a two-tier CIL system: Mayoral CIL (MCIL2, currently £60/m²) applies on top of borough CIL; both must be modelled in appraisals and cashflows as separate line items with their respective instalment schedules.",
    "Social housing relief (Reg. 49) exempts affordable rent, social rent and qualifying shared ownership units from CIL entirely — but Form 8 must be submitted before any material operation constituting commencement, or the relief is permanently lost for those units.",
    "CIL relief is subject to a 7-year clawback period; any RP disposal, portfolio transaction or staircasing event within 7 years of commencement must be reviewed for clawback exposure, with notification obligations falling on the RP within 14 days of a disqualifying event.",
    "On land acquisition, submitting Form 1 (Assumption of Liability) transfers CIL control to Latimer as incoming developer — without it, liability may default to the vendor or landowning entity, creating complications for lenders and JV structures."
  ],
  qa: [
    {
      q: "You\'re appraising a brownfield site in a London borough. The existing warehouse has been vacant for 5 years. The borough CIL rate in the charging schedule was £140/m² when adopted; the BCIS TPI has risen 18% since adoption. How do you calculate the current effective CIL rate, and what is the in-use credit position?",
      a: "The indexed CIL rate is £140 × 1.18 = £165.20/m² (borough). MCIL2 adds £60/m², so total effective rate is £225.20/m². The in-use credit is not available: the existing building must have been in lawful use for a continuous 6-month period in the 36 months preceding the grant of planning permission (Reg. 40). A building vacant for 5 years fails this test, so the full GIA of new development is chargeable. This must be modelled in the appraisal on a gross chargeable floorspace basis with no credit offset."
    },
    {
      q: "On a 150-unit scheme (50% affordable by unit count: 40 affordable rent, 35 shared ownership), your colleague says you can claim social housing relief on all 75 affordable units. Is that correct, and what conditions apply?",
      a: "Social housing relief is available for affordable rent and shared ownership units that meet the qualifying criteria under Reg. 49, so in principle all 75 units could qualify. However, three conditions must be met: (1) the dwellings must be provided by or transferred to a registered provider; (2) Form 8 must be submitted to the Collecting Authority before commencement of the chargeable development; and (3) for shared ownership, the initial equity tranche must be at least 25% and the dwelling must meet the affordable housing definition. If any unit is later converted to market sale or the RP disposes of it outside qualifying terms within 7 years, clawback applies to that unit\'s pro-rata CIL exemption."
    },
    {
      q: "You are acquiring a site with an existing planning permission. A CIL liability notice was issued 8 months ago to the current landowner. What steps must Latimer take on completion of the land purchase to manage CIL liability correctly?",
      a: "Latimer should submit Form 1 (Assumption of Liability Notice) to the Collecting Authority promptly on or before completion. This formally transfers liability from the vendor to Latimer as the incoming developer with a chargeable interest, giving Latimer control over instalment elections, exemption claims and the commencement trigger. Without Form 1, liability defaults to the owner of the chargeable interest at commencement — which could create issues if the vendor retains any interest or if the conveyancing structure involves a nominee or SPV. Legal due diligence should also confirm whether any instalment payments have already been made or whether the liability notice is correctly calculated, including whether the existing permission pre-dates CIL adoption (in which case transitional exemption may apply)."
    },
    {
      q: "On a phased residential scheme, your programme manager advises that Phase 1 demolition works will start in 3 weeks to meet a grant drawdown milestone. What CIL actions are required before those works commence?",
      a: "Two statutory forms must be submitted to the Collecting Authority before any material operation on Phase 1: (1) Form 1 — Assumption of Liability, confirming Latimer as the liable party for Phase 1; and (2) Form 8 — Claiming Exemption or Relief, if social housing relief is being claimed for qualifying affordable units in Phase 1. Demolition constitutes a 'material operation' under s.56 TCPA 1990 and therefore triggers commencement for CIL purposes. If Form 8 is not submitted before the demolition starts, social housing relief is permanently lost for the Phase 1 affordable units — a potentially very significant cost. This should be a hard gate on the programme dashboard with the development manager as named owner."
    },
    {
      q: "An assessor asks you to explain the difference between CIL and the proposed Infrastructure Levy under LURA 2023. What are the key structural differences, and what is the current status as of 2026?",
      a: "CIL is a fixed-rate, per-square-metre charge based on floorspace, set in advance in a charging schedule and applied uniformly within use class zones regardless of individual scheme viability. The Infrastructure Levy (IL) proposed under the Levelling-Up and Regeneration Act 2023 would instead be a value-based charge calculated on the difference between gross development value and a minimum threshold (the 'reference value'), applied at a percentage rate set by each authority. The IL was intended to replace both CIL and much of S106 negotiation with a single, more transparent capture mechanism, with the IL being levied on actual sale value rather than estimated floorspace costs. As of 2026, the IL has not been implemented — it remains subject to piloting and secondary legislation consultation, and CIL and S106 continue to operate as the live regime. Candidates should note that the IL as originally conceived raised significant concerns about its interaction with affordable housing delivery, since RP transfers at sub-market value could reduce the IL base, and the government has been consulting on how affordable housing obligations would be protected."
    }
  ],
  news: [
    {
      tag: "CIL / Infrastructure Levy",
      headline: "Government confirms further delay to Infrastructure Levy rollout as consultation on affordable housing protection continues",
      body: "The Ministry of Housing, Communities and Local Government has confirmed that the Infrastructure Levy, introduced under the Levelling-Up and Regeneration Act 2023, will not enter piloting before late 2026 at the earliest, following sustained lobbying from registered providers and housebuilders concerned about affordable housing delivery risk. The government has committed to publishing revised secondary legislation setting out how RP transfers and shared ownership will be treated within the IL value capture mechanism. CIL and S106 remain operative in the interim."
    },
    {
      tag: "Mayoral CIL",
      headline: "GLA consults on MCIL2 rate review as London residential GDV growth stalls in outer boroughs",
      body: "The Greater London Authority has launched a consultation on whether the current flat MCIL2 rate of £60/m² remains appropriate across all London zones, following evidence that residential GDV growth in outer East and South East London has underperformed earlier projections used to set the rate. Several housing associations and developers have submitted responses arguing that the cumulative burden of MCIL2 plus borough CIL is suppressing marginal site viability, particularly on brownfield regeneration schemes with no in-use credit available. The GLA is expected to publish a revised charging schedule for consultation by Q4 2026."
    },
    {
      tag: "Social Housing Relief / Clawback Risk",
      headline: "RP warned over CIL clawback exposure following portfolio refinancing that triggered disqualifying disposals",
      body: "A mid-sized registered provider has received a clawback demand from a London Collecting Authority after a portfolio refinancing transaction was found to have involved the temporary transfer of affordable units outside qualifying RP ownership, inadvertently triggering a disqualifying event under Regulation 49 of the CIL Regulations. The case, which involves a seven-figure CIL sum, has prompted the National Housing Federation to issue updated guidance to members on reviewing all CIL relief claims before entering portfolio disposals, refinancings or stock rationalisation transactions involving units within their 7-year clawback window."
    }
  ]
};
