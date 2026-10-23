const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');
const path = require('node:path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const nativewindConfig = withNativewind(config, {
  // Variabili cambiate a runtime da ThemeProvider (tema chiaro/scuro, accento).
  inlineVariables: {
    exclude: [
      '--color-bg',
      '--color-card',
      '--color-ink',
      '--color-ink-2',
      '--color-line',
      '--color-control',
      '--color-primary',
      '--color-on-primary',
      '--color-track',
      '--color-accent',
      '--color-accent-ink',
      '--color-tint',
      '--color-tint-strong',
      '--color-prot',
      '--color-carb',
      '--color-fat',
      '--color-danger',
      '--color-danger-tint',
      '--color-danger-ink',
      '--color-warning',
      '--color-warning-tint',
      '--color-warning-ink',
      '--color-warning-on',
      '--color-success',
      '--color-success-tint',
      '--color-success-ink',
    ],
  },
});

/*
 * SDK 58 + react-native-css 3.1.0-rc.0: il resolver di NativeWind reindirizza ogni `import ... from 'react-native'`
 * a un modulo che riesporta tutto con `export *`, ma perde `AssetRegistry` (novità di React Native 0.88).
 * expo-asset 58 lo importa da 'react-native': `useFonts` falliva con "Cannot read property 'getAssetByID'
 * of undefined" e l'app restava sulla splash. Questi pacchetti non usano `className`, quindi importano il vero
 * react-native. Da rimuovere quando react-native-css risolve il problema.
 */
const REAL_RN = path.join(path.dirname(require.resolve('react-native/package.json')), 'index.js');
const NEEDS_REAL_RN = /[\\/]node_modules[\\/](?:expo-asset|expo-font)[\\/]/;
const nativewindResolve = nativewindConfig.resolver.resolveRequest;

nativewindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native' && NEEDS_REAL_RN.test(context.originModulePath)) {
    return { type: 'sourceFile', filePath: REAL_RN };
  }
  return nativewindResolve(context, moduleName, platform);
};

module.exports = nativewindConfig;
