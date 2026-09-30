import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';

export default function Pasti() {
  const { t } = useTranslation();
  return (
    <Screen eyebrow={t('meals.eyebrow')} title={t('meals.title')}>
      <Card>
        <Text variant="h2">{t('common.soon')}</Text>
        <Text muted className="mt-1">{t('meals.soon')}</Text>
      </Card>
    </Screen>
  );
}
