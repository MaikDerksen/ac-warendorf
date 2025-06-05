
import type { NewsArticle, BoardMember, Pilot, FaqItem } from '@/types';

export const mockNewsArticles: NewsArticle[] = [
  {
    slug: 'die-suche-nach-einem-trainingsplatz',
    title: 'Die Suche nach einem Trainingsplatz…',
    date: '2024-11-28',
    categories: ['Kart-Slalom', 'Kart-Slalom 2024'],
    excerpt: 'Die Suche nach einem geeigneten Trainingsplatz gestaltet sich oft schwierig. Erfahren Sie mehr über unsere Bemühungen und aktuellen Stand.',
    content: '<p>Die Suche nach einem geeigneten Trainingsplatz gestaltet sich oft schwierig. Der AC Warendorf ist stets bemüht, optimale Bedingungen für seine Fahrer zu schaffen. Aktuell prüfen wir verschiedene Optionen im Umkreis von Warendorf, um regelmäßige Trainingseinheiten sicherzustellen. Wir halten euch auf dem Laufenden!</p><p>Ein fester Trainingsplatz ist essentiell für die kontinuierliche Weiterentwicklung unserer Fahrer und die Vorbereitung auf Wettbewerbe. Wir danken allen Beteiligten für ihre Unterstützung und Geduld.</p>',
    heroImageUrl: '/images/news/die-suche-nach-einem-trainingsplatz.png',
    dataAiHint: 'karting track'
  },
  {
    slug: 'louis-ist-weltmeister',
    title: 'Louis ist Weltmeister!',
    date: '2024-10-15',
    categories: ['Kart-Slalom', 'Erfolge'],
    excerpt: 'Unglaubliche Nachrichten! Unser Fahrer Louis hat den Weltmeistertitel im Kart-Slalom errungen. Ein historischer Erfolg für den AC Warendorf.',
    content: '<p><strong>Ein Traum wird wahr!</strong> Louis, eines unserer talentiertesten Mitglieder, hat bei den diesjährigen Weltmeisterschaften im Kart-Slalom triumphiert. Mit einer fehlerfreien Leistung und beeindruckender Geschwindigkeit setzte er sich gegen starke internationale Konkurrenz durch.</p><p>Der gesamte Verein ist unglaublich stolz auf Louis und seine Leistung. Dieser Erfolg ist das Ergebnis jahrelangen harten Trainings, Engagements und der Unterstützung seiner Familie und Trainer. Herzlichen Glückwunsch, Louis!</p>',
    heroImageUrl: '/images/news/louis-ist-weltmeister.png',
    dataAiHint: 'karting champion'
  },
  {
    slug: 'ac-warendorf-auf-der-gewerbeschau',
    title: 'Turnierabschluss des AC Warendorf',
    date: '2024-10-16',
    categories: ['Kart-Slalom', 'News'],
    excerpt: 'Der AC Warendorf präsentierte sich erfolgreich auf der lokalen Gewerbeschau und brachte den Besuchern den Kartsport näher.',
    content: '<p>Am Samstag kamen die Piloten des AC Warendorf in gemütlicher Runde zusammen, um die gelungene Turniersaison 2022 zu feiern. Bei bestem Wetter wurde der Grill auf dem Trainingsgelände bei (noch) Teutemacher angeschmissen und es wurde über die vergangene Saison geplaudert.<br>Besonders von den Erfolgen von Henrik Gaj und Elias Jovanovski beim Bundesendlauf in Friedrichshafen am Wochenende zuvor wurde berichtet. Henrik hat es in Klasse 2 sogar unter die TOP 10 geschafft und kann auf Platz 7 super stolz sein. Elias kam in Klasse 4 auf Platz 23. Nach einem super 1. Wertungslauf, standen im 2. Wertungslauf 2 Pylonen im Weg.<br>Nachdem sich jeder an Bratwurst, Salat und Brötchen gestärkt hatte, konnten auch Eltern und Geschwister mal Motorluft schnuppern und durch die Slaloms düsen. Diese Erfahrung löst meist großen Zuspruch für die Kids aus, denn das Steuern der Karts und sich den Slalom zu merken ist alles andere als ein Kinderspiel! Es war rundum ein schöner Nachmittag für alle Anwesenden.<br>Leider musste sich der Verein auch noch von einem Fahrer verabschieden. Leon Stange wurde als aktiver Pilot verabschiedet da er nun volljährig ist. Er bleibt dem Verein aber als Webmaster erhalten und wird hier und da beratend zur Seite stehen.<br>Nun heißt es noch ein letztes Mal Daumen drücken für Elias Jovanovski bei der Deutschen Meisterschaft am 22.10.2022.<br>Aber nach der Saison ist vor der Saison und so trainieren die Piloten bereits jetzt schon fleißig für 2023 und hoffen auf viele tolle Erfolge!</p>',
    heroImageUrl: '/images/news/turnierabschluss-warendorf.jpg',
    dataAiHint: 'karting event'
  },
  {
    slug: 'saisonstart-2024',
    title: 'Erfolgreicher Saisonstart 2024 für den AC Warendorf',
    date: '2024-04-10',
    categories: ['Kart-Slalom 2024', 'Wettbewerbe'],
    excerpt: 'Die Kart-Saison 2024 hat begonnen und die Fahrer des AC Warendorf zeigten bereits starke Leistungen bei den ersten Vorläufen.',
    content: '<p>Mit viel Enthusiasmus und gut vorbereitet starteten unsere Piloten in die neue Kart-Slalom Saison. Bei den ersten Vorläufen des ADAC Westfalen konnten bereits einige Podiumsplätze und viele persönliche Bestzeiten eingefahren werden. Das intensive Wintertraining scheint sich auszuzahlen. Wir blicken gespannt auf die kommenden Rennen!</p>',
    heroImageUrl: '/images/news/saisonstart-2024.png',
    dataAiHint: 'kart race start'
  }
];

export const mockBoardMembers: BoardMember[] = [
  { id: '1', name: 'Max Mustermann', role: '1. Vorsitzender', term: '→ 2026', email: 'vorstand1[at]automobilclub-warendorf.de', imageUrl: '/images/vorstand/max-mustermann.png' },
  { id: '2', name: 'Erika Musterfrau', role: 'Schatzmeisterin', term: '→ 2025', email: 'schatzmeister[at]automobilclub-warendorf.de', imageUrl: '/images/vorstand/erika-musterfrau.png' },
  { id: '3', name: 'Maik Derksen', role: 'Programmierer', term: '→ 2026', email: 'webmaster[at]automobilclub-warendorf.de', imageUrl: '/images/vorstand/maik-derksen.png' },
  { id: '4', name: 'Sabine Sportlich', role: 'Sportleiterin', term: '→ 2025', email: 'sportleiter[at]automobilclub-warendorf.de', imageUrl: '/images/vorstand/sabine-sportlich.png' },
  { id: '5', name: 'Klaus Kart', role: 'Jugendleiter', term: '→ 2026', email: 'jugend[at]automobilclub-warendorf.de', imageUrl: '/images/vorstand/klaus-kart.png' },
];

export const mockPilots: Pilot[] = [
  { 
    id: 'p1', 
    name: 'Louis', 
    profileSlug: 'louis', 
    imageUrl: '/images/pilots/louis.jpg',
    bio: 'Hallo! Ich bin Louis und fahre leidenschaftlich gerne Kart-Slalom für den AC Warendorf. Der Motorsport fasziniert mich schon seit meiner Kindheit. Disziplin, Konzentration und der Nervenkitzel auf der Strecke sind das, was mich antreibt. Mein Ziel ist es, mich stetig zu verbessern und den Verein erfolgreich zu vertreten. Ich bin besonders stolz darauf, 2024 den Weltmeistertitel errungen zu haben!',
    achievements: [
      'Weltmeister Kart-Slalom 2024',
      'Mehrfacher Vereinsmeister AC Warendorf',
      'Podiumsplätze bei ADAC Westfalen-Läufen',
      'Teilnahme an der Deutschen Meisterschaft'
    ]
  },
  { 
    id: 'p2', 
    name: 'Sophie', 
    profileSlug: 'sophie', 
    imageUrl: '/images/pilots/sophie.png',
    bio: 'Ich bin Sophie und neu im Kart-Slalom Team. Ich lerne schnell und freue mich auf meine erste Rennsaison mit dem AC Warendorf. Mein Vorbild ist Louis, und ich hoffe, eines Tages genauso erfolgreich zu sein.',
    achievements: [
      'Beste Newcomerin beim Vereinstraining 2024',
      'Erfolgreiche Teilnahme am Schnupperkurs'
    ]
  },
  { id: 'p3', name: 'Finn', profileSlug: 'finn', imageUrl: '/images/pilots/finn.png' },
  { id: 'p4', name: 'Lena', profileSlug: 'lena', imageUrl: '/images/pilots/lena.png' },
  { id: 'p5', name: 'RacerX', profileSlug: 'racerx', imageUrl: '/images/pilots/racerx.png' },
  { id: 'p6', name: 'Speedy Gonzales', imageUrl: '/images/pilots/speedy-gonzales.png'},
];

export const mockFaqItems: FaqItem[] = [
  {
    id: 'faq1',
    question: 'Wie komme ich in den Club?',
    answer: 'Die Grundvoraussetzung ist Interesse am Motorsport und Teamgeist. Nimm einfach Kontakt mit unserem Vorstand auf, um weitere Details zu besprechen und ein Schnuppertraining zu vereinbaren.'
  },
  {
    id: 'faq2',
    question: 'Wie oft trainieren wir?',
    answer: 'In der Regel trainieren wir einmal pro Woche. Vor wichtigen Turnieren oder bei Bedarf kann das Training auch auf bis zu 2-3 Mal pro Woche intensiviert werden.'
  },
  {
    id: 'faq3',
    question: 'Gibt es Turniere oder andere Wettbewerbe?',
    answer: 'Ja, unsere Fahrer nehmen regelmäßig an Wettbewerben teil. Dazu gehören sieben bis acht Vorläufe des ADAC Westfalen. Bei entsprechender Qualifikation besteht die Chance auf Teilnahme am Westfalen-Endlauf, Bundesendlauf (ADAC) sowie der NRW-Meisterschaft und Deutschen Meisterschaft (DMSJ).'
  },
  {
    id: 'faq4',
    question: 'Was brauche ich an Ausrüstung?',
    answer: 'Ein Helm und eine Sturmhaube werden vom Club gestellt. Wichtig ist, dass der gesamte Körper bedeckt ist (lange Hose, langärmeliges Oberteil, festes Schuhwerk). Eigene Handschuhe sind empfehlenswert.'
  },
  {
    id: 'faq5',
    question: 'Was kostet der Eintritt in den AC Warendorf?',
    answer: 'Der Jahresbeitrag beträgt 100 € pro Fahrer. Zusätzlich muss mindestens ein Elternteil ADAC-Mitglied sein. Für Turniere fallen separate Nenngebühren an.'
  },
  {
    id: 'faq6',
    question: 'Wieso Kartslalom?',
    answer: 'Kartslalom ist ein idealer Einstieg in den Motorsport. Es fördert Konzentration, Reaktionsschnelligkeit und Fahrzeugbeherrschung auf spielerische Weise. Zudem ist es eine vergleichsweise kostengünstige Motorsportvariante und bietet viel Spaß in einer tollen Gemeinschaft.'
  }
];
