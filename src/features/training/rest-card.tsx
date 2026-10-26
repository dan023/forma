import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Vibration, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Donut } from '@/components/ui/donut';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { useRestTimer } from '@/stores/rest-timer';

import { clock } from './stats';

/** Recupero in corso: anello che si svuota, tempo grande, ±15 s e Salta. Vibra una volta quando finisce. */
export function RestCard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { endsAt, total, add, stop } = useRestTimer();
  const now = useNow(endsAt != null, 500);
  const left = endsAt == null ? 0 : Math.max(0, (endsAt - now) / 1000);
  const over = endsAt != null && left <= 0;
  const buzzed = useRef<number | null>(null);
  useEffect(() => {
    if (over && buzzed.current !== endsAt) {
      buzzed.current = endsAt;
      Vibration.vibrate(400);
    }
  }, [over, endsAt]);
  if (endsAt == null) return null;

  return (
    <Card tint className="gap-3 p-4" accessibilityLiveRegion="polite">
      <View className="flex-row items-center gap-4">
        <Donut size={64} stroke={6} segments={[{ value: left / total, color: theme.accent }]} />
        <View className="flex-1">
          <Text variant="label" accent>
            {over ? t('training.rest.over') : t('training.rest.title')}
          </Text>
          <Text variant="num" className="text-[34px] leading-10">
            {clock(left)}
          </Text>
        </View>
        <Text variant="label">{t('training.rest.of', { total: clock(total) })}</Text>
      </View>
      <View className="flex-row gap-2">
        <Button className="flex-1" size="sm" variant="outline" label={t('training.rest.minus')} accessibilityLabel={t('training.rest.minusLabel')} onPress={() => add(-15)} />
        <Button className="flex-1" size="sm" variant="outline" label={t('training.rest.plus')} accessibilityLabel={t('training.rest.plusLabel')} onPress={() => add(15)} />
        <Button className="flex-1" size="sm" variant="secondary" label={t('training.rest.skip')} onPress={stop} />
      </View>
    </Card>
  );
}
