import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform } from 'react-native';

/**
 * Vero su iOS 26+ (build con Xcode 26): il sistema disegna la barra delle tab con il Liquid Glass.
 * Altrove (Android, web, iOS precedenti) si resta sulla barra a pillola Neve.
 */
export const USE_LIQUID_GLASS = Platform.OS === 'ios' && isLiquidGlassAvailable();
