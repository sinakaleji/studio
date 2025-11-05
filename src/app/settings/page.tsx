
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { AppSettings } from "@/lib/types";
import { getSettings, saveSettings, exportSelectedData, importAllData, restoreFromAutoBackup } from "@/lib/settings";
import { Trash2, Upload, Download, RotateCcw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { VILLAS_KEY, PERSONNEL_KEY, BOARD_MEMBERS_KEY, BUILDINGS_KEY } from "@/lib/data-manager";


const formSchema = z.object({
  communityName: z.string().min(1, "نام شهرک الزامی است."),
  developerName: z.string().min(1, "نام سازنده الزامی است."),
  personnelRoles: z.array(z.string().min(1, "نام نقش نمی‌تواند خالی باشد.")),
});

type FormValues = z.infer<typeof formSchema>;

const exportOptions = [
  { id: VILLAS_KEY, label: 'ویلاها' },
  { id: PERSONNEL_KEY, label: 'پرسنل' },
  { id: BOARD_MEMBERS_KEY, label: 'هیئت مدیره' },
  { id: BUILDINGS_KEY, label: 'ساختمان‌ها' },
];

type ExportSelection = {
  [key: string]: boolean;
};


export default function SettingsPage() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [newRole, setNewRole] = useState("");
  const importFileRef = useRef<HTMLInputElement>(null);
  
  const [exportSelection, setExportSelection] = useState<ExportSelection>(
    exportOptions.reduce((acc, option) => ({ ...acc, [option.id]: true }), {})
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isClient ? getSettings() : { communityName: "", developerName: "", personnelRoles: [] },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "personnelRoles",
  });
  
  useEffect(() => {
    if(isClient) {
      form.reset(getSettings());
    }
  }, [isClient, form]);

  function onSubmit(data: FormValues) {
    saveSettings(data);
    toast({
      title: "موفقیت",
      description: "تنظیمات با موفقیت ذخیره شد.",
    });
    // Force a reload to update the layout with new settings
    window.location.reload();
  }

  const handleAddRole = () => {
    if (newRole.trim()) {
      append(newRole.trim());
      setNewRole("");
    }
  };

  const handleExport = () => {
    const selectedKeys = Object.keys(exportSelection).filter(key => exportSelection[key]);
    if (selectedKeys.length === 0) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "حداقل یک مورد را برای پشتیبان‌گیری انتخاب کنید.",
      });
      return;
    }

    const data = exportSelectedData(selectedKeys);
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `nilarose-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast({
        title: "موفقیت",
        description: "فایل پشتیبان با موفقیت دانلود شد."
    });
  };

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const data = JSON.parse(content);
            importAllData(data);
            toast({
                title: "موفقیت",
                description: "اطلاعات با موفقیت بازیابی شد. صفحه مجددا بارگذاری می‌شود.",
            });
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "خطا در بازیابی",
                description: "فایل پشتیبان معتبر نیست.",
            });
        }
    };
    reader.readAsText(file);
    // Reset file input
    if(event.target) {
        event.target.value = "";
    }
  };
  
  const handleExportSelectionChange = (key: string) => {
    setExportSelection(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAllChange = (checked: boolean) => {
    const newSelection: ExportSelection = {};
    exportOptions.forEach(option => {
      newSelection[option.id] = checked;
    });
    setExportSelection(newSelection);
  };

  const handleAutoRestore = () => {
    if (restoreFromAutoBackup()) {
      toast({
        title: "موفقیت",
        description: "اطلاعات از آخرین نسخه پشتیبان خودکار بازیابی شد. صفحه مجددا بارگذاری می‌شود.",
      });
      setTimeout(() => window.location.reload(), 1500);
    } else {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "هیچ پشتیبان خودکاری یافت نشد.",
      });
    }
  };
  
  const areAllSelected = Object.values(exportSelection).every(Boolean);

  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader title="تنظیمات" />
      <div className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات کلی</CardTitle>
                <CardDescription>
                  نام شهرک و نام توسعه دهنده را در اینجا ویرایش کنید.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="communityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام شهرک</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: شهرک نیلارز" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="developerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام سازنده (کپی رایت)</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: سینا رایانه" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>مدیریت نقش‌های پرسنل</CardTitle>
                <CardDescription>
                  نقش‌های شغلی موجود در شهرک را مدیریت کنید.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 mb-2">
                      <FormField
                          control={form.control}
                          name={`personnelRoles.${index}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <Input
                    placeholder="نقش جدید را وارد کنید"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddRole}>افزودن نقش</Button>
                </div>
              </CardContent>
            </Card>

            <Button type="submit">ذخیره تغییرات</Button>
          </form>
        </Form>
        
        <Card>
            <CardHeader>
              <CardTitle>پشتیبان‌گیری و بازیابی</CardTitle>
              <CardDescription>
                از اطلاعات برنامه یک نسخه پشتیبان تهیه کنید یا اطلاعات را از یک فایل پشتیبان بازیابی کنید.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">انتخاب بخش‌ها برای پشتیبان‌گیری (Export):</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                              id="select-all"
                              checked={areAllSelected}
                              onCheckedChange={(checked) => handleSelectAllChange(Boolean(checked))}
                          />
                          <label htmlFor="select-all" className="font-medium">انتخاب همه</label>
                      </div>
                      {exportOptions.map(option => (
                        <div key={option.id} className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox 
                                id={option.id}
                                checked={exportSelection[option.id]}
                                onCheckedChange={() => handleExportSelectionChange(option.id)}
                            />
                            <label htmlFor={option.id}>{option.label}</label>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                    <input
                        type="file"
                        ref={importFileRef}
                        className="hidden"
                        accept=".json"
                        onChange={handleImport}
                    />
                     <Button variant="secondary" onClick={handleAutoRestore}>
                        <RotateCcw className="ml-2 h-4 w-4" />
                        بازیابی آخرین پشتیبان خودکار
                    </Button>
                    <Button variant="outline" onClick={handleImportClick}>
                        <Upload className="ml-2 h-4 w-4" />
                        بازیابی از فایل (Import)
                    </Button>
                    <Button onClick={handleExport}>
                        <Download className="ml-2 h-4 w-4" />
                        دانلود نسخه پشتیبان (Export)
                    </Button>
                </div>
            </CardContent>
          </Card>
      </div>
    </main>
  );
}
