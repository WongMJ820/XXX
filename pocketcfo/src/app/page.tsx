"use client";

// ═══════════════════════════════════════════════════════════════
// PocketCFO — Main Page (Teammate's Design — EXACT MATCH)
// 3-Panel: Dashboard | Chat | Neural Graph
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from "react";
import { DashboardData, GraphInput, GraphOutcome, ChatMessage } from "@/types";
import DashboardPanel from "@/components/dashboard/DashboardPanel";
import ChatPanel from "@/components/chat/ChatPanel";
import NeuralGraph from "@/components/graph/NeuralGraph";
import { getDemoResponse } from "@/lib/engine";

export default function Home() {
  // ─── Dashboard State ────────────────────────────────────────
  const [dashboard, setDashboard] = useState<DashboardData>({
    revenue: 48200,
    expenses: 38500,
    pending: 3,
    liquidity: 1.8,
    compliance: 94,
    tax: { rate: 17, untilNext: 80000, progressPct: 60 },
  });

  // ─── Chat State ─────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: "Hello there! I've analyzed your cashflow for this month. Please upload any new receipts or ask me before making large purchases.",
      sender: "bot",
      timestamp: "12:00 PM",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Graph State ──────────────────────────────────────────────
  const [graphInputs, setGraphInputs] = useState<GraphInput[]>([
    { icon: "fa-receipt", name: "IKEA Receipt", amount: "RM7,850.00" },
    { icon: "fa-file-invoice", name: "Pelita Invoice", amount: "RM485.60" },
    { icon: "fa-laptop", name: "Dell Purchase", amount: "RM12,500.00" },
  ]);
  const [graphOutcomes, setGraphOutcomes] = useState<GraphOutcome[]>([
    { status: "rejected", title: "Request TIN from Pelita", description: "LHDN non-compliant — RM20k penalty risk" },
    { status: "approved", title: "Reclassify as Capital Allowance", description: "Save RM1,884 in current FY" },
    { status: "pending", title: "Delay purchase to May", description: "Avoid 24% bracket, preserve liquidity" },
  ]);

  // ─── Scroll to bottom ───────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // ─── Send Message ───────────────────────────────────────────
  // ─── File Upload Handler ──────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      setInputValue(`[📎 ${file.name}] `);
    }
  };

  // ─── Send Message ───────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = inputValue.trim();
    if (!message && !attachedFile) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const displayText = attachedFile
      ? `📎 Uploaded: ${attachedFile.name}${message.replace(`[📎 ${attachedFile.name}] `, '') ? ' — ' + message.replace(`[📎 ${attachedFile.name}] `, '') : ''}`
      : message;
    const analyzeText = attachedFile
      ? `Analyze this uploaded document: ${attachedFile.name}. ${message}`
      : message;

    setMessages((prev) => [...prev, { text: displayText, sender: "user", timestamp: time }]);
    setInputValue("");
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Show typing indicator
    setIsTyping(true);

    try {
      // Call Z.AI API
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: analyzeText }),
      });

      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (res.ok) {
        const data = await res.json();
        const decision = data.decision;

        // Build bot response from AI decision
        const botText = decision?.decision_logic?.recommendation
          || decision?.ui_component?.display_message
          || "I've analyzed that transaction. Check the dashboard for updates.";

        setIsTyping(false);
        setMessages((prev) => [...prev, { text: botText, sender: "bot", timestamp: botTime }]);

        // Update dashboard based on AI response
        if (decision?.extracted_data) {
          const expenseAmount = decision.extracted_data.amount_myr || 0;
          const isCompliant = decision.extracted_data.is_lhdn_compliant;

          setDashboard((prev) => {
            const newExpenses = prev.expenses + expenseAmount;
            const newCompliance = isCompliant
              ? prev.compliance
              : Math.max(prev.compliance - 12, 0);
            const newPending = prev.pending + 1;

            return {
              ...prev,
              expenses: newExpenses,
              pending: newPending,
              compliance: newCompliance,
              liquidity: Number((prev.revenue / newExpenses).toFixed(1)),
            };
          });
        }
      } else {
        // API error — smart demo fallback
        const demoResult = getDemoResponse(analyzeText, dashboard);
        if (demoResult.graphInput) {
          setGraphInputs((prev) => [demoResult.graphInput, ...prev].slice(0, 3));
          setGraphOutcomes((prev) => [demoResult.graphOutcome, ...prev].slice(0, 3));
        }
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { text: demoResult.botText, sender: "bot", timestamp: botTime },
        ]);
        setDashboard(demoResult.newDashboard);
      }
    } catch {
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const demoResult = getDemoResponse(analyzeText, dashboard);
      if (demoResult.graphInput) {
        setGraphInputs((prev) => [demoResult.graphInput, ...prev].slice(0, 3));
        setGraphOutcomes((prev) => [demoResult.graphOutcome, ...prev].slice(0, 3));
      }
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { text: demoResult.botText, sender: "bot", timestamp: botTime },
      ]);
      setDashboard(demoResult.newDashboard);
    }
  };

  return (
    <div className="main-container">
      {/* ═══ LEFT — DASHBOARD ═══ */}
      <DashboardPanel dashboard={dashboard} />

      {/* ═══ CENTER — CHAT ═══ */}
      <ChatPanel
        messages={messages}
        isTyping={isTyping}
        inputValue={inputValue}
        attachedFile={attachedFile}
        onInputChange={setInputValue}
        onFileSelect={handleFileSelect}
        onSubmit={handleSubmit}
      />

      {/* ═══ RIGHT — NEURAL GRAPH ═══ */}
      <NeuralGraph inputs={graphInputs} outcomes={graphOutcomes} />
    </div>
  );
}
