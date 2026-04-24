"use client";

import { DashboardData } from "@/types";

export default function DashboardPanel({ dashboard }: { dashboard: DashboardData }) {
  const complianceColor = dashboard.compliance < 80 ? "#ef4444" : "#956ae6";
  const complianceGradient = `conic-gradient(${complianceColor} ${dashboard.compliance}%, #e2e8f0 0)`;
  const taxBarGradient = `linear-gradient(90deg, #10b981 0%, #f59e0b ${dashboard.tax.progressPct}%, #e2e8f0 ${dashboard.tax.progressPct}%)`;

  return (
    <div className="dashboard-container">
      {/* Company Profile */}
      <div className="company-profile">
        <div className="company-icon">
          <i className="fa-solid fa-building"></i>
        </div>
        <div className="company-details">
          <h4>Warung Pixel Sdn Bhd</h4>
          <p>SST: W10-1234-56789012</p>
        </div>
      </div>

      {/* Compliance Widget */}
      <div className="widget compliance-widget">
        <div className="compliance-circle" style={{ background: complianceGradient }}>
          <div className="compliance-inner">
            <span className="score">{dashboard.compliance}</span>
            <span className="label">COMPLIANCE</span>
          </div>
        </div>
      </div>

      {/* Tax Bracket Widget */}
      <div className="widget tax-widget">
        <p className="widget-title">
          <i className="fa-solid fa-scale-balanced"></i> TAX BRACKET
        </p>
        <div className="tax-bar-container">
          <div className="tax-progress" style={{ background: taxBarGradient }}></div>
          <div className="tax-markers">
            <div className={`marker ${dashboard.tax.rate === 15 ? "active" : ""}`}>
              <span className="pct">15%</span>
              <span className="range">≤150k</span>
            </div>
            <div className={`marker ${dashboard.tax.rate === 17 ? "active" : ""}`}>
              <span className="pct">17%</span>
              <span className="range">150-600k</span>
            </div>
            <div className={`marker ${dashboard.tax.rate === 24 ? "active" : ""}`}>
              <span className="pct">24%</span>
              <span className="range">&gt;600k</span>
            </div>
          </div>
        </div>
        <p className="tax-subtitle">
          <span className="highlight">
            RM{dashboard.tax.untilNext.toLocaleString("en-US")}
          </span>{" "}
          until next bracket
        </p>
      </div>

      {/* Month-to-Date Widget */}
      <div className="widget mtd-widget">
        <p className="widget-title">MONTH-TO-DATE</p>
        <div className="mtd-list">
          <div className="mtd-item">
            <span className="mtd-label">
              <i className="fa-solid fa-arrow-trend-up"></i> Revenue
            </span>
            <span className={`mtd-value ${dashboard.revenue >= 0 ? "text-green" : "text-red"}`}>
              RM{dashboard.revenue.toLocaleString("en-US")}
            </span>
          </div>
          <div className="mtd-item">
            <span className="mtd-label">
              <i className="fa-solid fa-file-invoice"></i> Expenses
            </span>
            <span className={`mtd-value ${dashboard.expenses > 50000 ? "text-red" : "text-orange"}`}>
              RM{dashboard.expenses.toLocaleString("en-US")}
            </span>
          </div>
          <div className="mtd-item">
            <span className="mtd-label">
              <i className="fa-regular fa-clock"></i> Pending
            </span>
            <span className={`mtd-value ${dashboard.pending > 5 ? "text-red" : ""}`}>
              {dashboard.pending} invoices
            </span>
          </div>
          <div className="mtd-item">
            <span className="mtd-label">
              <i className="fa-solid fa-droplet"></i> Liquidity
            </span>
            <span className={`mtd-value ${dashboard.liquidity < 1.0 ? "text-red" : "text-blue"}`}>
              {dashboard.liquidity}x
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
