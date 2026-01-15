import { useState, useRef, useEffect } from "react";
import { X, Send, Paperclip, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    sender: 'user' | 'other';
    text: string;
    timestamp: Date;
}

interface ChatWindowProps {
    recipient: {
        name: string;
        avatar?: string;
        status: string;
    };
    onClose: () => void;
    isOpen: boolean;
}

export function ChatWindow({ recipient, onClose, isOpen }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            sender: "other",
            text: `Hi! I see you're studying ${recipient.status === "Studying" ? "too" : recipient.status.toLowerCase()}. Want to compare notes?`,
            timestamp: new Date(Date.now() - 1000 * 60)
        }
    ]);
    const [inputText, setInputText] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: inputText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText("");

        // Simulate reply
        setTimeout(() => {
            const replies = [
                "That's interesting! Tell me more.",
                "I was thinking the same thing.",
                "Let's focus for 25 minutes then chat?",
                "Do you have notes on Chapter 4?",
                "Nice!"
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: 'other',
                text: randomReply,
                timestamp: new Date()
            }]);
        }, 2000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-4 right-20 w-[350px] h-[450px] bg-background border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-3 border-b border-border bg-muted/40 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Avatar className="h-8 w-8 border border-border/50">
                                    <AvatarImage src={recipient.avatar} />
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                        {recipient.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold leading-none">{recipient.name}</h4>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{recipient.status}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5" ref={scrollRef}>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex flex-col max-w-[80%]",
                                    msg.sender === 'user' ? "ml-auto items-end" : "items-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-3 rounded-2xl text-sm shadow-sm",
                                        msg.sender === 'user'
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-card border border-border rounded-tl-none"
                                    )}
                                >
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-border bg-background">
                        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-full border border-border/40 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground shrink-0">
                                <Paperclip className="w-4 h-4" />
                            </Button>
                            <Input
                                className="flex-1 border-none shadow-none focus-visible:ring-0 h-8 bg-transparent px-2 text-sm"
                                placeholder="Type a message..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground shrink-0">
                                <Smile className="w-4 h-4" />
                            </Button>
                            <Button
                                size="icon"
                                className="h-8 w-8 rounded-full shrink-0"
                                onClick={handleSend}
                                disabled={!inputText.trim()}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
