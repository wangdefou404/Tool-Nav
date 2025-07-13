import React from "react";
import "./index.css";

export const Loading = (props: any) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      <p className="loading-text">正在加载AI工具...</p>
    </div>
  );
};
