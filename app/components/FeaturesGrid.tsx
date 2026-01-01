export function FeaturesGrid() {
  const features = [
    {
      title: 'Daily Curated Deals',
      description:
        'Our team manually vets every single software deal. No fluff, just high-value tools.',
      icon: '💎',
    },
    {
      title: 'Unbeatable Prices',
      description:
        "We negotiate exclusive lifetime deals you won't find anywhere else on the web.",
      icon: '🔥',
    },
    {
      title: 'Community Verified',
      description:
        'Join 35,000+ founders who vote on the apps they want. Power to the people.',
      icon: '👥',
    },
  ];

  return (
    <section className="py-24 bg-background relative z-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-medium text-primary mb-4">
            Why DropMyDeal?
          </h2>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            We're not just another marketplace. We're a secret club for smart
            founders.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-surface p-8 rounded-2xl border border-white/5 hover:border-accent/30 transition-colors group"
            >
              <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-display font-medium text-primary mb-3">
                {feature.title}
              </h3>
              <p className="text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
