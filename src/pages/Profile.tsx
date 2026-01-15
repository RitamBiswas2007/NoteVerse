import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "@/components/ui/BackButton";
import { NoteCard } from "@/components/cards/FeatureCards";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNotes } from "@/hooks/useNotes";
import {
    User,
    Activity,
    Plus,
    X,
    LogOut,
    Bell,
    Eye,
    Settings,
    BookOpen
} from "lucide-react";
// import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useActivity } from "@/hooks/useActivity";

// Refactored Components
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { EditProfileForm } from "@/components/profile/EditProfileForm";

export default function Profile() {
    const { user, updateProfile, signOut } = useAuth();
    const { toast } = useToast();
    const { trackAction } = useActivity();
    const { notes } = useNotes();
    const location = useLocation(); // Add useLocation import if not present, but better to use URLSearchParams directly or via hook
    const [isEditing, setIsEditing] = useState(false);

    // Parse Query Params to check if we are viewing another user
    const searchParams = new URLSearchParams(location.search);
    const viewUserId = searchParams.get('userId');
    const isOwner = !viewUserId || (user && user.id === viewUserId);
    const targetUserId = viewUserId || user?.id;

    // Real-time Karma Logic
    const [realtimeKarma, setRealtimeKarma] = useState<number | null>(0);
    // Profile Data State
    const [profileData, setProfileData] = useState<any>(null);


    useEffect(() => {
        if (!targetUserId) return;

        // Fetch Profile Data
        // Fetch Profile Data
        const fetchProfile = async () => {
            let fetchedData = null;

            // 1. Try Supabase
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', targetUserId)
                    .single();

                if (!error && data) {
                    fetchedData = data;
                }
            } catch (e) {
                console.warn("Profile fetch error:", e);
            }

            // 2. Fallback for Demo User or Sync Issues (Local Metadata)
            if (!fetchedData && isOwner && user) {
                const meta = user.user_metadata || {};
                fetchedData = {
                    id: user.id,
                    display_name: meta.display_name,
                    university: meta.university || "NoteVerse University",
                    education_level: meta.major || "General Studies",
                    bio: meta.bio || "Student at NoteVerse",
                    subjects: meta.skills || ["Student"],
                    avatar_url: meta.avatar_url,
                    karma: meta.karma || 0,
                    socials: meta.socials // Not in standard schema but might be useful to keep
                };
            }

            if (fetchedData) {
                setProfileData(fetchedData);

                // Realtime Karma
                if (isOwner) {
                    setRealtimeKarma((fetchedData as any).karma || 0);
                } else {
                    setRealtimeKarma(null); // Private
                }

                // Form Initialization
                setFormData({
                    displayName: fetchedData.display_name || "",
                    university: fetchedData.university || "",
                    major: fetchedData.education_level || "",
                    bio: fetchedData.bio || "",
                    skills: fetchedData.subjects || ["Student"],
                    socials: (fetchedData as any).socials || {
                        linkedin: "",
                        github: "",
                        portfolio: ""
                    },
                    avatarUrl: fetchedData.avatar_url || ""
                });
                setAvatarPreview(fetchedData.avatar_url || null);
            }
        };

        fetchProfile();

        // Subscribe to Realtime Updates ONLY if Owner
        if (isOwner) {
            const channel = supabase
                .channel('profile-karma-sync')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${targetUserId}`,
                    },
                    (payload: any) => {
                        if (payload.new && typeof payload.new.karma === 'number') {
                            setRealtimeKarma(payload.new.karma);
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [targetUserId, isOwner]);

    // Initial State derived from user metadata (fallback / initial load)
    const [formData, setFormData] = useState({
        displayName: "",
        university: "",
        major: "",
        bio: "",
        skills: [] as string[],
        socials: {
            linkedin: "",
            github: "",
            portfolio: ""
        },
        avatarUrl: ""
    });

    const [newSkill, setNewSkill] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Profile Page Persistence Logic
    const joinedCirclesKey = targetUserId ? `noteverse_joined_circles_${targetUserId}` : "noteverse_joined_circles_guest";
    const [joinedCircles] = useLocalStorage<string[]>(joinedCirclesKey, []);

    // Filter notes for the TARGET user
    const myNotes = notes?.filter(note => note.userId === targetUserId) || [];

    const handleUpdate = async () => {
        if (!isOwner) return; // Prevention
        try {
            const updates = { ...formData };
            if (avatarPreview && avatarPreview !== formData.avatarUrl) {
                updates.avatarUrl = avatarPreview;
            }
            await updateProfile(updates);
            setIsEditing(false);
            trackAction('update_profile');
        } catch (e) {
            console.error(e);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addSkill = () => {
        if (newSkill && !formData.skills.includes(newSkill)) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    const [settingsState, setSettingsState] = useState({
        notifications: true,
        privacyMode: false
    });

    const toggleSetting = (key: keyof typeof settingsState) => {
        setSettingsState(prev => {
            const newState = { ...prev, [key]: !prev[key] };
            updateProfile({ settings: newState });
            return newState;
        });
        toast({
            title: "Settings Updated",
            description: `${key === 'notifications' ? 'Notifications' : 'Privacy Mode'} ${!settingsState[key] ? 'enabled' : 'disabled'}.`
        });
    };

    // Only return null if NO data is available and we are the owner (implies loading or auth issue)
    // If viewing another profile, we might wait for fetch
    // Loading State
    const isLoading = !profileData && !!targetUserId;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
                    <p className="text-muted-foreground text-sm animate-pulse">Synchronizing Profile...</p>
                </div>
            </div>
        );
    }

    // Fallback if neither user exists (should redirect or show error ideally)
    if (!profileData && !user) return null;

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
            <Navbar />

            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex-1 pb-20"
            >
                {/* Hero / Cover Area */}
                <div className="h-64 md:h-80 w-full bg-gradient-hero relative overflow-hidden">
                    <div className="absolute top-24 left-4 z-20 md:left-8 md:top-24">
                        <BackButton
                            className="text-white/90 hover:text-white hover:bg-white/10 border border-white/20 bg-black/20 backdrop-blur-sm transition-all duration-300"
                            label="Back"
                        />
                    </div>
                    <div className="absolute inset-0 pattern-grid opacity-10 animate-fade-in" />
                    <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse-slow" />
                    <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">

                        {/* Profile Sidebar & Edit Form */}
                        <ProfileSidebar
                            user={
                                isOwner
                                    ? user
                                    : {
                                        id: targetUserId,
                                        email: "Private", // Hide email for privacy
                                        created_at: profileData?.created_at, // Use fetched profile data
                                        user_metadata: { ...formData }
                                        // Mock other auth.user fields if needed
                                    }
                            }
                            formData={formData}
                            isEditing={isEditing}
                            onOpenChange={setIsEditing}
                            isOwner={isOwner} // Pass ownership explicitly
                            onEditClick={isOwner ? () => setIsEditing(true) : undefined}
                            editDialogContent={
                                isOwner ? (
                                    <EditProfileForm
                                        formData={formData}
                                        setFormData={setFormData}
                                        avatarPreview={avatarPreview}
                                        handleFileChange={handleFileChange}
                                        newSkill={newSkill}
                                        setNewSkill={setNewSkill}
                                        addSkill={addSkill}
                                        removeSkill={removeSkill}
                                        handleUpdate={handleUpdate}
                                    />
                                ) : null
                            }
                        />

                        {/* Main Content Area */}
                        <div className="flex-1 min-w-0 lg:mt-6">

                            <ProfileStats
                                notesCount={myNotes.length}
                                circlesCount={joinedCircles.length}
                                karma={isOwner ? realtimeKarma : null} // Hide karma if not owner
                            />

                            {/* Tabs Content */}
                            <Tabs defaultValue="about" className="w-full space-y-8">
                                <TabsList className="w-full justify-start h-14 p-1.5 bg-muted/40 rounded-2xl backdrop-blur-sm border border-border/50">
                                    <TabsTrigger value="about" className="rounded-xl px-6 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
                                    <TabsTrigger value="contributions" className="rounded-xl px-6 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">My Contributions</TabsTrigger>
                                    <TabsTrigger value="settings" className="rounded-xl px-6 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">Settings</TabsTrigger>
                                </TabsList>

                                <AnimatePresence mode="wait">
                                    <TabsContent value="about" className="space-y-6 focus-visible:outline-none">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                                        >
                                            {/* Biog & Skills */}
                                            <div className="md:col-span-2 space-y-6">
                                                <Card className="h-full border-none shadow-md bg-gradient-to-br from-card to-muted/20">
                                                    <CardHeader>
                                                        <CardTitle className="text-xl">About Me</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap mb-8 text-[15px]">
                                                            {formData.bio || "No bio added yet. Click 'Edit Profile' to introduce yourself to the community!"}
                                                        </p>

                                                        <h4 className="text-sm font-semibold mb-4 text-foreground/80 flex items-center gap-2">
                                                            <Activity className="w-4 h-4 text-primary" />
                                                            Skills & Interests
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {formData.skills.length > 0 ? formData.skills.map((skill, i) => (
                                                                <motion.span
                                                                    key={skill}
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    transition={{ delay: i * 0.05 }}
                                                                    className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold hover:bg-primary/20 transition-colors cursor-default"
                                                                >
                                                                    {skill}
                                                                </motion.span>
                                                            )) : <span className="text-sm text-muted-foreground italic">No skills listed yet.</span>}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            {/* Activity Feed */}
                                            <div className="space-y-6">
                                                <Card className="h-full border-none shadow-md">
                                                    <CardHeader>
                                                        <CardTitle className="text-lg flex items-center gap-2">
                                                            <Activity className="w-4 h-4 text-primary" />
                                                            Recent Activity
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-6 relative ml-3">
                                                            {/* Connecting Line */}
                                                            <div className="absolute left-0 top-2 bottom-4 w-px bg-border/60"></div>

                                                            {[
                                                                { text: "Updated profile bio", date: "Just now", icon: User },
                                                                { text: "Joined NoteVerse", date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), icon: Plus },
                                                            ].map((item, i) => (
                                                                <div key={i} className="flex gap-4 relative z-10 group">
                                                                    <div className="w-8 h-8 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center -ml-4 group-hover:border-primary transition-colors">
                                                                        <item.icon className="w-3.5 h-3.5 text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium leading-none mb-1 group-hover:text-primary transition-colors">{item.text}</p>
                                                                        <p className="text-xs text-muted-foreground">{item.date}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </motion.div>
                                    </TabsContent>

                                    <TabsContent value="contributions" className="focus-visible:outline-none">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {(myNotes?.length || 0) > 0 ? (
                                                <div className="grid gap-4">
                                                    {myNotes?.map((note: any) => (
                                                        <NoteCard key={note.id} {...note} />
                                                    ))}
                                                    <Button variant="outline" className="mt-4 w-full border-dashed" onClick={() => window.location.href = '/notes'}>
                                                        <Plus className="w-4 h-4 mr-2" /> Upload New Note
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Card className="border-2 border-dashed border-muted bg-muted/20">
                                                    <CardContent className="p-16 text-center flex flex-col items-center">
                                                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-bounce-slow">
                                                            <BookOpen className="w-10 h-10 text-primary" />
                                                        </div>
                                                        <h3 className="text-2xl font-bold mb-2">No contributions yet</h3>
                                                        <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                                                            Your knowledge is valuable! Upload your first note and start earning reputation in the NoteVerse community.
                                                        </p>
                                                        <Button onClick={() => window.location.href = '/notes'} size="lg" className="shadow-lg shadow-primary/20">
                                                            Upload Note
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </motion.div>
                                    </TabsContent>

                                    <TabsContent value="settings" className="focus-visible:outline-none">
                                        <Card className="border-none shadow-md">
                                            <CardContent className="p-8 space-y-8">
                                                <div>
                                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                                        <Settings className="w-5 h-5 text-primary" />
                                                        Account Preferences
                                                    </h3>
                                                    <p className="text-muted-foreground">Manage how you interact with the platform.</p>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors border">
                                                        <div className="space-y-1">
                                                            <p className="font-semibold flex items-center gap-2">
                                                                <Bell className="w-4 h-4 text-muted-foreground" />
                                                                Email Notifications
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">Receive updates about your shared notes and circles.</p>
                                                        </div>
                                                        <Switch
                                                            checked={settingsState.notifications}
                                                            onCheckedChange={() => toggleSetting('notifications')}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors border">
                                                        <div className="space-y-1">
                                                            <p className="font-semibold flex items-center gap-2">
                                                                <Eye className="w-4 h-4 text-muted-foreground" />
                                                                Privacy Mode
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">Hide your profile details from public search results.</p>
                                                        </div>
                                                        <Switch
                                                            checked={settingsState.privacyMode}
                                                            onCheckedChange={() => toggleSetting('privacyMode')}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-8 border-t">
                                                    <h4 className="text-sm font-bold text-destructive mb-4 uppercase tracking-wider">Danger Zone</h4>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">Sign Out</p>
                                                            <p className="text-sm text-muted-foreground">Log out of your account on this device.</p>
                                                        </div>
                                                        <Button variant="destructive" onClick={signOut}>
                                                            <LogOut className="w-4 h-4 mr-2" />
                                                            Sign Out
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </AnimatePresence>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </motion.main>
            <Footer />
        </div>
    );
}
