#!/usr/bin/env bash
# Emulatore Android senza finestra (AVD "forma_pixel", Pixel 7, Android 15).
# Uso: scripts/android-emulator.sh start | stop | status | shot [file.png]
#
# `-gpu swangle_indirect` è obbligatorio su questo computer (Fedora 44): con le altre modalità
# (swiftshader_indirect, guest, off) qemu va in SIGSEGV caricando il Vulkan di sistema (Mesa lavapipe).
# Creazione una tantum dell'AVD, se manca:
#   sdkmanager "system-images;android-35;google_apis;x86_64"   (JAVA_HOME deve puntare a un JDK esistente)
#   avdmanager create avd -n forma_pixel -k "system-images;android-35;google_apis;x86_64" -d pixel_7
set -euo pipefail

SDK="${ANDROID_HOME:-$HOME/Android/Sdk}"
AVD="${FORMA_AVD:-forma_pixel}"
ADB="$SDK/platform-tools/adb"
booted() { [ "$("$ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; }

case "${1:-status}" in
  start)
    if booted; then echo "Emulatore già avviato."; exit 0; fi
    "$SDK/emulator/emulator" -list-avds | grep -qx "$AVD" || { echo "AVD '$AVD' non trovato: vedi i comandi in testa a questo file." >&2; exit 1; }
    "$ADB" kill-server >/dev/null 2>&1 || true
    setsid nohup "$SDK/emulator/emulator" -avd "$AVD" -no-window -no-audio -no-boot-anim -no-snapshot -no-metrics \
      -gpu swangle_indirect -memory 3072 </dev/null >"${TMPDIR:-/tmp}/forma-emulator.log" 2>&1 &
    for _ in $(seq 1 60); do sleep 5; if booted; then echo "Emulatore pronto (Android $("$ADB" shell getprop ro.build.version.release | tr -d '\r'))."; exit 0; fi; done
    echo "L'emulatore non è partito: vedi ${TMPDIR:-/tmp}/forma-emulator.log" >&2; exit 1 ;;
  stop)   "$ADB" emu kill >/dev/null 2>&1 || true; echo "Emulatore fermato." ;;
  status) if booted; then echo "avviato"; else echo "spento"; fi ;;
  shot)   "$ADB" exec-out screencap -p >"${2:-screenshot.png}"; echo "Salvato ${2:-screenshot.png}" ;;
  *) echo "Uso: $0 start|stop|status|shot [file.png]" >&2; exit 2 ;;
esac
