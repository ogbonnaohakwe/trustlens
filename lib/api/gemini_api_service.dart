import 'dart:convert';
import 'package:http/http.dart' as http;
import 'product_analysis_engine.dart';

class GeminiApiService {
  static const String baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  // Calls gemini-3.1-pro-preview with HIGH thinking config
  static Future<ScannedProductAnalysis> generateContentPro({
    required String apiKey,
    required String prompt,
    String? base64Image,
  }) async {
    const model = 'gemini-3.1-pro-preview';
    final url = Uri.parse('$baseUrl/$model:generateContent?key=$apiKey');

    final parts = <Map<String, dynamic>>[];
    parts.add({'text': prompt});

    if (base64Image != null) {
      parts.add({
        'inlineData': {
          'mimeType': 'image/jpeg',
          'data': base64Image,
        }
      });
    }

    final requestBody = {
      'contents': [
        {
          'parts': parts,
        }
      ],
      'generationConfig': {
        'responseMimeType': 'application/json',
        'temperature': 0.4,
        'thinkingConfig': {
          'thinkingLevel': 'HIGH',
        }
      }
    };

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(requestBody),
    );

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      final rawText = decoded['candidates']?[0]?['content']?['parts']?[0]?['text'] ?? '';
      if (rawText.isNotEmpty) {
        // Strip markdown code block wrappers if generated despite request
        var cleanJson = rawText.toString().trim();
        if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.substring(7);
        }
        if (cleanJson.endsWith('```')) {
          cleanJson = cleanJson.substring(0, cleanJson.length - 3);
        }
        cleanJson = cleanJson.trim();
        return ScannedProductAnalysis.fromJson(jsonDecode(cleanJson));
      }
    }
    throw Exception('Gemini Pro API call failed: ${response.statusCode} - ${response.body}');
  }

  // Calls gemini-3.1-flash-lite-preview for low-latency chat
  static Future<String> generateContentFlashLite({
    required String apiKey,
    required String prompt,
  }) async {
    const model = 'gemini-3.1-flash-lite-preview';
    final url = Uri.parse('$baseUrl/$model:generateContent?key=$apiKey');

    final requestBody = {
      'contents': [
        {
          'parts': [
            {'text': prompt}
          ]
        }
      ]
    };

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(requestBody),
    );

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      return decoded['candidates']?[0]?['content']?['parts']?[0]?['text'] ?? 'No response received.';
    }
    throw Exception('Gemini Flash Lite API call failed: ${response.statusCode}');
  }

  // Calls gemini-3.5-flash for Search Grounding/pharmacies search
  static Future<String> generateContentFlash({
    required String apiKey,
    required String prompt,
  }) async {
    const model = 'gemini-3.5-flash';
    final url = Uri.parse('$baseUrl/$model:generateContent?key=$apiKey');

    final requestBody = {
      'contents': [
        {
          'parts': [
            {'text': prompt}
          ]
        }
      ]
    };

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(requestBody),
    );

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      return decoded['candidates']?[0]?['content']?['parts']?[0]?['text'] ?? 'No grounding compiled.';
    }
    throw Exception('Gemini Flash API call failed: ${response.statusCode}');
  }
}
