import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { NoteCard, CircleCard } from "@/components/cards/FeatureCards";
import { Link } from "react-router-dom";
import {
    Plus,
    Search,
    Clock,
    Flame,
    TrendingUp,
    Sparkles,
    Play,
    Pause,
    RotateCcw,
    Users,
    FileText
} from "lucide-react";
import { OnboardingModal } from "@/components/modals/OnboardingModal";
import { useNotes } from "@/hooks/useNotes";
import { initialMockCircles } from "@/data/mock-data";
import { SEO } from "@/components/layout/SEO";
import { useActivity } from "@/hooks/useActivity";
import { EmptyState } from "@/components/ui/empty-state";

export default function Dashboard() {
    const { user } = useAuth();
    const { notes: dbNotes, isLoading: notesLoading } = useNotes();
    const [greeting, setGreeting] = useState("Hello");

    const [circles] = useLocalStorage("noteverse-circles", initialMockCircles);
    const [joinedCircles] = useLocalStorage<string[]>("noteverse-joined-circles", []);

    // Dashboard Specific: Global Feed (vs Profile's "My Content")
    // Show popular content, not just user's content
    const trendingNotes = (dbNotes || [])
        .sort((a: any, b: any) => (b.upvotes || 0) - (a.upvotes || 0))
        .slice(0, 4);

    const myJoinedCircles = (circles || []).filter((c: any) => joinedCircles.includes(c.id));
    const suggestedCircles = (circles || [])
        .filter((c: any) => !joinedCircles.includes(c.id))
        .slice(0, 3);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    const displayName = user?.user_metadata?.display_name?.split(' ')[0] || "Student";

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <SEO title="Dashboard" description="Your command center for learning." />
            <OnboardingModal />
            <Navbar />

            <main className="flex-1 pt-24 pb-16 space-y-8 animate-fade-in">

                {/* Welcome Section */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-display font-bold">
                                {greeting}, <span className="gradient-text">{displayName}</span>
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Ready to continue your learning journey?
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Link to="/notes">
                                <Button className="bg-gradient-primary shadow-glow hover:opacity-90 transition-opacity">
                                    <Plus className="w-4 h-4 mr-2" /> Upload Note
                                </Button>
                            </Link>
                            <Link to="/circles">
                                <Button variant="outline">
                                    <Search className="w-4 h-4 mr-2" /> Find Circle
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Col: Main Feed & Activities */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Quick Access / Recent Circles */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" /> Your Communities
                                    </h2>
                                    <Link to="/circles" className="text-sm text-primary hover:underline">View All</Link>
                                </div>

                                {myJoinedCircles.length > 0 ? (
                                    <ScrollArea className="w-full whitespace-nowrap rounded-xl">
                                        <div className="flex w-max space-x-4 pb-4">
                                            {myJoinedCircles.map((circle: any) => (
                                                <div key={circle.id} className="w-[280px]">
                                                    <CircleCard {...circle} compact>
                                                        <Button variant="ghost" size="sm" className="w-full mt-2">Enter Circle</Button>
                                                    </CircleCard>
                                                </div>
                                            ))}
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                ) : (
                                    <EmptyState
                                        title="No Communities Yet"
                                        description="You haven't joined any circles yet. Join one to start collaborating."
                                        icon={Users}
                                        action={
                                            <div className="flex gap-2 overflow-x-auto pb-2 w-full justify-center max-w-sm">
                                                {suggestedCircles.length > 0 && suggestedCircles.map((c: any) => (
                                                    <Badge key={c.id} variant="secondary" className="cursor-pointer hover:bg-primary/10 whitespace-nowrap">
                                                        + {c.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        }
                                    />
                                )}
                            </section>

                            {/* Trending Notes (Discovery) */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-accent" /> Trending Now
                                    </h2>
                                    <Link to="/notes" className="text-sm text-primary hover:underline">Explore</Link>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {notesLoading ? (
                                        [1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-48 rounded-xl bg-muted/20 animate-pulse border border-border/50" />
                                        ))
                                    ) : trendingNotes.length > 0 ? (
                                        trendingNotes.map((note: any) => (
                                            <NoteCard key={note.id} {...note} />
                                        ))
                                    ) : (
                                        <div className="md:col-span-2">
                                            <EmptyState
                                                title="No Trending Notes"
                                                description="Be the first to share your knowledge with the world."
                                                icon={FileText}
                                                action={
                                                    <Link to="/notes">
                                                        <Button variant="outline">Upload Note</Button>
                                                    </Link>
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            </section>

                        </div>

                        {/* Right Col: Widgets */}
                        <div className="space-y-6">

                            {/* Focus Timer Widget */}
                            <PomodoroWidget />

                            {/* Daily Inspiration */}
                            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" /> Daily Insight
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <blockquote className="italic text-muted-foreground text-sm">
                                        "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
                                    </blockquote>
                                    <p className="text-xs text-right mt-2 font-medium">— Malcolm X</p>
                                </CardContent>
                            </Card>

                            {/* Learning Streak */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Flame className="w-4 h-4 text-orange-500" /> Learning Streak
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-end justify-between mb-2">
                                        <span className="text-3xl font-bold">4 Days</span>
                                        <span className="text-xs text-muted-foreground mb-1">Target: 7 Days</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500 w-[57%]" />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        You're on fire! Complete one quiz to extend user streak.
                                    </p>
                                </CardContent>
                            </Card>

                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

function PomodoroWidget() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');
    const { trackAction } = useActivity();

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (mode === 'focus') {
                trackAction('focus_session');
                setMode('break');
                setTimeLeft(5 * 60);
            } else {
                setMode('focus');
                setTimeLeft(25 * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode, trackAction]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <Card className="border-primary/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" /> Focus Timer
                    </span>
                    <Badge variant="outline" className="uppercase text-[10px]">{mode}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-mono font-bold text-center my-4 tracking-wider">
                    {formatTime(timeLeft)}
                </div>
                <div className="flex justify-center gap-3 mb-4">
                    <Button
                        size="sm"
                        variant={isActive ? "secondary" : "default"}
                        className={isActive ? "" : "bg-primary"}
                        onClick={toggleTimer}
                    >
                        {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={resetTimer}>
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
                <Link to="/focus" className="block">
                    <Button variant="outline" size="sm" className="w-full gap-2 border-dashed">
                        <Play className="w-3 h-3" /> Enter Deep Focus Mode
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
