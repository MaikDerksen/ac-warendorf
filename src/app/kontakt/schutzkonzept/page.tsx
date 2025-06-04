
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { ShieldAlert, Users, Mail } from 'lucide-react';

export default function SchutzkonzeptPage() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader title="Schutzkonzept" subtitle="Zum Schutz unserer Mitglieder – Gemeinsam für ein sicheres Vereinsleben" />

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-start space-x-4">
          <ShieldAlert className="h-10 w-10 text-primary mt-1" />
          <div>
            <CardTitle className="text-2xl font-headline">Unser Engagement für ein sicheres Umfeld</CardTitle>
            <p className="text-muted-foreground">Prävention, Intervention und Aufarbeitung</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground">
          <p>
            Der Automobilclub Warendorf e.V. im ADAC (AC Warendorf) bekennt sich ausdrücklich zu seiner Verantwortung, ein sicheres, respektvolles und unterstützendes Umfeld für alle Mitglieder, insbesondere für Kinder und Jugendliche, zu gewährleisten. Unser Schutzkonzept dient dazu, präventive Maßnahmen zu etablieren, klare Handlungsrichtlinien im Falle von Grenzüberschreitungen, Diskriminierung oder (sexualisierter) Gewalt zu definieren und eine Kultur des Hinsehens und der Verantwortungsübernahme zu fördern.
          </p>
          
          <h3 className="text-lg font-semibold font-headline text-primary pt-2">Ziele unseres Schutzkonzepts:</h3>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Prävention:</strong> Verhinderung von jeglicher Form von Gewalt, Mobbing und Diskriminierung.</li>
            <li><strong>Sensibilisierung:</strong> Aufklärung und Schulung aller Beteiligten (Mitglieder, Trainer, Eltern, Vorstand) für das Thema Kindeswohl und grenzachtenden Umgang.</li>
            <li><strong>Intervention:</strong> Schaffung klarer Anlaufstellen und transparenter Verfahrensweisen bei Verdachtsfällen oder Vorfällen.</li>
            <li><strong>Stärkung:</strong> Förderung von Selbstbewusstsein und Partizipation, insbesondere bei Kindern und Jugendlichen.</li>
            <li><strong>Kultur:</strong> Etablierung einer offenen und vertrauensvollen Vereinskultur, in der Probleme angesprochen werden können.</li>
          </ul>

          <h3 className="text-lg font-semibold font-headline text-primary pt-2">Wichtige Bausteine (Auszug):</h3>
           <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Benennung von Vertrauenspersonen / Ansprechpartnern für Kinderschutz.</li>
            <li>Verpflichtung zur Vorlage erweiterter Führungszeugnisse für bestimmte Funktionsträger.</li>
            <li>Verhaltenskodex für alle im Verein Tätigen.</li>
            <li>Regelmäßige Information und Schulung.</li>
            <li>Notfallplan und Interventionsleitfaden.</li>
          </ul>
          
          <p className="pt-2">
            Das vollständige Schutzkonzept des AC Warendorf ist in Ausarbeitung und wird nach Verabschiedung durch die Mitgliederversammlung hier und im Vereinsheim zur Einsicht bereitgestellt. 
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center"><Users className="mr-2 h-6 w-6 text-primary"/> Ansprechpartner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-foreground">
           <p>Bei Fragen, Anliegen oder Verdachtsfällen im Kontext des Schutzkonzepts können Sie sich jederzeit vertrauensvoll an folgende Personen wenden:</p>
           <ul className="list-none space-y-1">
            <li><strong>Vorstand des AC Warendorf:</strong> <a href="mailto:vorstand1[at]automobilclub-warendorf.de" className="text-primary hover:underline flex items-center"><Mail className="mr-2 h-4 w-4"/>vorstand1[at]automobilclub-warendorf.de</a> (oder über das <Link href="/kontakt" className="text-primary hover:underline">Kontaktformular</Link>)</li>
            <li><em>Weitere Vertrauenspersonen werden nach Benennung hier aufgeführt.</em></li>
           </ul>
           <p className="text-sm text-muted-foreground pt-2">Externe Beratungsstellen (z.B. Kinderschutzbund, Weißer Ring) stehen ebenfalls zur Verfügung.</p>
        </CardContent>
      </Card>

       <p className="text-sm text-center text-muted-foreground">
        Stand: {currentDate || 'Lädt...'}
      </p>
    </div>
  );
}
