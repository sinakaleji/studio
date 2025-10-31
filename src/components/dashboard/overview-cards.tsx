import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { overviewCards } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function OverviewCards() {
    return (
        <>
        {overviewCards.map((card) => (
            <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold font-headline">{card.value}</div>
                <p 
                className={cn(
                    "text-xs text-muted-foreground",
                    card.changeType === "increase" ? "text-green-600" : "text-red-600"
                )}
                >
                {card.change} از ماه گذشته
                </p>
            </CardContent>
            </Card>
        ))}
        </>
    );
}
