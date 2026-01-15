import { useState, useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThoughtCard } from "@/components/cards/FeatureCards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/ui/BackButton";
import { Search, Plus, Sparkles, Lightbulb, List, Network, MessageSquare, TrendingUp, Clock, Send, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { IdeaConstellation } from "@/components/visualizations/IdeaConstellation";

interface Thought {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  clarityVotes: number;
  originalityVotes: number;
  tags: string[];
  isFeatured: boolean;
  timestamp?: number;
}

interface Comment {
  id: string;
  thoughtId: string;
  author: string;
  content: string;
  timestamp: number;
}

const initialMockThoughts: Thought[] = [
  {
    id: "1",
    title: "Why Newton's Laws Fail at Quantum Scale",
    content: "Classical mechanics assumes continuous trajectories, but quantum mechanics reveals that particles don't have definite positions until measured. In the macroscopic world, Newton's laws provide an incredibly accurate approximation of how objects move. However, as we zoom into the atomic and sub-atomic scales, these laws break down completely. \n\nFor instance, the concept of a 'trajectory'—a clear path from point A to point B—doesn't exist for an electron. Instead, we have to deal with probability clouds and wave functions. The Heisenberg Uncertainty Principle dictates that we cannot know both the position and momentum of a particle with absolute precision. This fundamental fuzziness is not a measurement error, but a core property of nature itself.",
    author: "Alex M.",
    category: "question",
    clarityVotes: 89,
    originalityVotes: 72,
    tags: ["physics", "quantum"],
    isFeatured: true,
    timestamp: Date.now() - 1000000
  },
  {
    id: "2",
    title: "A New Approach to Teaching Recursion",
    content: "Most students struggle with recursion because we teach it wrong. Instead of starting with factorial or Fibonacci series, which are abstract mathematical concepts, we should begin with visual tree structures or filesystem directories. \n\nImagine asking a student to find a file in a folder that contains sub-folders. They intrinsically understand they need to look in the current folder, then 'recurse' into each sub-folder. This maps perfectly to depth-first search. By anchoring recursion in a spatial/navigational mental model first, we can separate the concept of 'self-reference' from the confusion of 'mathematical induction'. I've tested this with 30 freshman students and saw a 40% improvement in their ability to solve subsequent tree-traversal problems compared to the control group taught via factorial.",
    author: "Priya S.",
    category: "idea",
    clarityVotes: 156,
    originalityVotes: 134,
    tags: ["education", "programming"],
    isFeatured: false,
    timestamp: Date.now() - 500000
  },
  {
    id: "3",
    title: "The Future of Online Examinations",
    content: "Current proctoring systems are invasive and unreliable, often flagging innocent behavior like looking away from the screen as 'suspicious'. This creates an adversarial relationship between educators and students. Here's my proposal for a trust-based examination system that actually works: Open-ended, synthesis-based questions that cannot be Googled.\n\nInstead of asking 'What year was the Bastille stormed?', ask 'Compare the socio-economic drivers of the Storming of the Bastille with a modern political protest of your choice.' AI can help grade these by checking for semantic relevance and argument structure, but the core assessment shifts from memory retrieval (cheatable) to critical thinking (hard to cheat without being obvious). We need to stop fighting technology and start designing assessments that assume access to information is the default state.",
    author: "Chen W.",
    category: "discussion",
    clarityVotes: 67,
    originalityVotes: 91,
    tags: ["education", "exams"],
    isFeatured: false,
    timestamp: Date.now() - 200000
  },
];

const categories = ["All", "question", "idea", "discussion", "research"];

export default function Thoughts() {
  const [thoughts, setThoughts] = useLocalStorage<Thought[]>("noteverse-thoughts-v2", initialMockThoughts);
  const [comments, setComments] = useLocalStorage<Record<string, Comment[]>>("noteverse-thought-comments", {});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const [sortMode, setSortMode] = useState<'trending' | 'latest'>('trending');
  const [votedThoughts, setVotedThoughts] = useLocalStorage<Record<string, { clarity: boolean; originality: boolean }>>("noteverse-thoughts-votes", {});

  // Detail View State
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [newComment, setNewComment] = useState("");

  const [newThought, setNewThought] = useState({
    title: "",
    category: "",
    content: "",
    tags: "",
  });

  const handleShare = () => {
    if (!newThought.title || !newThought.category || !newThought.content) {
      toast.error("Please fill in the required fields");
      return;
    }

    const thought: Thought = {
      id: Date.now().toString(),
      title: newThought.title,
      content: newThought.content,
      author: "You",
      category: newThought.category,
      clarityVotes: 0,
      originalityVotes: 0,
      tags: newThought.tags.split(",").map(t => t.trim()).filter(Boolean),
      isFeatured: false,
      timestamp: Date.now(),
    };

    setThoughts([thought, ...thoughts]);
    setIsShareOpen(false);
    setNewThought({ title: "", category: "", content: "", tags: "" });
    toast.success("Thought shared successfully!");
  };

  const handleVote = (id: string, type: 'clarity' | 'originality') => {
    const currentVotes = votedThoughts[id] || { clarity: false, originality: false };
    if (currentVotes[type]) {
      toast.info(`You already voted for ${type}`);
      return;
    }

    const updatedThoughts = thoughts.map(t => {
      if (t.id === id) {
        return {
          ...t,
          [`${type}Votes`]: t[type === 'clarity' ? 'clarityVotes' : 'originalityVotes'] + 1
        };
      }
      return t;
    });

    setThoughts(updatedThoughts);
    setVotedThoughts({
      ...votedThoughts,
      [id]: { ...currentVotes, [type]: true }
    });
    // Dont show toast on list view vote to avoid spam, or show small one
    toast.success(`Voted for ${type}!`);
  };

  const handleAddComment = () => {
    if (!selectedThought || !newComment.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      thoughtId: selectedThought.id,
      author: "You",
      content: newComment,
      timestamp: Date.now(),
    };

    setComments(prev => ({
      ...prev,
      [selectedThought.id]: [...(prev[selectedThought.id] || []), newCommentObj]
    }));

    setNewComment("");
    toast.success("Comment added!");
  };

  const filteredThoughts = useMemo(() => {
    const result = thoughts.filter(thought => {
      const matchesSearch = thought.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thought.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thought.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || thought.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sorting
    if (sortMode === 'latest') {
      result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } else {
      // Trending: simple algorithm (votes)
      result.sort((a, b) => (b.clarityVotes + b.originalityVotes) - (a.clarityVotes + a.originalityVotes));
    }

    return result;
  }, [thoughts, searchQuery, selectedCategory, sortMode]);

  const currentComments = selectedThought ? (comments[selectedThought.id] || []) : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton className="mb-6" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-display font-bold">ThinkEdu</h1>
              <p className="text-muted-foreground">Share your academic thoughts and ideas</p>
            </div>

            <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border border-border/40 self-start md:self-auto">
              <Button
                size="sm"
                variant={sortMode === 'trending' ? 'secondary' : 'ghost'}
                onClick={() => setSortMode('trending')}
                className="gap-2 rounded-lg text-xs"
              >
                <TrendingUp className="w-3.5 h-3.5" /> Trending
              </Button>
              <Button
                size="sm"
                variant={sortMode === 'latest' ? 'secondary' : 'ghost'}
                onClick={() => setSortMode('latest')}
                className="gap-2 rounded-lg text-xs"
              >
                <Clock className="w-3.5 h-3.5" /> Latest
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border border-border/40">
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="gap-2 rounded-lg"
              >
                <List className="w-4 h-4" /> List
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'graph' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('graph')}
                className="gap-2 rounded-lg"
              >
                <Network className="w-4 h-4" /> Constellation
              </Button>
            </div>

            <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary gap-2 shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4" /> Share Thought
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Share a Thought</DialogTitle>
                  <DialogDescription>
                    Spark a discussion or share a new idea.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newThought.title}
                      onChange={(e) => setNewThought({ ...newThought, title: e.target.value })}
                      placeholder="e.g., A new perspective on..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newThought.category}
                      onValueChange={(value) => setNewThought({ ...newThought, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c !== "All").map((c) => (
                          <SelectItem key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newThought.content}
                      onChange={(e) => setNewThought({ ...newThought, content: e.target.value })}
                      placeholder="Share your detailed thoughts..."
                      className="min-h-[150px]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={newThought.tags}
                      onChange={(e) => setNewThought({ ...newThought, tags: e.target.value })}
                      placeholder="research, question, theory"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleShare}>Post Thought</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search thoughts..."
                className="pl-10 max-w-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "capitalize",
                    selectedCategory === cat && "bg-gradient-primary"
                  )}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {filteredThoughts.map((thought) => {
                const votes = votedThoughts[thought.id] || { clarity: false, originality: false };
                const commentCount = (comments[thought.id] || []).length;
                return (
                  <ThoughtCard
                    key={thought.id}
                    {...thought}
                    className="h-full"
                    onClick={() => setSelectedThought(thought)}
                  >
                    <div className="flex gap-2 items-center mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn("flex-1 gap-2 h-8 text-xs", votes.clarity && "text-primary bg-primary/10")}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(thought.id, 'clarity');
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Clarity
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn("flex-1 gap-2 h-8 text-xs", votes.originality && "text-primary bg-primary/10")}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(thought.id, 'originality');
                        }}
                      >
                        <Lightbulb className="w-3.5 h-3.5" /> Originality
                      </Button>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2 px-2">
                        <MessageSquare className="w-3.5 h-3.5" /> {commentCount}
                      </div>
                    </div>
                  </ThoughtCard>
                );
              })}
            </div>
          ) : (
            <div className="animate-fade-in">
              <IdeaConstellation
                thoughts={filteredThoughts}
                onThoughtClick={(thought) => setSelectedThought(thought)}
              />
            </div>
          )}

          {filteredThoughts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No thoughts found matching your search.
            </div>
          )}

          {/* Detailed View Sheet */}
          <Sheet open={!!selectedThought} onOpenChange={(open) => !open && setSelectedThought(null)}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
              {selectedThought && (
                <>
                  <SheetHeader className="mb-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary/10 flex items-center justify-center text-2xl border border-primary/20">
                        {selectedThought.category === 'question' ? '❓' :
                          selectedThought.category === 'idea' ? '💡' :
                            selectedThought.category === 'discussion' ? '💬' : '📝'}
                      </div>
                      <div className="flex-1">
                        <SheetTitle className="text-xl mb-1">{selectedThought.title}</SheetTitle>
                        <SheetDescription className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{selectedThought.author}</span>
                          <span>•</span>
                          <span className="capitalize">{selectedThought.category}</span>
                          {selectedThought.timestamp && (
                            <>
                              <span>•</span>
                              <span>{new Date(selectedThought.timestamp).toLocaleDateString()}</span>
                            </>
                          )}
                        </SheetDescription>
                      </div>
                    </div>
                  </SheetHeader>

                  <div className="space-y-6">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="leading-relaxed whitespace-pre-wrap">{selectedThought.content}</p>
                    </div>

                    {/* Vote Stats in Header */}
                    <div className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                      <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-primary">{selectedThought.clarityVotes}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Clarity Votes</div>
                      </div>
                      <div className="w-px bg-border/50" />
                      <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-primary">{selectedThought.originalityVotes}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Originality</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedThought.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="border-t border-border pt-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Discussion ({currentComments.length})
                      </h3>

                      <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {currentComments.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                            No comments yet. Be the first to add your perspective!
                          </div>
                        ) : (
                          currentComments.map((comment, i) => (
                            <div key={i} className="flex gap-3 text-sm group">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 bg-muted/30 p-3 rounded-2xl rounded-tl-sm">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-semibold text-xs">{comment.author}</span>
                                  <span className="text-[10px] text-muted-foreground">{new Date(comment.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-muted-foreground">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Add to the discussion..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                          className="flex-1"
                        />
                        <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>

        </div>
      </main>
      <Footer />
    </div>
  );
}
