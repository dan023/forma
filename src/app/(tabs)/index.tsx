import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';

export default function Oggi() {
  return (
    <Screen eyebrow="Lunedì 29 settembre" title="Ciao, Daniele">
      <Card>
        <Text variant="h2">Presto</Text>
        <Text muted className="mt-1">Anello calorie, macro, allenamento del giorno.</Text>
      </Card>
    </Screen>
  );
}
