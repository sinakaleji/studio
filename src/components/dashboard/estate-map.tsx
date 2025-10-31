import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function EstateMap() {
    const mapImage = PlaceHolderImages.find(img => img.id === 'estate-map');

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>نقشه گرافیکی شهرک</CardTitle>
                <CardDescription>نمای کلی ویلاها و موقعیت آنها</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border">
                    {mapImage && (
                        <Image
                            src={mapImage.imageUrl}
                            alt={mapImage.description}
                            fill
                            className="object-cover"
                            data-ai-hint={mapImage.imageHint}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
            </CardContent>
        </Card>
    );
}
