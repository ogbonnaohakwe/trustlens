import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:camera/camera.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../viewmodels/trust_lens_viewmodel.dart';
import '../api/product_analysis_engine.dart';
import 'voice_agent_overlay.dart';

class DashboardTabsScreen extends StatefulWidget {
  const DashboardTabsScreen({super.key});

  @override
  State<DashboardTabsScreen> createState() => _DashboardTabsScreenState();
}

class _DashboardTabsScreenState extends State<DashboardTabsScreen> {
  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<TrustLensViewModel>(context);
    final currentTab = viewModel.currentTab;
    final isDark = viewModel.isDarkMode;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF060B13) : const Color(0xFFF8F9FF),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0), height: 1.0),
        ),
        title: Row(
          children: [
            if (currentTab != DashboardTab.home) ...[
              IconButton(
                icon: Icon(Icons.arrow_back, color: isDark ? Colors.white : const Color(0xFF0B1C30)),
                onPressed: () => viewModel.setTab(DashboardTab.home),
              ),
              Text(
                currentTab == DashboardTab.scan
                    ? 'Analyze Labels'
                    : currentTab == DashboardTab.history
                        ? 'Scan History Log'
                        : 'Profile Security',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? Colors.white : const Color(0xFF0B1C30)),
              ),
            ] else ...[
              Image.asset('assets/tplus.png', width: 28, height: 28, errorBuilder: (_, __, ___) => const Icon(Icons.shield, color: Color(0xFFE50914))),
              const SizedBox(width: 8),
              Text(
                'TrustLenAI',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: isDark ? Colors.white : const Color(0xFF0B1C30)),
              ),
            ]
          ],
        ),
        actions: [
          if (currentTab == DashboardTab.home) ...[
            // Theme toggle button
            IconButton(
              tooltip: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
              icon: Icon(
                isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                color: isDark ? Colors.white70 : const Color(0xFF64748B),
              ),
              onPressed: () => viewModel.toggleTheme(),
            ),
            IconButton(
              icon: const Icon(Icons.account_circle, color: Color(0xFFE50914), size: 28),
              onPressed: () => viewModel.setTab(DashboardTab.profile),
            ),
          ],
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentTab.index,
        onDestinationSelected: (index) {
          viewModel.setTab(DashboardTab.values[index]);
        },
        backgroundColor: isDark ? const Color(0xFF060B13) : Colors.white,
        indicatorColor: isDark ? const Color(0xFF2E090F) : const Color(0xFFFFE4E6),
        destinations: [
          NavigationDestination(icon: Icon(Icons.home, color: isDark ? Colors.white : const Color(0xFF64748B)), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.document_scanner, color: isDark ? Colors.white : const Color(0xFF64748B)), label: 'Scan'),
          NavigationDestination(icon: Icon(Icons.history, color: isDark ? Colors.white : const Color(0xFF64748B)), label: 'History'),
          NavigationDestination(icon: Icon(Icons.person, color: isDark ? Colors.white : const Color(0xFF64748B)), label: 'Profile'),
        ],
      ),
      body: SafeArea(
        child: IndexedStack(
          index: currentTab.index,
          children: const [
            HomeTab(),
            ScanTab(),
            HistoryTab(),
            ProfileTab(),
          ],
        ),
      ),
    );
  }
}

// ==========================================
// 1. HOME TAB
// ==========================================
class HomeTab extends StatefulWidget {
  const HomeTab({super.key});

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  final TextEditingController _chatController = TextEditingController();
  final TextEditingController _groundingController = TextEditingController();

  @override
  void dispose() {
    _chatController.dispose();
    _groundingController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<TrustLensViewModel>(context);
    final user = viewModel.userProfile ?? {};
    final isDark = viewModel.isDarkMode;
    final textColor = isDark ? Colors.white : const Color(0xFF0B1C30);
    final subtitleColor = isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cardBg = isDark ? const Color(0xFF0D1520) : Colors.white;
    final surfaceBg = isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9);
    final borderColor = isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);

    final List<String> allergies = (user['allergies'] ?? '').toString().split(',').where((e) => e.isNotEmpty).toList();
    final List<String> conditions = (user['conditions'] ?? '').toString().split(',').where((e) => e.isNotEmpty).toList();

    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        // 0. Theme toggle pill
        Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: borderColor),
          ),
          child: Row(
            children: [
              Icon(
                isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                color: const Color(0xFFE50914),
                size: 20,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  isDark ? 'Dark Mode Active' : 'Light Mode Active',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: textColor),
                ),
              ),
              Switch.adaptive(
                value: isDark,
                onChanged: (_) => viewModel.toggleTheme(),
                activeColor: const Color(0xFFE50914),
                activeTrackColor: const Color(0xFFE50914).withOpacity(0.3),
                inactiveThumbColor: const Color(0xFF94A3B8),
                inactiveTrackColor: borderColor,
              ),
            ],
          ),
        ),
        // 1. Command Center Hero Card with glowing dark gradient
        Card(
          color: Colors.transparent,
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isDark
                    ? [const Color(0xFF1B091B), const Color(0xFF0F172A)]
                    : [const Color(0xFFFFF1F2), const Color(0xFFF8F9FF)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE50914).withOpacity(0.3), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFE50914).withOpacity(0.06),
                  blurRadius: 12,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE50914).withOpacity(0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.bolt, color: Color(0xFFE50914), size: 16),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'COMMAND CENTER',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFFE50914), letterSpacing: 2),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Profile 100% Calibrated',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: textColor),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Your personal health filter indexes are active. Scan any barcode, ingredients label, or chemical report to instantly check compatibility.',
                    style: TextStyle(fontSize: 13, height: 1.4, color: subtitleColor),
                  ),
                  const SizedBox(height: 20),
                  Container(
                    width: double.infinity,
                    height: 50,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFE50914).withOpacity(0.2),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton.icon(
                      onPressed: () => viewModel.setTab(DashboardTab.scan),
                      icon: const Icon(Icons.document_scanner_rounded, color: Colors.white),
                      label: const Text('SCAN PRODUCT LABEL', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE50914),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
          const SizedBox(height: 16),
        // 2. Active Lens parameters
        Card(
          child: Padding(
            padding: const EdgeInsets.all(18.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Active Diagnostic Lens', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: textColor)),
                    GestureDetector(
                      onTap: () => viewModel.setTab(DashboardTab.profile),
                      child: const Text('Edit Parameters', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFFE50914))),
                    )
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Filtering matches against: ${allergies.length} Allergies, ${conditions.length} Conditions.',
                  style: TextStyle(fontSize: 13, color: subtitleColor),
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 8.0,
                  runSpacing: 8.0,
                  children: [
                    if (allergies.isEmpty && conditions.isEmpty)
                      Text(
                        'No health guidelines selected. Tap Edit Parameters to configure.',
                        style: TextStyle(fontSize: 12, color: subtitleColor, fontStyle: FontStyle.italic),
                      ),
                    ...allergies.map((allergy) => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFF2E090F),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFE50914), width: 1),
                          ),
                          child: Text(
                            allergy,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                          ),
                        )),
                    ...conditions.map((condition) => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: isDark ? const Color(0xFF475569) : const Color(0xFF93C5FD), width: 1),
                          ),
                          child: Text(
                            condition,
                            style: TextStyle(color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF1E40AF), fontWeight: FontWeight.bold, fontSize: 11),
                          ),
                        )),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        // 3. Quick Assistant Chatbot section
        Card(
          child: Padding(
            padding: const EdgeInsets.all(18.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('AI Consultation Assistant', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: textColor)),
                const SizedBox(height: 4),
                Text('Quick low-latency answers about specific chemical additives.', style: TextStyle(fontSize: 12, color: subtitleColor)),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _chatController,
                        style: TextStyle(color: textColor, fontSize: 13),
                        decoration: const InputDecoration(
                          hintText: 'e.g. Is Yellow 5 safe for ADHD?',
                          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    SizedBox(
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () {
                          viewModel.askQuickAssistant(_chatController.text);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE50914),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: viewModel.chatLoading
                            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                            : const Text('ASK'),
                      ),
                    ),
                  ],
                ),
                if (viewModel.chatResponse.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: surfaceBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: borderColor),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'TrustLenAI Guide:',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFFE50914), letterSpacing: 1),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          viewModel.chatResponse,
                          style: TextStyle(fontSize: 13, color: textColor, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ]
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        // 4. Grounding (Search & Maps) section
        Card(
          child: Padding(
            padding: const EdgeInsets.all(18.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Clinical Grounding Hub', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: textColor)),
                const SizedBox(height: 4),
                Text('Retrieve safety bulletins or find nearest certified medical centers.', style: TextStyle(fontSize: 12, color: subtitleColor)),
                const SizedBox(height: 14),
                TextField(
                  controller: _groundingController,
                  style: TextStyle(color: textColor, fontSize: 13),
                  decoration: const InputDecoration(
                    hintText: 'Compound name or zip code...',
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 46,
                        child: OutlinedButton.icon(
                          onPressed: () => viewModel.requestGrounding(_groundingController.text, false),
                          icon: const Icon(Icons.search_rounded, size: 18),
                          label: const Text('FDA Bulletins', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: borderColor),
                            foregroundColor: textColor,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: SizedBox(
                        height: 46,
                        child: OutlinedButton.icon(
                          onPressed: () => viewModel.requestGrounding(_groundingController.text, true),
                          icon: const Icon(Icons.location_on_rounded, size: 18),
                          label: const Text('Check Labs', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: borderColor),
                            foregroundColor: const Color(0xFFE50914),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                if (viewModel.groundingLoading) ...[
                  const SizedBox(height: 20),
                  const Center(child: CircularProgressIndicator(color: Color(0xFFE50914))),
                ] else if (viewModel.groundingResponse.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: surfaceBg,
                      border: Border.all(color: borderColor),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      viewModel.groundingResponse,
                      style: TextStyle(fontSize: 12, fontFamily: 'monospace', color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155), height: 1.4),
                    ),
                  ),
                ]
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ==========================================
// 2. SCAN TAB
// ==========================================
class ScanTab extends StatefulWidget {
  const ScanTab({super.key});

  @override
  State<ScanTab> createState() => _ScanTabState();
}

class _ScanTabState extends State<ScanTab> with TickerProviderStateMixin, WidgetsBindingObserver {
  CameraController? _cameraController;
  List<CameraDescription>? _cameras;
  bool _cameraInitialized = false;
  bool _cameraPermissionDenied = false;

  final TextEditingController _customIngredientsController = TextEditingController();

  late AnimationController _lineAnimationController;
  late Animation<double> _lineOffsetAnimation;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initCamera();

    // Setup scanning line animation
    _lineAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _lineOffsetAnimation = Tween<double>(begin: 0.1, end: 0.9).animate(
      CurvedAnimation(parent: _lineAnimationController, curve: Curves.easeInOut),
    );
  }

  Future<void> _initCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras != null && _cameras!.isNotEmpty) {
        _cameraController = CameraController(
          _cameras![0],
          ResolutionPreset.medium,
          enableAudio: false,
        );
        await _cameraController!.initialize();
        if (mounted) {
          setState(() {
            _cameraInitialized = true;
          });
        }
      } else {
        setState(() {
          _cameraPermissionDenied = true;
        });
      }
    } catch (e) {
      setState(() {
        _cameraPermissionDenied = true;
      });
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final controller = _cameraController;
    if (controller == null || !controller.value.isInitialized) return;
    if (state == AppLifecycleState.inactive || state == AppLifecycleState.paused) {
      // Release camera resources when app goes to background
      controller.dispose();
      if (mounted) {
        setState(() {
          _cameraInitialized = false;
          _cameraController = null;
        });
      }
    } else if (state == AppLifecycleState.resumed) {
      // Re-initialize camera when app comes back to foreground
      _initCamera();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _cameraController?.dispose();
    _lineAnimationController.dispose();
    _customIngredientsController.dispose();
    super.dispose();
  }

  Future<void> _importGallery(TrustLensViewModel viewModel) async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      final bytes = await image.readAsBytes();
      final base64String = base64Encode(bytes);
      viewModel.analyzeProduct(
        productName: '',
        ingredientsText: '',
        base64Image: base64String,
      );
    }
  }

  Future<void> _capturePhoto(TrustLensViewModel viewModel) async {
    if (_cameraController != null && _cameraController!.value.isInitialized) {
      try {
        final image = await _cameraController!.takePicture();
        final bytes = await image.readAsBytes();
        final base64String = base64Encode(bytes);
        viewModel.analyzeProduct(
          productName: '',
          ingredientsText: '',
          base64Image: base64String,
        );
      } catch (e) {
        // Fallback picker
        final picker = ImagePicker();
        final picked = await picker.pickImage(source: ImageSource.camera);
        if (picked != null) {
          final bytes = await picked.readAsBytes();
          viewModel.analyzeProduct(
            productName: '',
            ingredientsText: '',
            base64Image: base64Encode(bytes),
          );
        }
      }
    } else {
      final picker = ImagePicker();
      final picked = await picker.pickImage(source: ImageSource.camera);
      if (picked != null) {
        final bytes = await picked.readAsBytes();
        viewModel.analyzeProduct(
          productName: '',
          ingredientsText: '',
          base64Image: base64Encode(bytes),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<TrustLensViewModel>(context);

    if (viewModel.activeScanResult != null) {
      return ScanDetailsView(
        scan: viewModel.activeScanResult!,
        onDismiss: () => viewModel.clearResult(),
        viewModel: viewModel,
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          // 1. Status Pill
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF0D1520),
                  borderRadius: BorderRadius.circular(99),
                  border: Border.all(color: const Color(0xFF1E293B), width: 1.5),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    Text(
                      viewModel.isAnalyzing ? 'EXTRACTING DATA...' : 'SCANNER IDLE',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFE50914), letterSpacing: 1.5),
                    ),
                    if (viewModel.isAnalyzing) ...[
                      const SizedBox(width: 8),
                      const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(color: Color(0xFFE50914), strokeWidth: 2)),
                    ]
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          // 2. Viewfinder Container
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Container(
              width: double.infinity,
              height: MediaQuery.of(context).size.width - 32,
              color: Colors.black,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Camera preview
                  if (_cameraInitialized)
                    SizedBox.expand(child: CameraPreview(_cameraController!))
                  else
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          _cameraPermissionDenied ? Icons.no_photography : Icons.document_scanner,
                          size: 64,
                          color: Colors.white54,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _cameraPermissionDenied
                              ? 'Camera permission denied or unavailable'
                              : 'Viewfinder stream active or waiting...',
                          style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  // Brackets overlay
                  Container(
                    width: (MediaQuery.of(context).size.width - 32) * 0.85,
                    height: (MediaQuery.of(context).size.width - 32) * 0.85,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.white.withOpacity(0.2), width: 1.5),
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  // Corner Highlights
                  Positioned(
                    top: (MediaQuery.of(context).size.width - 32) * 0.075,
                    left: (MediaQuery.of(context).size.width - 32) * 0.075,
                    child: Container(
                      width: 24,
                      height: 24,
                      decoration: const BoxDecoration(
                        border: Border(
                          top: BorderSide(color: Color(0xFFE50914), width: 4),
                          left: BorderSide(color: Color(0xFFE50914), width: 4),
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    top: (MediaQuery.of(context).size.width - 32) * 0.075,
                    right: (MediaQuery.of(context).size.width - 32) * 0.075,
                    child: Container(
                      width: 24,
                      height: 24,
                      decoration: const BoxDecoration(
                        border: Border(
                          top: BorderSide(color: Color(0xFFE50914), width: 4),
                          right: BorderSide(color: Color(0xFFE50914), width: 4),
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: (MediaQuery.of(context).size.width - 32) * 0.075,
                    left: (MediaQuery.of(context).size.width - 32) * 0.075,
                    child: Container(
                      width: 24,
                      height: 24,
                      decoration: const BoxDecoration(
                        border: Border(
                          bottom: BorderSide(color: Color(0xFFE50914), width: 4),
                          left: BorderSide(color: Color(0xFFE50914), width: 4),
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: (MediaQuery.of(context).size.width - 32) * 0.075,
                    right: (MediaQuery.of(context).size.width - 32) * 0.075,
                    child: Container(
                      width: 24,
                      height: 24,
                      decoration: const BoxDecoration(
                        border: Border(
                          bottom: BorderSide(color: Color(0xFFE50914), width: 4),
                          right: BorderSide(color: Color(0xFFE50914), width: 4),
                        ),
                      ),
                    ),
                  ),
                  // Animated Scanning Line
                  AnimatedBuilder(
                    animation: _lineOffsetAnimation,
                    builder: (context, child) {
                      final boxHeight = MediaQuery.of(context).size.width - 32;
                      final startY = boxHeight * 0.075;
                      final travelRange = boxHeight * 0.85;
                      final currentY = startY + (travelRange * _lineOffsetAnimation.value);

                      return Positioned(
                        top: currentY,
                        left: boxHeight * 0.075,
                        right: boxHeight * 0.075,
                        child: Container(
                          height: 3,
                          decoration: const BoxDecoration(
                            color: Color(0xFFE50914),
                            boxShadow: [BoxShadow(color: Color(0xFFE50914), blurRadius: 6, spreadRadius: 1)],
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          // 3. CTA Buttons
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 52,
                  child: ElevatedButton.icon(
                    onPressed: () => _capturePhoto(viewModel),
                    icon: const Icon(Icons.photo_camera_rounded, color: Colors.white, size: 20),
                    label: const Text('CAPTURE LABEL', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 0.5)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE50914),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: 52,
                  child: OutlinedButton.icon(
                    onPressed: () => _importGallery(viewModel),
                    icon: const Icon(Icons.image_search_rounded, color: Colors.white, size: 20),
                    label: const Text('GALLERY IMPORT', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 0.5)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF1E293B)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // 4. Instructions
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: const [
                  Icon(Icons.info_outline_rounded, color: Color(0xFFE50914)),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Center the Nutrition Facts or Ingredients list inside the frame corners to trigger live OCR extraction.',
                      style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                    ),
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          // 5. Manual entry
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Type custom ingredients to audit manually:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white)),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _customIngredientsController,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: const InputDecoration(
                        hintText: 'peanuts, sodium hexametaphosphate, fd&c red 40',
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () {
                        viewModel.analyzeProduct(
                          productName: 'Custom Product Entry',
                          ingredientsText: _customIngredientsController.text,
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E293B),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('AUDIT'),
                    ),
                  ),
                ],
              ),
            ],
          )
        ],
      ),
    );
  }
}

// SCAN DETAILS SHEET
class ScanDetailsView extends StatelessWidget {
  final ScannedProductAnalysis scan;
  final VoidCallback onDismiss;
  final TrustLensViewModel viewModel;

  const ScanDetailsView({
    super.key,
    required this.scan,
    required this.onDismiss,
    required this.viewModel,
  });

  @override
  Widget build(BuildContext context) {
    final statusColor = scan.safetyStatus == 'SAFE'
        ? const Color(0xFF10B981) // Emerald Green
        : scan.safetyStatus == 'CAUTION'
            ? const Color(0xFFF59E0B) // Amber Orange
            : const Color(0xFFEF4444); // Red

    final statusBgColor = scan.safetyStatus == 'SAFE'
        ? const Color(0xFF064E3B)
        : scan.safetyStatus == 'CAUTION'
            ? const Color(0xFF78350F)
            : const Color(0xFF7F1D1D);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(icon: const Icon(Icons.arrow_back), onPressed: onDismiss),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: statusBgColor,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: statusColor, width: 1),
                ),
                child: Text(
                  scan.safetyStatus,
                  style: TextStyle(fontWeight: FontWeight.bold, color: statusColor, fontSize: 13, letterSpacing: 1),
                ),
              )
            ],
          ),
          const SizedBox(height: 16),
          // Circular Score representation
          Center(
            child: Container(
              width: 130,
              height: 130,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF0D1520),
                border: Border.all(color: statusColor, width: 6),
                boxShadow: [
                  BoxShadow(
                    color: statusColor.withOpacity(0.15),
                    blurRadius: 15,
                    spreadRadius: 1,
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    '${scan.safetyScore}',
                    style: TextStyle(fontSize: 42, fontWeight: FontWeight.w900, color: statusColor),
                  ),
                  const Text('Safety Score', style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold))
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          // Product Summary
          Text(scan.productName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
          const SizedBox(height: 4),
          Text(scan.productSubtitle, style: const TextStyle(fontSize: 13, fontStyle: FontStyle.italic, color: Color(0xFF94A3B8))),
          const SizedBox(height: 16),
          // Authenticity verification
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  scan.authenticityLabel.contains('COUNTER') ? Icons.error_outline : Icons.verified_user_rounded,
                  color: scan.authenticityLabel.contains('COUNTER') ? Colors.red : const Color(0xFF10B981),
                  size: 18,
                ),
                const SizedBox(width: 8),
                Text(
                  '${scan.authenticityLabel} (${scan.authenticityPercentage.toStringAsFixed(1)}%)',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                    color: scan.authenticityLabel.contains('COUNTER') ? Colors.red : const Color(0xFF10B981),
                  ),
                )
              ],
            ),
          ),
          if (scan.allergenAlertMessage.isNotEmpty) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF450A0A),
                border: Border.all(color: const Color(0xFFEF4444), width: 1.5),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFEF4444).withOpacity(0.1),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: Color(0xFFFCA5A5), size: 24),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      scan.allergenAlertMessage,
                      style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 13, fontWeight: FontWeight.w800, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 24),
          // Avoid Ingredients
          if (scan.avoidIngredients.isNotEmpty) ...[
            const Text('AVOID INGREDIENTS', style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFFEF4444), fontSize: 12, letterSpacing: 1.5)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: scan.avoidIngredients.map((e) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF2E090F),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFEF4444), width: 1),
                ),
                child: Text(e, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              )).toList(),
            ),
            const SizedBox(height: 20),
          ],
          // Caution Ingredients
          if (scan.cautionIngredients.isNotEmpty) ...[
            const Text('CAUTION INGREDIENTS', style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFFF59E0B), fontSize: 12, letterSpacing: 1.5)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: scan.cautionIngredients.map((e) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF78350F).withOpacity(0.3),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFF59E0B), width: 1),
                ),
                child: Text(e, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              )).toList(),
            ),
            const SizedBox(height: 20),
          ],
          // Safe Ingredients
          if (scan.safeIngredients.isNotEmpty) ...[
            const Text('COMPATIBLE INGREDIENTS', style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF10B981), fontSize: 12, letterSpacing: 1.5)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: scan.safeIngredients.map((e) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF064E3B).withOpacity(0.3),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Color(0xFF10B981), width: 1),
                ),
                child: Text(e, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              )).toList(),
            ),
            const SizedBox(height: 20),
          ],
          const Text('ANALYSIS SUMMARY REPORT', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1.5, color: Color(0xFFE50914))),
          const SizedBox(height: 10),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF0D1520),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: MarkdownBody(
              data: scan.summaryReport,
              styleSheet: MarkdownStyleSheet(
                p: const TextStyle(color: Color(0xFFCBD5E1), height: 1.6, fontSize: 13),
                h1: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18, height: 2.0),
                h2: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16, height: 1.8),
                h3: const TextStyle(color: Color(0xFFF8FAFC), fontWeight: FontWeight.bold, fontSize: 14, height: 1.8),
                strong: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                em: const TextStyle(color: Color(0xFF94A3B8), fontStyle: FontStyle.italic),
                listBullet: const TextStyle(color: Color(0xFFE50914)),
                tableHead: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                tableBody: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12),
                tableBorder: TableBorder.all(color: const Color(0xFF1E293B), width: 1),
                blockquote: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontStyle: FontStyle.italic),
                code: const TextStyle(color: Color(0xFFE50914), backgroundColor: Color(0xFF1E293B), fontSize: 12),
                horizontalRuleDecoration: BoxDecoration(
                  border: Border(top: BorderSide(color: const Color(0xFF1E293B), width: 1)),
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
          // Trigger Voice Agent Overlay
          Container(
            width: double.infinity,
            height: 54,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFE50914).withOpacity(0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ElevatedButton.icon(
              onPressed: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (context) => VoiceAgentOverlay(scanResult: scan),
                );
              },
              icon: const Icon(Icons.record_voice_over_rounded, color: Colors.white),
              label: const Text('Consult Live Voice Agent', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.5)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE50914),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

// ==========================================
// 3. HISTORY TAB
// ==========================================
class HistoryTab extends StatelessWidget {
  const HistoryTab({super.key});

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<TrustLensViewModel>(context);
    final scans = viewModel.allScans;

    return Scaffold(
      floatingActionButton: scans.isNotEmpty
          ? FloatingActionButton.extended(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    backgroundColor: const Color(0xFF0D1520),
                    title: const Text('Clear All Logs?', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    content: const Text('Are you sure you want to permanently delete all medical audits from this terminal?', style: TextStyle(color: Color(0xFF94A3B8))),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel', style: TextStyle(color: Color(0xFF94A3B8)))),
                      TextButton(
                        onPressed: () {
                          viewModel.clearAllScans();
                          Navigator.pop(context);
                        },
                        child: const Text('Clear All', style: TextStyle(color: Color(0xFFE50914), fontWeight: FontWeight.bold)),
                      )
                    ],
                  ),
                );
              },
              backgroundColor: const Color(0xFFE50914),
              foregroundColor: Colors.white,
              icon: const Icon(Icons.delete_forever_rounded),
              label: const Text('Wipe Logs', style: TextStyle(fontWeight: FontWeight.bold)),
            )
          : null,
      body: scans.isEmpty
          ? const Center(
              child: Text(
                'No logs saved on secure local container.',
                style: TextStyle(color: Color(0xFF475569), fontWeight: FontWeight.bold),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16.0),
              itemCount: scans.length,
              itemBuilder: (context, index) {
                final scan = scans[index];
                final score = scan['safetyScore'] ?? 100;
                final status = scan['safetyStatus'] ?? 'SAFE';
                final statusColor = status == 'SAFE'
                    ? const Color(0xFF10B981)
                    : status == 'CAUTION'
                        ? const Color(0xFFF59E0B)
                        : const Color(0xFFEF4444);

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    leading: Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        shape: BoxShape.circle,
                        border: Border.all(color: statusColor, width: 2),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '$score',
                        style: TextStyle(fontWeight: FontWeight.w900, color: statusColor, fontSize: 16),
                      ),
                    ),
                    title: Text(scan['productName'] ?? 'Scanned Label', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                    subtitle: Text(
                      'Action: $status\nAudit: ${DateTime.fromMillisecondsSinceEpoch(scan['timestamp'] ?? 0).toLocal()}',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8), height: 1.4),
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444)),
                      onPressed: () => viewModel.deleteScan(scan['id']),
                    ),
                    onTap: () {
                      // Parse SQL scan row back to structured entity and active it
                      final structured = ScannedProductAnalysis(
                        productName: scan['productName'] ?? 'Scanned Label',
                        productSubtitle: scan['productSubtitle'] ?? '',
                        safetyScore: scan['safetyScore'] ?? 100,
                        safetyStatus: scan['safetyStatus'] ?? 'SAFE',
                        authenticityLabel: scan['authenticityLabel'] ?? '',
                        authenticityPercentage: (scan['authenticityPercentage'] as num?)?.toDouble() ?? 98.4,
                        allergenAlertMessage: scan['allergenAlertMessage'] ?? '',
                        avoidIngredients: (scan['avoidIngredients'] ?? '').toString().split(',').where((e) => e.isNotEmpty).toList(),
                        cautionIngredients: (scan['cautionIngredients'] ?? '').toString().split(',').where((e) => e.isNotEmpty).toList(),
                        safeIngredients: (scan['safeIngredients'] ?? '').toString().split(',').where((e) => e.isNotEmpty).toList(),
                        summaryReport: scan['fullMarkdownReport'] ?? '',
                      );
                      viewModel.setTab(DashboardTab.scan);
                      viewModel.analyzeProduct(productName: structured.productName, ingredientsText: scan['avoidIngredients'] + ',' + scan['cautionIngredients']);
                    },
                  ),
                );
              },
            ),
    );
  }
}

// ==========================================
// 4. PROFILE TAB
// ==========================================
class ProfileTab extends StatefulWidget {
  const ProfileTab({super.key});

  @override
  State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> {
  final TextEditingController _allergiesController = TextEditingController();
  final TextEditingController _conditionsController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final viewModel = Provider.of<TrustLensViewModel>(context, listen: false);
    _allergiesController.text = viewModel.userProfile?['allergies'] ?? '';
    _conditionsController.text = viewModel.userProfile?['conditions'] ?? '';
  }

  @override
  void dispose() {
    _allergiesController.dispose();
    _conditionsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<TrustLensViewModel>(context);
    final user = viewModel.userProfile ?? {};

    return Stack(
      children: [
        ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            // Security details panel
            Card(
              color: Colors.transparent,
              child: Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0F172A), Color(0xFF1E1B4B)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE50914).withOpacity(0.3), width: 1.5),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('SECURE SYSTEM ACCESS KEY', style: TextStyle(fontSize: 10, color: Color(0xFFFCA5A5), fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                      const SizedBox(height: 8),
                      Text(user['name'] ?? 'Clinical Partner', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                      Text(user['email'] ?? 'offline@systems.com', style: const TextStyle(fontSize: 14, color: Color(0xFF94A3B8))),
                      const Divider(color: Color(0xFF1E293B), height: 28),
                      Row(
                        children: [
                          const Icon(Icons.admin_panel_settings_rounded, color: Color(0xFFE50914)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              user['securityTier'] ?? 'Tier 3: Clinical Administrator',
                              style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      )
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Profile Edits
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Edit Parameter Overrides', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                    const SizedBox(height: 16),
                    const Text('Allergies (comma-separated)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFFCBD5E1))),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _allergiesController,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
                    ),
                    const SizedBox(height: 16),
                    const Text('Conditions (comma-separated)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFFCBD5E1))),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _conditionsController,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: () async {
                          await viewModel.updateProfileDirect(
                            allergies: _allergiesController.text,
                            conditions: _conditionsController.text,
                          );
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              backgroundColor: Color(0xFF0D1520),
                              content: Text('Health parameters fully updated locally.', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE50914),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Update Parameters', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Local-First Sync card (non-blocking)
            Card(
              child: ListTile(
                leading: const Icon(Icons.cloud_sync_rounded, color: Color(0xFFE50914)),
                title: const Text('Cloud Profile Sync (Optional)', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                subtitle: Text(viewModel.firestoreSyncError ?? 'Backup local profile to Firestore cloud network.', style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
                trailing: viewModel.isSyncingWithFirestore
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Color(0xFFE50914), strokeWidth: 2))
                    : const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
                onTap: () => viewModel.fetchAndSyncFirestoreProfile(),
              ),
            ),
            const SizedBox(height: 24),
            // Sign Out / Delete Actions
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 48,
                    child: OutlinedButton(
                      onPressed: () => viewModel.signOut(),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF1E293B)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Sign Out', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SizedBox(
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (context) => AlertDialog(
                            backgroundColor: const Color(0xFF0D1520),
                            title: const Text('Delete Account?', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            content: const Text('This will permanently delete all cloud document indexes and local databases. This action is irreversible.', style: TextStyle(color: Color(0xFF94A3B8))),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel', style: TextStyle(color: Color(0xFF94A3B8)))),
                              TextButton(
                                onPressed: () {
                                  Navigator.pop(context);
                                  viewModel.requestAccountDeletion();
                                },
                                child: const Text('Permanently Delete', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold)),
                              )
                            ],
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF7F1D1D),
                        foregroundColor: const Color(0xFFFCA5A5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      child: const Text('Delete Account', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 48),
          ],
        ),
        if (viewModel.isDeletingAccount)
          Container(
            color: Colors.black.withOpacity(0.75),
            child: const Center(
              child: CircularProgressIndicator(color: Color(0xFFE50914)),
            ),
          ),
        if (viewModel.deletionMessage != null)
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
                  ),
                ],
              ),
              child: Text(
                viewModel.deletionMessage!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
          )
      ],
    );
  }
}
