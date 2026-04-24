export interface ChatMessage {
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

export interface DashboardData {
  revenue: number;
  expenses: number;
  pending: number;
  liquidity: number;
  compliance: number;
  tax: {
    rate: number;
    untilNext: number;
    progressPct: number;
  };
}

export interface GraphInput {
  icon: string;
  name: string;
  amount: string;
}

export interface GraphOutcome {
  status: "approved" | "rejected" | "pending";
  title: string;
  description: string;
}
