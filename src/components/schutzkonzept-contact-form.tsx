
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useState } from 'react';
import { Loader2, Mail, User, ShieldQuestion, MessageSquare } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name muss mindestens 2 Zeichen lang sein." }),
  email: z.string().email({ message: "Bitte geben Sie eine gültige E-Mail-Adresse ein." }),
  subject: z.string().min(5, { message: "Betreff muss mindestens 5 Zeichen lang sein." }),
  message: z.string().min(10, { message: "Nachricht muss mindestens 10 Zeichen lang sein." }),
});

export function SchutzkonzeptContactForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "Vertrauliche Anfrage zum Schutzkonzept",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          formType: "Schutzkonzept-Kontakt",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Senden der E-Mail.');
      }
      
      toast({
        title: "Nachricht vertraulich gesendet!",
        description: "Vielen Dank für Ihre Kontaktaufnahme. Ihre Anfrage wurde an die zuständige Schutzbeauftragte weitergeleitet.",
      });
      form.reset();
    } catch (error: any) {
      console.error("Fehler beim Senden des Schutzkonzept-Formulars:", error);
      toast({
        title: "Fehler",
        description: "Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full shadow-lg bg-secondary">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center text-primary-foreground-alt">Vertrauliche Kontaktanfrage</CardTitle>
        <CardDescription className="text-center">Ihre Nachricht wird direkt an die Schutzbeauftragte gesendet.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><User /> Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ihr Name (optional, für Rückfragen)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Mail /> E-Mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Ihre E-Mail-Adresse" {...field} />
                  </FormControl>
                   <FormDescription className="text-xs">
                     Notwendig, damit wir Ihnen antworten können.
                   </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><ShieldQuestion /> Betreff</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><MessageSquare/> Ihre Nachricht</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Schildern Sie hier vertraulich Ihr Anliegen..." {...field} rows={6} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" variant="default" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Nachricht vertraulich senden'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
