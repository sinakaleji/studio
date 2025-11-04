"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

export default function AddVilla() {
  const [isRented, setIsRented] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="ml-2 h-4 w-4" />
          افزودن ویلا
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>افزودن ویلا جدید</DialogTitle>
          <DialogDescription>
            اطلاعات ویلا و ساکنین آن را وارد کنید.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="villaNumber" className="text-right">
              شماره ویلا
            </Label>
            <Input id="villaNumber" type="number" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ownerName" className="text-right">
              نام مالک
            </Label>
            <Input id="ownerName" className="col-span-3" />
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
                <Input id="tenantName" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tenantContact" className="text-right">
                  تماس مستاجر
                </Label>
                <Input id="tenantContact" className="col-span-3" />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button type="submit">ذخیره</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
