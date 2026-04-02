import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'theme.dart';
import 'screens/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Enforce dark mode status bar completely invisible blending
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: TealMidnightTheme.background,
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  runApp(const TalkifyApp());
}

class TalkifyApp extends StatelessWidget {
  const TalkifyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Talkify Flutter',
      debugShowCheckedModeBanner: false,
      theme: TealMidnightTheme.themeData.copyWith(
        textTheme: GoogleFonts.interTextTheme(
          Theme.of(context).textTheme.apply(
            bodyColor: TealMidnightTheme.textPrimary,
            displayColor: TealMidnightTheme.textPrimary,
          ),
        ),
      ),
      home: const HomeScreen(),
    );
  }
}
