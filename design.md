# Forma — Design

Direzione: **Calma**. Interfaccia calma e concentrata: la tipografia guida, superfici piatte (card bianche su un fondo grigio caldo), un accento usato con misura e colori fissi per i macro. Tema chiaro e scuro.

Ispirazione: tavole Dribbble scelte da Daniele (ottobre 2026): card bianche su grigio, accento corallo usato poco, barra delle tab scura a pillola, anelli e barre colorate per la nutrizione, icone degli alimenti su tinta. La direzione Neve (neumorfismo, arancione) è stata scartata: troppo grigia, gerarchia debole, confusionaria.

Prototipo di riferimento: `design/index.html` (`cd design && python3 -m http.server 8080`). In caso di dubbio vale il prototipo; questo documento ne spiega le regole. In alto si cambiano piattaforma (Android / iOS 26), tema e accento; `?s=<schermata>` mostra una schermata sola a tutta pagina (per screenshot e controlli).

## Principi
1. **Una domanda per schermata, la risposta è la cosa più grande.** Oggi: "quanto mi resta?". Pasti: "cosa ho mangiato?". Scheda alimento: "quanto ne aggiungo?". Allenamento: "qual è la prossima serie?". Statistiche: "come sto andando?".
2. **I numeri sono protagonisti.** Calorie, grammi, kg e rip sono il testo più grande e più nero della schermata, sempre con cifre tabulari. Lo stesso dato non si ripete in tre forme sulla stessa schermata.
3. **Colore con un significato.** L'accento segna l'azione e lo stato attivo; i colori dei macro dicono di quale macro si parla. Niente colore decorativo.
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
L'accento pieno va **solo sui piccoli segni**: il giorno scelto, l'anello e la barra delle kcal, le spunte, la fiamma. Le sue **tinte** fanno le aree: `tint` (card da notare, una per schermata: la settimana, l'allenamento di oggi, il recupero) e `tintStrong` (chip e pulsante rotondo selezionati). Il testo sopra le tinte è `accentInk`. Le tinte si calcolano dall'accento (`accentScale` in `src/constants/theme.ts`), quindi qualunque accento funziona in entrambi i temi.

Il pulsante principale **non** è d'accento: è `primary`, quasi nero (bianco nel tema scuro), come la barra delle tab.

Accenti tra cui sceglie l'utente: **Corallo** `#EF5F3C` (predefinito), **Lampone** `#E0446A`, **Fucsia** `#C93D9B`, **Ardesia** `#4F5D73`. Niente accenti blu, verdi o ambra: sono i colori dei macro e si confonderebbero.

### Macro, colori fissi
| Macro | Chiaro | Scuro |
|---|---|---|
| Proteine `prot` | `#3B7FD9` blu | `#5D9CF2` |
| Carboidrati `carb` | `#E9A019` ambra | `#F2B440` |
| Grassi `fat` | `#33A46C` verde | `#4DBF86` |

Sempre in quest'ordine (proteine, carboidrati, grassi) e sempre con lo stesso colore: pallino della legenda, barra, segmento dell'anello, barra di composizione del pasto, icona dell'alimento. Le kcal di ogni macro si calcolano 4/4/9 kcal per grammo (`src/features/foods/macros.ts`).

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
- Pulsanti rotondi neutri da 44–56 px (bianchi sul fondo, grigi dentro una card). Mai icone in riquadri colorati, con **un'unica eccezione**: la tessera dell'alimento (sotto), dove il colore è un dato.

## Componenti
- **Card** (`Card`): bianca, piatta. `tint` per la card da notare. Mai card dentro card: dentro si usano righe con filetto `line` o blocchi del colore del fondo (`Well`).
- **Pulsante principale** (`Button`): pillola `primary` alta 56, uno per schermata, di solito fisso in basso. Secondario `ghost` con bordo.
- **Pulsante rotondo** (`IconButton`): neutro; selezionato = `tintStrong` con icona `accentInk` (stella dei preferiti, "+" diventato spunta).
- **Chip** (`Chip`): sul fondo bianchi, dentro una card grigi; selezionato = `tintStrong`.
- **Settimana** (`DaySelector`): card tinta con mese e frecce; sette giorni come pillole bianche, quello scelto pieno d'accento, punto sotto oggi.
- **Anello** (`Donut`): segmenti per macro con 3 px di stacco, binario `track`, il totale al centro. Oggi mostra la composizione (quota di kcal di ogni macro); quando ci saranno gli obiettivi mostrerà la parte dell'obiettivo raggiunta.
- **Barre** (`Progress`): pieno nel colore, binario nella sua tinta; `StackBar` per la composizione di un pasto.
- **Tessera alimento** (`FoodTile`): il glifo dice la categoria (cereali, frutta, carne, pesce, latticini, verdura, olio, frutta secca, dolci, bevande; ciotola per piatti e senza categoria), il colore dice il macro che porta più kcal. Per le categorie CIQUAL larghe ("meat, egg and fish", "fruits, vegetables, legumes and nuts") decide il nome inglese.
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
Nav principale: **Oggi · Allenamento · Pasti · Statistiche · Impostazioni**. Nel prototipo ci sono Oggi, Pasti, Scheda alimento, Allenamento in corso, Statistiche e Pasti vuoto; le altre seguono le stesse regole.

| Sezione | Schermata | Contenuto e note |
|---|---|---|
| Primo avvio | Onboarding | Obiettivo, dati, giorni di allenamento, tema e accento. Una scelta per schermata, nav nascosta |
| Oggi | Oggi | "Ti restano N kcal" grande e centrato, card delle calorie con i macro, quattro azioni rapide (alimento, codice a barre, peso, allenati), pasti di oggi scorrevoli con tessere e barra dei macro, allenamento di oggi in card tinta, peso e allenamenti della settimana |
| | Registra il peso | Stepper grande ±0,1 kg, nota facoltativa, recenti |
| Allenamento | Sessione | Prossima serie grande (75 kg × 6), serie con spunta, "Serie fatta", recupero in card tinta con anello e ±15 s, esercizi dopo |
| | Programma, esercizio, catalogo, mappa muscolare | Schema e regola di progressione, grafico 1RM, ricerca per muscolo |
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
- Componenti base in `src/components/ui/`: `Card`, `Well`, `Text`, `Screen`, `Button`, `Chip`, `IconButton`, `Icon`, `Donut`, `Progress`, `StackBar`, `Toast`.
- Verifica del prototipo con la skill **design-taste-frontend** (stile `accent-ladder`, vedi `.taste-skill/README.md`): `lint.mjs --app` e `inspect.mjs --app` a 390 px su ogni schermata.

## Da definire
- Icona dell'app e splash.
- Obiettivi (kcal e macro, giorno di allenamento / riposo): con loro l'anello e le barre passano da "composizione" a "parte dell'obiettivo".
- Immagini degli esercizi (attribuzione © Gym visual da verificare prima dello store) e mappa muscolare.
- Grafici dell'app (Statistiche): SVG semplice come nel prototipo, o Victory Native / Skia.
