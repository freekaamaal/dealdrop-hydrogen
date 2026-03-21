import { useState, useEffect } from 'react';
import { Link, useLoaderData } from '@remix-run/react';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Clock,
  ChevronRight,
  Flame,
  Tag,
  Store,
  ShoppingBag,
  Star,
  Users,
  BadgePercent,
  Trophy,
  Handshake,
} from 'lucide-react';
import { defer, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { AnalyticsPageType } from '@shopify/hydrogen';

import { seoPayload } from '~/lib/seo.server';
import CountdownTimer from '~/components/CountdownTimer';
import StockBar from '~/components/StockBar';
import DealCard from '~/components/DealCard';
import { Button } from '~/components/ui/button';
import { NewsletterForm } from '~/components/NewsletterForm';

export const meta: MetaFunction = () => {
  return [{ title: 'DealDrop by FreeKaaMaal.com | Biggest Deals on Premium Brands' }];
};

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { storefront } = context;
  const seo = seoPayload.home({ url: request.url });

  const { hero, featured, upcoming, categories, allProducts } = await storefront.query(HOMEPAGE_QUERY);

  const brandMap = new Map<string, { name: string; count: number; handle: string; image: string }>();
  const categoryMap = new Map<string, number>();
  const allNodes = [
    ...(featured?.products.nodes || []),
    ...(upcoming?.products.nodes || []),
  ];
  allNodes.forEach((product: any) => {
    const vendor = product.vendor;
    if (vendor && vendor !== 'DropMyDeal' && vendor !== 'DealDrop' && vendor !== 'DealDrop by FreeKaaMaal.com') {
      const existing = brandMap.get(vendor);
      if (existing) {
        existing.count++;
      } else {
        brandMap.set(vendor, {
          name: vendor,
          count: 1,
          handle: vendor.toLowerCase().replace(/\s+/g, '-'),
          image: product.variants?.nodes[0]?.image?.url || '',
        });
      }
    }
    // Extract product types for categories
    const pType = product.productType;
    if (pType && pType.trim() !== '' && pType !== 'Others') {
      categoryMap.set(pType, (categoryMap.get(pType) || 0) + 1);
    }
  });

  const productCategories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return defer({
    seo,
    analytics: { pageType: AnalyticsPageType.home },
    featuredProducts: featured?.products.nodes || [],
    upcomingDeals: upcoming?.products.nodes || [],
    heroProduct: hero?.products.nodes[0] || null,
    categories: categories?.nodes || [],
    productCategories,
    brands: Array.from(brandMap.values()),
  });
}

export default function Homepage() {
  const { featuredProducts, upcomingDeals, heroProduct, categories, brands, productCategories } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming'>('live');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBrand, setFilterBrand] = useState<string>('all');

  // Hero: use hero-deal collection product, or auto-pick the best deal from featured
  const heroSource = heroProduct || featuredProducts.find((p: any) => {
    const v = p.variants?.nodes?.[0];
    return v && parseFloat(v.compareAtPrice?.amount || '0') > parseFloat(v.price?.amount || '0');
  }) || featuredProducts[0];

  const heroData = heroSource ? {
    title: heroSource.title,
    image: heroSource.variants.nodes[0]?.image?.url || '/assets/hero-deal.jpg',
    price: heroSource.variants.nodes[0]?.price,
    compareAtPrice: heroSource.variants.nodes[0]?.compareAtPrice,
    description: heroSource.description ? heroSource.description.substring(0, 120) : '',
    handle: heroSource.handle
  } : null;
  const hasHero = !!heroData;

  const [dealEndTime, setDealEndTime] = useState<Date | null>(null);

  useEffect(() => {
    if (heroSource?.tags) {
      const dealEndTag = heroSource.tags.find((t: string) => t.startsWith('deal_end:'));
      if (dealEndTag) {
        const dateStr = dealEndTag.split('deal_end:')[1];
        const date = new Date(dateStr + 'Z');
        if (!isNaN(date.getTime()) && date > new Date()) {
          setDealEndTime(date);
          return;
        }
      }
    }
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 6);
    setDealEndTime(endTime);
  }, [heroSource]);

  const handleBuyNow = () => {
    if (hasHero && heroData) {
      window.location.href = `/products/${heroData.handle}`;
    } else {
      window.location.href = '#all-deals';
    }
  };

  const mapProductToDeal = (product: any, status: 'live' | 'upcoming') => {
    const variant = product.variants.nodes[0];
    return {
      id: product.id,
      title: product.title,
      description: product.description || '',
      image: variant?.image?.url || '',
      mrp: parseFloat(variant?.compareAtPrice?.amount || variant?.price?.amount || '0'),
      dealPrice: parseFloat(variant?.price?.amount || '0'),
      status,
      handle: product.handle,
      publishedAt: product.publishedAt,
      vendor: product.vendor || '',
    };
  };

  const heroDiscount = heroData ? Math.round(((parseFloat(heroData.compareAtPrice?.amount || '0') - parseFloat(heroData.price?.amount || '0')) / parseFloat(heroData.compareAtPrice?.amount || '1')) * 100) : 0;

  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Mumbai',
      text: 'Bought Koparo cleaning products at ₹99 each — same ones are ₹299 on Amazon. Delivered in 2 days, completely genuine with brand packaging.',
      rating: 5,
      product: 'Koparo Floor Cleaner',
      date: 'Mar 2026',
    },
    {
      name: 'Rahul Verma',
      location: 'Delhi',
      text: 'Was skeptical about the prices at first, but the FreeKaaMaal backing gave me confidence. Third order now, never been disappointed.',
      rating: 5,
      product: 'Koparo Descaler Pack',
      date: 'Feb 2026',
    },
    {
      name: 'Anjali Patel',
      location: 'Bangalore',
      text: 'The deal alert feature is a lifesaver. Got the Cleevo washing machine cleaner at 60% off before it sold out in 2 hours!',
      rating: 5,
      product: 'Cleevo Washer Cleaner',
      date: 'Jan 2026',
    },
  ];

  return (
    <>
      {/* ===== HERO ===== */}
      {hasHero && heroData ? (
      <section className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-600/8 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />

        <div className="container mx-auto px-4 py-6 md:py-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center max-w-6xl mx-auto">

            {/* Content */}
            <div className="space-y-5 animate-fade-in order-2 lg:order-1">
              {/* Value prop for new visitors */}
              <p className="text-orange-400 text-xs md:text-sm font-semibold tracking-wide">
                Try New Brands at Unbeatable Prices. Direct from Brands. Bulk Savings Passed to You.
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">Deal of the Day</span>
                </div>
                <a href="https://freekaamaal.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white/10 border border-white/10 text-gray-400 px-3 py-1.5 rounded-full hover:text-white smooth-transition">
                  <span className="text-[10px] font-medium">Powered by</span>
                  <span className="text-[10px] font-bold text-orange-400">FreeKaaMaal.com</span>
                </a>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
                {heroData.title}
              </h1>

              <p className="text-gray-400 text-base leading-relaxed max-w-md">
                {heroData.description}
              </p>

              {/* Price */}
              <div className="flex items-end gap-4 flex-wrap">
                <span className="text-gray-500 line-through text-lg">
                  ₹{parseFloat(heroData.compareAtPrice?.amount || '0').toLocaleString('en-IN')}
                </span>
                <span className="text-4xl md:text-5xl font-display font-bold text-white">
                  ₹{parseFloat(heroData.price?.amount || '0').toLocaleString('en-IN')}
                </span>
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-bold">
                  {heroDiscount}% OFF
                </span>
              </div>

              <div className="text-orange-400 text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                You save ₹{(parseFloat(heroData.compareAtPrice?.amount || '0') - parseFloat(heroData.price?.amount || '0')).toLocaleString('en-IN')}
              </div>

              {/* Timer + Stock — Dark variants */}
              {dealEndTime && <CountdownTimer targetDate={dealEndTime} variant="compact" dark />}
              {(() => {
                const qty = heroProduct?.variants?.nodes[0]?.quantityAvailable;
                if (qty == null) return null;
                return <StockBar remaining={qty} total={qty <= 50 ? Math.ceil(qty * 1.1) : 100} dark />;
              })()}

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  size="lg"
                  className="flex-1 gradient-urgency text-white font-bold text-lg h-14 rounded-2xl hover:scale-[1.02] active:scale-[0.98] smooth-transition shadow-lg shadow-orange-500/25"
                  onClick={handleBuyNow}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Buy Now
                </Button>
                <Link to={`/products/${heroData.handle}`} className="flex-1">
                  <Button
                    size="lg"
                    className="w-full font-semibold h-14 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 smooth-transition"
                  >
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image - Desktop */}
            <div className="hidden lg:block animate-scale-in order-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/10 rounded-3xl blur-3xl scale-90" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden p-10">
                  <img
                    src={heroData.image}
                    alt={heroData.title}
                    className="w-full h-auto object-contain animate-float"
                  />
                  <div className="absolute top-6 right-6 w-20 h-20 bg-red-500 rounded-full flex flex-col items-center justify-center shadow-lg shadow-red-500/30">
                    <span className="text-white font-display font-bold text-2xl leading-none">{heroDiscount}%</span>
                    <span className="text-white/80 text-[10px] font-bold uppercase">OFF</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Image - Mobile */}
            <div className="lg:hidden order-1">
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden p-6">
                <img
                  src={heroData.image}
                  alt={heroData.title}
                  className="w-full h-auto object-contain max-h-[220px] mx-auto"
                />
                <div className="absolute top-3 right-3 w-14 h-14 bg-red-500 rounded-full flex flex-col items-center justify-center shadow-lg">
                  <span className="text-white font-display font-bold text-lg leading-none">{heroDiscount}%</span>
                  <span className="text-white/80 text-[8px] font-bold uppercase">OFF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {/* ===== TRUST BAR (Stats) ===== */}
      <section className="bg-gray-900 border-y border-white/5 py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-lg md:text-xl font-display font-bold text-white">50K+</span>
              <span className="text-gray-500 text-[10px] md:text-xs">Happy Customers</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-lg md:text-xl font-display font-bold text-orange-400">₹2Cr+</span>
              <span className="text-gray-500 text-[10px] md:text-xs">Total Savings</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-lg md:text-xl font-display font-bold text-white">500+</span>
              <span className="text-gray-500 text-[10px] md:text-xs">Deals Closed</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-lg md:text-xl font-display font-bold text-orange-400">14+</span>
              <span className="text-gray-500 text-[10px] md:text-xs">Years of Trust</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SHOP BY BRAND ===== */}
      {brands.length > 0 && (
        <section className="py-6 md:py-10 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-urgency flex items-center justify-center shadow-md shadow-orange-500/20">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-xl md:text-2xl font-bold">Shop by Brand</h2>
                  <p className="text-muted-foreground text-xs">Exclusive deals direct from brands</p>
                </div>
              </div>
              <Link
                to="/brands"
                className="flex items-center gap-1 text-primary text-sm font-semibold hover:underline"
              >
                All Brands <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {brands.map((brand, i) => {
                const bgColors = [
                  'from-orange-500 to-amber-500', 'from-blue-500 to-indigo-500',
                  'from-green-500 to-emerald-500', 'from-purple-500 to-pink-500',
                  'from-red-500 to-rose-500', 'from-teal-500 to-cyan-500',
                  'from-violet-500 to-purple-500', 'from-sky-500 to-blue-500',
                ];
                return (
                  <Link
                    key={brand.name}
                    to={`/search?q=${encodeURIComponent(brand.name)}`}
                    className="group flex-shrink-0 w-[140px] md:w-[160px] bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg smooth-transition hover:scale-[1.03]"
                  >
                    <div className={`bg-gradient-to-br ${bgColors[i % bgColors.length]} p-4 flex items-center justify-center h-20`}>
                      {brand.image ? (
                        <div className="w-12 h-12 rounded-xl bg-white/25 backdrop-blur-sm overflow-hidden">
                          <img src={brand.image} alt={brand.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-white font-display font-bold text-2xl">{brand.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-center">
                      <h3 className="font-bold text-xs md:text-sm truncate group-hover:text-primary smooth-transition">{brand.name}</h3>
                      <p className="text-[10px] text-muted-foreground">{brand.count} deals</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== ENDING SOON STRIP ===== */}
      {featuredProducts.length > 0 && (
        <section className="py-6 md:py-8 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border-y border-orange-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-red-500" />
              <h2 className="font-display text-lg md:text-xl font-bold">Ending Soon</h2>
              <span className="text-xs text-red-500 font-semibold bg-red-100 px-2 py-0.5 rounded-full ml-2">Hurry!</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {featuredProducts.slice(0, 6).map((product: any) => {
                const variant = product.variants.nodes[0];
                const price = parseFloat(variant?.price?.amount || '0');
                const compareAt = parseFloat(variant?.compareAtPrice?.amount || '0');
                const disc = compareAt > 0 ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.handle}`}
                    className="flex-shrink-0 w-[160px] md:w-[200px] group"
                  >
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg smooth-transition hover:scale-[1.03]">
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        <img
                          src={variant?.image?.url || ''}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
                        />
                        {disc > 0 && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            -{disc}%
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-[10px] text-primary font-semibold uppercase">{product.vendor}</p>
                        <h3 className="text-xs font-semibold line-clamp-1 text-gray-900 mt-0.5">{product.title}</h3>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          {compareAt > price && (
                            <span className="text-[10px] text-gray-400 line-through">₹{compareAt.toLocaleString('en-IN')}</span>
                          )}
                          <span className="text-sm font-bold text-gray-900">₹{price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== WHY SO CHEAP? (Trust Builder) ===== */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 rounded-3xl p-6 md:p-10">
            {/* Glows */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-[120px]" />

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Not a Scam. Here's the Deal.
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                  How We Get You These Prices
                </h2>
                <p className="text-gray-400 text-sm mt-2 max-w-lg mx-auto">
                  We work directly with brands. No fakes, no old stock.
                </p>
              </div>

              {/* Steps - visual flow */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                {[
                  { num: '1', icon: Store, color: 'blue', bg: 'from-blue-500/20 to-blue-600/10', accent: 'bg-blue-500', iconColor: 'text-blue-400', title: 'Brands Approach Us', desc: 'They want to acquire new customers & grow their user base' },
                  { num: '2', icon: Handshake, color: 'orange', bg: 'from-orange-500/20 to-orange-600/10', accent: 'bg-orange-500', iconColor: 'text-orange-400', title: 'We Get Exclusive Pricing', desc: 'Deep discounts on limited quantities — direct from brand' },
                  { num: '3', icon: BadgePercent, color: 'green', bg: 'from-green-500/20 to-green-600/10', accent: 'bg-green-500', iconColor: 'text-green-400', title: 'You Buy at Cost', desc: 'No markup, no middlemen — we pass savings to you' },
                  { num: '4', icon: Trophy, color: 'purple', bg: 'from-purple-500/20 to-purple-600/10', accent: 'bg-purple-500', iconColor: 'text-purple-400', title: 'Everyone Wins', desc: 'Brands get new customers. You get to try premium products at unreal prices.' },
                ].map((step) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={step.num} className={`bg-gradient-to-br ${step.bg} border border-white/5 rounded-2xl p-4 md:p-5 relative overflow-hidden`}>
                      {/* Large step number watermark */}
                      <span className="absolute -top-2 -right-1 text-[80px] font-display font-bold text-white/[0.03] leading-none select-none">
                        {step.num}
                      </span>

                      <div className={`w-10 h-10 ${step.accent} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                        <StepIcon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-sm text-white mb-1.5">{step.title}</h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{step.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Trust badges row */}
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-4">
                {[
                  { label: '100% Genuine', color: 'text-green-400' },
                  { label: 'Brand Warranty', color: 'text-blue-400' },
                  { label: 'Direct from Brand', color: 'text-orange-400' },
                  { label: 'Bulk Savings', color: 'text-purple-400' },
                ].map((badge) => (
                  <div key={badge.label} className="flex items-center gap-1.5 text-[11px] md:text-xs">
                    <svg className={`w-3.5 h-3.5 ${badge.color}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-gray-300 font-medium">{badge.label}</span>
                  </div>
                ))}
              </div>

              <p className="text-center text-[11px] text-gray-500">
                Backed by <a href="https://freekaamaal.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 font-semibold hover:underline">FreeKaaMaal.com</a> — India's largest deal community with 50 lakh+ members since 2010
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ALL DEALS (Tabbed + Filtered) ===== */}
      <section className="py-6 md:py-10 bg-gray-50" id="all-deals">
        <div className="container mx-auto px-4">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 text-primary mb-1">
                <Flame className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Browse Deals</span>
              </div>
              <h2 className="font-display text-2xl md:text-4xl font-bold">All Deals</h2>
            </div>

            <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200 self-start md:self-auto">
              <button
                onClick={() => setActiveTab('live')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold smooth-transition flex items-center gap-2 ${
                  activeTab === 'live'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeTab === 'live' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                Live ({featuredProducts.length})
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold smooth-transition flex items-center gap-2 ${
                  activeTab === 'upcoming'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Upcoming ({upcomingDeals.length})
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-shrink-0 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {productCategories.map((cat: any) => (
                <option key={cat.name} value={cat.name}>{cat.name} ({cat.count})</option>
              ))}
            </select>

            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="flex-shrink-0 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              <option value="all">All Brands</option>
              {brands.map((b: any) => (
                <option key={b.name} value={b.name}>{b.name} ({b.count})</option>
              ))}
            </select>

            {(filterCategory !== 'all' || filterBrand !== 'all') && (
              <button
                onClick={() => { setFilterCategory('all'); setFilterBrand('all'); }}
                className="flex-shrink-0 bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-red-100 smooth-transition"
              >
                Clear
              </button>
            )}
          </div>

          {/* Deal Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {(() => {
              const sourceProducts = activeTab === 'live' ? featuredProducts : upcomingDeals;
              const filtered = sourceProducts.filter((p: any) => {
                if (filterCategory !== 'all' && p.productType !== filterCategory) return false;
                if (filterBrand !== 'all' && p.vendor !== filterBrand) return false;
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="col-span-full text-center py-10 text-muted-foreground">
                    <p>No deals match your filters. Try changing or clearing filters.</p>
                  </div>
                );
              }

              return filtered.map((product: any) => (
                <DealCard key={product.id} {...mapProductToDeal(product, activeTab === 'live' ? 'live' : 'upcoming')} />
              ));
            })()}
          </div>

          <div className="text-center mt-8">
            <Link
              to={activeTab === 'live' ? '/collections/featured-products' : '/collections/upcoming-drops'}
              className="inline-flex items-center gap-2 gradient-urgency text-white font-semibold px-8 py-3 rounded-xl hover:shadow-lg shadow-orange-500/20 hover:scale-[1.02] smooth-transition"
            >
              View all {activeTab === 'live' ? 'live deals' : 'upcoming drops'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES (from product types) ===== */}
      {productCategories.length > 0 && (
        <section className="py-6 md:py-8 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-white" />
                </div>
                <h2 className="font-display text-xl md:text-2xl font-bold">Shop by Category</h2>
              </div>
              <Link
                to="/categories"
                className="flex items-center gap-1 text-primary text-sm font-semibold hover:underline"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {productCategories.map((cat: any, i: number) => {
                const bgColors = ['bg-orange-50 border-orange-200 hover:border-orange-400', 'bg-blue-50 border-blue-200 hover:border-blue-400', 'bg-green-50 border-green-200 hover:border-green-400', 'bg-purple-50 border-purple-200 hover:border-purple-400', 'bg-pink-50 border-pink-200 hover:border-pink-400', 'bg-amber-50 border-amber-200 hover:border-amber-400'];
                const textColors = ['group-hover:text-orange-600', 'group-hover:text-blue-600', 'group-hover:text-green-600', 'group-hover:text-purple-600', 'group-hover:text-pink-600', 'group-hover:text-amber-600'];
                return (
                  <button
                    key={cat.name}
                    onClick={() => { setFilterCategory(cat.name); document.getElementById('all-deals')?.scrollIntoView({behavior: 'smooth'}); }}
                    className={`group flex-shrink-0 ${bgColors[i % bgColors.length]} border rounded-2xl px-5 py-3 hover:shadow-md smooth-transition min-w-[130px] text-center hover:scale-[1.03] cursor-pointer`}
                  >
                    <h3 className={`font-semibold text-sm ${textColors[i % textColors.length]} smooth-transition`}>
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                      {cat.count} {cat.count === 1 ? 'deal' : 'deals'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
              Real Reviews
            </p>
            <h2 className="font-display text-2xl md:text-4xl font-bold">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg smooth-transition hover:scale-[1.02] relative"
              >
                {/* Quote mark */}
                <div className="absolute -top-3 left-6 w-8 h-8 gradient-urgency rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg leading-none">"</span>
                </div>

                <div className="flex gap-0.5 mb-4 mt-2">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-orange-400 fill-orange-400" />
                  ))}
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  "{t.text}"
                </p>

                {t.product && (
                  <p className="text-[10px] text-primary font-semibold mb-3 bg-orange-50 inline-block px-2 py-0.5 rounded-md">
                    Purchased: {t.product}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full gradient-urgency flex items-center justify-center text-white font-bold text-xs shadow-md">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.location}</p>
                    </div>
                  </div>
                  {t.date && <span className="text-[10px] text-muted-foreground">{t.date}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS + NEWSLETTER CTA ===== */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 rounded-3xl p-8 md:p-12">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/15 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-orange-600/8 rounded-full blur-[80px]" />

            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-orange-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <Zap className="w-3.5 h-3.5" />
                Never Miss a Deal
              </div>
              <h2 className="font-display text-2xl md:text-4xl font-bold text-white mb-3">
                Get Deal Alerts
              </h2>
              <p className="text-gray-400 text-sm md:text-base mb-6">
                Join 50,000+ bargain hunters. Get notified when new deals drop.
              </p>
              <div className="max-w-md mx-auto">
                <NewsletterForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer for sticky mobile CTA */}
      <div className="h-20 lg:hidden" />

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-gray-950/95 backdrop-blur-xl border-t border-white/10 lg:hidden z-40">
        <Button
          size="lg"
          className="w-full gradient-urgency text-white font-bold text-base h-12 rounded-xl shadow-lg shadow-orange-500/25 smooth-transition active:scale-[0.98]"
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
    categories: collections(first: 12, sortKey: UPDATED_AT) {
        nodes {
            id
            handle
            title
            products(first: 50) {
              nodes {
                id
              }
            }
        }
    }
    allProducts: collection(handle: "featured-products") {
      products(first: 20, sortKey: MANUAL) {
        nodes {
          vendor
          variants(first: 1) {
            nodes {
              image {
                url
              }
            }
          }
        }
      }
    }
  }

  fragment CollectionFragment on Collection {
    id
    handle
    title
    products(first: 50, sortKey: MANUAL) {
      nodes {
        id
        title
        description
        descriptionHtml
        publishedAt
        handle
        tags
        vendor
        productType
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
            quantityAvailable
          }
        }
      }
    }
  }

` as const;
