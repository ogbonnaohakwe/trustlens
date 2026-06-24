import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'viewmodels/trust_lens_viewmodel.dart';
import 'screens/welcome_screen.dart';
import 'screens/access_system_screen.dart';
import 'screens/setup_screens.dart';
import 'screens/dashboard_tabs_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await dotenv.load(fileName: '.env');
  } catch (e) {
    // Fail-safe if .env does not exist or fails to load
    debugPrint('Error loading .env file: $e');
  }
  runApp(
    ChangeNotifierProvider(
      create: (_) => TrustLensViewModel(),
      child: const TrustLensApp(),
    ),
  );
}

class TrustLensApp extends StatelessWidget {
  const TrustLensApp({super.key});

  @override
  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<TrustLensViewModel>(context);
    final isDark = viewModel.isDarkMode;

    final darkTheme = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      fontFamily: 'Inter',
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF060B13),
        brightness: Brightness.dark,
        primary: const Color(0xFF060B13),
        onPrimary: Colors.white,
        secondary: const Color(0xFFE50914),
        onSecondary: Colors.white,
        surface: const Color(0xFF0D1520),
        onSurface: Colors.white,
      ),
      scaffoldBackgroundColor: const Color(0xFF060B13),
      cardTheme: const CardThemeData(
        color: Color(0xFF0D1520),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
          side: BorderSide(color: Color(0xFF1E293B), width: 1.5),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF0F172A),
        hintStyle: const TextStyle(color: Colors.white38, fontSize: 13),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF1E293B)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF1E293B)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE50914), width: 1.5),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFE50914),
          foregroundColor: Colors.white,
          elevation: 2,
          shadowColor: const Color(0xFFE50914).withOpacity(0.3),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );

    final lightTheme = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      fontFamily: 'Inter',
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFFF8F9FF),
        brightness: Brightness.light,
        primary: const Color(0xFFF8F9FF),
        onPrimary: const Color(0xFF0B1C30),
        secondary: const Color(0xFFE50914),
        onSecondary: Colors.white,
        surface: Colors.white,
        onSurface: const Color(0xFF0B1C30),
      ),
      scaffoldBackgroundColor: const Color(0xFFF8F9FF),
      cardTheme: const CardThemeData(
        color: Colors.white,
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
          side: BorderSide(color: Color(0xFFE2E8F0), width: 1.5),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFFF1F5F9),
        hintStyle: const TextStyle(color: Colors.black38, fontSize: 13),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE50914), width: 1.5),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFE50914),
          foregroundColor: Colors.white,
          elevation: 2,
          shadowColor: const Color(0xFFE50914).withOpacity(0.15),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );

    return MaterialApp(
      title: 'TrustLenAI',
      debugShowCheckedModeBanner: false,
      theme: isDark ? darkTheme : lightTheme,
      home: const RootNavigator(),
    );
  }
}

class RootNavigator extends StatelessWidget {
  const RootNavigator({super.key});

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<TrustLensViewModel>(context);

    return Scaffold(
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 350),
        transitionBuilder: (Widget child, Animation<double> animation) {
          final offsetAnimation = Tween<Offset>(
            begin: const Offset(1.0, 0.0),
            end: Offset.zero,
          ).animate(CurvedAnimation(
            parent: animation,
            curve: Curves.easeInOut,
          ));

          return SlideTransition(
            position: offsetAnimation,
            child: FadeTransition(
              opacity: animation,
              child: child,
            ),
          );
        },
        child: _buildCurrentScreen(viewModel.screenState),
      ),
    );
  }

  Widget _buildCurrentScreen(ScreenState state) {
    switch (state) {
      case ScreenState.welcome:
        return const WelcomeScreen(key: ValueKey('welcome'));
      case ScreenState.accessSystem:
        return const AccessSystemScreen(key: ValueKey('accessSystem'));
      case ScreenState.setupStep1:
        return const SetupStep1Screen(key: ValueKey('setupStep1'));
      case ScreenState.setupStep2:
        return const SetupStep2Screen(key: ValueKey('setupStep2'));
      case ScreenState.setupStep3:
        return const SetupStep3Screen(key: ValueKey('setupStep3'));
      case ScreenState.dashboard:
        return const DashboardTabsScreen(key: ValueKey('dashboard'));
    }
  }
}
