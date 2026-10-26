/**
 * Genera `assets/data/exercises.json` dal dataset hasaneyldrm/exercises-dataset (dati MIT).
 * Uso: bun run catalog:exercises   (dopo `bash scripts/catalog/fetch-sources.sh`)
 *
 * Normalizza muscoli, attrezzi e zone su chiavi fisse (il dataset usa sinonimi: "delts", "deltoids",
 * "shoulders"), deduce il tipo (carico, corpo libero, a tempo) e tiene le istruzioni in italiano e inglese.
 * I media (© Gym visual) non sono inclusi.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { BodyPart, CatalogExercise, Equipment, Muscle } from '../../src/db/catalog-exercise';

const ROOT = join(import.meta.dir, '..', '..');
const RAW = join(ROOT, 'data', 'raw', 'exercises', 'exercises.json');
const OUT = join(ROOT, 'assets', 'data', 'exercises.json');
const META = join(ROOT, 'assets', 'data', 'exercises.meta.json');
const ALIASES: Record<string, string> = JSON.parse(readFileSync(join(import.meta.dir, 'exercise-aliases-it.json'), 'utf8'));

type Raw = {
  id: string;
  name: string;
  category: string;
  equipment: string;
  target: string;
  muscle_group: string;
  secondary_muscles: string[];
  instruction_steps: Record<string, string[]>;
};

// Muscoli del dataset → chiave di Forma. Quelli senza chiave (caviglie, piedi) si scartano.
const MUSCLE: Record<string, Muscle | null> = {
  pectorals: 'chest', chest: 'chest', 'upper chest': 'chest',
  delts: 'shoulders', deltoids: 'shoulders', shoulders: 'shoulders', 'rotator cuff': 'shoulders',
  'rear deltoids': 'rearDelts',
  lats: 'lats', 'latissimus dorsi': 'lats',
  'upper back': 'upperBack', rhomboids: 'upperBack', back: 'upperBack',
  traps: 'traps', trapezius: 'traps', 'levator scapulae': 'traps',
  'lower back': 'lowerBack', spine: 'lowerBack',
  biceps: 'biceps', brachialis: 'biceps',
  triceps: 'triceps',
  forearms: 'forearms', wrists: 'forearms', 'wrist flexors': 'forearms', 'wrist extensors': 'forearms', hands: 'forearms', 'grip muscles': 'forearms',
  abs: 'abs', abdominals: 'abs', 'lower abs': 'abs', core: 'abs',
  obliques: 'obliques',
  'serratus anterior': 'serratus',
  'hip flexors': 'hipFlexors',
  glutes: 'glutes',
  quads: 'quads', quadriceps: 'quads',
  hamstrings: 'hamstrings',
  adductors: 'adductors', groin: 'adductors', 'inner thighs': 'adductors',
  abductors: 'abductors',
  calves: 'calves', soleus: 'calves', shins: 'calves',
  sternocleidomastoid: 'neck',
  'cardiovascular system': 'cardio',
  ankles: null, 'ankle stabilizers': null, feet: null,
};

const EQUIP: Record<string, Equipment> = {
  'body weight': 'bodyweight', barbell: 'barbell', 'olympic barbell': 'barbell', 'trap bar': 'barbell', 'ez barbell': 'ezBar',
  dumbbell: 'dumbbell', kettlebell: 'kettlebell', cable: 'cable', 'leverage machine': 'machine', 'sled machine': 'machine',
  'smith machine': 'smith', band: 'band', 'resistance band': 'band', weighted: 'plate', 'stability ball': 'ball',
  'bosu ball': 'ball', 'medicine ball': 'ball', 'upper body ergometer': 'cardioMachine', 'skierg machine': 'cardioMachine',
  'stationary bike': 'cardioMachine', 'elliptical machine': 'cardioMachine', 'stepmill machine': 'cardioMachine',
  assisted: 'assisted', rope: 'other', roller: 'other', 'wheel roller': 'other', hammer: 'other', tire: 'other',
};

const BODY: Record<string, BodyPart> = {
  chest: 'chest', back: 'back', shoulders: 'shoulders', 'upper arms': 'upperArms', 'lower arms': 'lowerArms',
  waist: 'waist', 'upper legs': 'upperLegs', 'lower legs': 'lowerLegs', cardio: 'cardio', neck: 'neck',
};

// A tempo: cardio, allungamenti e tenute isometriche. Si registra la durata, non le ripetizioni.
const TIMED = /\b(stretch|plank|hold|isometric|wall sit)\b/;

function muscle(name: string, id: string): Muscle | null {
  if (!(name in MUSCLE)) throw new Error(`Muscolo senza chiave: "${name}" (esercizio ${id}). Aggiungilo a MUSCLE.`);
  return MUSCLE[name];
}

export function toExercise(r: Raw): CatalogExercise {
  const equipment = EQUIP[r.equipment];
  const bodyPart = BODY[r.category];
  if (!equipment) throw new Error(`Attrezzo senza chiave: "${r.equipment}" (esercizio ${r.id})`);
  if (!bodyPart) throw new Error(`Zona senza chiave: "${r.category}" (esercizio ${r.id})`);
  const primary = muscle(r.target, r.id);
  const primaryMuscles = primary ? [primary] : [];
  const secondaryMuscles = [...new Set([r.muscle_group, ...r.secondary_muscles].map((m) => muscle(m, r.id)))].filter(
    (m): m is Muscle => m !== null && !primaryMuscles.includes(m),
  );
  const name = r.name.trim();
  const lower = name.toLowerCase();
  const kind = r.category === 'cardio' || TIMED.test(lower) ? 'timed' : equipment === 'bodyweight' ? 'bodyweight' : 'weight';
  const aliasesIt = Object.entries(ALIASES)
    .filter(([en]) => !en.startsWith('_') && new RegExp(`(^|[^a-z])${en.replace(/[-/]/g, '[- ]?')}s?([^a-z]|$)`).test(lower))
    .map(([, it]) => it)
    .join(' ');
  return {
    id: `ex:${r.id}`,
    sourceId: r.id,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    kind,
    bodyPart,
    equipment,
    primaryMuscles,
    secondaryMuscles,
    instructions: { it: r.instruction_steps.it ?? [], en: r.instruction_steps.en ?? [] },
    aliasesIt,
  };
}

if (import.meta.main) {
  const raw: Raw[] = JSON.parse(readFileSync(RAW, 'utf8'));
  const exercises = raw.map(toExercise).sort((a, b) => a.sourceId.localeCompare(b.sourceId));
  const json = JSON.stringify(exercises);
  writeFileSync(OUT, json);
  writeFileSync(META, JSON.stringify({ version: Bun.hash(json).toString(36), count: exercises.length }) + '\n');
  const count = (k: CatalogExercise['kind']) => exercises.filter((e) => e.kind === k).length;
  console.log(`Esercizi: ${exercises.length} (carico ${count('weight')}, corpo libero ${count('bodyweight')}, a tempo ${count('timed')})`);
  console.log(`→ ${OUT} (${(json.length / 1e6).toFixed(1)} MB)`);
}
