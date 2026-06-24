package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "scan_history")
data class ScanEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val productName: String,
    val productSubtitle: String,
    val imageUrl: String = "",
    val safetyScore: Int = 100,
    val safetyStatus: String = "SAFE", // "SAFE", "CAUTION", "UNSAFE"
    val authenticityLabel: String = "AUTHENTICITY CONFIRMED", // "AUTHENTICITY CONFIRMED", "COUNTERFEIT DETECTED", "DAMAGED SEAL"
    val authenticityPercentage: Float = 98.4f,
    val allergenAlertMessage: String = "",
    val avoidIngredients: String = "", // comma-separated or detailed list
    val cautionIngredients: String = "", // comma-separated
    val safeIngredients: String = "", // comma-separated
    val fullMarkdownReport: String = "",
    val timestamp: Long = System.currentTimeMillis()
)
