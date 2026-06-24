import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../viewmodels/trust_lens_viewmodel.dart';
import '../api/product_analysis_engine.dart';
import '../data/database_helper.dart';

class VoiceAgentOverlay extends StatefulWidget {
  final ScannedProductAnalysis scanResult;

  const VoiceAgentOverlay({
    super.key,
    required this.scanResult,
  });

  @override
  State<VoiceAgentOverlay> createState() => _VoiceAgentOverlayState();
}

class _VoiceAgentOverlayState extends State<VoiceAgentOverlay> {
  late final WebViewController _webViewController;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    final viewModel = Provider.of<TrustLensViewModel>(context, listen: false);

    // Build the exact scanResult JSON format expected by WebView
    final scanJson = {
      'productName': widget.scanResult.productName,
      'safetyScore': widget.scanResult.safetyScore,
      'safetyStatus': widget.scanResult.safetyStatus,
      'avoidIngredients': widget.scanResult.avoidIngredients.join(','),
      'cautionIngredients': widget.scanResult.cautionIngredients.join(','),
      'summaryReport': widget.scanResult.summaryReport,
    };

    // Construct injection script to bridge Javascript synchronously
    final jsMock = """
      window.AndroidInterface = {
        getUserEmail: function() { return '${viewModel.userProfile?['email'] ?? ''}'; },
        getUserName: function() { return '${viewModel.userProfile?['name'] ?? ''}'; },
        isUserPro: function() { return ${viewModel.userProfile?['securityTier']?.toString().contains('Pro') == true ? 'true' : 'false'}; },
        getGeminiKey: function() { return '${viewModel.geminiApiKey}'; },
        getDeepgramKey: function() { return '${viewModel.deepgramApiKey}'; },
        getScanResultJson: function() { return JSON.stringify(${jsonEncode(scanJson)}); },
        setProStatus: function(status) { AndroidChannel.postMessage(JSON.stringify({action: 'setProStatus', data: status})); },
        closeModal: function() { AndroidChannel.postMessage(JSON.stringify({action: 'closeModal'})); }
      };
    """;

    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF060B13))
      ..addJavaScriptChannel(
        'AndroidChannel',
        onMessageReceived: (JavaScriptMessage message) {
          try {
            final parsed = jsonDecode(message.message);
            final action = parsed['action'];
            final data = parsed['data'];

            if (action == 'closeModal') {
              Navigator.pop(context);
            } else if (action == 'setProStatus') {
              // Update user profile to Pro status
              final updatedTier = data == true ? 'Tier 2: Premium Clinical Pro' : 'Tier 3: Clinical Administrator';
              viewModel.updateProfileDirect(
                allergies: viewModel.userProfile?['allergies'] ?? '',
                conditions: viewModel.userProfile?['conditions'] ?? '',
              );
              // Also manually set securityTier inside userProfile local database
              final current = viewModel.userProfile;
              if (current != null) {
                final updated = Map<String, dynamic>.from(current);
                updated['securityTier'] = updatedTier;
                DatabaseHelper.instance.saveUserProfile(updated);
                viewModel.fetchAndSyncFirestoreProfile();
              }
            }
          } catch (e) {
            debugPrint('Error parsing WebView AndroidChannel callback: $e');
          }
        },
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) {
            _webViewController.runJavaScript(jsMock);
          },
          onPageFinished: (url) {
            setState(() {
              _isLoading = false;
            });
            // Re-run mock injection post-load as a safety backup
            _webViewController.runJavaScript(jsMock);
          },
        ),
      )
      ..loadFlutterAsset('assets/voice_agent.html');
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: const BoxDecoration(
        color: Color(0xFF060B13),
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        child: Stack(
          children: [
            WebViewWidget(controller: _webViewController),
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(
                  color: Color(0xFFE50914),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
