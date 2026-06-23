package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.example.ui.*
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
  private val viewModel: TrustLensViewModel by viewModels()

  @OptIn(ExperimentalMaterial3Api::class)
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        Surface(modifier = Modifier.fillMaxSize()) {
          val screenState by viewModel.screenState.collectAsState()
          val userProfile by viewModel.userProfile.collectAsState()

          AnimatedContent(
            targetState = screenState,
            label = "screen_transition",
            transitionSpec = {
              slideInHorizontally { width -> width } + fadeIn() togetherWith
                  slideOutHorizontally { width -> -width } + fadeOut()
            }
          ) { targetState ->
            when (targetState) {
              ScreenState.Welcome -> {
                WelcomeScreen(
                  viewModel = viewModel,
                  onNavigateToAccess = { viewModel.navigateTo(ScreenState.AccessSystem) }
                )
              }
              ScreenState.AccessSystem -> {
                AccessSystemScreen(
                  viewModel = viewModel,
                  onSearchClick = { email, name, pass -> viewModel.loginWithEmailOrOnboard(email, name, pass) }
                )
              }
              ScreenState.SetupStep1 -> {
                SetupStep1Screen(
                  viewModel = viewModel,
                  onNext = { name, age, gender ->
                    val email = userProfile?.email?.ifEmpty { "user@example.com" } ?: "user@example.com"
                    viewModel.selectUserProfile(
                      name = name,
                      email = email,
                      age = age,
                      gender = gender,
                      country = "United States",
                      allergies = emptyList(),
                      conditions = emptyList()
                    )
                    viewModel.navigateTo(ScreenState.SetupStep2)
                  }
                )
              }
              ScreenState.SetupStep2 -> {
                SetupStep2Screen(
                  viewModel = viewModel,
                  onNext = { allergies ->
                    val user = viewModel.userProfile.value
                    viewModel.updateProfileDirect(
                      allergies = allergies.joinToString(","),
                      conditions = user?.conditions ?: ""
                    )
                    viewModel.navigateTo(ScreenState.SetupStep3)
                  }
                )
              }
              ScreenState.SetupStep3 -> {
                SetupStep3Screen(
                  viewModel = viewModel,
                  onSubmit = { conditions ->
                    val user = viewModel.userProfile.value
                    viewModel.updateProfileDirect(
                      allergies = user?.allergies ?: "",
                      conditions = conditions.joinToString(",")
                    )
                    viewModel.navigateTo(ScreenState.Dashboard)
                  }
                )
              }
              ScreenState.Dashboard -> {
                DashboardTabsScreen(viewModel = viewModel)
              }
            }
          }
        }
      }
    }
  }
}

