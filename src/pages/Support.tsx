import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Bug, 
  Lightbulb, 
  MessageCircle,
  CheckCircle2,
  Mail,
  User,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
});

type QuickAction = "bug" | "feature" | "general";

interface QuickActionButtonProps {
  icon: React.ElementType;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  gradient: string;
}

function QuickActionButton({ icon: Icon, label, description, isSelected, onClick, gradient }: QuickActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left",
        "hover:scale-[1.02] active:scale-[0.98]",
        isSelected 
          ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
          : "border-border bg-card hover:border-primary/30"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
        gradient
      )}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <p className={cn("font-medium", isSelected && "text-primary")}>{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

export default function Support() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedAction, setSelectedAction] = useState<QuickAction>("general");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const quickActions: { value: QuickAction; icon: React.ElementType; label: string; description: string; gradient: string }[] = [
    { value: "bug", icon: Bug, label: "Report a Bug", description: "Something isn't working correctly", gradient: "from-destructive to-red-600" },
    { value: "feature", icon: Lightbulb, label: "Request a Feature", description: "Suggest a new improvement", gradient: "from-accent to-orange-600" },
    { value: "general", icon: MessageCircle, label: "General Inquiry", description: "Ask a question or get help", gradient: "from-primary to-blue-600" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: "Message sent successfully!",
      description: "We'll get back to you as soon as possible.",
    });
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({ name: "", email: "", message: "" });
    setSelectedAction("general");
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-4">
              Thank you!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your message has been sent successfully. Our support team will review it and get back to you within 24-48 hours.
            </p>
            <Button onClick={resetForm} variant="outline" className="mr-3">
              Send Another Message
            </Button>
            <Button onClick={() => window.location.href = "/"}>
              Back to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <BackButton className="mb-6" />

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <MessageCircle className="w-4 h-4" />
              Support Center
            </div>
            <h1 className="text-4xl font-display font-bold mb-4">
              How can we <span className="gradient-text">help you?</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a question, found a bug, or want to suggest a feature? We're here to help!
            </p>
          </div>

          {/* Quick Actions */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-4">What do you need help with?</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {quickActions.map((action) => (
                <QuickActionButton
                  key={action.value}
                  icon={action.icon}
                  label={action.label}
                  description={action.description}
                  isSelected={selectedAction === action.value}
                  onClick={() => setSelectedAction(action.value)}
                  gradient={action.gradient}
                />
              ))}
            </div>
          </section>

          {/* Contact Form */}
          <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-xl font-display font-bold mb-6">Send us a message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={cn(errors.name && "border-destructive")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@university.edu"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={cn(errors.email && "border-destructive")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Your Message
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formData.message.length}/2000
                  </span>
                </Label>
                <Textarea
                  id="message"
                  placeholder={
                    selectedAction === "bug" 
                      ? "Please describe the bug in detail. What did you expect to happen? What actually happened?"
                      : selectedAction === "feature"
                      ? "Please describe the feature you'd like to see. How would it help your learning?"
                      : "How can we help you today?"
                  }
                  rows={6}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className={cn("resize-none", errors.message && "border-destructive")}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-primary hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </section>

          {/* Additional Info */}
          <div className="mt-8 p-6 rounded-2xl bg-muted/50 border border-border">
            <p className="text-center text-muted-foreground">
              You can also reach us directly at{" "}
              <a href="mailto:support@mindmeshgrow.edu" className="text-primary hover:underline font-medium">
                support@mindmeshgrow.edu
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
