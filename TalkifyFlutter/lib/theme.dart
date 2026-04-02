import 'package:flutter/material.dart';

class TealMidnightTheme {
  // Midnight Monolith Colors
  static const Color background = Color(0xFF10141A);
  static const Color surface = Color(0xFF1C2026);
  static const Color surfaceHover = Color(0xFF262A31);
  
  // Teal Accent
  static const Color accent = Color(0xFF66D9CC);
  static const Color accentDim = Color(0xFF008177);
  
  // Texts
  static const Color textPrimary = Color(0xFFDFE2EB);
  static const Color textSecondary = Color(0xFF8B949E);
  static const Color textOnAccent = Color(0xFF003732);

  // Dividers
  static const Color dividerColor = Color(0xFF3E4949);

  static ThemeData get themeData {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: accent,
      colorScheme: const ColorScheme.dark(
        primary: accent,
        secondary: accentDim,
        surface: surface,
        background: background,
        onPrimary: textOnAccent,
        onSurface: textPrimary,
        onBackground: textPrimary,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: textSecondary),
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 22,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: const CardTheme(
        color: surface,
        elevation: 0,
      ),
      dividerTheme: const DividerThemeData(
        color: Colors.transparent, // "No-Line" aesthetic
        space: 1,
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: accent,
        foregroundColor: textOnAccent,
      ),
    );
  }
}
