import React, { useRef, useEffect, useState } from 'react';

export interface FilterEffectProps {
  type: 'snow' | 'particles' | 'stars' | 'rain' | 'cherry-blossom';
  intensity: number; // 0-1
  opacity: number; // 0-1
  speed: number; // 0.5-2
  enabled: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  life: number;
  maxLife: number;
}

const FilterEffects: React.FC<FilterEffectProps> = ({ 
  type, 
  intensity, 
  opacity, 
  speed, 
  enabled 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // 初始化 Canvas 大小
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // 創建粒子
  const createParticle = (): Particle => {
    const canvas = canvasRef.current;
    if (!canvas) return {} as Particle;

    const baseSpeed = 0.5 + speed * 1.5;
    // 根據畫布解析度調整粒子大小
    const resolutionScale = Math.max(canvas.width / 1920, canvas.height / 1080) * 2;
    const baseSize = (6 + Math.random() * 12) * resolutionScale;

    switch (type) {
      case 'snow':
        return {
          x: Math.random() * canvas.width,
          y: -10,
          vx: (Math.random() - 0.5) * 0.5,
          vy: baseSpeed + Math.random() * baseSpeed,
          size: baseSize,
          opacity: 0.3 + Math.random() * 0.4,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          color: '#ffffff',
          life: 1,
          maxLife: 1
        };

      case 'particles':
        return {
          x: Math.random() * canvas.width,
          y: -10,
          vx: (Math.random() - 0.5) * 0.8,
          vy: baseSpeed * 0.5 + Math.random() * baseSpeed * 0.7,
          size: baseSize * 1.2,
          opacity: 0.7 + Math.random() * 0.3,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.03,
          color: `hsl(${Math.random() * 360}, 90%, ${60 + Math.random() * 25}%)`,
          life: 1,
          maxLife: 1
        };

      case 'stars':
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          size: (3 + Math.random() * 6) * resolutionScale, // 大幅增加星星大小
          opacity: 0.4 + Math.random() * 0.6,
          rotation: 0,
          rotationSpeed: 0,
          color: '#ffffff',
          life: Math.random() * 3 + 1,
          maxLife: Math.random() * 3 + 1
        };

      case 'rain':
        return {
          x: Math.random() * canvas.width,
          y: -10,
          vx: (Math.random() - 0.5) * 0.2,
          vy: baseSpeed * 2 + Math.random() * baseSpeed,
          size: 1 + Math.random() * 2,
          opacity: 0.2 + Math.random() * 0.3,
          rotation: 0,
          rotationSpeed: 0,
          color: '#ffffff',
          life: 1,
          maxLife: 1
        };

      case 'cherry-blossom':
        return {
          x: Math.random() * canvas.width,
          y: -10,
          vx: (Math.random() - 0.5) * 0.8,
          vy: baseSpeed * 0.6 + Math.random() * baseSpeed * 0.4,
          size: baseSize * 1.2,
          opacity: 0.4 + Math.random() * 0.4,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.03,
          color: `hsl(${320 + Math.random() * 40}, 60%, ${70 + Math.random() * 20}%)`,
          life: 1,
          maxLife: 1
        };

      default:
        return {} as Particle;
    }
  };

  // 繪製粒子
  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.globalAlpha = particle.opacity * opacity;
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);

    switch (type) {
      case 'snow':
        // 繪製六角雪花
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = Math.cos(angle) * particle.size;
          const y = Math.sin(angle) * particle.size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        break;

      case 'particles':
        // 繪製發光粒子 - 使用更簡單但更明顯的設計
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加外圈發光效果
        const outerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 3);
        outerGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        outerGradient.addColorStop(0.7, particle.color + '66');
        outerGradient.addColorStop(1, particle.color + '00');
        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'stars':
        // 繪製精緻閃爍星星
        const twinkle = Math.sin(Date.now() * 0.01 + particle.x + particle.y) * 0.5 + 0.5;
        const currentAlpha = particle.opacity * opacity * (0.3 + twinkle * 0.7);
        
        // 外層光暈
        ctx.save();
        ctx.globalAlpha = currentAlpha * 0.2;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = particle.size * 3;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // 十字光線
        ctx.save();
        ctx.globalAlpha = currentAlpha * 0.8;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1, particle.size * 0.2);
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = particle.size * 1.5;
        
        ctx.beginPath();
        ctx.moveTo(-particle.size * 1.5, 0);
        ctx.lineTo(particle.size * 1.5, 0);
        ctx.moveTo(0, -particle.size * 1.5);
        ctx.lineTo(0, particle.size * 1.5);
        ctx.stroke();
        ctx.restore();
        
        // 星星主體
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = particle.size * 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 重置陰影
        ctx.shadowBlur = 0;
        break;

      case 'rain':
        // 繪製雨滴
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = particle.size;
        ctx.beginPath();
        ctx.moveTo(0, -particle.size * 3);
        ctx.lineTo(0, particle.size * 3);
        ctx.stroke();
        break;

      case 'cherry-blossom':
        // 繪製櫻花花瓣
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, particle.size, particle.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  };

  // 動畫循環
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新和繪製粒子
    const resolutionScale = Math.max(canvas.width / 1920, canvas.height / 1080) * 1.5;
    const maxParticles = Math.floor(intensity * 150 * resolutionScale);
    
    // 添加新粒子（增加隨機性）
    if (particlesRef.current.length < maxParticles && Math.random() < 0.08) {
      particlesRef.current.push(createParticle());
    }

    // 更新現有粒子
    particlesRef.current = particlesRef.current.filter(particle => {
      // 增加隨機擺動效果
      const windEffect = (Math.random() - 0.5) * 0.4;
      const timeEffect = Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.15;
      
      // 更新位置
      particle.x += (particle.vx + windEffect + timeEffect) * speed;
      particle.y += particle.vy * speed;
      particle.rotation += particle.rotationSpeed;

      // 檢查是否超出邊界
      if (type === 'stars') {
        // 星星不移動，只檢查生命週期
        particle.life -= 0.01;
        if (particle.life <= 0) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.life = particle.maxLife;
          particle.opacity = 0.3 + Math.random() * 0.7;
        }
      } else {
        // 其他粒子檢查邊界
        if (particle.y > canvas.height + 20 || 
            particle.x < -20 || 
            particle.x > canvas.width + 20) {
          return false;
        }
      }

      // 繪製粒子
      drawParticle(ctx, particle);
      return true;
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  // 啟動/停止動畫
  useEffect(() => {
    if (enabled) {
      // 清空現有粒子
      particlesRef.current = [];
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, type, intensity, opacity, speed]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        mixBlendMode: type === 'particles' ? 'normal' : 'screen'
      }}
    />
  );
};

export default FilterEffects;