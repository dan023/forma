#!/usr/bin/env bash
# Emulatore Android (AVD "forma_pixel", Pixel 7, Android 15).
# Uso: scripts/android-emulator.sh open | start | app | status | shot [file.png] | stop
#   open  = avvia con la finestra visibile
#   start = avvia senza finestra (per gli screenshot da riga di comando)
#   app   = avvia il server di sviluppo e apre Forma sull'emulatore (o, solo se indicato a mano, su un telefono:
#           FORMA_DEVICE=<seriale da `adb devices`> bun run emulator app)
#
# SICUREZZA: ogni comando agisce solo su un dispositivo `emulator-*`. Un telefono collegato via USB non viene mai
# toccato. Non usare `expo start --android` con un telefono collegato: la CLI sceglie il dispositivo da sola e può
# disinstallare/reinstallare Expo Go dal telefono. Usare `bun run emulator app`.
#
# `-gpu swangle_indirect` è obbligatorio su questo computer (Fedora 44): con le altre modalità qemu va in SIGSEGV
# caricando il Vulkan di sistema (Mesa lavapipe). Creazione una tantum dell'AVD, se manca:
#   sdkmanager "system-images;android-35;google_apis;x86_64"   (JAVA_HOME deve puntare a un JDK esistente)
#   avdmanager create avd -n forma_pixel -k "system-images;android-35;google_apis;x86_64" -d pixel_7
set -euo pipefail

SDK="${ANDROID_HOME:-$HOME/Android/Sdk}"
AVD="${FORMA_AVD:-forma_pixel}"
ADB="$SDK/platform-tools/adb"

# Seriale dell'emulatore acceso (vuoto se non c'è). Ignora qualsiasi altro dispositivo.
emulator_serial() { "$ADB" devices 2>/dev/null | awk '$1 ~ /^emulator-/ && $2=="device" {print $1; exit}'; }
# Vero solo se un emulatore ha finito l'avvio.
booted() {
  local s; s=$(emulator_serial); [ -n "$s" ] || return 1
  [ "$("$ADB" -s "$s" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]
}
require_emulator() { SERIAL=$(emulator_serial); [ -n "$SERIAL" ] || { echo "Nessun emulatore acceso: lancia prima 'bun run emulator open'." >&2; exit 1; }; }

case "${1:-status}" in
  start|open)
    # `open` mostra la finestra: se è già acceso senza finestra va riavviato.
    if booted && [ "$1" = "open" ] && ! pgrep -f "[q]emu-system-x86_64 .*-avd $AVD" >/dev/null; then
      "$ADB" -s "$(emulator_serial)" emu kill >/dev/null 2>&1 || true; sleep 6
    fi
    if booted; then echo "Emulatore già avviato."; exit 0; fi
    "$SDK/emulator/emulator" -list-avds | grep -qx "$AVD" || { echo "AVD '$AVD' non trovato: vedi i comandi in testa a questo file." >&2; exit 1; }
    WINDOW_ARG="-no-window"; [ "$1" = "open" ] && WINDOW_ARG=""
    # shellcheck disable=SC2086
    setsid nohup "$SDK/emulator/emulator" -avd "$AVD" $WINDOW_ARG -no-audio -no-boot-anim -no-snapshot -no-metrics \
      -gpu swangle_indirect -memory 3072 </dev/null >"${TMPDIR:-/tmp}/forma-emulator.log" 2>&1 &
    for _ in $(seq 1 60); do
      sleep 5
      if booted; then s=$(emulator_serial); echo "Emulatore pronto ($s, Android $("$ADB" -s "$s" shell getprop ro.build.version.release | tr -d '\r'))."; exit 0; fi
    done
    echo "L'emulatore non è partito: vedi ${TMPDIR:-/tmp}/forma-emulator.log" >&2; exit 1 ;;
  app)
    # Un telefono si usa solo se indicato esplicitamente con FORMA_DEVICE; altrimenti solo l'emulatore.
    if [ -n "${FORMA_DEVICE:-}" ]; then
      "$ADB" devices | awk -v d="$FORMA_DEVICE" '$1==d && $2=="device"' | grep -q . || { echo "Dispositivo $FORMA_DEVICE non collegato o non autorizzato." >&2; exit 1; }
      SERIAL="$FORMA_DEVICE"
    else
      require_emulator
    fi
    PORT="${FORMA_PORT:-8081}"
    cd "$(dirname "$0")/.."
    # Metro con --localhost ascolta solo su [::1]: il controllo va fatto con `localhost` (IPv6 compreso), non 127.0.0.1.
    if ! curl -fs --max-time 3 "http://localhost:$PORT/status" 2>/dev/null | grep -q running; then
      setsid nohup bunx expo start --localhost --port "$PORT" </dev/null >"${TMPDIR:-/tmp}/forma-metro.log" 2>&1 &
      for _ in $(seq 1 30); do sleep 2; curl -fs --max-time 3 "http://localhost:$PORT/status" 2>/dev/null | grep -q running && break; done
    fi
    "$ADB" -s "$SERIAL" reverse "tcp:$PORT" "tcp:$PORT" >/dev/null
    "$ADB" -s "$SERIAL" shell pm list packages host.exp.exponent | grep -q . || { echo "Expo Go non è installato sull'emulatore." >&2; exit 1; }
    "$ADB" -s "$SERIAL" shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:$PORT?__expo_disable_onboarding=1" host.exp.exponent >/dev/null
    echo "Forma aperta su $SERIAL (server su porta $PORT, log: ${TMPDIR:-/tmp}/forma-metro.log)." ;;
  stop)   if s=$(emulator_serial) && [ -n "$s" ]; then "$ADB" -s "$s" emu kill >/dev/null 2>&1 || true; echo "Emulatore fermato."; else echo "Nessun emulatore acceso."; fi ;;
  status) if booted; then echo "avviato"; else echo "spento"; fi ;;
  shot)   require_emulator; "$ADB" -s "$SERIAL" exec-out screencap -p >"${2:-screenshot.png}"; echo "Salvato ${2:-screenshot.png}" ;;
  *) echo "Uso: $0 open|start|app|status|shot [file.png]|stop" >&2; exit 2 ;;
esac
