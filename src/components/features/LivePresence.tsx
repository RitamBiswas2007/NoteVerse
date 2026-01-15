import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

interface Peer {
    id: string;
    name: string;
    color: string;
    image?: string;
}

const MOCK_PEERS = [
    { name: "Alice", color: "bg-red-500" },
    { name: "Bob", color: "bg-blue-500" },
    { name: "Charlie", color: "bg-green-500" },
    { name: "David", color: "bg-yellow-500" },
    { name: "Eve", color: "bg-purple-500" },
];

export function LivePresence({ noteId }: { noteId: string }) {
    const { user } = useAuth();
    const [peers, setPeers] = useState<Peer[]>([]);

    useEffect(() => {
        // Initial random peers (simulate 1-4 active users)
        const initialCount = Math.floor(Math.random() * 4) + 1;
        const initialPeers = Array.from({ length: initialCount }).map((_, i) => ({
            id: `peer-${i}`,
            name: MOCK_PEERS[i].name,
            color: MOCK_PEERS[i].color
        }));
        setPeers(initialPeers);

        // Simulate random join/leave events
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                setPeers(current => {
                    const shouldAdd = Math.random() > 0.5 && current.length < 5;
                    if (shouldAdd) {
                        const newPeerIdx = Math.floor(Math.random() * MOCK_PEERS.length);
                        const newPeer = {
                            id: `peer-${Date.now()}`,
                            name: MOCK_PEERS[newPeerIdx].name,
                            color: MOCK_PEERS[newPeerIdx].color
                        };
                        return [...current, newPeer];
                    } else if (current.length > 0) {
                        return current.slice(0, -1);
                    }
                    return current;
                });
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [noteId]);

    const activePeers = [...peers];
    if (user) {
        // Ensure user is not duplicated if we were doing real presence, 
        // but for now we just show others + maybe user indicator elsewhere.
    }

    return (
        <div className="flex items-center -space-x-2">
            <AnimatePresence>
                {activePeers.map((peer, i) => (
                    <TooltipProvider key={peer.id}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    initial={{ scale: 0, opacity: 0, x: -10 }}
                                    animate={{ scale: 1, opacity: 1, x: 0 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="relative z-10 border-2 border-zinc-950 rounded-full"
                                    style={{ zIndex: 10 - i }}
                                >
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback className={`${peer.color} text-[10px] text-white font-bold`}>
                                            {peer.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-zinc-800 text-zinc-200 border-zinc-700 text-xs">
                                <p>{peer.name} is viewing</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </AnimatePresence>
            {activePeers.length > 0 && (
                <div className="pl-4 text-xs text-zinc-500 font-medium">
                    {activePeers.length} online
                </div>
            )}
        </div>
    );
}
