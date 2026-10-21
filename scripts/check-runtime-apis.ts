/**
 * Cerca in src/ API che esistono in Bun/Node (quindi i test passano) ma NON nel motore dell'app (Hermes).
 * Il caso reale: `crypto.randomUUID()` funzionava nei test e faceva crollare l'app sul telefono.
 *
 * Uso: bun run check:runtime
 * Eccezioni: i file `*.native.ts(x)` non vengono controllati (sono già solo per iOS/Android) e nemmeno quelli
 * che hanno un gemello `.native` (su iOS/Android Metro usa sempre il gemello, es. uuid.ts / uuid.native.ts);
 * una riga con il commento `// runtime-ok: motivo` viene saltata.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = join(import.meta.dirname, '..', 'src');

const RULES: { pattern: RegExp; why: string; fix: string }[] = [
  { pattern: /\b(?:globalThis|window|self)?\.?crypto\.(?:randomUUID|getRandomValues|subtle)/, why: 'Hermes non ha la Web Crypto', fix: "usa 'expo-crypto' (vedi src/lib/uuid.native.ts)" },
  { pattern: /\bglobalThis\.crypto\b/, why: 'Hermes non ha globalThis.crypto', fix: "usa 'expo-crypto'" },
  { pattern: /\bstructuredClone\s*\(/, why: 'structuredClone non è disponibile in Hermes', fix: 'copia a mano o usa JSON.parse(JSON.stringify(...)) se i dati lo consentono' },
  { pattern: /(?:from|require\()\s*['"]node:/, why: 'i moduli node:* non esistono nell\'app', fix: 'usa un modulo Expo (es. expo-file-system) o sposta il codice in scripts/' },
  { pattern: /(?:from|require\()\s*['"](?:fs|path|os|child_process|bun:[a-z]+)['"]/, why: 'modulo di Node/Bun non disponibile nell\'app', fix: 'usa un modulo Expo o sposta il codice in scripts/' },
  { pattern: /\bBuffer\s*[.(]/, why: 'Buffer non è globale in React Native', fix: "usa 'expo-crypto' / TextEncoder o un pacchetto apposito" },
  { pattern: /\bimport\.meta\.(?:dir|dirname|filename|url)\b/, why: 'import.meta non è supportato nel bundle dell\'app', fix: 'sposta il codice in scripts/' },
  { pattern: /\bprocess\.(?:cwd|argv|exit|stdout|stdin)\b/, why: 'process.* di Node non esiste nell\'app', fix: 'sposta il codice in scripts/' },
];

/** `x.ts` ha un gemello `x.native.ts` (o .tsx): sul telefono si usa quello. */
const hasNativeTwin = (file: string) => existsSync(file.replace(/\.(tsx?)$/, '.native.$1'));

function* files(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* files(p);
    else if (/\.(?:ts|tsx)$/.test(name) && !/\.native\.tsx?$/.test(name) && !/\.d\.ts$/.test(name) && !hasNativeTwin(p)) yield p;
  }
}

let problems = 0;
for (const file of files(SRC)) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (/\/\/\s*runtime-ok/.test(line) || /^\s*(?:\/\/|\*|\/\*)/.test(line)) return;
      for (const r of RULES) {
        if (r.pattern.test(line)) {
          problems++;
          console.error(`${relative(process.cwd(), file)}:${i + 1}  ${r.why}\n    ${line.trim()}\n    → ${r.fix}`);
        }
      }
    });
}

if (problems) {
  console.error(`\n${problems} uso/i di API non disponibili sul telefono.`);
  process.exit(1);
}
console.log('API di runtime: nessun problema in src/.');
