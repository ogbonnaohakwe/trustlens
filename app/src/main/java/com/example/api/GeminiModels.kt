package com.example.api

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class GenerateContentRequest(
    val contents: List<Content>,
    val generationConfig: GenerationConfig? = null,
    val systemInstruction: Content? = null
)

@JsonClass(generateAdapter = true)
data class Content(
    val parts: List<Part>
)

@JsonClass(generateAdapter = true)
data class Part(
    val text: String? = null,
    val inlineData: InlineData? = null
)

@JsonClass(generateAdapter = true)
data class InlineData(
    val mimeType: String,
    val data: String // Bas64 encoded string
)

@JsonClass(generateAdapter = true)
data class GenerationConfig(
    val responseMimeType: String? = null,
    val temperature: Float? = null,
    val topP: Float? = null,
    val topK: Int? = null,
    val thinkingConfig: ThinkingConfig? = null
)

@JsonClass(generateAdapter = true)
data class ThinkingConfig(
    val thinkingLevel: String // "OFF", "LOW", "MEDIUM", "HIGH" (or maps to API config options)
)

@JsonClass(generateAdapter = true)
data class GenerateContentResponse(
    val candidates: List<Candidate>? = null
)

@JsonClass(generateAdapter = true)
data class Candidate(
    val content: Content? = null
)

// Moshi schema definition for structured responses when parsing JSON back
@JsonClass(generateAdapter = true)
data class ScannedProductAnalysis(
    val productName: String,
    val productSubtitle: String,
    val safetyScore: Int,
    val safetyStatus: String, // "SAFE", "CAUTION", "UNSAFE"
    val authenticityLabel: String, // "AUTHENTICITY CONFIRMED", "COUNTERFEIT DETECTED", "DAMAGED SEAL"
    val authenticityPercentage: Float,
    val allergenAlertMessage: String, // critical details warning user
    val avoidIngredients: List<String>,
    val cautionIngredients: List<String>,
    val safeIngredients: List<String>,
    val summaryReport: String // formatted clear health justification
)
