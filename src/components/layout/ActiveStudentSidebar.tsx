import { useState, useEffect } from "react";
import { Users, ChevronRight, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

// Mock data for "live" students
const mockActiveUsers = [
    { id: 1, name: "Sarah Chen", subject: "Quantum Physics", status: "Studying", avatar: "" },
    { id: 2, name: "Marcus Johnson", subject: "Calculus II", status: "In Flow", avatar: "" },
    { id: 3, name: "Jessica Wu", subject: "Organic Chem", status: "Reviewing", avatar: "" },
    { id: 4, name: "Alex Thompson", subject: "Economics", status: "Writing", avatar: "" },
    { id: 5, name: "Maria Garcia", subject: "Literature", status: "Reading", avatar: "" },
];

import { ChatWindow } from "@/components/chat/ChatWindow";

// ... existing code ...

export function ActiveStudentSidebar() {
    const [isOpen, setIsOpen] = useState(false); // Default closed
    const [activeCount, setActiveCount] = useState(12432);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatRecipient, setChatRecipient] = useState<{ name: string; status: string; avatar?: string } | null>(null);

    // Simulate active users fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveCount((prev) => prev + Math.floor(Math.random() * 10) - 3);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleConnect = (user: typeof mockActiveUsers[0]) => {
        setChatRecipient({
            name: user.name,
            status: user.subject, // Using subject as status for chat context
            avatar: user.avatar
        });
        setChatOpen(true);
        // Optional: Close sidebar on mobile or small screens? 
        // For now, keep it open as per "sidebar" nature.
    };

    return (
        <>
            <motion.div
                className="fixed right-0 top-24 z-50 flex items-start"
                initial={{ x: "calc(100% - 40px)" }}
                animate={{ x: isOpen ? 0 : "calc(100% - 40px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Arrow Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative h-16 w-10 bg-primary shadow-glow-sm flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors z-50 rounded-l-xl border-l border-y border-white/20"
                >
                    {isOpen ? (
                        <ChevronRight className="w-5 h-5 text-white" />
                    ) : (
                        <div className="flex flex-col items-center gap-1">
                            <Users className="w-4 h-4 text-white" />
                            <span className="text-[9px] font-bold text-white -rotate-90 whitespace-nowrap">Live</span>
                        </div>
                    )}
                </button>

                {/* Content Panel */}
                <div className="h-[450px] w-80 bg-background/95 backdrop-blur-md border border-l-border shadow-2xl rounded-l-2xl overflow-hidden flex flex-col">
                    {/* Header Section */}
                    <div className="p-5 border-b border-border/50 bg-muted/20">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-display font-bold text-sm flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                </span>
                                Community Pulse
                            </h3>
                            <span className="text-xs font-mono font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                {(activeCount / 1000).toFixed(1)}k Online
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Connect with peers studying similar topics right now.
                        </p>
                    </div>

                    {/* Active Users List */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-3">
                            {mockActiveUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all group">
                                    <div className="relative">
                                        <Avatar className="h-10 w-10 border border-border">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold truncate">{user.name}</h4>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <span className="truncate max-w-[80px] text-primary/80 font-medium">{user.subject}</span>
                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                                            <span>{user.status}</span>
                                        </div>
                                    </div>

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                                        onClick={() => handleConnect(user)}
                                        title="Message"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Footer */}
                    <div className="p-3 border-t border-border/50 bg-muted/10">
                        <Button variant="outline" className="w-full text-xs h-8 gap-2">
                            <Users className="w-3.5 h-3.5" /> View All 12k+ Students
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Chat Window */}
            {chatRecipient && (
                <ChatWindow
                    isOpen={chatOpen}
                    onClose={() => setChatOpen(false)}
                    recipient={chatRecipient}
                />
            )}
        </>
    );
}
