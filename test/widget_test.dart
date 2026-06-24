import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:trustlens_ai/main.dart';
import 'package:trustlens_ai/viewmodels/trust_lens_viewmodel.dart';
import 'package:trustlens_ai/data/database_helper.dart';

class MockDatabaseHelper extends DatabaseHelper {
  MockDatabaseHelper() : super.internal();

  @override
  Future<Map<String, dynamic>?> getActiveUserProfile() async {
    return null;
  }

  @override
  Future<Map<String, dynamic>?> getUserProfile(String email) async {
    return {
      'name': 'Clinical Partner',
      'email': email,
      'age': 30,
      'gender': 'Unspecified',
      'country': 'United States',
      'allergies': '',
      'conditions': '',
      'securityTier': 'Tier 3: Clinical Administrator',
      'isLoggedIn': 0
    };
  }

  @override
  Future<int> saveUserProfile(Map<String, dynamic> profile) async {
    return 1;
  }

  @override
  Future<List<Map<String, dynamic>>> getAllScans() async {
    return [];
  }

  @override
  Future<int> saveScan(Map<String, dynamic> scan) async {
    return 1;
  }

  @override
  Future<int> deleteScan(int id) async {
    return 1;
  }

  @override
  Future<int> clearHistory() async {
    return 1;
  }

  @override
  Future close() async {}
}

void main() {
  setUpAll(() {
    DatabaseHelper.instance = MockDatabaseHelper();
  });

  testWidgets('TrustLens App onboarding smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => TrustLensViewModel(),
        child: const TrustLensApp(),
      ),
    );

    // Re-pump to let Future.microtask and initialization execute
    await tester.pumpAndSettle();

    // Verify that the onboarding welcome screen elements exist
    expect(find.text('TrustLenAI'), findsWidgets);
    expect(find.text('GET STARTED'), findsOneWidget);
  });
}
