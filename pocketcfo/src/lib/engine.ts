import { DashboardData, GraphInput, GraphOutcome } from "@/types";

export function getDemoResponse(
  input: string,
  currentDashboard: DashboardData
): {
  botText: string;
  newDashboard: DashboardData;
  graphInput: GraphInput;
  graphOutcome: GraphOutcome;
} {
  const lower = input.toLowerCase();

  // Extract amount from input
  const amountMatch = input.match(/rm\s?[\d,]+\.?\d*/i);
  const amount = amountMatch
    ? parseFloat(amountMatch[0].replace(/rm\s?/i, "").replace(/,/g, ""))
    : 0;

  // Detect if TIN is present
  const hasTIN =
    /tin[:\s]*[a-z]?\d{5,}/i.test(input) || /[CI]G?\d{8,}/i.test(input);

  // Detect keywords
  const hasNoTIN =
    lower.includes("no tin") ||
    lower.includes("missing tin") ||
    lower.includes("without tin") ||
    (!hasTIN && lower.includes("invoice"));
  const isCapitalItem =
    /laptop|computer|furniture|chair|desk|machine|equipment|vehicle|printer/i.test(
      input
    );
  const isRecurring =
    /internet|wifi|electricity|water|rental|rent|subscription|cloud|hosting/i.test(
      input
    );
  const isFood =
    /food|catering|kandar|restaurant|nasi|makan|lunch|dinner/i.test(input);
  const isFreelance =
    /freelance|designer|contractor|consultant|outsource/i.test(input);

  // Scenario 1: Has TIN → compliant, classify the transaction
  if (hasTIN && !hasNoTIN) {
    const taxSavings = isCapitalItem
      ? Math.round(amount * 0.24)
      : Math.round(amount * 0.17);

    const classification = isCapitalItem
      ? "Capital Allowance (Schedule 3, Income Tax Act 1967)"
      : isRecurring
      ? "Revenue Expenditure — Recurring (Section 33(1))"
      : isFood
      ? "Revenue Expenditure — Entertainment (50% deductible under Section 39(1)(l))"
      : "Revenue Expenditure — General (Section 33(1))";

    const botText = isCapitalItem
      ? `✅ LHDN Compliant — TIN verified. I've classified this RM${amount.toLocaleString()} purchase as ${classification}. This qualifies for capital allowance at 20% initial + 14% annual rate. Estimated tax savings: RM${taxSavings.toLocaleString()} over the asset's useful life. I recommend deferring to next month if you're close to the 24% tax bracket.`
      : `✅ LHDN Compliant — TIN verified. Classified as ${classification}. This RM${amount.toLocaleString()} expense is fully deductible. Tax impact: RM${taxSavings.toLocaleString()} reduction in chargeable income. Invoice has been logged and indexed for e-filing.`;

    const vendorMatch = input.match(/from\s+([\w\s]+?)(?:[,.]|$)/i);
    const vendorName = vendorMatch ? vendorMatch[1].trim() : "Vendor";

    return {
      botText,
      graphInput: {
        icon: isCapitalItem
          ? "fa-laptop"
          : isFood
          ? "fa-utensils"
          : isRecurring
          ? "fa-wifi"
          : "fa-file-invoice",
        name: vendorName,
        amount: `RM${amount.toLocaleString("en-MY", {
          minimumFractionDigits: 2,
        })}`,
      },
      graphOutcome: {
        status: "approved",
        title: isCapitalItem
          ? "Classify as Capital Allowance"
          : "Approved — Fully Deductible",
        description: `Tax savings: RM${taxSavings.toLocaleString()}`,
      },
      newDashboard: {
        ...currentDashboard,
        expenses: currentDashboard.expenses + amount,
        pending: currentDashboard.pending + 1,
        compliance: Math.min(currentDashboard.compliance + 1, 100),
        liquidity: Number(
          (currentDashboard.revenue / (currentDashboard.expenses + amount)).toFixed(1)
        ),
      },
    };
  }

  // Scenario 2: No TIN / Non-compliant
  if (hasNoTIN || isFreelance) {
    const penaltyRisk = amount > 5000 ? "RM20,000" : "RM5,000";
    const botText = `⚠️ Warning: This invoice is missing a valid TIN number. Under LHDN e-Invoice mandate (effective Aug 2025), all B2B transactions require a TIN. I've flagged this as NON-COMPLIANT. Penalty risk: up to ${penaltyRisk}. Your compliance score has dropped. Action: Request TIN from the vendor before processing payment.`;

    const vendorMatch =
      input.match(/from\s+([\w\s]+?)(?:[,.]|$)/i) ||
      input.match(/to\s+(?:a\s+)?([\w\s]+?)(?:[,.]|$)/i);
    const vendorName = vendorMatch ? vendorMatch[1].trim() : "Unknown Vendor";

    return {
      botText,
      graphInput: {
        icon: isFreelance ? "fa-user" : "fa-file-invoice",
        name: vendorName,
        amount:
          amount > 0
            ? `RM${amount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`
            : "N/A",
      },
      graphOutcome: {
        status: "rejected",
        title: `Request TIN from ${vendorName}`,
        description: `Non-compliant — ${penaltyRisk} penalty risk`,
      },
      newDashboard: {
        ...currentDashboard,
        expenses: currentDashboard.expenses + amount,
        pending: currentDashboard.pending + 1,
        compliance: Math.max(currentDashboard.compliance - 15, 20),
        liquidity: Number(
          (currentDashboard.revenue / (currentDashboard.expenses + amount)).toFixed(1)
        ),
      },
    };
  }

  // Scenario 3: Capital expenditure question
  if (isCapitalItem && amount > 0) {
    const ca = Math.round(amount * 0.2);
    const itemName =
      input.match(
        /laptop|computer|furniture|chair|desk|machine|equipment|vehicle|printer/i
      )?.[0] || "equipment";
    const botText = `📊 Analysis: RM${amount.toLocaleString()} for ${itemName}. I recommend classifying as Capital Allowance under Schedule 3. Initial allowance: RM${ca.toLocaleString()} (20%). Annual allowance: 14%. Total first-year deduction: RM${Math.round(amount * 0.34).toLocaleString()}. Note: If your total chargeable income approaches RM600k, consider deferring this to next fiscal year to stay in the 17% bracket.`;

    return {
      botText,
      graphInput: {
        icon: "fa-laptop",
        name: `${itemName.charAt(0).toUpperCase() + itemName.slice(1)} Purchase`,
        amount: `RM${amount.toLocaleString("en-MY", {
          minimumFractionDigits: 2,
        })}`,
      },
      graphOutcome: {
        status: "pending",
        title: "Recommend: Capital Allowance",
        description: `Defer to stay in ${currentDashboard.tax.rate}% bracket`,
      },
      newDashboard: {
        ...currentDashboard,
        expenses: currentDashboard.expenses + amount,
        pending: currentDashboard.pending + 1,
        tax: {
          ...currentDashboard.tax,
          untilNext: Math.max(currentDashboard.tax.untilNext - amount, 0),
          progressPct: Math.min(currentDashboard.tax.progressPct + 5, 95),
        },
      },
    };
  }

  // Scenario 4: Recurring expense
  if (isRecurring) {
    const serviceName =
      input.match(
        /internet|wifi|electricity|water|rental|rent|subscription|cloud|hosting/i
      )?.[0] || "service";
    const botText = `✅ Auto-classified as Revenue Expenditure — Recurring. This is fully deductible under Section 33(1) of the Income Tax Act. Amount: RM${
      amount > 0 ? amount.toLocaleString() : "N/A"
    }. I've added this to your monthly recurring expenses tracker. No further action required.`;

    return {
      botText,
      graphInput: {
        icon: "fa-wifi",
        name: `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Bill`,
        amount: `RM${(amount || 299).toLocaleString("en-MY", {
          minimumFractionDigits: 2,
        })}`,
      },
      graphOutcome: {
        status: "approved",
        title: "Auto-classified: Recurring",
        description: "Fully deductible — Section 33(1)",
      },
      newDashboard: {
        ...currentDashboard,
        expenses: currentDashboard.expenses + (amount || 299),
      },
    };
  }

  // Scenario 5: General fallback
  const botText =
    amount > 0
      ? `📝 Transaction recorded: RM${amount.toLocaleString()}. Classified as Revenue Expenditure (General). Ensure vendor provides a valid e-invoice with TIN for LHDN compliance. Current expense-to-revenue ratio: ${(
          ((currentDashboard.expenses + amount) / currentDashboard.revenue) *
          100
        ).toFixed(1)}%. ${
          (currentDashboard.expenses + amount) / currentDashboard.revenue > 0.8
            ? "⚠️ Warning: Expense ratio exceeding 80%. Review discretionary spending."
            : "Ratio looks healthy."
        }`
      : `I understand your query. Could you provide more details such as the amount (in RM), vendor name, and TIN number? This will help me classify the transaction and check LHDN compliance accurately.`;

  return {
    botText,
    graphInput:
      amount > 0
        ? {
            icon: "fa-receipt",
            name: "Transaction",
            amount: `RM${amount.toLocaleString("en-MY", {
              minimumFractionDigits: 2,
            })}`,
          }
        : (null as unknown as GraphInput),
    graphOutcome:
      amount > 0
        ? {
            status: "pending" as const,
            title: "Pending Classification",
            description: "Awaiting further details",
          }
        : (null as unknown as GraphOutcome),
    newDashboard: {
      ...currentDashboard,
      expenses: currentDashboard.expenses + amount,
      pending:
        amount > 0 ? currentDashboard.pending + 1 : currentDashboard.pending,
    },
  };
}
