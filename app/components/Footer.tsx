import {Heart, Instagram, Twitter, Youtube, Mail} from 'lucide-react';
import {Link} from '@remix-run/react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <img
              src="/assets/logo.png"
              alt="DropMyDeal"
              className="h-10 w-auto"
            />
            <p className="text-muted-foreground text-sm max-w-sm">
              Flash deals on premium products. Brands showcase, users save.
              Limited time offers updated daily.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary smooth-transition hover:scale-110"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary smooth-transition hover:scale-110"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary smooth-transition hover:scale-110"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary smooth-transition hover:scale-110"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/"
                  className="hover:text-foreground smooth-transition"
                >
                  Live Deals
                </Link>
              </li>
              <li>
                <Link
                  to="/past-deals"
                  className="hover:text-foreground smooth-transition"
                >
                  Past Drops
                </Link>
              </li>
              <li>
                <Link
                  to="#how-it-works"
                  className="hover:text-foreground smooth-transition"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <a
                  href="https://freekaamaal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground smooth-transition"
                >
                  FreeKaaMaal
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground smooth-transition">
                  For Brands
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground smooth-transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground smooth-transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground smooth-transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground smooth-transition">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-primary fill-primary animate-pulse-soft" />
            <span>by FreeKaaMaal</span>
          </div>

          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DropMyDeal.com by FreeKaaMaal. All
            rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
