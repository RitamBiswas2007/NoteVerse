import { useState } from "react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/cards/FeatureCards";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { QuoteOfTheDay } from "@/components/sections/QuoteOfTheDay";
import { FeatureHighlights } from "@/components/sections/FeatureHighlights";

import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  BookOpen,
  Users,
  Lightbulb,
  Globe,
  GitFork,
  Star,
  ArrowRight,
  Sparkles,
  GraduationCap,
  MessageSquare,
  FileText,
  Heart,
  Zap,
  Trophy
} from "lucide-react";

const features = [
  {
    title: "NoteVerse",
    description: "A worldwide library where students upload, discover, and improve notes collaboratively. Fork notes, upvote the best, and learn from peers globally.",
    icon: BookOpen,
    color: "from-primary to-blue-600",
    href: "/notes",
    highlights: ["PDF & Markdown support", "Fork & improve notes", "Global filtering"]
  },
  {
    title: "StudyCircles",
    description: "Topic-based student communities where you discuss deeply, share explanations, and get your doubts answered by peers worldwide.",
    icon: Users,
    color: "from-info to-cyan-600",
    href: "/circles",
    highlights: ["Topic communities", "ELI5 sections", "Peer-reviewed content"]
  },
  {
    title: "ThinkEdu",
    description: "A platform for academic thinking. Share your ideas, theories, and research insights. Get rated on clarity and originality.",
    icon: Lightbulb,
    color: "from-accent to-orange-600",
    href: "/thoughts",
    highlights: ["Share academic thoughts", "Clarity & originality votes", "Monthly awards"]
  },
  {
    title: "PeerNotes",
    description: "Student-first, community-driven notes platform. Upload PDFs, images, or text notes categorized by subject, topic, and level.",
    icon: FileText,
    color: "from-success to-emerald-600",
    href: "/peer-notes",
    highlights: ["Upload any format", "Like & comment", "Categorized content"]
  },
];

const stats = [
  { value: "50K+", label: "Student Notes", icon: BookOpen },
  { value: "120+", label: "Countries", icon: Globe },
  { value: "500+", label: "Study Circles", icon: Users },
  { value: "1M+", label: "Students", icon: GraduationCap },
];

import { StudentDashboard } from "@/components/dashboard/StudentDashboard";

export default function Index() {

  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <StudentDashboard />;
  }

  const handleJoinCommunity = () => {
    if (user) {
      navigate('/notes'); // Redirect to learning dashboard if logged in
    } else {
      navigate('/auth?mode=signup'); // Redirect to signup for new users
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section - Educational Focus */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pattern-dots opacity-20" />
        <div className="absolute top-16 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-info/8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in border border-primary/20">
              <Sparkles className="w-4 h-4" />
              Built by students, for students worldwide
              <Heart className="w-4 h-4 text-destructive" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold mb-8 animate-slide-in leading-tight">
              Where Students{" "}
              <span className="gradient-text">Learn Together</span>
              <br className="hidden sm:block" />
              <span className="text-muted-foreground text-3xl sm:text-4xl lg:text-5xl block mt-2">
                and Grow Together
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 animate-slide-in animation-delay-100 leading-relaxed">
              The global platform where students share notes, collaborate on ideas, and build knowledge together.
              <span className="text-foreground font-medium"> No gatekeepers—just students helping students.</span>
            </p>

            {/* Global Search */}
            <div className="mb-12 animate-slide-in animation-delay-150 relative z-20 max-w-2xl mx-auto">
              <GlobalSearch />
              <p className="text-sm text-muted-foreground mt-3">
                Search for subjects, notes, study circles, or topics
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in animation-delay-200 relative z-10">
              <Button
                size="lg"
                variant="feature"
                className="text-lg px-10 py-6 h-auto shadow-glow hover:shadow-xl transition-all"
                onClick={handleJoinCommunity}
              >
                <Users className="w-5 h-5 mr-2" />
                Join the Community
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link to="/notes">
                <Button size="lg" variant="outline" className="text-lg px-10 py-6 h-auto hover:bg-muted/50">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explore Notes
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in animation-delay-300">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-info" />
                <span>120+ countries</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                <span>Student-driven</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-20 relative z-20 animate-slide-in animation-delay-300">
        <div className="rounded-2xl overflow-hidden shadow-2xl border-[6px] border-card/50 backdrop-blur-sm max-w-5xl mx-auto bg-black relative group hover:scale-[1.01] transition-transform duration-500">
          <video
            className="w-full h-auto aspect-video object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
            autoPlay
            muted
            loop
            playsInline
            poster="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-group-of-students-studying-in-a-library-4626-large.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Video Overlay Info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Play Button Overlay (Decorative) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
            </div>
          </div>

          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-white/10 text-xs font-medium mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live from NoteVerse
            </div>
            <h3 className="text-xl md:text-3xl font-display font-bold">See what students are building</h3>
          </div>
        </div>
      </section>

      {/* Stats Section - Completely Separate */}
      <section className="relative py-16 lg:py-20 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 max-w-4xl mx-auto animate-slide-in animation-delay-300">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="text-center p-6 rounded-xl glass-card hover-lift group cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon className="w-6 h-6 text-primary mx-auto mb-2 transition-transform group-hover:scale-110" />
                  <div className="text-3xl lg:text-4xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Learn & Share</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four powerful modules designed by students, for students. Each one tackles a unique aspect of collaborative learning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isNoteVerse = feature.title === "NoteVerse";

              const CardContent = (
                <FeatureCard className="h-full hover:shadow-glow group">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                    isNoteVerse
                      ? "bg-gradient-primary shadow-glow"
                      : `bg-gradient-to-br ${feature.color} shadow-lg`
                  )}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className={cn(
                    "text-xl font-display font-bold mb-3 transition-colors",
                    isNoteVerse
                      ? "gradient-text"
                      : "group-hover:text-primary"
                  )}>
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.highlights.map((h, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Star className="w-3.5 h-3.5 text-accent" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </FeatureCard>
              );

              return (
                <Link key={feature.title} to={feature.href}>
                  {CardContent}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quote of the Day Intermission */}
      <QuoteOfTheDay />

      {/* Feature Highlights */}
      <FeatureHighlights />

      {/* How It Works */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              How{" "}
              <span className="gradient-text">NoteVerse</span>{" "}
              Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, transparent, and completely student-driven
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Upload & Share",
                description: "Share your notes, ideas, or explanations. Tag by subject, university, and country.",
                icon: BookOpen
              },
              {
                step: "02",
                title: "Fork & Improve",
                description: "See something good? Fork it, improve it, and give credit. Like GitHub, but for knowledge.",
                icon: GitFork
              },
              {
                step: "03",
                title: "Discuss & Learn",
                description: "Join study circles, ask questions, and get peer-reviewed answers from students worldwide.",
                icon: MessageSquare
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative text-center group">
                  <div className="text-8xl font-display font-bold text-muted/30 absolute -top-4 left-1/2 -translate-x-1/2 transition-opacity group-hover:opacity-50">
                    {item.step}
                  </div>
                  <div className="relative pt-12">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-5 shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-grid opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6">
            Ready to Join the Global Student Network?
          </h2>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Start sharing knowledge, connecting with peers, and accelerating your learning journey today.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" variant="secondary" className="text-lg px-10 hover:scale-[1.02] active:scale-[0.98] transition-transform">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
      <DisclaimerBanner />
    </div>
  );
}
