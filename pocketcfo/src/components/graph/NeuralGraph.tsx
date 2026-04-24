"use client";

import { GraphInput, GraphOutcome } from "@/types";

interface NeuralGraphProps {
  inputs: GraphInput[];
  outcomes: GraphOutcome[];
}

export default function NeuralGraph({ inputs, outcomes }: NeuralGraphProps) {
  return (
    <div className="graph-container">
      <div className="graph-header">
        <h3>NEURAL DECISION GRAPH</h3>
      </div>

      <div className="graph-flow">
        {/* Input Column — DYNAMIC */}
        <div className="graph-col col-inputs">
          {inputs.map((inp, i) => (
            <div
              key={i}
              className="graph-card input-card"
              style={{ animation: "fadeIn 0.3s ease" }}
            >
              <div className="card-icon">
                <i className={`fa-solid ${inp.icon}`}></i>
              </div>
              <div className="card-info">
                <p className="label">INPUT</p>
                <h4>{inp.name}</h4>
                <p className="value">{inp.amount}</p>
              </div>
              <div className="connector-dot right"></div>
            </div>
          ))}
        </div>

        {/* Engine Column */}
        <div className="graph-col col-engine">
          <div className="engine-node">
            <div className="connector-dot left"></div>
            <i className="fa-solid fa-brain"></i>
            <div className="connector-dot right"></div>
          </div>
          <p className="engine-label">POCKETCFO ENGINE</p>
        </div>

        {/* Outcome Column — DYNAMIC */}
        <div className="graph-col col-outcomes">
          {outcomes.map((out, i) => {
            const statusIcon =
              out.status === "rejected"
                ? "fa-circle-xmark"
                : out.status === "approved"
                ? "fa-circle-check"
                : "fa-clock";
            const statusLabel = out.status.toUpperCase();
            return (
              <div
                key={i}
                className={`graph-card outcome-card ${out.status}`}
                style={{ animation: "fadeIn 0.3s ease" }}
              >
                <div className="connector-dot left"></div>
                <div className="outcome-header">
                  <i className={`fa-solid ${statusIcon}`}></i> {statusLabel}
                </div>
                <h4>{out.title}</h4>
                <p>{out.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
