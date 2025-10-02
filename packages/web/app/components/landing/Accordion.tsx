import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

/**
 * AccordionItem component
 * Single accordion item with expand/collapse functionality
 */
function AccordionItem({ question, answer, isOpen, onClick }: AccordionItemProps) {
  return (
    <div className="border-none bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={onClick}
        className={`w-full px-6 py-4 text-left font-semibold flex items-center justify-between transition-colors ${
          isOpen ? 'bg-primary-500 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'
        }`}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <ChevronDown
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 pt-2 text-gray-600 animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  );
}

interface AccordionProps {
  items: Array<{
    question: string;
    answer: string;
  }>;
  defaultOpenIndex?: number;
}

/**
 * Accordion component
 * Container for accordion items with single-item-open behavior
 */
export function Accordion({ items, defaultOpenIndex = 0 }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number>(defaultOpenIndex);

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
        />
      ))}
    </div>
  );
}
