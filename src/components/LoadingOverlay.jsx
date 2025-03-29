/* eslint-disable no-unused-vars */
import React from "react";
import "./LoadingOverlay.css";

const LoadingOverlay = () => {
  return (
    <div className="loading-overlay">
      <div className="ai-animation">
        <div className="ai-brain">
          <div className="brain-circle"></div>
          <div className="brain-circuit-1"></div>
          <div className="brain-circuit-2"></div>
          <div className="brain-circuit-3"></div>
        </div>
        <div className="pulse-circles">
          <div className="pulse-circle pulse-circle-1"></div>
          <div className="pulse-circle pulse-circle-2"></div>
          <div className="pulse-circle pulse-circle-3"></div>
        </div>
      </div>
      <p>AI đang làm việc, vui lòng đợi...</p>
    </div>
  );
};

export default LoadingOverlay;
