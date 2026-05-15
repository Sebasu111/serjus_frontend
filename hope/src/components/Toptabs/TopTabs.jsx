// components/TopTabs.jsx

import React from "react";

const TopTabs = ({ options = [], active, onChange }) => {
    return (
        <div
            style={{
                borderBottom: "2px solid #e0e0e0",
                backgroundColor: "#f8f9fa",
                padding: "0 20px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    gap: 0,
                    flexWrap: "wrap",
                }}
            >
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        style={navBtn(active === opt.value)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const navBtn = (isActive) => ({
    padding: "12px 24px",
    border: "none",
    backgroundColor: isActive ? "#023047" : "transparent",
    color: isActive ? "white" : "#023047",
    cursor: "pointer",
    borderBottom: isActive
        ? "2px solid #023047"
        : "2px solid transparent",
    fontFamily: '"Inter", sans-serif',
    fontWeight: "600",
    transition: "all 0.2s",
});

export default TopTabs;