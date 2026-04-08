import {useState, useEffect, useRef, useCallback} from 'react';
import {Link, useLoaderData} from '@remix-run/react';
import {
  Flame, Zap, ShoppingBag, Gift, Truck, Clock, Star,
  ArrowRight, ChevronRight, ChevronLeft, BadgePercent, Trophy, Sparkles,
  Package, Users, TrendingDown, Tag, ChevronDown, HelpCircle, Copy, Check,
} from 'lucide-react';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import type {MetaFunction} from '@remix-run/react';
import {AnalyticsPageType} from '@shopify/hydrogen';
// CountdownTimer replaced with SaleTimer (inline) for days support

const SALE_END_DATE = new Date('2026-03-29T23:59:59+05:30');

export const meta: MetaFunction = () => {
  return [
    {title: 'March Madness Sale | Flat Rs.99 & Re.9 Steals | DealDrop by FreeKaaMaal.com'},
    {name: 'description', content: 'March Madness Sale is LIVE! Grab premium products at Flat Rs.99 and Re.9 Steals. Limited stock, limited time.'},
  ];
};

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const data = await storefront.query(MARCH_MADNESS_QUERY);
  // Pull from dedicated sale collections, fallback to featured-products until collections are published to Storefront API
  const allProducts = data.allCatalogue?.products.nodes || [];
  let re9Products = data.re9?.products.nodes || [];
  let flat99Products = [...(data.flat99?.products.nodes || [])].sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  let flat149Products = [...(data.flat149?.products.nodes || [])].sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // Fallback: sale collections not yet published to Storefront API channel
  if (re9Products.length === 0 && allProducts.length > 0) {
    re9Products = allProducts.filter((p: any) => {
      const price = parseFloat(p.variants?.nodes?.[0]?.price?.amount || '0');
      return price > 0 && price <= 9;
    });
    // If no ₹9 products, pick cheapest 8
    if (re9Products.length === 0) {
      re9Products = [...allProducts]
        .sort((a: any, b: any) => parseFloat(a.variants?.nodes?.[0]?.price?.amount || '999') - parseFloat(b.variants?.nodes?.[0]?.price?.amount || '999'))
        .slice(0, 8);
    }
  }
  if (flat99Products.length === 0 && allProducts.length > 0) {
    flat99Products = allProducts.filter((p: any) => {
      const price = parseFloat(p.variants?.nodes?.[0]?.price?.amount || '0');
      return price > 0 && price <= 99;
    });
  }
  if (flat149Products.length === 0 && allProducts.length > 0) {
    flat149Products = allProducts.filter((p: any) => {
      const price = parseFloat(p.variants?.nodes?.[0]?.price?.amount || '0');
      return price > 100 && price <= 299;
    });
  }

  // Build brands from all sale products for Shop by Brand section
  const brandMap = new Map<string, {name: string; count: number; image: string}>();
  [...flat99Products, ...re9Products, ...flat149Products].forEach((p: any) => {
    const v = p.vendor;
    if (v && !['DealDrop', 'DealDrop by FreeKaaMaal.com', 'DropMyDeal'].includes(v)) {
      const ex = brandMap.get(v);
      if (ex) ex.count++;
      else brandMap.set(v, {name: v, count: 1, image: p.variants?.nodes?.[0]?.image?.url || ''});
    }
  });

  return defer({
    analytics: {pageType: AnalyticsPageType.page},
    flat99Products, re9Products, flat149Products,
    brands: Array.from(brandMap.values()),
  });
}

// ==========================================
// Live counter animation hook
// ==========================================
function useAnimatedCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return count;
}

// ==========================================
// Sale Timer with Days
// ==========================================
function SaleTimer({targetDate, size = 'default'}: {targetDate: Date; size?: 'default' | 'sm' | 'hero'}) {
  const [time, setTime] = useState({d: 0, h: 0, m: 0, s: 0});
  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) return {d: 0, h: 0, m: 0, s: 0};
      return {
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      };
    };
    setTime(calc());
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1 font-display font-bold text-white text-sm tabular-nums">
        <span>{time.d}d</span><span className="text-orange-400">:</span>
        <span>{String(time.h).padStart(2, '0')}h</span><span className="text-orange-400">:</span>
        <span>{String(time.m).padStart(2, '0')}m</span><span className="text-orange-400">:</span>
        <span>{String(time.s).padStart(2, '0')}s</span>
      </div>
    );
  }

  if (size === 'hero') {
    const blocks = [
      {v: time.d, l: 'Days'},
      {v: time.h, l: 'Hrs'},
      {v: time.m, l: 'Min'},
      {v: time.s, l: 'Sec'},
    ];
    return (
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-1.5 mb-1.5 justify-center">
          <Flame className="w-3 h-3 text-yellow-400 animate-pulse" />
          <span className="text-yellow-400 text-[10px] font-bold uppercase tracking-widest">Sale Ends In</span>
          <Flame className="w-3 h-3 text-yellow-400 animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5">
          {blocks.map((b, i) => (
            <div key={b.l} className="flex items-center gap-1.5">
              <div className="bg-white/10 rounded-lg px-2 py-1 text-center min-w-[40px]">
                <div className="font-display font-bold text-white text-lg tabular-nums leading-none">{String(b.v).padStart(2, '0')}</div>
                <div className="text-white/40 text-[7px] uppercase tracking-wider mt-0.5">{b.l}</div>
              </div>
              {i < 3 && <span className="text-yellow-400/50 font-bold text-xs">:</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // default
  const blocks = [{v: time.d, l: 'Days'}, {v: time.h, l: 'Hrs'}, {v: time.m, l: 'Min'}, {v: time.s, l: 'Sec'}];
  return (
    <div className="flex items-center gap-1.5">
      {blocks.map((b, i) => (
        <div key={b.l} className="flex items-center gap-1.5">
          <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-center min-w-[52px]">
            <div className="font-display font-bold text-white text-2xl tabular-nums leading-none">{String(b.v).padStart(2, '0')}</div>
            <div className="text-white/40 text-[9px] uppercase tracking-wider mt-1">{b.l}</div>
          </div>
          {i < 3 && <span className="text-white/30 font-bold">:</span>}
        </div>
      ))}
    </div>
  );
}

// ==========================================
// Next Drop Countdown for ₹9 deals
// ==========================================
const DROP_HOURS = [11, 15, 20]; // 11 AM, 3 PM, 8 PM

function NextDropTimer() {
  const [timeLeft, setTimeLeft] = useState('');
  const [nextDrop, setNextDrop] = useState('');

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();

      // Find next drop time
      let targetHour = DROP_HOURS.find(h => h > currentHour || (h === currentHour && currentMin < 0));
      let tomorrow = false;
      if (!targetHour) {
        targetHour = DROP_HOURS[0]; // Next day's first drop
        tomorrow = true;
      }

      const target = new Date(now);
      if (tomorrow) target.setDate(target.getDate() + 1);
      target.setHours(targetHour, 0, 0, 0);

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return;

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`);

      const labels: Record<number, string> = {11: '11:00 AM', 15: '3:00 PM', 20: '8:00 PM'};
      setNextDrop(labels[targetHour] || '');
    };

    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-yellow-500/15 border border-yellow-500/25 rounded-xl px-3 py-2">
      <Zap className="w-3.5 h-3.5 text-yellow-400" />
      <div className="text-left">
        <div className="text-yellow-300 text-[10px] font-bold uppercase tracking-wider">Next Drop at {nextDrop}</div>
        <div className="text-yellow-400 font-display font-bold text-sm tabular-nums">{timeLeft}</div>
      </div>
    </div>
  );
}

// ==========================================
// Slot Machine — realistic look
// ==========================================
const SLOT_ITEMS = ['🍒', '💎', '7️⃣', '🔔', '⭐', '🍋'];
const SLOT_COLORS = ['#E76E50', '#3B82F6', '#DC2626', '#F59E0B', '#A855F7', '#22C55E'];
const SLOT_PRIZES = [
  {label: '5% OFF', code: 'MARCH5'},        // 0 — most common
  {label: '7% OFF', code: 'MARCH7'},        // 1 — moderate
  {label: '10% OFF', code: 'MARCH10'},      // 2 — rare
  {label: '₹20 OFF', code: 'MARCH20'},      // 3 — rare
  {label: 'Try Again', code: ''},            // 4 — no win
  {label: '5% OFF', code: 'MARCH5'},        // 5 — duplicate of 0 for display variety
];
// Probability: 40% → 5% OFF, 25% → 7% OFF, 10% → 10% OFF, 10% → ₹20 OFF, 15% → Try Again
const SLOT_WEIGHTS = [0, 0, 0, 0, 1, 1, 1, 0, 2, 3, 4, 0, 1, 0, 0, 1, 4, 0, 0, 0];

function SlotMachine() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<typeof SLOT_PRIZES[0] | null>(null);
  const [reels, setReels] = useState([0, 0, 0]);
  const [copied, setCopied] = useState(false);
  const [leverPulled, setLeverPulled] = useState(false);
  const [credits, setCredits] = useState(1);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);

  // Check cookie on mount — limit to 1 spin per user
  useEffect(() => {
    const played = document.cookie.includes('mm_slot_played=1');
    if (played) {
      setAlreadyPlayed(true);
      setCredits(0);
      // Try to restore previous result from cookie
      const savedCode = document.cookie.match(/mm_slot_code=([^;]+)/)?.[1];
      const savedLabel = document.cookie.match(/mm_slot_label=([^;]+)/)?.[1];
      if (savedCode && savedLabel) {
        setResult({code: decodeURIComponent(savedCode), label: decodeURIComponent(savedLabel)});
      }
    }
  }, []);

  const spin = () => {
    if (spinning || result || credits <= 0 || alreadyPlayed) return;
    setLeverPulled(true);
    setTimeout(() => setLeverPulled(false), 400);
    setSpinning(true);
    setCredits(0);
    const winIdx = SLOT_WEIGHTS[Math.floor(Math.random() * SLOT_WEIGHTS.length)];

    let ticks = 0;
    const reelStops = [14, 20, 28];
    const currentReels = [0, 0, 0];
    const stopped = [false, false, false];

    const interval = setInterval(() => {
      ticks++;
      for (let i = 0; i < 3; i++) {
        if (ticks >= reelStops[i] && !stopped[i]) {
          currentReels[i] = winIdx;
          stopped[i] = true;
        } else if (!stopped[i]) {
          currentReels[i] = Math.floor(Math.random() * SLOT_ITEMS.length);
        }
      }
      setReels([...currentReels]);

      if (stopped.every(Boolean)) {
        clearInterval(interval);
        setTimeout(() => {
          setSpinning(false);
          const prize = SLOT_PRIZES[winIdx];
          setResult(prize);
          // Save to cookie — expires in 7 days
          const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
          document.cookie = `mm_slot_played=1; expires=${expires}; path=/`;
          document.cookie = `mm_slot_code=${encodeURIComponent(prize.code)}; expires=${expires}; path=/`;
          document.cookie = `mm_slot_label=${encodeURIComponent(prize.label)}; expires=${expires}; path=/`;
        }, 400);
      }
    }, 65);
  };

  const handleCopy = () => {
    if (result?.code) {
      navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const frameGradient = 'linear-gradient(to bottom, #1b1b1b 0%, #383838 8%, #3a3a3a 20%, #0a0a0a 47%, #010101 50%, #0d0d0d 54%, #444444 100%)';
  const reelOverlay = 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 25%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.7) 100%)';
  const leverRingGradient = 'linear-gradient(to bottom, #282828 0%, #959595 14%, #d1d1d1 37%, #bababa 49%, #959595 67%, #212121 100%)';
  const leverArmGradient = 'linear-gradient(to right, #0d0d0d 0%, #4e4e4e 47%, #383838 87%, #1b1b1b 100%)';
  const knobGradient = 'radial-gradient(ellipse at center, #ff6363 0%, #cf0404 100%)';

  return (
    <div className="flex justify-center">
      <div className="relative" style={{width: '280px'}}>
        <div className="absolute -bottom-4 left-6 right-6 h-8 bg-black/30 rounded-[50%] blur-lg" />

        {/* === MACHINE BODY (inspired by CSS reference) === */}
        <div className="relative rounded-[10px]" style={{
          background: '#ED5D1E',
          border: '2px solid #ED5D1E',
          boxShadow: '0 1px 100px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.8), inset 0 0 25px rgba(255,255,255,0.6)',
          padding: '10px',
        }}>
          {/* Top cap */}
          <div className="absolute -top-[4px] left-1/2 -translate-x-1/2 rounded-t-[10px]" style={{
            width: '95%', height: '12px',
            background: '#ED5D1E', border: '2px solid #ED5D1E',
            boxShadow: '0 -1px 1px rgba(0,0,0,0.6), inset 0 0 25px rgba(255,255,255,0.2)',
          }} />

          {/* Reel frame (dark chrome) */}
          <div className="rounded-md relative" style={{
            background: frameGradient,
            border: '2px solid #ED5D1E',
            boxShadow: '0 0 16px rgba(255,255,255,0.3), 0 1px 1px rgba(255,255,255,0.5), 0 -1px 1px rgba(255,255,255,0.2), inset 0 -2px 15px #000',
            padding: '14px',
          }}>
            {/* === REEL WINDOW === */}
            <div className="overflow-hidden rounded-md relative" style={{height: '100px'}}>
              <div className="flex h-full gap-[3px]">
                {reels.map((r, i) => (
                  <div key={i} className="flex-1 relative overflow-hidden rounded-sm" style={{
                    background: '#FFF',
                    boxShadow: '0 0 15px rgba(0,0,0,0.8)',
                  }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={spinning ? 'animate-bounce' : ''} style={spinning ? {animationDuration: '0.12s'} : {}}>
                        <span className="font-display font-black text-2xl md:text-3xl" style={{color: SLOT_COLORS[r]}}>
                          {SLOT_ITEMS[r]}
                        </span>
                      </div>
                    </div>
                    {/* Curved glass overlay — creates realistic reel depth */}
                    <div className="absolute inset-0 pointer-events-none" style={{background: reelOverlay}} />
                  </div>
                ))}
              </div>
              {/* Half-line glaze */}
              <div className="absolute left-0 right-0 top-0 pointer-events-none" style={{height: '46%', borderBottom: '1px solid rgba(255,255,255,0.15)'}} />
              {/* Top overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.15) 50%, transparent 51%, transparent 100%)'}} />
            </div>
          </div>

          {/* Credits display */}
          <div className="mt-2 rounded-md" style={{
            background: frameGradient,
            border: '2px solid #ED5D1E',
            boxShadow: '0 0 16px rgba(255,255,255,0.3), 0 1px 1px rgba(255,255,255,0.5), inset 0 -2px 15px #000',
            height: '30px', padding: '0 10px',
          }}>
            {result ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-[#78FF00] font-mono font-bold text-sm tracking-wider animate-pulse">WIN: {result.label}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between h-full">
                <span className="text-white/30 font-mono text-[10px]">CREDITS</span>
                <span className="text-[#78FF00] font-mono font-bold text-sm tracking-[3px]">{String(credits).padStart(3, '0')}</span>
              </div>
            )}
          </div>

          {/* Bottom glaze */}
          <div className="absolute bottom-[2px] left-[4px] right-[4px] h-[14px] rounded-b-md" style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.1) 100%)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.2)',
          }} />

          {/* === LEVER (matching CSS reference) === */}
          <div className="absolute -right-[38px] top-[25px]" style={{width: '37px', height: '90px', cursor: 'pointer'}} onClick={spin}>
            {/* Ring mount 1 */}
            <div className="absolute top-0 left-0" style={{background: leverRingGradient, borderRadius: '0 2px 2px 0', boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.8)', width: '8px', height: '100%'}} />
            {/* Ring mount 2 */}
            <div className="absolute left-[8px]" style={{background: leverRingGradient, borderRadius: '0 2px 2px 0', boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.8)', width: '10px', height: '80%', top: '10%', overflow: 'hidden'}} />
            {/* Arm */}
            <div className="absolute" style={{
              background: leverArmGradient, borderRadius: '0 0 4px 4px',
              boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.8)',
              width: '6px', height: '50%', left: '10px',
              top: leverPulled ? '0px' : '-25px',
              transition: 'top 0.3s cubic-bezier(0.68,-0.55,0.27,1.55)',
              overflow: 'visible',
            }}>
              {/* Red knob */}
              <div className="absolute" style={{
                background: knobGradient, borderRadius: '10px',
                boxShadow: '0 1px 1px rgba(0,0,0,0.4)',
                width: '20px', height: '16px', left: '-7px', top: '-15px',
              }} />
            </div>
            {/* Arm shadow */}
            <div className="absolute" style={{background: '#000', borderRadius: '10px', width: '8px', height: '6px', left: '9px', bottom: '0'}} />
          </div>

          {/* Bottom cap */}
          <div className="absolute -bottom-[4px] left-1/2 -translate-x-1/2 rounded-b-[10px]" style={{
            width: '95%', height: '12px',
            background: '#ED5D1E', border: '2px solid #ED5D1E',
            boxShadow: '0 1px 2px rgba(0,0,0,0.8), inset 0 0 25px rgba(255,255,255,0.2)',
          }} />
        </div>

        {/* === RESULT / SPIN BUTTON (below machine) === */}
        <div className="mt-8 text-center">
          {result ? (
            result.code ? (
              <div className="space-y-3">
                <div className="bg-green-500/20 border border-green-400/30 rounded-xl px-4 py-3">
                  <p className="text-white font-display font-black text-base">🎉 You won {result.label}! 🎉</p>
                </div>
                <div className="flex items-center justify-center gap-3 bg-black/40 border-2 border-dashed border-yellow-500/50 rounded-xl px-5 py-3">
                  <span className="text-yellow-400 font-display font-black text-xl tracking-[0.15em]">{result.code}</span>
                  <button onClick={handleCopy} className="bg-yellow-500 text-black px-3 py-1.5 rounded-lg text-xs font-black">{copied ? '✓ Copied' : 'COPY'}</button>
                </div>
                <p className="text-gray-500 text-[10px]">Apply at checkout · Valid till sale ends</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3">
                  <p className="text-white font-display font-black text-base">😔 Better luck next time!</p>
                </div>
                <p className="text-gray-400 text-xs">Don't worry — you're still getting amazing prices at ₹9, ₹99 & ₹149!</p>
              </div>
            )
          ) : alreadyPlayed ? (
            <div className="space-y-2">
              <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
                <p className="text-gray-400 text-sm font-semibold">You've already used your free spin!</p>
              </div>
              <p className="text-gray-500 text-[10px]">1 spin per customer. Shop the deals below!</p>
            </div>
          ) : (
            <button onClick={spin} disabled={spinning}
              className={`px-10 py-3.5 rounded-xl font-display font-black text-sm tracking-wider border-b-4 smooth-transition ${
                spinning ? 'bg-gray-600 border-gray-700 text-gray-400 cursor-wait' : 'bg-gradient-to-b from-green-500 to-green-600 border-green-800 text-white hover:from-green-400 hover:to-green-500 active:border-b-2 active:translate-y-0.5'
              }`}
              style={spinning ? {} : {boxShadow: '0 4px 20px rgba(34,197,94,0.5)'}}
            >
              {spinning ? '⏳ SPINNING...' : '🎰 PULL THE LEVER'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Main Page
// ==========================================
export default function MarchMadness() {
  const {flat99Products, re9Products, flat149Products, brands} = useLoaderData<typeof loader>();
  const [saleEndDate] = useState(SALE_END_DATE);
  // "bought today" counter: starts at 127 at midnight, grows ~40-70 per hour
  // Uses date as seed so it's consistent across refreshes but changes daily
  const now = new Date();
  const hourNow = now.getHours();
  const daySeed = now.getDate() * 7 + now.getMonth() * 13; // changes daily
  const boughtToday = 127 + (hourNow * 47) + ((daySeed + hourNow * 3) % 29);

  const ordersCount = useAnimatedCounter(boughtToday, 2500);
  const savingsCount = useAnimatedCounter(12, 2000);

  const mapProduct = (product: any) => {
    const variant = product.variants?.nodes?.[0];
    if (!variant) return null;
    return {
      id: product.id, title: product.title, description: product.description || '',
      image: variant.image?.url || '',
      mrp: parseFloat(variant.compareAtPrice?.amount || variant.price?.amount || '0'),
      dealPrice: parseFloat(variant.price?.amount || '0'),
      handle: product.handle, vendor: product.vendor || '',
      availableForSale: product.availableForSale ?? variant.availableForSale ?? true,
      quantityAvailable: variant.quantityAvailable,
    };
  };

  const flat99Deals = flat99Products.map(mapProduct).filter(Boolean) as any[];
  const re9Deals = re9Products.map(mapProduct).filter(Boolean) as any[];
  const flat149Deals = flat149Products.map(mapProduct).filter(Boolean) as any[];

  const flat99Star = [...flat99Deals]
    .sort((a, b) => ((b.mrp - b.dealPrice) / (b.mrp || 1)) - ((a.mrp - a.dealPrice) / (a.mrp || 1)))
    .slice(0, 3);
  const flat99Grid = flat99Deals.filter((d) => !flat99Star.find((s) => s.id === d.id));

  // Dynamic ticker using real product names from collections
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Jaipur', 'Lucknow', 'Ahmedabad'];
  const names = ['Priya', 'Rahul', 'Anjali', 'Vikram', 'Sneha', 'Amit', 'Pooja', 'Rohan', 'Neha', 'Karan'];
  const tickerItems: {t: string; c: string}[] = [];

  // Add real product-based messages
  re9Deals.slice(0, 2).forEach((d: any, i: number) => {
    tickerItems.push({t: `🔥 ${names[i]} from ${cities[i]} grabbed ${d.title.split('|')[0].trim()} at ₹${Math.round(d.dealPrice)}`, c: 'text-green-400'});
  });
  tickerItems.push({t: '⚡ ₹9 deal SOLD OUT in 3 min — next drop at 11 AM, 3 PM or 8 PM!', c: 'text-red-400'});
  flat99Deals.slice(0, 2).forEach((d: any, i: number) => {
    tickerItems.push({t: `🛒 ${names[i + 3]} from ${cities[i + 3]} bought ${d.title.split('|')[0].trim()} at ₹${Math.round(d.dealPrice)}`, c: 'text-green-400'});
  });
  tickerItems.push({t: `🎉 ${ordersCount.toLocaleString()}+ orders today`, c: 'text-yellow-400'});
  tickerItems.push({t: `💰 ₹${savingsCount}L+ saved by customers`, c: 'text-orange-400'});

  return (
    <div style={{scrollBehavior: 'smooth'}}>
      {/* ===== HERO — Immersive sale event feel ===== */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.2),transparent_50%)]" />
        {/* Floating confetti dots */}
        <div className="absolute top-10 left-[10%] w-3 h-3 bg-white/20 rounded-full animate-float" />
        <div className="absolute top-20 right-[15%] w-2 h-2 bg-yellow-300/30 rounded-full animate-float" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-10 left-[20%] w-2 h-2 bg-white/15 rounded-full animate-float" style={{animationDelay: '0.5s'}} />
        <div className="absolute top-16 left-[50%] w-4 h-4 bg-yellow-200/10 rounded-full animate-float" style={{animationDelay: '1.5s'}} />

        <div className="container mx-auto px-4 py-6 md:py-8 relative z-10">
          {/* Top strip: live badge + timer */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* Fix 9: pulse animation on badge */}
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full border border-white/20" style={{animation: 'livePulse 2s ease-in-out infinite'}}>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider">LIVE NOW</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm text-white/80 px-3 py-1 rounded-full text-[10px]">
                <Users className="w-3 h-3" />
                <span>{ordersCount.toLocaleString()}+ orders</span>
              </div>
            </div>
            <SaleTimer targetDate={saleEndDate} size="hero" />
          </div>

          {/* Main hero content — Fix 8: clamp font size */}
          <div className="text-center mb-5">
            <h1 className="font-display font-black text-white leading-none mb-2 drop-shadow-lg" style={{fontSize: 'clamp(2.5rem, 8vw, 6rem)'}}>
              MARCH <span className="text-yellow-300">MADNESS</span>
            </h1>
            <p className="text-white/80 text-sm md:text-base font-medium">
              The craziest sale on the internet. Prices you won't believe.
            </p>
          </div>

          {/* Two price bombs — Fix 2: CTAs, Fix 7: ribbons, Fix 8: stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 max-w-3xl mx-auto">
            {/* ₹9 Bomb */}
            <a href="#re-9" className="group relative">
              <div className="bg-white rounded-2xl p-4 md:p-5 text-center shadow-2xl relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] smooth-transition">
                {/* Fix 7: Ribbon — positioned to not clip */}
                <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-md">
                  🔥 HOT
                </div>
                <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest mb-1">Lightning Steals</div>
                <div className="font-display font-black text-gray-900 leading-none">
                  <span className="text-lg md:text-xl">Just</span>
                  <div className="text-5xl md:text-7xl text-red-500">₹9</div>
                </div>
                <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-gray-500">
                  <Zap className="w-3 h-3 text-red-500" />
                  <span>{re9Deals.length} products · Selling fast</span>
                </div>
                <div className="flex justify-center -space-x-2 mt-3">
                  {re9Deals.slice(0, 5).map((d: any, i: number) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-sm" style={{zIndex: 5 - i}}>
                      <img src={d.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                {/* Fix 2: CTA Button */}
                <div className="mt-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold py-2 px-4 rounded-lg group-hover:scale-[1.03] smooth-transition">
                  Grab ₹9 Deals →
                </div>
              </div>
            </a>

            {/* ₹99 Bomb */}
            <a href="#flat-99" className="group relative">
              <div className="bg-white rounded-2xl p-4 md:p-5 text-center shadow-2xl relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] smooth-transition">
                <div className="absolute top-3 right-3 z-10 bg-green-500 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-md">
                  ✨ DEAL
                </div>
                <div className="text-orange-500 text-[10px] font-bold uppercase tracking-widest mb-1">Bestsellers</div>
                <div className="font-display font-black text-gray-900 leading-none">
                  <span className="text-lg md:text-xl">Flat</span>
                  <div className="text-5xl md:text-7xl text-orange-500">₹99</div>
                </div>
                <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-gray-500">
                  <Truck className="w-3 h-3 text-green-500" />
                  <span>{flat99Deals.length} products · Free shipping</span>
                </div>
                <div className="flex justify-center -space-x-2 mt-3">
                  {flat99Deals.slice(0, 5).map((d: any, i: number) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-sm" style={{zIndex: 5 - i}}>
                      <img src={d.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="mt-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold py-2 px-4 rounded-lg group-hover:scale-[1.03] smooth-transition">
                  Shop ₹99 Deals →
                </div>
              </div>
            </a>
          </div>

          {/* Scroll hint */}
          <div className="text-center">
            <div className="inline-flex flex-col items-center text-white/50 animate-bounce">
              <span className="text-[10px] uppercase tracking-widest">Scroll to shop</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== LIVE TICKER ===== */}
      <section className="py-2.5 bg-gray-900 border-y border-gray-800 overflow-hidden">
        <div className="flex whitespace-nowrap" style={{
          animation: 'tickerScroll 35s linear infinite',
          width: 'max-content',
        }}>
          {/* Duplicate content 3x for seamless loop */}
          {[0, 1, 2].map((rep) => (
            <div key={rep} className="flex items-center gap-10 px-5">
              {tickerItems.map((item, i) => (
                <span key={i} className={`${item.c} text-xs font-medium flex-shrink-0`}>{item.t}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ===== RE.9 STEALS — First section, the hook ===== */}
      <section className="py-8 md:py-10 bg-gray-950 relative overflow-hidden" id="re-9">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-red-500/10 rounded-full blur-[100px]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Lightning Steals</span>
                <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">SELLING FAST</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                Just <span className="text-red-400">₹9</span> — Not a Typo
              </h2>
              <p className="text-gray-500 text-xs mt-1">New deals drop at 11 AM, 3 PM & 8 PM daily</p>
            </div>
            <NextDropTimer />
          </div>

          {/* Fix 4: Carousel with scroll fade + indicators */}
          {re9Deals.length > 0 && (
            <div className="relative">

              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory" id="re9-carousel">
                {re9Deals.map((deal: any) => {
                  const disc = deal.mrp > 0 ? Math.round(((deal.mrp - deal.dealPrice) / deal.mrp) * 100) : 0;
                  const price = Math.round(deal.dealPrice);
                  const mrp = Math.round(deal.mrp);
                  const isOOS = deal.availableForSale === false;
                  // Real stock if available, otherwise generate realistic number from product ID
                  const realStock = deal.quantityAvailable;
                  const fakeStock = realStock != null ? realStock : (((deal.id.charCodeAt(deal.id.length - 2) * 7 + deal.id.charCodeAt(deal.id.length - 3) * 3) % 35) + 8);
                  const stock = isOOS ? 0 : fakeStock;
                  const stockPct = isOOS ? 0 : Math.min((stock / 50) * 100, 100);
                  return (
                    <Link key={deal.id} to={`/products/${deal.handle}`} className="group snap-start flex-shrink-0 w-[260px] md:w-[300px]">
                      <div className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden smooth-transition h-full flex flex-col ${isOOS ? 'opacity-75' : 'hover:border-red-500/30'}`}>
                        {/* Image */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-800">
                          <img src={deal.image} alt={deal.title} className={`w-full h-full object-cover ${isOOS ? 'grayscale-[40%]' : 'group-hover:scale-105'} smooth-transition`} />
                          {disc > 0 && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                              <TrendingDown className="w-3 h-3" />{disc}% OFF
                            </div>
                          )}
                          {/* SOLD OUT overlay */}
                          {isOOS && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="bg-red-600 text-white font-display font-black text-lg px-6 py-2 rounded-xl -rotate-12 shadow-xl border-2 border-white/20">
                                SOLD OUT
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Card body */}
                        <div className="p-3.5 space-y-2.5 flex-1 flex flex-col">
                          <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">{deal.vendor}</p>
                          <h3 className="text-sm font-semibold text-white" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.5rem'}}>{deal.title}</h3>
                          {/* Price row */}
                          <div className="flex items-baseline gap-2">
                            <span className={`text-2xl font-display font-bold ${isOOS ? 'text-gray-500' : 'text-white'}`}>₹{price}</span>
                            {mrp > price && (
                              <span className="text-sm text-gray-500 line-through">₹{mrp}</span>
                            )}
                            {mrp > price && !isOOS && (
                              <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                Save ₹{mrp - price}
                              </span>
                            )}
                          </div>
                          {/* Stock bar or SOLD OUT */}
                          {isOOS ? (
                            <div className="text-red-400 text-[10px] font-bold">Sold out — check back at next drop!</div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className={`font-semibold ${stockPct < 30 ? 'text-red-400' : 'text-orange-400'}`}>
                                  {stockPct < 15 ? 'Almost Gone!' : stockPct < 30 ? 'Selling Fast!' : 'In Stock'}
                                </span>
                                <span className="text-gray-500">{stock} left</span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${stockPct < 30 ? 'bg-red-500 animate-pulse' : 'bg-orange-500/70'}`} style={{width: `${stockPct}%`}} />
                              </div>
                            </div>
                          )}
                          {/* CTA */}
                          <button className={`w-full text-xs font-bold py-2.5 rounded-xl mt-auto smooth-transition ${
                            isOOS
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:scale-[1.03]'
                          }`} disabled={isOOS}>
                            {isOOS ? 'Sold Out' : `Buy at ₹${price}`}
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Fix 4: Mobile dot indicators */}
              <div className="flex items-center justify-center gap-1.5 mt-2 md:hidden">
                {re9Deals.slice(0, 8).map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-red-400' : 'bg-white/20'}`} />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mt-4 text-gray-500 text-xs">
            <Truck className="w-3.5 h-3.5 text-green-400" />
            <span>₹49 shipping on ₹9 deals — <span className="text-green-400 font-semibold">FREE</span> when you add any ₹99 or ₹149 product</span>
          </div>
        </div>
      </section>

      {/* ===== WIN A DISCOUNT — Slot machine style ===== */}
      <section className="py-8 md:py-10 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden" id="spin-wheel">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(231,110,80,0.08),transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-2 bg-yellow-500/15 border border-yellow-500/25 text-yellow-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" />
                Bonus Round
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                Win an <span className="text-yellow-300">Extra Discount</span>
              </h2>
              <p className="text-gray-500 text-sm mt-1">Tap the button. Match 3 slots. Win big.</p>
            </div>
            <SlotMachine />
          </div>
        </div>
      </section>

      {/* ===== UPSELL BRIDGE ===== */}
      <section className="py-4 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 text-white text-center">
            <ShoppingBag className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold">Love the ₹9 deals? Add a ₹99 or ₹149 product to unlock FREE shipping!</p>
            <a href="#flat-99" className="flex-shrink-0 bg-white text-orange-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-50 smooth-transition">
              Shop ₹99 <ArrowRight className="w-3 h-3 inline" />
            </a>
          </div>
        </div>
      </section>

      {/* ===== FLAT ₹99 STORE ===== */}
      <section className="py-8 md:py-10 bg-white" id="flat-99">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                <span className="text-orange-500 text-xs font-bold uppercase tracking-wider">Flat ₹99 Store</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
                Top Picks at <span className="text-orange-500">₹99</span>
                <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">
                  <Truck className="w-3 h-3" /> Free Shipping
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <Users className="w-3.5 h-3.5" /><span>{boughtToday.toLocaleString()}+ bought today</span>
            </div>
          </div>

          {/* ₹99 Products — sale-style cards with SOLD OUT support */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {flat99Deals.map((deal: any, i: number) => {
              const disc = deal.mrp > 0 ? Math.round(((deal.mrp - deal.dealPrice) / deal.mrp) * 100) : 0;
              const saved = Math.round(deal.mrp - deal.dealPrice);
              const isOOS = (deal.quantityAvailable ?? 1) <= 0;
              return (
                <Link key={deal.id} to={`/products/${deal.handle}`} className="group">
                  <div className={`relative bg-white rounded-2xl overflow-hidden border border-gray-100 smooth-transition ${isOOS ? 'opacity-80' : 'hover:shadow-xl hover:scale-[1.02]'}`}>
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      <img src={deal.image} alt={deal.title} className={`w-full h-full object-cover ${isOOS ? 'grayscale-[30%]' : 'group-hover:scale-110'} smooth-transition`} />
                      <div className="absolute top-0 left-0">
                        <div className="bg-red-500 text-white font-bold text-[11px] pl-2 pr-3 py-1 rounded-br-xl shadow-md">
                          {disc}% OFF
                        </div>
                      </div>
                      {isOOS && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="bg-gray-900 text-white font-display font-black text-sm px-4 py-1.5 rounded-lg -rotate-12 shadow-xl border border-white/20">
                            SOLD OUT
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-1.5">
                      <p className="text-[9px] text-orange-500 font-bold uppercase tracking-wider">{deal.vendor}</p>
                      <h3 className="text-xs font-semibold text-gray-900 leading-snug" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2rem'}}>{deal.title}</h3>
                      <div className={`${isOOS ? 'bg-gray-100' : 'bg-orange-50'} rounded-lg px-2.5 py-2 -mx-0.5`}>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs line-through decoration-red-400 decoration-2">₹{Math.round(deal.mrp).toLocaleString('en-IN')}</span>
                          <ArrowRight className="w-3 h-3 text-red-400" />
                          <span className={`text-xl font-display font-black ${isOOS ? 'text-gray-400' : 'text-orange-600'}`}>₹{Math.round(deal.dealPrice)}</span>
                        </div>
                        {!isOOS && saved > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Tag className="w-3 h-3 text-green-600" />
                            <span className="text-green-700 text-[10px] font-bold">You save ₹{saved.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {isOOS && <p className="text-gray-500 text-[10px] font-semibold mt-1">Sold Out</p>}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FLAT ₹149 STORE ===== */}
      {flat149Deals.length > 0 && (
        <section className="py-8 md:py-10 bg-gray-50" id="flat-149">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-purple-500" />
                  <span className="text-purple-500 text-xs font-bold uppercase tracking-wider">Premium Picks</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
                  Best at <span className="text-purple-500">₹149</span>
                  <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">
                    <Truck className="w-3 h-3" /> Free Shipping
                  </span>
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <Truck className="w-3.5 h-3.5 text-green-500" />
                <span>Free shipping</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {flat149Deals.map((deal: any) => {
                const disc = deal.mrp > 0 ? Math.round(((deal.mrp - deal.dealPrice) / deal.mrp) * 100) : 0;
                const saved = Math.round(deal.mrp - deal.dealPrice);
                const price = Math.round(deal.dealPrice);
                const isOOS = (deal.quantityAvailable ?? 1) <= 0;
                return (
                  <Link key={deal.id} to={`/products/${deal.handle}`} className="group">
                    <div className={`relative bg-white rounded-2xl overflow-hidden border border-gray-100 smooth-transition ${isOOS ? 'opacity-80' : 'hover:shadow-xl hover:scale-[1.02]'}`}>
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        <img src={deal.image} alt={deal.title} className={`w-full h-full object-cover ${isOOS ? 'grayscale-[30%]' : 'group-hover:scale-110'} smooth-transition`} />
                        {disc > 0 && (
                          <div className="absolute top-0 left-0">
                            <div className="bg-purple-500 text-white font-bold text-[11px] pl-2 pr-3 py-1 rounded-br-xl shadow-md">
                              {disc}% OFF
                            </div>
                          </div>
                        )}
                        {isOOS && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="bg-gray-900 text-white font-display font-black text-sm px-4 py-1.5 rounded-lg -rotate-12 shadow-xl border border-white/20">
                              SOLD OUT
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-3 space-y-1.5">
                        <p className="text-[9px] text-purple-500 font-bold uppercase tracking-wider">{deal.vendor}</p>
                        <h3 className="text-xs font-semibold text-gray-900 leading-snug" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2rem'}}>{deal.title}</h3>
                        <div className={`${isOOS ? 'bg-gray-100' : 'bg-purple-50'} rounded-lg px-2.5 py-2 -mx-0.5`}>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs line-through decoration-purple-400 decoration-2">₹{Math.round(deal.mrp).toLocaleString('en-IN')}</span>
                            <ArrowRight className="w-3 h-3 text-purple-400" />
                            <span className={`text-xl font-display font-black ${isOOS ? 'text-gray-400' : 'text-purple-600'}`}>₹{price}</span>
                          </div>
                          {!isOOS && saved > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Tag className="w-3 h-3 text-green-600" />
                              <span className="text-green-700 text-[10px] font-bold">You save ₹{saved.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          {isOOS && <p className="text-gray-500 text-[10px] font-semibold mt-1">Sold Out</p>}
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

      {/* ===== SOCIAL PROOF — Fix 8: 2x2 on mobile ===== */}
      <section className="py-3 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:flex md:items-center md:justify-center gap-3 md:gap-10 text-white">
            {[
              {num: `${ordersCount.toLocaleString()}+`, label: 'Orders'},
              {num: `₹${savingsCount}L+`, label: 'Saved'},
              {num: '4.8/5', label: 'Rating'},
              {num: '50L+', label: 'FKM Community'},
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-center md:justify-start gap-2">
                <span className="font-display font-bold text-sm">{s.num}</span>
                <span className="text-white/50 text-[10px]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SHOP BY BRAND ===== */}
      {(brands as any[]).length > 0 && (
        <section className="py-8 md:py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-500 text-xs font-bold uppercase tracking-wider">Shop by Brand</span>
                </div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-gray-900">Brands in This Sale</h2>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {(brands as any[]).map((brand: any) => (
                <Link key={brand.name} to={`/brand/${brand.name.toLowerCase().replace(/\s+/g, '-')}`} className="flex-shrink-0 group">
                  <div className="w-28 bg-gray-50 rounded-2xl p-3 text-center border border-gray-100 hover:border-orange-200 hover:shadow-md smooth-transition">
                    {brand.image && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden mx-auto mb-2 bg-white border border-gray-100">
                        <img src={brand.image} alt={brand.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-xs font-semibold text-gray-900 truncate">{brand.name}</p>
                    <p className="text-[9px] text-gray-500">{brand.count} deals</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== WHY SO CHEAP — Trust Builder ===== */}
      <section className="py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 rounded-3xl p-6 md:p-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-[120px]" />
            <div className="relative z-10">
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Not a Scam. Here's the Deal.
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white">How We Get You These Prices</h2>
                <p className="text-gray-400 text-sm mt-2 max-w-lg mx-auto">We work directly with brands. No fakes, no old stock.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  {num: '1', icon: '🏪', title: 'Brands Approach Us', desc: 'They want to acquire new customers & grow their user base'},
                  {num: '2', icon: '🤝', title: 'We Get Exclusive Pricing', desc: 'Deep discounts on limited quantities — direct from brand'},
                  {num: '3', icon: '💰', title: 'You Buy at Cost', desc: 'No markup, no middlemen — we pass savings to you'},
                  {num: '4', icon: '🏆', title: 'Everyone Wins', desc: 'Brands get new customers. You get premium products at unreal prices.'},
                ].map((step) => (
                  <div key={step.num} className="bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden">
                    <span className="absolute -top-2 -right-1 text-[60px] font-display font-bold text-white/[0.03] leading-none select-none">{step.num}</span>
                    <div className="text-2xl mb-2">{step.icon}</div>
                    <h3 className="font-bold text-sm text-white mb-1">{step.title}</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {['100% Genuine', 'Brand Warranty', 'Direct from Brand', 'Bulk Savings'].map((label) => (
                  <div key={label} className="flex items-center gap-1.5 text-[11px]">
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-gray-300 font-medium">{label}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-[11px] text-gray-500 mt-4">
                Backed by <a href="https://freekaamaal.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 font-semibold hover:underline">FreeKaaMaal.com</a> — India's largest deal community with 50 lakh+ members since 2010
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS — Interactive steps ===== */}
      <section className="py-8 md:py-10 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <span className="text-orange-500 text-xs font-bold uppercase tracking-widest">4 Easy Steps</span>
            <h2 className="font-display text-xl md:text-2xl font-bold text-gray-900 mt-1">How to Grab Your Deal</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {num: '01', icon: '🛒', color: 'from-orange-500 to-red-500', title: 'Pick a Deal', desc: 'Browse ₹9 steals or ₹99 bestsellers'},
                {num: '02', icon: '🎰', color: 'from-purple-500 to-pink-500', title: 'Spin the Slots', desc: 'Win up to 20% extra discount'},
                {num: '03', icon: '🏷️', color: 'from-green-500 to-emerald-600', title: 'Apply & Save', desc: 'Use your coupon at checkout'},
                {num: '04', icon: '📦', color: 'from-blue-500 to-cyan-600', title: 'Unbox Joy', desc: '100% genuine, fast delivery'},
              ].map((step) => (
                <div key={step.num} className="relative group">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-lg hover:scale-[1.03] smooth-transition h-full">
                    {/* Step number watermark */}
                    <span className="absolute top-2 right-3 text-4xl font-display font-black text-gray-100 select-none group-hover:text-orange-100 smooth-transition">
                      {step.num}
                    </span>
                    {/* Emoji icon */}
                    <div className="text-3xl mb-2">{step.icon}</div>
                    <h3 className="font-bold text-sm text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-10 md:py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-5 left-[10%] w-3 h-3 bg-white/15 rounded-full animate-float" />
        <div className="absolute bottom-10 right-[15%] w-2 h-2 bg-yellow-300/20 rounded-full animate-float" style={{animationDelay: '1s'}} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-black text-white leading-tight mb-3">
              Still Here?<br />
              <span className="text-yellow-300">Stocks Won't Be.</span>
            </h2>
            <p className="text-white/70 text-sm mb-6">Once sold out, these deals are gone forever. No restocking. No extensions.</p>

            <div className="flex justify-center mb-6">
              <SaleTimer targetDate={saleEndDate} />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="#re-9" className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-3.5 rounded-xl font-bold text-sm hover:scale-105 smooth-transition shadow-xl w-full sm:w-auto justify-center">
                <Zap className="w-4 h-4" />
                Grab ₹9 Steals
              </a>
              <a href="#flat-99" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-white/30 smooth-transition w-full sm:w-auto justify-center">
                <ShoppingBag className="w-4 h-4" />
                Shop ₹99 Deals
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ — Fix 5: themed styling ===== */}
      <section className="py-8 md:py-10" style={{background: '#FFF8F3'}}>
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <HelpCircle className="w-4 h-4 text-orange-500" />
              <span className="text-orange-500 text-xs font-bold uppercase tracking-widest">Got Questions?</span>
            </div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2">
            {[
              {q: 'Are these products genuine?', a: 'Yes, 100%. Sourced directly from brands. Backed by FreeKaaMaal.com since 2010.'},
              {q: 'Why are prices so low?', a: 'Brands give us exclusive pricing to acquire new customers. Zero markup — savings passed to you.'},
              {q: 'Is there shipping?', a: '₹99 & ₹149 products come with FREE shipping. ₹9 products have ₹49 flat shipping, which becomes FREE when you add any ₹99 or ₹149 product.'},
              {q: 'Can I return?', a: 'Yes, standard return policy applies to all March Madness products.'},
              {q: 'How long does the sale last?', a: 'Till 29th March 2026 at 11:59 PM or until stocks last, whichever is earlier!'},
            ].map((f, i) => (
              <details key={i} className="group bg-white rounded-xl border border-orange-100 overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer px-4 py-3.5 text-sm font-semibold text-gray-900 hover:bg-orange-50/50 smooth-transition group-open:border-l-[3px] group-open:border-l-orange-500">
                  {f.q}
                  <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 smooth-transition flex-shrink-0 ml-2" />
                </summary>
                <p className="px-4 pb-3.5 text-sm text-gray-600 border-l-[3px] border-l-orange-500">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STICKY MOBILE CTA ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 p-2.5 safe-area-inset-bottom">
        <div className="flex gap-2">
          <a href="#re-9" className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-lg">
            <Zap className="w-3.5 h-3.5" />₹9 Steals
          </a>
          <a href="#flat-99" className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-900 text-white py-2.5 rounded-xl font-bold text-xs">
            <ShoppingBag className="w-3.5 h-3.5" />₹99 Deals
          </a>
        </div>
      </div>
      <div className="h-14 md:hidden" />

      {/* Inline keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes livePulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes tickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
        html { scroll-behavior: smooth; }
      `}} />
    </div>
  );
}

// ==========================================
// GraphQL
// ==========================================
const MARCH_MADNESS_QUERY = `#graphql
  query MarchMadness($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    flat99: collection(handle: "collection-of-99-sale-1") { ...SaleCollectionFragment }
    re9: collection(handle: "collection-of-99-sale") { ...SaleCollectionFragment }
    flat149: collection(handle: "collection-of-rs-149-sale") { ...SaleCollectionFragment }
    allCatalogue: collection(handle: "featured-products") { ...SaleCollectionFragment }
  }
  fragment SaleCollectionFragment on Collection {
    id
    handle
    title
    products(first: 50, sortKey: MANUAL) {
      nodes {
        id title description handle tags vendor productType publishedAt availableForSale
        variants(first: 1) {
          nodes {
            id availableForSale
            image { url altText width height }
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            quantityAvailable
          }
        }
      }
    }
  }
` as const;
