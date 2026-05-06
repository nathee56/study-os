"use client";

import { motion } from "framer-motion";

export const AnimatedProgressCircle = ({ 
  progress, 
  size = 40, 
  strokeWidth = 4, 
  color = "var(--accent)" 
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number; 
  color?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {/* Background Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="var(--border)"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {/* Progress Circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        strokeLinecap="round"
      />
    </svg>
  );
};

export const AnimatedCheckbox = ({ 
  checked, 
  onChange 
}: { 
  checked: boolean; 
  onChange: () => void;
}) => {
  return (
    <div 
      onClick={onChange}
      style={{
        width: 20,
        height: 20,
        borderRadius: 6,
        border: `2px solid ${checked ? 'var(--accent)' : 'var(--border-strong)'}`,
        background: checked ? 'var(--accent)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {checked && (
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ margin: 'auto' }}
        >
          <motion.path
            d="M2 6L5 9L10 3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </motion.svg>
      )}
    </div>
  );
};
