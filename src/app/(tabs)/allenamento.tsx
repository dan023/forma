import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';

export default function Allenamento() {
  return (
    <Screen eyebrow="Palestra" title="Allenamento">
      <Card>
        <Text variant="h2">Presto</Text>
        <Text muted className="mt-1">Sessione, serie, timer di recupero.</Text>
      </Card>
    </Screen>
  );
}
