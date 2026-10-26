import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View, type TextInputInstance } from 'react-native';

import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

import type { Exercise } from './exercises';
import { useTrainingFormat } from './use-training-format';
import type { SetValues, WorkoutSet } from './workout';

const parseKg = (s: string) => {
  const v = parseFloat(s.replace(',', '.'));
  return Number.isFinite(v) && v >= 0 ? Math.round(v * 100) / 100 : null;
};
const parseInt0 = (s: string) => {
  const v = parseInt(s.replace(/\D/g, ''), 10);
  return Number.isFinite(v) ? v : null;
};

/** Campo numerico di una serie: il suggerimento dell'ultima volta è il segnaposto. */
function NumField({
  ref,
  value,
  onChangeText,
  onEndEditing,
  placeholder,
  width,
  label,
  decimal,
  done,
}: {
  ref?: React.Ref<TextInputInstance>;
  value: string;
  onChangeText: (s: string) => void;
  onEndEditing: () => void;
  placeholder: string;
  width: string;
  label: string;
  decimal?: boolean;
  done: boolean;
}) {
  const theme = useTheme();
  return (
    <TextInput
      ref={ref}
      value={value}
      onChangeText={onChangeText}
      onEndEditing={onEndEditing}
      placeholder={placeholder}
      placeholderTextColor={theme.ink2}
      keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
      returnKeyType="done"
      selectTextOnFocus
      accessibilityLabel={label}
      className={`${width} h-11 rounded-inner text-center font-sans-semibold text-base tabular-nums text-ink ${done ? 'bg-card' : 'bg-bg'}`}
    />
  );
}

/** Larghezze delle colonne, condivise con l'intestazione in `ExerciseCard`. */
export const COLS = { n: 'w-7', prev: 'flex-1', kg: 'w-[68px]', reps: 'w-14', sec: 'w-[76px]', done: 'w-11' } as const;

/**
 * Una serie della sessione: numero, valori dell'ultima volta, campi (kg e rip, solo rip per il corpo libero,
 * secondi per gli esercizi a tempo) e spunta. Un campo vuoto mostra il suggerimento (l'ultima volta o l'obiettivo
 * della scheda) e, se si spunta la serie senza scrivere nulla, vale quello.
 */
export function SetRow({
  set,
  index,
  kind,
  hint,
  target,
  onChange,
  onToggle,
}: {
  set: WorkoutSet;
  index: number;
  kind: Exercise['kind'];
  hint?: WorkoutSet;
  /** Obiettivo della scheda: suggerimento quando non c'è un'ultima volta. */
  target?: { reps: number | null; durationSec: number | null };
  onChange: (values: Partial<SetValues>) => void;
  onToggle: (values: Partial<SetValues> | null) => void;
}) {
  const { t } = useTranslation();
  const f = useTrainingFormat();
  const done = set.completedAt != null;
  const show = (v: number | null, d = 0) => (v == null ? '' : f.n(v, d));
  const [kg, setKg] = useState(show(set.weightKg, 2));
  const [reps, setReps] = useState(show(set.reps));
  const [sec, setSec] = useState(show(set.durationSec));
  // Se un valore salvato cambia da fuori (spunta con i suggerimenti, serie copiata) il campo lo segue. Si aggiorna
  // durante il render e solo il campo cambiato: chi sta scrivendo in un altro campo non perde il testo né il fuoco.
  const [saved, setSaved] = useState({ w: set.weightKg, r: set.reps, d: set.durationSec });
  if (saved.w !== set.weightKg || saved.r !== set.reps || saved.d !== set.durationSec) {
    if (saved.w !== set.weightKg) setKg(show(set.weightKg, 2));
    if (saved.r !== set.reps) setReps(show(set.reps));
    if (saved.d !== set.durationSec) setSec(show(set.durationSec));
    setSaved({ w: set.weightKg, r: set.reps, d: set.durationSec });
  }

  // Suggerimenti: l'ultima volta, altrimenti l'obiettivo della scheda (il peso non ha obiettivo).
  const sug = {
    weightKg: hint?.weightKg ?? null,
    reps: hint?.reps ?? target?.reps ?? null,
    durationSec: hint?.durationSec ?? target?.durationSec ?? null,
  };
  const repsRef = useRef<TextInputInstance>(null);
  const secRef = useRef<TextInputInstance>(null);
  const n = index + 1;
  const values = (): Partial<SetValues> =>
    kind === 'timed'
      ? { durationSec: parseInt0(sec) ?? sug.durationSec }
      : { weightKg: kind === 'bodyweight' ? parseKg(kg) : (parseKg(kg) ?? sug.weightKg), reps: parseInt0(reps) ?? sug.reps };

  return (
    <View className={`min-h-[52px] flex-row items-center gap-2 rounded-inner px-2 ${done ? 'bg-tint' : ''}`}>
      <Text variant="num" className={`${COLS.n} text-center text-[15px] ${done ? 'text-accent-ink' : 'text-ink-2'}`}>
        {n}
      </Text>
      <Text variant="label" className={`${COLS.prev} tabular-nums`} numberOfLines={1}>
        {hint ? f.setText(hint, kind) : '–'}
      </Text>
      {kind === 'timed' ? (
        <NumField ref={secRef} value={sec} onChangeText={setSec} onEndEditing={() => onChange({ durationSec: parseInt0(sec) })} placeholder={show(sug.durationSec)} width={COLS.sec} label={t('training.session.secondsInput', { n })} done={done} />
      ) : (
        <>
          {kind === 'weight' && (
            <NumField decimal value={kg} onChangeText={setKg} onEndEditing={() => onChange({ weightKg: parseKg(kg) })} placeholder={show(sug.weightKg, 2)} width={COLS.kg} label={t('training.session.weightInput', { n })} done={done} />
          )}
          <NumField ref={repsRef} value={reps} onChangeText={setReps} onEndEditing={() => onChange({ reps: parseInt0(reps) })} placeholder={show(sug.reps)} width={COLS.reps} label={t('training.session.repsInput', { n })} done={done} />
        </>
      )}
      <IconButton
        size={44}
        onCard={!done}
        icon="check"
        selected={done}
        label={done ? t('training.session.undoSet', { n }) : t('training.session.completeSet', { n })}
        onPress={() => {
          if (done) return onToggle(null);
          const v = values();
          // Senza ripetizioni (o secondi) né suggerimento la serie non si salva a metà: si va al campo da riempire.
          if (kind === 'timed' ? !v.durationSec : !v.reps) return (kind === 'timed' ? secRef : repsRef).current?.focus();
          onToggle(v);
        }}
      />
    </View>
  );
}
