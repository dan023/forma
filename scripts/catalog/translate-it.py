#!/usr/bin/env python3
"""
Traduce in italiano i segmenti dei nomi inglesi del catalogo (offline, senza costi a runtime).

I nomi sono liste di descrittori ("Beef, loin, separable lean only, raw"): si traducono i segmenti
unici, così "raw" o "cooked" restano coerenti in tutto il catalogo. Output: `translations-it.json`
(segmento → italiano). Le correzioni manuali stanno in `glossary-it.json` e hanno la precedenza
(le applica `build-food-catalog.ts`).

Richiede: pip install ctranslate2 sentencepiece, e il modello Argos en→it scaricato e scompattato
(https://argos-net.com/v1/translate-en_it-1_0.argosmodel). Uso:
  ARGOS_MODEL_DIR=/percorso/en_it python3 scripts/catalog/translate-it.py
"""
import json
import os
from pathlib import Path

import ctranslate2
import sentencepiece as spm

ROOT = Path(__file__).resolve().parents[2]
MODEL = Path(os.environ['ARGOS_MODEL_DIR'])
OUT = Path(__file__).with_name('translations-it.json')


def split_segments(name: str) -> list[str]:
    """Divide sulle virgole fuori da parentesi."""
    out, depth, cur = [], 0, ''
    for ch in name:
        depth += ch in '(['
        depth = max(0, depth - (ch in ')]'))
        if ch == ',' and depth == 0:
            out.append(cur.strip())
            cur = ''
        else:
            cur += ch
    out.append(cur.strip())
    return [s for s in out if s]


foods = json.loads((ROOT / 'assets/data/foods.json').read_text())
segments = sorted({s for f in foods for s in split_segments(f['nameEn'])})
done = json.loads(OUT.read_text()) if OUT.exists() else {}
todo = [s for s in segments if s not in done]
print(f'{len(segments)} segmenti unici, {len(todo)} da tradurre')

sp = spm.SentencePieceProcessor(model_file=str(MODEL / 'sentencepiece.model'))
tr = ctranslate2.Translator(str(MODEL / 'model'), device='cpu', inter_threads=2, intra_threads=5)

for i in range(0, len(todo), 512):
    batch = todo[i : i + 512]
    res = tr.translate_batch([sp.encode(s, out_type=str) for s in batch], beam_size=4, max_batch_size=64)
    for s, r in zip(batch, res):
        done[s] = sp.decode(r.hypotheses[0])
    print(f'{min(i + 512, len(todo))}/{len(todo)}')

OUT.write_text(json.dumps(dict(sorted(done.items())), ensure_ascii=False, indent=0) + '\n')
