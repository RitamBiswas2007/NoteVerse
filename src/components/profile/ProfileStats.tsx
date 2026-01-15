import { Card, CardContent } from "@/components/ui/card";
import { Trophy, BookOpen, Users } from "lucide-react";

interface ProfileStatsProps {
    notesCount: number;
    circlesCount: number;
    karma: number | null | undefined;
}

export function ProfileStats({ notesCount, circlesCount, karma }: ProfileStatsProps) {
    const stats = [
        { label: "Reputation", value: karma !== null && karma !== undefined ? karma.toString() : "Private", icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Shared Notes", value: notesCount.toString(), icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Circles Joined", value: circlesCount.toString(), icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
    ];

    return (
        <div className="hidden lg:grid grid-cols-3 gap-6 mb-8">
            {stats.map((stat, i) => (
                <Card key={i} className="hover:shadow-lg transition-all duration-300 border hover:border-primary/20 group">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{stat.label}</p>
                            <h3 className="text-3xl font-bold mt-1 tracking-tight">{stat.value}</h3>
                        </div>
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
