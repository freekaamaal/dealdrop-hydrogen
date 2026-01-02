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
}: DealCardProps) => {
  const discount = Math.round(((mrp - dealPrice) / mrp) * 100);

  const getStatusBadge = () => {
    switch (status) {
      case 'live':
        return (
          <Badge className="bg-primary text-primary-foreground animate-pulse-soft">
            <span className="w-2 h-2 bg-primary-foreground rounded-full mr-2 animate-pulse" />
            LIVE
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge variant="outline" className="bg-black/80 text-white border-0 backdrop-blur-md font-semibold">
            <Clock className="w-3 h-3 mr-1" />
            Upcoming
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            Expired
          </Badge>
        );
      case 'sold-out':
        return <Badge variant="destructive">Sold Out</Badge>;
    }
  };

  return (
    <Link to={handle ? `/products/${handle}` : `/deal/${id}`}>
      <div
        className={`
        group relative card-premium rounded-3xl overflow-hidden
        hover:scale-[1.02] smooth-transition
        ${status === 'expired' || status === 'sold-out' ? 'opacity-70' : ''}
      `}
      >
        {/* Image Container */}
        <div className="aspect-square overflow-hidden bg-secondary relative">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 smooth-transition"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />

          {/* Status Badge */}
          <div className="absolute top-2 right-2 md:top-4 md:right-4">{getStatusBadge()}</div>

          {/* Discount Badge */}
          <div className="absolute top-2 left-2 md:top-4 md:left-4">
            <div className="gradient-urgency text-primary-foreground px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-bold flex items-center gap-1">
              <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
              {discount}%
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 md:p-5 space-y-2 md:space-y-3">
          <h3 className="font-display font-bold text-sm md:text-lg line-clamp-2 group-hover:text-primary smooth-transition leading-tight">
            {title}
          </h3>

          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 hidden md:block">
            {description}
          </p>

          <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3 pt-1 md:pt-2">
            <span className="text-sm text-muted-foreground line-through">
              ₹{mrp.toLocaleString('en-IN')}
            </span>
            <span className="text-2xl font-display font-bold text-foreground">
              ₹{dealPrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DealCard;
