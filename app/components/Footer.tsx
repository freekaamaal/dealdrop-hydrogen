import { Link } from '@remix-run/react';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '~/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-10 pt-10 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 mb-16">
          {/* Left Column: About & Newsletter */}
          <div className="space-y-10">
            {/* About Us */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-foreground">About us</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                Welcome to Deal Drop by FreeKaaMaal.com, your go-to destination
                for unbeatable daily deals. Every day, we handpick one amazing
                product and offer it at a jaw-dropping discount—up to 80% off!
                Our mission is to bring you the best value for your money with
                deals that you won’t find anywhere else. With limited stock and a
                ticking clock, each deal is available for just 24 hours or until
                it sells out. Don’t miss out—sign up for our alerts and never
                miss a deal!
              </p>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-foreground">Newsletter</h3>
              <div className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                  />
                </div>
                <Button size="icon" className="h-11 w-11 rounded-lg shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Links */}
          <div>
            <h3 className="font-bold text-lg text-foreground mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/pages/about-us" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/pages/privacy-policy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/pages/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/return-and-cancellation-policies"
                  className="hover:text-primary transition-colors"
                >
                  Return Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/terms-and-conditions"
                  className="hover:text-primary transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/pages/shipping-policy" className="hover:text-primary transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/pages/faqs" className="hover:text-primary transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <a
                  href="https://freekaamaal.com/press"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Press
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}, Powered by FreeKaaMaal.com ( Woost
          Internet Private Limited)
        </div>
      </div>
    </footer>
  );
}

