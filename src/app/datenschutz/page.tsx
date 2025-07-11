
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { ShieldCheck, Server, Contact, Lock } from 'lucide-react';

export default function DatenschutzPage() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader title="Datenschutzerklärung" />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Einleitung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground">
          <p>
            Wir, der Automobilclub Warendorf e. V. im ADAC, freuen uns über Ihren Besuch unserer Website. Datenschutz und Datensicherheit für unsere Nutzer haben für uns eine hohe Priorität. Der Schutz Ihrer persönlichen Daten ist uns ein besonders wichtiges Anliegen. Diese Datenschutzerklärung erläutert, welche Informationen wir erfassen und wie diese genutzt werden.
          </p>
          <p>
            Der AC Warendorf e.V. im ADAC verarbeitet in vielfacher Weise automatisiert personenbezogene Daten (z.B. im Rahmen der Vereinsverwaltung, der Organisation der Trainings, der Wettbewerbe sowie der Öffentlichkeitsarbeit des Vereins). Um die Vorgaben der EU-Datenschutz-Grundverordnung (DSGVO) und des Bundesdatenschutzgesetzes zu erfüllen, Datenschutzverstöße zu vermeiden und einen einheitlichen Umgang mit personenbezogenen Daten innerhalb des Vereins zu gewährleisten, gilt die nachfolgende Datenschutzerklärung.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Allgemeine Hinweise & Verantwortliche Stelle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground">
           <p>
            Auch wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Personenbezogene Daten sind Daten, mit denen Sie persönlich identifiziert werden können. Die vorliegende Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck das geschieht. Der Verein verarbeitet darüber hinaus personenbezogene Daten u.a. von Mitgliedern, Teilnehmerinnen und Teilnehmern an Trainings- und Wettbewerbsveranstaltungen sowohl automatisiert in EDV-Anlagen als auch nicht automatisiert in einem Dateisystem, z.B. in Form von ausgedruckten Listen. Darüber hinaus werden personenbezogene Daten im Internet veröffentlicht und an Dritte weitergeleitet oder Dritten offen gelegt. In all diesen Fällen ist die EU-Datenschutz-Grundverordnung, das Bundesdatenschutzgesetz und diese Datenschutzerklärung durch alle Personen im Verein, die personenbezogene Daten verarbeiten, zu beachten.
          </p>
          <p>
            Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.
          </p>
          <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Webseitenbetreiber. Die Kontaktdaten der verantwortlichen Stelle entnehmen Sie bitte dem <a href="/impressum" className="text-primary hover:underline">Impressum</a> dieser Website.</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Ihre Rechte als betroffene Person</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground">
            <h3 className="font-semibold">Auskunft, Berichtigung, Sperrung, Löschung</h3>
            <p>Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen. Hierzu sowie zu weiteren Fragen können Sie sich jederzeit z.B. per E-Mail unter webmaster@automobilclub-warendorf.de an uns wenden.</p>
            
            <h3 className="font-semibold mt-4">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
            <p>Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Dazu reicht eine formlose Mitteilung per E-Mail an uns. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.</p>

            <h3 className="font-semibold mt-4">Beschwerderecht bei der zuständigen Aufsichtsbehörde</h3>
            <p>Sie haben ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde, etwa bei dem für uns zuständigen Landesbeauftragten für Datenschutz und Informationsfreiheit in Nordrhein-Westfalen: Postfach 20 04 44, 40102 Düsseldorf, Tel.: 0211/38424-0, E-Mail: poststelle@ldi.nrw.de</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center"><Lock className="mr-2"/>Datenerfassung auf unserer Website</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground">
            <h3 className="font-semibold">Cookies</h3>
            <p>Die Internetseiten verwenden teilweise so genannte Cookies. Cookies richten auf Ihrem Rechner keinen Schaden an und enthalten keine Viren. Cookies dienen dazu, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen. Cookies sind kleine Textdateien, die auf Ihrem Rechner abgelegt werden und die Ihr Browser speichert. Cookies, die zur Durchführung des elektronischen Kommunikationsvorgangs oder zur Bereitstellung bestimmter, von Ihnen erwünschter Funktionen erforderlich sind, werden auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO gespeichert.</p>

            <h3 className="font-semibold mt-4">Server-Log-Dateien & Webhosting</h3>
            <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind: Browsertyp/-version, verwendetes Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage und IP-Adresse. Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Grundlage für die Datenverarbeitung ist Art. 6 Abs. 1 lit. f DSGVO.</p>

            <h3 className="font-semibold mt-4">Kontaktformular und E-Mail-Kontakt</h3>
            <p>Wenn Sie uns per Kontaktformular oder E-Mail Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Für die Verarbeitung der Daten wird im Rahmen des Absendevorgangs Ihre Einwilligung eingeholt und auf diese Datenschutzerklärung verwiesen.</p>

            <h3 className="font-semibold mt-4">SSL- bzw. TLS-Verschlüsselung</h3>
            <p>Diese Seite nutzt aus Sicherheitsgründen eine SSL-bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von “http://” auf “https://” wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Nutzung und Zweck der Datenverarbeitung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground">
          <p>
            Der Verein verarbeitet die Daten unterschiedlicher Kategorien von Personen. Im Rahmen des Mitgliedschaftsverhältnisses verarbeitet der Verein insbesondere die folgenden Daten der Mitglieder: Geschlecht, Vorname, Nachname, Anschrift, Geburtsdatum, Datum des Vereinsbeitritts, Bankverbindung, Kontaktdaten. Im Rahmen der Zugehörigkeit zu den Landesverbänden werden personenbezogene Daten der Mitglieder an diese weitergeleitet.
          </p>
          <p>
            Im Rahmen der Öffentlichkeitsarbeit werden personenbezogene Daten in Aushängen, im Internetauftritt oder über Social-Media-Kanäle des Vereins veröffentlicht und an die Presse weitergegeben. Die Veröffentlichung von Fotos und Videos erfolgt auf Grundlage einer Einwilligung der abgebildeten Personen. Auf der Internetseite des Vereins werden die Daten der Mitglieder des Vorstands mit Vorname, Nachname, Funktion und Kontaktdaten veröffentlicht.
          </p>
          <p>
            Wir erheben, verarbeiten und nutzen personenbezogene Daten nur, soweit sie für die Begründung, inhaltliche Ausgestaltung oder Änderung des Rechtsverhältnisses erforderlich sind (Bestandsdaten), insbesondere für Nennungen zu unseren Sportveranstaltungen.
          </p>
        </CardContent>
      </Card>

       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center"><Server className="mr-2"/>Drittanbieter und Datenspeicherung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground">
            <h3 className="font-semibold">Webhoster</h3>
            <p>
              Unsere Website liegt auf Servern von Google Firebase (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland) und Strato (Strato AG, Pascalstr. 10, 10587 Berlin). Wir haben mit diesen Anbietern Verträge zur Auftragsdatenverarbeitung abgeschlossen und setzen die strengen Vorgaben der deutschen Datenschutzbehörden um.
            </p>
            <h3 className="font-semibold mt-4">Firebase Dienste (Authentifizierung, Datenbank, Cloud Storage)</h3>
            <p>
              Für den Admin-Bereich nutzen wir Firebase Authentication zur Anmeldung, Firestore als Datenbank zur Speicherung von Inhalten (News, Mitglieder etc.) und Cloud Storage zur Speicherung von Bildern. Diese Dienste werden von Google bereitgestellt. Bei der Nutzung dieser Funktionen werden Daten auf Google-Servern verarbeitet, die sich auch in den USA befinden können.
            </p>
            <h3 className="font-semibold mt-4">Soziale Medien & Externe Dienste (Facebook, YouTube etc.)</h3>
            <p>
              Auf unseren Seiten können Plugins sozialer Netzwerke (z.B. Facebook, Twitter, Instagram, YouTube) eingebunden sein. Wenn Sie eine Seite besuchen, die ein solches Plugin enthält, kann eine direkte Verbindung zwischen Ihrem Browser und dem Server des Anbieters hergestellt werden. Dieser erhält dadurch die Information, dass Sie mit Ihrer IP-Adresse unsere Seite besucht haben. Wir haben keine Kenntnis vom Inhalt der übermittelten Daten sowie deren Nutzung durch die Anbieter. Weitere Informationen finden Sie in den jeweiligen Datenschutzerklärungen der Anbieter.
            </p>
             <h3 className="font-semibold mt-4">Google Analytics</h3>
            <p>Diese Website nutzt Funktionen des Webanalysedienstes Google Analytics. Anbieter ist die Google Inc. Google Analytics verwendet „Cookies“. Die Speicherung von Google-Analytics-Cookies erfolgt auf Grundlage der DSGVO. Wir haben die Funktion IP-Anonymisierung aktiviert. Sie können die Erfassung Ihrer Daten durch Google Analytics verhindern, indem Sie das unter dem folgenden Link verfügbare Browser-Plugin herunterladen: <a href="https://tools.google.com/dlpage/gaoptout?hl=de" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://tools.google.com/dlpage/gaoptout?hl=de</a>.</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl font-headline">Zusammenfassung</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                Alle Informationen und Bestandteile dieser Website sind vom AC Warendorf e.V. im ADAC nach bestem Wissen und Gewissen zusammengestellt worden. Wir haften nicht für die Vollständigkeit, Richtigkeit, und Aktualität aller Informationen. Sollten ihnen Unvollständigkeiten auffallen, so nehmen sie mit uns Kontakt auf.
            </p>
        </CardContent>
      </Card>

      <p className="text-sm text-center text-muted-foreground">
        Stand: {currentDate || 'Lädt...'}
      </p>
    </div>
  );
}
