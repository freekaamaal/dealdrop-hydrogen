export function StatsBar() {
  const stats = [
    {label: '1 Year Warranty', icon: '🛡️'},
    {label: 'Free Shipping', icon: '🚚'},
    {label: '7-Day Returns', icon: '↩️'},
    {label: 'Verified Seller', icon: '✅'},
  ];

  return (
    <section className="bg-surface border-y border-white/5 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between md:justify-center gap-y-4 md:gap-x-12 lg:gap-x-24">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-3 w-[45%] md:w-auto"
            >
              <span className="text-xl filter grayscale opacity-80">
                {stat.icon}
              </span>
              <span className="text-sm font-medium text-primary/80 font-sans tracking-wide">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
