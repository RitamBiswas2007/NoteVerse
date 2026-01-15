import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackButton } from "@/components/ui/BackButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Users, 
  Shield, 
  Brain, 
  Globe,
  BookOpen,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const faqCategories = [
  {
    category: "Getting Started",
    icon: BookOpen,
    gradient: "from-primary to-blue-600",
    questions: [
      {
        question: "What is Mind-Mesh-Grow?",
        answer: "Mind-Mesh-Grow is a global student-powered educational platform where students share notes, discuss ideas, and build knowledge collaboratively. It includes NoteVerse for shared notes, StudyCircles for topic communities, ThinkEdu for academic ideas, and PeerNotes for community-driven study materials."
      },
      {
        question: "Who can use this platform?",
        answer: "Anyone interested in learning can use Mind-Mesh-Grow! It's designed primarily for students from high school through postgraduate levels, but educators, lifelong learners, and curious minds from all backgrounds are welcome to join and contribute."
      },
      {
        question: "Is Mind-Mesh-Grow free to use?",
        answer: "Yes! Mind-Mesh-Grow is free for all students. We believe education should be accessible to everyone. You can create an account, upload notes, join study circles, and participate in discussions at no cost."
      },
    ]
  },
  {
    category: "AI Features",
    icon: Brain,
    gradient: "from-info to-cyan-600",
    questions: [
      {
        question: "How does the AI help students?",
        answer: "Our AI assistant can help you understand complex topics, summarize notes, generate study questions, explain concepts in different styles (like Duolingo's friendly approach or Khan Academy's step-by-step method), and suggest related study materials based on your interests."
      },
      {
        question: "Can I customize how the AI responds?",
        answer: "Absolutely! In Settings, you can choose an 'AI Inspiration Mode' that adjusts the AI's tone and teaching style. Options include Notion (structured), Duolingo (gamified), Khan Academy (step-by-step), and Coursera (course-style)."
      },
    ]
  },
  {
    category: "Privacy & Security",
    icon: Shield,
    gradient: "from-success to-emerald-600",
    questions: [
      {
        question: "Is my data safe?",
        answer: "Your privacy is our priority. We use industry-standard encryption to protect your data, never sell your information to third parties, and comply with international data protection regulations. You control what information is visible on your profile."
      },
      {
        question: "Who can see my uploaded notes?",
        answer: "By default, published notes are visible to all users. However, you can keep notes private while working on them and only publish when ready. You maintain full control over your content's visibility."
      },
    ]
  },
  {
    category: "Collaboration",
    icon: Users,
    gradient: "from-accent to-orange-600",
    questions: [
      {
        question: "Can I collaborate with others?",
        answer: "Yes! Collaboration is at the heart of Mind-Mesh-Grow. You can join StudyCircles to discuss topics with peers, fork and improve others' notes (with credit), comment on content, and participate in group discussions."
      },
      {
        question: "How do StudyCircles work?",
        answer: "StudyCircles are topic-based communities where students gather to discuss subjects in depth. You can join circles that match your interests, post questions, share explanations, and help peers understand difficult concepts."
      },
      {
        question: "Can I create my own StudyCircle?",
        answer: "Once you've been an active member for a while, you can create your own StudyCircle around any academic topic. You'll be able to set guidelines, moderate discussions, and build a community around shared learning interests."
      },
    ]
  },
  {
    category: "Global Community",
    icon: Globe,
    gradient: "from-violet-500 to-purple-600",
    questions: [
      {
        question: "Is this platform available worldwide?",
        answer: "Yes! Mind-Mesh-Grow is used by students in over 120 countries. Our diverse global community brings together different perspectives and learning approaches, enriching the educational experience for everyone."
      },
      {
        question: "Are notes available in multiple languages?",
        answer: "Notes are shared in the language they're written in. We have a diverse community contributing in many languages. You can filter notes by country to find materials in your preferred language."
      },
    ]
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <BackButton className="mb-6" />

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </div>
            <h1 className="text-4xl font-display font-bold mb-4">
              How can we <span className="gradient-text">help you?</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about Mind-Mesh-Grow. Can't find what you're looking for? Contact our support team.
            </p>
          </div>

          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <section 
                  key={category.category}
                  className="rounded-2xl border border-border bg-card overflow-hidden"
                  style={{ animationDelay: `${categoryIndex * 100}ms` }}
                >
                  <div className="flex items-center gap-4 p-6 border-b border-border bg-muted/30">
                    <div className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                      category.gradient
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-display font-bold">{category.category}</h2>
                  </div>
                  
                  <Accordion type="single" collapsible className="px-6">
                    {category.questions.map((item, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`${category.category}-${index}`}
                        className="border-border"
                      >
                        <AccordionTrigger className="text-left font-medium hover:text-primary transition-colors py-5">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              );
            })}
          </div>

          {/* Still have questions CTA */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-hero text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 pattern-grid opacity-10" />
            <div className="relative">
              <Sparkles className="w-8 h-8 mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-display font-bold mb-3">Still have questions?</h3>
              <p className="text-white/80 mb-6 max-w-md mx-auto">
                Our support team is here to help. Reach out and we'll get back to you as soon as possible.
              </p>
              <a 
                href="/support" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors font-medium backdrop-blur-sm"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
