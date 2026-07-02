import React from "react";
import { motion } from "motion/react";

interface SuspectAvatarProps {
  seed: string;
  stressLevel: number;
  gender: "male" | "female";
}

export const SuspectAvatar: React.FC<SuspectAvatarProps> = ({ seed, stressLevel, gender }) => {
  // Determine nervousness characteristics
  const isNervous = stressLevel > 75;
  const isSlightlyNervous = stressLevel > 50 && stressLevel <= 75;

  // Sweat beads animation
  const sweatBeads = isNervous ? [1, 2, 3] : isSlightlyNervous ? [1] : [];

  // Face shake intensity based on stress
  const shakeAnimation = isNervous
    ? {
        x: [0, -1.5, 1.5, -1, 1, 0],
        y: [0, 1, -1, 0.5, -0.5, 0],
        transition: { repeat: Infinity, duration: 0.35 }
      }
    : isSlightlyNervous
    ? {
        x: [0, -0.5, 0.5, 0],
        transition: { repeat: Infinity, duration: 0.8 }
      }
    : {};

  // Color theme per suspect
  const getAvatarColors = () => {
    switch (seed) {
      case "yasser":
        return {
          skin: "#e0ac91",
          hair: "#1a1a1a",
          eyes: "#3d2314",
          clothes: "#1f2937",
          accessory: "#374151", // Shemagh/Tagiyah style or simple collar
        };
      case "olivia":
        return {
          skin: "#f3c1b0",
          hair: "#e2ba5e",
          eyes: "#4682b4",
          clothes: "#10b981",
          accessory: "#fbbf24", // Yellow straw hat
        };
      case "karim":
        return {
          skin: "#c58f70",
          hair: "#2b2b2b",
          eyes: "#2d3748",
          clothes: "#3b82f6",
          accessory: "#1e3a8a", // Suit tie
        };
      case "fatima":
        return {
          skin: "#dfa38a",
          hair: "#22252a",
          eyes: "#5c4033",
          clothes: "#4b5563",
          accessory: "#e5e7eb", // Light Hijab
        };
      case "lichen":
        return {
          skin: "#fed7aa",
          hair: "#111827",
          eyes: "#111827",
          clothes: "#4338ca",
          accessory: "#f43f5e", // Red scarf / badge
        };
      default:
        return {
          skin: "#f3a58c",
          hair: "#2b2b2b",
          eyes: "#3d2314",
          clothes: "#4b5563",
          accessory: "#6b7280",
        };
    }
  };

  const colors = getAvatarColors();

  return (
    <div id="avatar-container" className="relative w-48 h-48 mx-auto flex items-center justify-center bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-inner shadow-black/80">
      {/* Background radial glow that turns amber/red when nervous */}
      <div
        id="avatar-glow"
        className={`absolute inset-0 transition-all duration-700 opacity-20 ${
          isNervous
            ? "bg-radial from-red-600 to-transparent"
            : isSlightlyNervous
            ? "bg-radial from-amber-500 to-transparent"
            : "bg-radial from-emerald-500 to-transparent"
        }`}
      />

      <motion.svg
        id="avatar-svg"
        animate={shakeAnimation}
        viewBox="0 0 100 100"
        className="w-40 h-40 drop-shadow-2xl select-none"
      >
        {/* Background base neck & collar */}
        <path d="M 42 75 L 42 65 Q 50 67 58 65 L 58 75 Z" fill={colors.skin} stroke="#1e293b" strokeWidth="1.5" />
        
        {/* Clothing / Torso */}
        <path d="M 25 80 Q 25 70 38 68 L 62 68 Q 75 70 75 80 Z" fill={colors.clothes} stroke="#1e293b" strokeWidth="1.5" />
        
        {/* Suit V-neck or dress design */}
        {seed === "karim" && (
          <>
            <path d="M 45 68 L 50 78 L 55 68 Z" fill="#ffffff" />
            <path d="M 48 71 L 50 78 L 52 71 Z" fill={colors.accessory} /> {/* Tie */}
          </>
        )}

        {/* Head Base */}
        <circle cx="50" cy="46" r="21" fill={colors.skin} stroke="#1e293b" strokeWidth="1.5" />

        {/* Hijab for Fatima */}
        {seed === "fatima" && (
          <>
            {/* Inner hijab wrap */}
            <path d="M 33 40 Q 50 31 67 40 Q 69 58 64 63 Q 50 67 36 63 Q 31 56 33 40 Z" fill="#2d3748" opacity="0.3" />
            {/* Outer Hijab frame */}
            <path d="M 27 38 C 27 20 73 20 73 38 C 73 52 68 66 68 70 C 50 74 50 74 32 70 C 32 66 27 52 27 38 Z" fill={colors.accessory} stroke="#1e293b" strokeWidth="1.5" />
            {/* Re-render face opening over the outer frame */}
            <path d="M 36 40 C 36 32 64 32 64 40 C 64 54 60 63 50 63 C 40 63 36 54 36 40 Z" fill={colors.skin} />
          </>
        )}

        {/* Hair Styles */}
        {seed === "yasser" && (
          <>
            {/* Slicked back clean hair */}
            <path d="M 29 42 Q 50 20 71 42 Q 50 30 29 42 Z" fill={colors.hair} stroke="#1e293b" strokeWidth="1" />
            {/* Slight mustache */}
            <path d="M 44 55 Q 50 51 56 55 Q 50 53 44 55 Z" fill={colors.hair} stroke="#1e293b" strokeWidth="0.75" />
          </>
        )}

        {seed === "olivia" && (
          <>
            {/* Ponytail sides */}
            <path d="M 28 46 Q 22 55 24 60 Z" fill={colors.hair} stroke="#1e293b" strokeWidth="1" />
            <path d="M 72 46 Q 78 55 76 60 Z" fill={colors.hair} stroke="#1e293b" strokeWidth="1" />
            {/* Golden locks / top hair */}
            <path d="M 30 38 Q 50 22 70 38 C 65 24 35 24 30 38 Z" fill={colors.hair} stroke="#1e293b" strokeWidth="1" />
            {/* Straw Hat */}
            <path d="M 18 36 Q 50 28 82 36 L 78 32 Q 50 24 22 32 Z" fill={colors.accessory} stroke="#1e293b" strokeWidth="1" />
            <path d="M 35 30 Q 50 18 65 30 Z" fill={colors.accessory} stroke="#1e293b" strokeWidth="1" />
            {/* Hat band */}
            <path d="M 34 29 Q 50 24 66 29" stroke="#991b1b" strokeWidth="1.5" fill="none" />
          </>
        )}

        {seed === "karim" && (
          <>
            {/* Neat hair and beard */}
            <path d="M 30 38 Q 50 18 70 38 C 68 28 32 28 30 38 Z" fill={colors.hair} />
            <path d="M 31 46 C 31 58 69 58 69 46 L 65 52 C 60 62 40 62 35 52 Z" fill={colors.hair} opacity="0.9" />
          </>
        )}

        {seed === "lichen" && (
          <>
            {/* Straight neat short hair */}
            <path d="M 29 44 C 29 25 71 25 71 44 C 65 33 35 33 29 44 Z" fill={colors.hair} />
            {/* Glasses */}
            <rect x="36" y="41" width="10" height="6" rx="1.5" fill="none" stroke="#22c55e" strokeWidth="1" />
            <rect x="54" y="41" width="10" height="6" rx="1.5" fill="none" stroke="#22c55e" strokeWidth="1" />
            <line x1="46" y1="44" x2="54" y2="44" stroke="#22c55e" strokeWidth="1" />
          </>
        )}

        {/* Eyes (Change pupil size or wide eyelids when nervous) */}
        {isNervous ? (
          <>
            {/* Wide eyes */}
            <ellipse cx="42" cy="44" rx="4" ry="4" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
            <circle cx="42" cy="44" r="1.5" fill={colors.eyes} />
            
            <ellipse cx="58" cy="44" rx="4" ry="4" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
            <circle cx="58" cy="44" r="1.5" fill={colors.eyes} />

            {/* Sweating visual effects */}
            <ellipse cx="40" cy="38" rx="1.5" ry="0.5" fill="#1e293b" /> {/* Angry/worried brow */}
            <ellipse cx="60" cy="38" rx="1.5" ry="0.5" fill="#1e293b" />
          </>
        ) : (
          <>
            {/* Normal eyes */}
            <ellipse cx="42" cy="44" rx="3.5" ry="2.5" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
            <circle cx="42" cy="44" r="1.8" fill={colors.eyes} />
            
            <ellipse cx="58" cy="44" rx="3.5" ry="2.5" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
            <circle cx="58" cy="44" r="1.8" fill={colors.eyes} />

            {/* Soft eyebrows */}
            <path d="M 37 39 Q 42 37 46 40" stroke="#1e293b" strokeWidth="1" fill="none" />
            <path d="M 63 39 Q 58 37 54 40" stroke="#1e293b" strokeWidth="1" fill="none" />
          </>
        )}

        {/* Nose */}
        <path d="M 50 43 L 48 49 L 52 49 Z" fill="#000000" opacity="0.12" />

        {/* Mouth (Adjust smile/frown based on stress/character) */}
        {isNervous ? (
          // Shaking nervous mouth
          <path d="M 44 54 Q 50 56 56 54" stroke="#1e293b" strokeWidth="1.5" fill="none" />
        ) : seed === "fatima" ? (
          // Sad/drooping mouth for distressed mother
          <path d="M 44 55 Q 50 51 56 55" stroke="#1e293b" strokeWidth="1.25" fill="none" />
        ) : seed === "olivia" ? (
          // Sweet smile for friendly tourist
          <path d="M 44 52 Q 50 58 56 52" stroke="#1e293b" strokeWidth="1.5" fill="none" />
        ) : (
          // Neutral mouth
          <path d="M 45 53 Q 50 55 55 53" stroke="#1e293b" strokeWidth="1.25" fill="none" />
        )}

        {/* Sweating Beads (Drips rolling down side of face) */}
        {sweatBeads.map((bead, idx) => (
          <motion.circle
            key={bead}
            cx={idx === 0 ? "35" : idx === 1 ? "63" : "38"}
            cy="42"
            r="1"
            fill="#38bdf8"
            animate={{
              y: [0, 8, 12],
              opacity: [0, 1, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.8 + idx * 0.4,
              ease: "easeIn",
            }}
          />
        ))}
      </motion.svg>

      {/* Floating stress indicator pill */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-black/70 border border-slate-700/60 px-2.5 py-1 rounded-full text-[10px] font-mono">
        <span className="text-slate-400">التوتر:</span>
        <span
          className={`font-bold transition-colors ${
            isNervous ? "text-red-400 animate-pulse" : isSlightlyNervous ? "text-amber-400" : "text-emerald-400"
          }`}
        >
          {stressLevel}%
        </span>
      </div>
    </div>
  );
};
