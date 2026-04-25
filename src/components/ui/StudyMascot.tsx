'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type MascotState = 'idle' | 'studying' | 'busy' | 'celebrating' | 'sleeping';

interface StudyMascotProps {
  pendingTodos: number;
  completedTodos: number;
  totalTodos: number;
}

const MESSAGES: Record<MascotState, string[]> = {
  idle: ['พร้อมช่วยเหลือคุณเสมอ! 💪', 'วันนี้จะเรียนอะไรดี? 📚', 'สู้ๆ นะครับ! ✨'],
  studying: ['ตั้งใจเรียนดีมาก! 📖', 'เก่งมากเลย! 🌟', 'ค่อยๆ ทำไปนะ 💡'],
  busy: ['งานเยอะเลย สู้ๆ! 🔥', 'ทำทีละอย่างนะ 💪', 'อย่าลืมพักบ้างนะ ☕'],
  celebrating: ['ยอดเยี่ยม!! 🎉', 'เก่งมากๆ เลย! 🏆', 'สุดยอด!! 🌈'],
  sleeping: ['ดึกแล้ว พักผ่อนนะ 🌙', 'นอนพักก่อนนะ 😴', 'ราตรีสวัสดิ์ ⭐'],
};

function getMascotState(pending: number, completed: number, total: number): MascotState {
  const hour = new Date().getHours();
  
  if (hour >= 23 || hour < 5) return 'sleeping';
  if (total > 0 && completed === total) return 'celebrating';
  if (pending >= 5) return 'busy';
  if (pending > 0) return 'studying';
  return 'idle';
}

// SVG Mascot - Cute Owl
function OwlSVG({ state }: { state: MascotState }) {
  const eyeVariants = {
    open: { scaleY: 1 },
    blink: { scaleY: 0.1 },
    sleeping: { scaleY: 0.15 },
  };

  const bodyColor = state === 'celebrating' ? '#F07A30' : state === 'busy' ? '#E8651A' : '#D45A15';

  return (
    <svg viewBox="0 0 120 120" width="80" height="80" style={{ overflow: 'visible' }}>
      {/* Body */}
      <motion.ellipse
        cx="60" cy="72" rx="35" ry="32"
        fill={bodyColor}
        animate={{ 
          scale: state === 'celebrating' ? [1, 1.05, 1] : 1,
        }}
        transition={{ repeat: state === 'celebrating' ? Infinity : 0, duration: 0.6 }}
      />
      
      {/* Belly */}
      <ellipse cx="60" cy="78" rx="22" ry="20" fill="#FBE8DA" />
      
      {/* Head */}
      <circle cx="60" cy="45" r="28" fill={bodyColor} />
      
      {/* Face disc */}
      <ellipse cx="60" cy="48" rx="22" ry="20" fill="#FFF5EE" />
      
      {/* Ears/Horns */}
      <motion.polygon
        points="38,22 44,38 32,36"
        fill={bodyColor}
        animate={{ rotate: state === 'busy' ? [-5, 5, -5] : 0 }}
        transition={{ repeat: state === 'busy' ? Infinity : 0, duration: 0.8 }}
        style={{ transformOrigin: '38px 30px' }}
      />
      <motion.polygon
        points="82,22 76,38 88,36"
        fill={bodyColor}
        animate={{ rotate: state === 'busy' ? [5, -5, 5] : 0 }}
        transition={{ repeat: state === 'busy' ? Infinity : 0, duration: 0.8 }}
        style={{ transformOrigin: '82px 30px' }}
      />
      
      {/* Left Eye */}
      <motion.ellipse
        cx="49" cy="46" rx="8" ry="9"
        fill="#1A1816"
        variants={eyeVariants}
        animate={state === 'sleeping' ? 'sleeping' : 'open'}
        style={{ transformOrigin: '49px 46px' }}
      />
      <circle cx="47" cy="43" r="3" fill="white" opacity="0.8" />
      
      {/* Right Eye */}
      <motion.ellipse
        cx="71" cy="46" rx="8" ry="9"
        fill="#1A1816"
        variants={eyeVariants}
        animate={state === 'sleeping' ? 'sleeping' : 'open'}
        style={{ transformOrigin: '71px 46px' }}
      />
      <circle cx="69" cy="43" r="3" fill="white" opacity="0.8" />
      
      {/* Beak */}
      <polygon points="56,54 60,60 64,54" fill="#FFB347" />
      
      {/* Blush */}
      <circle cx="40" cy="54" r="5" fill="#FFB6C1" opacity="0.4" />
      <circle cx="80" cy="54" r="5" fill="#FFB6C1" opacity="0.4" />
      
      {/* Book (when studying) */}
      {state === 'studying' && (
        <g>
          <rect x="40" y="82" width="20" height="16" rx="2" fill="#4285F4" />
          <rect x="42" y="84" width="16" height="12" rx="1" fill="#E8F0FE" />
          <line x1="50" y1="84" x2="50" y2="96" stroke="#4285F4" strokeWidth="0.8" />
        </g>
      )}
      
      {/* Party hat (celebrating) */}
      {state === 'celebrating' && (
        <g>
          <polygon points="60,8 52,30 68,30" fill="#FFD700" />
          <circle cx="60" cy="8" r="4" fill="#FF6B6B" />
          {/* Confetti */}
          <motion.circle cx="30" cy="15" r="2" fill="#FF6B6B"
            animate={{ y: [0, 40], opacity: [1, 0], x: [-5, -15] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
          />
          <motion.circle cx="90" cy="20" r="2" fill="#4285F4"
            animate={{ y: [0, 35], opacity: [1, 0], x: [5, 15] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
          />
          <motion.rect x="75" y="10" width="4" height="4" fill="#FFD700" rx="1"
            animate={{ y: [0, 45], opacity: [1, 0], rotate: [0, 180] }}
            transition={{ repeat: Infinity, duration: 1.8, delay: 0.6 }}
          />
        </g>
      )}
      
      {/* ZZZ (sleeping) */}
      {state === 'sleeping' && (
        <g>
          <motion.text x="78" y="30" fontSize="14" fill="var(--text-hint)" fontWeight="bold"
            animate={{ opacity: [0, 1, 0], y: [30, 20] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0 }}
          >z</motion.text>
          <motion.text x="88" y="22" fontSize="10" fill="var(--text-hint)" fontWeight="bold"
            animate={{ opacity: [0, 1, 0], y: [22, 12] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
          >z</motion.text>
          <motion.text x="95" y="16" fontSize="8" fill="var(--text-hint)" fontWeight="bold"
            animate={{ opacity: [0, 1, 0], y: [16, 6] }}
            transition={{ repeat: Infinity, duration: 2, delay: 1 }}
          >z</motion.text>
        </g>
      )}
      
      {/* Fire (busy) */}
      {state === 'busy' && (
        <motion.text x="85" y="35" fontSize="20"
          animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          style={{ transformOrigin: '85px 35px' }}
        >🔥</motion.text>
      )}
    </svg>
  );
}

export default function StudyMascot({ pendingTodos, completedTodos, totalTodos }: StudyMascotProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showMessage, setShowMessage] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  const mascotState = useMemo(
    () => getMascotState(pendingTodos, completedTodos, totalTodos),
    [pendingTodos, completedTodos, totalTodos]
  );

  const messages = MESSAGES[mascotState];

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [messages.length]);

  // Show message briefly, then hide
  useEffect(() => {
    setShowMessage(true);
    const timer = setTimeout(() => setShowMessage(false), 6000);
    return () => clearTimeout(timer);
  }, [messageIndex]);

  return (
    <motion.div
      className="study-mascot"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 1 }}
      style={{
        position: 'fixed',
        bottom: 80,
        right: 24,
        zIndex: 45,
        cursor: 'pointer',
      }}
      onClick={() => {
        if (isMinimized) {
          setIsMinimized(false);
          setShowMessage(true);
        } else {
          setShowMessage(!showMessage);
        }
      }}
    >
      {/* Speech Bubble */}
      <AnimatePresence>
        {showMessage && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              marginBottom: 8,
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 14,
              padding: '10px 16px',
              fontSize: 13,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              pointerEvents: 'none',
            }}
          >
            {messages[messageIndex]}
            {/* Bubble tail */}
            <div style={{
              position: 'absolute',
              bottom: -6,
              right: 30,
              width: 12,
              height: 12,
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              borderTop: 'none',
              borderLeft: 'none',
              transform: 'rotate(45deg)',
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          y: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
        }}
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))',
        }}
      >
        <OwlSVG state={mascotState} />
      </motion.div>

      {/* Minimize button */}
      {!isMinimized && (
        <button
          onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            fontSize: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-hint)',
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
          className="mascot-close"
        >
          ×
        </button>
      )}

      {/* Minimized state */}
      {isMinimized && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--orange)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            boxShadow: '0 4px 16px rgba(232, 101, 26, 0.3)',
          }}
        >
          🦉
        </motion.div>
      )}
    </motion.div>
  );
}
