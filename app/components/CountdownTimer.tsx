import {useState, useEffect} from 'react';
import {Flame} from 'lucide-react';

interface CountdownTimerProps {
  targetDate: Date;
  variant?: 'default' | 'compact';
  dark?: boolean;
}

const CountdownTimer = ({
  targetDate,
  variant = 'default',
  dark = false,
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return {hours: 0, minutes: 0, seconds: 0};
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate]);

  const blockSize = variant === 'compact' ? 'w-14 h-14' : 'w-20 h-20 md:w-24 md:h-24';
  const textSize = variant === 'compact' ? 'text-2xl' : 'text-3xl md:text-4xl';
  const labelSize = variant === 'compact' ? 'text-[10px]' : 'text-xs';
  const sepSize = variant === 'compact' ? 'text-xl' : 'text-3xl';
  const padBot = variant === 'compact' ? 'pb-6' : 'pb-8';

  const blockBg = dark
    ? 'bg-white/10 border border-white/10 rounded-2xl'
    : 'glass-card';
  const numColor = dark ? 'text-white' : 'text-foreground';
  const labelColor = dark ? 'text-gray-400' : 'text-muted-foreground';
  const sepColor = dark ? 'text-orange-400' : 'text-primary';
  const wrapperBg = dark
    ? 'bg-white/5 border border-white/10'
    : 'glass-card';
  const flameColor = dark ? 'text-orange-400' : 'text-primary';
  const titleColor = dark ? 'text-orange-400' : 'text-primary';

  const TimeBlock = ({value, label}: {value: number; label: string}) => (
    <div className="flex flex-col items-center">
      <div className={`relative overflow-hidden ${blockSize} ${blockBg} flex items-center justify-center ${dark ? '' : 'rounded-2xl'}`}>
        <span className={`font-display font-bold tabular-nums ${numColor} ${textSize}`}>
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className={`${labelColor} mt-2 font-medium uppercase tracking-wider ${labelSize}`}>
        {label}
      </span>
    </div>
  );

  const Separator = () => (
    <div className={`flex items-center ${padBot}`}>
      <span className={`font-display font-bold ${sepColor} ${sepSize}`}>:</span>
    </div>
  );

  return (
    <div className={`flex flex-col items-center gap-4 rounded-3xl ${variant === 'compact' ? 'p-4' : 'p-6 md:p-8'} ${dark ? 'bg-white/5 border border-white/10' : 'glass-card'}`}>
      <div className={`flex items-center gap-2 ${titleColor}`}>
        <Flame className={`${variant === 'compact' ? 'h-4 w-4' : 'h-5 w-5'} animate-pulse`} />
        <span className={`font-semibold uppercase tracking-wide ${variant === 'compact' ? 'text-xs' : 'text-sm'}`}>
          Deal Ends In
        </span>
        <Flame className={`${variant === 'compact' ? 'h-4 w-4' : 'h-5 w-5'} animate-pulse`} />
      </div>

      <div className="flex items-start gap-2 md:gap-4">
        <TimeBlock value={timeLeft.hours} label="Hours" />
        <Separator />
        <TimeBlock value={timeLeft.minutes} label="Minutes" />
        <Separator />
        <TimeBlock value={timeLeft.seconds} label="Seconds" />
      </div>
    </div>
  );
};

export default CountdownTimer;
