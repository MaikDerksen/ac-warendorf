
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { ShieldAlert, UserCheck, Mail, MessageSquare, Info } from 'lucide-react';
import Link from 'next/link';

export default function SchutzkonzeptPage() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader title="Schutzkonzept des AC Warendorf" subtitle="Zum Schutz unserer Mitglieder – Gemeinsam für ein sicheres Vereinsleben, insbesondere für unsere Jugendgruppe." />

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
          <CardTitle className="text-xl font-headline flex items-center"><UserCheck className="mr-2 h-6 w-6 text-primary"/> Schutzbeauftragte für die Jugendgruppe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-foreground">
           <p>
             Unsere Schutzbeauftragte für die Jugendgruppe ist <strong>Lorraine Schürhörster</strong>.
           </p>
           <p>
             Sie ist Ihre erste Ansprechpartnerin bei Fragen, Anliegen oder Verdachtsfällen im Kontext des Schutzkonzepts für unsere jungen Mitglieder.
           </p>
           <p>
             Sie können Lorraine Schürhörster wie folgt erreichen:
             <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Über die Vereins-App <strong>Spond</strong> (sofern Sie Mitglied sind und Zugriff haben).</li>
                <li>Über unser <Link href="/kontakt" className="text-primary hover:underline">allgemeines Kontaktformular</Link>. Bitte geben Sie im Betreff oder in der Nachricht an, dass Ihre Anfrage für Lorraine Schürhörster bestimmt ist.</li>
             </ul>
           </p>
           <p className="text-sm text-muted-foreground pt-2">
             Alternativ können Sie sich auch jederzeit vertrauensvoll an den <Link href="/vorstand" className="text-primary hover:underline">Vorstand des AC Warendorf</Link> wenden.
           </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg bg-secondary">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center"><Info className="mr-2 h-6 w-6 text-primary"/> So erreichen Sie Lorraine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-foreground">
           <p>Wenn Sie Lorraine Schürhörster (z.B. über das Kontaktformular) eine Nachricht zukommen lassen möchten, helfen folgende Angaben für eine schnelle Bearbeitung:</p>
           <ul className="list-none space-y-2">
            <li className="flex items-start">
              <UserCheck className="h-5 w-5 mr-2 mt-1 flex-shrink-0 text-accent"/>
              <span><strong>Ihr Name und/oder eine Kontaktmöglichkeit:</strong> Damit Lorraine Sie bei Bedarf erreichen kann (z.B. E-Mail-Adresse oder Telefonnummer).</span>
            </li>
            <li className="flex items-start">
              <MessageSquare className="h-5 w-5 mr-2 mt-1 flex-shrink-0 text-accent"/>
              <span><strong>Ihre Nachricht:</strong> Schildern Sie Ihr Anliegen oder Ihre Beobachtung möglichst klar.</span>
            </li>
           </ul>
           <p className="text-sm text-muted-foreground pt-2">Alle Anfragen werden vertraulich behandelt.</p>
        </CardContent>
      </Card>

       <p className="text-sm text-center text-muted-foreground">
        Stand: {currentDate || 'Lädt...'}
      </p>
    </div>
  );
}
