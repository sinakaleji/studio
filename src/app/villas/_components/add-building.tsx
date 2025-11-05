
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import type { Building } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface AddBuildingProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Building, 'id' | 'mapPosition'> & { id?: string }) => void;
  building: Building | null;
}

export default function AddBuilding({ isOpen, onOpenChange, onSave, building }: AddBuildingProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<Building['type'] | ''>('');
  const { toast } = useToast();

  useEffect(() => {
    if (building) {
      setName(building.name || "");
      setType(building.type || "");
    } else {
      setName("");
      setType("");
    }
  }, [building, isOpen]);

  const handleSubmit = () => {
    if (!name) {
      toast({ variant: "destructive", title: "خطا", description: "نام ساختمان الزامی است." });
      return;
    }
     if (!type) {
      toast({ variant: "destructive", title: "خطا", description: "نوع ساختمان را انتخاب کنید." });
      return;
    }
    onSave({
      id: building?.id,
      name,
      type: type as Building['type'],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{building ? "ویرایش ساختمان" : "افزودن ساختمان جدید"}</DialogTitle>
          <DialogDescription>
            اطلاعات ساختمان جدید را در اینجا وارد کنید.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              نام ساختمان
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              نوع
            </Label>
            <Select value={type} onValueChange={(value) => setType(value as Building['type'])}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="نوع ساختمان را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="security">نگهبانی</SelectItem>
                <SelectItem value="facility">تاسیسات</SelectItem>
                <SelectItem value="office">اداری</SelectItem>
                <SelectItem value="other">سایر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>ذخیره</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
