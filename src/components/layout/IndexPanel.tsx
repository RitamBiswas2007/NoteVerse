import { Link } from "react-router-dom";
import { X, BookOpen, Users, FileText, Lightbulb, Settings, HelpCircle, MessageCircle, NotebookPen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IndexPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const mainItems = [
  {
    name: "NoteVerse",
    href: "/notes",
    icon: BookOpen,
    description: "Global student notes library",
    gradient: "from-primary to-blue-600",
  },
  {
    name: "Your Notes",
    href: "/your-notes",
    icon: NotebookPen,
    description: "Manage your personal private notes",
    gradient: "from-violet-600 to-indigo-600",
  },
  {
    name: "StudyCircles",
    href: "/circles",
    icon: Users,
    description: "Topic-based communities",
    gradient: "from-info to-cyan-600",
  },
  {
    name: "ThinkEdu",
    href: "/thoughts",
    icon: Lightbulb,
    description: "Share ideas & research",
    gradient: "from-accent to-orange-600",
  },
  {
    name: "PeerNotes",
    href: "/peer-notes",
    icon: FileText,
    description: "Community-driven notes",
    gradient: "from-success to-emerald-600",
  },
];

const secondaryItems = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Customize your experience",
  },
  {
    name: "FAQ",
    href: "/faq",
    icon: HelpCircle,
    description: "Frequently asked questions",
  },
  {
    name: "Support",
    href: "/support",
    icon: MessageCircle,
    description: "Get help from our team",
  },
];

export function IndexPanel({ isOpen, onClose }: IndexPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
            className="fixed top-0 left-0 z-[70] h-full w-80 bg-card border-r border-border shadow-xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-display font-bold gradient-text">Navigation</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-muted transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100%-80px)]">
              {/* Main Navigation */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Platform
                </p>
                <motion.div
                  className="space-y-2"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.1
                      }
                    }
                  }}
                >
                  {mainItems.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <motion.div
                        key={item.name}
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          show: { opacity: 1, x: 0 }
                        }}
                      >
                        <Link
                          to={item.href}
                          onClick={onClose}
                          className="block"
                        >
                          <div className="group p-4 rounded-xl border border-border bg-background hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  "rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 w-12 h-12 bg-gradient-to-br shadow-lg",
                                  item.gradient
                                )}
                              >
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {item.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

              {/* Secondary Navigation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Help & Settings
                </p>
                <div className="space-y-1">
                  {secondaryItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div className="flex-1">
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>

              {/* Footer */}
              <motion.div
                className="pt-4 mt-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    🌍 Student-first, community-driven
                  </p>
                </div>
              </motion.div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
