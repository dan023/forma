# Forma — Design

Direzione: **Neve**. Superfici morbide e tattili (neumorfismo controllato), un solo accento arancione, titoli grandi, nav a pillola. Due temi: **Neve** (chiaro) e **Neve scura**.

Prototipo di riferimento: `design/index.html` (`cd design && python3 -m http.server 8080`). In caso di dubbio, vale il prototipo; questo documento ne spiega le regole.

## Principi
1. **Calma, non decorazione.** Ogni ombra deve dire "questo si può toccare" o "questo contiene un valore". Niente gradienti decorativi. Niente vetro nel contenuto: l'unica eccezione è il Liquid Glass di sistema su iOS 26 (vedi sotto).
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
Nav principale: **Oggi · Allenamento · Pasti · Statistiche · Impostazioni**.

| Schermata | Contenuto | Note |
|---|---|---|
| Onboarding | 4 passi: obiettivo, dati, giorni allenamento, accento/tema | Barra segmentata, una scelta per schermata |
| Oggi | Saluto, anello kcal + macro, allenamento del giorno, peso | Obiettivi diversi giorno allenamento/riposo |
| Allenamento | Timer recupero, serie, prossimi esercizi | Progressione (lineare, Greyskull, doppia), 1RM, RIR |
| ↳ Catalogo esercizi | Ricerca, filtri muscolo, crea personalizzato | ~1.324 esercizi |
| Pasti | Selettore giorno, ricerca, barcode, ricette, pasti configurabili | |
| ↳ Aggiungi alimento | Grammi/porzioni, macro live, valori per 100 g e fonte | |
| ↳ Barcode | Mirino, inserimento manuale | Open Food Facts + cache locale |
| ↳ Ricette | Ingredienti, macro per porzione, salvate | |
| Statistiche | Peso / calorie / volume, volume settimanale, costanza | |
| ↳ Mappa muscolare | Fronte/retro, intensità per muscolo, dettaglio serie | Soglia "ottimo" 10–20 serie/sett. |
| Impostazioni | Accento, tema, obiettivi, promemoria, unità, export/import JSON | |

## Accessibilità
- Contrasto testo ≥ 4.5:1 (`ink2` è stato scurito per questo). Verificare `accentInk` su `accent` e le cifre su superfici incassate.
- Ogni controllo ha etichetta accessibile; stato (`selected`, `checked`) esposto, mai solo tramite colore o ombra.
- Bersagli ≥ 44 px. Testo scalabile con le impostazioni di sistema: nessuna altezza fissa sulle righe di testo.
- Tema: segue il sistema, sovrascrivibile in Impostazioni.

## iOS 26: Liquid Glass (ibrido)
Su iOS 26 e successivi il **chrome di sistema** usa il Liquid Glass nativo; il **contenuto resta Neve** (card, campi, numeri, accento).
- **Barra delle tab:** nativa (`NativeTabs` di Expo Router, `src/components/glass-tabs.tsx`), con SF Symbols, etichette tradotte e accento per la voce attiva. Si nasconde in parte allo scorrimento (`minimizeBehavior`).
- **Altre piattaforme** (Android, web, iOS precedenti): barra a pillola Neve, invariata. La scelta sta in `src/constants/glass.ts` (`USE_LIQUID_GLASS`).
- **Da fare quando esistono le schermate:** header e sheet di sistema (stesso materiale), pulsanti flottanti con `GlassView` solo se sopra al contenuto. Il vetro non va mai dentro le card.
- Il prototipo web non mostra il Liquid Glass: il browser non può renderizzarlo fedelmente. Per vederlo serve un build iOS 26 (EAS Simulator o iPhone).

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
