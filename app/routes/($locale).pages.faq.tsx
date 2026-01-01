import { json, type MetaFunction } from '@shopify/remix-oxygen';
import { Heading, Section, Text } from '~/components/Text';

export const meta: MetaFunction = () => {
    return [{ title: 'FAQ | DropMyDeal' }];
};

export default function FaqPage() {
    return (
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <Heading as="h1" className="text-4xl md:text-5xl font-display font-bold">
                        Frequently Asked Questions
                    </Heading>
                    <Text className="text-lg text-muted-foreground">
                        Everything you need to know about DropMyDeal, shipping, and returns.
                    </Text>
                </div>

                <div className="space-y-8">
                    <Section heading="Ordering & Payment" padding="y">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">What payment methods do you accept?</h3>
                                <Text>
                                    We accept all major credit cards (Visa, Mastercard, Amex), UPI, Net Banking, and Wallet payments. All transactions are secured by industry-leading encryption.
                                </Text>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">Can I cancel my order?</h3>
                                <Text>
                                    Yes, you can cancel your order within 1 hour of placing it. After that, we process orders quickly to ensure fast delivery. Please contact support immediately if you need to make changes.
                                </Text>
                            </div>
                        </div>
                    </Section>

                    <Section heading="Shipping & Delivery" padding="y">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">How long does shipping take?</h3>
                                <Text>
                                    Most orders are processed within 24 hours. Standard shipping takes 3-5 business days depending on your location. We also offer expedited shipping options at checkout.
                                </Text>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">Do you ship internationally?</h3>
                                <Text>
                                    Currently, we only ship within India. We are working on expanding our reach to international markets soon.
                                </Text>
                            </div>
                        </div>
                    </Section>

                    <Section heading="Returns & Refunds" padding="y">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">What is your return policy?</h3>
                                <Text>
                                    We offer a 7-day return policy for all unused items in their original packaging. If you are not satisfied with your purchase, you can initiate a return from your account dashboard.
                                </Text>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">When will I get my refund?</h3>
                                <Text>
                                    Once we receive your return, we will inspect the item and process your refund within 5-7 business days. The amount will be credited back to your original payment method.
                                </Text>
                            </div>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
}
