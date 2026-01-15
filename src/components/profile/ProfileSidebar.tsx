import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { User, GraduationCap, Calendar, MapPin, Edit2, Linkedin, Github, Globe, Share2 } from "lucide-react";
import { format } from "date-fns";

interface ProfileSidebarProps {
    user: any;
    formData: any;
    onEditClick?: () => void;
    isEditing: boolean;
    onOpenChange: (open: boolean) => void;
    editDialogContent: React.ReactNode;
    isOwner: boolean;
}

export function ProfileSidebar({ user, formData, onEditClick, isEditing, onOpenChange, editDialogContent, isOwner }: ProfileSidebarProps) {
    const getInitials = (name: string) => {
        return name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) || "ST";
    };

    return (
        <div className="w-full lg:w-[350px] shrink-0 space-y-6">
            <Card className="shadow-2xl border-t-4 border-t-primary glass-card overflow-hidden">
                <CardContent className="pt-10 pb-8 flex flex-col items-center text-center relative">
                    <div className={`relative mb-6 ${isOwner ? "group cursor-pointer" : ""}`} onClick={() => isOwner && onOpenChange(true)}>
                        <div className={`absolute -inset-1 bg-gradient-primary rounded-full blur opacity-75 ${isOwner ? "group-hover:opacity-100" : "opacity-0"} transition duration-500 animate-tilt`} />
                        <Avatar className={`w-36 h-36 border-4 border-background relative shadow-lg ${isOwner ? "group-hover:scale-105" : ""} transition-transform duration-300`}>
                            <AvatarImage src={formData.avatarUrl || user.user_metadata?.avatar_url} className="object-cover" />
                            <AvatarFallback className="text-4xl font-display font-bold bg-muted text-primary">
                                {getInitials(formData.displayName || user.user_metadata?.display_name)}
                            </AvatarFallback>
                            {isOwner && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity duration-300">
                                    <Edit2 className="text-white w-8 h-8" />
                                </div>
                            )}
                        </Avatar>
                    </div>

                    <h1 className="text-3xl font-display font-bold mb-1 tracking-tight text-foreground">
                        {formData.displayName || user.user_metadata?.display_name || "Student"}
                    </h1>
                    <p className="text-base font-medium text-primary/80 mb-2">
                        {formData.major || user.user_metadata?.major || "Computer Science Major"}
                    </p>

                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
                        <GraduationCap className="w-4 h-4" />
                        <span>{formData.university || user.user_metadata?.university || "Add University"}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full animate-in slide-in-from-bottom-2 duration-500 delay-100">
                        {isOwner ? (
                            <Dialog open={isEditing} onOpenChange={onOpenChange}>
                                <DialogTrigger asChild>
                                    <Button className="flex-1 shadow-md hover:shadow-lg transition-all" variant="default">
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                </DialogTrigger>
                                {editDialogContent}
                            </Dialog>
                        ) : (
                            <Button className="flex-1 shadow-md hover:shadow-lg transition-all bg-gradient-primary">
                                Message
                            </Button>
                        )}

                        <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:text-primary transition-colors">
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Sidebar Footer Details */}
                    <div className="mt-8 w-full border-t pt-6 space-y-4">
                        <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <Calendar className="w-4 h-4 mr-3 text-primary" />
                            Joined {user.created_at ? format(new Date(user.created_at), 'MMMM yyyy') : 'Recently'}
                        </div>
                        {user.email && (
                            <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors truncate">
                                <User className="w-4 h-4 mr-3 text-primary" />
                                <span className="truncate">{user.email}</span>
                            </div>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <MapPin className="w-4 h-4 mr-3 text-primary" />
                            Global
                        </div>
                    </div>

                    {/* Social Icons Row */}
                    <div className="mt-8 flex justify-center gap-6">
                        {formData.socials?.linkedin ? (
                            <a href={formData.socials.linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#0077b5] transition-colors transform hover:scale-110">
                                <Linkedin className="w-6 h-6" />
                            </a>
                        ) : <Linkedin className="w-6 h-6 text-muted-foreground/30 cursor-not-allowed" />}

                        {formData.socials?.github ? (
                            <a href={formData.socials.github} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors transform hover:scale-110">
                                <Github className="w-6 h-6" />
                            </a>
                        ) : <Github className="w-6 h-6 text-muted-foreground/30 cursor-not-allowed" />}

                        {formData.socials?.portfolio ? (
                            <a href={formData.socials.portfolio} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors transform hover:scale-110">
                                <Globe className="w-6 h-6" />
                            </a>
                        ) : <Globe className="w-6 h-6 text-muted-foreground/30 cursor-not-allowed" />}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats Mobile only */}
            <div className="lg:hidden grid grid-cols-3 gap-2">
                <Card className="bg-primary/5 border-none text-center p-4">
                    <h3 className="font-bold text-xl text-primary">{formData.skills?.length || 0}</h3>
                    <p className="text-xs text-muted-foreground">Skills</p>
                </Card>
                {/* Simplified for demo */}
                <Card className="bg-primary/5 border-none text-center p-4">
                    <h3 className="font-bold text-xl text-primary">0</h3>
                    <p className="text-xs text-muted-foreground">Mates</p>
                </Card>
            </div>
        </div>
    );
}
