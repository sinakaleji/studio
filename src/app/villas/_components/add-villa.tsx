
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
  const [ownerFirstName, setOwnerFirstName] = useState("");
  const [ownerLastName, setOwnerLastName] = useState("");
  const [contact, setContact] = useState("");
  const [isRented, setIsRented] = useState(false);
  const [tenantFirstName, setTenantFirstName] = useState("");
  const [tenantLastName, setTenantLastName] = useState("");
  const [tenantContact, setTenantContact] = useState("");

  useEffect(() => {
    if (villa) {
      setVillaNumber(villa.villaNumber.toString());
      setOwnerFirstName(villa.ownerFirstName);
      setOwnerLastName(villa.ownerLastName);
      setContact(villa.contact || "");
      setIsRented(villa.isRented);
      setTenantFirstName(villa.tenantFirstName || "");
      setTenantLastName(villa.tenantLastName || "");
      setTenantContact(villa.tenantContact || "");
    } else {
      // Reset form for new entry
      setVillaNumber("");
      setOwnerFirstName("");
      setOwnerLastName("");
      setContact("");
      setIsRented(false);
      setTenantFirstName("");
      setTenantLastName("");
      setTenantContact("");
    }
  }, [villa, isOpen]); // Rerun effect when dialog opens or villa data changes

  const handleSubmit = () => {
    // Basic validation
    if (!villaNumber || !ownerFirstName || !ownerLastName) {
      // In a real app, show a toast or error message
      console.error("Villa number and owner name are required.");
      return;
    }
    onSave({
      id: villa?.id,
      villaNumber: parseInt(villaNumber, 10),
      ownerFirstName,
      ownerLastName,
      contact,
      isRented,
      tenantFirstName: isRented ? tenantFirstName : "",
      tenantLastName: isRented ? tenantLastName : "",
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
            <Label htmlFor="ownerFirstName" className="text-right">
              نام مالک
            </Label>
            <Input id="ownerFirstName" value={ownerFirstName} onChange={e => setOwnerFirstName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ownerLastName" className="text-right">
              نام خانوادگی مالک
            </Label>
            <Input id="ownerLastName" value={ownerLastName} onChange={e => setOwnerLastName(e.target.value)} className="col-span-3" />
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
                <Label htmlFor="tenantFirstName" className="text-right">
                  نام مستاجر
                </Label>
                <Input id="tenantFirstName" value={tenantFirstName} onChange={e => setTenantFirstName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tenantLastName" className="text-right">
                  نام خانوادگی مستاجر
                </Label>
                <Input id="tenantLastName" value={tenantLastName} onChange={e => setTenantLastName(e.target.value)} className="col-span-3" />
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
