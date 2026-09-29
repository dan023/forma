import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';

export default function Statistiche() {
  return (
    <Screen eyebrow="Ultimi 90 giorni" title="Statistiche">
      <Card>
        <Text variant="h2">Presto</Text>
        <Text muted className="mt-1">Peso, calorie, volume.</Text>
      </Card>
    </Screen>
  );
}
