"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { AppSettings } from "@/lib/types";
import { getSettings, saveSettings } from "@/lib/settings";
import { useRouter } from "next/navigation";


const formSchema = z.object({
  communityName: z.string().min(1, "نام شهرک الزامی است."),
  developerName: z.string().min(1, "نام سازنده الزامی است."),
});

type FormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isClient ? getSettings() : { communityName: "", developerName: "" },
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

  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader title="تنظیمات" />
      <Card>
        <CardHeader>
          <CardTitle>تنظیمات برنامه</CardTitle>
          <CardDescription>
            نام شهرک و نام توسعه دهنده را در اینجا ویرایش کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
              <Button type="submit">ذخیره تغییرات</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
