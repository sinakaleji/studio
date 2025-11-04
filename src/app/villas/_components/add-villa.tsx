
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
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import type { Villa } from "@/lib/types";

interface AddVillaProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Villa, 'id' | 'mapPosition'> & { id?: string }) => void;
  villa: Villa | null;
}

export default function AddVilla({ isOpen, onOpenChange, onSave, villa }: AddVillaProps) {
  const [villaNumber, setVillaNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [contact, setContact] = useState("");
  const [isRented, setIsRented] = useState(false);
  const [tenantName, setTenantName] = useState("");
  const [tenantContact, setTenantContact] = useState("");

  useEffect(() => {
    if (villa) {
      setVillaNumber(villa.villaNumber.toString());
      setOwnerName(villa.ownerName);
      setContact(villa.contact || "");
      setIsRented(villa.isRented);
      setTenantName(villa.tenantName || "");
      setTenantContact(villa.tenantContact || "");
    } else {
      // Reset form for new entry
      setVillaNumber("");
      setOwnerName("");
      setContact("");
      setIsRented(false);
      setTenantName("");
      setTenantContact("");
    }
  }, [villa, isOpen]); // Rerun effect when dialog opens or villa data changes

  const handleSubmit = () => {
    // Basic validation
    if (!villaNumber || !ownerName) {
      // In a real app, show a toast or error message
      console.error("Villa number and owner name are required.");
      return;
    }
    onSave({
      id: villa?.id,
      villaNumber: parseInt(villaNumber, 10),
      ownerName,
      contact,
      isRented,
      tenantName: isRented ? tenantName : "",
      tenantContact: isRented ? tenantContact : "",
    });
    onOpenChange(false); // Close dialog on save
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{villa ? "ویرایش ویلا" : "افزودن ویلا جدید"}</DialogTitle>
          <DialogDescription>
            اطلاعات ویلا و ساکنین آن را وارد کنید.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="villaNumber" className="text-right">
              شماره ویلا
            </Label>
            <Input id="villaNumber" type="number" value={villaNumber} onChange={e => setVillaNumber(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ownerName" className="text-right">
              نام مالک
            </Label>
            <Input id="ownerName" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact" className="text-right">
              تماس مالک
            </Label>
            <Input id="contact" value={contact} onChange={e => setContact(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isRented" className="text-right">
              اجاره داده شده؟
            </Label>
            <Switch id="isRented" checked={isRented} onCheckedChange={setIsRented} />
          </div>
          {isRented && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tenantName" className="text-right">
                  نام مستاجر
                </Label>
                <Input id="tenantName" value={tenantName} onChange={e => setTenantName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tenantContact" className="text-right">
                  تماس مستاجر
                </Label>
                <Input id="tenantContact" value={tenantContact} onChange={e => setTenantContact(e.target.value)} className="col-span-3" />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>ذخیره</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
