import React from "react";
import "./loader.css"; // CSS 文件中設計動畫樣式

const Loader = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="loader-overlay">
      <div className="loader"></div>
    </div>
  );
};

export default Loader;
