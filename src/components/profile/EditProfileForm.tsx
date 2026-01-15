import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X, Linkedin, Github, Globe } from "lucide-react";

interface EditProfileFormProps {
    formData: any;
    setFormData: (data: any) => void;
    avatarPreview: string | null;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    newSkill: string;
    setNewSkill: (skill: string) => void;
    addSkill: () => void;
    removeSkill: (skill: string) => void;
    handleUpdate: () => void;
}

export function EditProfileForm({
    formData,
    setFormData,
    avatarPreview,
    handleFileChange,
    newSkill,
    setNewSkill,
    addSkill,
    removeSkill,
    handleUpdate
}: EditProfileFormProps) {

    const getInitials = (name: string) => {
        return name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) || "ST";
    };

    return (
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="text-2xl">Edit Profile</DialogTitle>
                <DialogDescription>
                    Update your academic persona and public details.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                {/* Avatar Upload Section */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group cursor-pointer">
                        <Avatar className="w-24 h-24 border-4 border-muted">
                            <AvatarImage src={avatarPreview || formData.avatarUrl} className="object-cover" />
                            <AvatarFallback className="text-2xl">{getInitials(formData.displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                        <Input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleFileChange}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">Tap to change profile picture</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                            id="name"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="major">Major / Field</Label>
                        <Input
                            id="major"
                            value={formData.major}
                            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                            placeholder="e.g. Comp Sci"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="university">University</Label>
                    <Input
                        id="university"
                        value={formData.university}
                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                        placeholder="e.g. Stanford University"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about your academic journey..."
                        className="h-24 resize-none"
                    />
                </div>

                <div className="grid gap-2">
                    <Label>Skills & Interests</Label>
                    <div className="flex gap-2">
                        <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Add a skill (e.g. Python)"
                            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <Button type="button" onClick={addSkill} size="icon">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.skills.map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="px-2 py-1 gap-1">
                                {skill}
                                <X
                                    className="w-3 h-3 cursor-pointer hover:text-destructive"
                                    onClick={() => removeSkill(skill)}
                                />
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Social Links</Label>
                    <div className="relative">
                        <Linkedin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="LinkedIn URL" value={formData.socials.linkedin} onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, linkedin: e.target.value } })} />
                    </div>
                    <div className="relative">
                        <Github className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="GitHub URL" value={formData.socials.github} onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, github: e.target.value } })} />
                    </div>
                    <div className="relative">
                        <Globe className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="Portfolio / Website" value={formData.socials.portfolio} onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, portfolio: e.target.value } })} />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleUpdate} className="w-full sm:w-auto">Save Changes</Button>
            </DialogFooter>
        </DialogContent>
    );
}
