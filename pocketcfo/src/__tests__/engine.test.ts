import { getDemoResponse } from "../lib/engine";
import { DashboardData } from "../types";

describe("PocketCFO Neural Engine (getDemoResponse)", () => {
  let mockDashboard: DashboardData;

  beforeEach(() => {
    mockDashboard = {
      revenue: 100000,
      expenses: 20000,
      pending: 0,
      liquidity: 5.0,
      compliance: 100,
      tax: { rate: 15, untilNext: 50000, progressPct: 50 },
    };
  });

  it("should classify non-TIN invoices as 'rejected' and decrease compliance", () => {
    const input = "Paid RM 5000 to freelance designer, no TIN provided";
    const result = getDemoResponse(input, mockDashboard);
    
    expect(result.graphOutcome.status).toBe("rejected");
    expect(result.newDashboard.compliance).toBeLessThan(100);
    expect(result.botText).toContain("NON-COMPLIANT");
  });

  it("should auto-classify recurring expenditures as 'approved'", () => {
    const input = "Paid internet WiFi bill RM 300 to TIME";
    const result = getDemoResponse(input, mockDashboard);
    
    expect(result.graphOutcome.status).toBe("approved");
    expect(result.botText).toContain("Section 33(1)");
    expect(result.newDashboard.expenses).toBe(20300);
  });

  it("should detect capital allowance logic for laptops/computers", () => {
    const input = "Dell laptops RM 12000 TIN: C1234567890";
    const result = getDemoResponse(input, mockDashboard);
    
    expect(result.graphOutcome.status).toBe("approved");
    expect(result.botText).toContain("Capital Allowance");
  });
});
