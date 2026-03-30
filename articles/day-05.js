// RICS APC Study Article — Day 5: Development Finance Structures
// Module: Project Finance | Level: 3 | Competency: Project Finance (Level 3)
// Hand-authored — the reference article for this topic.

window.RICS_ARTICLE = {
  sections: {

    image: {
      svg_markup: `<svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;background:#f4f0e6;border:1px solid #ccc;" aria-label="The Development Finance Capital Stack">
        <rect width="800" height="300" fill="#f4f0e6"/>
        <text x="400" y="28" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="700" letter-spacing="1" fill="#0d0d0d">THE DEVELOPMENT FINANCE CAPITAL STACK</text>
        <text x="400" y="44" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#888">Example: £10m total development cost / £15m GDV</text>
        <rect x="280" y="58" width="240" height="48" fill="#1a5c2a"/>
        <text x="400" y="78" text-anchor="middle" font-family="Georgia,serif" font-size="11" font-weight="700" fill="#fff">EQUITY</text>
        <text x="400" y="93" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="rgba(255,255,255,0.85)">£2m | 20% of cost</text>
        <rect x="280" y="106" width="240" height="36" fill="#c17f24"/>
        <text x="400" y="121" text-anchor="middle" font-family="Georgia,serif" font-size="11" font-weight="700" fill="#fff">MEZZANINE</text>
        <text x="400" y="135" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="rgba(255,255,255,0.85)">£1.5m | 15% of cost</text>
        <rect x="280" y="142" width="240" height="104" fill="#003399"/>
        <text x="400" y="182" text-anchor="middle" font-family="Georgia,serif" font-size="11" font-weight="700" fill="#fff">SENIOR DEBT</text>
        <text x="400" y="198" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="rgba(255,255,255,0.85)">£6.5m | 65% of cost</text>
        <text x="400" y="213" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="rgba(255,255,255,0.7)">SONIA + 2–4% p.a.</text>
        <text x="400" y="228" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="rgba(255,255,255,0.7)">Repaid first · First charge</text>
        <line x1="265" y1="246" x2="265" y2="62" stroke="#0d0d0d" stroke-width="1.5" marker-end="url(#arr)"/>
        <text x="258" y="256" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#555">LOW</text>
        <text x="258" y="57" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#555">HIGH</text>
        <text x="245" y="162" text-anchor="middle" font-family="Georgia,serif" font-size="10" font-weight="700" fill="#0d0d0d" transform="rotate(-90 245 162)">RISK</text>
        <line x1="535" y1="246" x2="535" y2="62" stroke="#0d0d0d" stroke-width="1.5" marker-end="url(#arr)"/>
        <text x="543" y="256" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#555">LOW</text>
        <text x="543" y="57" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#555">HIGH</text>
        <text x="555" y="162" text-anchor="middle" font-family="Georgia,serif" font-size="10" font-weight="700" fill="#0d0d0d" transform="rotate(90 555 162)">RETURN</text>
        <text x="545" y="87" font-family="Georgia,serif" font-size="9" fill="#1a5c2a" font-weight="700">Developer profit</text>
        <text x="545" y="128" font-family="Georgia,serif" font-size="9" fill="#c17f24" font-weight="700">12–20% p.a.</text>
        <text x="120" y="87" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#1a5c2a">Repaid last</text>
        <text x="120" y="128" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#c17f24">Repaid second</text>
        <text x="120" y="196" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#003399">Repaid first</text>
        <text x="400" y="270" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#555">Developer's equity is the first to be lost if the scheme underperforms</text>
        <text x="400" y="285" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#555">Senior debt holders are protected — they sit at the base and are repaid before anyone else</text>
        <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto"><path d="M0,6 L3,0 L6,6" fill="none" stroke="#0d0d0d" stroke-width="1.2"/></marker></defs>
      </svg>`,
      caption: `Figure 1 &mdash; The capital stack for a typical &pound;10m residential development scheme. Layers are ordered by risk and repayment priority; senior debt sits at the base (lowest risk, repaid first) and equity at the top (highest risk, last to be repaid).`
    },

    main: `
      <h2>The Capital Stack: How Development Projects Are Funded</h2>
      <p>Development projects are rarely funded from a single source. Instead, finance is structured in layers &mdash; each with a different position in the risk hierarchy, a different cost, and different rights if the scheme fails. This layered structure is called the <strong>capital stack</strong>.</p>
      <p>Understanding the capital stack is not just a theoretical exercise. As a Planning and Development surveyor, you will encounter it constantly: when advising clients on scheme viability, when reviewing a development appraisal for a lender, or when explaining to a client why their return looks different depending on how the deal is financed.</p>
      <div class="key-term"><strong>Key Term &mdash; Capital Stack</strong><p>The capital stack is the full set of funding sources used to finance a development, arranged in order of seniority. Each layer has a different risk profile, cost, and repayment priority. In a default, the most senior layer is repaid first; equity &mdash; at the top &mdash; is last.</p></div>
      <h3>Layer 1: Senior Debt</h3>
      <p>Senior debt is the primary and largest source of development funding, typically accounting for 55&ndash;70% of total project costs. It is provided by clearing banks (Barclays, Lloyds, NatWest), challenger banks, or specialist development lenders such as OakNorth or Octopus Real Estate.</p>
      <p>Lenders use two key metrics to determine how much they will lend:</p>
      <ul>
        <li><strong>Loan to Cost (LTC):</strong> The loan as a percentage of total development costs (land + build + fees). Typically capped at 65&ndash;70%. This ensures the developer has meaningful &ldquo;skin in the game.&rdquo;</li>
        <li><strong>Loan to GDV:</strong> The loan as a percentage of the completed scheme&rsquo;s Gross Development Value. Typically capped at 60&ndash;65%. This acts as a backstop: on a thin-margin scheme, this cap can become the binding constraint.</li>
      </ul>
      <div class="callout-tip"><strong>APC Tip &mdash; Worked Example</strong><p>A developer builds 20 townhouses at a total cost of &pound;8m. GDV is estimated at &pound;12m.<br><br>Max LTC (65%): &pound;8m &times; 65% = <strong>&pound;5.2m</strong><br>Max against GDV (60%): &pound;12m &times; 60% = <strong>&pound;7.2m</strong><br>The LTC cap is the binding constraint. Maximum senior debt = &pound;5.2m. The remaining &pound;2.8m must come from mezzanine or equity. Be ready to walk an examiner through a calculation like this.</p></div>
      <p><strong>How drawdowns work:</strong> Funds are released in stages tied to construction milestones. Before each release, the lender&rsquo;s appointed <strong>monitoring surveyor</strong> &mdash; typically a quantity surveyor &mdash; certifies that the stated work has been completed to the required standard. Their fees are charged to the borrower.</p>
      <p><strong>Interest:</strong> Charged on drawn (not undrawn) funds. Most development finance is now priced against <strong>SONIA</strong> (Sterling Overnight Index Average) plus a margin of typically 2&ndash;4%. Interest is almost always <strong>rolled up</strong> &mdash; added to the loan balance rather than paid monthly &mdash; to protect the developer&rsquo;s cashflow during the build. This rolled-up interest compounds over time and must be accurately modelled in the appraisal.</p>
      <p><strong>Security:</strong> The lender takes a <strong>first legal charge</strong> over the site. If the developer defaults, the lender can appoint a receiver and sell the site or completed units to recover their debt.</p>
      <h3>Layer 2: Mezzanine Finance</h3>
      <p>Mezzanine finance fills the gap between what the senior lender will advance and what the developer has available in equity. It sits <em>above</em> senior debt in the capital stack and <em>below</em> equity.</p>
      <ul>
        <li><strong>Who provides it:</strong> Specialist mezzanine lenders and property finance funds. Rarely offered by high-street banks.</li>
        <li><strong>Cost:</strong> Typically 12&ndash;20% per annum &mdash; significantly higher than senior debt, reflecting the higher risk of loss.</li>
        <li><strong>Leverage effect:</strong> Adding mezzanine can push total debt to 80&ndash;90% of total costs, reducing the developer&rsquo;s equity requirement substantially.</li>
      </ul>
      <p>On the same &pound;8m scheme: without mezzanine, the developer needs &pound;2.8m of equity. If a mezzanine lender covers &pound;1.6m, the developer&rsquo;s equity drops to just &pound;1.2m &mdash; but both debt layers must be repaid before the developer sees any return.</p>
      <div class="callout-warn"><strong>Watch Out &mdash; Mezzanine Is Not Free Money</strong><p>At 15% p.a. on &pound;1.6m, mezzanine costs &pound;240,000 per year. On an 18-month build that&rsquo;s &pound;360,000. If the scheme runs three months over programme, add another &pound;60,000. On a marginal scheme, this erodes developer profit quickly and can tip a viable appraisal into loss. Always model mezzanine costs carefully and stress-test for programme overrun.</p></div>
      <h3>Layer 3: Equity</h3>
      <p>Equity is the developer&rsquo;s own capital, or capital contributed by a joint venture (JV) partner. It occupies the top of the capital stack: highest risk, last to be repaid, but with the greatest potential upside.</p>
      <p>Equity investors are the first to lose money if a scheme underperforms. In exchange for carrying this risk, they are entitled to the developer&rsquo;s profit &mdash; which is why developers typically require a minimum return of <strong>15&ndash;20% profit on cost</strong> (or 12&ndash;15% on GDV) to justify committing equity.</p>
      <div class="key-term"><strong>Key Term &mdash; Equity Waterfall</strong><p>A waterfall defines how returns flow between equity parties. A typical two-tier structure: (1) return of all contributed capital; (2) preferred return to the funding partner (e.g. 8% IRR); (3) surplus profits split at an agreed ratio, often 70/30 (funder/developer). The developer&rsquo;s disproportionate share of profits above the hurdle rate is called the <strong>promote</strong>.</p></div>
      <h3>Why This Matters for Your APC</h3>
      <ul>
        <li><strong>Viability assessments:</strong> Finance costs are a key input in any development appraisal. Getting the interest calculation wrong &mdash; or forgetting to model rolled-up interest compounding &mdash; can materially distort the result.</li>
        <li><strong>Advising clients on deal structure:</strong> A client asking &ldquo;should we use mezzanine?&rdquo; is asking you to weigh the cost of finance against the reduction in equity and the amplified return. That requires understanding all three layers.</li>
        <li><strong>Working with lenders:</strong> Understanding what a lender is looking for &mdash; LTC, LTV, drawdown conditions &mdash; makes you a more effective intermediary.</li>
        <li><strong>APC interviews:</strong> Examiners frequently ask candidates to explain how a scheme is financed, or to identify a finance cost error in an appraisal. Articulating the capital stack clearly is a mark of Level 3 competence.</li>
      </ul>
    `,

    tables: `
      <h2>Visual Summary</h2>
      <div class="diagram-wrap">
        <div class="diagram-label">Table 1 &mdash; Capital Stack Comparison: Senior Debt vs Mezzanine vs Equity</div>
        <table class="data-table">
          <thead><tr><th>Feature</th><th>Senior Debt</th><th>Mezzanine</th><th>Equity</th></tr></thead>
          <tbody>
            <tr><td><strong>Typical share of costs</strong></td><td>55&ndash;70%</td><td>10&ndash;20%</td><td>15&ndash;30%</td></tr>
            <tr><td><strong>Indicative cost</strong></td><td>SONIA + 2&ndash;4% p.a.</td><td>12&ndash;20% p.a.</td><td>Developer&rsquo;s profit (15&ndash;20% on cost)</td></tr>
            <tr><td><strong>Security</strong></td><td>First legal charge</td><td>Second charge / profit share</td><td>None (residual interest)</td></tr>
            <tr><td><strong>Repayment order</strong></td><td>First</td><td>Second</td><td>Last</td></tr>
            <tr><td><strong>Risk level</strong></td><td>Lowest</td><td>Medium</td><td>Highest</td></tr>
            <tr><td><strong>Typical provider</strong></td><td>Banks, specialist lenders</td><td>Mezzanine funds</td><td>Developer / JV partner / private equity</td></tr>
            <tr><td><strong>Interest type</strong></td><td>Rolled up or serviced</td><td>Rolled up or profit share</td><td>N/A &mdash; return via profit</td></tr>
          </tbody>
        </table>
      </div>
      <div class="diagram-wrap" style="margin-top:1.4rem;">
        <div class="diagram-label">Table 2 &mdash; Illustrative Finance Structure: &pound;10m Residential Scheme (GDV &pound;15m)</div>
        <table class="data-table">
          <thead><tr><th>Layer</th><th>Amount</th><th>% of Cost</th><th>Indicative Cost</th><th>18-Month Interest</th></tr></thead>
          <tbody>
            <tr><td><strong>Senior Debt</strong></td><td>&pound;6.5m</td><td>65%</td><td>SONIA (5%) + 3% = 8%</td><td>~&pound;780,000</td></tr>
            <tr><td><strong>Mezzanine</strong></td><td>&pound;1.5m</td><td>15%</td><td>15% p.a.</td><td>~&pound;338,000</td></tr>
            <tr><td><strong>Equity</strong></td><td>&pound;2.0m</td><td>20%</td><td>&mdash;</td><td>&mdash;</td></tr>
            <tr><td><strong>Total finance cost</strong></td><td>&mdash;</td><td>&mdash;</td><td>&mdash;</td><td><strong>~&pound;1.12m</strong></td></tr>
            <tr><td><strong>GDV</strong></td><td>&pound;15m</td><td>&mdash;</td><td>&mdash;</td><td>&mdash;</td></tr>
            <tr><td><strong>Gross profit (pre-finance)</strong></td><td>&pound;5m</td><td>50% on cost</td><td>&mdash;</td><td>&mdash;</td></tr>
            <tr><td><strong>Net profit (post-finance)</strong></td><td>~&pound;3.88m</td><td>~38.8% on cost</td><td>&mdash;</td><td>&mdash;</td></tr>
          </tbody>
        </table>
      </div>
      <p style="font-size:0.75rem;color:#888;margin-top:0.5rem;font-style:italic;">Interest figures are illustrative, calculated on average drawn balance over an 18-month programme. Real appraisals require month-by-month cashflow modelling.</p>
    `,

    summary_points: [
      `The <strong>capital stack</strong> layers finance by risk: senior debt (lowest risk, repaid first) &rarr; mezzanine &rarr; equity (highest risk, last to receive any return).`,
      `<strong>Senior debt</strong> is typically capped at 65% LTC or 60% of GDV &mdash; whichever is lower. Interest is usually rolled up and must be modelled carefully in any appraisal.`,
      `<strong>Mezzanine</strong> fills the funding gap between senior debt and equity. It is expensive (12&ndash;20% p.a.) and only appropriate where deal economics are strong enough to absorb the cost.`,
      `<strong>Equity</strong> bears residual risk. Developer profit (typically 15&ndash;20% on cost) is the return on equity &mdash; which is why this benchmark is used as a viability test.`,
      `Lenders appoint a <strong>monitoring surveyor</strong> to certify drawdowns independently. This is a common professional role in P&amp;D practice.`,
      `Finance costs &mdash; including rolled-up interest and arrangement fees &mdash; can materially erode developer profit. Always model programme risk and stress-test finance costs in sensitivity analysis.`
    ],

    summary_closing: `<p>Project Finance sits at Level 3 of the P&amp;D pathway, meaning the APC expects you to go beyond knowing what these structures are &mdash; you should be able to advise a client on the implications of different financing approaches, identify errors in a finance model, and explain how the capital stack affects scheme viability.</p>`,

    qa: [
      {
        q: `What is the difference between Loan to Cost (LTC) and Loan to GDV, and which typically acts as the binding constraint?`,
        a: `LTC measures the loan as a % of total development costs. Loan to GDV measures the loan against the completed scheme&rsquo;s estimated value. LTC is typically the binding constraint on straightforward residential schemes. Loan to GDV acts as a backstop: on a thin-margin scheme where GDV is relatively low vs costs, the GDV cap can become the tighter of the two.`
      },
      {
        q: `A developer has total costs of &pound;5m and a GDV of &pound;8m. What is the maximum senior debt at 65% LTC and 60% of GDV? Which is the binding constraint?`,
        a: `LTC: &pound;5m &times; 65% = <strong>&pound;3.25m</strong>. Loan to GDV: &pound;8m &times; 60% = &pound;4.8m. The LTC cap of &pound;3.25m is the binding constraint. The developer must fund the remaining &pound;1.75m from mezzanine and/or their own equity.`
      },
      {
        q: `Why is development finance interest usually &ldquo;rolled up&rdquo; and what is the key risk of this approach?`,
        a: `During construction there is typically no income &mdash; units haven&rsquo;t been sold or let. Rolling up interest avoids requiring the developer to service debt from their own funds, protecting cashflow. The risk is that interest compounds: the total bill is higher than a flat rate suggests. If the scheme runs over programme, rolled-up interest grows significantly &mdash; which is why programme risk is the most important sensitivity variable to stress-test.`
      },
      {
        q: `Who appoints the monitoring surveyor and what is their role?`,
        a: `The monitoring surveyor is appointed by the <strong>lender</strong> &mdash; not the developer &mdash; to provide independent oversight on the lender&rsquo;s behalf. They review the budget, programme and consultant appointments before first drawdown, then certify each subsequent drawdown by confirming construction work has been completed to the required standard. Their fees are charged to the borrower.`
      },
      {
        q: `A developer tells you mezzanine finance will &ldquo;boost their returns.&rdquo; Explain the mechanism and identify the key risk.`,
        a: `Mezzanine reduces the developer&rsquo;s equity contribution while keeping absolute profit the same &mdash; the same &pound;1m profit on &pound;1m equity (vs &pound;2m equity) doubles the return on equity. The key risk: mezzanine costs 12&ndash;20% p.a. and ranks above equity. If costs overrun or GDV falls, mezzanine interest erodes profit quickly and the developer&rsquo;s equity is wiped out first. Leverage amplifies both gains <em>and</em> losses.`
      },
      {
        q: `What is an equity waterfall and why does the &ldquo;promote&rdquo; matter to a developer?`,
        a: `A waterfall sets out how profits are distributed between equity parties once the project completes. A typical structure: (1) return of all capital; (2) preferred return to the funding partner; (3) surplus profits split at an agreed ratio (e.g. 70/30). The <strong>promote</strong> is the developer&rsquo;s disproportionate share of profits above the hurdle rate &mdash; it incentivises outperformance, since the developer keeps a larger share of any upside beyond the funder&rsquo;s minimum return.`
      }
    ],

    news: [
      {
        tag: `Finance`,
        headline: `Bank of England Holds Base Rate &mdash; Development Finance Costs Remain Elevated`,
        body: `The Bank of England held the base rate at 4.5% at its March 2026 meeting, citing persistent services inflation. Development finance is priced against SONIA, so sustained higher rates continue to inflate rolled-up interest in appraisals and squeeze viability on marginal schemes &mdash; putting further pressure on land values.`
      },
      {
        tag: `Lending`,
        headline: `Specialist Lenders Now Account for Over 40% of UK Development Finance`,
        body: `As high-street banks have tightened risk appetite, challenger and specialist lenders have grown their market share significantly. This has introduced more competition on lower-risk residential schemes, with margins tightening &mdash; but specialist lenders remain more selective on complex commercial schemes.`
      },
      {
        tag: `Build-to-Rent`,
        headline: `Institutional Debt Transforms BTR Finance Structures`,
        body: `Insurance companies and pension funds are increasingly providing long-term &ldquo;exit finance&rdquo; for Build-to-Rent schemes at margins of sub-3%, refinancing the short-term construction loan on practical completion. Understanding this refinancing step is now a core part of advising on BTR viability.`
      }
    ]

  }
};
