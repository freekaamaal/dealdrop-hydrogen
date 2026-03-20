import { Link } from '@remix-run/react';
import { Clock, TrendingDown } from 'lucide-react';

import { Badge } from '~/components/ui/badge';

interface DealCardProps {
  id: string;
  image: string;
  title: string;
  description: string;
  mrp: number;
  dealPrice: number;
  status: 'expired' | 'sold-out' | 'live' | 'upcoming';
  endsAt?: Date;
  handle?: string;
  vendor?: string;
}

const DealCard = ({
  id,
  image,
  title,
  description,
  mrp,
  dealPrice,
  status,
  endsAt,
  handle,
  vendor,
}: DealCardProps) => {
  const discount = mrp > 0 ? Math.round(((mrp - dealPrice) / mrp) * 100) : 0;
  const savings = mrp - dealPrice;

  const getStatusBadge = () => {
    switch (status) {
      case 'live':
        return (
          <Badge className="bg-green-500 text-white border-0 shadow-md shadow-green-500/30 text-[10px] md:text-xs px-2 py-0.5">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" />
            LIVE
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge className="bg-black/80 text-white border-0 backdrop-blur-md text-[10px] md:text-xs px-2 py-0.5">
            <Clock className="w-3 h-3 mr-1" />
            Soon
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] md:text-xs">
            Expired
          </Badge>
        );
      case 'sold-out':
        return <Badge variant="destructive" className="text-[10px] md:text-xs">Sold Out</Badge>;
    }
  };

  return (
    <Link to={handle ? `/products/${handle}` : `/deal/${id}`}>
      <div
        className={`
        group relative bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100
        hover:shadow-xl hover:scale-[1.02] smooth-transition
        ${status === 'expired' || status === 'sold-out' ? 'opacity-60 grayscale-[30%]' : ''}
      `}
      >
        {/* Image */}
        <div className="aspect-square overflow-hidden bg-gray-50 relative">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 smooth-transition"
          />

          {/* Status Badge */}
          <div className="absolute top-2 right-2 md:top-3 md:right-3">{getStatusBadge()}</div>

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3">
              <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-0.5 shadow-md shadow-red-500/30">
                <TrendingDown className="w-3 h-3" />
                {discount}%
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5 md:p-4 space-y-1.5">
          {/* Brand name */}
          {vendor && (
            <p className="text-[10px] md:text-xs text-primary font-semibold uppercase tracking-wider">
              {vendor}
            </p>
          )}

          <h3 className="font-semibold text-xs md:text-sm line-clamp-2 text-gray-900 group-hover:text-primary smooth-transition leading-snug">
            {title}
          </h3>

          {/* Price row */}
          <div className="flex items-baseline gap-2 pt-1">
            {mrp > dealPrice && (
              <span className="text-[10px] md:text-xs text-gray-400 line-through">
                ₹{mrp.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-base md:text-lg font-display font-bold text-gray-900">
              ₹{dealPrice.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Savings chip */}
          {savings > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="bg-green-50 text-green-700 text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-md">
                Save ₹{savings.toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default DealCard;
