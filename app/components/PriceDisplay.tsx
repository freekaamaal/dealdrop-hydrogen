import { TrendingDown, Sparkles } from 'lucide-react';

interface PriceDisplayProps {
  mrp: number;
  dealPrice: number;
  size?: 'default' | 'large';
}

const PriceDisplay = ({
  mrp,
  dealPrice,
  size = 'default',
}: PriceDisplayProps) => {
  const discount = Math.round(((mrp - dealPrice) / mrp) * 100);
  const savings = mrp - dealPrice;

  const isLarge = size === 'large';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 flex-wrap">
        <span
          className={`text-muted-foreground line-through font-medium ${isLarge ? 'text-xl md:text-2xl' : 'text-lg'
            }`}
        >
          ₹{mrp.toLocaleString('en-IN')}
        </span>
        <span
          className={`font-display font-bold text-foreground ${isLarge ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-3xl'
            }`}
        >
          ₹{dealPrice.toLocaleString('en-IN')}
        </span>
        <span
          className={`
          gradient-urgency text-primary-foreground rounded-full font-bold flex items-center gap-1.5 button-glow
          ${isLarge ? 'text-base px-4 py-2' : 'text-sm px-3 py-1.5'}
        `}
        >
          <TrendingDown className={isLarge ? 'h-5 w-5' : 'h-4 w-4'} />
          {discount}% OFF
        </span>
      </div>

      <div className="flex items-center gap-2 text-primary">
        <Sparkles className="h-4 w-4" />
        <p className={`font-medium ${isLarge ? 'text-base' : 'text-sm'}`}>
          You save ₹{savings.toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  );
};

export default PriceDisplay;
