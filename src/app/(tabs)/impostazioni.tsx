import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { LANGUAGE_NAMES, LANGUAGES, type LanguagePreference } from '@/i18n';
import { useSettings } from '@/stores/settings';

const OPTIONS: LanguagePreference[] = ['system', ...LANGUAGES];

export default function Impostazioni() {
  const { t } = useTranslation();
  const language = useSettings((s) => s.language);
  const setLanguage = useSettings((s) => s.setLanguage);

  return (
    <Screen eyebrow={t('settings.eyebrow')} title={t('settings.title')}>
      <Card>
        <Text variant="h2">{t('settings.language.title')}</Text>
        <View className="mt-3 flex-row rounded-full bg-control p-1" accessibilityRole="radiogroup">
          {OPTIONS.map((option) => {
            const selected = option === language;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setLanguage(option)}
                className={`min-h-11 flex-1 items-center justify-center rounded-full ${selected ? 'bg-card' : ''}`}>
                <Text className={`font-sans-semibold text-sm ${selected ? 'text-ink' : 'text-ink-2'}`}>
                  {option === 'system' ? t('settings.language.system') : LANGUAGE_NAMES[option]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>
      <Card>
        <Text variant="h2">{t('common.soon')}</Text>
        <Text muted className="mt-1">{t('settings.soon')}</Text>
      </Card>
    </Screen>
  );
}
