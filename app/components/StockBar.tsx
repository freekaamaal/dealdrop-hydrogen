import { Package, AlertTriangle } from 'lucide-react';

interface StockBarProps {
  remaining: number;
  total: number;
  dark?: boolean;
}

const StockBar = ({ remaining, total, dark = false }: StockBarProps) => {
  if (remaining === undefined || remaining === null || remaining <= 0) return null;

  const percentage = (remaining / total) * 100;
  const isLow = percentage < 30;
  const isCritical = percentage < 15;

  const wrapperBg = dark
    ? 'bg-white/5 border border-white/10'
    : 'glass-card';
  const textColor = dark ? 'text-white' : 'text-foreground';
  const mutedColor = dark ? 'text-gray-400' : 'text-muted-foreground';
  const barBg = dark ? 'bg-white/10' : 'bg-muted';

  return (
    <div className={`${wrapperBg} rounded-2xl p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
          ) : (
            <Package
              className={`h-5 w-5 ${isLow ? 'text-primary' : mutedColor}`}
            />
          )}
          <span
            className={`font-semibold ${isCritical
                ? 'text-destructive'
                : isLow
                  ? 'text-primary'
                  : textColor
              }`}
          >
            {isCritical ? 'Almost Gone!' : isLow ? 'Selling Fast!' : 'In Stock'}
          </span>
        </div>
        <span className={`text-sm ${mutedColor} font-medium`}>
          {remaining} left
        </span>
      </div>

      <div className={`h-3 ${barBg} rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out relative ${isCritical
              ? 'bg-destructive'
              : isLow
                ? 'bg-primary animate-pulse'
                : 'bg-primary/70'
            }`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-shimmer bg-[length:200%_100%] animate-shimmer opacity-50" />
        </div>
      </div>

      {isLow && (
        <p className={`text-xs ${mutedColor}`}>
          {isCritical
            ? 'Less than 15% remaining - grab yours now!'
            : "Limited stock - don't miss out!"}
        </p>
      )}
    </div>
  );
};

export default StockBar;
