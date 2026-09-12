import React from "react";

export const GlobeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Topographic radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#8FF075]/8 via-[#3B82F6]/5 to-transparent blur-3xl opacity-60" />
      
      {/* Subtle coordinate dot grid */}
      <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#8FF075" />
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.06" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      {/* Network Node Arcs overlay */}
      <svg className="absolute top-10 right-10 w-[650px] h-[400px] opacity-25 hidden lg:block" viewBox="0 0 650 400">
        <circle cx="120" cy="180" r="4" fill="#8FF075" className="animate-pulse" />
        <circle cx="280" cy="90" r="3" fill="#8FF075" />
        <circle cx="450" cy="140" r="5" fill="#3B82F6" className="animate-pulse" />
        <circle cx="560" cy="260" r="4" fill="#8FF075" />
        <circle cx="340" cy="310" r="3" fill="#8FF075" />

        <path
          d="M 120 180 Q 200 100 280 90 T 450 140 T 560 260"
          fill="none"
          stroke="#8FF075"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          strokeOpacity="0.5"
        />
        <path
          d="M 280 90 Q 320 220 340 310"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="1"
          strokeDasharray="3 3"
          strokeOpacity="0.4"
        />
        <path
          d="M 340 310 Q 480 300 560 260"
          fill="none"
          stroke="#8FF075"
          strokeWidth="1.2"
          strokeDasharray="5 5"
          strokeOpacity="0.4"
        />
      </svg>

      {/* Subtle dark vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0B0D10]/40 to-[#0B0D10]" />
    </div>
  );
};
