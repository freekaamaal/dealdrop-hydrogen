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
          <Badge variant="outline" className="border-primary text-primary">
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
          <div className="absolute top-4 right-4">{getStatusBadge()}</div>

          {/* Discount Badge */}
          <div className="absolute top-4 left-4">
            <div className="gradient-rose text-primary-foreground px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
              <TrendingDown className="w-4 h-4" />
              {discount}%
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <h3 className="font-display font-bold text-lg line-clamp-2 group-hover:text-primary smooth-transition">
            {title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>

          <div className="flex items-baseline gap-3 pt-2">
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
