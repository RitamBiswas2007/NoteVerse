import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Download,
    Bookmark,
    ThumbsUp,
    MessageSquare,
    Share2,
    FileText,
    Star,
    MoreHorizontal,
    X
} from "lucide-react";
import { useState } from "react";
import { DialogClose } from "@/components/ui/dialog";

interface NoteDetailProps {
    title: string;
    subject: string;
    author: string;
    university?: string;
    country?: string;
    upvotes: number;
    tags?: string[];
    description?: string; // Optional description
}

export function NoteDetailModal({
    title,
    subject,
    author,
    university,
    upvotes: initialUpvotes,
    tags,
    description
}: NoteDetailProps) {
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleUpvote = () => {
        if (hasUpvoted) {
            setUpvotes(upvotes - 1);
            setHasUpvoted(false);
        } else {
            setUpvotes(upvotes + 1);
            setHasUpvoted(true);
        }
    };

    const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

    // Mock Data for the prototype
    const comments = [
        { id: 1, user: "Alex M.", text: "This was super helpful for my midterms! specially the chain rule part.", time: "2h ago" },
        { id: 2, user: "Ben K.", text: "Can you clarify page 3? The formula seems slightly different from the textbook.", time: "5h ago" },
        { id: 3, user: "Sarah J.", text: "Great summary! downloading this.", time: "1d ago" },
    ];

    const highlights = [
        "Comprehensive breakdown of core concepts",
        "Step-by-step example problems",
        "Cheatsheet included at the end",
        "Verified for accuracy by 3 peers"
    ];

    return (
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden glass-card border-none shadow-2xl">
            {/* Header Section */}
            <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md z-10">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{subject}</Badge>
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" /> Top Rated
                            </Badge>
                        </div>
                        <DialogTitle className="text-2xl font-display font-bold mb-1">{title}</DialogTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Avatar className="w-5 h-5">
                                    <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">{getInitials(author)}</AvatarFallback>
                                </Avatar>
                                {author}
                            </span>
                            <span>•</span>
                            <span>{university || "NoteVerse Univ"}</span>
                            <span>•</span>
                            <span>Updated 2 days ago</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setIsSaved(!isSaved)}>
                            <Bookmark className={`w-5 h-5 ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Share2 className="w-5 h-5 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                        </Button>
                        <DialogClose asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive">
                                <X className="w-5 h-5" />
                            </Button>
                        </DialogClose>
                    </div>
                </div>
            </div>

            {/* Main Content Split View */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left: PDF Preview */}
                <div className="flex-1 bg-muted/20 p-6 flex flex-col justify-center items-center relative group">
                    <div className="aspect-[3/4] h-full max-h-[600px] w-auto bg-white shadow-xl rounded-sm flex flex-col items-center justify-center p-12 text-center transition-transform duration-300 group-hover:scale-[1.01]">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                            <FileText className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{title} preview.pdf</h3>
                        <p className="text-gray-500 max-w-xs">
                            This is a preview of the document. Download to view the full 12 pages content including diagrams and formulas.
                        </p>
                        <Button className="mt-8 bg-gradient-primary shadow-glow hover:shadow-xl hover:-translate-y-1 transition-all">
                            <Download className="w-4 h-4 mr-2" /> Download Full PDF
                        </Button>
                    </div>
                </div>

                {/* Right: Sidebar (Highlights & Comments) */}
                <div className="w-[350px] border-l border-white/10 bg-background/50 backdrop-blur-sm flex flex-col">
                    <ScrollArea className="flex-1">
                        <div className="p-6 space-y-8">

                            {/* Highlights */}
                            <section>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Star className="w-4 h-4 text-accent" /> Key Highlights
                                </h4>
                                <ul className="space-y-2">
                                    {highlights.map((h, i) => (
                                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                            <span className="text-primary">•</span> {h}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <Separator className="bg-white/10" />

                            {/* Comments */}
                            <section>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-blue-400" /> Discussion ({comments.length})
                                </h4>
                                <div className="space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="bg-white/5 rounded-lg p-3 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm font-medium">{comment.user}</span>
                                                <span className="text-xs text-muted-foreground">{comment.time}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{comment.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <Button variant="outline" className="w-full text-xs h-8">View all comments</Button>
                                </div>
                            </section>

                        </div>
                    </ScrollArea>

                    {/* Sticky Action Footer */}
                    <div className="p-4 border-t border-white/10 bg-background/80 backdrop-blur-xl">
                        <Button
                            className={`w-full h-12 text-lg font-semibold transition-all duration-300 ${hasUpvoted
                                ? "bg-primary text-primary-foreground shadow-glow"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                            onClick={handleUpvote}
                        >
                            <ThumbsUp className={`w-5 h-5 mr-2 ${hasUpvoted ? "fill-current animate-bounce" : ""}`} />
                            {hasUpvoted ? "Upvoted" : "Upvote"}
                            <span className="ml-2 px-2 py-0.5 bg-black/10 rounded-full text-sm">
                                {upvotes}
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </DialogContent>
    );
}
