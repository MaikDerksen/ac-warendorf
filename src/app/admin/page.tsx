
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Newspaper, Shield, Settings, Car, FileText, Contact, Image as ImageIconLucide, Calendar, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboardPage() {
  const { user, isAdmin, loading } = useAuth();

  const managementSections = [
    { title: 'Homepage Bilder', icon: Settings, href: '/admin/homepage-settings', description: 'Logo und Hero-Bild der Startseite verwalten.' },
    { title: 'News Verwalten', icon: Newspaper, href: '/admin/news', description: 'Artikel erstellen, bearbeiten und löschen.' },
    { title: 'Kalender Verwalten', icon: Calendar, href: '/admin/kalender', description: 'Vereinstermine erstellen und pflegen.' },
    { title: 'Vorstand Verwalten', icon: Users, href: '/admin/vorstand', description: 'Vorstandsmitglieder und Rollen pflegen.' },
    { title: 'Piloten Verwalten', icon: Car, href: '/admin/piloten', description: 'Fahrerprofile und Erfolge aktualisieren.' },
    { title: 'Sponsoren Verwalten', icon: Shield, href: '/admin/sponsoren', description: 'Sponsorenlogos und -informationen verwalten.' },
    { title: 'Bildergalerie Verwalten', icon: ImageIconLucide, href: '/admin/galerie', description: 'Eigenständige Bildergalerien erstellen und verwalten.' },
    { title: 'Aktivitäten Seite', icon: ImageIconLucide, href: '/admin/aktivitaeten-settings', description: 'Inhalte der "Aktivitäten" Seite bearbeiten.' },
    { title: 'Mitglied Werden Seite', icon: FileText, href: '/admin/mitglied-werden-settings', description: 'Inhalte der "Mitglied Werden" Seite (inkl. FAQs) bearbeiten.' },
    { title: 'Kontakt Seite', icon: Contact, href: '/admin/kontakt-settings', description: 'Kontaktinformationen der "Kontakt" Seite bearbeiten.' },
  ];

  if (loading) {
    return (
        <div className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Prüfe Authentifizierung...</span>
        </div>
    );
  }

  if (!user || !isAdmin) {
    return (
        <div className="space-y-8">
            <PageHeader title="Admin Dashboard" subtitle="Willkommen im Verwaltungsbereich des AC Warendorf." />
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><KeyRound className="mr-2"/>Anmeldung erforderlich</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Bitte melden Sie sich mit einem Administratorenkonto an, um auf diesen Bereich zuzugreifen.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Admin Dashboard" subtitle="Willkommen im Verwaltungsbereich des AC Warendorf." />

      <Card>
        <CardHeader>
          <CardTitle>Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Hier können Sie die Inhalte der Webseite verwalten. Wählen Sie einen Bereich zur Bearbeitung aus.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8">
        {managementSections.map((section) => (
          <Card key={section.title} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium font-headline">{section.title}</CardTitle>
              <section.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4 h-12 overflow-hidden">{section.description}</p>
              <Button variant="outline" className="w-full" asChild>
                <Link href={section.href}>Verwalten</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
