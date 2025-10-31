import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { recentActivities } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function RecentActivity() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>فعالیت‌های اخیر</CardTitle>
                <CardDescription>آخرین تراکنش‌های مالی ثبت شده</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-secondary text-secondary-foreground">{activity.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="text-sm font-medium leading-none">{activity.name}</p>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                        <div className={cn(
                            "font-medium",
                             activity.type === 'income' ? 'text-green-600' : 'text-red-600'
                        )}>
                            {activity.amount}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
