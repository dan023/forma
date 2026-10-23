import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from './icon-button';
import { Text } from './text';

/**
 * Pagina: etichetta piccola (`eyebrow`) sopra un titolo di 28 px, con un'azione rotonda a destra (`right`).
 * Con `back` la prima riga è il tasto indietro (chrome: vetro su iOS 26) con l'azione a destra.
 * `tabBar` lascia spazio in basso per la barra delle tab.
 */
export function Screen({
  eyebrow,
  title,
  back,
  right,
  tabBar = true,
  compactTitle,
  children,
  footer,
}: {
  eyebrow?: string;
  title?: ReactNode;
  back?: boolean;
  right?: ReactNode;
  tabBar?: boolean;
  /** Titolo più piccolo, per testi lunghi. */
  compactTitle?: boolean;
  children?: ReactNode;
  /** Elementi sopra lo scorrimento (es. un avviso o un pulsante fisso). */
  footer?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const heading = (
    <View className="flex-1">
      {eyebrow ? <Text variant="label">{eyebrow}</Text> : null}
      {title ? (
        <Text variant={compactTitle ? 'titleSm' : 'title'} className={eyebrow ? 'mt-0.5' : ''} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
    </View>
  );
  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        className="bg-bg"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="gap-3.5 px-5"
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + (tabBar ? 120 : 32) }}>
        {back ? (
          <View className="mb-1 gap-3.5">
            <View className="flex-row items-center justify-between">
              <IconButton glass icon="back" label={t('common.back')} onPress={() => router.back()} />
              {right}
            </View>
            {heading}
          </View>
        ) : (
          <View className="mb-1 min-h-12 flex-row items-center gap-3">
            {heading}
            {right}
          </View>
        )}
        {children}
      </ScrollView>
      {/* fascia sotto la barra di stato: il contenuto che scorre non passa sotto l'ora e le icone */}
      <View className="absolute left-0 right-0 top-0 bg-bg" style={{ height: insets.top }} />
      {footer}
    </View>
  );
}
