import { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';

export function FirstPurchaseBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('firstPurchaseBannerDismissed');
    if (!dismissed) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('firstPurchaseBannerDismissed', 'true');
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 9998,
      background: 'linear-gradient(90deg, #E76E50, #F2995A)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      fontSize: '0.8rem',
      fontWeight: 600,
    }}>
      <Gift size={14} />
      <span>
        First order? Use code <span style={{ backgroundColor: 'rgba(255,255,255,0.25)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 800, letterSpacing: '0.05em' }}>FIRST10</span> for 10% off!
      </span>
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          right: '0.75rem',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          padding: '0.25rem',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
