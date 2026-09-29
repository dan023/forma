import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';

export default function Impostazioni() {
  return (
    <Screen eyebrow="Tutto tuo" title="Impostazioni">
      <Card>
        <Text variant="h2">Presto</Text>
        <Text muted className="mt-1">Tema, accento, obiettivi, export.</Text>
      </Card>
    </Screen>
  );
}
