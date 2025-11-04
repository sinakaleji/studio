
"use client";

import Image from "next/image";
import type { Villa } from "@/lib/types";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { toPersianDigits } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SchematicMapProps {
  villas: Villa[];
  mapImageUrl: string;
}

const VillaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2L2 9.5V22h20V9.5L12 2z" />
  </svg>
);


export default function SchematicMap({ villas, mapImageUrl }: SchematicMapProps) {
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);

  const handleVillaClick = (villa: Villa) => {
    setSelectedVilla(villa);
  };

  return (
    <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden border">
      {mapImageUrl && (
        <Image
          src={mapImageUrl}
          alt="نقشه شماتیک شهرک"
          fill
          className="object-cover"
        />
      )}
      <div className="absolute inset-0">
        {villas.map((villa) => (
          <button
            key={villa.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ top: villa.mapPosition.top, left: villa.mapPosition.left }}
            onClick={() => handleVillaClick(villa)}
            aria-label={`ویلا شماره ${toPersianDigits(villa.villaNumber)}`}
          >
            <VillaIcon className="h-8 w-8 text-primary drop-shadow-md transition-transform group-hover:scale-125" />
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-card text-card-foreground px-2 py-1 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              ویلا {toPersianDigits(villa.villaNumber)}
            </span>
          </button>
        ))}
      </div>

      <Sheet open={!!selectedVilla} onOpenChange={(open) => !open && setSelectedVilla(null)}>
        <SheetContent>
          {selectedVilla && (
            <>
              <SheetHeader>
                <SheetTitle className="font-headline">اطلاعات ویلا شماره {toPersianDigits(selectedVilla.villaNumber)}</SheetTitle>
                <SheetDescription>
                  جزئیات مربوط به ویلا و ساکنین آن.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">مالک:</span>
                  <span className="font-semibold">{`${selectedVilla.ownerFirstName} ${selectedVilla.ownerLastName}`}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">شماره تماس:</span>
                    <span className="font-semibold">{selectedVilla.contact}</span>
                </div>
                 <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">وضعیت:</span>
                  {selectedVilla.isRented ? (
                    <Badge variant="destructive">اجاره</Badge>
                  ) : (
                    <Badge variant="secondary">مالک ساکن</Badge>
                  )}
                </div>
                {selectedVilla.isRented && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">مستاجر:</span>
                      <span className="font-semibold">{`${selectedVilla.tenantFirstName} ${selectedVilla.tenantLastName}`}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">تماس مستاجر:</span>
                      <span className="font-semibold">{selectedVilla.tenantContact}</span>
                    </div>
                  </>
                )}
              </div>
              <Button>ویرایش اطلاعات</Button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
