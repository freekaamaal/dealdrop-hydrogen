import { useState, useEffect } from 'react';
import { Link, useLoaderData } from '@remix-run/react';
import {
  Sparkles,
  Shield,
  Truck,
  CheckCircle2,
  ArrowRight,
  Zap,
  Clock,
  Star,
  Gift,
  ChevronRight,
  Timer,
  Percent,
  Users,
  Award,
  MessageSquare,
} from 'lucide-react';
import { defer, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { AnalyticsPageType } from '@shopify/hydrogen';
import { Image, Money } from '@shopify/hydrogen';

import { seoPayload } from '~/lib/seo.server';
import CountdownTimer from '~/components/CountdownTimer';
import PriceDisplay from '~/components/PriceDisplay';
import StockBar from '~/components/StockBar';
import DealCard from '~/components/DealCard';
import { Button } from '~/components/ui/button';

export const meta: MetaFunction = () => {
  return [{ title: 'DropMyDeal | Daily Drops' }];
};

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { storefront } = context;
  const seo = seoPayload.home({ url: request.url });

  const { hero, featured, upcoming } = await storefront.query(HOMEPAGE_QUERY);

  return defer({
    seo,
    analytics: {
      pageType: AnalyticsPageType.home,
    },
    featuredProducts: featured?.products.nodes || [],
    upcomingDeals: upcoming?.products.nodes || [],
    heroProduct: hero?.products.nodes[0] || null,
  });
}

export default function Homepage() {
  const { featuredProducts, upcomingDeals, heroProduct } = useLoaderData<typeof loader>();

  const [dealEndTime] = useState(() => {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 6);
    return endTime;
  });

  const handleBuyNow = () => {
    if (heroProduct) {
      window.location.href = `/products/${heroProduct.handle}`;
    } else {
      window.location.href = '#featured-products';
    }
  };

  // Asset paths
  const fallbackHeroImage = '/assets/hero-deal.jpg';

  // Hero Data (Unwrap dynamic or fallback)
  const heroData = heroProduct ? {
    title: heroProduct.title,
    image: heroProduct.variants.nodes[0]?.image?.url || fallbackHeroImage,
    price: heroProduct.variants.nodes[0]?.price,
    compareAtPrice: heroProduct.variants.nodes[0]?.compareAtPrice,
    description: heroProduct.descriptionHtml ? heroProduct.description.substring(0, 100) + '...' : "Studio-quality sound meets all-day comfort. Active noise cancellation and 30-hour battery life.",
    handle: heroProduct.handle
  } : {
    title: "Premium Wireless Headphones",
    image: fallbackHeroImage,
    price: { amount: '7999.00', currencyCode: 'INR' },
    compareAtPrice: { amount: '12999.00', currencyCode: 'INR' },
    description: "Studio-quality sound meets all-day comfort. Active noise cancellation and 30-hour battery life.",
    handle: "v2-snowboard"
  };

  // Helper to transform Shopify Product to DealCard Props
  const mapProductToDeal = (product: any, status: 'live' | 'upcoming') => {
    const variant = product.variants.nodes[0];
    return {
      id: product.id,
      title: product.title,
      description: product.description || '',
      image: variant?.image?.url || '',
      mrp: parseFloat(variant?.compareAtPrice?.amount || variant?.price?.amount || '0'),
      dealPrice: parseFloat(variant?.price?.amount || '0'),
      status: status,
      handle: product.handle,
      publishedAt: product.publishedAt
    };
  };


  // Testimonials (Static)
  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Mumbai',
      text: 'Got an amazing deal on AirPods Pro. 60% off the retail price! The product was genuine and delivered within 2 days.',
      rating: 5,
      avatar: 'PS',
    },
    {
      name: 'Rahul Verma',
      location: 'Delhi',
      text: 'DropMyDeal has become my go-to for electronics. The flash sales are genuine and the discounts are unbeatable.',
      rating: 5,
      avatar: 'RV',
    },
    {
      name: 'Anjali Patel',
      location: 'Bangalore',
      text: "I've saved over ₹25,000 in just 3 months! The notification feature ensures I never miss a deal.",
      rating: 5,
      avatar: 'AP',
    },
  ];

  // Blog posts (Static for now)
  const blogPosts = [
    {
      title: 'Behind the Scenes: How We Offer Such Low Prices',
      excerpt:
        'Ever wondered how we secure such massive discounts? Discover the secret sauce behind our deal-hunting process...',
      date: 'Jan 01, 2026',
      readTime: '4 min read',
      url: '/journal/behind-the-scenes-how-we-offer-such-low-prices'
    },
    {
      title: 'Top Tips for Scoring the Best Flash Sale Deals',
      excerpt:
        "Don't miss out on the next big drop. Learn the pro strategies to checkout faster and secure your savings...",
      date: 'Jan 01, 2026',
      readTime: '3 min read',
      url: '/journal/top-tips-for-scoring-the-best-flash-sale-deals'
    },
    // Keeping a 3rd one for layout balance, generic
    {
      title: 'Why Brands Love Partnering With DropMyDeal',
      excerpt: 'The unique platform that connects premium brands with savvy shoppers for mutual benefit...',
      date: 'Dec 28, 2025',
      readTime: '5 min read',
      url: '#'
    },
  ];

  return (
    <>
      <section className="relative py-8 md:py-16 overflow-hidden">
        {/* Background Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/8 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Live Badge */}
          <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in">
            <div className="flex items-center gap-2 gradient-rose text-primary-foreground px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-wider">
                Live Now
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-6xl mx-auto">

            {/* Desktop Image Column (Hidden on Mobile) */}
            <div className="hidden lg:block order-last lg:order-first animate-scale-in">
              <div className="relative">
                {/* Glow behind image */}
                <div className="absolute inset-0 gradient-rose rounded-3xl blur-3xl opacity-15 scale-95" />
                <div className="relative card-premium rounded-3xl overflow-hidden p-10">
                  <img
                    src={heroData.image}
                    alt={heroData.title}
                    className="w-full h-auto object-contain animate-float"
                  />
                  <div className="absolute top-6 left-6 flex items-center gap-2 gradient-rose text-primary-foreground px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                    <Zap className="h-4 w-4" />
                    Flash Deal
                  </div>
                  <div className="absolute top-6 right-6 w-16 h-16 gradient-rose rounded-full flex items-center justify-center glow-rose">
                    <span className="text-primary-foreground font-display font-bold text-lg">
                      {Math.round(((parseFloat(heroData.compareAtPrice?.amount || '0') - parseFloat(heroData.price?.amount || '0')) / parseFloat(heroData.compareAtPrice?.amount || '1')) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="space-y-6 animate-fade-in">
              <div>
                <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
                  Today's Drop
                </p>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  <span className="block">{heroData.title}</span>
                </h1>

                {/* Mobile Image (Visible only on Mobile, Just after Title) */}
                <div className="lg:hidden my-6">
                  <div className="relative card-premium rounded-3xl overflow-hidden p-6">
                    <img
                      src={heroData.image}
                      alt={heroData.title}
                      className="w-full h-auto object-contain"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2 gradient-rose text-primary-foreground px-3 py-1 rounded-full font-bold text-xs shadow-lg">
                      <Zap className="h-3 w-3" />
                      Flash Deal
                    </div>
                    <div className="absolute top-4 right-4 w-12 h-12 gradient-rose rounded-full flex items-center justify-center glow-rose shadow-lg">
                      <span className="text-primary-foreground font-display font-bold text-sm">
                        {Math.round(((parseFloat(heroData.compareAtPrice?.amount || '0') - parseFloat(heroData.price?.amount || '0')) / parseFloat(heroData.compareAtPrice?.amount || '1')) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-lg text-muted-foreground">
                  {heroData.description}
                </p>
              </div>

              <PriceDisplay mrp={parseFloat(heroData.compareAtPrice?.amount || '0')} dealPrice={parseFloat(heroData.price?.amount || '0')} size="large" />

              <CountdownTimer targetDate={dealEndTime} />

              <StockBar remaining={23} total={100} />

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 glass-card rounded-xl p-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    1 Year Warranty
                  </span>
                </div>
                <div className="flex items-center gap-3 glass-card rounded-xl p-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Free Shipping
                  </span>
                </div>
                <div className="flex items-center gap-3 glass-card rounded-xl p-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    7-Day Returns
                  </span>
                </div>
                <div className="flex items-center gap-3 glass-card rounded-xl p-3">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Verified Seller
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-4 pt-4">
                <Button
                  size="lg"
                  className="w-full gradient-rose text-primary-foreground font-bold text-lg h-16 rounded-2xl button-glow smooth-transition hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleBuyNow}
                >
                  Buy Now - Limited Time!
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link to={`/products/${heroData.handle}`} className="block">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full font-semibold h-14 rounded-2xl border-border hover:bg-secondary smooth-transition"
                  >
                    View Full Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why DropMyDeal Section */}
      <section className="py-16 md:py-24" id="why-dropmydeal">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              The DropMyDeal Difference
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Why <span className="text-gradient">DropMyDeal</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We connect top brands with deal-savvy shoppers. Brands get
              exposure, you get unbeatable discounts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="text-center space-y-4 card-premium rounded-3xl p-8 animate-fade-in hover:scale-[1.02] smooth-transition group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-rose mb-4 group-hover:glow-rose smooth-transition">
                <Percent className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold">
                Massive Discounts
              </h3>
              <p className="text-muted-foreground text-sm">
                Up to 80% off on premium products. Real savings, no gimmicks.
              </p>
            </div>

            <div
              className="text-center space-y-4 card-premium rounded-3xl p-8 animate-fade-in hover:scale-[1.02] smooth-transition group"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-rose mb-4 group-hover:glow-rose smooth-transition">
                <Timer className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold">Flash Sales</h3>
              <p className="text-muted-foreground text-sm">
                Limited-time deals that last hours, not days. Act fast!
              </p>
            </div>

            <div
              className="text-center space-y-4 card-premium rounded-3xl p-8 animate-fade-in hover:scale-[1.02] smooth-transition group"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-rose mb-4 group-hover:glow-rose smooth-transition">
                <Award className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold">Curated Brands</h3>
              <p className="text-muted-foreground text-sm">
                Only verified brands. Every product is genuine and warranted.
              </p>
            </div>

            <div
              className="text-center space-y-4 card-premium rounded-3xl p-8 animate-fade-in hover:scale-[1.02] smooth-transition group"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-rose mb-4 group-hover:glow-rose smooth-transition">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold">Win-Win Model</h3>
              <p className="text-muted-foreground text-sm">
                Brands gain customers, you save money. Everybody wins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 relative" id="how-it-works">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              Simple & Transparent
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Three simple steps to massive savings
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full gradient-rose flex items-center justify-center glow-rose">
                    <span className="text-primary-foreground font-display text-3xl font-bold">
                      1
                    </span>
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold">
                  Browse Live Deals
                </h3>
                <p className="text-muted-foreground">
                  Check out today's flash sale featuring premium products at
                  jaw-dropping prices.
                </p>
              </div>
              {/* Connector */}
              <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -z-10" />
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full gradient-rose flex items-center justify-center glow-rose">
                    <span className="text-primary-foreground font-display text-3xl font-bold">
                      2
                    </span>
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold">
                  Grab Before It's Gone
                </h3>
                <p className="text-muted-foreground">
                  Act fast! Each deal has limited stock and a countdown timer.
                  Once it's gone, it's gone.
                </p>
              </div>
              {/* Connector */}
              <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -z-10" />
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full gradient-rose flex items-center justify-center glow-rose">
                  <span className="text-primary-foreground font-display text-3xl font-bold">
                    3
                  </span>
                </div>
              </div>
              <h3 className="font-display text-xl font-bold">
                Enjoy Your Savings
              </h3>
              <p className="text-muted-foreground">
                Your order is shipped directly from the brand with full warranty
                and easy returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Drops Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Upcoming Drops
              </h2>
            </div>
            <Link
              to="/collections/upcoming-drops"
              className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground smooth-transition"
            >
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingDeals.length > 0 ? (
              upcomingDeals.map((deal: any) => (
                <DealCard key={deal.id} {...mapProductToDeal(deal, 'upcoming')} />
              ))
            ) : (
              <div className="col-span-3 text-center py-10 text-muted-foreground">
                <p>No upcoming deals found. Create a collection named 'Upcoming Drops' to see products here.</p>
              </div>
            )}

            {/* Notify Card */}
            <div className="card-premium rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full gradient-rose flex items-center justify-center">
                <Gift className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-xl">Get Notified</h3>
              <p className="text-muted-foreground text-sm">
                Be the first to know when new deals drop
              </p>
              <Button className="gradient-rose text-primary-foreground button-glow">
                Enable Alerts
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 relative" id="featured-products">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Limited Offers
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Featured Products
              </h2>
            </div>
            <Link
              to="/collections/featured-products"
              className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground smooth-transition"
            >
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product: any) => (
                <DealCard key={product.id} {...mapProductToDeal(product, 'live')} />
              ))
            ) : (
              <div className="col-span-3 text-center py-10 text-muted-foreground">
                <p>No featured products found. Create a collection named 'Featured Products' to see products here.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              Happy Customers
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              What Our <span className="text-gradient">Users Say</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Join thousands of satisfied shoppers who've saved big with
              DropMyDeal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="card-premium rounded-3xl p-8 space-y-6 hover:scale-[1.02] smooth-transition"
                style={{ animationDelay: `${index * 0.1} s` }}
              >
                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-primary fill-primary"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-muted-foreground italic">
                  "{testimonial.text}"
                </p>

                {/* User */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-rose flex items-center justify-center text-primary-foreground font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div className="space-y-2">
              <p className="font-display text-4xl md:text-5xl font-bold text-gradient">
                50K+
              </p>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
            <div className="space-y-2">
              <p className="font-display text-4xl md:text-5xl font-bold text-gradient">
                ₹2Cr+
              </p>
              <p className="text-muted-foreground">Total Savings</p>
            </div>
            <div className="space-y-2">
              <p className="font-display text-4xl md:text-5xl font-bold text-gradient">
                500+
              </p>
              <p className="text-muted-foreground">Deals Closed</p>
            </div>
            <div className="space-y-2">
              <p className="font-display text-4xl md:text-5xl font-bold text-gradient">
                100+
              </p>
              <p className="text-muted-foreground">Partner Brands</p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  From Our Blog
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Latest Insights
              </h2>
            </div>
            <a
              href="#"
              className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground smooth-transition"
            >
              <span>View All Posts</span>
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <a
                key={index}
                href={post.url}
                target={post.url.startsWith('http') ? '_blank' : undefined}
                rel={post.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group card-premium rounded-3xl overflow-hidden hover:scale-[1.02] smooth-transition"
              >
                <div className="h-48 bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
                  <div className="absolute inset-0 gradient-rose-soft opacity-50" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="glass-card px-3 py-1 rounded-full text-xs text-muted-foreground">
                      {post.readTime}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-xs text-muted-foreground">{post.date}</p>
                  <h3 className="font-display font-bold text-lg group-hover:text-primary smooth-transition line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-primary text-sm font-medium">
                    <span>Read More</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 smooth-transition" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden card-premium rounded-3xl p-8 md:p-12 lg:p-16">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Never Miss a <span className="text-gradient">Drop</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Get instant notifications when new flash deals go live. Be the
                first to grab the best prices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="gradient-rose text-primary-foreground font-bold h-14 px-8 rounded-2xl button-glow"
                >
                  Join the Drop Club
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-semibold h-14 px-8 rounded-2xl"
                >
                  For Brands
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-border lg:hidden z-40">
        <Button
          size="lg"
          className="w-full gradient-rose text-primary-foreground font-bold text-base h-14 rounded-2xl button-glow smooth-transition active:scale-[0.98]"
          onClick={handleBuyNow}
        >
          <Zap className="mr-2 h-5 w-5" />
          Grab Today's Deal
        </Button>
      </div>
    </>
  );
}

const HOMEPAGE_QUERY = `#graphql
  query Homepage($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: "hero-deal") {
      ...CollectionFragment
    }
    featured: collection(handle: "featured-products") {
      ...CollectionFragment
    }
    upcoming: collection(handle: "upcoming-drops") {
      ...CollectionFragment
    }
  }

  fragment CollectionFragment on Collection {
    id
    handle
    title
    products(first: 8, sortKey: MANUAL) {
      nodes {
        id
        title
        description
        descriptionHtml
        publishedAt
        handle
        variants(first: 1) {
          nodes {
            id
            image {
              url
              altText
              width
              height
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
` as const;
