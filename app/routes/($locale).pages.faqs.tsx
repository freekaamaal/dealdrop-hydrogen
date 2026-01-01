import { json, type MetaFunction } from '@shopify/remix-oxygen';
import { Heading, Section, Text } from '~/components/Text';
import { Disclosure } from '@headlessui/react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const meta: MetaFunction = () => {
    return [{ title: 'FAQs | DropMyDeal' }];
};

const faqs = [
    {
        category: "Shopping Information",
        items: [
            {
                q: "How do I place an order?",
                a: "To place an order, simply browse our online store and add the desired items to your shopping cart. Proceed to the checkout page, where you'll enter your shipping and payment details. Once confirmed, your order will be processed, and you'll receive a confirmation email."
            },
            {
                q: "Do you offer international shipping?",
                a: "Yes, we do offer international shipping to many countries. During the checkout process, you can select your country to check for shipping availability and associated costs."
            },
            {
                q: "How long does shipping take?",
                a: "Shipping times depend on your location and the shipping method chosen. Generally, we strive to process orders within 1-3 business days, but actual delivery times may vary. During checkout, you'll be provided with an estimated delivery date."
            }
        ]
    },
    {
        category: "Payment Information",
        items: [
            {
                q: "What payment methods do you accept?",
                a: "We accept various payment methods, including credit cards, debit cards, PayPal, and other secure online payment gateways. Some regions may have additional local payment options available."
            },
            {
                q: "Is my payment information secure?",
                a: "Yes, we take the security of your payment information seriously. Our website uses encrypted connections (SSL) to protect your personal and payment details, ensuring a safe and secure transaction."
            },
            {
                q: "Can I pay in my local currency?",
                a: "Our website may support payment in multiple currencies, depending on your location and the available payment methods. During checkout, you can select your preferred currency if applicable."
            }
        ]
    },
    {
        category: "Order & Returns",
        items: [
            {
                q: "How long does order processing take?",
                a: "Order processing times may vary depending on the product and its availability. In general, we strive to process orders within 1-3 business days. However, during peak seasons or special promotions, processing times may be slightly longer."
            },
            {
                q: "What is your return policy?",
                a: "Our return policy allows you to return eligible items within a specified period from the date of delivery. To be eligible for a return, the item must be in its original condition, unused, and in the original packaging. Certain items, such as personalized or intimate goods, may not be eligible for return due to hygiene reasons."
            },
            {
                q: "Do you offer exchanges?",
                a: "Yes, we offer exchanges for eligible items. If you wish to exchange an item for a different size, color, or variant, please contact our customer support team for assistance."
            }
        ]
    }
];

export default function FaqPage() {
    return (
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
            <div className="text-center space-y-4 mb-16">
                <Heading as="h1" className="text-4xl md:text-5xl font-display font-bold">
                    Frequently Asked Questions
                </Heading>
                <Text className="text-lg text-muted-foreground">
                    Everything you need to know about DropMyDeal
                </Text>
            </div>

            <div className="space-y-12">
                {faqs.map((section, idx) => (
                    <div key={idx} className="space-y-6">
                        <Heading as="h2" size="copy" className="text-2xl font-bold border-b pb-4">
                            {section.category}
                        </Heading>
                        <div className="grid gap-4">
                            {section.items.map((item, idy) => (
                                <Disclosure key={idy} as="div" className="border border-border rounded-xl bg-card overflow-hidden">
                                    {({ open }) => (
                                        <>
                                            <Disclosure.Button className="flex w-full justify-between items-center px-6 py-4 text-left font-medium hover:bg-muted/50 transition-colors">
                                                <span className="text-lg">{item.q}</span>
                                                {open ? (
                                                    <ChevronUp className="h-5 w-5 text-primary" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </Disclosure.Button>
                                            <Disclosure.Panel className="px-6 pb-6 pt-2 text-muted-foreground leading-relaxed">
                                                {item.a}
                                            </Disclosure.Panel>
                                        </>
                                    )}
                                </Disclosure>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
