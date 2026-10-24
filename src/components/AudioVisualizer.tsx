import React, { useEffect, useRef } from 'react';
import { AssistantState, MoodConfig } from '../types';

interface AudioVisualizerProps {
  state: AssistantState;
  mood: MoodConfig;
  micVolume: number; // 0 to 1
  analyser: AnalyserNode | null;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  state,
  mood,
  micVolume,
  analyser,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);
  const smoothedVolRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const freqData = new Uint8Array(64);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.26;

      phaseRef.current += 0.035;
      const phase = phaseRef.current;

      // Extract output audio frequency if speaking
      let modelVolume = 0;
      if (analyser && state === 'speaking') {
        analyser.getByteFrequencyData(freqData);
        let sum = 0;
        for (let i = 0; i < freqData.length; i++) {
          sum += freqData[i];
        }
        modelVolume = Math.min(1, (sum / freqData.length / 128) * 1.5);
      }

      // Smooth volume interpolation
      const targetVol = state === 'speaking' ? modelVolume : state === 'listening' ? micVolume : 0.08;
      smoothedVolRef.current += (targetVol - smoothedVolRef.current) * 0.18;
      const currentVol = smoothedVolRef.current;

      // Draw background ambient bloom
      const bloomGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.2,
        centerX,
        centerY,
        baseRadius * (1.8 + currentVol * 0.9)
      );
      bloomGrad.addColorStop(0, mood.primaryGlow);
      bloomGrad.addColorStop(0.6, mood.secondaryGlow);
      bloomGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = bloomGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // State-specific rendering
      if (state === 'idle') {
        // Idle: Gentle breathing celestial rings
        const breathe = Math.sin(phase * 0.8) * 6;
        for (let r = 1; r <= 3; r++) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, baseRadius + r * 18 + breathe, 0, Math.PI * 2);
          ctx.strokeStyle = r === 1 ? mood.accentColor : 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = r === 1 ? 1.8 : 1;
          ctx.setLineDash(r === 2 ? [6, 8] : []);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      } else if (state === 'connecting') {
        // Connecting: High-speed orbital arcs
        for (let i = 0; i < 3; i++) {
          const speed = (i + 1) * 1.8;
          const arcAngle = (phase * speed + (i * Math.PI) / 2) % (Math.PI * 2);
          ctx.beginPath();
          ctx.arc(centerX, centerY, baseRadius + i * 16, arcAngle, arcAngle + Math.PI * 0.7);
          ctx.strokeStyle = i % 2 === 0 ? mood.accentColor : mood.haloColor;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = mood.accentColor;
          ctx.shadowBlur = 12;
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      } else if (state === 'listening') {
        // Listening: Reactive mic ripple rings & soundwave ripples
        const ringsCount = 4;
        for (let i = 0; i < ringsCount; i++) {
          const ringProgress = (phase * 0.5 + i / ringsCount) % 1;
          const ringRadius = baseRadius + ringProgress * 90 * (0.8 + currentVol * 1.2);
          const alpha = (1 - ringProgress) * (0.25 + currentVol * 0.7);

          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = mood.accentColor;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 1.5 + currentVol * 2.5;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }

        // Live mic soundwave circle
        const points = 48;
        ctx.beginPath();
        for (let p = 0; p <= points; p++) {
          const theta = (p / points) * Math.PI * 2;
          const wave = Math.sin(theta * 6 + phase * 4) * (currentVol * 28 + 2);
          const r = baseRadius + 8 + wave;
          const x = centerX + Math.cos(theta) * r;
          const y = centerY + Math.sin(theta) * r;
          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = mood.accentColor;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = mood.accentColor;
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (state === 'speaking') {
        // Speaking: Multi-frequency vibrant harmonic waves
        const bands = 40;
        ctx.beginPath();
        for (let b = 0; b <= bands; b++) {
          const theta = (b / bands) * Math.PI * 2;
          const freqIndex = Math.floor((b / bands) * (freqData.length / 2));
          const freqVal = (freqData[freqIndex] || 0) / 255;
          const pulse = Math.sin(theta * 8 + phase * 6) * 12 * currentVol;
          const r = baseRadius + 10 + freqVal * 42 + pulse;
          const x = centerX + Math.cos(theta) * r;
          const y = centerY + Math.sin(theta) * r;
          if (b === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = mood.haloColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = mood.haloColor;
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Second inner harmonized counter-wave
        ctx.beginPath();
        for (let b = 0; b <= bands; b++) {
          const theta = (b / bands) * Math.PI * 2;
          const freqIndex = Math.floor(((bands - b) / bands) * (freqData.length / 2));
          const freqVal = (freqData[freqIndex] || 0) / 255;
          const pulse = Math.cos(theta * 5 - phase * 5) * 8 * currentVol;
          const r = baseRadius + 2 + freqVal * 26 + pulse;
          const x = centerX + Math.cos(theta) * r;
          const y = centerY + Math.sin(theta) * r;
          if (b === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = mood.accentColor;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [state, mood, analyser]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
