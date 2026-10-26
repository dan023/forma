import { router } from 'expo-router';
import type { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, View, type FlatListProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from './icon-button';
import { Text } from './text';

/**
 * Pagina: etichetta piccola (`eyebrow`) sopra un titolo di 28 px, con un'azione rotonda a destra (`right`).
 * Con `back` la prima riga è il tasto indietro (chrome: vetro su iOS 26) con l'azione a destra.
 * `tabBar` lascia spazio in basso per la barra delle tab. `leading` va a sinistra del titolo (es. una tessera).
 */
export function Screen({
  eyebrow,
  title,
  leading,
  back,
  right,
  tabBar = true,
  compactTitle,
  children,
  footer,
}: {
  eyebrow?: string;
  title?: ReactNode;
  leading?: ReactNode;
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
  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        className="bg-bg"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="gap-3.5 px-5"
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + (tabBar ? 120 : 32) }}>
        <ScreenHeader eyebrow={eyebrow} title={title} leading={leading} back={back} right={right} compactTitle={compactTitle} />
        {children}
      </ScrollView>
      {/* fascia sotto la barra di stato: il contenuto che scorre non passa sotto l'ora e le icone */}
      <View className="absolute left-0 right-0 top-0 bg-bg" style={{ height: insets.top }} />
      {footer}
    </View>
  );
}

type HeaderProps = { eyebrow?: string; title?: ReactNode; leading?: ReactNode; back?: boolean; right?: ReactNode; compactTitle?: boolean };

function ScreenHeader({ eyebrow, title, leading, back, right, compactTitle }: HeaderProps) {
  const { t } = useTranslation();
  // `flex-1` solo accanto all'azione: sotto il tasto indietro, dentro una FlatList, lo schiaccerebbe a zero.
  const text = (
    <View className={back && !leading ? '' : 'flex-1'}>
      {eyebrow ? <Text variant="label">{eyebrow}</Text> : null}
      {title ? (
        <Text variant={compactTitle ? 'titleSm' : 'title'} className={eyebrow ? 'mt-0.5' : ''} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
    </View>
  );
  const heading = leading ? (
    <View className={`flex-row items-center gap-3.5 ${back ? '' : 'flex-1'}`}>
      {leading}
      {text}
    </View>
  ) : (
    text
  );
  return back ? (
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
  );
}

/**
 * Come `Screen`, ma il contenuto è un elenco lungo virtualizzato (`FlatList`): si disegnano solo le righe visibili.
 * `top` va sotto l'intestazione, prima delle righe (ricerca, filtri).
 */
export function ListScreen<T>({
  top,
  footer,
  tabBar = true,
  ...props
}: HeaderProps &
  Pick<FlatListProps<T>, 'data' | 'renderItem' | 'keyExtractor' | 'ListEmptyComponent'> & {
    top?: ReactElement;
    tabBar?: boolean;
    footer?: ReactNode;
  }) {
  const insets = useSafeAreaInsets();
  const { eyebrow, title, leading, back, right, compactTitle, ...list } = props;
  return (
    <View className="flex-1 bg-bg">
      <FlatList
        {...list}
        className="bg-bg"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="px-5"
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + (tabBar ? 120 : 32) }}
        initialNumToRender={14}
        maxToRenderPerBatch={20}
        windowSize={11}
        ListHeaderComponent={
          <View className="mb-3.5 gap-3.5">
            <ScreenHeader eyebrow={eyebrow} title={title} leading={leading} back={back} right={right} compactTitle={compactTitle} />
            {top}
          </View>
        }
      />
      <View className="absolute left-0 right-0 top-0 bg-bg" style={{ height: insets.top }} />
      {footer}
    </View>
  );
}
