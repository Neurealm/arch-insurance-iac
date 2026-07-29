import type { FaqGuide } from "./types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GuidePending } from "./CommercialGuideSection";

export function CommercialGuideFaq({ faqs }: { faqs: FaqGuide[] }) {
  if (faqs.length === 0) return <GuidePending label="FAQs pending validation" />;
  return (
    <Accordion type="multiple" className="w-full">
      {faqs.map((f) => (
        <AccordionItem key={f.id} value={f.id}>
          <AccordionTrigger className="text-left text-sm">{f.question}</AccordionTrigger>
          <AccordionContent className="text-xs text-muted-foreground">{f.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
