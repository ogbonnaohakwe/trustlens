import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors } from '../constants/theme';
import { useTrustLens } from '../context/TrustLensContext';

export default function AuthScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const {
    loginWithEmailOrOnboard,
    loginInProgress,
    isDarkMode,
    userProfile,
  } = useTrustLens();

  // If already logged in, route straight to dashboard
  useEffect(() => {
    if (userProfile && userProfile.isLoggedIn === 1 && userProfile.email) {
      router.replace('/(tabs)');
    }
  }, [userProfile, router]);

  // Mode: 'register' | 'login'
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status & Modals
  const [errorMessage, setErrorMessage] = useState('');
  const [termsVisible, setTermsVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  // Responsive sizing
  const maxContentWidth = Math.min(width - 32, 460);
  const currentBg = isDarkMode ? BrandColors.dark.background : BrandColors.light.background;
  const currentCard = isDarkMode ? BrandColors.dark.card : BrandColors.light.card;
  const currentBorder = isDarkMode ? BrandColors.dark.surfaceBorder : BrandColors.light.surfaceBorder;
  const currentText = isDarkMode ? BrandColors.dark.text : BrandColors.light.text;
  const currentMuted = isDarkMode ? BrandColors.dark.textSecondary : BrandColors.light.textSecondary;

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (!password.trim() || password.trim().length < 6) {
      setErrorMessage('Security PIN / Password must be at least 6 characters.');
      return;
    }

    if (!agreeTerms && authMode === 'register') {
      setErrorMessage('Please accept the Clinical Terms of Service to register.');
      return;
    }

    setErrorMessage('');

    try {
      const destination = await loginWithEmailOrOnboard(
        email.trim().toLowerCase()
      );

      if (destination === 'dashboard') {
        router.replace('/(tabs)');
      } else {
        router.push('/setup/step1');
      }
    } catch {
      router.push('/setup/step1');
    }
  };

  const canGoBack = router.canGoBack();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentBg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { alignItems: 'center' }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.container, { width: maxContentWidth }]}>
            {/* Top Brand Header */}
            <View style={styles.topNavRow}>
              {canGoBack ? (
                <TouchableOpacity
                  style={[styles.backBtn, { backgroundColor: currentCard, borderColor: currentBorder }]}
                  onPress={() => router.back()}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-back" size={20} color={currentText} />
                </TouchableOpacity>
              ) : (
                <View style={{ width: 40 }} />
              )}

              <View style={styles.brandRow}>
                <Image
                  source={require('../../assets/tplus.png')}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
                <Text style={[styles.logoText, { color: currentText }]}>TrustLenAI</Text>
              </View>

              <View style={{ width: 40 }} />
            </View>

            {/* Title & Subtitle */}
            <View style={styles.headerBlock}>
              <Text style={[styles.headline, { color: currentText }]}>
                {authMode === 'register' ? 'Create Account' : 'Welcome Back'}
              </Text>
              <Text style={[styles.subheadline, { color: currentMuted }]}>
                {authMode === 'register'
                  ? 'Join thousands protecting their families from unverified medications.'
                  : 'Access your clinical records, saved scans, and verified history.'}
              </Text>
            </View>

            {/* Segmented Switch: Register vs Sign In */}
            <View style={[styles.segmentedContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}>
              <TouchableOpacity
                style={[
                  styles.segmentedTab,
                  authMode === 'register' && styles.segmentedTabActive,
                ]}
                onPress={() => {
                  setAuthMode('register');
                  setErrorMessage('');
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentedTabText,
                    authMode === 'register' && styles.segmentedTabTextActive,
                  ]}
                >
                  Register
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentedTab,
                  authMode === 'login' && styles.segmentedTabActive,
                ]}
                onPress={() => {
                  setAuthMode('login');
                  setErrorMessage('');
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentedTabText,
                    authMode === 'login' && styles.segmentedTabTextActive,
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Card */}
            <View style={[styles.formCard, { backgroundColor: currentCard, borderColor: currentBorder }]}>
              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={18} color="#EF4444" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}



              {/* Email Field */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: currentText }]}>Email Address</Text>
                <View style={[styles.inputWrapper, { borderColor: currentBorder, backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }]}>
                  <Ionicons name="mail-outline" size={18} color={currentMuted} />
                  <TextInput
                    style={[styles.inputField, { color: currentText }]}
                    placeholder="name@email.com"
                    placeholderTextColor={currentMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Password / Access Key */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: currentText }]}>Password or Security PIN</Text>
                <View style={[styles.inputWrapper, { borderColor: currentBorder, backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={currentMuted} />
                  <TextInput
                    style={[styles.inputField, { color: currentText }]}
                    placeholder="••••••••••••"
                    placeholderTextColor={currentMuted}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>

              {/* Agreement Checkbox (Register only) */}
              {authMode === 'register' && (
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setAgreeTerms(!agreeTerms)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={agreeTerms ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={agreeTerms ? (isDarkMode ? '#F8FAFC' : '#111418') : currentMuted}
                  />
                  <Text style={[styles.checkboxText, { color: currentMuted }]}>
                    I accept the{' '}
                    <Text
                      style={{ color: currentText, fontWeight: '700', textDecorationLine: 'underline' }}
                      onPress={() => setTermsVisible(true)}
                    >
                      Clinical Terms
                    </Text>{' '}
                    and{' '}
                    <Text
                      style={{ color: currentText, fontWeight: '700', textDecorationLine: 'underline' }}
                      onPress={() => setPrivacyVisible(true)}
                    >
                      Privacy Protocol
                    </Text>
                  </Text>
                </TouchableOpacity>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={loginInProgress}
                activeOpacity={0.85}
              >
                {loginInProgress ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>
                      {authMode === 'register' ? 'Register Account' : 'Sign In'}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Quick Guest Skip */}
            <TouchableOpacity
              style={styles.guestLink}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.8}
            >
              <Text style={[styles.guestLinkText, { color: currentMuted }]}>
                Skip registration and test features as Guest
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Terms Modal */}
      <Modal visible={termsVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentCard, borderColor: currentBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentText }]}>Terms of Service</Text>
              <TouchableOpacity onPress={() => setTermsVisible(false)}>
                <Ionicons name="close" size={24} color={currentMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={[styles.modalParagraph, { color: currentText }]}>
                TrustLens AI provides automated cross-examinations of pharmaceutical formulations and official database registry records. It is an auxiliary safety reference and does not substitute professional medical diagnosis.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Modal */}
      <Modal visible={privacyVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentCard, borderColor: currentBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentText }]}>Privacy Notice</Text>
              <TouchableOpacity onPress={() => setPrivacyVisible(false)}>
                <Ionicons name="close" size={24} color={currentMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={[styles.modalParagraph, { color: currentText }]}>
                Clinical profiles, allergen entries, and medical condition tags are stored locally on your device with optional encrypted cloud backup. Scanned images are processed ephemerally without persistent retention.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    alignSelf: 'center',
  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImg: {
    width: 30,
    height: 30,
  },
  logoText: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerBlock: {
    marginBottom: 20,
  },
  headline: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subheadline: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
  },
  segmentedTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  segmentedTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentedTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentedTabTextActive: {
    color: '#111418',
    fontWeight: '800',
  },
  formCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 13,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 20,
  },
  checkboxText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  submitBtn: {
    height: 52,
    backgroundColor: '#111418',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  guestLink: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestLinkText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalScroll: {
    paddingBottom: 24,
  },
  modalParagraph: {
    fontSize: 13,
    lineHeight: 20,
  },
});
