package com.example.ui

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.DocumentScanner
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.ArrowForwardIos
import androidx.compose.material3.*
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.ScanEntity
import com.example.ui.theme.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.compose.LocalLifecycleOwner
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import android.content.pm.PackageManager
import android.Manifest

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardTabsScreen(viewModel: TrustLensViewModel) {
    val currentTab by viewModel.currentTab.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        if (currentTab != DashboardTab.Home) {
                            IconButton(
                                onClick = { viewModel.setTab(DashboardTab.Home) },
                                modifier = Modifier.testTag("app_bar_back_button")
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ArrowBack,
                                    contentDescription = "Back to Home",
                                    tint = DeepBluePrimary
                                )
                            }
                            Text(
                                text = when (currentTab) {
                                    DashboardTab.Scan -> "Analyze Labels"
                                    DashboardTab.History -> "Scan History Log"
                                    DashboardTab.Profile -> "Profile Security"
                                    else -> "TrustLens AI"
                                },
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = DeepBluePrimary
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.Shield,
                                contentDescription = "Logo",
                                tint = RadiantRedSecondary,
                                modifier = Modifier.size(28.dp)
                            )
                            Text(
                                text = "TrustLens AI",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = DeepBluePrimary
                            )
                        }
                    }
                },
                actions = {
                    if (currentTab == DashboardTab.Home) {
                        IconButton(
                            onClick = { viewModel.setTab(DashboardTab.Profile) },
                            modifier = Modifier.testTag("app_bar_profile_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.AccountCircle,
                                contentDescription = "Profile Settings",
                                tint = RadiantRedSecondary,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = LowestSurfaceCommon)
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = LowestSurfaceCommon,
                tonalElevation = 1.dp
            ) {
                listOf(
                    Triple(DashboardTab.Home, Icons.Default.Home, "Home"),
                    Triple(DashboardTab.Scan, Icons.Default.DocumentScanner, "Scan"),
                    Triple(DashboardTab.History, Icons.Default.History, "History"),
                    Triple(DashboardTab.Profile, Icons.Default.Person, "Profile")
                ).forEach { (tab, icon, label) ->
                    val isSelected = currentTab == tab
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { viewModel.setTab(tab) },
                        icon = {
                            Icon(
                                  imageVector = icon,
                                  contentDescription = label,
                                  tint = if (isSelected) RadiantRedSecondary else DarkOnSurfaceVariant
                            )
                        },
                        label = {
                            Text(
                                text = label,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSelected) RadiantRedSecondary else DarkOnSurfaceVariant,
                                fontSize = 12.sp
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            indicatorColor = LowSurfaceContainer
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(LightBackground)
        ) {
            when (currentTab) {
                DashboardTab.Home -> HomeScreen(viewModel)
                DashboardTab.Scan -> ScanScreen(viewModel)
                DashboardTab.History -> HistoryScreen(viewModel)
                DashboardTab.Profile -> ProfileScreen(viewModel)
            }
        }
    }
}

@Composable
fun HomeScreen(viewModel: TrustLensViewModel) {
    val userProfile by viewModel.userProfile.collectAsState()
    val scans by viewModel.allScans.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("home_screen_content")
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // 1. COMMAND CENTER HERO BANNER
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DeepBluePrimary),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "COMMAND CENTER",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = GoldTertiary,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "Profile 100% Optimized",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )
                    Text(
                        text = "Your health parameters are fully active. Scan any product to instantly verify alignment with your personal safety lens.",
                        fontSize = 13.sp,
                        lineHeight = 18.sp,
                        color = Color.White.copy(alpha = 0.8f)
                    )
                    Button(
                        onClick = { viewModel.setTab(DashboardTab.Scan) },
                        colors = ButtonDefaults.buttonColors(containerColor = RadiantRedSecondary),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .padding(top = 4.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(imageVector = Icons.Default.DocumentScanner, contentDescription = null, tint = Color.White)
                            Text(text = "Scan Now", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                    }
                }
            }
        }

        // 2. ACTIVE LENS FILTERS
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = LowestSurfaceCommon),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, NeutralOutlineVariant)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Active Lens",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = DarkOnSurface
                        )
                        Text(
                            text = "Edit Profile",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = RadiantRedSecondary,
                            modifier = Modifier
                                .clickable { viewModel.setTab(DashboardTab.Profile) }
                                .padding(4.dp)
                        )
                    }

                    val allergies = userProfile?.allergies?.split(",")?.filter { it.isNotBlank() } ?: emptyList()
                    val conditions = userProfile?.conditions?.split(",")?.filter { it.isNotBlank() } ?: emptyList()

                    Text(
                        text = "Critical Filters Checked: ${allergies.size} Allergies, ${conditions.size} Conditions monitored.",
                        fontSize = 13.sp,
                        color = DarkOnSurfaceVariant
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        allergies.forEach { allergy ->
                            AssistChip(
                                onClick = {},
                                label = { Text(allergy, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp) },
                                colors = AssistChipDefaults.assistChipColors(
                                    containerColor = RadiantRedSecondary
                                )
                            )
                        }
                        conditions.forEach { condition ->
                            AssistChip(
                                onClick = {},
                                label = { Text(condition, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp) },
                                colors = AssistChipDefaults.assistChipColors(
                                    containerColor = DeepBluePrimary
                                )
                            )
                        }
                    }
                }
            }
        }

        // 3. RECENT AUDITS LIST INTRO
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recent Scans",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = DarkOnSurface
                )
                Text(
                    text = "View History",
                    fontSize = 13.sp,
                    color = RadiantRedSecondary,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.clickable { viewModel.setTab(DashboardTab.History) }
                )
            }
        }

        if (scans.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No scans completed yet. Tap Scan to run live ingredients checks.",
                        color = DarkOnSurfaceVariant,
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center
                    )
                }
            }
        } else {
            items(scans.take(3)) { scan ->
                AuditHistoryCard(scan = scan, onClick = {
                    // Navigate to details overlay
                    viewModel.setTab(DashboardTab.Scan)
                    // Trigger active result loading
                    viewModel.analyzeProduct(scan.productName, scan.avoidIngredients + "," + scan.cautionIngredients)
                })
            }
        }

        // 4. METRIC AND INSIGHT BENTO PACKS
        item {
            Text(
                text = "Safety Insights",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = DarkOnSurface,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        item {
            val allergies = userProfile?.allergies?.split(",")?.map { it.trim() }?.filter { it.isNotBlank() } ?: emptyList()
            val conditions = userProfile?.conditions?.split(",")?.map { it.trim() }?.filter { it.isNotBlank() } ?: emptyList()

            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                // Warning Insight
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(LowestSurfaceCommon, shape = RoundedCornerShape(12.dp))
                        .border(1.dp, NeutralOutlineVariant, RoundedCornerShape(12.dp))
                        .padding(16.dp),
                    verticalAlignment = Alignment.Top,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.TrendingUp,
                        contentDescription = "Alert Indicator",
                        tint = RadiantRedSecondary,
                        modifier = Modifier.size(24.dp)
                    )
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        if (allergies.isNotEmpty()) {
                            Text(
                                text = "Allergen Security Protocol: Active",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = RadiantRedSecondary
                            )
                            Text(
                                text = "Your safety lenses are strictly monitoring ingredient audits for allergens: ${allergies.joinToString(", ")}.",
                                fontSize = 12.sp,
                                lineHeight = 16.sp,
                                color = DarkOnSurfaceVariant
                            )
                        } else {
                            Text(
                                text = "Allergy Filters Disengaged",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = DarkOnSurfaceVariant
                            )
                            Text(
                                text = "No active allergies configuration detected. Update your health profile to initiate automated allergen flagging.",
                                fontSize = 12.sp,
                                lineHeight = 16.sp,
                                color = DarkOnSurfaceVariant
                            )
                        }
                    }
                }

                // Health Tip
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(LowestSurfaceCommon, shape = RoundedCornerShape(12.dp))
                        .border(1.dp, NeutralOutlineVariant, RoundedCornerShape(12.dp))
                        .padding(16.dp),
                    verticalAlignment = Alignment.Top,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Lightbulb,
                        contentDescription = "Tip",
                        tint = DeepBluePrimary,
                        modifier = Modifier.size(24.dp)
                    )
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        if (conditions.isNotEmpty()) {
                            Text(
                                text = "Clinical Guard: ${conditions.first().replaceFirstChar { it.uppercase() }} Watch",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = PlayPrimaryColor
                            )
                            Text(
                                text = "Based on your monitored medical condition of ${conditions.joinToString(", ")}, our scanner flags foods/ingredients containing high risk profiles.",
                                fontSize = 12.sp,
                                lineHeight = 16.sp,
                                color = DarkOnSurfaceVariant
                            )
                        } else {
                            Text(
                                text = "Medical Watchlist Status",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = PlayPrimaryColor
                            )
                            Text(
                                text = "No medical conditions specified. Update parameters on your profile tab to optimize custom cardiovascular/metabolic indices.",
                                fontSize = 12.sp,
                                lineHeight = 16.sp,
                                color = DarkOnSurfaceVariant
                            )
                        }
                    }
                }

                // Database sync Complete
                
            }
        }
    }
}

@Composable
fun ScanScreen(viewModel: TrustLensViewModel) {
    val isAnalyzing by viewModel.isAnalyzing.collectAsState()
    val error by viewModel.analysisError.collectAsState()
    val result by viewModel.activeScanResult.collectAsState()

    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
        if (!isGranted) {
            Toast.makeText(context, "Camera permission is required for the live viewfinder stream.", Toast.LENGTH_SHORT).show()
        }
    }

    var previewViewRef by remember { mutableStateOf<PreviewView?>(null) }

    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap: Bitmap? ->
        if (bitmap != null) {
            // Send captured image of product label to the Gemini API / offline logic
            viewModel.analyzeProduct("", "", bitmap)
        }
    }

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null) {
            try {
                val contentResolver = context.contentResolver
                val source = android.graphics.ImageDecoder.createSource(contentResolver, uri)
                val bitmap = android.graphics.ImageDecoder.decodeBitmap(source)
                viewModel.analyzeProduct("", "", bitmap)
            } catch (e: Exception) {
                try {
                    val inputStream = context.contentResolver.openInputStream(uri)
                    val bitmap = BitmapFactory.decodeStream(inputStream)
                    if (bitmap != null) {
                        viewModel.analyzeProduct("", "", bitmap)
                    }
                } catch (ex: Exception) {
                    // Fail gracefully
                }
            }
        }
    }

    if (result != null) {
        ScanDetailsView(scan = result!!, onDismiss = { viewModel.clearResult() }, viewModel = viewModel)
    } else {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .testTag("scan_screen_content"),
            verticalArrangement = Arrangement.spacedBy(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // TOP STATUS
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier
                    .background(LowSurfaceContainer, RoundedCornerShape(99.dp))
                    .border(1.dp, NeutralOutlineVariant, RoundedCornerShape(99.dp))
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                Text(
                    text = if (isAnalyzing) "EXTRACTING DATA..." else "SCANNER IDLE",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = RadiantRedSecondary,
                    letterSpacing = 1.sp
                )
                if (isAnalyzing) {
                    CircularProgressIndicator(modifier = Modifier.size(14.dp), strokeWidth = 2.dp, color = RadiantRedSecondary)
                }
            }

            // VIEWFINDER BOX WITH ANIMATION LINES & LIVE CAMERAX PREVIEW
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.Black)
                    .clickable {
                        if (!hasCameraPermission) {
                            permissionLauncher.launch(Manifest.permission.CAMERA)
                        }
                    },
                contentAlignment = Alignment.Center
            ) {
                if (hasCameraPermission) {
                    val lifecycleOwner = LocalLifecycleOwner.current
                    val cameraProviderFuture = remember { ProcessCameraProvider.getInstance(context) }
                    
                    AndroidView(
                        factory = { ctx ->
                            PreviewView(ctx).apply {
                                scaleType = PreviewView.ScaleType.FILL_CENTER
                                layoutParams = ViewGroup.LayoutParams(
                                    ViewGroup.LayoutParams.MATCH_PARENT,
                                    ViewGroup.LayoutParams.MATCH_PARENT
                                )
                                previewViewRef = this
                            }
                        },
                        modifier = Modifier.fillMaxSize(),
                        update = { previewView ->
                            val executor = ContextCompat.getMainExecutor(context)
                            cameraProviderFuture.addListener({
                                val cameraProvider = cameraProviderFuture.get()
                                val preview = Preview.Builder().build().apply {
                                    setSurfaceProvider(previewView.surfaceProvider)
                                }
                                val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
                                try {
                                    cameraProvider.unbindAll()
                                    cameraProvider.bindToLifecycle(
                                        lifecycleOwner,
                                        cameraSelector,
                                        preview
                                    )
                                } catch (e: Exception) {
                                    android.util.Log.e("TrustLensCamera", "Failed to bind camera preview use case", e)
                                }
                            }, executor)
                        }
                    )
                }

                // Draw viewfinder brackets mimicking red styling corners
                Box(
                    modifier = Modifier
                        .fillMaxSize(0.85f)
                        .border(2.dp, Color.White.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                ) {
                    // Corner Brackets represented visually
                    Box(modifier = Modifier.align(Alignment.TopStart).size(24.dp).border(width = 4.dp, color = RadiantRedSecondary, shape = RoundedCornerShape(topStart = 8.dp)))
                    Box(modifier = Modifier.align(Alignment.TopEnd).size(24.dp).border(width = 4.dp, color = RadiantRedSecondary, shape = RoundedCornerShape(topEnd = 8.dp)))
                    Box(modifier = Modifier.align(Alignment.BottomStart).size(24.dp).border(width = 4.dp, color = RadiantRedSecondary, shape = RoundedCornerShape(bottomStart = 8.dp)))
                    Box(modifier = Modifier.align(Alignment.BottomEnd).size(24.dp).border(width = 4.dp, color = RadiantRedSecondary, shape = RoundedCornerShape(bottomEnd = 8.dp)))
                }

                // Scanning line overlay with infinite bounce transition
                val infiniteTransition = rememberInfiniteTransition()
                val offsetFraction by infiniteTransition.animateFloat(
                    initialValue = 0.1f,
                    targetValue = 0.9f,
                    animationSpec = infiniteRepeatable(
                        animation = tween(durationMillis = 2000, easing = LinearEasing),
                        repeatMode = RepeatMode.Reverse
                    )
                )

                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.85f)
                        .fillMaxHeight(0.005f)
                        .align(Alignment.TopCenter)
                        .offset(y = (280 * offsetFraction).dp)
                        .background(RadiantRedSecondary)
                        .border(2.dp, RadiantRedSecondary)
                )

                if (!hasCameraPermission) {
                    Column(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.DocumentScanner,
                            contentDescription = "Scanner",
                            tint = Color.White.copy(alpha = 0.7f),
                            modifier = Modifier.size(64.dp)
                        )
                        Text(
                            text = "Tap to Enable Viewfinder Stream",
                            color = Color.White.copy(alpha = 0.8f),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                } else {
                    Text(
                        text = "Real-Time Frame Stream: Active",
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 24.dp)
                            .background(Color.Black.copy(alpha = 0.6f), RoundedCornerShape(4.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp),
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // CAMERA CAPTURE & GALLERY IMPORT CONTROLS
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(
                    onClick = {
                        val bitmap = previewViewRef?.bitmap
                        if (bitmap != null) {
                            viewModel.analyzeProduct("", "", bitmap)
                        } else {
                            if (!hasCameraPermission) {
                                permissionLauncher.launch(Manifest.permission.CAMERA)
                            } else {
                                cameraLauncher.launch(null)
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = RadiantRedSecondary),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.weight(1f).height(50.dp).testTag("capture_photo_button")
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(imageVector = Icons.Default.CheckCircle, contentDescription = "Camera Icon", tint = Color.White)
                        Text("Capture Label", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }

                Button(
                    onClick = { galleryLauncher.launch("image/*") },
                    colors = ButtonDefaults.buttonColors(containerColor = DeepBluePrimary),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.weight(1f).height(50.dp).testTag("gallery_import_button")
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(imageVector = Icons.Default.Public, contentDescription = "Gallery Icon", tint = Color.White)
                        Text("Import Gallery", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }

            // INFO ALERT TOAST
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(LowestSurfaceCommon, shape = RoundedCornerShape(12.dp))
                    .border(1.dp, NeutralOutlineVariant, RoundedCornerShape(12.dp))
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(imageVector = Icons.Default.Info, contentDescription = "Manual instruction", tint = RadiantRedSecondary)
                Text(
                    text = "Center the Nutrition Facts or Ingredients list inside the frame corners to trigger live OCR extraction.",
                    fontSize = 12.sp,
                    color = DarkOnSurfaceVariant
                )
            }

            // MANUAL KEY INGREDIENTS ENTRY
            Spacer(modifier = Modifier.height(12.dp))
            var customIngredients by remember { mutableStateOf("") }
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "Type custom product ingredients to audit:",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = DarkOnSurface
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = customIngredients,
                        onValueChange = { customIngredients = it },
                        placeholder = { Text("e.g. peanuts, dairy, sodium hexametaphosphate", fontSize = 12.sp) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = DarkOnSurface,
                            unfocusedTextColor = DarkOnSurface,
                            focusedBorderColor = DeepBluePrimary,
                            unfocusedBorderColor = NeutralOutline,
                            focusedContainerColor = LowestSurfaceCommon,
                            unfocusedContainerColor = LowestSurfaceCommon
                        )
                    )
                    Button(
                        onClick = {
                            if (customIngredients.isNotBlank()) {
                                viewModel.analyzeProduct("Manual Entry", customIngredients)
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = DeepBluePrimary),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.height(56.dp)
                    ) {
                        Text(text = "Scan", color = Color.White)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ScanDetailsView(scan: ScanEntity, onDismiss: () -> Unit, viewModel: TrustLensViewModel) {
    var activeSubTab by remember { mutableStateOf(0) } // 0 = Analysis, 1 = Clinic Maps Location, 2 = Latest Warnings Search

    val scope = rememberCoroutineScope()
    val groundingResponse by viewModel.groundingResponse.collectAsState()
    val groundingLoading by viewModel.groundingLoading.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LightBackground)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // CLOSE BUTTON + TITLE
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = "Audit Report", fontWeight = FontWeight.ExtraBold, fontSize = 24.sp, color = DeepBluePrimary)
            IconButton(onClick = onDismiss) {
                Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = RadiantRedSecondary)
            }
        }

        // DESIGN SYSTEM BENTO CARD OVERVIEW
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = LowestSurfaceCommon),
            border = BorderStroke(1.dp, NeutralOutlineVariant),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // Name
                Column {
                    Text(text = scan.productName, fontWeight = FontWeight.ExtraBold, fontSize = 22.sp, color = DarkOnSurface)
                    Text(text = scan.productSubtitle, fontSize = 14.sp, color = DarkOnSurfaceVariant)
                }

                // GAUGE METER + SCORE
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                        Text(text = "SAFETY SCORE", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = DarkOnSurfaceVariant)
                        Spacer(modifier = Modifier.height(8.dp))
                        Box(contentAlignment = Alignment.Center, modifier = Modifier.size(100.dp)) {
                            CircularProgressIndicator(
                                progress = { scan.safetyScore / 100f },
                                modifier = Modifier.fillMaxSize(),
                                strokeWidth = 8.dp,
                                color = if (scan.safetyStatus == "SAFE") Color(0xFF10B981) else RadiantRedSecondary,
                                trackColor = MediumSurfaceContainer
                            )
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(text = "${scan.safetyScore}", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, color = DarkOnSurface)
                                Text(text = "/ 100", fontSize = 11.sp, color = DarkOnSurfaceVariant)
                            }
                        }
                    }

                    Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(text = "VERDICT", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = DarkOnSurfaceVariant)
                        Box(
                            modifier = Modifier
                                .background(
                                    color = when (scan.safetyStatus) {
                                        "SAFE" -> Color(0xFFD1FAE5)
                                        "CAUTION" -> Color(0xFFFEF3C7)
                                        else -> Color(0xFFFFDAD6)
                                    },
                                    shape = RoundedCornerShape(99.dp)
                                )
                                .padding(horizontal = 14.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = scan.safetyStatus,
                                color = when (scan.safetyStatus) {
                                    "SAFE" -> Color(0xFF065F46)
                                    "CAUTION" -> Color(0xFFD97706)
                                    else -> RadiantRedSecondary
                                },
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }

                        Text(text = "AUTHENTICITY STATUS", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = DarkOnSurfaceVariant)
                        
                        val isCounterfeit = scan.authenticityLabel.contains("COUNTERFEIT")
                        val isDamaged = scan.authenticityLabel.contains("DAMAGED")
                        
                        Box(
                            modifier = Modifier
                                .background(
                                    color = when {
                                        isCounterfeit -> Color(0xFFFFDAD6)
                                        isDamaged -> Color(0xFFFEF3C7)
                                        else -> Color(0xFFD1FEFA)
                                    },
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = scan.authenticityLabel,
                                color = when {
                                    isCounterfeit -> RadiantRedSecondary
                                    isDamaged -> Color(0xFFB45309)
                                    else -> Color(0xFF0F766E)
                                },
                                fontWeight = FontWeight.Black,
                                fontSize = 11.sp
                            )
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(text = "Confidence Level:", fontSize = 11.sp, color = DarkOnSurfaceVariant)
                            Text(
                                text = String.format(Locale.US, "%.1f%%", scan.authenticityPercentage),
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = if (isCounterfeit) RadiantRedSecondary else Color(0xFF10B981)
                            )
                        }
                    }
                }
            }
        }

        // HEALTH CRITICAL BANNER
        if (scan.allergenAlertMessage.isNotBlank()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFFFDAD6), shape = RoundedCornerShape(12.dp))
                    .border(2.dp, RadiantRedSecondary, shape = RoundedCornerShape(12.dp))
                    .padding(16.dp),
                verticalAlignment = Alignment.Top,
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Icon(imageVector = Icons.Default.Warning, contentDescription = "Critical alert Icon", tint = RadiantRedSecondary)
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(text = "CRITICAL HEALTH ALERT", fontWeight = FontWeight.ExtraBold, fontSize = 12.sp, color = Color(0xFF410002))
                    Text(text = scan.allergenAlertMessage, fontSize = 13.sp, lineHeight = 18.sp, color = Color(0xFF410002))
                }
            }
        }

        // SUBTABS FOR ADVANCED GROUNDING AND DIAGNOSTICS (Search & Maps integrations)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            listOf("Safety Audit", "Nearby Laboratories", "Alert Groundings").forEachIndexed { index, title ->
                val active = activeSubTab == index
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .background(
                            color = if (active) DeepBluePrimary else LowestSurfaceCommon,
                            shape = RoundedCornerShape(8.dp)
                        )
                        .border(1.dp, NeutralOutlineVariant, RoundedCornerShape(8.dp))
                        .clickable {
                            activeSubTab = index
                            if (index == 1) {
                                viewModel.requestGrounding(scan.productName + " certified labs", true)
                            } else if (index == 2) {
                                viewModel.requestGrounding(scan.productName + " FDA alerts", false)
                            }
                        }
                        .padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = title,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (active) Color.White else DarkOnSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }

        when (activeSubTab) {
            0 -> {
                // CORE DETAILED INGREDIENTS AUDIT (Bento format avoids/cautions/safes)
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    // AVOID
                    val avoids = scan.avoidIngredients.split(",").filter { it.isNotBlank() }
                    if (avoids.isNotEmpty()) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = LowestSurfaceCommon),
                            border = BorderStroke(1.dp, RadiantRedSecondary.copy(alpha = 0.4f))
                        ) {
                            Column {
                                Box(modifier = Modifier.fillMaxWidth().background(RadiantRedSecondary).padding(12.dp)) {
                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                        Icon(imageVector = Icons.Default.Cancel, contentDescription = null, tint = Color.White)
                                        Text(text = "AVOID (${avoids.size})", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    }
                                }
                                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    avoids.forEach { avoid ->
                                        Row(
                                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(text = avoid, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                            Text(text = "Violates allergen protocol", color = RadiantRedSecondary, fontSize = 12.sp)
                                        }
                                        HorizontalDivider(color = NeutralOutlineVariant.copy(alpha = 0.4f))
                                    }
                                }
                            }
                        }
                    }

                    // CAUTION
                    val cautions = scan.cautionIngredients.split(",").filter { it.isNotBlank() }
                    if (cautions.isNotEmpty()) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = LowestSurfaceCommon),
                            border = BorderStroke(1.dp, NeutralOutline.copy(alpha = 0.4f))
                        ) {
                            Column {
                                Box(modifier = Modifier.fillMaxWidth().background(DeepBluePrimary).padding(12.dp)) {
                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                        Icon(imageVector = Icons.Default.Info, contentDescription = null, tint = Color.White)
                                        Text(text = "CAUTION (${cautions.size})", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    }
                                }
                                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    cautions.forEach { caution ->
                                        Row(
                                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(text = caution, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                            Text(text = "Additive marker to trace", color = NeutralOutline, fontSize = 12.sp)
                                        }
                                        HorizontalDivider(color = NeutralOutlineVariant.copy(alpha = 0.4f))
                                    }
                                }
                            }
                        }
                    }

                    // SAFES
                    val safes = scan.safeIngredients.split(",").filter { it.isNotBlank() }
                    if (safes.isNotEmpty()) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = LowestSurfaceCommon),
                            border = BorderStroke(1.dp, NeutralOutlineVariant)
                        ) {
                            Column {
                                Box(modifier = Modifier.fillMaxWidth().background(LowSurfaceContainer).padding(12.dp)) {
                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                        Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null, tint = DeepBluePrimary)
                                        Text(text = "SAFE BIOLOGICALS (${safes.size})", color = DeepBluePrimary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    }
                                }
                                FlowRow(modifier = Modifier.padding(16.dp), maxItemsInEachRow = 3) {
                                    safes.forEach { safe ->
                                        Box(
                                            modifier = Modifier
                                                .padding(4.dp)
                                                .background(MediumSurfaceContainer, RoundedCornerShape(99.dp))
                                                .padding(horizontal = 12.dp, vertical = 6.dp)
                                        ) {
                                            Text(text = safe, fontSize = 12.sp, color = DarkOnSurface)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Markdown report overview
                    Text(text = "Analysis Statement", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = DarkOnSurface)
                    Text(text = scan.fullMarkdownReport, fontSize = 14.sp, lineHeight = 20.sp, color = DarkOnSurfaceVariant)
                }
            }

            1, 2 -> {
                // MAPS / SEARCH GROUNDINGS VIEW
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = LowestSurfaceCommon),
                    border = BorderStroke(1.dp, NeutralOutlineVariant),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Icon(
                                imageVector = if (activeSubTab == 1) Icons.Default.Place else Icons.Default.Public,
                                contentDescription = null,
                                tint = RadiantRedSecondary
                            )
                            Text(
                                text = if (activeSubTab == 1) "Active Hospital & Clinic Groundings" else "Live search regulatory Groundings (gemini-3.5-flash)",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                        }

                        if (groundingLoading) {
                            Column(
                                modifier = Modifier.fillMaxWidth().padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                CircularProgressIndicator(color = RadiantRedSecondary)
                                Text(text = "Synchronizing grounding data...", fontSize = 12.sp, color = DarkOnSurfaceVariant)
                            }
                        } else {
                            Text(
                                text = groundingResponse,
                                fontSize = 13.sp,
                                lineHeight = 18.sp,
                                color = DarkOnSurface
                            )
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun FlowRow(
    modifier: Modifier = Modifier,
    maxItemsInEachRow: Int = 3,
    content: @Composable androidx.compose.foundation.layout.FlowRowScope.() -> Unit
) {
    androidx.compose.foundation.layout.FlowRow(
        modifier = modifier,
        maxItemsInEachRow = maxItemsInEachRow,
        content = content
    )
}

@Composable
fun HistoryScreen(viewModel: TrustLensViewModel) {
    val scans by viewModel.allScans.collectAsState()
    var searchQuery by remember { mutableStateOf("") }

    val filteredScans = if (searchQuery.isBlank()) scans else {
        scans.filter { it.productName.contains(searchQuery, ignoreCase = true) }
    }

    Scaffold(
        containerColor = Color.White,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { viewModel.setTab(DashboardTab.Scan) },
                containerColor = RadiantRedSecondary,
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier.testTag("scan_new_fab")
            ) {
                Icon(imageVector = Icons.Default.DocumentScanner, contentDescription = "Scan New")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White)
                .padding(innerPadding)
                .padding(16.dp)
                .testTag("history_screen_content"),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // SEARCH & FILTER BAR
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search scan history...", color = DarkOnSurfaceVariant) },
                    leadingIcon = { Icon(imageVector = Icons.Default.Search, contentDescription = "Search icon", tint = DarkOnSurface) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = DarkOnSurface,
                        unfocusedTextColor = DarkOnSurface,
                        focusedBorderColor = RadiantRedSecondary,
                        unfocusedBorderColor = NeutralOutline,
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    ),
                    singleLine = true
                )
                Button(
                    onClick = { /* Simulated filter actions */ },
                    colors = ButtonDefaults.buttonColors(containerColor = DeepBluePrimary),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.height(56.dp)
                ) {
                    Text(text = "Filter", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }

            // LIST HEADER
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recent Scans",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = DarkOnSurfaceVariant
                )
                Text(
                    text = "Showing ${filteredScans.size} items",
                    fontSize = 12.sp,
                    color = NeutralOutline
                )
            }

            if (filteredScans.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(text = "No history matches your search query.", color = DarkOnSurfaceVariant)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredScans) { scan ->
                        AuditHistoryCard(scan = scan, onClick = {
                            // Trigger scanning details output
                            viewModel.setTab(DashboardTab.Scan)
                            // Simulate analysis triggered directly
                            viewModel.analyzeProduct(scan.productName, scan.avoidIngredients + "," + scan.cautionIngredients)
                        })
                    }
                }
            }
        }
    }
}

@Composable
fun ProfileScreen(viewModel: TrustLensViewModel) {
    val userProfile by viewModel.userProfile.collectAsState()
    val scans by viewModel.allScans.collectAsState()

    val isSyncing by viewModel.isSyncingWithFirestore.collectAsState()
    val syncError by viewModel.firestoreSyncError.collectAsState()
    val isDeleting by viewModel.isDeletingAccount.collectAsState()
    val deletionMsg by viewModel.deletionMessage.collectAsState()

    var quickQuestion by remember { mutableStateOf("") }
    val chatResponse by viewModel.chatResponse.collectAsState()
    val chatLoading by viewModel.chatLoading.collectAsState()

    val scope = rememberCoroutineScope()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("profile_screen_content")
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // USER PROFILE CARD
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = LowestSurfaceCommon),
                border = BorderStroke(1.dp, NeutralOutlineVariant),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .background(LowSurfaceContainer, CircleShape)
                            .border(2.dp, RadiantRedSecondary, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(imageVector = Icons.Default.Person, contentDescription = "Avatar icon", tint = DeepBluePrimary, modifier = Modifier.size(40.dp))
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = (userProfile?.securityTier ?: "Tier 3: Clinical Administrator").uppercase(),
                            color = RadiantRedSecondary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = userProfile?.name ?: "Clinical Partner",
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp,
                            color = DarkOnSurface
                        )
                        Text(
                            text = userProfile?.email?.ifEmpty { "user@example.com" } ?: "user@example.com",
                            fontSize = 12.sp,
                            color = DarkOnSurfaceVariant,
                            modifier = Modifier.padding(vertical = 2.dp)
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text(text = "Member since 2023", fontSize = 11.sp, color = DarkOnSurfaceVariant)
                            Box(modifier = Modifier.size(4.dp).background(NeutralOutline, CircleShape))
                            Text(text = "ID: TL-99201", fontSize = 11.sp, color = DarkOnSurfaceVariant)
                        }
                    }
                }
            }
        }

        // CLINICAL STATS
        item {
            val totalScannedCount = scans.size
            val alertsSavedCount = scans.count { it.safetyStatus == "UNSAFE" }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(containerColor = DeepBluePrimary)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(text = "TOTAL SCANNED", color = GoldTertiary, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(text = "$totalScannedCount", color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 28.sp)
                    }
                }

                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(containerColor = RadiantRedSecondary)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(text = "ALERTS SAVED", color = Color.White.copy(alpha = 0.8f), fontWeight = FontWeight.Bold, fontSize = 11.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(text = "$alertsSavedCount", color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 28.sp)
                    }
                }
            }
        }

        // HEALTH PROFILE SETTINGS (Editable checkchips)
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = LowestSurfaceCommon),
                border = BorderStroke(1.dp, NeutralOutlineVariant),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(text = "HEALTH PROFILE CHIPS", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = DarkOnSurface)
                    Text(text = "Directly update monitored databases to tweak safety checks instantly in Room:", fontSize = 12.sp, color = DarkOnSurfaceVariant)
                    
                    var allergies by remember { mutableStateOf("") }
                    var conditions by remember { mutableStateOf("") }

                    LaunchedEffect(userProfile) {
                        userProfile?.let {
                            allergies = it.allergies
                            conditions = it.conditions
                        }
                    }

                    OutlinedTextField(
                        value = allergies,
                        onValueChange = {
                            allergies = it
                            viewModel.updateProfileDirect(allergies, conditions)
                        },
                        label = { Text("Monitored Allergies (comma separated)") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = DarkOnSurface,
                            unfocusedTextColor = DarkOnSurface,
                            focusedBorderColor = DeepBluePrimary,
                            unfocusedBorderColor = NeutralOutline,
                            focusedContainerColor = LowestSurfaceCommon,
                            unfocusedContainerColor = LowestSurfaceCommon
                        )
                    )

                    OutlinedTextField(
                        value = conditions,
                        onValueChange = {
                            conditions = it
                            viewModel.updateProfileDirect(allergies, conditions)
                        },
                        label = { Text("Monitored Conditions (comma separated)") },
                        modifier = Modifier.fillMaxWidth(),
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

        // FAST LITE ASSISTANT (gemini-3.1-flash-lite)
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = HighestSurfaceContainer),
                border = BorderStroke(1.dp, NeutralOutlineVariant),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(imageVector = Icons.Default.Bolt, contentDescription = "Fast assistant logo", tint = RadiantRedSecondary)
                        Text(text = "Low-Latency Clinical Chat (3.1-flash-lite)", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                    Text(text = "Ask any fast safety question for snappy (1-2 sentences) medical guidance:", fontSize = 12.sp, color = DarkOnSurfaceVariant)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = quickQuestion,
                            onValueChange = { quickQuestion = it },
                            placeholder = { Text("e.g. Is Sodium Hexametaphosphate safe?") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = DarkOnSurface,
                                unfocusedTextColor = DarkOnSurface,
                                focusedBorderColor = DeepBluePrimary,
                                unfocusedBorderColor = NeutralOutline,
                                focusedContainerColor = LowestSurfaceCommon,
                                unfocusedContainerColor = LowestSurfaceCommon
                            )
                        )
                        Button(
                            onClick = {
                                if (quickQuestion.isNotBlank()) {
                                    viewModel.askQuickAssistant(quickQuestion)
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = RadiantRedSecondary),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(text = "Ask", color = Color.White)
                        }
                    }

                    if (chatLoading) {
                        CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp, color = RadiantRedSecondary)
                    } else if (chatResponse.isNotBlank()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(LowestSurfaceCommon, RoundedCornerShape(8.dp))
                                .padding(12.dp)
                        ) {
                            Text(text = chatResponse, fontSize = 13.sp, color = DarkOnSurface)
                        }
                    }
                }
            }
        }

        // DATA SECURITY PROTECTION BANNER
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = LowestSurfaceCommon),
                border = BorderStroke(1.dp, NeutralOutlineVariant),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Icon(imageVector = Icons.Default.Lock, contentDescription = "Shield Lock", tint = DeepBluePrimary)
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(text = "Data Protection Guard", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = DeepBluePrimary)
                        Text(text = "Your health parameters are fully encrypted with AES-256 protocols and never shared without explicit consent. fully HIPAA Compliant.", fontSize = 12.sp, color = DarkOnSurfaceVariant)
                    }
                }
            }
        }

        // SIGN OUT OR CLEAR DATABASE
        item {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Button(
                    onClick = { viewModel.clearAllScans() },
                    colors = ButtonDefaults.outlinedButtonColors(),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, RadiantRedSecondary),
                    modifier = Modifier.fillMaxWidth().height(48.dp)
                ) {
                    Text(text = "Clear Audit History Database", color = RadiantRedSecondary, fontWeight = FontWeight.Bold)
                }

                if (isDeleting) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)
                    ) {
                        CircularProgressIndicator(color = RadiantRedSecondary)
                        Text(
                            text = deletionMsg ?: "Wiping cloud profile and Firestore documents...",
                            fontSize = 12.sp,
                            color = RadiantRedSecondary,
                            fontWeight = FontWeight.Bold
                        )
                    }
                } else {
                    Button(
                        onClick = { viewModel.requestAccountDeletion() },
                        colors = ButtonDefaults.buttonColors(containerColor = RadiantRedSecondary),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth().height(48.dp).testTag("delete_account_button")
                    ) {
                        Text(text = "Request Account Data Deletion", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }

                Button(
                    onClick = { viewModel.signOut() },
                    colors = ButtonDefaults.outlinedButtonColors(),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, DeepBluePrimary),
                    modifier = Modifier.fillMaxWidth().height(48.dp)
                ) {
                    Text(text = "Logout", color = DeepBluePrimary, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun AuditHistoryCard(scan: ScanEntity, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = LowestSurfaceCommon),
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, NeutralOutlineVariant)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .background(LowSurfaceContainer, RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (scan.safetyStatus == "SAFE") Icons.Default.CheckCircle else Icons.Default.Cancel,
                    contentDescription = null,
                    tint = if (scan.safetyStatus == "SAFE") Color(0xFF10B981) else RadiantRedSecondary,
                    modifier = Modifier.size(32.dp)
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = scan.productName,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = DarkOnSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = SimpleDateFormat("MMM dd, yyyy • HH:mm", Locale.getDefault()).format(Date(scan.timestamp)),
                    fontSize = 12.sp,
                    color = DarkOnSurfaceVariant
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.padding(top = 4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .background(
                                color = if (scan.safetyStatus == "SAFE") Color(0xFFD1FAE5) else LowSurfaceContainer,
                                shape = RoundedCornerShape(4.dp)
                            )
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = scan.safetyStatus,
                            color = if (scan.safetyStatus == "SAFE") Color(0xFF065F46) else RadiantRedSecondary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        )
                    }
                    Text(text = "Score: ${scan.safetyScore}/100", fontSize = 11.sp, color = DarkOnSurfaceVariant)
                }
            }

            Icon(
                imageVector = Icons.Default.ArrowForwardIos,
                contentDescription = "Navigate to scanner details",
                tint = NeutralOutlineVariant,
                modifier = Modifier.size(16.dp)
            )
        }
    }
}

val PlayPrimaryColor = Color(0xFF3B82F6)
