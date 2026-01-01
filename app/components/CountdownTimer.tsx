import {useState, useEffect} from 'react';
import {Clock, Flame} from 'lucide-react';

interface CountdownTimerProps {
  targetDate: Date;
  variant?: 'default' | 'compact';
}

const CountdownTimer = ({
  targetDate,
  variant = 'default',
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [prevSeconds, setPrevSeconds] = useState(0);

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
      const newTime = calculateTimeLeft();
      setPrevSeconds(timeLeft.seconds);
      setTimeLeft(newTime);
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate, timeLeft.seconds]);

  const TimeBlock = ({value, label}: {value: number; label: string}) => (
    <div className="flex flex-col items-center">
      <div
        className={`
          relative overflow-hidden
          ${variant === 'compact' ? 'w-14 h-14' : 'w-20 h-20 md:w-24 md:h-24'}
          glass-card rounded-2xl
          flex items-center justify-center
          animate-glow-pulse
        `}
      >
        <span
          className={`
            font-display font-bold tabular-nums text-foreground
            ${variant === 'compact' ? 'text-2xl' : 'text-3xl md:text-4xl'}
          `}
        >
          {value.toString().padStart(2, '0')}
        </span>
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-shimmer bg-[length:200%_100%] animate-shimmer opacity-30" />
      </div>
      <span
        className={`text-muted-foreground mt-2 font-medium uppercase tracking-wider ${
          variant === 'compact' ? 'text-[10px]' : 'text-xs'
        }`}
      >
        {label}
      </span>
    </div>
  );

  const Separator = () => (
    <div
      className={`flex items-center ${variant === 'compact' ? 'pb-6' : 'pb-8'}`}
    >
      <span
        className={`font-display font-bold text-primary ${
          variant === 'compact' ? 'text-xl' : 'text-3xl'
        }`}
      >
        :
      </span>
    </div>
  );

  return (
    <div
      className={`
      flex flex-col items-center gap-4
      glass-card rounded-3xl
      ${variant === 'compact' ? 'p-4' : 'p-6 md:p-8'}
    `}
    >
      <div className="flex items-center gap-2 text-primary">
        <Flame
          className={`${
            variant === 'compact' ? 'h-4 w-4' : 'h-5 w-5'
          } animate-pulse-soft`}
        />
        <span
          className={`font-semibold uppercase tracking-wide ${
            variant === 'compact' ? 'text-xs' : 'text-sm'
          }`}
        >
          Deal Ends In
        </span>
        <Flame
          className={`${
            variant === 'compact' ? 'h-4 w-4' : 'h-5 w-5'
          } animate-pulse-soft`}
        />
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
