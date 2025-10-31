'use client'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useCollection, useFirebase } from '@/firebase';
import { collection, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';


type Transaction = {
    id: string;
    type: 'income' | 'expense';
    date: Timestamp;
    amount: number;
    description: string;
};
  

export default function RecentActivity() {
    const { firestore } = useFirebase();

    const transactionsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'financial_transactions'), orderBy('date', 'desc'), limit(5));
      }, [firestore]);
    
    const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>فعالیت‌های اخیر</CardTitle>
                    <CardDescription>آخرین تراکنش‌های مالی ثبت شده</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/finance">
                        مشاهده همه
                        <ArrowRight className="mr-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p>در حال بارگذاری فعالیت‌ها...</p>
                ) : !transactions || transactions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">هیچ فعالیتی برای نمایش وجود ندارد.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center">
                               <Avatar className={cn("h-9 w-9", tx.type === 'income' ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800')}>
                                    <AvatarFallback className={cn("text-sm", tx.type === 'income' ? 'text-green-600 dark:text-green-200' : 'text-red-600 dark:text-red-200')}>
                                        {tx.type === 'income' ? 'د' : 'هـ'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="mr-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{tx.description}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(tx.date.seconds * 1000).toLocaleDateString('fa-IR', {day: 'numeric', month: 'long'})}
                                    </p>
                                </div>
                                <div className={cn("mr-auto font-medium", tx.type === 'income' ? 'text-green-600' : 'text-red-600')}>
                                    {tx.type === 'income' ? '+' : '-'}
                                    {tx.amount.toLocaleString('fa-IR')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
