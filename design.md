# Forma — Design

Direzione: **Calma**. Interfaccia calma e concentrata: la tipografia guida, superfici piatte (card bianche su un fondo grigio caldo), un accento usato con misura e colori fissi per i macro. Tema chiaro e scuro.

Ispirazione: tavole Dribbble scelte da Daniele (ottobre 2026): card bianche su grigio, accento corallo usato poco, barra delle tab scura a pillola, anelli e barre colorate per la nutrizione, icone degli alimenti su tinta. La direzione Neve (neumorfismo, arancione) è stata scartata: troppo grigia, gerarchia debole, confusionaria.

Prototipo di riferimento: `design/index.html` (`cd design && python3 -m http.server 8080`). In caso di dubbio vale il prototipo; questo documento ne spiega le regole. In alto si cambiano piattaforma (Android / iOS 26), tema e accento; `?s=<schermata>` mostra una schermata sola a tutta pagina (per screenshot e controlli).

## Principi
1. **Una domanda per schermata, la risposta è la cosa più grande.** Oggi: "quanto mi resta?". Pasti: "cosa ho mangiato?". Scheda alimento: "quanto ne aggiungo?". Allenamento: "qual è la prossima serie?". Statistiche: "come sto andando?".
2. **I numeri sono protagonisti.** Calorie, grammi, kg e rip sono il testo più grande e più nero della schermata, sempre con cifre tabulari. Lo stesso dato non si ripete in tre forme sulla stessa schermata.
3. **Colore con un significato.** L'accento segna l'azione e lo stato attivo; i colori dei macro dicono di quale macro si parla; il colore di una scheda (scelto dall'utente) dice di quale scheda si parla. Niente colore decorativo.
4. **Piatto.** La profondità è un solo gradino di tono (card bianca su fondo grigio). Niente ombre nel contenuto, niente gradienti, niente vetro nel contenuto.
5. **Pollice prima di tutto.** Bersagli ≥ 44 px, azione principale in basso, una mano sola in palestra.

## Colore

### Neutri
| Token | Chiaro | Scuro | Uso |
|---|---|---|---|
| `bg` | `#F2F0EE` | `#0F0F10` | fondo della schermata |
| `card` | `#FFFFFF` | `#1B1B1D` | card, pulsanti rotondi, chip sul fondo |
| `ink` | `#18181B` | `#F3F2F0` | testo e numeri |
| `ink2` | `#6A6A70` | `#A3A2A7` | etichette, testo secondario (≥ 4,5:1) |
| `line` | `#EBE8E5` | `#2A2A2D` | filetti tra le righe |
| `control` | `#E6E3E0` | `#2C2C2F` | binario dei controlli segmentati |
| `primary` / `onPrimary` | `#1C1C1F` / bianco | `#F3F2F0` / `#141416` | pulsante principale, barra delle tab, avviso |
| `track` | `#EEECEA` | `#2A2A2D` | binario neutro degli anelli |

### Accento, una scala
L'accento pieno va **solo sui piccoli segni**: il giorno scelto, l'anello e la barra delle kcal, le spunte, la fiamma. Le sue **tinte** fanno le aree: `tint` (card da notare, una per schermata: la settimana, l'allenamento di oggi, il recupero) e `tintStrong` (chip e pulsante rotondo selezionati). Il testo sopra le tinte è `accentInk` (nel tema scuro è l'accento schiarito del 45%: con meno, tre accenti su quattro non raggiungevano 4,5:1 sul chip selezionato). Le tinte si calcolano dall'accento (`accentScale` in `src/constants/theme.ts`), quindi qualunque accento funziona in entrambi i temi.

Il pulsante principale **non** è d'accento: è `primary`, quasi nero (bianco nel tema scuro), come la barra delle tab.

Accenti tra cui sceglie l'utente: **Corallo** `#EF5F3C` (predefinito), **Lampone** `#E0446A`, **Fucsia** `#C93D9B`, **Ardesia** `#4F5D73`. Niente accenti blu, verdi o ambra: sono i colori dei macro e si confonderebbero.

### Colori di stato
Per pulsanti e avvisi, **mai nei dati** (il verde e l'ambra dei macro sono un'altra cosa). Uguali nei due temi.

| Stato | Pieno | Testo sul pieno | Tinta e testo (soft) |
|---|---|---|---|
| Pericolo `danger` | `#C93535` | bianco | tinta pallida + inchiostro rosso scuro (chiaro) o rosato (scuro) |
| Avviso `warning` | `#EBA21C` | quasi nero `#2B1B00` | idem, ambra |
| Successo `success` | `#0F7A69` (verde acqua, diverso dal verde dei grassi) | bianco | idem, verde acqua |

Tinte e inchiostri si calcolano da `statusScale` in `src/constants/theme.ts`. Il contrasto del testo è ≥ 4,5:1 ovunque, ed è fissato dal test `scripts/tests/theme.test.ts`.

### Macro, colori fissi
| Macro | Chiaro | Scuro |
|---|---|---|
| Proteine `prot` | `#3B7FD9` blu | `#5D9CF2` |
| Carboidrati `carb` | `#E9A019` ambra | `#F2B440` |
| Grassi `fat` | `#33A46C` verde | `#4DBF86` |

Sempre in quest'ordine (proteine, carboidrati, grassi) e sempre con lo stesso colore: pallino della legenda, barra, segmento dell'anello, barra di composizione del pasto, icona dell'alimento. Le kcal di ogni macro si calcolano 4/4/9 kcal per grammo (`src/features/foods/macros.ts`).

### Schede, icona e colore scelti
Ogni scheda di allenamento ha un'icona (12: manubrio, bilanciere, kettlebell, corsa, bici, fiamma, fulmine, cuore, montagna, bersaglio, coppa, foglia) e un colore tra sei (`RoutineColors` in `theme.ts`): i quattro accenti più **Viola** `#7C5CE0` e **Cacao** `#9A6448`. Anche questi lontani da blu, ambra e verde dei macro. Una scheda nuova prende il primo colore non ancora usato.

- **Tessera della scheda** (`RoutineTile`): glifo nel colore su una sua tinta (come la tessera dell'alimento). Ovunque si parli della scheda: elenco, settimana, card di oggi, storico, scelta del giorno, intestazioni.
- **Il colore della scheda fa da accento nelle sue schermate** (editor, sessione, riepilogo, card di oggi): `AccentScope` (`src/components/theme-provider.tsx`) ricalcola tinte, spunte, anello del recupero e testo d'accento da quel colore, nelle classi e in `useTheme()`. Fuori dalle schermate di una scheda resta l'accento dell'utente.
- Nella settimana un giorno con una scheda mostra la sua tessera; fatto = cerchio pieno del suo colore con spunta bianca (≥ 3:1, test in `theme.test.ts`); oggi = anello del suo colore.
- Il contrasto del testo sulle tinte di ogni colore delle schede è fissato dallo stesso test degli accenti.

## Tipografia
Un solo carattere: **Figtree**, in quattro pesi (400, 500, 600, 700). La gerarchia la fanno dimensione e peso.

| Ruolo | Misura | Peso | Componente |
|---|---|---|---|
| Titolo di schermata | 28 px, tracking −0,6 | 700 | `Text variant="title"` |
| Titolo lungo (nome alimento) | 24 px | 700 | `titleSm` |
| Titolo di card / pasto | 19 px | 700 | `h2` |
| Cifra protagonista | 28–40 px | 700 | `num` |
| Corpo | 16 px | 400 | `body` |
| Etichetta sopra un valore | 13 px, grigia, mai maiuscolo | 500 | `label` |

Cifre sempre tabulari. Un solo h1 per schermata.

## Forma e spazio
- Raggi: card 22 · tessere e campi 14 · pulsanti, chip, giorni, barra delle tab: pillola (999).
- Margini laterali 20; padding card 20; spazio tra card 14.
- Pulsanti rotondi neutri da 44–56 px (bianchi sul fondo, grigi dentro una card). Mai icone in riquadri colorati, salvo **le tessere**, dove il colore è un dato: alimento (il macro), scheda (il colore scelto), esercizio (la tinta dell'accento, cioè della scheda nelle sue schermate).

## Componenti
- **Card** (`Card`): bianca, piatta. `tint` per la card da notare. Mai card dentro card: dentro si usano righe con filetto `line` o blocchi del colore del fondo (`Well`).
- **Pulsante** (`Button`), varianti come in shadcn/ui: `primary` (quasi nero, uno per schermata, di solito fisso in basso), `secondary` (grigio), `accent` (tinta dell'accento: l'accento pieno resta sui piccoli segni), `outline` (bordo), `ghost` (nessuno sfondo), `link` (sottolineato), `danger`, `warning`, `success`. Con `soft` le tre di stato diventano tinta con testo colorato (es. "Elimina dal diario" è `danger soft`). Misure `sm` 44, `md` 48, `lg` 56 (predefinita): tutte bersagli ≥ 44. Icona facoltativa prima del testo. Una sola azione piena per schermata; le altre `secondary`, `outline` o `ghost`.
- **Pulsante rotondo** (`IconButton`): neutro; selezionato = `tintStrong` con icona `accentInk` (stella dei preferiti, "+" diventato spunta).
- **Chip** (`Chip`): sul fondo bianchi, dentro una card grigi; selezionato = `tintStrong`.
- **Settimana** (`DaySelector`): card tinta con mese e frecce; sette giorni come pillole bianche, quello scelto pieno d'accento, punto sotto oggi.
- **Anello** (`Donut`): segmenti per macro con 3 px di stacco, binario `track`, il totale al centro. Oggi mostra la composizione (quota di kcal di ogni macro); quando ci saranno gli obiettivi mostrerà la parte dell'obiettivo raggiunta.
- **Barre** (`Progress`): pieno nel colore, binario nella sua tinta; `StackBar` per la composizione di un pasto.
- **Tessera alimento** (`FoodTile`): il glifo dice la categoria (cereali, frutta, carne, pesce, latticini, verdura, olio, frutta secca, dolci, bevande; ciotola per piatti e senza categoria), il colore dice il macro che porta più kcal. Per le categorie CIQUAL larghe ("meat, egg and fish", "fruits, vegetables, legumes and nuts") decide il nome inglese.
- **Tessera scheda** (`RoutineTile`): vedi "Schede, icona e colore scelti". `onTint` per metterla su una card tinta (fondo bianco).
- **Tessera esercizio** (`ExerciseTile`, `src/features/training/exercise-tile.tsx`): una piccola figura a capsule sempre uguale, in tono tenue, con la zona allenata piena (petto, schiena, spalle, braccia, avambracci, addome, cosce e glutei, polpacci, collo); busto o gambe inquadrati da vicino perché la zona si legga anche a 28 px. Il cardio è un cuore con il battito. Nella tinta dell'accento. La stessa figura (`ZoneGlyph`) va nei chip delle zone del catalogo.
- **Icone** (`Icon`): contorno, tratto 1,75, griglia 24, disegnate in SVG (`react-native-svg`); stesse forme del prototipo.
- **Liste:** righe ≥ 56 px: tessera, nome e grammi, kcal a destra.
- **Stati vuoti:** dicono cosa fare ("Registra il primo alimento"), non solo "nessun dato".

## Navigazione e piattaforme

| Elemento | iOS 26 (Liquid Glass) | Android e iOS precedenti |
|---|---|---|
| Barra delle tab | Nativa, in vetro (`NativeTabs`, `src/components/glass-tabs.tsx`), SF Symbols, voce attiva d'accento; si riduce scorrendo | Pillola `primary` flottante (`PillTabBar`): la voce attiva è una pillola chiara con icona ed etichetta, le altre solo icona |
| Tasto indietro | Cerchio in vetro | Cerchio bianco con chevron |
| Avviso (toast) | Capsula in vetro | Pillola `primary` |
| Card, campi, numeri, pulsanti d'azione | Calma | Calma |

Il vetro è solo **chrome di sistema** (barra, tasto indietro, avvisi, in futuro sheet e pulsanti flottanti sopra il contenuto), mai dentro le card. La scelta sta in `src/constants/glass.ts` (`USE_LIQUID_GLASS`). Il prototipo imita il vetro nel browser, ma per vederlo davvero serve un build iOS 26. Ogni schermata nuova va guardata in entrambe le piattaforme e in entrambi i temi.

## Movimento
- La barra delle tab anima la larghezza della voce attiva (molla, `LinearTransition`). Pressione: opacità 0,7–0,8.
- Niente rimbalzi, niente animazioni d'ingresso a cascata. Rispettare "riduci movimento" (`useReducedMotion`).

## Schermate
Nav principale: **Oggi · Allenamento · Pasti · Statistiche · Impostazioni**. Nel prototipo ci sono Oggi, Pasti, Scheda alimento, Allenamento, Scheda, Allenamento in corso, Catalogo esercizi, Statistiche e Pasti vuoto; le altre seguono le stesse regole.

| Sezione | Schermata | Contenuto e note |
|---|---|---|
| Primo avvio | Onboarding | Obiettivo, dati, giorni di allenamento, tema e accento. Una scelta per schermata, nav nascosta |
| Oggi | Oggi | "Ti restano N kcal" grande e centrato, card delle calorie con i macro, quattro azioni rapide (alimento, codice a barre, peso, allenati), pasti di oggi scorrevoli con tessere e barra dei macro, allenamento di oggi in card tinta, peso e allenamenti della settimana |
| | Registra il peso | Stepper grande ±0,1 kg, nota facoltativa, recenti |
| Allenamento | Allenamento (tab) | In alto una sola card tinta su "oggi": allenamento in corso ("Riprendi"), oppure la scheda del giorno nella sua tinta (tessera grande, "N esercizi · circa X min", tessere delle zone, "Inizia allenamento", sotto "Allenamento libero"), oppure riposo/nessuna scheda con "Inizia allenamento libero". Poi Settimana (7 giorni lun→dom con la tessera della scheda; pieno con spunta se allenato, anello oggi, nome della scheda sotto; tocco = scegli la scheda del giorno), Schede (tessera, giorni, esercizi e durata stimata, "Nuova scheda"), riga "Catalogo esercizi", Storico (tessera della scheda, o neutra se libero) |
| | Scheda | Nel colore della scheda. Tessera e nome in alto; nome, icona (griglia 6 × 2) e colore (sei cerchi); giorni (cerchi L…D: un giorno ha una sola scheda, un puntino del colore dell'altra scheda sui giorni presi); "N esercizi · circa X min"; esercizi con tessera, − N serie +, ripetizioni min-max (o secondi), su/giù e "Collega" per le superserie; "Aggiungi esercizi" (catalogo che resta aperto: il "+" diventa spunta), "Elimina scheda"; "Inizia allenamento" fisso in basso |
| | Durata stimata | Serie × (ripetizioni previste × 3 s + 30 s di preparazione), recupero di 2 min dopo ogni giro tranne l'ultimo (in superserie il giro è una serie per esercizio, 15 s di cambio), 90 s tra un esercizio e l'altro; arrotondata a 5 min (`src/features/training/estimate.ts`) |
| | Sessione | Nel colore della scheda, con la sua tessera accanto al titolo. Una card per esercizio (tessera della zona accanto al nome) con tabella N° · Prima · kg · rip · spunta (solo rip per il corpo libero, secondi per gli esercizi a tempo); i valori dell'ultima volta sono il segnaposto e valgono se si spunta senza scrivere; senza rip né suggerimento la spunta porta al campo. Riga fatta = tinta. Recupero (2 min) in card tinta con anello e −15 s / +15 s / Salta, fisso in basso sopra "Termina", vibra alla fine. "Annulla allenamento" (`danger soft`, con conferma) |
| | Catalogo esercizi | Ricerca (anche in italiano: "panca manubri"), chip Zona (con la figura) e Attrezzo (gli attrezzi seguono la zona), elenco virtualizzato con la tessera di ogni esercizio; dalla sessione il "+" aggiunge e torna indietro |
| | Esercizio | Tessera grande della zona accanto al nome. Aperto dal catalogo: card "Aggiungi a una scheda" che si apre nell'elenco delle schede (tessera, nome, esercizi, casella: vuota = tocco aggiunge in fondo; piena d'accento = appena aggiunto da qui e non ancora toccato, un tocco lo toglie; in tinta = già nella scheda, si cambia dalla scheda; sempre con avviso) e "Nuova scheda con questo esercizio"; aperto dalla sessione o da una scheda: pulsante "Aggiungi" fisso in basso. Tipo, muscolo principale (pillola tinta) e secondari, attrezzo, ultime volte con 1RM stimato, istruzioni nella lingua dell'app |
| | Riepilogo | Nel colore della scheda. Durata, volume, serie (card divisa in tre), record personali in card tinta, serie di ogni esercizio con la migliore in grassetto |
| | Programma, mappa muscolare | Da fare: schema e regola di progressione, grafico 1RM, muscoli lavorati |
| Pasti | Pasti | Settimana, anello delle kcal per macro, pasti con barra di composizione e tessere, "Aggiungi alimento" |
| | Ricerca alimento | Vedi "Ricerca alimenti" |
| | Scheda alimento | Tessera grande e nome, grammi con − / + e porzioni, anello della porzione per macro, valori per 100 g, "Aggiungi a …" fisso in basso |
| | Versioni, crea alimento, barcode, ricette, pasti configurabili | Da disegnare con queste regole |
| Statistiche | Statistiche | Settimana / mese / anno; semianello dei giorni nell'obiettivo; calorie degli ultimi 7 giorni a pillole tratteggiate con la linea dell'obiettivo; peso; volume |
| Impostazioni | Impostazioni | Lingua, tema, accento, obiettivi, promemoria, dati (export/import) |

## Ricerca alimenti
Implementata in `src/features/foods/search.ts` (`searchFoods`, sul DB locale) e nella schermata `src/app/cerca.tsx`.

**Come si cerca**
- Le parole si scrivono in **qualsiasi ordine**, ognuna come **inizio di parola**: "pol pet" trova "Pollo, petto, …". Accenti e maiuscole ignorati.
- Parole vuote ignorate (`di, del, della, da, con, e, il, la, le, in, al, a`): "petto di pollo" trova "Pollo, petto, senza pelle, crudo".
- Si cerca in nome italiano, inglese e francese. Una corrispondenza solo in inglese o francese pesa meno.

**Ordine dei risultati** (in ordine di importanza)
1. Corrispondenza nel nome italiano, non solo in EN/FR.
2. Il nome comincia con una delle parole cercate.
3. Parole intere uguali a quelle cercate.
4. Fonte CIQUAL leggermente avanti.
5. Nomi più corti.

**Duplicati:** lo stesso nome italiano da fonti diverse è **una riga sola**, con "N versioni"; le versioni si scelgono nella scheda.

**Riga risultato:** tessera, nome con le parole trovate in grassetto sottolineato, riga secondaria `100 g · kcal · P · C · G` con cifre tabulari, a destra pulsante rotondo "+" (44 px) che aggiunge 100 g al pasto e diventa una spunta su tinta, con avviso per 1,8 s. Toccare la riga apre la scheda.

**Stati:** vuota (recenti del pasto + aiuto), risultati (conteggio + elenco, max 20), nessun risultato (come correggere la ricerca, "Crea «…»", "Scansiona il barcode"), caricamento (righe scheletro), offline (solo alimenti sul telefono), preferiti e miei vuoti (spiegano come popolarli).

**Da risolvere nei dati**
- Le etichette delle porzioni USDA sono in inglese: vanno tradotte e normalizzate prima di mostrarle (oggi in italiano si mostrano solo i grammi).
- Alcune traduzioni sono ancora sbagliate: correggerle nel glossario partendo dai cibi più comuni.
- La classifica ha bisogno di un segnale "comune" più forte dei soli caratteri del nome.

## Accessibilità
- Contrasto testo ≥ 4,5:1 (`ink2` su `card` e su `bg`; `accentInk` sulle tinte). Il colore non è mai l'unico segnale: i macro hanno sempre il nome accanto al pallino.
- Ogni controllo ha un'etichetta accessibile; lo stato (`selected`) è esposto.
- Bersagli ≥ 44 px. Testo scalabile: nessuna altezza fissa sulle righe di testo.
- Tema: segue il sistema, sovrascrivibile in Impostazioni.

## Implementazione (Expo / NativeWind v5)
- Nomi dei colori, font e raggi in `src/global.css` (`@theme`); valori per tema e accento in `src/constants/theme.ts` (`Palette`, `Accents`, `accentScale`), iniettati come variabili CSS da `ThemeProvider`. Classi: `bg-card`, `bg-tint`, `text-ink-2`, `text-accent-ink`, `bg-primary`, `rounded-card`, `font-sans-semibold`…
- Nuovo colore = `@theme` + `:root` in `global.css`, `theme.ts`, `ThemeProvider` e `inlineVariables.exclude` in `metro.config.js`.
- Colori che servono a SVG o calcolati (macro, tinte delle tessere, anelli) si leggono da `useTheme()`.
- Componenti base in `src/components/ui/`: `Card`, `Well`, `Text`, `Screen` (con `leading` accanto al titolo), `Button`, `Chip` (con `leading`), `IconButton`, `Icon`, `Donut`, `Progress`, `StackBar`, `Toast`. Accento locale: `AccentScope` in `src/components/theme-provider.tsx`.
- Verifica del prototipo con la skill **design-taste-frontend** (stile `accent-ladder`, vedi `.taste-skill/README.md`): `lint.mjs --app` e `inspect.mjs --app` a 390 px su ogni schermata.

## Da definire
- Icona dell'app e splash.
- Obiettivi (kcal e macro, giorno di allenamento / riposo): con loro l'anello e le barre passano da "composizione" a "parte dell'obiettivo".
- Immagini degli esercizi (attribuzione © Gym visual da verificare prima dello store) e mappa muscolare.
- Grafici dell'app (Statistiche): SVG semplice come nel prototipo, o Victory Native / Skia.
