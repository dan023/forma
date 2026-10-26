import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Card, Well } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { db } from '@/db/client';
import { MEAL_ICONS } from '@/db/schema';
import { mealSlotsQuery, type MealSlot } from '@/features/diary/diary';
import { addMeal, hiddenMealSlotsQuery, mealIcon, moveMeal, renameMeal, setMealHidden, setMealIcon, type MealIcon } from '@/features/diary/meal-slots';
import { mealName } from '@/features/diary/meal-name';
import { MealTile } from '@/features/diary/meal-tile';
import { useTheme } from '@/hooks/use-theme';

/**
 * Pasti del diario: ordine (su/giù), nome e icona (si apre un pasto alla volta), nascondere e mostrare, aggiungere.
 * Un pasto nascosto sparisce dal diario e dalla ricerca, ma le voci dei giorni passati restano.
 */
export default function ModificaPasti() {
  const { t } = useTranslation();
  const { data: visible } = useLiveQuery(mealSlotsQuery(db));
  const { data: hidden } = useLiveQuery(hiddenMealSlotsQuery(db));
  const [open, setOpen] = useState<string | null>(null);

  const add = () => {
    const id = addMeal(db, t('mealsEdit.newName', { n: visible.length + hidden.length + 1 }));
    setOpen(id);
  };

  return (
    <Screen back tabBar={false} eyebrow={t('mealsEdit.eyebrow')} title={t('mealsEdit.title')}>
      <Text muted className="mx-1">
        {t('mealsEdit.intro')}
      </Text>
      <Card className="py-1.5">
        {visible.map((slot, i) => (
          <MealEditor
            key={slot.id}
            slot={slot}
            first={i === 0}
            last={i === visible.length - 1}
            open={open === slot.id}
            onToggle={() => setOpen(open === slot.id ? null : slot.id)}
            onHide={() => {
              setMealHidden(db, slot.id, true);
              setOpen(null);
            }}
          />
        ))}
      </Card>

      {hidden.length > 0 && (
        <>
          <Text variant="h2" className="mt-2">
            {t('mealsEdit.hidden')}
          </Text>
          <Card className="py-1.5">
            {hidden.map((slot, i) => (
              <View key={slot.id} className={`min-h-16 flex-row items-center gap-3 py-2.5 ${i ? 'border-t border-line' : ''}`}>
                <MealTile icon={mealIcon(slot)} muted />
                <Text className="flex-1 font-sans-semibold text-[15px]">{mealName(slot, t)}</Text>
                <Button variant="outline" size="sm" label={t('mealsEdit.show')} onPress={() => setMealHidden(db, slot.id, false)} />
              </View>
            ))}
          </Card>
        </>
      )}

      <Button variant="secondary" icon="plus" label={t('mealsEdit.add')} onPress={add} />
    </Screen>
  );
}

/** Un pasto: tessera, nome, su/giù e "modifica"; aperto, nome, icona e "Nascondi". */
function MealEditor({
  slot,
  first,
  last,
  open,
  onToggle,
  onHide,
}: {
  slot: MealSlot;
  first: boolean;
  last: boolean;
  open: boolean;
  onToggle: () => void;
  onHide: () => void;
}) {
  const { t } = useTranslation();
  const name = mealName(slot, t);
  // Mentre si scrive vale il testo; il nome si salva a ogni tasto (vuoto = torna il nome predefinito).
  const [text, setText] = useState<string | null>(null);
  return (
    <View className={first ? '' : 'border-t border-line'}>
      <View className="min-h-16 flex-row items-center gap-2 py-2.5">
        <MealTile icon={mealIcon(slot)} />
        <Text className="ml-1 flex-1 font-sans-semibold text-[15px]">{name}</Text>
        {!first && <IconButton size={44} onCard icon="up" label={t('mealsEdit.moveUp', { meal: name })} onPress={() => moveMeal(db, slot.id, -1)} />}
        {!last && <IconButton size={44} onCard icon="down" label={t('mealsEdit.moveDown', { meal: name })} onPress={() => moveMeal(db, slot.id, 1)} />}
        <IconButton
          size={44}
          onCard
          icon={open ? 'close' : 'sliders'}
          selected={open}
          label={open ? t('mealsEdit.close', { meal: name }) : t('mealsEdit.edit', { meal: name })}
          onPress={onToggle}
        />
      </View>
      {open && (
        <View className="gap-2 pb-4">
          <Text variant="label">{t('mealsEdit.name')}</Text>
          <Well className="px-4">
            <TextInput
              value={text ?? name}
              onFocus={() => setText(name)}
              onChangeText={(v) => {
                setText(v);
                renameMeal(db, slot.id, v);
              }}
              onEndEditing={() => setText(null)}
              accessibilityLabel={t('mealsEdit.name')}
              returnKeyType="done"
              maxLength={30}
              className="font-sans-semibold text-base text-ink"
              style={{ minHeight: 48 }}
            />
          </Well>
          <Text variant="label" className="mt-2">
            {t('mealsEdit.icon')}
          </Text>
          {/* due righe da sei, a qualunque larghezza */}
          <View className="gap-2" accessibilityRole="radiogroup" accessibilityLabel={t('mealsEdit.icon')}>
            {[MEAL_ICONS.slice(0, 6), MEAL_ICONS.slice(6)].map((row) => (
              <View key={row[0]} className="flex-row justify-between">
                {row.map((icon) => (
                  <IconChoice key={icon} icon={icon} selected={mealIcon(slot) === icon} onPress={() => setMealIcon(db, slot.id, icon)} />
                ))}
              </View>
            ))}
          </View>
          <Button className="mt-2" variant="outline" size="md" icon="eyeoff" label={t('mealsEdit.hide', { meal: name })} onPress={onHide} />
        </View>
      )}
    </View>
  );
}

/** Un'icona tra cui scegliere quella del pasto: scelta = tinta forte con bordo d'accento. */
function IconChoice({ icon, selected, onPress }: { icon: MealIcon; selected: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={t(`mealsEdit.icons.${icon}`)}
      onPress={onPress}
      className={`h-11 w-11 items-center justify-center rounded-[14px] active:opacity-70 ${selected ? 'border-2 border-accent bg-tint-strong' : 'bg-bg'}`}>
      <Icon name={icon} color={selected ? theme.accentInk : theme.ink} size={24} />
    </Pressable>
  );
}
