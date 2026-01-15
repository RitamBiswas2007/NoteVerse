
import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CircleCard } from "@/components/cards/FeatureCards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/ui/BackButton";
import { Search, Plus, Check, Users, Sparkles, MessageSquare, ArrowLeft, Send, ThumbsUp, MoreVertical, ShieldCheck, Info } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useActivity } from "@/hooks/useActivity";

import { initialMockCircles } from "@/data/mock-data";

export default function Circles() {
  const { user } = useAuth();
  const { trackAction } = useActivity();

  // Dynamic keys based on user ID to ensure isolation
  const circlesKey = user ? `noteverse_circles_${user.id}` : "noteverse_circles_guest";
  const joinedKey = user ? `noteverse_joined_circles_${user.id}` : "noteverse_joined_circles_guest";

  // We need to initialize with mock data ONLY if it's the first time for this user, OR if it's the demo user.
  // The useLocalStorage hook might not support dynamic keys easily if it's not reactive to key changes directly 
  // without a useEffect or similar. Assuming standard useLocalStorage pattern:
  // We'll wrap the data initialization logic slightly differently.

  const [circles, setCircles] = useLocalStorage(circlesKey, initialMockCircles);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [joinedCircles, setJoinedCircles] = useLocalStorage<string[]>(joinedKey, []);
  const [newCircle, setNewCircle] = useState({
    name: "",
    subjectArea: "",
    description: "",
  });
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const selectedCircle = circles.find(c => c.id === selectedCircleId);
  const isJoined = selectedCircleId ? joinedCircles.includes(selectedCircleId) : false;

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedCircleId) return;

    const newMessage = {
      id: Date.now().toString(),
      user: user?.user_metadata?.display_name || user?.email?.split('@')[0] || "You",
      type: "post",
      content: messageInput,
      timestamp: "Just now",
      likes: 0,
      comments: 0
    };

    setCircles(prev => prev.map(c => {
      if (c.id === selectedCircleId) {
        return {
          ...c,
          postCount: c.postCount + 1,
          activities: [...(c.activities || []), newMessage]
        };
      }
      return c;
    }));
    setMessageInput("");
    toast.success("Message sent!");

    // Simulate a reply for "conversation" feel
    setTimeout(() => {
      const replies = [
        "That's a really interesting perspective!",
        "I was thinking the exact same thing about this topic.",
        "Does anyone have more resources on this?",
        "Thanks for sharing that! It really helps clarify things.",
        "Wait, can you explain that bit about the complexity again?"
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const randomUser = ["Alex", "Jordan", "Sam", "Taylor"][Math.floor(Math.random() * 4)];

      const replyMessage = {
        id: (Date.now() + 1).toString(),
        user: randomUser,
        type: "comment",
        content: randomReply,
        timestamp: "Just now",
        likes: 1,
        comments: 0
      };

      setCircles(prev => prev.map(c => {
        if (c.id === selectedCircleId) {
          return {
            ...c,
            activities: [...(c.activities || []), replyMessage]
          };
        }
        return c;
      }));
    }, 2000);
  };

  const handleCreate = () => {
    if (!newCircle.name || !newCircle.subjectArea) {
      toast.error("Please fill in the required fields");
      return;
    }

    const circle = {
      id: Date.now().toString(),
      name: newCircle.name,
      slug: newCircle.name.toLowerCase().replace(/ /g, "-"),
      description: newCircle.description,
      subjectArea: newCircle.subjectArea,
      memberCount: 1,
      postCount: 0,
      isFeatured: false,
      activities: [],
    };

    setCircles(prev => [circle, ...prev]);
    setJoinedCircles(prev => [...prev, circle.id]);
    setIsCreateOpen(false);
    setNewCircle({ name: "", subjectArea: "", description: "" });
    toast.success("Circle created successfully!");
  };

  const toggleJoin = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent card click
    setJoinedCircles(prev => {
      if (prev.includes(id)) {
        toast.info("Left circle");
        return prev.filter(cId => cId !== id);
      } else {
        toast.success("Joined circle!");
        trackAction('join_circle');
        return [...prev, id];
      }
    });
  };

  const filteredCircles = circles.filter(circle =>
    circle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    circle.subjectArea.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedCircle) {
    return (
      <div className="h-screen overflow-hidden flex flex-col bg-zinc-950 text-white">
        <Navbar />
        <main className="flex-1 mt-16 flex overflow-hidden">
          {/* Sidebar */}
          <aside className="w-80 border-r border-white/5 bg-zinc-900/50 hidden lg:flex flex-col">
            <div className="p-6">
              <Button
                variant="ghost"
                className="mb-6 p-0 hover:bg-transparent text-zinc-400 hover:text-white flex items-center gap-2"
                onClick={() => setSelectedCircleId(null)}
              >
                <ArrowLeft className="w-4 h-4" /> Back to Discover
              </Button>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center font-bold text-xl">
                  {selectedCircle.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-tight">{selectedCircle.name}</h2>
                  <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">{selectedCircle.subjectArea}</p>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                {selectedCircle.description}
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-2"><Users className="w-3 h-3" /> Members</span>
                  <span className="text-zinc-300 font-medium">{selectedCircle.memberCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-2"><MessageSquare className="w-3 h-3" /> Posts</span>
                  <span className="text-zinc-300 font-medium">{selectedCircle.postCount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Separator className="bg-white/5" />

            <div className="p-6 flex-1 overflow-auto">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Current Members</h3>
              <div className="space-y-4">
                {["Alice", "Bob", "Charlie", "David"].map((m, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border border-white/5">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m}`} />
                      <AvatarFallback>{m.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">{m}</span>
                      <span className="text-[10px] text-zinc-500">Active now</span>
                    </div>
                    {idx === 0 && <ShieldCheck className="w-3 h-3 text-indigo-400 ml-auto" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6">
              {!isJoined ? (
                <Button
                  onClick={(e) => toggleJoin(selectedCircle.id, e)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl"
                >
                  Join to Participate
                </Button>
              ) : (
                <Button
                  onClick={(e) => toggleJoin(selectedCircle.id, e)}
                  variant="outline"
                  className="w-full border-white/10 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 group h-12 rounded-xl"
                >
                  <span className="group-hover:hidden">Already Member</span>
                  <span className="hidden group-hover:inline">Leave Circle</span>
                </Button>
              )}
            </div>
          </aside>

          {/* Main Feed Area */}
          <section className="flex-1 flex flex-col relative bg-zinc-950 min-h-0 overflow-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden p-4 border-b border-white/5 flex items-center justify-between shrink-0">
              <Button variant="ghost" size="icon" onClick={() => setSelectedCircleId(null)}><ArrowLeft /></Button>
              <span className="font-bold">{selectedCircle.name}</span>
              <Button variant="ghost" size="icon"><Info /></Button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col-reverse">
              <div className="max-w-3xl mx-auto space-y-8 pb-12 w-full flex flex-col justify-end min-h-full">

                {/* Activity List (Reversed visually if needed, but here we just want it to fill from bottom?) 
                    Actually, if we want "messages push up", usually that implies `flex-col justify-end`.
                    Let's standard top-down but 'justify-end' so it starts at bottom if few messages.
                */}
                <div className="space-y-6">
                  {((isJoined ? selectedCircle.activities : selectedCircle.activities?.slice(0, 2)) || []).map((activity: any) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={activity.id}
                      className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border border-white/5 group-hover:scale-105 transition-transform">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user}`} />
                            <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-100">{activity.user}</span>
                              <span className="text-[10px] text-zinc-500">• {activity.timestamp}</span>
                            </div>
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{activity.type}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-zinc-500"><MoreVertical className="w-4 h-4" /></Button>
                      </div>

                      <p className="text-zinc-300 mb-6 leading-relaxed">
                        {activity.content}
                      </p>

                      <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                        <button className="flex items-center gap-2 text-zinc-500 hover:text-red-400 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-xs font-bold">{activity.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-zinc-500 hover:text-indigo-400 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs font-bold">{activity.comments}</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Empty State */}
                  {(!selectedCircle.activities || selectedCircle.activities.length === 0) && isJoined && (
                    <div className="py-20 text-center flex flex-col items-center justify-center bg-zinc-900/20 border border-dashed border-white/5 rounded-3xl">
                      <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 text-3xl animate-bounce">
                        👋
                      </div>
                      <h3 className="text-xl font-bold text-zinc-200 mb-2">No activity yet</h3>
                      <p className="text-zinc-500 text-sm max-w-xs mx-auto leading-relaxed">
                        Be the first to spark a conversation! Share a resource, ask a question, or just say hello to your fellow circle members.
                      </p>
                    </div>
                  )}

                  {!isJoined && (selectedCircle.activities?.length === 0) && (
                    <div className="py-12 text-center opacity-50 italic text-zinc-500">
                      This circle is brand new. Join to be the first one to post!
                    </div>
                  )}

                  {!isJoined && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-10 h-40 -bottom-8" />
                      <div className="bg-zinc-900/20 border border-dashed border-white/10 rounded-2xl p-12 text-center relative z-20 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                        <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold mb-2">Want to see more?</h3>
                        <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-6">
                          Join the {selectedCircle.name} circle to unlock full history, post your own resources, and chat with members.
                        </p>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleJoin(selectedCircle.id);
                          }}
                          className="bg-white text-black hover:bg-zinc-200 font-bold px-8 rounded-xl h-11"
                        >
                          Join Circle Now
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>


            {/* Interaction Bar - Only for Joined members */}
            <div className={cn(
              "p-4 border-t border-white/10 bg-zinc-950/80 backdrop-blur-xl transition-all",
              !isJoined && "opacity-50 pointer-events-none grayscale"
            )}>
              <div className="max-w-3xl mx-auto flex gap-4 items-center bg-zinc-900 border border-white/10 p-2 rounded-2xl focus-within:ring-2 ring-indigo-500/30">
                <Avatar className="w-8 h-8 border border-white/5 ml-2">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_metadata?.display_name || 'Guest'}`} />
                  <AvatarFallback>{user?.user_metadata?.display_name?.charAt(0) || 'G'}</AvatarFallback>
                </Avatar>
                <input
                  placeholder={isJoined ? "Share a thought, resource, or question..." : "Join this circle to post"}
                  className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-zinc-100"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  size="icon"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                  onClick={handleSendMessage}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[9px] text-zinc-600 text-center mt-2 uppercase font-bold tracking-widest">
                Posting as {user?.user_metadata?.display_name || user?.email?.split('@')[0] || "Guest"}
              </p>
            </div>
          </section>
        </main>
      </div >
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 pb-16">
        {/* Premium Hero Section */}
        <section className="relative overflow-hidden bg-indigo-50/50 dark:bg-indigo-950/10 border-b border-border py-20 mb-12">
          <div className="absolute inset-0 pattern-grid opacity-[0.03] dark:opacity-[0.05]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <BackButton className="mb-8" />
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 animate-float">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-indigo-500 tracking-wide uppercase">Collaborative Learning</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">
                Study <span className="text-indigo-500">Circles</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-balance max-w-2xl leading-relaxed">
                Join deep-dive communities focused on specific subjects.
                Collaborate with thousands of students worldwide, share resources, and master topics together.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all font-semibold">
                      <Plus className="w-5 h-5" /> Start a New Circle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a Study Circle</DialogTitle>
                      <DialogDescription>
                        Start a community for a specific topic or subject.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Circle Name</Label>
                        <Input
                          id="name"
                          value={newCircle.name}
                          onChange={(e) => setNewCircle({ ...newCircle, name: e.target.value })}
                          placeholder="e.g., Advanced Physics Group"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="subject">Subject Area</Label>
                        <Input
                          id="subject"
                          value={newCircle.subjectArea}
                          onChange={(e) => setNewCircle({ ...newCircle, subjectArea: e.target.value })}
                          placeholder="e.g., Physics"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newCircle.description}
                          onChange={(e) => setNewCircle({ ...newCircle, description: e.target.value })}
                          placeholder="What will this circle discuss?"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreate} className="w-full bg-indigo-600 text-white">Initialize Circle</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <div className="flex items-center gap-3 px-4 py-2 bg-background/50 backdrop-blur-sm border border-border rounded-full self-start">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-background bg-success text-[10px] flex items-center justify-center text-white font-bold">12k+</div>
                  </div>
                  <span className="text-xs font-medium">Students currently active</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative mb-12 group max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
            <Input
              placeholder="Search by topic or subject area..."
              className="pl-12 h-14 bg-background shadow-sm border-border/60 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-2xl text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredCircles.map((circle, index) => {
                const isJoined = joinedCircles.includes(circle.id);
                // Simulate "live" activity for demo purposes on specific circles or randomly
                const isLive = index === 0 || index === 3 || circle.name.includes("Physics");

                return (
                  <motion.div
                    key={circle.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => setSelectedCircleId(circle.id)}
                    className="cursor-pointer relative group"
                  >
                    {/* Live Pulse Effect for Unjoined Circles */}
                    {!isJoined && isLive && (
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl opacity-30 group-hover:opacity-60 blur transition-all animate-pulse-glow" />
                    )}

                    <CircleCard {...circle}>
                      <div className="flex gap-3 relative z-10">
                        <Button
                          variant={isJoined ? "outline" : "default"}
                          className={cn(
                            "flex-1 h-12 gap-2 transition-all rounded-xl font-semibold",
                            isJoined
                              ? "border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isJoined) {
                              toggleJoin(circle.id);
                            }
                            setSelectedCircleId(circle.id);
                          }}
                        >
                          {isJoined ? (
                            <>
                              <Check className="w-4 h-4" /> Already a Member
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" /> Join & Enter
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-12 w-12 rounded-xl border border-border/40"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCircleId(circle.id);
                          }}
                        >
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Button>
                      </div>

                      {/* Live Badge overlay */}
                      {!isJoined && isLive && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full animate-pulse">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          Live Activity
                        </div>
                      )}
                    </CircleCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredCircles.length === 0 && (
            <div className="text-center py-24 flex flex-col items-center">
              <Sparkles className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No circles found matching your search</h3>
              <p className="text-muted-foreground">Try a different keyword or create your own circle to start the conversation!</p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="mt-6 border-indigo-500 text-indigo-500 hover:bg-indigo-500/10"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
