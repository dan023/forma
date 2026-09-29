const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Migrazioni Drizzle (drizzle/*.sql).
config.resolver.sourceExts.push('sql');

module.exports = withNativewind(config, {
  // Variabili cambiate a runtime da ThemeProvider (tema chiaro/scuro, accento).
  inlineVariables: {
    exclude: [
      '--color-bg',
      '--color-card',
      '--color-ink',
      '--color-ink-2',
      '--color-line',
      '--color-accent',
      '--color-accent-ink',
      '--color-ok',
    ],
  },
});
