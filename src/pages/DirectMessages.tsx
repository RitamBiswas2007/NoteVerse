import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Send, Search, Users, MessageSquare, Phone, Video, MoreVertical, Paperclip } from "lucide-react";
import { toast } from "sonner";

export default function DirectMessages() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();

    // Fetch Conversations (from messages AND connections)
    useEffect(() => {
        if (!user) return;

        const fetchConversations = async () => {
            setLoading(true);
            try {
                // 1. Fetch distinct partners from messages
                const { data: messages, error: msgError } = await supabase
                    .from('direct_messages' as any)
                    .select('sender_id, receiver_id, content, created_at, is_read')
                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                    .order('created_at', { ascending: false });

                // 2. Fetch connections (to add people I haven't messaged yet)
                const { data: connections, error: connError } = await supabase
                    .from('user_connections' as any)
                    .select(`
                        requester_id,
                        receiver_id,
                        status
                    `)
                    .eq('status', 'accepted')
                    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

                // 3. Aggregate unique users
                const userMap = new Map<string, any>();

                // Add connections first
                if (connections) {
                    connections.forEach((conn: any) => {
                        const partnerId = conn.requester_id === user.id ? conn.receiver_id : conn.requester_id;
                        userMap.set(partnerId, {
                            id: partnerId,
                            lastMessage: "Start chatting...",
                            time: null,
                            unread: 0
                        });
                    });
                }

                // Add/Update from messages
                if (messages) {
                    messages.forEach((msg: any) => {
                        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
                        const existing = userMap.get(partnerId);

                        // Since messages are ordered DESC, the first one we hit for a partner is the latest
                        if (!existing || (existing.time && new Date(msg.created_at) > new Date(existing.time)) || !existing.time) {
                            userMap.set(partnerId, {
                                id: partnerId,
                                lastMessage: msg.content,
                                time: msg.created_at,
                                unread: (msg.receiver_id === user.id && !msg.is_read) ? (existing?.unread || 0) + 1 : (existing?.unread || 0)
                            });
                        } else {
                            // Just increment unread if older message but unread
                            if (msg.receiver_id === user.id && !msg.is_read) {
                                existing.unread += 1;
                                userMap.set(partnerId, existing);
                            }
                        }
                    });
                }

                // 4. Fetch Profiles for all IDs
                const uniqueIds = Array.from(userMap.keys());
                if (uniqueIds.length > 0) {
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, display_name, avatar_url')
                        .in('id', uniqueIds);

                    if (profiles) {
                        const finalConversations = profiles.map(profile => {
                            const info = userMap.get(profile.id);
                            return {
                                id: profile.id,
                                name: profile.display_name || "Unknown User",
                                avatar: profile.avatar_url,
                                lastMessage: info.lastMessage,
                                lastSeen: info.time ? new Date(info.time).toLocaleDateString() : "New",
                                unread: info.unread,
                                rawTime: info.time // helper for sorting
                            };
                        });

                        // Sort by latest activity
                        finalConversations.sort((a, b) => {
                            if (!a.rawTime) return 1;
                            if (!b.rawTime) return -1;
                            return new Date(b.rawTime).getTime() - new Date(a.rawTime).getTime();
                        });

                        setConversations(finalConversations);
                    }
                } else {
                    setConversations([]);
                }

            } catch (err) {
                console.error("Error fetching conversations:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user]);

    // Auto-select user from URL
    useEffect(() => {
        const userIdFromUrl = searchParams.get('userId');
        if (userIdFromUrl && conversations.length > 0) {
            const exists = conversations.find(c => c.id === userIdFromUrl);
            if (exists) {
                setSelectedUserId(userIdFromUrl);
            }
        }
    }, [searchParams, conversations]);

    // Fetch Messages when a user is selected
    useEffect(() => {
        if (!user || !selectedUserId) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('direct_messages' as any)
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            if (data) setMessages(data);
        };

        fetchMessages();

        // Realtime Subscription
        const channel = supabase
            .channel('dm-global')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'direct_messages',
                    filter: `receiver_id=in.(${user.id},${selectedUserId})`
                },
                (payload) => {
                    // Start simple: verify either sender is other or sender is me
                    const msg = payload.new as any;
                    if (
                        (msg.sender_id === user.id && msg.receiver_id === selectedUserId) ||
                        (msg.sender_id === selectedUserId && msg.receiver_id === user.id)
                    ) {
                        setMessages(prev => [...prev, msg]);
                        // Scroll to bottom
                        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, selectedUserId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedUserId || !user) return;

        try {
            const { error } = await supabase
                .from('direct_messages' as any)
                .insert({
                    sender_id: user.id,
                    receiver_id: selectedUserId,
                    content: newMessage
                });

            if (error) throw error;
            setNewMessage("");

            // Optimistic update handled by subscription usually, but we can do it here too if needed
        } catch (error) {
            console.error(error);
            toast.error("Failed to send message");
        }
    };

    const selectedUser = conversations.find(c => c.id === selectedUserId);

    return (
        <div className="h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 flex overflow-hidden pt-16">
                {/* Sidebar - Conversation List */}
                <aside className="w-80 border-r border-border bg-card/50 hidden md:flex flex-col">
                    <div className="p-4 border-b border-border">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search messages..." className="pl-9 bg-background/50" />
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {conversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedUserId(conv.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                                        selectedUserId === conv.id ? "bg-primary/10 border border-primary/20" : "hover:bg-accent/50"
                                    )}
                                >
                                    <div className="relative">
                                        <Avatar>
                                            <AvatarImage src={conv.avatar} />
                                            <AvatarFallback>{conv.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="font-semibold text-sm truncate">{conv.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{conv.lastSeen}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                                    </div>
                                </button>
                            ))}
                            {conversations.length === 0 && !loading && (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    No connections yet. Go to 'Mates' to connect!
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </aside>

                {/* Chat Area */}
                <section className="flex-1 flex flex-col bg-background/50 relative">
                    {selectedUserId ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-card/30 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-9 h-9 border border-primary/20">
                                        <AvatarImage src={selectedUser?.avatar} />
                                        <AvatarFallback>{selectedUser?.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-sm flex items-center gap-2">
                                            {selectedUser?.name}
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        </h3>
                                        <p className="text-[10px] text-muted-foreground">Active now</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon"><Phone className="w-4 h-4 text-muted-foreground" /></Button>
                                    <Button variant="ghost" size="icon"><Video className="w-4 h-4 text-muted-foreground" /></Button>
                                    <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4 text-muted-foreground" /></Button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === user?.id;
                                    return (
                                        <div key={msg.id || idx} className={cn("flex gap-3 max-w-[80%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                                            {!isMe && (
                                                <Avatar className="w-8 h-8 mt-1">
                                                    <AvatarImage src={selectedUser?.avatar} />
                                                    <AvatarFallback>{selectedUser?.name[0]}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div
                                                className={cn(
                                                    "p-3 rounded-2xl text-sm leading-relaxed",
                                                    isMe
                                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                                        : "bg-muted border border-border rounded-tl-none"
                                                )}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-border bg-card/30">
                                <div className="flex items-center gap-2 max-w-4xl mx-auto bg-muted/50 p-2 rounded-2xl border border-white/5 focus-within:ring-1 ring-primary/30 transition-all">
                                    <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-primary"><Paperclip className="w-4 h-4" /></Button>
                                    <Input
                                        placeholder="Type a message..."
                                        className="border-none bg-transparent shadow-none focus-visible:ring-0 px-2"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <Button
                                        size="icon"
                                        className="rounded-xl shadow-glow"
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                            <div className="w-24 h-24 bg-accent/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <MessageSquare className="w-10 h-10 opacity-20" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Select a Conversation</h3>
                            <p className="max-w-xs text-center text-sm">Choose a connection from the sidebar to start chatting or find new mates.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
