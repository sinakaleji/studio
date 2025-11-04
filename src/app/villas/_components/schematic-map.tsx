
"use client";

import Image from "next/image";
import type { Villa } from "@/lib/types";
import { useState, useRef, type MouseEvent } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { toPersianDigits } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SchematicMapProps {
  villas: Villa[];
  mapImageUrl: string;
  isEditMode: boolean;
  onVillaMove: (villaId: string, position: { top: string; left: string }) => void;
  onEditVilla: (villa: Villa) => void;
}

const VillaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2L2 9.5V22h20V9.5L12 2z" />
  </svg>
);

export default function SchematicMap({ villas, mapImageUrl, isEditMode, onVillaMove, onEditVilla }: SchematicMapProps) {
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);
  const [draggingVilla, setDraggingVilla] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleVillaClick = (villa: Villa) => {
    if (!isEditMode) {
      setSelectedVilla(villa);
    }
  };
  
  const handleMouseDown = (e: MouseEvent<HTMLButtonElement>, villaId: string) => {
    if (!isEditMode || !mapRef.current) return;
    setDraggingVilla(villaId);
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const mapRect = mapRef.current.getBoundingClientRect();
    
    // Calculate offset from the top-left of the button itself, not the map
    offsetRef.current = {
      x: e.clientX - buttonRect.left,
      y: e.clientY - buttonRect.top
    };
    
    // Prevent default to avoid text selection, etc.
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isEditMode || !draggingVilla || !mapRef.current) return;
    
    const mapRect = mapRef.current.getBoundingClientRect();
    let newX = e.clientX - mapRect.left - offsetRef.current.x;
    let newY = e.clientY - mapRect.top - offsetRef.current.y;
    
    // Convert to percentage and clamp between 0% and 100%
    let topPercent = Math.max(0, Math.min(100, (newY / mapRect.height) * 100));
    let leftPercent = Math.max(0, Math.min(100, (newX / mapRect.width) * 100));
    
    onVillaMove(draggingVilla, { top: `${topPercent}%`, left: `${leftPercent}%` });
  };
  
  const handleMouseUp = () => {
    if (!isEditMode) return;
    setDraggingVilla(null);
  };

  return (
    <div 
      ref={mapRef}
      className={`relative w-full aspect-[3/2] rounded-lg overflow-hidden border ${isEditMode ? 'cursor-move' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves the map area
    >
      {mapImageUrl && (
        <Image
          src={mapImageUrl}
          alt="نقشه شماتیک شهرک"
          fill
          className="object-cover pointer-events-none" // Prevent image from interfering with mouse events
        />
      )}
      <div className="absolute inset-0">
        {villas.map((villa) => (
          <button
            key={villa.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 group ${isEditMode ? 'cursor-grab' : 'cursor-pointer'} ${draggingVilla === villa.id ? 'cursor-grabbing z-10' : ''}`}
            style={{ 
              top: villa.mapPosition?.top || '50%', 
              left: villa.mapPosition?.left || '50%',
            }}
            onClick={() => handleVillaClick(villa)}
            onMouseDown={(e) => handleMouseDown(e, villa.id)}
            aria-label={`ویلا شماره ${toPersianDigits(villa.villaNumber)}`}
          >
            <VillaIcon className={`h-8 w-8 text-primary drop-shadow-md transition-transform ${!isEditMode && 'group-hover:scale-125'}`} />
             <span className={`absolute -top-6 left-1/2 -translate-x-1/2 bg-card text-card-foreground px-2 py-1 text-xs rounded-md shadow-lg transition-opacity whitespace-nowrap ${isEditMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
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
              <Button onClick={() => {
                setSelectedVilla(null);
                onEditVilla(selectedVilla);
              }}>
                ویرایش اطلاعات
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
