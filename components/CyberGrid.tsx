import React, { useEffect, useRef } from 'react';

const CyberGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let accentLines: { orientation: 'h' | 'v'; position: number; gradient: CanvasGradient }[] = [];

    const generateAccentLines = () => {
      accentLines = [
        {
          orientation: 'h',
          position: Math.random() * canvas.height,
          gradient: (() => {
            const g = ctx.createLinearGradient(0, 0, canvas.width, 0);
            g.addColorStop(0, 'rgba(59, 130, 246, 0)');
            g.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)');
            g.addColorStop(1, 'rgba(59, 130, 246, 0)');
            return g;
          })()
        },
        {
          orientation: 'v',
          position: Math.random() * canvas.width,
          gradient: (() => {
            const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
            g.addColorStop(0, 'rgba(139, 92, 246, 0)');
            g.addColorStop(0.5, 'rgba(139, 92, 246, 0.06)');
            g.addColorStop(1, 'rgba(139, 92, 246, 0)');
            return g;
          })()
        }
      ];
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      generateAccentLines();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId: number;
    let time = 0;

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gridSize = Math.max(60, Math.min(100, canvas.width / 25));
      const opacity = 0.015 + Math.sin(time * 0.0008) * 0.005;
      
      ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`;
      ctx.lineWidth = 0.5;

      // Vertical lines with subtle animation
      for (let x = 0; x <= canvas.width; x += gridSize) {
        const offset = Math.sin(time * 0.001 + x * 0.008) * 1;
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines with subtle animation
      for (let y = 0; y <= canvas.height; y += gridSize) {
        const offset = Math.cos(time * 0.001 + y * 0.008) * 1;
        ctx.beginPath();
        ctx.moveTo(0, y + offset);
        ctx.lineTo(canvas.width, y + offset);
        ctx.stroke();
      }

      // Precomputed accent lines
      accentLines.forEach((line) => {
        ctx.strokeStyle = line.gradient;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        if (line.orientation === 'h') {
          ctx.moveTo(0, line.position);
          ctx.lineTo(canvas.width, line.position);
        } else {
          ctx.moveTo(line.position, 0);
          ctx.lineTo(line.position, canvas.height);
        }
        ctx.stroke();
      });

      time += 16;
    };

    const animate = () => {
      drawGrid();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default CyberGrid;
