import { useState, useEffect } from 'react';

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/25"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 ${openFrom === 'right' ? 'right-0' : 'left-0'} w-full max-w-lg bg-white dark:bg-neutral-900 shadow-xl flex flex-col z-50`}
      >
        {/* Header */}
        <header
          className={`flex items-center px-6 h-nav sm:px-8 md:px-12 shrink-0 border-b border-gray-100 dark:border-neutral-800 ${
            heading ? 'justify-between' : 'justify-end'
          }`}
        >
          {heading && (
            <Heading as="span" size="lead" id="cart-contents">
              {heading}
            </Heading>
          )}
          <button
            type="button"
            className="p-4 -mr-2 transition text-primary hover:text-primary/50"
            onClick={onClose}
            data-test="close-cart"
          >
            <IconClose aria-label="Close panel" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
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
