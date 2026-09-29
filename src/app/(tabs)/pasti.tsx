import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';

export default function Pasti() {
  return (
    <Screen eyebrow="Diario alimentare" title="I tuoi pasti">
      <Card>
        <Text variant="h2">Presto</Text>
        <Text muted className="mt-1">Diario per pasto, ricerca alimenti, barcode.</Text>
      </Card>
    </Screen>
  );
}
