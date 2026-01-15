import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackButton } from "@/components/ui/BackButton";
import { Shield, Heart, BookOpen, Lock, AlertTriangle, Users } from "lucide-react";

const sections = [
  {
    icon: BookOpen,
    title: "Educational Content Only",
    items: [
      "All content must be educational and related to learning",
      "Share notes, study materials, and academic discussions",
      "No promotional, commercial, or off-topic content",
      "Content should help fellow students learn and grow",
    ],
  },
  {
    icon: AlertTriangle,
    title: "No Plagiarism",
    items: [
      "Only upload notes you created or have permission to share",
      "Always credit original sources and authors",
      "Do not copy content from textbooks or paid resources",
      "Respect intellectual property and copyright laws",
    ],
  },
  {
    icon: Heart,
    title: "Respectful Behavior",
    items: [
      "Treat all community members with kindness and respect",
      "No harassment, bullying, or discriminatory behavior",
      "Provide constructive feedback and helpful comments",
      "Report any inappropriate content or behavior",
    ],
  },
  {
    icon: Users,
    title: "Community Guidelines",
    items: [
      "Help fellow students by answering questions",
      "Keep discussions focused and on-topic",
      "Use appropriate language in all communications",
      "Collaborate and support each other's learning journey",
    ],
  },
  {
    icon: Lock,
    title: "Data Privacy & Security",
    items: [
      "We protect your personal information with industry-standard security",
      "Your data is never sold to third parties",
      "You control what information is visible on your profile",
      "We comply with international data protection regulations",
    ],
  },
  {
    icon: Shield,
    title: "Account Responsibility",
    items: [
      "Keep your login credentials secure and private",
      "You are responsible for all activity on your account",
      "Report any unauthorized access immediately",
      "Accounts may be suspended for violating these terms",
    ],
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <BackButton className="mb-6" />

          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold mb-4">
              Terms & <span className="gradient-text">Conditions</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, student-friendly guidelines to keep our community safe and helpful for everyone.
            </p>
          </div>

          <div className="space-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.title}
                  className="p-6 rounded-2xl border border-border bg-card hover:border-primary/20 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-display font-bold mb-4">
                        {section.title}
                      </h2>
                      <ul className="space-y-3">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-muted/50 border border-border text-center">
            <p className="text-muted-foreground">
              By using NoteVerse, you agree to these terms. Questions? Contact us at{" "}
              <a href="mailto:support@noteverse.edu" className="text-primary hover:underline">
                support@noteverse.edu
              </a>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: December 2024
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
