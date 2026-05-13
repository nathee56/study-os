"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 35,
        mass: 0.6,
      }}
      className="page-transition-wrapper"
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </motion.div>
  );
}
