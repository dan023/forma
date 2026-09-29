import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './text';

/** Pagina con eyebrow + titolo grande. Lascia spazio in basso per la nav a pillola. */
export function Screen({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      className="bg-bg"
      contentContainerClassName="gap-[14px] px-5"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 }}>
      <View className="mb-2">
        <Text variant="eyebrow" muted>
          {eyebrow}
        </Text>
        <Text variant="title" className="mt-1.5">
          {title}
        </Text>
      </View>
      {children}
    </ScrollView>
  );
}
