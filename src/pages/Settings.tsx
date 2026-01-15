import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackButton } from "@/components/ui/BackButton";
import {
  useSettings,
  Theme,
  FontSize,
  AnimationPreference,
  AIInspiration
} from "@/hooks/useSettings";
import {
  Sun,
  Moon,
  Monitor,
  Type,
  Sparkles,
  Brain,
  BookOpen,
  Gamepad2,
  GraduationCap,
  Layers,
  Bell,
  Users,
  Target,
  MessageSquare,
  Megaphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface OptionCardProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
  gradient?: string;
}

function OptionCard({ icon: Icon, label, description, isSelected, onClick, gradient }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
        "hover:scale-[1.02] active:scale-[0.98]",
        isSelected
          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
          : "border-border bg-card hover:border-primary/30"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
        gradient ? `bg-gradient-to-br ${gradient}` : "bg-muted"
      )}>
        <Icon className={cn("w-6 h-6", gradient ? "text-white" : "text-foreground")} />
      </div>
      <div className="text-left flex-1">
        <p className={cn("font-medium", isSelected && "text-primary")}>{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className={cn(
        "w-5 h-5 rounded-full border-2 transition-all",
        isSelected
          ? "border-primary bg-primary"
          : "border-muted-foreground/30"
      )}>
        {isSelected && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
          </div>
        )}
      </div>
    </button>
  );
}

export default function Settings() {
  const {
    theme, setTheme,
    fontSize, setFontSize,
    animationPreference, setAnimationPreference,
    aiInspiration, setAIInspiration,
    notifications, setNotifications
  } = useSettings();

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    });
  };

  const themeOptions: { value: Theme; icon: React.ElementType; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "auto", icon: Monitor, label: "System" },
  ];

  const fontOptions: { value: FontSize; label: string; description: string }[] = [
    { value: "small", label: "Small", description: "Compact text" },
    { value: "medium", label: "Medium", description: "Default size" },
    { value: "large", label: "Large", description: "Easier to read" },
  ];

  const animationOptions: { value: AnimationPreference; label: string; description: string }[] = [
    { value: "on", label: "Full Animations", description: "All effects enabled" },
    { value: "reduced", label: "Reduced Motion", description: "Subtle animations" },
    { value: "off", label: "No Animations", description: "Static interface" },
  ];

  const aiOptions: { value: AIInspiration; icon: React.ElementType; label: string; description: string; gradient: string }[] = [
    {
      value: "notion",
      icon: BookOpen,
      label: "Notion Style",
      description: "Structured, clean notes with organized sections",
      gradient: "from-slate-600 to-slate-800"
    },
    {
      value: "duolingo",
      icon: Gamepad2,
      label: "Duolingo Style",
      description: "Gamified, friendly tone with encouragement",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      value: "khan",
      icon: GraduationCap,
      label: "Khan Academy Style",
      description: "Step-by-step explanations with examples",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      value: "coursera",
      icon: Layers,
      label: "Coursera Style",
      description: "Course-style learning with modules",
      gradient: "from-primary to-blue-600"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <BackButton className="mb-6" />

          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold mb-4">
              <span className="gradient-text">Settings</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Customize your NoteVerse experience
            </p>
          </div>

          <div className="space-y-10">
            {/* Theme Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Sun className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">Theme</h2>
                  <p className="text-sm text-muted-foreground">Choose your preferred appearance</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      theme === option.value
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <option.icon className={cn(
                      "w-6 h-6",
                      theme === option.value ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-sm font-medium",
                      theme === option.value && "text-primary"
                    )}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Font Size Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center">
                  <Type className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">Font Size</h2>
                  <p className="text-sm text-muted-foreground">Adjust text size for readability</p>
                </div>
              </div>
              <div className="space-y-3">
                {fontOptions.map((option) => (
                  <OptionCard
                    key={option.value}
                    icon={Type}
                    label={option.label}
                    description={option.description}
                    isSelected={fontSize === option.value}
                    onClick={() => setFontSize(option.value)}
                  />
                ))}
              </div>
            </section>

            {/* Animation Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">Animations</h2>
                  <p className="text-sm text-muted-foreground">Control motion and transitions</p>
                </div>
              </div>
              <div className="space-y-3">
                {animationOptions.map((option) => (
                  <OptionCard
                    key={option.value}
                    icon={Sparkles}
                    label={option.label}
                    description={option.description}
                    isSelected={animationPreference === option.value}
                    onClick={() => setAnimationPreference(option.value)}
                  />
                ))}
              </div>
            </section>

            {/* AI Inspiration Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">AI Inspiration Mode</h2>
                  <p className="text-sm text-muted-foreground">Choose how AI assists your learning</p>
                </div>
              </div>
              <div className="space-y-3">
                {aiOptions.map((option) => (
                  <OptionCard
                    key={option.value}
                    icon={option.icon}
                    label={option.label}
                    description={option.description}
                    isSelected={aiInspiration === option.value}
                    onClick={() => setAIInspiration(option.value)}
                    gradient={option.gradient}
                  />
                ))}
              </div>
            </section>

            {/* Notifications Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">Notifications</h2>
                  <p className="text-sm text-muted-foreground">Manage your alerts and privacy</p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl divide-y divide-border">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg"><Bell className="w-4 h-4" /></div>
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">Enable global alerts</p>
                    </div>
                  </div>
                  <Switch checked={notifications.enabled} onCheckedChange={() => toggleNotification('enabled')} />
                </div>

                <div className="flex items-center justify-between p-4 opacity-100 data-[disabled=true]:opacity-50" data-disabled={!notifications.enabled}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg"><Users className="w-4 h-4" /></div>
                    <div>
                      <p className="font-medium">Study Circle Alerts</p>
                      <p className="text-xs text-muted-foreground">When someone joins or chats</p>
                    </div>
                  </div>
                  <Switch checked={notifications.circleAlerts} onCheckedChange={() => toggleNotification('circleAlerts')} disabled={!notifications.enabled} />
                </div>

                <div className="flex items-center justify-between p-4 opacity-100 data-[disabled=true]:opacity-50" data-disabled={!notifications.enabled}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg"><MessageSquare className="w-4 h-4" /></div>
                    <div>
                      <p className="font-medium">Mentions & Replies</p>
                      <p className="text-xs text-muted-foreground">When someone tags you</p>
                    </div>
                  </div>
                  <Switch checked={notifications.mentions} onCheckedChange={() => toggleNotification('mentions')} disabled={!notifications.enabled} />
                </div>

                <div className="flex items-center justify-between p-4 opacity-100 data-[disabled=true]:opacity-50" data-disabled={!notifications.enabled}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg"><Target className="w-4 h-4" /></div>
                    <div>
                      <p className="font-medium">Quest Updates</p>
                      <p className="text-xs text-muted-foreground">Daily goals and streak reminders</p>
                    </div>
                  </div>
                  <Switch checked={notifications.quests} onCheckedChange={() => toggleNotification('quests')} disabled={!notifications.enabled} />
                </div>

                <div className="flex items-center justify-between p-4 opacity-100 data-[disabled=true]:opacity-50" data-disabled={!notifications.enabled}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg"><Megaphone className="w-4 h-4" /></div>
                    <div>
                      <p className="font-medium">Product Updates</p>
                      <p className="text-xs text-muted-foreground">News about NoteVerse features</p>
                    </div>
                  </div>
                  <Switch checked={notifications.marketing} onCheckedChange={() => toggleNotification('marketing')} disabled={!notifications.enabled} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
