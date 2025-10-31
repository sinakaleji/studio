import { Home, Users, Wallet, FileText } from 'lucide-react';

export const overviewCards = [
  {
    title: 'تعداد ویلاها',
    value: '۷۴',
    icon: Home,
    change: '+۲.۵٪',
    changeType: 'increase',
  },
  {
    title: 'پرسنل',
    value: '۱۲',
    icon: Users,
    change: '۱ جدید',
    changeType: 'increase',
  },
  {
    title: 'درآمد ماهانه',
    value: '۱۲۰،۰۰۰،۰۰۰ تومان',
    icon: Wallet,
    change: '-۵.۲٪',
    changeType: 'decrease',
  },
  {
    title: 'مدارک جدید',
    value: '۳',
    icon: FileText,
    change: '+۱.۰٪',
    changeType: 'increase',
  },
];

export const recentActivities = [
    {
        name: 'علی احمدی',
        description: 'پرداخت شارژ ماهانه',
        amount: '+۵۰۰،۰۰۰ تومان',
        type: 'income',
    },
    {
        name: 'شرکت باغبانی سبز',
        description: 'هزینه نگهداری فضای سبز',
        amount: '-۲،۵۰۰،۰۰۰ تومان',
        type: 'expense',
    },
    {
        name: 'زهرا حسینی',
        description: 'پرداخت هزینه تعمیرات',
        amount: '+۱،۲۰۰،۰۰۰ تومان',
        type: 'income',
    },
    {
        name: 'حقوق پرسنل',
        description: 'پرداخت حقوق ماهانه',
        amount: '-۵۵،۰۰۰،۰۰۰ تومان',
        type: 'expense',
    },
];

export const user = {
    name: "مدیر سیستم",
    email: "admin@sina-estate.com",
    avatar: "https://picsum.photos/seed/avatar1/100/100"
}
