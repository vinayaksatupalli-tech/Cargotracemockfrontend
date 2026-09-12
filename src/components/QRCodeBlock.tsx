import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRCodeBlockProps {
  value: string;
  size?: number;
  label?: string;
}

export const QRCodeBlock: React.FC<QRCodeBlockProps> = ({ value, size = 160, label }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 1,
          color: {
            dark: "#0B0D10",
            light: "#8FF075",
          },
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error);
        }
      );
    }
  }, [value, size]);

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#161A20] border border-white/10 shadow-inner inline-block">
      <div className="p-2 rounded-lg bg-[#8FF075] shadow-md">
        <canvas ref={canvasRef} className="block rounded" />
      </div>
      {label && (
        <span className="mt-2 text-[10px] font-mono text-white/50 text-center tracking-wider break-all max-w-[180px]">
          {label}
        </span>
      )}
    </div>
  );
};
