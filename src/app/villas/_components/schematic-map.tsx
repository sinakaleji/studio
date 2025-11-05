
"use client";

import Image from "next/image";
import type { Villa, Building, VillaOccupancyStatus } from "@/lib/types";
import { useState, useRef, type MouseEvent, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { toPersianDigits } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Shield, Wrench, Briefcase, Building2, Tag } from "lucide-react";

type MapItem = (Villa & { itemType: 'villa' }) | (Building & { itemType: 'building' });

interface SchematicMapProps {
  items: MapItem[];
  mapImageUrl: string;
  isEditMode: boolean;
  onItemMove: (itemId: string, position: { top: string; left: string }) => void;
  onEditVilla: (villa: Villa) => void;
  onEditBuilding: (building: Building) => void;
}

const itemIcons = {
    villa: Home,
    security: Shield,
    facility: Wrench,
    office: Briefcase,
    other: Building2
};

const ItemIcon = ({ item, ...props }: {item: MapItem} & React.SVGProps<SVGSVGElement>) => {
    const Icon = item.itemType === 'villa' ? itemIcons.villa : itemIcons[item.type];
    return <Icon {...props} />;
};

const occupancyStatusMap: { [key in VillaOccupancyStatus]: { text: string; variant: "default" | "secondary" | "destructive" | "outline" } } = {
  'owner-occupied': { text: 'مالک ساکن', variant: 'secondary' },
  'rented': { text: 'اجاره', variant: 'destructive' },
  'vacant': { text: 'خالی', variant: 'outline' },
};


export default function SchematicMap({ items, mapImageUrl, isEditMode, onItemMove, onEditVilla, onEditBuilding }: SchematicMapProps) {
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleItemClick = (item: MapItem) => {
    if (isEditMode) {
        if (item.itemType === 'villa') {
            onEditVilla(item);
        } else {
            onEditBuilding(item);
        }
    } else {
      if (item.itemType === 'villa') {
          setSelectedVilla(item);
      }
    }
  };
  
  const handleMouseDown = (e: MouseEvent<HTMLButtonElement>, itemId: string) => {
    if (!isEditMode || !mapRef.current) return;
    setDraggingItem(itemId);
    const buttonRect = e.currentTarget.getBoundingClientRect();
    
    offsetRef.current = {
      x: e.clientX - buttonRect.left,
      y: e.clientY - buttonRect.top
    };
    
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isEditMode || !draggingItem || !mapRef.current) return;
    
    const mapRect = mapRef.current.getBoundingClientRect();
    const snapThreshold = 1.5; // Snap within 1.5% of map dimensions

    let newX = e.clientX - mapRect.left - offsetRef.current.x;
    let newY = e.clientY - mapRect.top - offsetRef.current.y;
    
    let topPercent = Math.max(0, Math.min(100, (newY / mapRect.height) * 100));
    let leftPercent = Math.max(0, Math.min(100, (newX / mapRect.width) * 100));
    
    // Snap logic
    const otherItems = items.filter(item => item.id !== draggingItem);
    for (const otherItem of otherItems) {
        if (otherItem.mapPosition) {
            const otherTop = parseFloat(otherItem.mapPosition.top);
            const otherLeft = parseFloat(otherItem.mapPosition.left);

            // Snap vertically
            if (Math.abs(topPercent - otherTop) < snapThreshold) {
                topPercent = otherTop;
            }
            // Snap horizontally
            if (Math.abs(leftPercent - otherLeft) < snapThreshold) {
                leftPercent = otherLeft;
            }
        }
    }

    onItemMove(draggingItem, { top: `${topPercent}%`, left: `${leftPercent}%` });
  };
  
  const handleMouseUp = () => {
    if (!isEditMode) return;
    setDraggingItem(null);
  };
  
  const getItemLabel = (item: MapItem) => {
    if (item.itemType === 'villa') {
        return `ویلا ${toPersianDigits(item.villaNumber)}`;
    }
    return item.name;
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
          className="object-contain pointer-events-none"
        />
      )}
      <div className="absolute inset-0">
        {items.map((item) => (
          <button
            key={item.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 group ${isEditMode ? 'cursor-grab' : 'cursor-pointer'} ${draggingItem === item.id ? 'cursor-grabbing z-10' : ''}`}
            style={{ 
              top: item.mapPosition?.top || '50%', 
              left: item.mapPosition?.left || '50%',
            }}
            onClick={() => handleItemClick(item)}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
            aria-label={getItemLabel(item)}
          >
            <ItemIcon item={item} className={`h-6 w-6 text-primary drop-shadow-md transition-transform ${!isEditMode && 'group-hover:scale-125'}`} />
             <span className={`absolute -top-6 left-1/2 -translate-x-1/2 bg-card text-card-foreground px-2 py-1 text-xs rounded-md shadow-lg transition-opacity whitespace-nowrap ${isEditMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {getItemLabel(item)}
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
                    <span className="font-semibold">{toPersianDigits(selectedVilla.contact || '-')}</span>
                </div>
                 <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">وضعیت سکونت:</span>
                    <Badge variant={occupancyStatusMap[selectedVilla.occupancyStatus]?.variant || 'outline'}>
                        {occupancyStatusMap[selectedVilla.occupancyStatus]?.text || selectedVilla.occupancyStatus}
                    </Badge>
                </div>
                {selectedVilla.isForSale && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">وضعیت فروش:</span>
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        <Tag className="ml-1 h-3 w-3" />
                        برای فروش
                    </Badge>
                  </div>
                )}
                {selectedVilla.occupancyStatus === 'rented' && (
                  <>
                    <div className="flex justify-between items-center pt-4 border-t mt-2">
                      <span className="text-muted-foreground">مستاجر:</span>
                      <span className="font-semibold">{`${selectedVilla.tenantFirstName} ${selectedVilla.tenantLastName}`}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">تماس مستاجر:</span>
                      <span className="font-semibold">{toPersianDigits(selectedVilla.tenantContact || '-')}</span>
                    </div>
                  </>
                )}
              </div>
              <Button onClick={() => {
                onEditVilla(selectedVilla);
                setSelectedVilla(null);
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
