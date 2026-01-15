import { useEffect, useRef, useState } from "react";
import { Globe, FileText, Users, Lightbulb, Search, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: Globe,
    title: "Global Student Community",
    description: "Connect with students from 120+ countries worldwide",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: FileText,
    title: "Peer Notes Sharing",
    description: "Upload, discover, and improve notes collaboratively",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Users,
    title: "Study Circles",
    description: "Join topic-based communities for deep discussions",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Lightbulb,
    title: "ThinkEdu Ideas",
    description: "Share academic thoughts and get peer feedback",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find notes, topics, and circles instantly",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: GraduationCap,
    title: "Education-First Design",
    description: "Distraction-free learning experience",
    gradient: "from-indigo-500 to-blue-500",
  },
];

interface FeatureCardProps {
  icon: typeof Globe;
  title: string;
  description: string;
  gradient: string;
  index: number;
  isVisible: boolean;
}

function FeatureHighlightCard({ icon: Icon, title, description, gradient, index, isVisible }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group p-6 rounded-2xl bg-card border border-border transition-all duration-500 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
          gradient
        )}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function FeatureHighlights() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Why Students Love{" "}
            <span className="gradient-text">NoteVerse</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built by students, for students. Every feature designed to enhance your learning journey.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((highlight, index) => (
            <FeatureHighlightCard
              key={highlight.title}
              {...highlight}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
