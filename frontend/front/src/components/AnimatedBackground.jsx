import React, { useRef, useMemo, useEffect, useState } from 'react';

const AnimatedBackground = ({ children }) => {
  const containerRef = useRef(null);
  const cursorRef = useRef({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const particles = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    color: ['#60a5fa', '#818cf8', '#a78bfa', '#ffffff'][Math.floor(Math.random() * 4)],
    left: Math.random() * 100,
    top: Math.random() * 100,
    opacity: Math.random() * 0.6 + 0.3,
    duration: Math.random() * 25 + 20,
    delay: Math.random() * -30,
    xOffset: Math.random() * 100 - 50,
  })), []);

  const floatingIcons = useMemo(() => [
    { icon: '⚕️', size: '4rem', top: 15, left: 12, depth: 3 },
    { icon: '💊', size: '3.5rem', top: 65, left: 85, depth: 2.5 },
    { icon: '🩺', size: '3rem', top: 45, left: 8, depth: 2 },
    { icon: '🧬', size: '3.5rem', top: 25, left: 88, depth: 3.5 },
    { icon: '💉', size: '2.5rem', top: 80, left: 15, depth: 2 },
    { icon: '🫀', size: '3rem', top: 35, left: 75, depth: 2.8 },
  ], []);

  useEffect(() => {
    let rafId;
    const handleMouseMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        cursorRef.current = { x, y };
        setMousePos({ x: e.clientX, y: e.clientY });

        if (containerRef.current) {
          containerRef.current.style.setProperty('--cursor-x', x.toFixed(3));
          containerRef.current.style.setProperty('--cursor-y', y.toFixed(3));
          containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
          containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
        }
      });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full">
      <div
        ref={containerRef}
        className="fixed inset-0 w-full h-full overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #1e3a8a 40%, #2d1b4e 70%, #1e293b 100%)',
          zIndex: 0,
          '--cursor-x': 0,
          '--cursor-y': 0,
          '--mouse-x': '50%',
          '--mouse-y': '50%',
        }}
      >
        <style jsx>{`
          @keyframes particleFloat {
            0% { 
              transform: translateY(100vh) translateX(0) rotate(0deg) scale(0); 
              opacity: 0; 
            }
            10% { 
              opacity: 1; 
              transform: translateY(90vh) translateX(var(--x-offset)) rotate(36deg) scale(1);
            }
            90% { 
              opacity: 1; 
            }
            100% { 
              transform: translateY(-10vh) translateX(calc(var(--x-offset) * -0.5)) rotate(360deg) scale(0.5); 
              opacity: 0; 
            }
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.05); opacity: 0.5; }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }

          @keyframes iconFloat {
            0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
            33% { transform: translateY(-15px) rotate(3deg) scale(1.05); }
            66% { transform: translateY(-8px) rotate(-3deg) scale(0.98); }
          }

          .cursor-glow {
            position: absolute;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            mix-blend-mode: screen;
            transform: translate(-50%, -50%);
            transition: opacity 0.3s ease;
            filter: blur(40px);
          }

          .magnetic-icon {
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            filter: drop-shadow(0 0 10px currentColor);
          }

          // .parallax-1 { 
          //   transform: translate(calc(var(--cursor-x) * 15px), calc(var(--cursor-y) * 15px));
          //   transition: transform 0.1s ease-out;
          // }
          // .parallax-2 { 
          //   transform: translate(calc(var(--cursor-x) * 30px), calc(var(--cursor-y) * 30px));
          //   transition: transform 0.15s ease-out;
          // }
          // .parallax-3 { 
          //   transform: translate(calc(var(--cursor-x) * 50px), calc(var(--cursor-y) * 50px));
          //   transition: transform 0.2s ease-out;
          // }

          .grid-overlay {
            background-image: 
              linear-gradient(rgba(96, 165, 250, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(96, 165, 250, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: gridMove 20s linear infinite;
          }

          @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }

          // .ripple {
          //   position: absolute;
          //   border-radius: 50%;
          //   border: 2px solid rgba(96, 165, 250, 0.4);
          //   animation: rippleEffect 2s ease-out infinite;
          // }

          @keyframes rippleEffect {
            0% { width: 0; height: 0; opacity: 1; }
            100% { width: 300px; height: 300px; opacity: 0; }
          }
        `}</style>

        {/* Cursor glow effect */}
        <div
          className="cursor-glow"
          style={{
            left: 'var(--mouse-x)',
            top: 'var(--mouse-y)',
            opacity: isHovering ? 1 : 0,
          }}
        />

        {/* Animated grid overlay */}
        <div className="absolute inset-0 grid-overlay opacity-20" />

        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: p.color,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                left: `${p.left}%`,
                top: `${p.top}%`,
                opacity: p.opacity,
                animation: `particleFloat ${p.duration}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
                '--x-offset': `${p.xOffset}px`,
              }}
            />
          ))}
        </div>

        {/* Gradient orbs with parallax */}
        <div className="absolute inset-0 parallax-1">
          <div
            className="absolute w-[500px] h-[500px] rounded-full bg-blue-600 blur-[120px] opacity-20"
            style={{
              top: '5%',
              left: '5%',
              animation: 'pulse 8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full bg-purple-600 blur-[100px] opacity-15"
            style={{
              top: '50%',
              left: '50%',
              animation: 'pulse 10s ease-in-out infinite',
              animationDelay: '-3s',
            }}
          />
        </div>

        <div className="absolute inset-0 parallax-2">
          <div
            className="absolute w-[600px] h-[600px] rounded-full bg-indigo-600 blur-[140px] opacity-15"
            style={{
              bottom: '5%',
              right: '5%',
              animation: 'pulse 12s ease-in-out infinite',
              animationDelay: '-5s',
            }}
          />
        </div>

        {/* Wave effect */}
        <div className="absolute inset-0 parallax-2">
          <div
            className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-blue-500/15 to-transparent"
            style={{
              clipPath: 'polygon(0% 100%, 100% 100%, 100% 30%, 0% 60%)',
              animation: 'float 6s ease-in-out infinite',
            }}
          />
        </div>

        {/* Interactive medical icons */}
        <div className="absolute inset-0 parallax-3">
          {floatingIcons.map((item, idx) => (
            <div
              key={idx}
              className="absolute magnetic-icon"
              style={{
                top: `${item.top}%`,
                left: `${item.left}%`,
                fontSize: item.size,
                opacity: 0.25,
                animation: `iconFloat ${5 + idx * 0.5}s ease-in-out infinite`,
                animationDelay: `${idx * -0.8}s`,
                transform: `translate(
                  calc(var(--cursor-x) * ${item.depth * 20}px),
                  calc(var(--cursor-y) * ${item.depth * 20}px)
                )`,
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease',
                cursor: 'pointer',
              }}
            >
              {item.icon}
            </div>
          ))}
        </div>

        {/* Ripple effects at cursor */}
        {isHovering && (
          <div
            className="ripple"
            style={{
              left: 'var(--mouse-x)',
              top: 'var(--mouse-y)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
export default AnimatedBackground;
