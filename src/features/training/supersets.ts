/**
 * Superserie: esercizi vicini con lo stesso `supersetGroup` (in una scheda o in un allenamento). Le funzioni qui
 * lavorano sull'elenco in ordine e restituiscono il nuovo elenco con i gruppi rinumerati, da scrivere nel DB con
 * posizione = indice. Così una superserie resta sempre un blocco contiguo di almeno due esercizi.
 */

export type Grouped = { id: string; supersetGroup: number | null };

/**
 * Numera i blocchi di vicini con la stessa etichetta da 1, in ordine; un esercizio da solo non ha gruppo.
 * L'etichetta di partenza può essere qualsiasi cosa (il vecchio gruppo, un segnaposto).
 */
function renumber(ids: string[], labels: unknown[]): Grouped[] {
  const out: Grouped[] = [];
  let next = 1;
  for (let i = 0; i < ids.length; ) {
    let j = i + 1;
    while (j < ids.length && labels[j] != null && labels[j] === labels[i]) j++;
    const group = j - i > 1 ? next++ : null;
    for (let k = i; k < j; k++) out.push({ id: ids[k], supersetGroup: group });
    i = j;
  }
  return out;
}

/** Etichette dei blocchi: il gruppo, o una propria per chi è da solo. */
const labelsOf = (list: Grouped[]) => list.map((it, i) => it.supersetGroup ?? `solo:${i}`);

/** Rinumera i gruppi (dopo aver tolto un esercizio: un gruppo rimasto con uno solo sparisce). */
export const normalizeSupersets = (list: Grouped[]) => renumber(list.map((it) => it.id), labelsOf(list));

/** Se l'esercizio `i` e il successivo sono nella stessa superserie. */
export const linkedToNext = (list: Grouped[], i: number) =>
  list[i]?.supersetGroup != null && list[i].supersetGroup === list[i + 1]?.supersetGroup;

/**
 * Collega (`on`) o separa l'esercizio `i` dal successivo. Collegare unisce i due blocchi; separare divide il
 * blocco in due in quel punto.
 */
export function linkWithNext(list: Grouped[], i: number, on: boolean): Grouped[] {
  if (i < 0 || i >= list.length - 1) return normalizeSupersets(list);
  const labels: unknown[] = labelsOf(list);
  const from = labels[i + 1];
  const to = on ? labels[i] : `split:${i}`;
  for (let k = i + 1; k < list.length && labels[k] === from; k++) labels[k] = to;
  return renumber(
    list.map((it) => it.id),
    labels,
  );
}

/**
 * Sposta l'esercizio `i` di un posto (-1 su, +1 giù). Dentro una superserie scambia con il vicino; altrimenti
 * scavalca tutto il blocco vicino (una superserie intera) e, se era in una superserie, ne esce. Null se è già in
 * cima o in fondo.
 */
export function moveInList(list: Grouped[], i: number, dir: -1 | 1): Grouped[] | null {
  const j = i + dir;
  if (j < 0 || j >= list.length) return null;
  const ids = list.map((it) => it.id);
  const labels: unknown[] = labelsOf(list);
  if (linkedToNext(list, Math.min(i, j))) {
    [ids[i], ids[j]] = [ids[j], ids[i]];
    return renumber(ids, labels);
  }
  // Fine del blocco vicino nella direzione dello spostamento.
  let end = j;
  while (end + dir >= 0 && end + dir < list.length && labels[end + dir] === labels[j]) end += dir;
  // Tolto `i`, `end` è il posto giusto in entrambe le direzioni: subito dopo il blocco (giù, gli indici sono
  // scalati di uno) o subito prima (su).
  const [id] = ids.splice(i, 1);
  labels.splice(i, 1);
  ids.splice(end, 0, id);
  labels.splice(end, 0, `moved:${id}`);
  return renumber(ids, labels);
}

/** L'elenco diviso in blocchi: una superserie è un blocco di più esercizi, gli altri sono blocchi da uno. */
export function supersetBlocks<T>(list: T[], groupOf: (it: T) => number | null): T[][] {
  const out: T[][] = [];
  list.forEach((it, i) => {
    const g = groupOf(it);
    if (i > 0 && g != null && g === groupOf(list[i - 1])) out[out.length - 1].push(it);
    else out.push([it]);
  });
  return out;
}

/**
 * Se dopo aver fatto la serie `setIndex` dell'esercizio `exerciseIndex` (in un blocco) parte il recupero: in una
 * superserie solo quando nessun esercizio successivo del blocco ha ancora da fare la serie con lo stesso numero.
 */
export function restAfterSet(block: { sets: { completedAt: number | null }[] }[], exerciseIndex: number, setIndex: number) {
  return !block.slice(exerciseIndex + 1).some((ex) => ex.sets[setIndex] && ex.sets[setIndex].completedAt == null);
}
