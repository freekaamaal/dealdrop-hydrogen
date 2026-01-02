import { Link, NavLink } from '@remix-run/react';

import { useDrawer } from '~/components/Drawer';

export function Header({ cart, openCart }: { cart: any; openCart: () => void }) {
  // We accept openCart as a prop to avoid context issues or we can use useDrawer if it exposes a global context,
  // but standard Hydrogen templates often pass it down.
  // Looking at PageLayout, it manages the drawer state.
  // So we should accept `openCart` as a prop.

  const activeLinkStyle =
    "text-primary font-medium transition-colors relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-px after:bg-primary after:scale-x-100 transition-transform duration-300";
  const linkStyle =
    "text-secondary-foreground/80 hover:text-primary font-medium transition-colors relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-px after:bg-primary after:scale-x-0 hover:after:scale-x-100 transition-transform duration-300";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto px-4 h-[73px] flex items-center justify-between relative">
        {/* Mobile: Logo Centered absolutely. Desktop: Static left */}
        <div
          className="absolute top-0 flex items-center justify-center md:static md:block pointer-events-none md:pointer-events-auto z-10"
          style={{ left: '50%', transform: 'translateX(-50%)', height: '100%' }}
        >
          <Link
            to="/"
            prefetch="intent"
            className="pointer-events-auto hover:opacity-90 transition-opacity flex items-center justify-center h-full"
          >
            <img
              src="/assets/logo-v2.png?v=9"
              alt="DropMyDeal"
              className="w-[200px] md:w-[280px] max-w-[80vw] h-auto object-contain py-2"
            />
          </Link>
        </div>

        {/* Placeholder for Left Icon on Mobile to balance (if needed) or just empty to let justify-between work for right icons */}
        <div className="md:hidden w-10"></div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 ml-8">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
          >
            Live Deals
          </NavLink>
          <NavLink
            to="/past-deals"
            className={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
          >
            Past Drops
          </NavLink>
          <a href="#how-it-works" className={linkStyle}>
            How It Works
          </a>
          <a
            href="https://freekaamaal.com"
            target="_blank"
            rel="noopener noreferrer"
            className={linkStyle}
          >
            FreeKaaMaal
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4 z-20">
          {/* User Icon (Placeholder) */}
          <button className="text-primary hover:text-accent transition-colors p-2 rounded-full hover:bg-white/5">
            <IconUser />
          </button>

          {/* Cart Icon */}
          <button
            onClick={openCart}
            className="relative text-primary hover:text-accent transition-colors p-2 rounded-full hover:bg-white/5 group"
          >
            <IconBag />
            {cart?.totalQuantity > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-gradient-to-br from-[#E76E50] to-[#F2995A] text-[10px] font-bold text-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                {cart.totalQuantity}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function IconUser() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
