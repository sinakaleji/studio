'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCollection, useFirebase } from "@/firebase";
import { collection, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useMemoFirebase } from "@/firebase/provider";

type Activity = {
    id: string;
    description: string;
    date: Timestamp;
    amount: number;
    type: 'income' | 'expense';
};

export default function RecentActivity() {
    const { firestore } = useFirebase();

    const activitiesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'financial_transactions'), orderBy('date', 'desc'), limit(4));
    }, [firestore]);

    const { data: recentActivities, isLoading } = useCollection<Activity>(activitiesQuery);

    return (
        <Card>
            <CardHeader>
                <CardTitle>فعالیت‌های اخیر</CardTitle>
                <CardDescription>آخرین تراکنش‌های مالی ثبت شده</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <p>در حال بارگذاری...</p>
                ) : (
                recentActivities?.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-secondary text-secondary-foreground">{activity.description.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="text-sm font-medium leading-none">{activity.description}</p>
                            <p className="text-sm text-muted-foreground">
                                {activity.date ? new Date(activity.date.seconds * 1000).toLocaleDateString('fa-IR') : ''}
                            </p>
                        </div>
                        <div className={cn(
                            "font-medium",
                             activity.type === 'income' ? 'text-green-600' : 'text-red-600'
                        )}>
                            {activity.type === 'income' ? '+' : '-'}{activity.amount.toLocaleString('fa-IR')}
                        </div>
                    </div>
                ))
                )}
            </CardContent>
        </Card>
    );
}
