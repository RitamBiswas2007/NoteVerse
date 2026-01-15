import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/ui/BackButton";
import { Textarea } from "@/components/ui/textarea";
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
import {
    Folder,
    Plus,
    FileText,
    Search,
    NotebookPen,
    Trash2,
    MoreVertical,
    Calendar,
    Tag
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PersonalFolder {
    id: string;
    name: string;
    color: string;
}

interface PersonalNote {
    id: string;
    title: string;
    content: string;
    folderId: string;
    tags: string[];
    createdAt: string;
}

const DEFAULT_FOLDERS: PersonalFolder[] = [];

const HighlightText = ({ text, highlight }: { text: string; highlight?: string }) => {
    if (!highlight || !highlight.trim()) {
        return <span>{text}</span>;
    }
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <mark key={i} className="bg-yellow-200 text-inherit rounded px-0.5">{part}</mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
};

export default function PersonalNotes() {
    const [folders, setFolders] = useLocalStorage<PersonalFolder[]>("personal-folders-v4", DEFAULT_FOLDERS);
    const [notes, setNotes] = useLocalStorage<PersonalNote[]>("personal-notes-v4", []);

    const [selectedFolderId, setSelectedFolderId] = useState<string>(folders.length > 0 ? folders[0].id : "");
    const [searchQuery, setSearchQuery] = useState("");

    const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

    // New Item States
    const [newFolder, setNewFolder] = useState("");
    const [newNote, setNewNote] = useState({
        title: "",
        content: "",
        folderId: "",
        tags: "",
    });

    const handleCreateFolder = () => {
        if (!newFolder.trim()) {
            toast.error("Folder name cannot be empty");
            return;
        }

        const folder: PersonalFolder = {
            id: Date.now().toString(),
            name: newFolder,
            color: "bg-indigo-500", // Default color for new folders
        };

        const updatedFolders = [...folders, folder];
        setFolders(updatedFolders);

        // If this is the first folder, select it
        if (folders.length === 0) {
            setSelectedFolderId(folder.id);
            setNewNote(prev => ({ ...prev, folderId: folder.id }));
        }

        setNewFolder("");
        setIsCreateFolderOpen(false);
        toast.success("Folder created!");
    };

    const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        // Move notes to trash or nowhere? For now, let's keep logic but effectively "hiding" them if no folder
        // Or if we strictly follow "remove folder", the notes in it are orphans. 
        // Let's delete the notes inside it or leave them orphaned (not visible).
        // Best UX: Warn or move. Here we just delete for simplicity as per "remove folder" request context?
        // Actually, previous logic tried to move them. If no target folder, we can't move.
        const targetFolder = folders.find(f => f.id !== id);

        if (targetFolder) {
            const notesToMove = notes.filter(n => n.folderId === id);
            if (notesToMove.length > 0) {
                const updatedNotes = notes.map(n => n.folderId === id ? { ...n, folderId: targetFolder.id } : n);
                setNotes(updatedNotes);
                toast.info(`Moved ${notesToMove.length} notes to ${targetFolder.name}`);
            }
        } else {
            // Deleting the last folder: orphan the notes (or delete them)
            // Let's delete them to be clean since "Every folder" implies wiping structure.
            const notesToDelete = notes.filter(n => n.folderId === id);
            if (notesToDelete.length > 0) {
                setNotes(notes.filter(n => n.folderId !== id));
                toast.info(`Deleted ${notesToDelete.length} notes in folder`);
            }
        }

        setFolders(folders.filter(f => f.id !== id));
        if (selectedFolderId === id) {
            setSelectedFolderId(targetFolder ? targetFolder.id : "");
        }
    };

    const handleCreateNote = () => {
        if (!newNote.title.trim()) {
            toast.error("Note title is required");
            return;
        }
        if (!newNote.folderId || newNote.folderId === "") {
            if (folders.length > 0) {
                // Auto-assign to current selection
                newNote.folderId = selectedFolderId;
            } else {
                toast.error("Please create a folder first");
                return;
            }
        }

        const note: PersonalNote = {
            id: Date.now().toString(),
            title: newNote.title,
            content: newNote.content,
            folderId: newNote.folderId || selectedFolderId,
            tags: newNote.tags.split(",").map(t => t.trim()).filter(Boolean),
            createdAt: new Date().toLocaleDateString(),
        };

        setNotes([note, ...notes]);
        setNewNote({ title: "", content: "", folderId: selectedFolderId, tags: "" });
        setIsCreateNoteOpen(false);
        toast.success("Note created!");
    };

    const handleDeleteNote = (id: string) => {
        setNotes(notes.filter(n => n.id !== id));
        toast.success("Note deleted");
    };

    const filteredNotes = notes.filter(note => {
        if (!selectedFolderId) return false;
        const matchesFolder = note.folderId === selectedFolderId;
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesFolder && matchesSearch;
    });

    const currentFolder = folders.find(f => f.id === selectedFolderId);

    return (
        <div className="min-h-screen flex flex-col bg-muted/10">
            <Navbar />
            <main className="flex-1 pt-24 pb-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <BackButton className="mb-6" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
                                <NotebookPen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-display font-bold">Your Notes</h1>
                                <p className="text-muted-foreground">Manage your personal workspace</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Folder className="w-4 h-4" /> New Folder
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Folder</DialogTitle>
                                        <DialogDescription>
                                            Organize your notes into folders.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="folder-name">Folder Name</Label>
                                            <Input
                                                id="folder-name"
                                                value={newFolder}
                                                onChange={(e) => setNewFolder(e.target.value)}
                                                placeholder="e.g., Physics Project"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleCreateFolder}>Create Folder</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={isCreateNoteOpen} onOpenChange={setIsCreateNoteOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 transition-opacity gap-2 shadow-md"
                                        disabled={folders.length === 0}
                                    >
                                        <Plus className="w-4 h-4" /> Create Note
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                    <DialogHeader>
                                        <DialogTitle>Create Personal Note</DialogTitle>
                                        <DialogDescription>
                                            Capture your thoughts safely.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="note-title">Title</Label>
                                            <Input
                                                id="note-title"
                                                value={newNote.title}
                                                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                                placeholder="Note Title"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="note-folder">Folder</Label>
                                            <Select
                                                value={newNote.folderId || selectedFolderId}
                                                onValueChange={(value) => setNewNote({ ...newNote, folderId: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select folder" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {folders.map(folder => (
                                                        <SelectItem key={folder.id} value={folder.id}>
                                                            {folder.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="note-tags">Tags (optional)</Label>
                                            <Input
                                                id="note-tags"
                                                value={newNote.tags}
                                                onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                                                placeholder="work, ideas, draft"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="note-content">Content</Label>
                                            <Textarea
                                                id="note-content"
                                                value={newNote.content}
                                                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                                placeholder="Write your note here..."
                                                className="min-h-[200px]"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleCreateNote}>Save Note</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Folders Section */}
                    {folders.length > 0 ? (
                        <div className="mb-8">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">Folders</h2>
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {folders.map((folder) => {
                                    const isActive = selectedFolderId === folder.id;
                                    const count = notes.filter(n => n.folderId === folder.id).length;
                                    const isMatch = searchQuery && folder.name.toLowerCase().includes(searchQuery.toLowerCase());

                                    return (
                                        <div
                                            key={folder.id}
                                            onClick={() => setSelectedFolderId(folder.id)}
                                            className={cn(
                                                "min-w-[160px] p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-md relative group",
                                                isActive
                                                    ? "bg-background border-border shadow-md"
                                                    : "bg-card/50 border-border hover:border-primary/50",
                                                isMatch && !isActive && "ring-2 ring-yellow-400 bg-yellow-50/10"
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <Folder className={cn(
                                                    "w-8 h-8 transition-colors",
                                                    isActive ? "text-primary fill-primary/10" : "text-muted-foreground group-hover:text-primary",
                                                    isMatch && !isActive && "text-yellow-600"
                                                )} />

                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                        onClick={(e) => handleDeleteFolder(folder.id, e)}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <h3 className={cn("font-medium truncate", isActive ? "text-foreground" : "text-muted-foreground")}>
                                                <HighlightText text={folder.name} highlight={searchQuery} />
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1">{count} notes</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-12 text-center py-12 border-2 border-dashed border-border/60 rounded-2xl bg-muted/5">
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Folder className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                            <h2 className="text-lg font-semibold mb-2">No folders yet</h2>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Create your first folder to start organizing your personal notes.</p>
                            <Button onClick={() => setIsCreateFolderOpen(true)} variant="outline">
                                <Plus className="w-4 h-4 mr-2" /> Create Folder
                            </Button>
                        </div>
                    )}

                    {/* Search Bar - Only show if we have folders */}
                    {folders.length > 0 && (
                        <div className="relative mb-8 max-w-lg">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={`Search folders or notes in ${currentFolder?.name || '...'}`}
                                className="pl-10 bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Notes Grid */}
                    {folders.length > 0 && (
                        filteredNotes.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredNotes.map((note) => (
                                    <div
                                        key={note.id}
                                        className="group p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 rounded-lg bg-primary/5 text-primary">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDeleteNote(note.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <h3 className="text-xl font-bold font-display mb-2 line-clamp-1">
                                            <HighlightText text={note.title} highlight={searchQuery} />
                                        </h3>
                                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                                            {note.content ? <HighlightText text={note.content} highlight={searchQuery} /> : "No content"}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {note.tags.map((tag, i) => (
                                                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                                                    <Tag className="w-3 h-3" /> <HighlightText text={tag} highlight={searchQuery} />
                                                </span>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground mt-auto">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {note.createdAt}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full bg-muted">Private</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-card/50 rounded-2xl border border-dashed border-border/50">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <NotebookPen className="w-8 h-8 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No notes here yet</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                                    Create your first note in <span className="font-medium text-foreground">{currentFolder?.name}</span> to get started.
                                </p>
                                <Button onClick={() => setIsCreateNoteOpen(true)} className="bg-gradient-to-r from-violet-600 to-indigo-600">
                                    <Plus className="w-4 h-4 mr-2" /> Create First Note
                                </Button>
                            </div>
                        ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}


