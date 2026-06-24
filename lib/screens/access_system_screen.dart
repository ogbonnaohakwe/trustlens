import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../viewmodels/trust_lens_viewmodel.dart';

class AccessSystemScreen extends StatefulWidget {
  const AccessSystemScreen({super.key});

  @override
  State<AccessSystemScreen> createState() => _AccessSystemScreenState();
}

class _AccessSystemScreenState extends State<AccessSystemScreen> {
  late final WebViewController _webViewController;

  @override
  void initState() {
    super.initState();
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF060B13)) // Overhauled background color to dark
      ..addJavaScriptChannel(
        'AndroidInterface',
        onMessageReceived: (JavaScriptMessage message) {
          final viewModel = Provider.of<TrustLensViewModel>(context, listen: false);
          try {
            final parsed = jsonDecode(message.message);
            final action = parsed['action'];
            if (action == 'login') {
              final email = parsed['email'];
              viewModel.loginWithEmailOrOnboard(email, '', '');
            } else if (action == 'privacy_policy') {
              _showPrivacyPolicy(context);
            } else if (action == 'terms_of_service') {
              _showTermsOfService(context);
            }
          } catch (e) {
            // Fallback for direct string messages
            final email = message.message;
            if (email.contains('@')) {
              viewModel.loginWithEmailOrOnboard(email, '', '');
            }
          }
        },
      )
      ..loadFlutterAsset('assets/login.html');
  }

  void _showPrivacyPolicy(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0D1520),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Privacy Policy',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white70),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Flexible(
                  child: SingleChildScrollView(
                    child: Text(
                      'Your privacy is critical to us at TrustLenAI. All processed data, including label scans, ingredients analysis, and health parameter logs, are saved locally on your device. We do not store or transmit raw scans to any external server beyond our clinical API matching models. If you choose to sync your profile with Firestore, it is transmitted over a secure, encrypted connection and stored securely. We do not sell or share your clinical/health information with third parties.',
                      style: TextStyle(
                        color: Color(0xFFCBD5E1),
                        fontSize: 14,
                        height: 1.5,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showTermsOfService(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0D1520),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Terms of Service',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white70),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Flexible(
                  child: SingleChildScrollView(
                    child: Text(
                      'Welcome to TrustLenAI. By using this application, you agree to these Terms of Service. TrustLenAI provides ingredient matching, safety index tracking, and clinical safety evaluations based on default or customized health profiles. This application is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a certified healthcare professional before making dietary changes or consuming products containing warning ingredients.',
                      style: TextStyle(
                        color: Color(0xFFCBD5E1),
                        fontSize: 14,
                        height: 1.5,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<TrustLensViewModel>(context);

    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: _webViewController),
            if (viewModel.loginInProgress)
              Container(
                color: Colors.black.withOpacity(0.65), // Richer overlay opacity
                child: const Center(
                  child: CircularProgressIndicator(
                    color: Color(0xFFE50914), // Radiant red progress bar
                  ),
                ),
              ),
            if (viewModel.firestoreSyncError != null)
              Positioned(
                bottom: 24,
                left: 24,
                right: 24,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0D1520),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE50914).withOpacity(0.5)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFE50914).withOpacity(0.1),
                        blurRadius: 10,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Text(
                    viewModel.firestoreSyncError!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
