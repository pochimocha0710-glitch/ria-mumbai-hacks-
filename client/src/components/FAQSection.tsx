import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GridPattern } from "@/components/ui/GridPattern";

const faqs = [
  {
    question: "What is Ria?",
    answer:
      "Ria is an agentic AI companion that helps people quit harmful habits such as nicotine, alcohol, drugs, and phone addiction. It keeps watch over your mood, calendar, and sensor signals, then adapts recovery plans on your behalf.",
  },
  {
    question: "How does Ria stay proactive?",
    answer:
      "Ria runs predictive models on activity logs, wearable data, and check-in sentiment to forecast cravings. When risk rises, it modifies tasks, nudges accountability partners, and can trigger SOS resources automatically.",
  },
  {
    question: "Can I customize the recovery plan?",
    answer:
      "Yes. You can pin your non-negotiable rituals, swap habit replacements, and set escalation rules. Ria learns from every adjustment and keeps the plan aligned with your capacity.",
  },
  {
    question: "What platforms do you support?",
    answer:
      "The current demo runs on the web (React + Vite) with mobile-responsive layouts. Native wrappers are on the roadmap once the hackathon pilot concludes.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Event streams are encrypted at rest and in transit. We maintain audit trails, redact personal identifiers in training data, and support clinician/admin review with consent.",
  },
];

export default function FAQSection() {
  return (
    <section className="relative py-16 md:py-24 bg-zinc-950">
      <GridPattern />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
          FAQ
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-zinc-800">
              <AccordionTrigger
                className="text-left text-lg md:text-xl font-semibold text-white py-6 hover:no-underline hover:text-orange-500 transition-colors"
                data-testid={`faq-question-${index}`}
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base md:text-lg text-zinc-400 pb-6 whitespace-pre-line">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
