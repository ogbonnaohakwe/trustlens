package com.example.ui

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Wc
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.FiberManualRecord
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material.icons.filled.Eco
import androidx.compose.material.icons.filled.Water
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*

@Composable
fun WelcomeScreen(
    viewModel: TrustLensViewModel,
    onNavigateToAccess: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(LightBackground)
            .padding(24.dp)
            .testTag("welcome_screen")
    ) {
        // High-level aesthetic backdrop accents
        Column(
            modifier = Modifier
                .fillMaxSize()
                .align(Alignment.Center),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(20.dp))

            // Brand Header with security shield
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(top = 16.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Shield,
                    contentDescription = "Security Shield",
                    tint = DeepBluePrimary,
                    modifier = Modifier.size(36.dp)
                )
                Text(
                    text = "TrustLens AI",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = DeepBluePrimary,
                    letterSpacing = (-0.5).sp
                )
            }

            // Core typography Hero
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp)
            ) {
                // System status pill indicator
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier
                        .background(
                            color = MediumSurfaceContainer.copy(alpha = 0.4f),
                            shape = RoundedCornerShape(99.dp)
                        )
                        .border(
                            width = 1.dp,
                            color = NeutralOutlineVariant,
                            shape = RoundedCornerShape(99.dp)
                        )
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .background(RadiantRedSecondary, shape = RoundedCornerShape(99.dp))
                    )
                    Text(
                        text = "SYSTEM LIVE",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = DarkOnSurface,
                        letterSpacing = 1.sp
                    )
                }

                Text(
                    text = "Scan Before You\nConsume.",
                    textAlign = TextAlign.Center,
                    fontSize = 42.sp,
                    lineHeight = 48.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = DeepBluePrimary,
                    modifier = Modifier.padding(top = 8.dp)
                )

                Text(
                    text = "Advanced forensic analysis for the digital age. Instantly verify the safety of food ingredients, allergens, and product authenticities.",
                    textAlign = TextAlign.Center,
                    fontSize = 16.sp,
                    lineHeight = 22.sp,
                    color = DarkOnSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 12.dp)
                )
            }

            // Main CTA Action Button
            Button(
                onClick = onNavigateToAccess,
                colors = ButtonDefaults.buttonColors(containerColor = RadiantRedSecondary),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .testTag("get_started_button")
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "GET STARTED",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp,
                        color = Color.White
                    )
                    Icon(
                        imageVector = Icons.Default.ArrowForward,
                        contentDescription = "ForwardArrow",
                        tint = Color.White
                    )
                }
            }
        }
    }
}

@Composable
fun AccessSystemScreen(
    viewModel: TrustLensViewModel,
    onSearchClick: (email: String, name: String, pass: String) -> Unit
) {
    val loginInProgress by viewModel.loginInProgress.collectAsState()
    val syncStatus by viewModel.firestoreSyncError.collectAsState()
    var fullName by remember { mutableStateOf("") }
    var emailAddress by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isPasswordVisible by remember { mutableStateOf(false) }

    var inputError by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(LightBackground)
            .padding(24.dp)
            .testTag("access_system_screen"),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(LowestSurfaceCommon, shape = RoundedCornerShape(16.dp))
                .border(1.dp, NeutralOutlineVariant, shape = RoundedCornerShape(16.dp))
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Access System",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = DarkOnSurface,
                    textAlign = TextAlign.Center
                )
                Text(
                    text = "Enter your credentials to continue to your forensic profile health dashboard.",
                    fontSize = 14.sp,
                    lineHeight = 20.sp,
                    color = DarkOnSurfaceVariant,
                    textAlign = TextAlign.Center
                )
            }

            // Full Name Input
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = "Full Name",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = DarkOnSurface
                )
                OutlinedTextField(
                    value = fullName,
                    onValueChange = {
                        fullName = it
                        inputError = false
                    },
                    placeholder = { Text("e.g. Dr. Julian Vance") },
                    leadingIcon = {
                        Icon(imageVector = Icons.Default.Person, contentDescription = "Name Icon", tint = NeutralOutline)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("name_input"),
                    shape = RoundedCornerShape(12.dp),
                    isError = inputError && fullName.isBlank(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = DarkOnSurface,
                        unfocusedTextColor = DarkOnSurface,
                        focusedBorderColor = DeepBluePrimary,
                        unfocusedBorderColor = NeutralOutline,
                        focusedLabelColor = DeepBluePrimary,
                        focusedContainerColor = LowestSurfaceCommon,
                        unfocusedContainerColor = LowestSurfaceCommon
                    )
                )
            }

            // Email Address Input
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = "Email Address",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = DarkOnSurface
                )
                OutlinedTextField(
                    value = emailAddress,
                    onValueChange = {
                        emailAddress = it
                        inputError = false
                    },
                    placeholder = { Text("name@organization.com") },
                    leadingIcon = {
                        Icon(imageVector = Icons.Default.Email, contentDescription = "Email Icon", tint = NeutralOutline)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("email_input"),
                    shape = RoundedCornerShape(12.dp),
                    isError = inputError && (!emailAddress.contains("@") || emailAddress.isBlank()),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = DarkOnSurface,
                        unfocusedTextColor = DarkOnSurface,
                        focusedBorderColor = DeepBluePrimary,
                        unfocusedBorderColor = NeutralOutline,
                        focusedLabelColor = DeepBluePrimary,
                        focusedContainerColor = LowestSurfaceCommon,
                        unfocusedContainerColor = LowestSurfaceCommon
                    )
                )
            }

            // Password Input
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = "Password",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = DarkOnSurface
                )
                OutlinedTextField(
                    value = password,
                    onValueChange = {
                        password = it
                        inputError = false
                    },
                    placeholder = { Text("Minimum 4 characters") },
                    leadingIcon = {
                        Icon(imageVector = Icons.Default.Lock, contentDescription = "Password Icon", tint = NeutralOutline)
                    },
                    trailingIcon = {
                        IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                            Icon(
                                imageVector = if (isPasswordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = if (isPasswordVisible) "Hide Password" else "Show Password",
                                tint = NeutralOutline
                            )
                        }
                    },
                    visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("password_input"),
                    shape = RoundedCornerShape(12.dp),
                    isError = inputError && password.length < 4,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = DarkOnSurface,
                        unfocusedTextColor = DarkOnSurface,
                        focusedBorderColor = DeepBluePrimary,
                        unfocusedBorderColor = NeutralOutline,
                        focusedLabelColor = DeepBluePrimary,
                        focusedContainerColor = LowestSurfaceCommon,
                        unfocusedContainerColor = LowestSurfaceCommon
                    )
                )
            }

            if (inputError && errorMessage.isNotBlank()) {
                Text(
                    text = errorMessage,
                    color = RadiantRedSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.fillMaxWidth(),
                    textAlign = TextAlign.Start
                )
            }

            if (loginInProgress) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp)
                ) {
                    CircularProgressIndicator(color = RadiantRedSecondary)
                    Text(
                        text = syncStatus ?: "Validating credentials...",
                        fontSize = 12.sp,
                        color = RadiantRedSecondary,
                        fontWeight = FontWeight.Bold
                    )
                }
            } else {
                Button(
                    onClick = {
                        if (fullName.isBlank()) {
                            inputError = true
                            errorMessage = "Please enter your full name."
                        } else if (emailAddress.isBlank() || !emailAddress.contains("@")) {
                            inputError = true
                            errorMessage = "Please enter a valid email address."
                        } else if (password.length < 4) {
                            inputError = true
                            errorMessage = "Password must be at least 4 characters."
                        } else {
                            inputError = false
                            errorMessage = ""
                            onSearchClick(emailAddress, fullName, password)
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = RadiantRedSecondary),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .testTag("login_continue_button")
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "CONTINUE",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp,
                            color = Color.White
                        )
                        Icon(
                            imageVector = Icons.Default.ArrowForward,
                            contentDescription = "ForwardArrow",
                            tint = Color.White
                        )
                    }
                }
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(top = 8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Lock,
                    contentDescription = "Security Status",
                    tint = NeutralOutline,
                    modifier = Modifier.size(16.dp)
                )
                Text(
                    text = "Encrypted in transit & HIPAA Compliant",
                    fontSize = 12.sp,
                    color = DarkOnSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun SetupStep1Screen(
    viewModel: TrustLensViewModel,
    onNext: (name: String, age: Int, gender: String) -> Unit
) {
    val userProfile by viewModel.userProfile.collectAsState()
    var nameText by remember { mutableStateOf("") }
    var ageText by remember { mutableStateOf("34") }
    var selectedGender by remember { mutableStateOf("Male") }

    LaunchedEffect(userProfile) {
        userProfile?.let {
            if (it.name != "Clinical Partner" && it.name.isNotBlank()) {
                nameText = it.name
            }
        }
    }

    Scaffold(
        topBar = {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(LowestSurfaceCommon)
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = "Logo Shield",
                        tint = DeepBluePrimary,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        },
        bottomBar = {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(LowestSurfaceCommon)
                    .border(1.dp, NeutralOutlineVariant)
                    .padding(16.dp)
            ) {
                Button(
                    onClick = {
                        val ageVal = ageText.toIntOrNull() ?: 34
                        val finalName = nameText.trim().ifEmpty { "Clinical Partner" }
                        onNext(finalName, ageVal, selectedGender)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = RadiantRedSecondary),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .testTag("step1_next_button")
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "NEXT",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp,
                            color = Color.White
                        )
                        Icon(imageVector = Icons.Default.ArrowForward, contentDescription = "Next Arrow", tint = Color.White)
                    }
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(LightBackground)
                .padding(innerPadding)
                .padding(24.dp)
                .verticalScroll(rememberScrollState())
                .testTag("setup_step1_screen"),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // STEP PROGRESS INTRO
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Bottom
                ) {
                    Text(
                        text = "STEP 1 OF 3",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = RadiantRedSecondary
                    )
                    Text(
                        text = "Basic Information",
                        fontSize = 13.sp,
                        color = DarkOnSurfaceVariant
                    )
                }
                LinearProgressIndicator(
                    progress = { 0.33f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(99.dp)),
                    color = RadiantRedSecondary,
                    trackColor = MediumSurfaceContainer
                )
            }

            // Headline
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = "Setup Your Health Profile",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = DarkOnSurface
                )
                Text(
                    text = "To provide accurate analytical indicators, our neural models calibrate biological risks near your local environments.",
                    fontSize = 14.sp,
                    lineHeight = 20.sp,
                    color = DarkOnSurfaceVariant
                )
            }

            // Input Full Name
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = LowestSurfaceCommon),
                border = borderStroke()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.Top,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .background(LowSurfaceContainer, RoundedCornerShape(8.dp))
                            .padding(12.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Person, contentDescription = "User Name", tint = DeepBluePrimary)
                    }
                    Column(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(text = "Full Name", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = DarkOnSurface)
                        Text(text = "Customizes clinical diagnostics and report output.", fontSize = 11.sp, color = DarkOnSurfaceVariant)
                        OutlinedTextField(
                            value = nameText,
                            onValueChange = { nameText = it },
                            placeholder = { Text("e.g. Dr. Julian Vance") },
                            modifier = Modifier.fillMaxWidth().testTag("user_name_input"),
                            shape = RoundedCornerShape(8.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = DarkOnSurface,
                                unfocusedTextColor = DarkOnSurface,
                                focusedBorderColor = DeepBluePrimary,
                                unfocusedBorderColor = NeutralOutline,
                                focusedContainerColor = LowestSurfaceCommon,
                                unfocusedContainerColor = LowestSurfaceCommon
                            )
                        )
                    }
                }
            }

            // Input age
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = LowestSurfaceCommon),
                border = borderStroke()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.Top,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .background(LowSurfaceContainer, RoundedCornerShape(8.dp))
                            .padding(12.dp)
                    ) {
                        Icon(imageVector = Icons.Default.DateRange, contentDescription = "Date", tint = DeepBluePrimary)
                    }
                    Column(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(text = "Age", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = DarkOnSurface)
                        Text(text = "Calibrates specific threshold tolerances.", fontSize = 11.sp, color = DarkOnSurfaceVariant)
                        OutlinedTextField(
                            value = ageText,
                            onValueChange = { ageText = it },
                            modifier = Modifier.fillMaxWidth().testTag("user_age_input"),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            shape = RoundedCornerShape(8.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = DarkOnSurface,
                                unfocusedTextColor = DarkOnSurface,
                                focusedBorderColor = DeepBluePrimary,
                                unfocusedBorderColor = NeutralOutline,
                                focusedContainerColor = LowestSurfaceCommon,
                                unfocusedContainerColor = LowestSurfaceCommon
                            )
                        )
                    }
                }
            }

            // Input Biological Gender
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = LowestSurfaceCommon),
                border = borderStroke()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.Top,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .background(LowSurfaceContainer, RoundedCornerShape(8.dp))
                            .padding(12.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Wc, contentDescription = "Gender Selection", tint = DeepBluePrimary)
                    }
                    Column(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(text = "Biological Gender", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = DarkOnSurface)
                        Text(text = "Provides medical risk check ranges.", fontSize = 11.sp, color = DarkOnSurfaceVariant)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            listOf("Male", "Female").forEach { gender ->
                                val isSelected = selectedGender == gender
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(48.dp)
                                        .background(
                                            color = if (isSelected) LowSurfaceContainer else Color.Transparent,
                                            shape = RoundedCornerShape(8.dp)
                                        )
                                        .border(
                                            width = if (isSelected) 2.dp else 1.dp,
                                            color = if (isSelected) RadiantRedSecondary else NeutralOutlineVariant,
                                            shape = RoundedCornerShape(8.dp)
                                        )
                                        .clickable { selectedGender = gender }
                                        .padding(8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = gender,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSelected) RadiantRedSecondary else DarkOnSurfaceVariant,
                                        fontSize = 14.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SetupStep2Screen(
    viewModel: TrustLensViewModel,
    onNext: (allergies: List<String>) -> Unit
) {
    val allergyOptions = listOf("Nuts", "Milk", "Soy", "Gluten", "Seafood", "Eggs", "Peanuts", "Shellfish", "Sesame")
    val selectedAllergies = remember { mutableStateListOf<String>() }

    Scaffold(
        topBar = {
            CustomTopBar()
        },
        bottomBar = {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(LowestSurfaceCommon)
                    .border(1.dp, NeutralOutlineVariant)
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Button(
                        onClick = { onNext(emptyList()) }, // Skip for now
                        colors = ButtonDefaults.outlinedButtonColors(),
                        border = borderStroke(),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(56.dp)
                    ) {
                        Text(text = "Skip for now", color = DarkOnSurfaceVariant, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = { onNext(selectedAllergies.toList()) },
                        colors = ButtonDefaults.buttonColors(containerColor = RadiantRedSecondary),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(56.dp)
                            .testTag("step2_next_button")
                    ) {
                        Text(text = "Save & Continue", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(LightBackground)
                .padding(innerPadding)
                .padding(16.dp)
                .testTag("setup_step2_screen"),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // PROGRESS BAR
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Bottom
                ) {
                    Text(text = "SETUP PROFILE", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = RadiantRedSecondary)
                    Text(text = "Step 2 of 3", fontSize = 13.sp, color = DarkOnSurfaceVariant)
                }
                LinearProgressIndicator(
                    progress = { 0.66f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(99.dp)),
                    color = RadiantRedSecondary,
                    trackColor = MediumSurfaceContainer
                )
            }

            // Intro text
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(text = "Allergies & Dietary", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = DarkOnSurface)
                Text(text = "Select all substances that cause an allergic reaction. This data guarantees high-precision safe evaluation.", fontSize = 14.sp, color = DarkOnSurfaceVariant)
            }

            // Grid items
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.weight(1f)
            ) {
                items(allergyOptions) { allergy ->
                    val isSelected = selectedAllergies.contains(allergy)
                    val bg = if (isSelected) LowSurfaceContainer else LowestSurfaceCommon
                    val borderCol = if (isSelected) RadiantRedSecondary else NeutralOutlineVariant
                    val strokeWidth = if (isSelected) 2.dp else 1.dp

                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(bg)
                            .border(strokeWidth, borderCol, RoundedCornerShape(12.dp))
                            .clickable {
                                if (isSelected) selectedAllergies.remove(allergy)
                                else selectedAllergies.add(allergy)
                            }
                            .padding(24.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .background(
                                    color = if (isSelected) RadiantRedSecondary else LowSurfaceContainer,
                                    shape = RoundedCornerShape(99.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = allergyIcon(allergy),
                                contentDescription = allergy,
                                tint = if (isSelected) Color.White else DeepBluePrimary
                            )
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(text = allergy, fontWeight = FontWeight.Bold, color = if (isSelected) RadiantRedSecondary else DarkOnSurface, fontSize = 14.sp)
                    }
                }
            }

            // Caution Alert box at bottom
            Row(
                modifier = Modifier
                    .background(LowSurfaceContainer, RoundedCornerShape(12.dp))
                    .border(1.dp, NeutralOutlineVariant, RoundedCornerShape(12.dp))
                    .padding(16.dp),
                verticalAlignment = Alignment.Top,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(imageVector = Icons.Default.Info, contentDescription = "Info", tint = RadiantRedSecondary)
                Text(
                    text = "Selection accuracy is critical. High-Contrast detection filters prioritize scanning for specific allergen markers in chemical lists.",
                    fontSize = 11.sp,
                    lineHeight = 16.sp,
                    color = DarkOnSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun SetupStep3Screen(
    viewModel: TrustLensViewModel,
    onSubmit: (conditions: List<String>) -> Unit
) {
    val conditionOptions = listOf(
        Pair("Diabetes", "Type 1 or Type 2 management"),
        Pair("Hypertension", "Chronic high blood pressure"),
        Pair("Heart Disease", "History of cardiovascular issues"),
        Pair("Kidney Disease", "Chronic kidney conditions (CKD)"),
        Pair("Pregnancy Status", "Currently pregnant or postpartum"),
        Pair("Celiac Disease", "Strict gluten-free safety audit"),
        Pair("Hyperlipidemia", "High cholesterol & lipid management"),
        Pair("Lactose Intolerance", "Dairy & lactose sensitive tracking"),
        Pair("Gout", "Uric acid & high-purine watch list"),
        Pair("Gastritis / GERD", "Acid reflux & stomach sensitivity alert"),
        Pair("Thyroid Disorder", "Hypo/Hyperthyroidism nutritional balance"),
        Pair("Asthma", "Airways & food-preservative allergen guard"),
        Pair("IBS", "FODMAP restriction & digestive tract care")
    )
    val selectedConditions = remember { mutableStateListOf<String>() }

    Scaffold(
        topBar = {
            CustomTopBar()
        },
        bottomBar = {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(LowestSurfaceCommon)
                    .border(1.dp, NeutralOutlineVariant)
                    .padding(16.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Button(
                        onClick = { onSubmit(selectedConditions.toList()) },
                        colors = ButtonDefaults.buttonColors(containerColor = RadiantRedSecondary),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .testTag("complete_setup_button")
                    ) {
                        Text(text = "COMPLETE SETUP", color = Color.White, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    }

                    Text(
                        text = "Skip for now",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = DarkOnSurfaceVariant,
                        modifier = Modifier
                            .clickable { onSubmit(emptyList()) }
                            .padding(8.dp)
                    )
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(LightBackground)
                .padding(innerPadding)
                .padding(16.dp)
                .testTag("setup_step3_screen"),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // PROGRESS BAR
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Bottom
                ) {
                    Column {
                        Text(text = "STEP 3 OF 3", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = DarkOnSurfaceVariant)
                        Text(text = "Medical Conditions", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = DarkOnSurface)
                    }
                    Text(text = "100% Complete", fontSize = 13.sp, color = RadiantRedSecondary, fontWeight = FontWeight.Bold)
                }
                LinearProgressIndicator(
                    progress = { 1.0f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(99.dp)),
                    color = RadiantRedSecondary,
                    trackColor = MediumSurfaceContainer
                )
            }

            Text(
                text = "Please select all conditions that apply to your current health status for accurate AI matching.",
                color = DarkOnSurfaceVariant,
                fontSize = 14.sp
            )

            // list layout
            Column(
                modifier = Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                conditionOptions.forEach { pair ->
                    val conditionName = pair.first
                    val conditionDesc = pair.second
                    val isChecked = selectedConditions.contains(conditionName)

                    val bg = if (isChecked) LowSurfaceContainer else LowestSurfaceCommon
                    val borderCol = if (isChecked) RadiantRedSecondary else NeutralOutlineVariant
                    val stroke = if (isChecked) 2.dp else 1.dp

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(bg)
                            .border(stroke, borderCol, RoundedCornerShape(12.dp))
                            .clickable {
                                if (isChecked) selectedConditions.remove(conditionName)
                                else selectedConditions.add(conditionName)
                            }
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = conditionName, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = if (isChecked) RadiantRedSecondary else DarkOnSurface)
                            Text(text = conditionDesc, fontSize = 12.sp, color = DarkOnSurfaceVariant)
                        }
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .border(
                                    width = 2.dp,
                                    color = if (isChecked) RadiantRedSecondary else NeutralOutline,
                                    shape = RoundedCornerShape(99.dp)
                                )
                                .background(
                                    color = if (isChecked) RadiantRedSecondary else Color.Transparent,
                                    shape = RoundedCornerShape(99.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isChecked) {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = "Checked",
                                    tint = Color.White,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CustomTopBar() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(LowestSurfaceCommon)
            .border(1.dp, NeutralOutlineVariant)
            .padding(16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Shield,
                contentDescription = "Badge Shield Logo",
                tint = RadiantRedSecondary,
                modifier = Modifier.size(24.dp)
            )
        }
    }
}

private fun allergyIcon(name: String): ImageVector {
    return when (name) {
        "Nuts" -> Icons.Default.FiberManualRecord
        "Milk" -> Icons.Default.WaterDrop
        "Soy" -> Icons.Default.Eco
        "Gluten" -> Icons.Default.Home
        "Seafood" -> Icons.Default.Info
        "Eggs" -> Icons.Default.ShoppingCart
        "Peanuts" -> Icons.Default.FiberManualRecord
        "Shellfish" -> Icons.Default.Water
        else -> Icons.Default.Warning
    }
}

private fun borderStroke() = androidx.compose.foundation.BorderStroke(
    width = 1.dp,
    color = NeutralOutlineVariant
)
