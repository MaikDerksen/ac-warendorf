
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { BoardMember } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Users, Save } from 'lucide-react';

const MAX_CONTACT_PERSONS = 4;

export function HomepageContactManager() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(Array(MAX_CONTACT_PERSONS).fill(''));
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!user || !isAdmin) {
        setIsLoadingData(false);
        return;
      }
      setIsLoadingData(true);
      try {
        const [membersRes, settingsRes] = await Promise.all([
          fetch('/api/admin/vorstand'), // Assumes GET endpoint for board members exists
          fetch('/api/admin/settings/homepage-contacts')
        ]);

        if (!membersRes.ok) throw new Error('Vorstandsmitglieder konnten nicht geladen werden.');
        const membersData = await membersRes.json();
        setBoardMembers(membersData);

        if (!settingsRes.ok) throw new Error('Aktuelle Kontakteinstellungen konnten nicht geladen werden.');
        const settingsData = await settingsRes.json();
        const currentIds = settingsData.contactPersonIds || [];
        const initialSelection = Array(MAX_CONTACT_PERSONS).fill('');
        currentIds.slice(0, MAX_CONTACT_PERSONS).forEach((id: string, index: number) => {
          initialSelection[index] = id;
        });
        setSelectedContactIds(initialSelection);

      } catch (error: any) {
        toast({
          title: 'Fehler beim Laden der Daten',
          description: error.message || 'Ein unbekannter Fehler ist aufgetreten.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingData(false);
      }
    }
    if (!authLoading && user && isAdmin) {
      fetchData();
    } else if (!authLoading && (!user || !isAdmin)) {
        setIsLoadingData(false);
    }
  }, [user, isAdmin, authLoading, toast]);

  const handleSelectChange = (index: number, value: string) => {
    const newSelection = [...selectedContactIds];
    // Prevent duplicate selections
    if (value && newSelection.some((id, i) => id === value && i !== index)) {
        toast({
            title: "Doppelte Auswahl",
            description: "Diese Person wurde bereits ausgewählt. Bitte wählen Sie eine andere Person.",
            variant: "default"
        });
        return;
    }
    newSelection[index] = value;
    setSelectedContactIds(newSelection);
  };

  const handleSave = async () => {
    if (!user || !isAdmin) {
      toast({ title: 'Nicht berechtigt', description: 'Sie müssen Admin sein, um dies zu speichern.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    const finalContactIds = selectedContactIds.filter(id => id && id !== ''); // Filter out empty strings or placeholder values

    if (new Set(finalContactIds).size !== finalContactIds.length) {
        toast({
            title: "Fehler: Doppelte Auswahl",
            description: "Bitte stellen Sie sicher, dass jede Person nur einmal ausgewählt wird.",
            variant: "destructive"
        });
        setIsSaving(false);
        return;
    }
    
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/admin/settings/homepage-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ contactPersonIds: finalContactIds }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Fehler beim Speichern.');
      toast({
        title: 'Gespeichert!',
        description: 'Die Ansprechpartner für die Homepage wurden aktualisiert.',
      });
    } catch (error: any) {
      toast({
        title: 'Fehler beim Speichern',
        description: error.message || 'Ein unbekannter Fehler ist aufgetreten.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (authLoading || isLoadingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Homepage Ansprechpartner</CardTitle>
          <CardDescription>Auswahl der Ansprechpartner für die Startseite.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Lade Daten...</span>
        </CardContent>
      </Card>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Homepage Ansprechpartner</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Bitte als Admin anmelden, um die Ansprechpartner zu verwalten.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Homepage Ansprechpartner Verwalten</CardTitle>
        <CardDescription>Wählen Sie bis zu {MAX_CONTACT_PERSONS} Ansprechpartner aus, die auf der Startseite angezeigt werden sollen.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedContactIds.map((selectedId, index) => (
          <div key={index} className="space-y-2">
            <Label htmlFor={`contact-person-${index}`}>Ansprechpartner {index + 1}</Label>
            <Select
              value={selectedId}
              onValueChange={(value) => handleSelectChange(index, value)}
            >
              <SelectTrigger id={`contact-person-${index}`}>
                <SelectValue placeholder="-- Bitte wählen --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- Keiner --</SelectItem>
                {boardMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id} disabled={selectedContactIds.includes(member.id) && selectedId !== member.id}>
                    {member.name} ({member.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        <Button onClick={handleSave} disabled={isSaving || isLoadingData}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Auswahl Speichern
        </Button>
      </CardContent>
    </Card>
  );
}
