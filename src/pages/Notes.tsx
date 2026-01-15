import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/layout/SEO";
import { NoteCard } from "@/components/cards/FeatureCards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/ui/BackButton";
import { cn } from "@/lib/utils";
import { Search, Filter, Plus, Upload, Loader2, Sparkles, SlidersHorizontal, ArrowUpDown, X, FileText, Share2 } from "lucide-react";
import { useActivity } from "@/hooks/useActivity";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNotes, Note } from "@/hooks/useNotes";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/ui/EmptyState";


const subjects = ["All", "Computer Science", "Chemistry", "Physics", "Economics", "Mathematics", "Biology", "Engineering", "Medicine"];
const sortOptions = [
  { label: "Most Recent", value: "recent" },
  { label: "Most Viewed", value: "views" },
  { label: "Highest Rated", value: "rating" },
];

export default function Notes() {
  const { user } = useAuth();
  const { trackAction } = useActivity();
  const [searchQuery, setSearchQuery] = useState("");
  // Removed debounced state for instant feedback
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("explore");

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const [newNote, setNewNote] = useState({
    title: "",
    subject: "",
    topic: "",
    tags: "",
  });

  // Fetch all notes (server side fetching all, client side filtering)
  const { notes, isLoading, uploadNote, isUploading, updateNote, deleteNote } = useNotes();

  // Filters & State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedEditFiles, setSelectedEditFiles] = useState<File[]>([]);
  const [sortBy, setSortBy] = useState("recent");
  const [selectedSubject, setSelectedSubject] = useState("All");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 3));
    }
  };

  const handleEditFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedEditFiles(prev => [...prev, ...newFiles].slice(0, 3));
    }
  };

  const handleUpload = async () => {
    if (!user) {
      toast.error("You must be logged in to upload notes");
      return;
    }
    if (!newNote.title || !newNote.subject) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Please add at least one file");
      return;
    }

    try {
      await uploadNote({
        title: newNote.title,
        subject: newNote.subject,
        topic: newNote.topic,
        tags: newNote.tags.split(",").map(t => t.trim()).filter(Boolean),
        files: selectedFiles
      });

      // Success handling moved here after await
      setIsUploadOpen(false);
      setNewNote({ title: "", subject: "", topic: "", tags: "" });
      setSelectedFiles([]);
      trackAction('create_note');

    } catch (error) {
      // Error is handled by the mutation's onError but we can add safety here
      console.error("Upload failed in component:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editingNote) return;
    updateNote(editingNote.id, {
      onSuccess: () => setIsEditOpen(false)
    });
  };

  const handleDelete = () => {
    if (!noteToDelete) return;
    deleteNote(noteToDelete, {
      onSuccess: () => setIsDeleteOpen(false)
    });
  };

  // Instant Client-Side Filtering & Sorting
  const filteredAndSortedNotes = (notes || [])
    .filter(note => {
      // Search Query
      const matchesSearch = !searchQuery || (
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      // Subject Filter
      const matchesSubject = selectedSubject === "All" || note.subject === selectedSubject;

      // Tab Filter (Fix for My Notes)
      const matchesTab = activeTab === "explore" ? true : (user && note.user_id === user.id);

      return matchesSearch && matchesSubject && matchesTab;
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      if (sortBy === "views") return (b.views || 0) - (a.views || 0);
      if (sortBy === "rating") return (b.upvotes || 0) - (a.upvotes || 0);
      return 0;
    });

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Study Notes Library"
        description="Access thousands of student-shared notes across Computer Science, Physics, Chemistry, and more. Find the best study materials faster."
        canonical="https://noteverse.app/notes"
      />
      <Navbar />
      <main className="flex-1 pt-16 pb-16">
        {/* Enhanced Hero Section */}
        <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 border-b border-border py-20 mb-8">
          <div className="absolute inset-0 pattern-dots opacity-40" />
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
                <div className="p-2 rounded-lg bg-primary/10 text-primary animate-float">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-primary tracking-wide uppercase">Knowledge Repository</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">
                Welcome to <span className="gradient-text">NoteVerse</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-balance max-w-2xl leading-relaxed">
                Unlock collaborative learning. Discover high-quality study materials,
                lecture notes, and research summaries shared by students and educators worldwide.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-gradient-primary gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold">
                      <Plus className="w-5 h-5" /> Contribution Guide
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden border-none p-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 -z-10" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary shadow-glow-sm" />

                    <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
                      <DialogHeader className="p-0">
                        <DialogTitle className="text-3xl font-display font-black tracking-tight flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Plus className="w-6 h-6" />
                          </div>
                          Knowledge <span className="gradient-text">Share</span>
                        </DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground/80 font-medium pt-2">
                          Contribute your materials to the NoteVerse repository.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-5">
                        <div className="grid gap-2">
                          <Label htmlFor="title" className="text-sm font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Note Title
                          </Label>
                          <Input
                            id="title"
                            value={newNote.title}
                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                            placeholder="e.g., Quantum Mechanics - Week 3 Summary"
                            className="h-12 bg-white/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 focus:ring-primary/20 focus:border-primary/50 transition-all rounded-xl"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="topic" className="text-sm font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Topic / Sub-topic
                          </Label>
                          <Input
                            id="topic"
                            value={newNote.topic}
                            onChange={(e) => setNewNote({ ...newNote, topic: e.target.value })}
                            placeholder="e.g., Wave Functions"
                            className="h-12 bg-white/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 focus:ring-primary/20 focus:border-primary/50 transition-all rounded-xl"
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="subject" className="text-sm font-bold flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent" /> Subject Area
                            </Label>
                            <Select
                              value={newNote.subject}
                              onValueChange={(value) => setNewNote({ ...newNote, subject: value })}
                            >
                              <SelectTrigger className="h-12 bg-white/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 rounded-xl">
                                <SelectValue placeholder="Select Area" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                                {subjects.filter(s => s !== "All").map((subject) => (
                                  <SelectItem key={subject} value={subject} className="rounded-lg focus:bg-primary/10">
                                    {subject}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="tags" className="text-sm font-bold flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-success" /> Key Topics
                            </Label>
                            <Input
                              id="tags"
                              value={newNote.tags}
                              onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                              placeholder="physics, quantum"
                              className="h-12 bg-white/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" /> Study Materials
                            </Label>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {selectedFiles.length} / 3 Files
                            </span>
                          </div>

                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx"
                            multiple
                          />

                          <AnimatePresence mode="popLayout">
                            {selectedFiles.length < 3 && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={() => fileInputRef.current?.click()}
                                className="group relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 bg-slate-50/50 dark:bg-slate-900/30"
                              >
                                <div className="p-4 rounded-2xl mb-3 bg-white dark:bg-slate-800 text-muted-foreground group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-sm group-hover:shadow-glow-sm">
                                  <Upload className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-bold">Drop files here or click</span>
                                <span className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-tight">PDF, DOCX accepted</span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="space-y-2 max-h-[180px] overflow-y-auto scrollbar-hide pr-1">
                            <AnimatePresence>
                              {selectedFiles.map((file, idx) => (
                                <motion.div
                                  key={`${file.name}-${idx}`}
                                  initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                  className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl group/file shadow-sm hover:shadow-md transition-all"
                                >
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-xs font-bold truncate pr-2">{file.name}</span>
                                      <span className="text-[9px] text-muted-foreground font-medium">READY FOR UPLOAD</span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full shrink-0 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 md:p-8 pt-0 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200/50 dark:border-slate-800/50">
                      <DialogFooter className="gap-3 sm:gap-0 mt-4">
                        <Button
                          variant="ghost"
                          onClick={() => setIsUploadOpen(false)}
                          disabled={isUploading}
                          className="rounded-xl font-bold text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-slate-800"
                        >
                          Review LATER
                        </Button>
                        <Button
                          onClick={handleUpload}
                          disabled={isUploading}
                          className="bg-gradient-primary shadow-glow hover:opacity-90 transition-all font-bold px-8 h-12 rounded-xl border-none"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Confirm Contribution"
                          )}
                        </Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="flex items-center gap-3 px-4 py-2 bg-background/50 backdrop-blur-sm border border-border rounded-full self-start">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-slate-200" />
                    ))}
                  </div>
                  <span className="text-xs font-medium">12k+ students active now</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Search and Discovery Tools */}
          <div className="space-y-6 mb-12">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="What would you like to learn today?"
                  className="pl-12 h-14 bg-background shadow-sm border-border/60 focus:border-primary/50 focus:ring-primary/20 rounded-2xl text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-14 rounded-2xl bg-background border-border/60">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="Sort" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" className="h-14 w-14 lg:w-auto px-0 lg:px-6 rounded-2xl gap-2 border-border/60">
                  <SlidersHorizontal className="w-5 h-5" />
                  <span className="hidden lg:inline">Filters</span>
                </Button>
                <Link to="/graph">
                  <Button variant="outline" className="h-14 w-14 lg:w-auto px-0 lg:px-6 rounded-2xl gap-2 border-border/60 ml-3">
                    <Share2 className="w-5 h-5 text-indigo-500" />
                    <span className="hidden lg:inline font-semibold text-indigo-500">Visualize</span>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="bg-background border border-border/60 p-1 rounded-xl h-11 w-full sm:w-auto">
                  <TabsTrigger value="explore" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Discover</TabsTrigger>
                  <TabsTrigger value="my-notes" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white">My Notes</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Subject:</span>
                <div className="flex-1 overflow-x-auto scrollbar-hide pb-2 mask-linear">
                  <div className="flex items-center gap-2">
                    {subjects.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => setSelectedSubject(subject)}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border animate-fade-in",
                          selectedSubject === subject
                            ? "bg-primary/10 text-primary border-primary"
                            : "bg-background text-muted-foreground border-border/60 hover:border-primary/40 hover:text-primary"
                        )}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes by title, subject, or tags (Case Insensitive)"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[280px] rounded-2xl bg-muted/50 animate-pulse border border-border/50" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  {...note}
                  searchQuery={searchQuery} // Pass query for highlighting
                />
              ))}
            </div>
          )}

          {!isLoading && filteredAndSortedNotes.length === 0 && (
            <EmptyState
              icon={FileText}
              title="No notes found"
              description={`We couldn't find any documents for "${searchQuery || selectedSubject}". Try adjusting your filters.`}
              actionLabel="Clear Search Filters"
              onAction={() => { setSearchQuery(""); setSelectedSubject("All"); }}
              className="mt-12 bg-muted/5 border-dashed"
            />
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Edit Note</DialogTitle>
            <DialogDescription>
              Update the details of your study material.
            </DialogDescription>
          </DialogHeader>
          {editingNote && (
            <div className="grid gap-6 py-6 border-y border-border/50 my-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-title" className="text-sm font-semibold">Note Title</Label>
                <Input
                  id="edit-title"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="bg-muted/30"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-subject" className="text-sm font-semibold">Subject Area</Label>
                  <Select
                    value={editingNote.subject}
                    onValueChange={(value) => setEditingNote({ ...editingNote, subject: value })}
                  >
                    <SelectTrigger className="bg-muted/30">
                      <SelectValue placeholder="Select Area" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.filter(s => s !== "All").map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-tags" className="text-sm font-semibold">Tags</Label>
                  <Input
                    id="edit-tags"
                    value={Array.isArray(editingNote.tags) ? editingNote.tags.join(", ") : editingNote.tags}
                    onChange={(e) => setEditingNote({ ...editingNote, tags: e.target.value as any })}
                    placeholder="physics, quantum"
                    className="bg-muted/30"
                  />
                </div>
              </div>

              <div className="grid gap-4">
                <Label className="text-sm font-semibold">Study Materials (Total: {((editingNote?.files?.length || 0) + selectedEditFiles.length)}/3)</Label>
                <input
                  type="file"
                  ref={editFileInputRef}
                  className="hidden"
                  onChange={handleEditFileChange}
                  accept=".pdf,.doc,.docx"
                  multiple
                />

                {((editingNote?.files?.length || 0) + selectedEditFiles.length) < 3 && (
                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer group border-border hover:border-primary/50 hover:bg-muted/50"
                  >
                    <div className="p-2.5 rounded-full mb-2 bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium">Add more files</span>
                  </div>
                )}

                <div className="space-y-2">
                  {/* Current Files */}
                  {editingNote?.files?.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted/40 border border-border rounded-lg">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs truncate">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (editingNote) {
                            const newFiles = editingNote.files.filter((_, i) => i !== idx);
                            setEditingNote({ ...editingNote, files: newFiles });
                          }
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}

                  {/* New pending files */}
                  {selectedEditFiles.map((file, idx) => (
                    <motion.div
                      key={`new-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-2 bg-primary/10 border border-primary/30 rounded-lg"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold truncate">{file.name}</span>
                          <span className="text-[8px] text-primary uppercase font-black tracking-tighter">New Upload</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-primary hover:text-destructive"
                        onClick={() => setSelectedEditFiles(prev => prev.filter((_, i) => i !== idx))}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} className="bg-gradient-primary">
              Update Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your note from the repository.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div >

  );
}
