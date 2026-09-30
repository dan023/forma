# Forma — Design

Direzione: **Neve**. Superfici morbide e tattili (neumorfismo controllato), un solo accento arancione, titoli grandi, nav a pillola. Due temi: **Neve** (chiaro) e **Neve scura**.

Prototipo di riferimento: `design/index.html` (`cd design && python3 -m http.server 8080`). In caso di dubbio, vale il prototipo; questo documento ne spiega le regole.

## Principi
1. **Calma, non decorazione.** Ogni ombra deve dire "questo si può toccare" o "questo contiene un valore". Niente vetro, niente gradienti decorativi.
2. **Un solo accento.** L'arancione segna l'azione principale e lo stato attivo. Il resto è neutro. L'accento è personalizzabile dall'utente (6 preset), quindi mai codificare l'arancione nei componenti: usare il token `accent`.
3. **Rilievo = significato.** *Rialzato* = azionabile o contenitore. *Incassato* = campo, valore, traccia, stato "premuto". Non invertire i ruoli.
4. **I numeri sono protagonisti.** Calorie, kg e rip usano il font display con cifre tabulari.
5. **Velocità in palestra.** Bersagli ≥ 44 px, una mano sola, azioni frequenti (spunta serie, +/− grammi) a portata di pollice.

## Token

Colori in OKLCH. Neutri leggermente caldi (tinta ~60–70°), mai bianco o nero puro.

| Token | Neve | Neve scura |
|---|---|---|
| `bg` | `oklch(93.5% .006 70)` | `oklch(25% .008 60)` |
| `card` | `oklch(94.5% .006 70)` | `oklch(26.5% .008 60)` |
| `ink` | `oklch(24% .012 60)` | `oklch(94% .008 70)` |
| `ink2` (testo secondario) | `oklch(42% .014 60)` | `oklch(76% .012 65)` |
| `line` | `oklch(86% .008 65)` | `oklch(35% .01 60)` |
| `accent` | `oklch(70% .17 48)` | uguale |
| `accentInk` (testo su accento) | `oklch(24% .06 48)` | uguale |
| `ok` | `oklch(68% .13 150)` | `oklch(75% .13 150)` |

Preset accento (`L C H`): Arancio `70 .17 48`, Corallo `70 .16 22`, Ambra `80 .15 80`, Salvia `74 .12 150`, Oceano `70 .12 235`, Viola `68 .15 300`. `accentInk` resta scuro per tutti.

Macro nei grafici: proteine = `accent`, carboidrati `oklch(72% .11 85)`, grassi `oklch(66% .09 20)`.

### Ombre neumorfiche
| Ruolo | Neve | Neve scura |
|---|---|---|
| Rialzato | `9 9 20 oklch(80% .01 65 /.75)` + `-9 -9 20 oklch(99% .004 80 /.95)` | `9 9 20 oklch(16% .008 55 /.9)` + `-8 -8 18 oklch(34% .01 65 /.55)` |
| Incassato | come sopra, `inset`, raggio 9 e offset 4 | idem |

Su React Native le ombre doppie non esistono in un solo `boxShadow`: usare due layer sovrapposti (luce e ombra) o `boxShadow` con più valori, dove supportato da RN 0.86. Da verificare su Android.

### Tipografia
- Display: **Bricolage Grotesque** 600–800, tracking `-0.035em`, interlinea ~0.95.
- Corpo: **Figtree** 400–700.
- Scala: titolo pagina 2.6rem (41 px) · numero grande 3.4–4.2rem · h2 1.25rem · corpo 1rem · eyebrow 0.74rem maiuscolo con tracking `.1em`.
- Numeri: sempre `tabular-nums`.

### Forma e spazio
- Raggi: card 28 · elementi interni/campi 20 · chip, pulsanti, nav 999.
- Padding schermata 20; card 18; gap tra card 14; gap tra sezioni 22.
- Spaziatura irregolare di proposito: gruppi stretti, separazioni ampie.

## Componenti
- **Card:** rialzata. Non annidare card dentro card; dentro usare liste con filetto `line` o elementi incassati.
- **Pulsante primario:** pillola `accent`, ombra colorata. Uno per schermata. Secondari: `ghost` con bordo `line`.
- **Chip filtro / giorno:** rialzati; selezionati = `accent`.
- **Campo / valore (kg, rip, grammi):** incassato, cifre display.
- **Spunta serie:** cerchio incassato → `accent` con lieve scala quando completata.
- **Switch:** traccia incassata, pomello `ink2` → `accent`.
- **Anello calorie + barre macro:** traccia `line`, riempimento `accent`, animati all'ingresso.
- **Nav a pillola:** vaschetta incassata a 5 voci (Oggi, Allena, Pasti, Stats, Altro); l'indicatore arancione scorre sotto la voce attiva. Si nasconde in onboarding.
- **Liste:** righe ≥ 56 px, titolo + sottotitolo `ink2`, valore a destra.
- **Stati vuoti:** insegnano l'azione ("Registra il primo alimento"), non si limitano a dire "nessun dato".

## Movimento
- Easing `cubic-bezier(.22,1,.36,1)` (ease-out esponenziale); niente rimbalzi.
- Ingresso schermata: elementi in cascata (60 ms di scarto, 600 ms), solo `opacity` e `translate`.
- Anello, barre, linea del grafico e barre di volume si animano al primo ingresso (1–1,6 s).
- Feedback tocco: scala 0.93–0.97, 200 ms.
- Rispettare "riduci movimento": durate azzerate. In app: `useReducedMotion` di Reanimated.

## Schermate
Nav principale: **Oggi · Allenamento · Pasti · Statistiche · Impostazioni**. Ogni schermata di dettaglio evidenzia la voce della sua sezione. Il prototipo le raccoglie in gruppi nella colonna sinistra: 28 schermate.

| Sezione | Schermata | Contenuto e note |
|---|---|---|
| Primo avvio | Onboarding, 4 passi | 1 obiettivo · 2 dati (sesso, età, altezza, peso) · 3 giorni di allenamento · 4 tema, accento e punto di partenza. Barra segmentata, una scelta per schermata, nav nascosta |
| | Oggi vuoto | Anello a zero e tre azioni che insegnano da dove partire (primo pasto, programma, peso) |
| Oggi | Oggi | Saluto, anello kcal + macro, allenamento del giorno, peso. Obiettivi diversi giorno allenamento/riposo |
| | Registra il peso | Stepper grande ±0,1 kg, nota facoltativa, recenti |
| Allenamento | Allenamento (home) | Allenamento di oggi, programmi, ultimi allenamenti, allenamento libero |
| | Sessione | Timer recupero, serie con spunta, prossimi esercizi. Si apre da "Inizia allenamento" |
| | Riepilogo | Durata, volume, serie, record, muscoli lavorati |
| | Programma | Esercizi con schema e regola di progressione, superset (SS A), riordino |
| | Esercizio | Grafico 1RM, scelta della progressione (lineare, Greyskull LP, doppia) con i suoi parametri, storico |
| | Catalogo esercizi / Crea esercizio | Ricerca, filtri per muscolo. Nuovo esercizio: tipo (carico, corpo libero, a tempo), muscolo, attrezzo |
| | Mappa muscolare | Fronte/retro, intensità per muscolo, soglia "ottimo" 10-20 serie/sett. |
| Pasti | Pasti | Selettore giorno, diario per pasto, ricerca, barcode, ricette, configurazione pasti |
| | Ricerca alimento | Vedi "Ricerca alimenti" |
| | Scheda alimento | Grammi o porzioni, macro live, valori per 100 g, fonte e versioni |
| | Versioni | Stesso alimento da più fonti (CIQUAL, USDA): si sceglie quale usare |
| | Crea alimento | Valori per 100 g con controllo di coerenza kcal/macro, campi facoltativi a scomparsa, porzioni |
| | Barcode / Ricette | Mirino e inserimento manuale (Open Food Facts + cache). Ricetta con ingredienti e macro per porzione |
| | Pasti configurabili | Ordine, visibilità, aggiunta |
| Statistiche | Statistiche | Peso / calorie / volume, volume settimanale, costanza |
| Impostazioni | Impostazioni | Lingua (Sistema, Italiano, English), accento, tema, timer, unità, accessi alle pagine sotto |
| | Obiettivi giornalieri | Allenamento / riposo, macro con calorie che si ricalcolano, suggerimento dal peso |
| | Promemoria | Pasti, allenamento, peso, fine recupero |
| | I tuoi dati | Esporta in JSON, importa da Forma / Strong / Hevy / FitNotes, alimenti personalizzati, licenze delle fonti |


## Ricerca alimenti
Prototipo: `design/index.html`, schermata "Ricerca" (i dati sono un campione **reale** del catalogo, `design/sample-foods.js`). Il codice di `searchFoods` in `design/app.js` è la specifica da reimplementare in TypeScript sul DB locale.

**Come si cerca**
- Le parole si scrivono in **qualsiasi ordine**, ognuna come **inizio di parola**: "pol pet" trova "Pollo, petto, …". Accenti e maiuscole ignorati.
- Parole vuote ignorate (`di, del, della, da, con, e, il, la, le, in, al, a`): "petto di pollo" trova "Pollo, petto, senza pelle, crudo". Senza questa regola non lo troverebbe, perché i nomi USDA hanno un altro ordine.
- Si cerca in nome italiano, inglese e francese. Una corrispondenza solo in inglese o francese pesa meno.

**Ordine dei risultati** (in questo ordine di importanza)
1. Corrispondenza nel nome italiano, non solo in EN/FR.
2. Il nome comincia con una delle parole cercate (il "sostantivo" del cibo).
3. Parole intere uguali a quelle cercate.
4. Fonte CIQUAL leggermente avanti (più vicina alla dieta europea).
5. Nomi più corti (gli alimenti generici prima di quelli molto specifici o di marca).

**Duplicati:** lo stesso nome italiano da fonti diverse è **una riga sola**, con "N versioni" nella riga secondaria; le versioni si scelgono nella scheda. Nel catalogo "Broccoli, crudo" compare 4 volte.

**Riga risultato:** nome con le parole trovate in grassetto e sottolineate dall'accento · riga secondaria `100 g · kcal · P · C · G` con cifre tabulari · a destra pulsante rotondo "+" (rialzato, 44 px) che aggiunge 100 g al pasto e diventa accento con spunta, con avviso "Aggiunto al pranzo" per 1,8 s. Toccare la riga apre la scheda.

**Stati** (tutti presenti nel prototipo, pannello laterale "Ricerca alimenti: stati")
| Stato | Cosa mostra |
|---|---|
| Vuota | "Recenti" del pasto in corso + una riga di aiuto |
| Risultati | Conteggio in eyebrow + elenco (max 20) |
| Nessun risultato | Titolo con la ricerca, come correggerla, azioni "Crea «…»" (primaria) e "Scansiona il barcode" |
| Caricamento | Cinque righe scheletro con la forma delle righe reali; movimento azzerato con "riduci movimento" |
| Offline | Avviso incassato "Cerco solo tra gli alimenti sul telefono" sopra i risultati locali |
| Preferiti / Miei vuoti | Spiegano come popolarli, non si limitano a "nessun dato" |

Il campo di ricerca è **incassato** (è un campo), con anello accento al focus e "✕" per cancellare. Il filtro "Recenti" restringe anche i risultati.

**Da risolvere nei dati** (emersi disegnando la schermata con i dati veri)
- Le etichette delle porzioni USDA sono in inglese ("1 cup, whole"): vanno tradotte e normalizzate prima di mostrarle.
- Alcune traduzioni sono ancora sbagliate (es. "Oat bran" → "Reggiseno d'avena", "Plantain" → "Pianifica la banana"): correggerle nel glossario partendo dai cibi più comuni.
- La classifica ha bisogno di un segnale "comune" più forte dei soli caratteri del nome; valutare un elenco di alimenti generici da favorire.

## Accessibilità
- Contrasto testo ≥ 4.5:1 (`ink2` è stato scurito per questo). Verificare `accentInk` su `accent` e le cifre su superfici incassate.
- Ogni controllo ha etichetta accessibile; stato (`selected`, `checked`) esposto, mai solo tramite colore o ombra.
- Bersagli ≥ 44 px. Testo scalabile con le impostazioni di sistema: nessuna altezza fissa sulle righe di testo.
- Tema: segue il sistema, sovrascrivibile in Impostazioni.

## Tweakbar (solo prototipo)
Il pulsante **Ritocchi** in alto a destra apre un pannello che cambia dal vivo i token di stile e salva le scelte nel browser. Serve a decidere prima di scrivere il tema dell'app.

| Gruppo | Cosa cambia | Token |
|---|---|---|
| Colore | Tema chiaro/scuro, accento (6 preset o tonalità, intensità e luminosità liberi) | `--accent` |
| Card e superfici | Stile neumorfico, piatto o solo contorno · raggio card · raggio campi · rilievo · incavo dei campi | `--r-lg`, `--r-md`, `--depth`, `--idepth`, `data-surface` |
| Pulsanti | Pieno, soffice o contorno · forma (pillola, arrotondato, squadrato) · altezza · alone colorato | `data-btn`, `--r-btn`, `--btn-h`, `--btn-glow` |
| Navigazione | Barra a pillola, arrotondata o squadrata | `--r-nav` |
| Tipografia | Coppia di font (Bricolage + Figtree, Outfit + DM Sans, Geist, Sora + Figtree) · dimensione dei titoli | `--font-display`, `--font-body`, `--title-size` |
| Densità e movimento | Compatta, normale, ariosa · movimento spento | `data-density`, `data-motion` |

"Copia token" esporta i valori in JSON, da portare in `src/constants/theme.ts`. "Ripristina" torna ai valori di Neve. Le ombre neumorfiche sono calcolate dai token (`--depth`, `--idepth`) per ogni tema, quindi il rilievo resta coerente in chiaro e scuro.

## Implementazione (Expo / NativeWind v5)
- Token statici (font, raggi) e nomi dei colori in `src/global.css` (`@theme`); valori dei colori per tema e accento in `src/constants/theme.ts`, iniettati come variabili CSS da `ThemeProvider` (`VariableContextProvider`). Classi: `bg-card`, `text-ink-2`, `text-accent`, `rounded-card`, `font-display`…
- Nuovo colore = `@theme` + `:root` in `global.css`, `theme.ts`, `ThemeProvider` e `inlineVariables.exclude` in `metro.config.js`.
- Accento e modalità (sistema/chiaro/scuro) stanno nello store Zustand `useSettings`.
- Ombre neumorfiche: helper `raised(t)` / `inset(t)` in `components/ui/surface.tsx` (dipendono dal tema).
- Componenti base in `src/components/ui/`: `Card`, `Inset`, `Text`, `Screen`; da aggiungere `Button`, `Chip`, `Field`, `Switch`, `Ring`, `Bar`.
- Font con `expo-font` (`@expo-google-fonts`). Il prototipo web usa dati di esempio: non sono reali.

## Da definire
- Icona dell'app e splash.
- Immagini degli esercizi (attribuzione © Gym visual da verificare prima dello store) e mappa muscolare definitiva (il prototipo è schematico).
- Grafici: valutare Victory Native / Skia contro SVG semplice.
