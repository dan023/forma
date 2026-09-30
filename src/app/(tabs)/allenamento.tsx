import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';

export default function Allenamento() {
  const { t } = useTranslation();
  return (
    <Screen eyebrow={t('training.eyebrow')} title={t('training.title')}>
      <Card>
        <Text variant="h2">{t('common.soon')}</Text>
        <Text muted className="mt-1">{t('training.soon')}</Text>
      </Card>
    </Screen>
  );
}
