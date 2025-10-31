'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Home, Users, Wallet, FileText } from 'lucide-react';
import { useCollection, useFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { useMemo } from 'react';

// Function to get the start of the day for a given date
function getStartOfDay(date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
}


export default function OverviewCards() {
  const { firestore } = useFirebase();

  const villasQuery = useMemoFirebase(() => firestore ? collection(firestore, 'villas') : null, [firestore]);
  const { data: villas } = useCollection(villasQuery);

  const personnelQuery = useMemoFirebase(() => firestore ? collection(firestore, 'personnel') : null, [firestore]);
  const { data: personnel } = useCollection(personnelQuery);
  
  const documentsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'documents') : null, [firestore]);
  const { data: documents } = useCollection(documentsQuery);

  const oneMonthAgoTimestamp = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return Timestamp.fromDate(getStartOfDay(date));
  }, []);

  const monthlyIncomeQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'financial_transactions'),
        where('type', '==', 'income'),
        where('date', '>=', oneMonthAgoTimestamp)
    );
  }, [firestore, oneMonthAgoTimestamp]);
  const { data: monthlyIncome } = useCollection(monthlyIncomeQuery);

  const totalIncome = monthlyIncome?.reduce((acc, tx) => acc + tx.amount, 0) || 0;

  const overviewData = [
    {
      title: 'تعداد ویلاها',
      value: villas?.length.toLocaleString('fa-IR') ?? '۰',
      icon: Home,
      change: '',
      changeType: 'increase',
    },
    {
      title: 'پرسنل',
      value: personnel?.length.toLocaleString('fa-IR') ?? '۰',
      icon: Users,
      change: '',
      changeType: 'increase',
    },
    {
      title: 'درآمد ماهانه',
      value: `${totalIncome.toLocaleString('fa-IR')} تومان`,
      icon: Wallet,
      change: '',
      changeType: 'increase',
    },
    {
      title: 'مدارک',
      value: documents?.length.toLocaleString('fa-IR') ?? '۰',
      icon: FileText,
      change: '',
      changeType: 'increase',
    },
  ];


  return (
    <>
      {overviewData.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{card.value}</div>
            {card.change && (
                <p className="text-xs text-muted-foreground">{card.change}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}
