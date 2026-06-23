package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_profile")
data class UserEntity(
    @PrimaryKey val id: Int = 1,
    val name: String = "Clinical Partner",
    val email: String = "",
    val age: Int = 30,
    val gender: String = "Unspecified",
    val country: String = "United States",
    val allergies: String = "", // comma separated
    val conditions: String = "", // comma separated
    val securityTier: String = "Tier 3: Clinical Administrator",
    val isLoggedIn: Boolean = false
)
