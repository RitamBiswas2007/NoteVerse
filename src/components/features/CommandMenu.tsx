import * as React from "react";
import {
    Settings,
    User,
    LayoutDashboard,
    BookOpen,
    Users,
    FileText,
    Plus
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { useNotes } from "@/hooks/useNotes";

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();
    const { notes } = useNotes();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        const toggleHandler = () => setOpen((prev) => !prev);

        document.addEventListener("keydown", down);
        window.addEventListener("open-command-menu", toggleHandler);

        return () => {
            document.removeEventListener("keydown", down);
            window.removeEventListener("open-command-menu", toggleHandler);
        };
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Suggestions">
                    <CommandItem onSelect={() => runCommand(() => navigate("/notes"))}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Create New Note</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/circles"))}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Find Study Circle</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/notes"))}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>My Notes</span>
                        <CommandShortcut>⌘N</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/circles"))}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Study Circles</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/profile"))}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                        <CommandShortcut>⌘P</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Recent Notes">
                    {notes?.slice(0, 5).map((note) => (
                        <CommandItem key={note.id} onSelect={() => runCommand(() => navigate(note.id.length < 5 ? `/notes` : `/notes/${note.id}`))}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>{note.title}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
