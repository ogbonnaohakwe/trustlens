import 'dart:convert';
import 'package:http/http.dart' as http;

class FirebaseApiService {
  static const String firestoreBaseUrl = 'https://firestore.googleapis.com';
  static const String functionsBaseUrl = 'https://us-central1-trustlens-ai.cloudfunctions.net';
  static const String projectId = 'trustlens-ai';

  // Helper to format email for firestore document IDs
  static String getDocumentId(String email) {
    return email.trim().replaceAll('@', '_at_').replaceAll('.', '_dot_');
  }

  // GET user profile from Firestore
  static Future<Map<String, dynamic>?> getUserProfile(String email) async {
    final docId = getDocumentId(email);
    final url = Uri.parse('$firestoreBaseUrl/v1/projects/$projectId/databases/(default)/documents/users/$docId');

    final response = await http.get(url);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final fields = data['fields'];
      if (fields != null) {
        return {
          'name': fields['name']?['stringValue'] ?? 'Clinical Partner',
          'email': fields['email']?['stringValue'] ?? email,
          'securityTier': fields['securityTier']?['stringValue'] ?? 'Tier 3: Clinical Administrator',
          'age': int.tryParse(fields['age']?['stringValue'] ?? '30') ?? 30,
          'gender': fields['gender']?['stringValue'] ?? 'Unspecified',
          'country': fields['country']?['stringValue'] ?? 'United States',
          'allergies': fields['allergies']?['stringValue'] ?? '',
          'conditions': fields['conditions']?['stringValue'] ?? '',
        };
      }
    } else if (response.statusCode == 404) {
      return null;
    }
    throw Exception('Failed to fetch Firestore user profile: ${response.statusCode} - ${response.body}');
  }

  // PATCH user profile to Firestore
  static Future<void> saveUserProfile(Map<String, dynamic> profile) async {
    final email = profile['email'] as String;
    final docId = getDocumentId(email);
    final url = Uri.parse('$firestoreBaseUrl/v1/projects/$projectId/databases/(default)/documents/users/$docId');

    final docData = {
      'fields': {
        'name': {'stringValue': profile['name'] ?? ''},
        'email': {'stringValue': profile['email'] ?? ''},
        'securityTier': {'stringValue': profile['securityTier'] ?? 'Tier 3: Clinical Administrator'},
        'age': {'stringValue': (profile['age'] ?? 30).toString()},
        'gender': {'stringValue': profile['gender'] ?? 'Unspecified'},
        'country': {'stringValue': profile['country'] ?? 'United States'},
        'allergies': {'stringValue': profile['allergies'] ?? ''},
        'conditions': {'stringValue': profile['conditions'] ?? ''},
      }
    };

    final response = await http.patch(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(docData),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to save Firestore user profile: ${response.statusCode} - ${response.body}');
    }
  }

  // POST delete account using Firebase Cloud Functions REST endpoint
  static Future<Map<String, dynamic>> deleteUserAccount(String email) async {
    final url = Uri.parse('$functionsBaseUrl/deleteUserAccount');

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    } else {
      throw Exception('Cloud account deletion endpoint failed: ${response.statusCode} - ${response.body}');
    }
  }
}
