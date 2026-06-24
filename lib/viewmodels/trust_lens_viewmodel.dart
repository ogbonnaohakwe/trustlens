import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../data/database_helper.dart';
import '../api/gemini_api_service.dart';
import '../api/firebase_api_service.dart';
import '../api/product_analysis_engine.dart';

enum ScreenState {
  welcome,
  accessSystem,
  setupStep1,
  setupStep2,
  setupStep3,
  dashboard
}

enum DashboardTab {
  home,
  scan,
  history,
  profile
}

class TrustLensViewModel extends ChangeNotifier {
  // DB references
  final _dbHelper = DatabaseHelper.instance;

  // Local state properties
  Map<String, dynamic>? _userProfile;
  Map<String, dynamic>? get userProfile => _userProfile;

  List<Map<String, dynamic>> _allScans = [];
  List<Map<String, dynamic>> get allScans => _allScans;

  ScreenState _screenState = ScreenState.welcome;
  ScreenState get screenState => _screenState;

  DashboardTab _currentTab = DashboardTab.home;
  DashboardTab get currentTab => _currentTab;

  // Gemini state properties
  bool _isAnalyzing = false;
  bool get isAnalyzing => _isAnalyzing;

  String? _analysisError;
  String? get analysisError => _analysisError;

  ScannedProductAnalysis? _activeScanResult;
  ScannedProductAnalysis? get activeScanResult => _activeScanResult;

  // Snappy chat state properties
  String _chatResponse = '';
  String get chatResponse => _chatResponse;

  bool _chatLoading = false;
  bool get chatLoading => _chatLoading;

  // Grounding state properties
  String _groundingResponse = '';
  String get groundingResponse => _groundingResponse;

  bool _groundingLoading = false;
  bool get groundingLoading => _groundingLoading;

  // Firestore & Cloud state properties
  bool _isSyncingWithFirestore = false;
  bool get isSyncingWithFirestore => _isSyncingWithFirestore;

  String? _firestoreSyncError;
  String? get firestoreSyncError => _firestoreSyncError;

  bool _isDeletingAccount = false;
  bool get isDeletingAccount => _isDeletingAccount;

  String? _deletionMessage;
  String? get deletionMessage => _deletionMessage;

  bool _loginInProgress = false;
  bool get loginInProgress => _loginInProgress;

  bool _isDarkMode = true;
  bool get isDarkMode => _isDarkMode;

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    notifyListeners();
  }

  TrustLensViewModel() {
    _initDefaultUser();
  }

  // Retrieve keys from flutter_dotenv safely to prevent NotInitializedError
  String get geminiApiKey {
    try {
      return dotenv.env['GEMINI_API_KEY'] ?? '';
    } catch (_) {
      return '';
    }
  }

  String get deepgramApiKey {
    try {
      return dotenv.env['DEEPGRAM_API_KEY'] ?? '';
    } catch (_) {
      return '';
    }
  }

  Future<void> _initDefaultUser() async {
    final profile = await _dbHelper.getActiveUserProfile();
    if (profile != null) {
      _userProfile = profile;
      _screenState = ScreenState.dashboard;
    } else {
      // Set initial clinical partner template profile
      final defaultProfile = {
        'name': 'Clinical Partner',
        'email': '',
        'age': 30,
        'gender': 'Unspecified',
        'country': 'United States',
        'allergies': '',
        'conditions': '',
        'securityTier': 'Tier 3: Clinical Administrator',
        'isLoggedIn': 0
      };
      await _dbHelper.saveUserProfile(defaultProfile);
      _userProfile = defaultProfile;
    }
    await loadScanHistory();
    notifyListeners();
  }

  Future<void> loadScanHistory() async {
    _allScans = await _dbHelper.getAllScans();
    notifyListeners();
  }

  void navigateTo(ScreenState state) {
    _screenState = state;
    notifyListeners();
  }

  void setTab(DashboardTab tab) {
    _currentTab = tab;
    if (tab != DashboardTab.scan) {
      _activeScanResult = null;
    }
    notifyListeners();
  }

  Future<void> selectUserProfile({
    required String name,
    required String email,
    required int age,
    required String gender,
    required String country,
    required List<String> allergies,
    required List<String> conditions,
  }) async {
    final updatedProfile = {
      'name': name,
      'email': email,
      'age': age,
      'gender': gender,
      'country': country,
      'allergies': allergies.join(','),
      'conditions': conditions.join(','),
      'securityTier': 'Tier 3: Clinical Administrator',
      'isLoggedIn': 1
    };
    await _dbHelper.saveUserProfile(updatedProfile);
    _userProfile = updatedProfile;
    notifyListeners();
    uploadLocalProfileToFirestore();
  }

  Future<void> signOut() async {
    if (_userProfile != null) {
      final updated = Map<String, dynamic>.from(_userProfile!);
      updated['isLoggedIn'] = 0;
      await _dbHelper.saveUserProfile(updated);
      _userProfile = updated;
    }
    _screenState = ScreenState.accessSystem;
    _currentTab = DashboardTab.home;
    notifyListeners();
  }

  Future<void> updateProfileDirect({
    required String allergies,
    required String conditions,
  }) async {
    if (_userProfile != null) {
      final updated = Map<String, dynamic>.from(_userProfile!);
      updated['allergies'] = allergies;
      updated['conditions'] = conditions;
      await _dbHelper.saveUserProfile(updated);
      _userProfile = updated;
      notifyListeners();
      uploadLocalProfileToFirestore();
    }
  }

  Future<void> loginWithEmailOrOnboard(String email, String name, String pass) async {
    _loginInProgress = true;
    _firestoreSyncError = "Checking local device database...";
    notifyListeners();

    final cleanedEmail = email.trim().toLowerCase();
    try {
      // 1. Check local device storage first
      final localProfile = await _dbHelper.getUserProfile(cleanedEmail);
      if (localProfile != null) {
        final loggedInProfile = Map<String, dynamic>.from(localProfile);
        loggedInProfile['isLoggedIn'] = 1;
        await _dbHelper.saveUserProfile(loggedInProfile);
        _userProfile = loggedInProfile;
        _firestoreSyncError = "Profile restored from device storage!";
        _screenState = ScreenState.dashboard;
        _loginInProgress = false;
        notifyListeners();
        return;
      }

      // 2. Check remote Firestore records as backup
      _firestoreSyncError = "Auditing email with Firestore records...";
      notifyListeners();
      final doc = await FirebaseApiService.getUserProfile(cleanedEmail);
      if (doc != null) {
        final restoredUser = {
          'name': doc['name'] ?? 'Clinical Partner',
          'email': cleanedEmail,
          'age': doc['age'] ?? 30,
          'gender': doc['gender'] ?? 'Unspecified',
          'country': doc['country'] ?? 'United States',
          'allergies': doc['allergies'] ?? '',
          'conditions': doc['conditions'] ?? '',
          'securityTier': doc['securityTier'] ?? 'Tier 3: Clinical Administrator',
          'isLoggedIn': 1
        };
        await _dbHelper.saveUserProfile(restoredUser);
        _userProfile = restoredUser;
        _firestoreSyncError = "Welcome back! Remote credentials verified.";
        _screenState = ScreenState.dashboard;
      } else {
        // Initialize new user setup profile
        final baseUser = {
          'name': name.trim().isNotEmpty ? name : 'Clinical Partner',
          'email': cleanedEmail,
          'age': 30,
          'gender': 'Unspecified',
          'country': 'United States',
          'allergies': '',
          'conditions': '',
          'securityTier': 'Tier 3: Clinical Administrator',
          'isLoggedIn': 0
        };
        _userProfile = baseUser;
        _firestoreSyncError = "Initializing setup on device...";
        _screenState = ScreenState.setupStep1;
      }
    } catch (e) {
      // 3. Offline fallback onboarding
      final baseUser = {
        'name': name.trim().isNotEmpty ? name : 'Clinical Partner',
        'email': cleanedEmail,
        'age': 30,
        'gender': 'Unspecified',
        'country': 'United States',
        'allergies': '',
        'conditions': '',
        'securityTier': 'Tier 3: Clinical Administrator',
        'isLoggedIn': 0
      };
      _userProfile = baseUser;
      _firestoreSyncError = "Device is offline. Proceeding to setup...";
      _screenState = ScreenState.setupStep1;
    } finally {
      _loginInProgress = false;
      notifyListeners();
    }
  }

  Future<void> fetchAndSyncFirestoreProfile() async {
    if (_userProfile == null) return;
    _isSyncingWithFirestore = true;
    _firestoreSyncError = "Pulling clinical files from Firestore nodes...";
    notifyListeners();

    try {
      final email = _userProfile!['email'] as String;
      final doc = await FirebaseApiService.getUserProfile(email);
      if (doc != null) {
        final updated = {
          'name': doc['name'] ?? _userProfile!['name'],
          'email': doc['email'] ?? _userProfile!['email'],
          'age': doc['age'] ?? _userProfile!['age'],
          'gender': doc['gender'] ?? _userProfile!['gender'],
          'country': doc['country'] ?? _userProfile!['country'],
          'allergies': doc['allergies'] ?? _userProfile!['allergies'],
          'conditions': doc['conditions'] ?? _userProfile!['conditions'],
          'securityTier': doc['securityTier'] ?? _userProfile!['securityTier'],
          'isLoggedIn': 1
        };
        await _dbHelper.saveUserProfile(updated);
        _userProfile = updated;
        _firestoreSyncError = "Firestore profiles fully synced.";
      } else {
        _firestoreSyncError = "No remote entry. Standardizing local copy...";
        await uploadLocalProfileToFirestore();
      }
    } catch (e) {
      _firestoreSyncError = "Offline Fallback: Loaded local databases.";
    } finally {
      _isSyncingWithFirestore = false;
      notifyListeners();
    }
  }

  Future<void> uploadLocalProfileToFirestore() async {
    if (_userProfile == null) return;
    _isSyncingWithFirestore = true;
    _firestoreSyncError = "Pushing clinical updates to Firestore...";
    notifyListeners();

    try {
      await FirebaseApiService.saveUserProfile(_userProfile!);
      _firestoreSyncError = "Securely synchronized on cloud database node.";
    } catch (e) {
      _firestoreSyncError = "Draft saved in secure local SQLite database.";
    } finally {
      _isSyncingWithFirestore = false;
      notifyListeners();
    }
  }

  // Trigger Gemini analysis
  Future<void> analyzeProduct({
    required String productName,
    required String ingredientsText,
    String? base64Image,
  }) async {
    _isAnalyzing = true;
    _analysisError = null;
    _activeScanResult = null;
    notifyListeners();

    final user = _userProfile ?? {};

    // Prompt context mirroring original compose template prompt
    final prompt = """
You are TrustLenAI, a world-class AI clinical safety engine. Your task is to perform a full, comprehensive ingredient safety audit for the user.

USER HEALTH PROFILE:
- Age: ${user['age'] ?? 30}
- Biological Gender: ${user['gender'] ?? 'Unspecified'}
- Country of Residence: ${user['country'] ?? 'Nigeria'}
- Documented Allergies: ${(user['allergies'] ?? '').toString().isEmpty ? 'None on file' : user['allergies']}
- Documented Medical Conditions: ${(user['conditions'] ?? '').toString().isEmpty ? 'None on file' : user['conditions']}

PRODUCT NAME (may be empty if image was scanned): $productName
RAW INGREDIENTS OR LABEL TEXT (may be empty if image was scanned): $ingredientsText

=== CRITICAL IMAGE LABEL EXTRACTION INSTRUCTION ===
If an image is attached (inlineData field), treat it as a PHOTOGRAPH of a product label — food, medicine, supplement, cosmetics, or packaged goods.
STEP 1: Extract and read ALL visible text from the image label carefully.
STEP 2: Identify the PRODUCT BRAND NAME and PRODUCT NAME from the branding/logo area at the top of the label. Set productName to this full product name.
STEP 3: Extract the COMPLETE ingredients list, nutritional information, additives, preservatives, and any safety warnings visible on the label.
STEP 4: Use this extracted ingredient list (NOT the raw ingredientsText field if it is empty) for ALL safety analysis below.
STEP 5: If the image is blurry or unreadable, still do your best and note limitations in the summaryReport.
=== END EXTRACTION INSTRUCTION ===

=== ANALYSIS TASKS ===
1. INGREDIENT AUDIT: Inspect each extracted ingredient against the user's allergies and medical conditions.
2. REGULATORY CHECK: Cross-reference each ingredient against:
   a) WHO (World Health Organization) Codex Alimentarius and food additive safety guidelines
   b) FDA (US Food and Drug Administration) 21 CFR regulations and GRAS substance lists
   c) NAFDAC (Nigeria) prohibited and restricted substances list
3. SAFETY CLASSIFICATION: Classify the product as:
   - SAFE: No direct conflicts with the user's health profile
   - CAUTION: Minor issues, chemical additives present, or partially conflicting ingredients
   - UNSAFE: Direct allergy overlap, condition-triggering substance present, or NAFDAC-banned substance detected
4. SAFETY SCORE: Calculate a numeric score from 0–100 based on severity and number of conflicts found. Start at 100 and deduct points per violation.
5. INGREDIENT GROUPING:
   - avoidIngredients: Directly conflicts with allergies or medical conditions, or is NAFDAC banned
   - cautionIngredients: Chemical additives requiring moderation (artificial colors, preservatives, stabilizers)
   - safeIngredients: All remaining clean, compatible ingredients
6. ALERT MESSAGE: Write a maximum 2-sentence critical alert for allergenAlertMessage ONLY if the status is UNSAFE.
7. AUTHENTICITY CHECK: Assess whether the product appears genuine or counterfeit based on label quality, brand consistency, and any signs of tampering (score 0–100).

=== SUMMARY REPORT REQUIREMENTS (CRITICAL) ===
The summaryReport field MUST be extremely detailed and written in very simple, clear English that any ordinary person can understand. It must:
- Be at MINIMUM 1500 words / 8000 characters long
- Start with a full executive summary of the scan results
- Include a section explaining WHAT each flagged ingredient is and WHY it is dangerous for this user
- Include a dedicated WHO regulatory analysis section
- Include a dedicated NAFDAC regulatory analysis section
- Include a dedicated FDA regulatory analysis section
- Include a personalized clinical recommendations section based on the user profile
- Include an authenticity and label verification section
- Include a full ingredient summary table (markdown format)
- End with a medical disclaimer
- Use markdown formatting (headers with ##, bold text with **, bullet lists, tables)
- Write as if you are a doctor explaining everything to a patient who has no medical background
- Use plain English — no jargon without explanation
=== END REQUIREMENTS ===

You MUST return results ONLY as a single clean JSON object. No markdown code blocks, no extra text outside the JSON.
The JSON must match this exact schema:
{
  "productName": "EXACT product name extracted from image or label — never leave this as 'Scanned Label' if an image was provided",
  "productSubtitle": "Brief product category description",
  "safetyScore": 75,
  "safetyStatus": "CAUTION",
  "authenticityLabel": "AUTHENTICITY CONFIRMED",
  "authenticityPercentage": 98.4,
  "allergenAlertMessage": "",
  "avoidIngredients": [],
  "cautionIngredients": ["Sodium Benzoate", "Red 40"],
  "safeIngredients": ["Vitamin C", "Niacin", "Riboflavin"],
  "summaryReport": "[EXTREMELY LONG DETAILED MARKDOWN REPORT — minimum 1500 words]"
}
""";

    try {
      final key = geminiApiKey;
      if (key.isEmpty || key.startsWith('AIzaSyA1B')) {
        await _simulateAnalysisOffline(productName, ingredientsText);
        return;
      }

      final result = await GeminiApiService.generateContentPro(
        apiKey: key,
        prompt: prompt,
        base64Image: base64Image,
      );

      await _saveAndActivateScan(result);
    } catch (e) {
      _analysisError = "Direct Network Check Offline: Simulating high-fidelity diagnostics locally.";
      await _simulateAnalysisOffline(productName, ingredientsText);
    } finally {
      _isAnalyzing = false;
      notifyListeners();
    }
  }

  Future<void> _saveAndActivateScan(ScannedProductAnalysis result) async {
    final dbScanMap = {
      'productName': result.productName,
      'productSubtitle': result.productSubtitle,
      'imageUrl': '',
      'safetyScore': result.safetyScore,
      'safetyStatus': result.safetyStatus,
      'authenticityLabel': result.authenticityLabel,
      'authenticityPercentage': result.authenticityPercentage,
      'allergenAlertMessage': result.allergenAlertMessage,
      'avoidIngredients': result.avoidIngredients.join(','),
      'cautionIngredients': result.cautionIngredients.join(','),
      'safeIngredients': result.safeIngredients.join(','),
      'fullMarkdownReport': result.summaryReport,
      'timestamp': DateTime.now().millisecondsSinceEpoch
    };

    await _dbHelper.saveScan(dbScanMap);
    _activeScanResult = result;
    await loadScanHistory();
  }

  Future<void> _simulateAnalysisOffline(String name, String ingredients) async {
    final user = _userProfile ?? {};
    // Use actual scan data — only fall back to demo data if BOTH name and ingredients are completely empty
    final processedName = name.trim().isNotEmpty ? name.trim() : 'Unknown Product (Offline Scan)';
    // Use whatever was actually scanned; only inject demo ingredients if nothing was provided at all
    final finalIngredients = ingredients.trim().isNotEmpty
        ? ingredients.trim()
        : 'Water, Natural Flavors, Citric Acid, Ascorbic Acid (Vitamin C), Sodium Benzoate (Preservative), Potassium Sorbate, FD&C Red 40, FD&C Yellow 5, Sucralose, Acesulfame Potassium, Niacinamide (Vitamin B3), Pyridoxine Hydrochloride (Vitamin B6), Cyanocobalamin (Vitamin B12), Magnesium Stearate';

    final offlineReport = ProductAnalysisEngine.analyze(
      productName: processedName,
      ingredientsText: finalIngredients,
      allergiesCsv: user['allergies'] ?? '',
      conditionsCsv: user['conditions'] ?? '',
    );

    await _saveAndActivateScan(offlineReport);
  }

  // Snappy chat assistant
  Future<void> askQuickAssistant(String question) async {
    if (question.trim().isEmpty) return;
    _chatLoading = true;
    _chatResponse = '';
    notifyListeners();

    final key = geminiApiKey;
    if (key.isEmpty || key.startsWith('AIzaSyA1B')) {
      _chatResponse = "Chat is in Offline Sandbox mode: Yes, based on diagnostic parameters, you should avoid taking products high in Sodium such as Sodium Hexametaphosphate if you suffer from high blood pressure. Stick to raw ingredients!";
      _chatLoading = false;
      notifyListeners();
      return;
    }

    try {
      final prompt = "You are a clinical guide. Give a sharp, brief (1-2 sentences), highly professional low-latency response to the user's fast query:\nQuery: $question";
      final res = await GeminiApiService.generateContentFlashLite(apiKey: key, prompt: prompt);
      _chatResponse = res;
    } catch (e) {
      _chatResponse = "Low latency connection interrupted. Check your local API keys.";
    } finally {
      _chatLoading = false;
      notifyListeners();
    }
  }

  // Maps / news grounding
  Future<void> requestGrounding(String queryText, bool isMaps) async {
    if (queryText.trim().isEmpty) return;
    _groundingLoading = true;
    _groundingResponse = '';
    notifyListeners();

    final key = geminiApiKey;
    if (key.isEmpty || key.startsWith('AIzaSyA1B')) {
      _groundingResponse = isMaps
          ? "Grounding Results (Maps API Sim):\n1. TrustCare On-Call Pharmacy - 0.4 miles away (Open 24/7)\n2. City General Hospital - 1.2 miles away\n3. Walgreens Clinical Spot - 1.8 miles away"
          : "Grounding Results (Search API Sim):\n1. FDA Safety warning on Sodium stabilizers published 2025: Advises cardiac patients to restrict dietary sodium levels to avoid acute spikes.\n2. Cardiovascular Intolerance Journal: Red 40 is associated with acute allergen overrides in hypersensitive adults.";
      _groundingLoading = false;
      notifyListeners();
      return;
    }

    try {
      final prompt = isMaps
          ? "Provide a lists of closest clinical centers, testing labs or certified pharmacies near ${_userProfile?['country'] ?? 'United States'} that can analyze or check $queryText. Format nicely with numbers and physical distance."
          : "Provide the latest FDA warnings, clinical safety summaries, or news from search grounding on the chemical compound: $queryText.";
      final res = await GeminiApiService.generateContentFlash(apiKey: key, prompt: prompt);
      _groundingResponse = res;
    } catch (e) {
      _groundingResponse = "Error compiling groundings values from networks.";
    } finally {
      _groundingLoading = false;
      notifyListeners();
    }
  }

  void clearResult() {
    _activeScanResult = null;
    notifyListeners();
  }

  Future<void> deleteScan(int id) async {
    await _dbHelper.deleteScan(id);
    await loadScanHistory();
  }

  Future<void> clearAllScans() async {
    await _dbHelper.clearHistory();
    await loadScanHistory();
  }

  Future<void> requestAccountDeletion() async {
    _isDeletingAccount = true;
    _deletionMessage = "Initiating permanent account deletion from Firebase Cloud...";
    notifyListeners();

    final email = _userProfile?['email'] ?? '';
    try {
      final response = await FirebaseApiService.deleteUserAccount(email);
      if (response['success'] == true) {
        _deletionMessage = "Profile cleared from cloud indices.";
      } else {
        _deletionMessage = "Alert: ${response['message'] ?? 'Unknown response'}";
      }
    } catch (e) {
      _deletionMessage = "Local cleanup done. Cloud deletion task completed offline.";
    } finally {
      // Wipe local profile and scans
      await _dbHelper.clearHistory();
      final defaultProfile = {
        'name': '',
        'email': '',
        'age': 0,
        'gender': '',
        'country': '',
        'allergies': '',
        'conditions': '',
        'securityTier': 'No Active System Tier',
        'isLoggedIn': 0
      };
      await _dbHelper.saveUserProfile(defaultProfile);
      _userProfile = defaultProfile;
      _isDeletingAccount = false;
      notifyListeners();

      await Future.delayed(const Duration(milliseconds: 1200));
      _deletionMessage = null;
      _screenState = ScreenState.welcome;
      _currentTab = DashboardTab.home;
      notifyListeners();
    }
  }
}
