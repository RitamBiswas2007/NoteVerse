import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    ThumbsUp,
    Bookmark,
    GitFork,
    Send,
    Download,
    Share2,
    Maximize2,
    Minimize2,
    MoreVertical,
    MessageSquare
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { INITIAL_NOTES, Note } from "@/hooks/useNotes";

export default function NoteDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [commentText, setCommentText] = useState("");
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isViewerMaximized, setIsViewerMaximized] = useState(false);

    // Fetch Note Details with Robust Fallback Strategy
    const { data: note, isLoading } = useQuery({
        queryKey: ["note", id],
        queryFn: async () => {
            // 1. Check Local/Initial Data First
            const storedNotesFn = localStorage.getItem("local_notes_data");
            const storedNotes = storedNotesFn ? JSON.parse(storedNotesFn) : [];
            const allNotes = [...storedNotes, ...INITIAL_NOTES];
            const foundNote = allNotes.find((n: any) => n.id === id || n.id === Number(id));

            if (foundNote) return foundNote as Note;

            // 2. If not found locally, try fetching from Supabase
            // Importing supabase dynamically or using the client if available
            const { supabase } = await import("@/integrations/supabase/client");
            const { data, error } = await supabase
                .from('peer_notes')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching note:", error);
                throw new Error("Note not found in database");
            }

            if (data) {
                const dbNote = data as any;
                // Map DB note to frontend Note interface
                return {
                    id: dbNote.id,
                    title: dbNote.title,
                    subject: dbNote.subject,
                    author: dbNote.author_name || "Anonymous",
                    userId: dbNote.author_id,
                    university: dbNote.university || "NoteVerse University",
                    country: dbNote.country || "Global",
                    upvotes: dbNote.upvotes || 0,
                    views: dbNote.views || 0,
                    tags: dbNote.tags || [],
                    created_at: dbNote.created_at,
                    created_at: dbNote.created_at,
                    file_url: (dbNote.files && dbNote.files.length > 0) ? dbNote.files[0].url : (dbNote.file_url || '#'),
                    files: dbNote.files || (dbNote.file_url ? [{ name: 'Document.pdf', url: dbNote.file_url }] : [])
                } as any;
            }

            throw new Error("Note not found");
        },
        retry: 1
    });

    // Mock Comments 
    const comments = [
        { id: 1, author: "Alex M.", text: "This helped me so much with the diffraction derivation!", time: "2h ago", initials: "AM" },
        { id: 2, author: "Sarah K.", text: "Could you add more examples for double-slit?", time: "1h ago", initials: "SK" },
    ];

    const handleUpvote = () => {
        setIsLiked(!isLiked);
        toast.success(isLiked ? "Removed upvote" : "Upvoted note!", {
            description: isLiked ? undefined : "Great choice! Your feedback helps others.",
        });
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
        toast.success(isSaved ? "Removed from library" : "Saved to library!", {
            description: isSaved ? undefined : "You can find this in your profile.",
        });
    };

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-cyan-400">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
                    <p className="animate-pulse text-sm font-medium tracking-widest uppercase">Loading Knowledge Base...</p>
                </div>
            </div>
        );
    }

    if (!note) {
        return (
            <div className="h-screen flex flex-col bg-slate-950 items-center justify-center text-white space-y-4">
                <h2 className="text-2xl font-bold text-white/50">Note Unavailable</h2>
                <Button onClick={() => navigate("/notes")} variant="secondary">Return to Nexus</Button>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden text-slate-100 selection:bg-cyan-500/30">

            {/* 1. Compact Header (Glass) */}
            <header className="h-16 shrink-0 border-b border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 z-50 relative">
                <div className="flex items-center gap-6">
                    <BackButton className="text-slate-400 hover:text-white transition-colors" />
                    <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-lg font-bold tracking-tight text-white leading-tight line-clamp-1 max-w-md">
                            {note.title}
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="font-medium text-cyan-400">{note.subject}</span>
                            <span>•</span>
                            <span>{new Date(note.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-slate-400 hover:text-white">
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px]">
                        <Avatar className="h-full w-full border-2 border-slate-950">
                            <AvatarFallback className="bg-slate-900 text-xs text-white">ME</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </header>

            {/* 2. Main Cinema Stage */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT: Viewer Stage (70-75%) */}
                <div className={`
                flex-1 bg-slate-900/50 relative flex flex-col group transition-all duration-500 ease-in-out
                ${isViewerMaximized ? 'fixed inset-0 z-[60] bg-slate-950' : ''}
            `}>

                    {/* Context Toolbar (Overlay) */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur border border-white/10 rounded-full px-4 py-2 flex items-center gap-4 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0 z-10">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
                            onClick={() => setIsViewerMaximized(prev => !prev)} // Toggle maximization
                        >
                            {isViewerMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </Button>
                        <div className="h-4 w-px bg-white/20"></div>
                        <Button variant="ghost" size="sm" className="h-8 text-xs gap-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10">
                            <Download className="w-3.5 h-3.5" />
                            Download PDF
                        </Button>
                    </div>

                    {/* The PDF Frame */}
                    <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-hidden">
                        <div className="w-full h-full max-w-5xl bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden relative ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-700 ease-out">
                            {(() => {
                                const url = note.file_url;
                                const hasFile = url && url !== '#';
                                const fileName = note.files?.[0]?.name || url || "";
                                const isPdf = fileName.toLowerCase().endsWith('.pdf') || (url?.toLowerCase().endsWith('.pdf'));
                                const isOffice = /\.(docx?|xlsx?|pptx?)$/i.test(fileName) || /\.(docx?|xlsx?|pptx?)$/i.test(url || "");

                                if (!hasFile) {
                                    return (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 space-y-4">
                                            <div className="w-20 h-24 border-4 border-slate-200 rounded flex items-center justify-center text-4xl">
                                                📄
                                            </div>
                                            <p className="font-medium text-slate-500">No Document Attached</p>
                                        </div>
                                    );
                                }

                                if (isPdf) {
                                    return (
                                        <iframe
                                            src={`${url}#toolbar=0&view=FitH`}
                                            className="w-full h-full border-none"
                                            title="PDF Viewer"
                                        />
                                    );
                                }

                                if (isOffice) {
                                    return (
                                        <iframe
                                            src={`https://docs.google.com/gview?url=${encodeURIComponent(url || "")}&embedded=true`}
                                            className="w-full h-full border-none"
                                            title="Office Viewer"
                                        />
                                    );
                                }

                                return (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 space-y-4">
                                        <div className="w-20 h-24 border-4 border-slate-200 rounded flex items-center justify-center text-4xl">
                                            ⬇️
                                        </div>
                                        <p className="font-medium text-slate-500">Preview Not Available</p>
                                        <Button onClick={() => window.open(url, '_blank')}>
                                            Download File
                                        </Button>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Sidebar (30-350px) */}
                <aside className="w-[380px] shrink-0 border-l border-white/5 bg-slate-950 flex flex-col z-20 shadow-2xl animate-in slide-in-from-right-10 duration-700 ease-out">

                    {/* Author Card - Premium Look */}
                    <div className="p-6 pb-4">
                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <Avatar className="h-14 w-14 border-2 border-white/10 shadow-lg">
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg">
                                    {note.author?.substring(0, 2).toUpperCase() || "AU"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 relative">
                                <h3 className="font-bold text-white truncate">{note.author}</h3>
                                <p className="text-xs text-slate-400 truncate mt-0.5">{note.university}</p>
                                <Badge variant="outline" className="mt-2 text-[10px] h-5 px-2 border-cyan-500/30 text-cyan-400 bg-cyan-950/30">
                                    Verified Scholar
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-white/5" />

                    {/* Chat / Context Area */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="px-6 py-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-cyan-400" />
                                Discussion
                            </h3>
                            <Badge variant="secondary" className="text-[10px] bg-white/5 text-slate-400 hover:bg-white/10">3 Comments</Badge>
                        </div>

                        <ScrollArea className="flex-1 px-6">
                            <div className="space-y-4 pb-4">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <Avatar className="h-8 w-8 mt-1 border border-white/10">
                                            <AvatarFallback className="bg-slate-800 text-[10px] text-slate-400">{comment.initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1.5 cursor-default group">
                                            <div className="flex items-baseline justify-between">
                                                <span className="text-xs font-semibold text-slate-300">{comment.author}</span>
                                                <span className="text-[10px] text-slate-500">{comment.time}</span>
                                            </div>
                                            <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                                {comment.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 pt-2">
                            <div className="relative group">
                                <input
                                    type="text"
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder:text-slate-600 transition-all shadow-inner"
                                    placeholder="Ask a question..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-1 top-1 h-8 w-8 text-cyan-500 hover:text-cyan-400 hover:bg-cyan-950/50 rounded-lg"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Floating Action Dock (Bottom of Sidebar) */}
                    <div className="p-6 bg-slate-950 border-t border-white/5 relative z-30">
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                size="lg"
                                className={`w-full relative overflow-hidden transition-all duration-300 ${isLiked ? 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10'}`}
                                onClick={handleUpvote}
                            >
                                <div className="flex items-center gap-2 relative z-10">
                                    <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current animate-bounce' : ''}`} />
                                    <span className="font-semibold">{note.upvotes + (isLiked ? 1 : 0)} Upvotes</span>
                                </div>
                            </Button>

                            <Button
                                size="lg"
                                className={`w-full transition-all duration-300 ${isSaved ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10'}`}
                                onClick={handleSave}
                            >
                                <div className="flex items-center gap-2">
                                    <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                                    <span className="font-semibold">{isSaved ? 'Saved' : 'Save'}</span>
                                </div>
                            </Button>
                        </div>

                        <div className="mt-4 flex justify-center">
                            <Button variant="link" className="text-xs text-slate-500 hover:text-cyan-400 gap-2">
                                <GitFork className="w-3 h-3" />
                                Remix this Note
                            </Button>
                        </div>
                    </div>

                </aside>
            </div>
        </div>
    );
}
