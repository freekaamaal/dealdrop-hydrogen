import {Package, AlertTriangle} from 'lucide-react';

interface StockBarProps {
  remaining: number;
  total: number;
}

const StockBar = ({remaining, total}: StockBarProps) => {
  const percentage = (remaining / total) * 100;
  const isLow = percentage < 30;
  const isCritical = percentage < 15;

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertTriangle className="h-5 w-5 text-destructive animate-pulse-soft" />
          ) : (
            <Package
              className={`h-5 w-5 ${
                isLow ? 'text-primary' : 'text-muted-foreground'
              }`}
            />
          )}
          <span
            className={`font-semibold ${
              isCritical
                ? 'text-destructive'
                : isLow
                ? 'text-primary'
                : 'text-foreground'
            }`}
          >
            {isCritical ? 'Almost Gone!' : isLow ? 'Selling Fast!' : 'In Stock'}
          </span>
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {remaining} left
        </span>
      </div>

      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out relative ${
            isCritical
              ? 'bg-destructive'
              : isLow
              ? 'bg-primary animate-pulse-soft'
              : 'bg-primary/70'
          }`}
          style={{width: `${percentage}%`}}
        >
          {/* Animated shimmer on the progress bar */}
          <div className="absolute inset-0 bg-shimmer bg-[length:200%_100%] animate-shimmer opacity-50" />
        </div>
      </div>

      {isLow && (
        <p className="text-xs text-muted-foreground">
          {isCritical
            ? '🔥 Less than 15% remaining - grab yours now!'
            : "⚡ Limited stock - don't miss out!"}
        </p>
      )}
    </div>
  );
};

export default StockBar;
