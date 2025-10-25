import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const tiers = [
  {
    name: "Free Explorer",
    price: "¥0",
    period: "forever",
    features: [
      "Browse all triplists",
      "View venue details",
      "Access survival guides",
      "Join group-ups",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Premium Traveler",
    price: "¥99",
    period: "per month",
    features: [
      "Everything in Free",
      "Create unlimited group-ups",
      "Save favorite triplists",
      "Priority support",
      "Exclusive content",
      "Early access to new features",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Ultimate Explorer",
    price: "¥999",
    period: "per year",
    features: [
      "Everything in Premium",
      "Annual subscription savings",
      "Exclusive offline maps",
      "Personalized itineraries",
      "VIP community access",
      "Dedicated travel consultant",
    ],
    cta: "Get Ultimate",
    popular: false,
  },
];

const faqs = [
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes! You can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, Alipay, and WeChat Pay for your convenience.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 7-day money-back guarantee. If you're not satisfied with Premium, contact us within 7 days of your purchase for a full refund.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Absolutely! You can change your plan at any time. Upgrades take effect immediately, and downgrades will apply at the start of your next billing cycle.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! Premium Traveler includes a 14-day free trial. No credit card required to start.",
  },
];

export default function MembershipPage() {
  return (
    <div>
      <section className="bg-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="font-serif text-5xl font-semibold mb-6" data-testid="page-title">
            Choose Your Adventure
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock premium travel experiences and connect with a community of explorers
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`p-8 relative ${
                tier.popular ? "border-primary shadow-lg" : ""
              }`}
              data-testid={`card-tier-${tier.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2" data-testid={`text-tier-name-${tier.name.toLowerCase().replace(/\s+/g, "-")}`}>
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold" data-testid={`text-tier-price-${tier.name.toLowerCase().replace(/\s+/g, "-")}`}>
                    {tier.price}
                  </span>
                  <span className="text-muted-foreground">/{tier.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3" data-testid={`feature-${tier.name.toLowerCase().replace(/\s+/g, "-")}-${index}`}>
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={tier.popular ? "default" : "outline"}
                size="lg"
                data-testid={`button-cta-${tier.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {tier.cta}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/50 py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="section-title-faq">
            Frequently Asked Questions
          </h2>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger data-testid={`faq-question-${index}`}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent data-testid={`faq-answer-${index}`}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
