import { Link, NavLink, useRouteLoaderData, Await } from '@remix-run/react';
import { ShoppingBag, Menu, X, User, UserCheck, Search } from 'lucide-react';
import { useState, Suspense } from 'react';

import { Button } from '~/components/ui/button';
import type { RootLoader } from '~/root';
export function Navbar({ cart, openCart }: { cart?: any; openCart?: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (

    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/90 border-b border-white/5">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Mobile Menu Button (Left) */}
        <div className="md:hidden flex items-center">
          <button
            className="text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        <Link
          to="/"
          className="flex items-center group"
        >
          <img
            src="/assets/dealdrop-fkm-logo.png"
            alt="DealDrop by FreeKaaMaal.com"
            className="h-10 md:h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/#all-deals"
            className="text-sm font-medium text-gray-400 hover:text-white smooth-transition"
          >
            Live Deals
          </Link>
          <Link
            to="/brands"
            className="text-sm font-medium text-gray-400 hover:text-white smooth-transition"
          >
            Brands
          </Link>
          <Link
            to="/categories"
            className="text-sm font-medium text-gray-400 hover:text-white smooth-transition"
          >
            Categories
          </Link>
          <a
            href="https://freekaamaal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-400 hover:text-white smooth-transition"
          >
            FreeKaaMaal
          </a>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/search">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
            >
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <AccountButton />
          <AsyncCartButton cart={cart} openCart={openCart} />
        </div>

        {/* Mobile Cart Button (Right) */}
        <div className="md:hidden flex items-center">
          <AsyncCartButton cart={cart} openCart={openCart} />
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-b border-white/5 animate-fade-in">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            <Link
              to="/#all-deals"
              className="text-lg font-medium py-2 text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Live Deals
            </Link>
            <Link
              to="/brands"
              className="text-lg font-medium py-2 text-gray-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              Brands
            </Link>
            <Link
              to="/categories"
              className="text-lg font-medium py-2 text-gray-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <a
              href="https://freekaamaal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-medium py-2 text-muted-foreground"
            >
              FreeKaaMaal
            </a>
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <Link to="/account" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  <AccountIcon className="h-4 w-4 mr-2" /> <AccountLabel />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function AccountButton() {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const isLoggedIn = rootData?.isLoggedIn;

  return (
    <Link to="/account" prefetch="intent" aria-label="Account">
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-400 hover:text-white"
      >
        <Suspense fallback={<User className="h-5 w-5" />}>
          <Await resolve={isLoggedIn} errorElement={<User className="h-5 w-5" />}>
            {(loggedIn) =>
              loggedIn ? (
                <UserCheck className="h-5 w-5 text-orange-400" />
              ) : (
                <User className="h-5 w-5" />
              )
            }
          </Await>
        </Suspense>
      </Button>
    </Link>
  );
}

function AccountIcon({ className }: { className?: string }) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const isLoggedIn = rootData?.isLoggedIn;

  return (
    <Suspense fallback={<User className={className} />}>
      <Await resolve={isLoggedIn} errorElement={<User className={className} />}>
        {(loggedIn) =>
          loggedIn ? <UserCheck className={className} /> : <User className={className} />
        }
      </Await>
    </Suspense>
  );
}

function AccountLabel() {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const isLoggedIn = rootData?.isLoggedIn;

  return (
    <Suspense fallback={<span>Sign in</span>}>
      <Await resolve={isLoggedIn} errorElement={<span>Sign in</span>}>
        {(loggedIn) => <span>{loggedIn ? 'My Account' : 'Sign in'}</span>}
      </Await>
    </Suspense>
  );
}

function AsyncCartButton({ cart, openCart }: { cart?: any; openCart?: () => void }) {
  return (
    <Suspense fallback={<CartButtonContent count={0} openCart={openCart} />}>
      <Await resolve={cart}>
        {(resolvedCart) => (
          <CartButtonContent
            count={resolvedCart?.totalQuantity || 0}
            openCart={openCart}
          />
        )}
      </Await>
    </Suspense>
  );
}

function CartButtonContent({ count, openCart }: { count: number; openCart?: () => void }) {
  const isColored = count > 0;
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`active:scale-95 transition-all relative ${isColored ? 'text-orange-400' : 'text-gray-400 hover:text-white'}`}
      onClick={openCart}
    >
      <ShoppingBag className={`h-5 w-5 ${isColored ? 'fill-primary/10' : ''}`} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 gradient-urgency text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
          {count}
        </span>
      )}
    </Button>
  );
}
