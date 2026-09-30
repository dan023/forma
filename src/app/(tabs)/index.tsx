import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';

export default function Oggi() {
  const { t, i18n } = useTranslation();
  const today = new Date().toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <Screen eyebrow={today} title={t('today.greeting', { name: 'Daniele' })}>
      <Card>
        <Text variant="h2">{t('common.soon')}</Text>
        <Text muted className="mt-1">{t('today.soon')}</Text>
      </Card>
    </Screen>
  );
}
