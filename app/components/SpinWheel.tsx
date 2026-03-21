import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const SEGMENTS = [
  { label: '10% OFF', color: '#E76E50', code: 'SPIN10' },
  { label: 'Try Again', color: '#1a1a2e', code: '' },
  { label: '₹50 OFF', color: '#F2995A', code: 'SAVE50' },
  { label: '15% OFF', color: '#E76E50', code: 'SPIN15' },
  { label: 'Try Again', color: '#1a1a2e', code: '' },
  { label: 'Free Ship', color: '#F2995A', code: 'FREESHIP' },
  { label: '20% OFF', color: '#E76E50', code: 'SPIN20' },
  { label: 'Try Again', color: '#1a1a2e', code: '' },
];

// Weighted: mostly land on 10% or ₹50 off
const WINNING_INDICES = [0, 0, 0, 2, 2, 2, 3, 5, 0, 2];

export function SpinWheel() {
  const [show, setShow] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ label: string; code: string } | null>(null);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Show after 5 seconds, only if not seen before
    const seen = localStorage.getItem('spinWheelSeen');
    if (seen) return;

    const timer = setTimeout(() => {
      setShow(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!show) return;
    drawWheel();
  }, [show, rotation]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 4;
    const segAngle = (2 * Math.PI) / SEGMENTS.length;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((rotation * Math.PI) / 180);

    SEGMENTS.forEach((seg, i) => {
      const startAngle = i * segAngle;
      const endAngle = startAngle + segAngle;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.rotate(startAngle + segAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText(seg.label, radius - 15, 5);
      ctx.restore();
    });

    ctx.restore();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#E76E50';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw "SPIN" text in center
    ctx.fillStyle = '#E76E50';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPIN', center, center + 4);
  };

  const handleSpin = () => {
    if (spinning || result) return;
    setSpinning(true);

    const winIdx = WINNING_INDICES[Math.floor(Math.random() * WINNING_INDICES.length)];
    const segAngle = 360 / SEGMENTS.length;
    // Calculate target rotation: multiple full spins + land on winning segment
    const targetAngle = 360 * 5 + (360 - winIdx * segAngle - segAngle / 2);

    let currentRotation = 0;
    const duration = 4000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      currentRotation = eased * targetAngle;
      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setResult(SEGMENTS[winIdx]);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('spinWheelSeen', 'true');
  };

  const handleCopy = () => {
    if (result?.code) {
      navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div style={{
        position: 'relative',
        backgroundColor: '#111',
        borderRadius: '1.5rem',
        padding: '2rem',
        maxWidth: '380px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#999',
          }}
        >
          <X size={16} />
        </button>

        <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          Spin & Win!
        </h2>
        <p style={{ color: '#999', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Try your luck for an exclusive discount
        </p>

        {/* Wheel container */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
          {/* Pointer */}
          <div style={{
            position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
            borderTop: '18px solid #E76E50', zIndex: 10, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }} />
          <canvas
            ref={canvasRef}
            width={260}
            height={260}
            style={{ cursor: spinning ? 'wait' : 'pointer', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.1)' }}
            onClick={handleSpin}
          />
        </div>

        {/* Result */}
        {result ? (
          result.code ? (
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ color: '#4ade80', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                You won {result.label}!
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem',
                border: '1px dashed rgba(231,110,80,0.5)',
              }}>
                <span style={{ color: '#E76E50', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '0.1em' }}>
                  {result.code}
                </span>
                <button
                  onClick={handleCopy}
                  style={{
                    backgroundColor: '#E76E50', color: '#fff', border: 'none', borderRadius: '0.5rem',
                    padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
                  }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p style={{ color: '#666', fontSize: '0.7rem', marginTop: '0.5rem' }}>
                Apply at checkout. Valid for 24 hours.
              </p>
            </div>
          ) : (
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ color: '#f87171', fontSize: '1rem', fontWeight: 'bold' }}>
                Better luck next time!
              </p>
              <p style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                But here's 5% off anyway — use code <span style={{ color: '#E76E50', fontWeight: 'bold' }}>WELCOME5</span>
              </p>
            </div>
          )
        ) : (
          <p style={{ color: '#666', fontSize: '0.8rem' }}>
            {spinning ? 'Spinning...' : 'Tap the wheel to spin!'}
          </p>
        )}
      </div>
    </div>
  );
}
