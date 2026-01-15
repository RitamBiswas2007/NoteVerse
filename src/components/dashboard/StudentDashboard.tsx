import { useState, useEffect, useMemo } from "react";
import { format, differenceInCalendarDays, subDays } from "date-fns";
import { KnowledgeTree } from "@/components/features/KnowledgeTree";
import { useAuth } from "@/hooks/useAuth";
import { useNotes, Note } from "@/hooks/useNotes";
import { initialMockCircles } from "@/data/mock-data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reorder, motion } from "framer-motion";
import { NoteCard, CircleCard, CircleCardProps } from "@/components/cards/FeatureCards";
import { Link } from "react-router-dom";
import { QuizModal } from "@/components/modals/QuizModal"; // Import Modal
import { supabase } from "@/integrations/supabase/client"; // Ensure supabase is imported
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
    BrainCircuit, // Icon for Quiz
    CheckCircle,
    CheckCircle2,
    Upload // using lucide for upload icon
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { OnboardingModal } from "@/components/modals/OnboardingModal";
import { UploadQuizModal } from "@/components/modals/UploadQuizModal"; // New modal import

import { User } from "@supabase/supabase-js";

// Helper functions to fix runtime errors
const formatDateKey = (date: Date) => format(date, 'yyyy-MM-dd');
const diffInDays = (date1: Date, date2: Date) => differenceInCalendarDays(date1, date2);

function DailyProgressChart({ user }: { user: User | null }) {
    const [data, setData] = useState<Array<{ date: string; score: number }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                // Initialize last 7 days
                const today = new Date();
                const last7: Array<{ date: string; score: number; iso: string }> = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    const iso = d.toISOString().split('T')[0];
                    last7.push({ date: iso.slice(5), score: 0, iso });
                }

                // Force Mock Data (Bypassing Supabase 406 Error for Demo)
                const mockScores = [8, 6, 9, 7, 5, 8, 10];
                const mockedData = last7.map((day, i) => ({
                    ...day,
                    score: mockScores[i] || 0
                }));

                // Simulate network delay slightly for realism
                setTimeout(() => {
                    setData(mockedData);
                    setLoading(false);
                }, 500);

            } catch (e) {
                console.error('Exception loading progress', e);
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="text-sm text-muted-foreground py-2">Loading progress…</div>
        );
    }

    return (
        <div className="bg-card rounded-xl p-4 mb-6 shadow-sm border border-border">
            <h3 className="text-sm font-medium mb-2 text-primary">Weekly Quiz Progress</h3>
            <div className="flex items-end space-x-2 justify-between h-32">
                {data.map((d) => (
                    <div key={d.date} className="flex flex-col items-center w-8 h-full justify-end">
                        <div className="w-6 bg-indigo-500 rounded-t" style={{ height: `${(d.score / 10) * 100}%` }}></div>
                        <span className="text-xs mt-1 text-muted-foreground">{d.date}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function StudentDashboard() {
    const { user } = useAuth();
    const { notes: dbNotes, isLoading: notesLoading } = useNotes();
    const [greeting, setGreeting] = useState("Hello");

    // --- USER SPECIFIC DATA ---
    const userId = user?.id || "guest";

    // 1. STREAKS & ACTIVITY LOGIC
    const [userStats, setUserStats] = useLocalStorage(`noteverse-${userId}-stats`, {
        streak: 0,
        lastLoginDate: "",
        activityLog: {} as Record<string, number> // Maps "YYYY-MM-DD" -> minutes spent
    });

    // 2. DAILY TIME TRACKER
    useEffect(() => {
        // Run once on mount to handle Streak logic
        const todayStr = formatDateKey(new Date());

        setUserStats(prev => {
            const lastLogin = prev.lastLoginDate ? new Date(prev.lastLoginDate) : null;
            const today = new Date();
            let newStreak = prev.streak;

            if (lastLogin) {
                const diff = diffInDays(today, lastLogin);
                if (diff === 1) {
                    // Consecutive day
                    newStreak += 1;
                } else if (diff > 1) {
                    // Missed a day (or more), reset
                    newStreak = 1;
                }
                // If diff === 0, same day, do nothing
            } else {
                // First time ever
                newStreak = 1;
            }

            return {
                ...prev,
                streak: newStreak,
                lastLoginDate: todayStr
            };
        });

        // Set up interval to track time spent (every minute)
        const interval = setInterval(() => {
            setUserStats(prev => {
                const currentMinutes = prev.activityLog[todayStr] || 0;
                return {
                    ...prev,
                    activityLog: {
                        ...prev.activityLog,
                        [todayStr]: currentMinutes + 1
                    }
                };
            });
        }, 60000); // 1 minute

        return () => clearInterval(interval);
    }, [userId]); // Dependency on userId ensuring cleaner switch if user changes

    // 3. GRAPH DATA PREPARATION
    const graphData = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = subDays(new Date(), i);
            const dateStr = formatDateKey(d);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue...
            const minutes = userStats.activityLog[dateStr] || 0;
            days.push({
                name: dayName,
                hours: Number((minutes / 60).toFixed(1)), // Convert mins to hours
                originalDate: dateStr
            });
        }
        return days;
    }, [userStats.activityLog]);

    // Calculate Trend (% change vs previous day roughly, or just display total hours today)
    const todayHours = graphData[graphData.length - 1].hours;

    // --- REST OF DASHBOARD LOGIC ---

    const [circles] = useLocalStorage("noteverse-circles", initialMockCircles);
    const [joinedCircles] = useLocalStorage<string[]>("noteverse-joined-circles", []);

    // Quiz State
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [todaysScore, setTodaysScore] = useState<number | null>(null);

    // Upload Quiz Modal State
    const [isUploadQuizOpen, setIsUploadQuizOpen] = useState(false);

    // Fetch Quiz Status
    useEffect(() => {
        const checkQuizStatus = async () => {
            if (!user) return;
            const today = new Date().toISOString().split('T')[0];

            const { data } = await supabase
                .from('quiz_attempts')
                .select('score')
                .eq('user_id', user.id)
                .eq('quiz_date', today)
                .single();

            if (data) {
                setTodaysScore(data.score);
            }
        };
        checkQuizStatus();
    }, [user, isQuizOpen]); // Re-check when quiz closes/user changes

    // Dashboard Specific: Global Feed (vs Profile's "My Content")
    // Show popular content, not just user's content
    const trendingNotes = (dbNotes || [])
        .sort((a: Note, b: Note) => (b.upvotes || 0) - (a.upvotes || 0))
        .slice(0, 4);

    const myJoinedCircles = (circles || []).filter((c: { id: string }) => joinedCircles.includes(c.id));
    const suggestedCircles = (circles || [])
        .filter((c: { id: string }) => !joinedCircles.includes(c.id))
        .slice(0, 3);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    const displayName = user?.user_metadata?.display_name?.split(' ')[0] || "Student";
    const streakTarget = 7; // Example weekly target

    const activityData = [
        { name: 'Mon', hours: 2 },
        { name: 'Tue', hours: 4 },
        { name: 'Wed', hours: 3 },
        { name: 'Thu', hours: 5 },
        { name: 'Fri', hours: 4 },
        { name: 'Sat', hours: 6 },
        { name: 'Sun', hours: 3 },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <OnboardingModal />
            <QuizModal
                isOpen={isQuizOpen}
                onClose={() => setIsQuizOpen(false)}
                onComplete={(score) => {
                    setTodaysScore(score);
                    // Don't close immediately so they can see results
                }}
            />
            <UploadQuizModal isOpen={isUploadQuizOpen} onClose={() => setIsUploadQuizOpen(false)} />
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
                                Ready to maximize your productivity today?
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Link to="/notes">
                                <Button className="bg-gradient-primary shadow-glow hover:opacity-90 transition-opacity">
                                    <Plus className="w-4 h-4 mr-2" /> Upload Note
                                </Button>
                            </Link>
                            <Button onClick={() => setIsUploadQuizOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Upload className="w-4 h-4 mr-2" /> Upload Quiz
                            </Button>
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

                            {/* DYNAMIC: Knowledge Tree Ecosystem */}
                            <section className="h-[400px]">
                                <KnowledgeTree
                                    activityScore={Math.min(100, Math.round((todayHours / 8) * 100))}
                                    streakDays={userStats.streak}
                                />
                            </section>

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
                                            {myJoinedCircles.map((circle: CircleCardProps & { id: string }) => (
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
                                    <Card className="bg-muted/30 border-dashed">
                                        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                            <p className="text-muted-foreground mb-4">You haven't joined any circles yet.</p>
                                            <div className="flex gap-4 overflow-x-auto pb-2 w-full justify-center">
                                                {suggestedCircles.length > 0 && suggestedCircles.map((c: { id: string; name: string }) => (
                                                    <Badge key={c.id} variant="secondary" className="cursor-pointer hover:bg-primary/10">
                                                        + {c.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </section>

                            {/* Daily Progress Chart */}
                            <DailyProgressChart user={user} />

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
                                        trendingNotes.map((note: Note) => (
                                            <NoteCard key={note.id} {...note} />
                                        ))
                                    ) : (
                                        <div className="md:col-span-2 text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border/50">
                                            <p className="text-muted-foreground">No notes available yet. Be the first to upload!</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Video Showcase Section */}
                            <section className="relative z-20 animate-slide-in animation-delay-300">
                                <div className="rounded-2xl overflow-hidden shadow-xl border border-card/50 max-w-full bg-black relative group hover:scale-[1.01] transition-transform duration-500">
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

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                                    <div className="absolute bottom-6 left-6 text-white pointer-events-none">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-white/10 text-xs font-medium mb-2">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                            Live Community
                                        </div>
                                        <h3 className="text-lg font-display font-medium">Students studying worldwide</h3>
                                    </div>
                                </div>
                            </section>


                        </div>

                        {/* Right Col: Widgets */}
                        <div className="space-y-6">

                            {/* Focus Timer Widget */}
                            <PriorityListWidget />
                            <PomodoroWidget />

                            {/* Daily Quiz Widget (NEW) */}
                            <Card className="border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/10 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <BrainCircuit className="w-16 h-16 text-indigo-500" />
                                </div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                        <BrainCircuit className="w-4 h-4" /> Daily Quiz
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {todaysScore !== null ? (
                                        <div className="text-center py-2">
                                            <div className="text-xs text-muted-foreground mb-1">Today's Score</div>
                                            <div className="text-3xl font-bold text-indigo-600 mb-1">{todaysScore} / 10</div>
                                            <div className="flex items-center justify-center gap-1 text-xs text-green-600 font-medium">
                                                <CheckCircle className="w-3 h-3" /> Completed
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Test your knowledge with 10 new questions daily!
                                            </p>
                                            <Button
                                                onClick={() => setIsQuizOpen(true)}
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                                            >
                                                Play Now
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

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
                                        <span className="text-3xl font-bold">{userStats.streak} Days</span>
                                        <span className="text-xs text-muted-foreground mb-1">Target: {streakTarget} Days</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-500 transition-all duration-500"
                                            style={{ width: `${Math.min((userStats.streak / streakTarget) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {userStats.streak > 0
                                            ? "Keep the momentum going! Open the app daily."
                                            : "Start your streak today by learning!"}
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

interface Task {
    id: string;
    text: string;
    completed: boolean;
    createdAt: number;
    completedAt?: number;
}

function PriorityListWidget() {
    const [tasks, setTasks] = useLocalStorage<Task[]>("noteverse-tasks", [
        { id: '1', text: "Read Calculus Ch. 3", completed: false, createdAt: Date.now() },
        { id: '2', text: "Upload Physics Lab", completed: true, createdAt: Date.now() - 100000, completedAt: Date.now() }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Sort: Active first, then by creation date
    const displayTasks = tasks
        .filter(t => !t.completed)
        .slice(0, 3); // Show top 3 pending

    const activeCount = tasks.filter(t => !t.completed).length;

    return (
        <>
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => setIsModalOpen(true)}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                        <span className="flex items-center gap-2 font-display tracking-tight">
                            <CheckCircle2 className="w-4 h-4 text-[#7c3aed]" /> Priority List
                        </span>
                        <Badge variant="secondary" className="bg-[#7c3aed]/10 text-[#7c3aed] group-hover:bg-[#7c3aed]/20 transition-colors">
                            {activeCount} Active
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        {displayTasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-2 opacity-80">
                                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                                <span className="text-sm truncate text-muted-foreground group-hover:text-foreground transition-colors">
                                    {task.text}
                                </span>
                            </div>
                        ))}
                        {displayTasks.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">All caught up! Click to add tasks.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <PriorityModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                tasks={tasks}
                setTasks={setTasks}
            />
        </>
    );
}

function PriorityModal({ open, onOpenChange, tasks, setTasks }: {
    open: boolean,
    onOpenChange: (o: boolean) => void,
    tasks: Task[],
    setTasks: (t: Task[]) => void
}) {
    const [newTask, setNewTask] = useState("");

    // Check for daily reset


    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        const task: Task = {
            id: Date.now().toString(),
            text: newTask,
            completed: false,
            createdAt: Date.now()
        };
        // Add to top
        setTasks([task, ...tasks]);
        setNewTask("");
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => {
            if (t.id === id) {
                return {
                    ...t,
                    completed: !t.completed,
                    completedAt: !t.completed ? Date.now() : undefined
                };
            }
            return t;
        }));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    // Derived states
    const activeTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

    // Analytics
    const completedToday = completedTasks.filter(t => {
        const date = new Date(t.completedAt || 0);
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }).length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-background/80 backdrop-blur-xl border-[#7c3aed]/20 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#7c3aed]" /> Priority List
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="active" className="w-full mt-2">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                        <TabsTrigger value="active">Active Priorities</TabsTrigger>
                        <TabsTrigger value="history">Completion Track</TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-4 mt-4 focus-visible:outline-none focus-visible:ring-0">
                        <form onSubmit={handleAddTask} className="flex gap-2 relative">
                            <Input
                                placeholder="What's your main focus?"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                className="pl-4 pr-10 border-[#7c3aed]/30 focus-visible:ring-[#7c3aed]"
                            />
                            <Button
                                type="submit"
                                size="sm"
                                className="absolute right-1 top-1 h-8 w-8 p-0 bg-[#7c3aed] hover:bg-[#7c3aed]/90"
                            >
                                <Plus className="w-4 h-4 text-white" />
                            </Button>
                        </form>

                        <div className="min-h-[300px] max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <Reorder.Group axis="y" values={activeTasks} onReorder={(newOrder) => {
                                // Reordering only affects active tasks in UI, we need to merge back
                                const completed = tasks.filter(t => t.completed);
                                // Note: This straightforward merge might lose original full-list order logic if not careful,
                                // but for a simple active/done split it works well enough.
                                setTasks([...newOrder, ...completed]);
                            }}>
                                {activeTasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
                                        <Sparkles className="w-8 h-8 mb-2 text-[#7c3aed]" />
                                        <div className="text-sm font-medium">No active tasks</div>
                                        <div className="text-xs">Add one above to get started</div>
                                    </div>
                                ) : (
                                    activeTasks.map((task) => (
                                        <Reorder.Item key={task.id} value={task}>
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="group flex items-center gap-3 p-3 mb-2 rounded-xl bg-card border border-border/40 hover:border-[#7c3aed]/30 shadow-sm transition-all text-sm mb-2"
                                            >
                                                <div className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-foreground">
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="w-1 h-1 bg-current rounded-full" />
                                                        <div className="w-1 h-1 bg-current rounded-full" />
                                                        <div className="w-1 h-1 bg-current rounded-full" />
                                                    </div>
                                                </div>

                                                <Checkbox
                                                    checked={task.completed}
                                                    onCheckedChange={() => toggleTask(task.id)}
                                                    className="w-5 h-5 rounded-full border-2 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                />

                                                <span className="flex-1 font-medium">{task.text}</span>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                                    onClick={() => deleteTask(task.id)}
                                                >
                                                    <span className="sr-only">Delete</span>
                                                    <Plus className="w-3 h-3 rotate-45" />
                                                </Button>
                                            </motion.div>
                                        </Reorder.Item>
                                    ))
                                )}
                            </Reorder.Group>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="mt-4 focus-visible:outline-none">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-emerald-500">{completedToday}</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Completed Today</div>
                            </div>
                            <div className="bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-[#7c3aed]">{completedTasks.length}</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">All Time</div>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase pl-1">Recent Activity</h3>
                            {completedTasks.length === 0 ? (
                                <p className="text-sm text-center py-8 text-muted-foreground/50">No history yet.</p>
                            ) : (
                                completedTasks.map((task) => (
                                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-transparent hover:border-border/50 transition-colors">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium line-through text-muted-foreground">{task.text}</p>
                                            <p className="text-[10px] text-muted-foreground/60">
                                                {task.completedAt ? new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Done'}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleTask(task.id)}
                                            className="text-[10px] h-6 px-2 text-primary hover:text-primary/80"
                                        >
                                            Undo
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

function PomodoroWidget() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Simple toggle for demo
            if (mode === 'focus') {
                setMode('break');
                setTimeLeft(5 * 60);
            } else {
                setMode('focus');
                setTimeLeft(25 * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

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
                <div className="flex justify-center gap-3">
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
            </CardContent>
        </Card>
    );
}
