import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/BackButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Search, MapPin, Clock, BookOpen, MessageSquare, UserPlus, Filter, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SUBJECTS = ["Computer Science", "Mathematics", "Physics", "Biology", "Economics", "Arts"];
const GOALS = ["Exam Prep", "Project Collab", "Casual Study", "Research"];
const TIMEZONES = ["Morning", "Afternoon", "Evening", "Night Owl"];

export default function StudyMates() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [mates, setMates] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Profiles
                let query = supabase.from('profiles').select('*');
                if (user) query = query.neq('id', user.id);

                const { data: profiles, error: profileError } = await query.limit(50);
                if (profileError) throw profileError;

                // 2. Fetch My Connections (Unidirectional check for "Following" status)
                let statusMap = new Map<string, string>();
                if (user) {
                    const { data: conns } = await supabase
                        .from('user_connections' as any)
                        .select('receiver_id, status')
                        .eq('requester_id', user.id);

                    if (conns) {
                        conns.forEach((c: any) => {
                            statusMap.set(c.receiver_id, c.status);
                        });
                    }
                }
                setConnectionStatus(statusMap);

                if (profiles) {
                    const mappedMates = profiles.map((profile: any) => ({
                        id: profile.id,
                        name: profile.display_name || "Anonymous Student",
                        avatar: profile.avatar_url,
                        subjects: Array.isArray(profile.subjects)
                            ? profile.subjects
                            : (profile.subjects ? [profile.subjects] : ["General"]),
                        status: profile.bio ? (profile.bio.length > 30 ? profile.bio.substring(0, 30) + "..." : profile.bio) : "Student at NoteVerse",
                        fullBio: profile.bio || "No bio available.", // Keep distinct from mapped UI prop
                        goal: "Casual Study",
                        time: "Flexible",
                        education_level: profile.education_level || "Undergraduate"
                    }));
                    setMates(mappedMates);
                }

                // 3. Fetch Pending Requests (Incoming)
                if (user) {
                    const { data: requests, error: reqError } = await supabase
                        .from('user_connections' as any)
                        .select(`
                            requester_id,
                            created_at,
                            profiles:requester_id (
                                id, display_name, avatar_url, education_level
                            )
                        `)
                        .eq('receiver_id', user.id)
                        .eq('status', 'pending');

                    if (requests) {
                        const formattedRequests = requests.map((r: any) => ({
                            id: r.requester_id,
                            name: r.profiles?.display_name || "Unknown Student",
                            avatar: r.profiles?.avatar_url,
                            education_level: r.profiles?.education_level || "Student",
                            timestamp: r.created_at
                        }));
                        setPendingRequests(formattedRequests);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const toggleSubject = (subject: string) => {
        setSelectedSubjects(prev =>
            prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
        );
    };

    const filteredMates = mates.filter(mate => {
        const matchesSearch = mate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mate.status.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = selectedSubjects.length === 0 ||
            mate.subjects.some((s: string) => selectedSubjects.includes(s));
        return matchesSearch && matchesSubject;
    });

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 flex pt-24 pb-12 container mx-auto px-4 sm:px-6 lg:px-8 gap-8">

                {/* Sidebar Filters - Hidden on small screens */}
                <div className="hidden lg:block w-64 shrink-0 space-y-8 h-[calc(100vh-8rem)] sticky top-24">
                    <div>
                        <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Filters
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Subject</h4>
                                {SUBJECTS.map(subject => (
                                    <div key={subject} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={subject}
                                            checked={selectedSubjects.includes(subject)}
                                            onCheckedChange={() => toggleSubject(subject)}
                                        />
                                        <label htmlFor={subject} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {subject}
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Goal</h4>
                                {GOALS.map(goal => (
                                    <div key={goal} className="flex items-center space-x-2">
                                        <Checkbox id={goal} />
                                        <label htmlFor={goal} className="text-sm font-medium leading-none">{goal}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <BackButton className="mb-6" />

                    {/* Pending Requests Section */}
                    {pendingRequests.length > 0 && (
                        <div className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-2xl">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-primary" /> Incoming Requests
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pendingRequests.map(req => (
                                    <div key={req.id} className="bg-background/80 p-4 rounded-xl border border-border flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={req.avatar} />
                                                <AvatarFallback>{req.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className="font-bold text-sm">{req.name}</h4>
                                                <p className="text-xs text-muted-foreground">{req.education_level}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs h-8 text-destructive border-destructive/20 hover:bg-destructive/10"
                                                onClick={async () => {
                                                    await supabase
                                                        .from('user_connections' as any)
                                                        .delete()
                                                        .eq('requester_id', req.id)
                                                        .eq('receiver_id', user!.id);
                                                    setPendingRequests(prev => prev.filter(p => p.id !== req.id));
                                                    toast.info("Request declined");
                                                }}
                                            >
                                                Decline
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="text-xs h-8 bg-primary text-primary-foreground"
                                                onClick={async () => {
                                                    await supabase
                                                        .from('user_connections' as any)
                                                        .update({ status: 'accepted' })
                                                        .eq('requester_id', req.id)
                                                        .eq('receiver_id', user!.id);

                                                    setPendingRequests(prev => prev.filter(p => p.id !== req.id));
                                                    setConnectionStatus(prev => new Map(prev).set(req.id, 'accepted'));
                                                    toast.success(`You are now connected with ${req.name}!`);
                                                }}
                                            >
                                                Accept
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl font-display font-bold mb-2">Find your <span className="gradient-text">Study Mate</span></h1>
                            <p className="text-muted-foreground">Connect with students who share your goals and schedule.</p>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or interest..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredMates.map(mate => (
                                <div key={mate.id} className="group relative bg-card hover:bg-accent/5 border border-border hover:border-accent/30 rounded-2xl p-6 transition-all duration-300 hover-lift flex flex-col items-center text-center">
                                    <Avatar className="w-24 h-24 mb-4 border-4 border-background shadow-lg">
                                        <AvatarImage src={mate.avatar} />
                                        <AvatarFallback className="text-2xl bg-gradient-primary text-white">
                                            {mate.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <h3 className="text-xl font-bold mb-1">{mate.name}</h3>
                                    <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                                        {mate.education_level}
                                    </Badge>

                                    <div className="w-full space-y-3 mb-6">
                                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                            <BookOpen className="w-3.5 h-3.5" />
                                            <span className="truncate max-w-[200px]">{mate.subjects.join(", ")}</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{mate.time}</span>
                                        </div>
                                        {mate.status && (
                                            <div className="text-xs text-muted-foreground italic mt-2 line-clamp-2">
                                                "{mate.status}"
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 w-full mt-auto">
                                        {(() => {
                                            const status = connectionStatus.get(mate.id);
                                            if (status === 'accepted') {
                                                return (
                                                    <Button
                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-glow"
                                                        onClick={() => navigate(`/messages?userId=${mate.id}`)}
                                                    >
                                                        <MessageSquare className="w-4 h-4 mr-2" /> Message
                                                    </Button>
                                                );
                                            } else if (status === 'pending') {
                                                return (
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 border-dashed border-muted-foreground/40 text-muted-foreground hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5 transition-all group/cancel"
                                                        onClick={async () => {
                                                            if (!user) return;
                                                            try {
                                                                const { error } = await supabase
                                                                    .from('user_connections' as any)
                                                                    .delete()
                                                                    .eq('requester_id', user.id)
                                                                    .eq('receiver_id', mate.id);

                                                                if (error) throw error;

                                                                setConnectionStatus(prev => {
                                                                    const newMap = new Map(prev);
                                                                    newMap.delete(mate.id);
                                                                    return newMap;
                                                                });
                                                                toast.info("Request cancelled");
                                                            } catch (e) {
                                                                console.error(e);
                                                                toast.error("Could not cancel request");
                                                            }
                                                        }}
                                                    >
                                                        <X className="w-4 h-4 mr-2 group-hover/cancel:scale-110 transition-transform" /> Cancel
                                                    </Button>
                                                );
                                            } else {
                                                return (
                                                    <Button
                                                        className="flex-1 bg-gradient-primary shadow-glow hover:opacity-90"
                                                        onClick={async () => {
                                                            if (!user) {
                                                                toast.error("Please login to connect");
                                                                return;
                                                            }
                                                            try {
                                                                // Optimistic Update
                                                                setConnectionStatus(prev => new Map(prev).set(mate.id, 'pending'));

                                                                // 1. Check for existing connection (in case of race condition or out of sync)
                                                                const { data: existing } = await supabase
                                                                    .from('user_connections' as any)
                                                                    .select('*')
                                                                    .eq('requester_id', user.id)
                                                                    .eq('receiver_id', mate.id)
                                                                    .maybeSingle();

                                                                if (existing) {
                                                                    const connection = existing as any;
                                                                    // Update map just in case
                                                                    setConnectionStatus(prev => new Map(prev).set(mate.id, connection.status));

                                                                    if (connection.status === 'accepted') {
                                                                        toast.info("You are already connected!");
                                                                    } else if (connection.status === 'pending') {
                                                                        toast.info("Connection request already sent.");
                                                                    }
                                                                    return;
                                                                }

                                                                // 2. Create Connection Record
                                                                const { error: connError } = await supabase
                                                                    .from('user_connections' as any)
                                                                    .insert({
                                                                        requester_id: user.id,
                                                                        receiver_id: mate.id,
                                                                        status: 'pending'
                                                                    });

                                                                if (connError) {
                                                                    console.error("Connection insert error:", connError);
                                                                    setConnectionStatus(prev => {
                                                                        const newMap = new Map(prev);
                                                                        newMap.delete(mate.id);
                                                                        return newMap;
                                                                    });
                                                                    toast.error("Failed to send request");
                                                                    return;
                                                                }

                                                                // 3. Notification is now handled automatically by DB Trigger


                                                                toast.success(`Connection request sent to ${mate.name}!`);
                                                            } catch (e) {
                                                                console.error("Unexpected error:", e);
                                                                // Revert optimistic update
                                                                setConnectionStatus(prev => {
                                                                    const newMap = new Map(prev);
                                                                    newMap.delete(mate.id);
                                                                    return newMap;
                                                                });
                                                                toast.error("Something went wrong");
                                                            }
                                                        }}
                                                    >
                                                        <UserPlus className="w-4 h-4 mr-2" /> Connect
                                                    </Button>
                                                );
                                            }
                                        })()}
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => navigate(`/profile?userId=${mate.id}`)}
                                        >
                                            View Profile
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && filteredMates.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground">No study mates found matching your filters.</p>
                            <Button variant="link" onClick={() => setSelectedSubjects([])}>Clear Filters</Button>
                        </div>
                    )}

                </div>
            </main >
        </div >
    );
}
