export function Newsletter() {
  return (
    <section className="py-24 bg-background border-t border-white/5 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[300px] h-[300px] bg-accent/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-display font-medium mb-6 text-primary">
          Never Miss a Drop
        </h2>
        <p className="text-lg text-secondary mb-10 font-sans leading-relaxed">
          Join 35,000+ members getting early access to daily tech and software
          deals. No spam, ever.
        </p>

        <form className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Enter your email address..."
            className="flex-1 px-6 py-4 rounded-xl bg-surface border border-white/10 text-primary placeholder-secondary/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent transition-all"
            required
          />
          <button
            type="submit"
            className="px-8 py-4 bg-primary text-background font-bold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
          >
            Subscribe
          </button>
        </form>

        <p className="mt-6 text-xs text-secondary/60">
          Unsubscribe anytime. We respect your inbox and your privacy.
        </p>
      </div>
    </section>
  );
}
