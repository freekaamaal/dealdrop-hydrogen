import { useState } from 'react';
import { Button } from '~/components/ui/button';

import { ArrowRight, Check } from 'lucide-react';

export function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        // TODO: Integrate with Shopify Customer API or Klaviyo
        console.log('Newsletter subscription:', email);

        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setEmail('');
        }, 1000);
    };

    if (status === 'success') {
        return (
            <div className="bg-primary/10 border border-primary/20 text-primary px-6 py-4 rounded-2xl flex items-center gap-3 animate-fade-in">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Check className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-bold">Welcome directly to the inner circle!</p>
                    <p className="text-sm">You've successfully joined the Drop Club.</p>
                </div>
                <button
                    onClick={() => setStatus('idle')}
                    className="ml-auto text-xs underline hover:no-underline"
                >
                    Reset
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto relative z-10">
            <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-14 rounded-2xl bg-background border border-border focus:border-primary/50 text-base px-6 shadow-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
                disabled={status === 'submitting'}
            />
            <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto sm:absolute sm:right-1.5 sm:top-1.5 sm:bottom-1.5 gradient-urgency text-primary-foreground font-bold px-6 rounded-xl hover:scale-105 active:scale-95 smooth-transition shadow-lg"
                disabled={status === 'submitting'}
            >
                {status === 'submitting' ? 'Joining...' : 'Join Drop Club'}
                {!status && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
        </form>
    );
}
