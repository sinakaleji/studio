'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Home, Users, ArrowUp, ArrowDown, Wallet, Briefcase } from 'lucide-react';
import { useCollection, useFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { useMemo } from 'react';

export default function OverviewCards() {
  const { firestore } = useFirebase();

  const villasQuery = useMemoFirebase(() => firestore ? collection(firestore, 'villas') : null, []);
  const { data: villas } = useCollection(villasQuery);

  const personnelQuery = useMemoFirebase(() => firestore ? collection(firestore, 'personnel') : null, []);
  const { data: personnel } = useCollection(personnelQuery);
  
  const transactionsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'financial_transactions') : null, []);
  const { data: transactions } = useCollection(transactionsQuery);

  const { totalIncome, totalExpense, netProfit } = useMemo(() => {
    if (!transactions) return { totalIncome: 0, totalExpense: 0, netProfit: 0 };
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
        totalIncome: income,
        totalExpense: expense,
        netProfit: income - expense
    };
  }, [transactions]);


  const overviewData = [
    {
      title: 'تعداد ویلاها',
      value: villas?.length.toLocaleString('fa-IR') ?? '۰',
      icon: Home,
    },
    {
      title: 'پرسنل',
      value: personnel?.length.toLocaleString('fa-IR') ?? '۰',
      icon: Users,
    },
    {
      title: 'کل درآمد',
      value: totalIncome.toLocaleString('fa-IR'),
      icon: ArrowUp,
    },
     {
      title: 'کل هزینه',
      value: totalExpense.toLocaleString('fa-IR'),
      icon: ArrowDown,
    },
  ];

  return (
    <>
      {overviewData.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
