import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  Settings,
  Home,
  Users,
  FileText,
  Sparkles,
  Search,
  MessageSquare
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { IndexPanel } from "./IndexPanel";
import { NotificationDropdown } from "./NotificationDropdown";
import { ActiveStudentSidebar } from "./ActiveStudentSidebar";
import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Gift } from "lucide-react";
import { DailyQuests } from "@/components/dashboard/DailyQuests";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [indexPanelOpen, setIndexPanelOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const toggleIndexPanel = () => {
    setIndexPanelOpen(!indexPanelOpen);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo - Now clickable to toggle panel */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleIndexPanel}
                className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                aria-label="Toggle navigation menu"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display text-xl font-bold gradient-text hidden sm:block group-hover:opacity-80 transition-opacity">
                  NoteVerse
                </span>
              </button>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link to="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:bg-primary/10 hover:text-primary active:bg-primary/20 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <Link to="/notes">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  NoteVerse
                </Button>
              </Link>
              <Link to="/circles">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:bg-info/10 hover:text-info transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Circles
                </Button>
              </Link>
              <Link to="/peer-notes">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:bg-success/10 hover:text-success transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  PeerNotes
                </Button>
              </Link>
              <Link to="/mates">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:bg-accent/10 hover:text-accent transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Mates
                </Button>
              </Link>
              <Link to="/messages">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:bg-purple-500/10 hover:text-purple-500 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Messages
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground transition-colors ml-2 border border-border/50 px-4"
                onClick={() => window.dispatchEvent(new CustomEvent("open-command-menu"))}
              >
                <span className="text-xs mr-1 text-muted-foreground">Search</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-accent transition-colors">
                        <Gift className="w-5 h-5" />
                        <span className="sr-only">Daily Quests</span>
                        {/* Notification dot if quests pending? Optional */}
                        <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 mr-4" align="end">
                      <DailyQuests />
                    </PopoverContent>
                  </Popover>

                  <NotificationDropdown />
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px]">
                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="font-medium">Profile</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup">
                    <Button size="sm" className="bg-gradient-primary hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-glow">
                      Join Free
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-fade-in">
              <div className="flex flex-col gap-2">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 hover:bg-primary/10 hover:text-primary active:bg-primary/20"
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </Button>
                </Link>
                <Link to="/faq" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-nav-faq/10 hover:text-nav-faq active:bg-nav-faq/20"
                  >
                    FAQ
                  </Button>
                </Link>
                <Link to="/support" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-nav-support/10 hover:text-nav-support active:bg-nav-support/20"
                  >
                    Support
                  </Button>
                </Link>
                <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 hover:bg-nav-settings/10 hover:text-nav-settings active:bg-nav-settings/20"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                </Link>
                <Link to="/mates" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 hover:bg-nav-settings/10 hover:text-nav-settings active:bg-nav-settings/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    Mates
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent("open-command-menu"));
                  }}
                >
                  <Search className="w-4 h-4" />
                  Search...
                </Button>
                <div className="border-t border-border my-2 pt-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase px-4 mb-2">Modules</p>
                  <Link to="/notes" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 hover:text-blue-500">
                      <BookOpen className="w-4 h-4" /> NoteVerse Library
                    </Button>
                  </Link>
                  <Link to="/circles" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 hover:text-info">
                      <Users className="w-4 h-4" /> Study Circles
                    </Button>
                  </Link>
                  <Link to="/peer-notes" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 hover:text-success">
                      <FileText className="w-4 h-4" /> Peer Contribution
                    </Button>
                  </Link>
                </div>
                <div className="border-t border-border my-2 pt-2">
                  {user ? (
                    <>
                      <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <User className="w-4 h-4" />
                          Profile
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 mt-2"
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <LogIn className="w-4 h-4" />
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full mt-2 bg-gradient-primary">
                          Join Free
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header >

      <IndexPanel isOpen={indexPanelOpen} onClose={() => setIndexPanelOpen(false)} />
      <ActiveStudentSidebar />
    </>
  );
}
