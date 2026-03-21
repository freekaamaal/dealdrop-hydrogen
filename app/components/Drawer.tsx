import { Fragment, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { Heading } from '~/components/Text';
import { IconClose } from '~/components/Icon';

/**
 * Drawer component that opens on user click.
 * @param heading - string. Shown at the top of the drawer.
 * @param open - boolean state. if true opens the drawer.
 * @param onClose - function should set the open state.
 * @param openFrom - right, left
 * @param children - react children node.
 */
export function Drawer({
  heading,
  open,
  onClose,
  openFrom = 'right',
  children,
}: {
  heading?: string;
  open: boolean;
  onClose: () => void;
  openFrom: 'right' | 'left';
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const drawer = (
    <div className="fixed inset-0 z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          [openFrom === 'right' ? 'right' : 'left']: 0,
          width: '100%',
          maxWidth: '32rem',
          backgroundColor: 'white',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10000,
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: heading ? 'space-between' : 'flex-end',
            padding: '0 1.5rem',
            height: '64px',
            flexShrink: 0,
            borderBottom: '1px solid #f0f0f0',
            backgroundColor: 'white',
          }}
        >
          {heading && (
            <Heading as="span" size="lead" id="cart-contents">
              {heading}
            </Heading>
          )}
          <button
            type="button"
            style={{ padding: '1rem', cursor: 'pointer', background: 'none', border: 'none' }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            data-test="close-cart"
          >
            <IconClose aria-label="Close panel" />
          </button>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );

  // Use portal to render at document body level
  if (typeof document !== 'undefined') {
    return createPortal(drawer, document.body);
  }

  return null;
}

/* Use for associating arialabelledby with the title*/
Drawer.Title = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export function useDrawer(openDefault = false) {
  const [isOpen, setIsOpen] = useState(openDefault);

  function openDrawer() {
    setIsOpen(true);
  }

  function closeDrawer() {
    setIsOpen(false);
  }

  return {
    isOpen,
    openDrawer,
    closeDrawer,
  };
}
