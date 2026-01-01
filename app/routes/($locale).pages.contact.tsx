import { json, type MetaFunction } from '@shopify/remix-oxygen';
import { Heading, Section, Text } from '~/components/Text';
import { Button } from '~/components/ui/button';
import { Mail, MapPin, Phone } from 'lucide-react';

export const meta: MetaFunction = () => {
    return [{ title: 'Contact Us | DropMyDeal' }];
};

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24">
                {/* Contact Info */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <Heading as="h1" className="text-4xl md:text-5xl font-display font-bold">
                            Get in Touch
                        </Heading>
                        <Text className="text-lg text-muted-foreground">
                            Have a question or need help? We're here for you. Fill out the form or reach out to us directly.
                        </Text>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Email Us</h3>
                                <p className="text-muted-foreground">support@dropmydeal.com</p>
                                <p className="text-muted-foreground">partners@dropmydeal.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Phone className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Call Us</h3>
                                <p className="text-muted-foreground">+91 98765 43210</p>
                                <p className="text-xs text-muted-foreground">Mon-Fri, 9am - 6pm IST</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Visit Us</h3>
                                <p className="text-muted-foreground">
                                    123 Startup Hub, Tech Park,<br />
                                    Bangalore, Karnataka 560001
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Name</label>
                            <input
                                type="text"
                                id="name"
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Your name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium">Message</label>
                            <textarea
                                id="message"
                                rows={4}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                placeholder="How can we help?"
                            />
                        </div>

                        <Button type="submit" className="w-full font-bold">
                            Send Message
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
