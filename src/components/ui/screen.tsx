import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from './icon-button';
import { Text } from './text';

/**
 * Pagina con eyebrow + titolo grande. Con `back` mostra il tasto indietro (chrome: vetro su iOS 26) accanto
 * all'eyebrow, come nel prototipo. `tabBar` lascia spazio in basso per la barra delle tab.
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
  eyebrow: string;
  title?: ReactNode;
  back?: boolean;
  right?: ReactNode;
  tabBar?: boolean;
  /** Titolo più piccolo, per testi lunghi. */
  compactTitle?: boolean;
  children?: ReactNode;
  /** Elementi sopra lo scorrimento (es. un avviso). */
  footer?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        className="bg-bg"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="gap-[14px] px-5"
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + (tabBar ? 120 : 32) }}>
        <View className="mb-2">
          {back ? (
            <View className="mb-3.5 flex-row items-center gap-3">
              <IconButton glass label={t('common.back')} onPress={() => router.back()}>
                {Platform.OS === 'ios' ? '‹' : '←'}
              </IconButton>
              <Text variant="eyebrow" muted className="flex-1" accessibilityRole="header">
                {eyebrow}
              </Text>
              {right}
            </View>
          ) : (
            <Text variant="eyebrow" muted>
              {eyebrow}
            </Text>
          )}
          {title ? (
            <Text variant={compactTitle ? 'titleSm' : 'title'} className={back ? '' : 'mt-1.5'} accessibilityRole="header">
              {title}
            </Text>
          ) : null}
        </View>
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}
