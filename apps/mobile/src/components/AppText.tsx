import { useMemo } from 'react';
import { StyleSheet, Text as NativeText, type TextProps } from 'react-native';
import { usePreferences } from '../services/preferences/PreferencesProvider';

const latinFonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
} as const;

const arabicFonts = {
  regular: 'IBMPlexSansArabic_400Regular',
  medium: 'IBMPlexSansArabic_500Medium',
  semibold: 'IBMPlexSansArabic_600SemiBold',
  bold: 'IBMPlexSansArabic_700Bold',
} as const;

export function AppText({ style, ...props }: TextProps) {
  const { preferences } = usePreferences();
  const fontFamily = useMemo(() => {
    const weight = StyleSheet.flatten(style)?.fontWeight;
    const numericWeight = typeof weight === 'number' ? weight : Number.parseInt(String(weight ?? '400'), 10);
    const variant = numericWeight >= 700 ? 'bold' : numericWeight >= 600 ? 'semibold' : numericWeight >= 500 ? 'medium' : 'regular';
    return preferences.language === 'ar' ? arabicFonts[variant] : latinFonts[variant];
  }, [preferences.language, style]);

  return <NativeText {...props} style={[style, { fontFamily }]} />;
}
