
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Users, CalendarDays, Trophy, Helmet, Mail, User, MessageSquare } from 'lucide-react';

const oldieCupFormSchema = z.object({
  name: z.string().min(2, { message: "Name muss mindestens 2 Zeichen lang sein." }),
  email: z.string().email({ message: "Bitte geben Sie eine gültige E-Mail-Adresse ein." }),
  message: z.string().optional(),
  subscribeToNews: z.boolean().default(false).optional(),
});

type OldieCupFormValues = z.infer<typeof oldieCupFormSchema>;

export default function OldieCupPage() {
  const { toast } = useToast();
  const form = useForm<OldieCupFormValues>({
    resolver: zodResolver(oldieCupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      subscribeToNews: false,
    },
  });

  async function onSubmit(values: OldieCupFormValues) {
    // TODO: Implement actual form submission logic (e.g., send email, save to DB for Oldie Cup interest)
    console.log("Oldie-Cup Form submitted:", values);
    toast({
      title: "Anmeldung erhalten!",
      description: "Vielen Dank für Ihr Interesse am Oldie-Cup. Wir werden Sie ggf. kontaktieren.",
    });
    form.reset();
  }

  const keyFacts = [
    { icon: Users, text: "Teilnahme ab 18 Jahren" },
    { icon: CalendarDays, text: "Wöchentliches Training (geplant)" },
    { icon: Trophy, text: "Mehrere Turniere pro Saison (geplant)" },
    { icon: Helmet, text: "Als eigenes Equipment wird nur ein Integralhelm benötigt" },
  ];

  return (
    <div className="space-y-12">
      <PageHeader title="Oldie-Cup" subtitle="Kart-Slalom für Motorsportbegeisterte ab 18 Jahren" />

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-primary">Was ist der Oldie-Cup?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Der Oldie-Cup ist unsere Rennserie für alle erwachsenen Motorsport-Enthusiasten ab 18 Jahren, die Spaß am Kart-Slalom haben.
                Egal ob ehemaliger Jugend-Kartfahrer oder ambitionierter Neueinsteiger – hier steht der Fahrspaß und der faire Wettbewerb im Vordergrund.
              </p>
              <p className="text-foreground">
                Erleben Sie den Nervenkitzel des Kart-Slaloms in einer geselligen Runde und messen Sie sich mit Gleichgesinnten.
              </p>
              <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-md mt-4">
                <Image
                  src="https://placehold.co/600x338.png"
                  alt="Kart-Slalom für Erwachsene"
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="adult karting race"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-primary">Grundfakten zum Oldie-Cup</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {keyFacts.map((fact, index) => (
                  <li key={index} className="flex items-center text-foreground">
                    <fact.icon className="h-5 w-5 mr-3 text-accent flex-shrink-0" />
                    <span>{fact.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg sticky top-24">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-center text-primary">Jetzt hier melden!</CardTitle>
            <p className="text-sm text-muted-foreground text-center">Bekunden Sie Ihr Interesse oder stellen Sie Ihre Fragen.</p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><User className="h-4 w-4 mr-2 text-muted-foreground"/>Dein Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Max Mustermann" {...field} />
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
                      <FormLabel className="flex items-center"><Mail className="h-4 w-4 mr-2 text-muted-foreground"/>Deine E-Mail-Adresse</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="max.mustermann@example.com" {...field} />
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
                      <FormLabel className="flex items-center"><MessageSquare className="h-4 w-4 mr-2 text-muted-foreground"/>Deine Nachricht (optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ihre Frage oder Anmerkung..." {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subscribeToNews"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Ich möchte in Zukunft über Neuigkeiten zum Oldie Cup informiert werden.
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Interesse bekunden / Senden
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
