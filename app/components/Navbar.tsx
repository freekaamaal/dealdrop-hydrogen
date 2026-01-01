import { Link, NavLink } from '@remix-run/react';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
export function Navbar({ cart, openCart }: { cart?: any; openCart?: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (

    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Mobile Cart Button (Left) */}
        <div className="md:hidden flex items-center">
          <AsyncCartButton cart={cart} openCart={openCart} />
        </div>

        <Link
          to="/"
          className="flex items-center gap-3 group"
        >
          <img
            src="/assets/logo-v2.png"
            alt="DropMyDeal"
            className="w-[160px] md:w-auto h-auto md:h-16 smooth-transition group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground smooth-transition"
          >
            Live Deals
          </Link>
          <Link
            to="/past-deals"
            className="text-sm font-medium text-muted-foreground hover:text-foreground smooth-transition"
          >
            Past Drops
          </Link>
          <Link
            to="#how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-foreground smooth-transition"
          >
            How It Works
          </Link>
          <a
            href="https://freekaamaal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground hover:text-foreground smooth-transition"
          >
            FreeKaaMaal
          </a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <User className="h-5 w-5" />
          </Button>
          <AsyncCartButton cart={cart} openCart={openCart} />
        </div>

        {/* Mobile Menu Button (Right) */}
        <div className="md:hidden flex items-center">
          <button
            className="text-foreground p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border animate-fade-in">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            <Link
              to="/"
              className="text-lg font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Live Deals
            </Link>
            <Link
              to="/past-deals"
              className="text-lg font-medium py-2 text-muted-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Past Drops
            </Link>
            <Link
              to="#how-it-works"
              className="text-lg font-medium py-2 text-muted-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
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
              <Button variant="outline" className="flex-1">
                <User className="h-4 w-4 mr-2" /> Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

import { Await } from '@remix-run/react';
import { Suspense } from 'react';

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
      className={`active:scale-95 transition-all relative ${isColored ? 'text-primary' : 'text-muted-foreground'}`}
      onClick={openCart}
    >
      <ShoppingBag className={`h-5 w-5 ${isColored ? 'fill-primary/10' : ''}`} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 gradient-rose text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
          {count}
        </span>
      )}
    </Button>
  );
}
