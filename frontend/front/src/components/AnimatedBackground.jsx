import React, { useEffect, useRef, useState } from 'react';

const AnimatedBackground = ({ children }) => {
  const particlesRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseActive, setIsMouseActive] = useState(false);

  useEffect(() => {
    // Enhanced particle system
    const createParticles = () => {
      const particlesContainer = particlesRef.current;
      if (!particlesContainer) return;

      const particleCount = 30; // Reduced for better performance on other pages
      particlesContainer.innerHTML = '';

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
          position: absolute;
          width: ${Math.random() * 4 + 1}px;
          height: ${Math.random() * 4 + 1}px;
          background: ${Math.random() > 0.5 ? '#60a5fa' : '#ffffff'};
          border-radius: 50%;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          opacity: ${Math.random() * 0.8 + 0.2};
          animation: particleMove ${Math.random() * 20 + 15}s linear infinite;
          box-shadow: 0 0 10px currentColor;
        `;
        particlesContainer.appendChild(particle);
      }
    };

    // Enhanced mouse tracking for parallax with smoother movement
    const handleMouseMove = (e) => {
      const rect = window.innerWidth;
      const rectHeight = window.innerHeight;
      
      // Calculate normalized mouse position (-1 to 1)
      const normalizedX = (e.clientX / rect - 0.5) * 2;
      const normalizedY = (e.clientY / rectHeight - 0.5) * 2;
      
      setMousePosition({
        x: normalizedX * 30, // Reduced multiplier for subtle effect
        y: normalizedY * 30
      });
      setIsMouseActive(true);
    };
    abcdefghijklmnopqrstuvwxyz;

    const handleMouseEnter = () => setIsMouseActive(true);
    const handleMouseLeave = () => {
      setIsMouseActive(false);
      // Smoothly return to center position
      setMousePosition({ x: 0, y: 0 });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    createParticles();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden relative bg-gradient-to-br from-navy-900 via-blue-900 to-slate-800" style={{ background: 'linear-gradient(135deg, #0f1729 0%, #1e3a8a 50%, #1e293b 100%)' }}>
      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes particleMove {
          0% { 
            transform: translateY(100vh) translateX(0) rotate(0deg); 
            opacity: 0; 
          }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { 
            transform: translateY(-100px) translateX(${Math.random() * 200 - 100}px) rotate(360deg); 
            opacity: 0; 
          }
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
            opacity: 0.7; 
          }
          50% { 
            transform: translateY(-20px) rotate(180deg) scale(1.1); 
            opacity: 1; 
          }
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.4; 
          }
          50% { 
            transform: scale(1.2); 
            opacity: 0.8; 
          }
        }

        /* Enhanced parallax animations */
        .parallax-element {
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }

        .parallax-slow {
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.320, 1);
        }

        .parallax-fast {
          transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Interactive cursor effects */
        .cursor-magnetic {
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .cursor-magnetic:hover {
          transform: scale(1.05);
        }

        @keyframes wave {
          0% { transform: translateX(-100%) scaleY(1); }
          50% { transform: translateX(0%) scaleY(1.1); }
          100% { transform: translateX(100%) scaleY(1); }
        }

        @keyframes medical-pulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            filter: hue-rotate(0deg); 
          }
          50% { 
            transform: scale(1.3) rotate(180deg); 
            filter: hue-rotate(90deg); 
          }
        }

        @keyframes dna-rotate {
          0% { transform: rotate(0deg) translateY(-50%); }
          100% { transform: rotate(360deg) translateY(-50%); }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-custom { animation: pulse 3s ease-in-out infinite; }
        .animate-wave { animation: wave 8s ease-in-out infinite; }
        .animate-medical-pulse { animation: medical-pulse 4s ease-in-out infinite; }
        .animate-dna { animation: dna-rotate 20s linear infinite; }
        .animate-gradient { animation: gradient-shift 6s ease-in-out infinite; }

        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .gradient-text {
          background: linear-gradient(45deg, #ffffff, #60a5fa, #3b82f6, #1e40af);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 3s ease-in-out infinite;
        }

        .medical-icon {
          filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.6));
        }
      `}</style>

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Particles */}
        <div ref={particlesRef} className="absolute inset-0" />

        {/* Animated Background Shapes with Enhanced Parallax */}
        <div 
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 animate-float parallax-element cursor-magnetic"
          style={{ 
            top: '10%', 
            left: '5%',
            transform: `translate(${mousePosition.x * 0.8}px, ${mousePosition.y * 0.6}px) scale(${isMouseActive ? 1.1 : 1})`
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-slate-400 to-blue-500 opacity-15 animate-float parallax-slow cursor-magnetic"
          style={{ 
            top: '50%', 
            right: '10%',
            animationDelay: '2s',
            transform: `translate(${mousePosition.x * -0.5}px, ${mousePosition.y * -0.4}px) scale(${isMouseActive ? 1.05 : 1})`
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-white to-blue-400 opacity-10 animate-pulse-custom parallax-fast cursor-magnetic"
          style={{ 
            bottom: '20%', 
            left: '20%',
            transform: `translate(${mousePosition.x * 1.2}px, ${mousePosition.y * 0.8}px) scale(${isMouseActive ? 1.15 : 1})`
          }}
        />

        {/* Additional Interactive Elements */}
        <div 
          className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-blue-300 to-slate-400 opacity-8 animate-float parallax-element"
          style={{ 
            top: '70%', 
            right: '25%',
            animationDelay: '4s',
            transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * -0.7}px) rotate(${mousePosition.x * 0.5}deg)`
          }}
        />
        <div 
          className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-white to-blue-500 opacity-12 animate-pulse-custom parallax-fast"
          style={{ 
            top: '30%', 
            left: '70%',
            transform: `translate(${mousePosition.x * -0.9}px, ${mousePosition.y * 1.1}px) rotate(${mousePosition.y * 0.3}deg)`
          }}
        />

        {/* Enhanced Medical Icons with Cursor Response */}
        <div 
          className="absolute top-1/4 left-1/4 text-6xl medical-icon animate-medical-pulse parallax-element cursor-magnetic" 
          style={{ 
            animationDelay: '1s',
            transform: `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * -0.6}px) scale(${isMouseActive ? 1.2 : 1})`
          }}
        >⚕️</div>
        <div 
          className="absolute top-3/4 right-1/4 text-5xl medical-icon animate-medical-pulse parallax-slow cursor-magnetic" 
          style={{ 
            animationDelay: '3s',
            transform: `translate(${mousePosition.x * -0.7}px, ${mousePosition.y * 0.5}px) scale(${isMouseActive ? 1.15 : 1})`
          }}
        >💊</div>
        <div 
          className="absolute top-1/2 left-1/6 text-4xl medical-icon animate-medical-pulse parallax-fast cursor-magnetic" 
          style={{ 
            animationDelay: '2s',
            transform: `translate(${mousePosition.x * 0.9}px, ${mousePosition.y * -0.3}px) rotate(${mousePosition.x * 0.2}deg) scale(${isMouseActive ? 1.25 : 1})`
          }}
        >🩺</div>

        {/* Additional Floating Medical Elements */}
        <div 
          className="absolute top-1/6 right-1/3 text-3xl medical-icon animate-medical-pulse parallax-element" 
          style={{ 
            animationDelay: '5s',
            transform: `translate(${mousePosition.x * -0.4}px, ${mousePosition.y * 0.8}px) rotate(${mousePosition.y * -0.3}deg)`
          }}
        >🧬</div>
        <div 
          className="absolute bottom-1/3 left-1/3 text-3xl medical-icon animate-medical-pulse parallax-slow" 
          style={{ 
            animationDelay: '4s',
            transform: `translate(${mousePosition.x * 0.6}px, ${mousePosition.y * -0.9}px) scale(${isMouseActive ? 1.1 : 0.9})`
          }}
        >🔬</div>

        {/* Enhanced DNA Helix with Cursor Response */}
        <div 
          className="absolute top-1/2 right-8 w-20 h-40 opacity-30 animate-dna parallax-element"
          style={{
            transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * 0.4}px) scale(${isMouseActive ? 1.1 : 1})`
          }}
        >
          <div 
            className="absolute left-2 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-full parallax-fast" 
            style={{
              transform: `translateX(${mousePosition.x * 0.1}px)`
            }}
          />
          <div 
            className="absolute right-2 w-1 h-full bg-gradient-to-b from-white to-blue-400 rounded-full parallax-fast" 
            style={{
              transform: `translateX(${mousePosition.x * -0.1}px)`
            }}
          />
        </div>

        {/* Interactive Wave Effect */}
        <div 
          className="absolute bottom-0 w-full h-32 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-wave parallax-slow"
          style={{
            transform: `translateY(${mousePosition.y * 0.2}px) scaleY(${isMouseActive ? 1.2 : 1})`
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;
