import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormattedReportText } from '../../components/FormattedReportText';
import { NafdacVerificationCard } from '../../components/NafdacVerificationCard';
import { BrandColors, getCardGrid } from '../../constants/theme';
import { useTrustLens } from '../../context/TrustLensContext';

export default function ScanTab() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ productName?: string; nafdacNumber?: string }>();
  const { width } = useWindowDimensions();
  const {
    analyzeProduct,
    isAnalyzing,
    activeScanResult,
    clearActiveScan,
    analysisError,
    isDarkMode,
  } = useTrustLens();

  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [productName, setProductName] = useState('');
  const [nafdacNumber, setNafdacNumber] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  // Ingest incoming router params (e.g. from NAFDAC Greenbook verification)
  useEffect(() => {
    if (searchParams?.productName) {
      setProductName(searchParams.productName);
      setScanMode('manual');
    }
    if (searchParams?.nafdacNumber) {
      setNafdacNumber(searchParams.nafdacNumber);
      setScanMode('manual');
    }
  }, [searchParams?.productName, searchParams?.nafdacNumber]);

  const maxContentWidth = Math.min(width - 32, 580);
  const currentBg = isDarkMode ? BrandColors.dark.background : BrandColors.light.background;
  const currentCard = isDarkMode ? BrandColors.dark.card : BrandColors.light.card;
  const currentBorder = isDarkMode ? BrandColors.dark.surfaceBorder : BrandColors.light.surfaceBorder;
  const currentText = isDarkMode ? BrandColors.dark.text : BrandColors.light.text;
  const currentMuted = isDarkMode ? BrandColors.dark.textSecondary : BrandColors.light.textSecondary;

  const cards = getCardGrid(isDarkMode);

  const pickImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera access is required to photograph packaging.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Gallery access is required to select photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
          base64: true,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImageUri(asset.uri);
        setSelectedImageBase64(asset.base64 || null);
        if (!productName) {
          setProductName('Scanned Packaging');
        }
      }
    } catch {
      Alert.alert('Error', 'Could not open camera or gallery.');
    }
  };

  const handleStartAnalysis = async () => {
    if (scanMode === 'camera' && !selectedImageBase64) {
      Alert.alert(
        'No Image Selected',
        'Please take a photo or upload an image of the packaging, or switch to the Manual Entry tab.'
      );
      return;
    }

    if (scanMode === 'manual' && !productName.trim() && !ingredientsText.trim() && !nafdacNumber.trim()) {
      Alert.alert(
        'Missing Details',
        'Please enter a product name, active ingredients, or NAFDAC registration number.'
      );
      return;
    }

    await analyzeProduct({
      productName: productName.trim() || 'Scanned Product',
      ingredientsText: ingredientsText.trim(),
      base64Image: selectedImageBase64 || undefined,
      nafdacNumber: nafdacNumber.trim() || undefined,
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentBg }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { alignItems: 'center' }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { width: maxContentWidth }]}>
          {/* Header */}
          <View style={styles.topHeader}>
            <View>
              <Text style={[styles.headerTitle, { color: currentText }]}>Forensic Scan</Text>
              <Text style={[styles.headerSubtitle, { color: currentMuted }]}>
                Optical character recognition & authenticity verification
              </Text>
            </View>
            {activeScanResult && (
              <TouchableOpacity
                style={[styles.clearBtn, { borderColor: currentBorder }]}
                onPress={() => {
                  clearActiveScan();
                  setSelectedImageUri(null);
                  setSelectedImageBase64(null);
                  setProductName('');
                  setNafdacNumber('');
                  setIngredientsText('');
                }}
              >
                <Ionicons name="refresh-outline" size={18} color={currentMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Camera / Manual Input UI */}
          {!activeScanResult && (
            <View style={[styles.scanCard, { backgroundColor: currentCard, borderColor: currentBorder }]}>
              {/* Scan Mode Toggle */}
              <View style={[styles.modeToggleRow, { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}>
                <TouchableOpacity
                  style={[styles.modeToggleTab, scanMode === 'camera' && styles.modeToggleTabActive]}
                  onPress={() => setScanMode('camera')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="camera-outline"
                    size={16}
                    color={scanMode === 'camera' ? '#FFFFFF' : currentMuted}
                  />
                  <Text
                    style={[
                      styles.modeToggleText,
                      scanMode === 'camera' && styles.modeToggleTextActive,
                      { color: scanMode === 'camera' ? '#FFFFFF' : currentMuted },
                    ]}
                  >
                    Camera / Photo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeToggleTab, scanMode === 'manual' && styles.modeToggleTabActive]}
                  onPress={() => setScanMode('manual')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="create-outline"
                    size={16}
                    color={scanMode === 'manual' ? '#FFFFFF' : currentMuted}
                  />
                  <Text
                    style={[
                      styles.modeToggleText,
                      scanMode === 'manual' && styles.modeToggleTextActive,
                      { color: scanMode === 'manual' ? '#FFFFFF' : currentMuted },
                    ]}
                  >
                    Manual
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Param notice if routed from NAFDAC Greenbook */}
              {nafdacNumber ? (
                <View style={styles.greenbookNoticePill}>
                  <Ionicons name="shield-checkmark" size={16} color="#059669" />
                  <Text style={styles.greenbookNoticeText} numberOfLines={1}>
                    Imported from NAFDAC Greenbook: {nafdacNumber}
                  </Text>
                </View>
              ) : null}

              {scanMode === 'camera' ? (
                <>
                  {selectedImageUri ? (
                    <View style={styles.previewContainer}>
                      <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
                      <TouchableOpacity
                        style={styles.retakeBtn}
                        onPress={() => {
                          setSelectedImageUri(null);
                          setSelectedImageBase64(null);
                        }}
                      >
                        <Ionicons name="close-circle" size={26} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.photoActionRow}>
                      <TouchableOpacity
                        style={[styles.photoActionBtn, { backgroundColor: cards.sage.bg, borderColor: cards.sage.border, borderWidth: 1 }]}
                        onPress={() => pickImage(true)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="camera" size={28} color={cards.sage.iconColor} />
                        <Text style={[styles.photoActionText, { color: cards.sage.title }]}>Take Camera Photo</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.photoActionBtn, { backgroundColor: cards.yellow.bg, borderColor: cards.yellow.border, borderWidth: 1 }]}
                        onPress={() => pickImage(false)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="images" size={28} color={cards.yellow.iconColor} />
                        <Text style={[styles.photoActionText, { color: cards.yellow.title }]}>Upload from Gallery</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Optional Product Name */}
                  <View style={styles.nameInputBox}>
                    <Text style={[styles.inputLabel, { color: currentText }]}>Product Label (Optional)</Text>
                    <TextInput
                      style={[styles.textInput, { color: currentText, borderColor: currentBorder }]}
                      placeholder="e.g. Augmentin 625mg or Paracetamol"
                      placeholderTextColor={currentMuted}
                      value={productName}
                      onChangeText={setProductName}
                    />
                  </View>
                </>
              ) : (
                /* Manual Formulation Mode */
                <View style={{ gap: 12 }}>
                  <View>
                    <Text style={[styles.inputLabel, { color: currentText }]}>Product Name</Text>
                    <TextInput
                      style={[styles.textInput, { color: currentText, borderColor: currentBorder }]}
                      placeholder="e.g. Baby Greenlin Cough Syrup"
                      placeholderTextColor={currentMuted}
                      value={productName}
                      onChangeText={setProductName}
                    />
                  </View>

                  <View>
                    <Text style={[styles.inputLabel, { color: currentText }]}>NAFDAC Reg. No (Optional)</Text>
                    <TextInput
                      style={[styles.textInput, { color: currentText, borderColor: currentBorder }]}
                      placeholder="e.g. A4-1079 or B4-4561"
                      placeholderTextColor={currentMuted}
                      value={nafdacNumber}
                      onChangeText={setNafdacNumber}
                      autoCapitalize="characters"
                    />
                  </View>

                  <View>
                    <Text style={[styles.inputLabel, { color: currentText }]}>Ingredients / Label Formulation</Text>
                    <TextInput
                      style={[styles.textInputArea, { color: currentText, borderColor: currentBorder }]}
                      placeholder="e.g. Paracetamol, Diphenhydramine, Ammonium Chloride, Sodium Benzoate..."
                      placeholderTextColor={currentMuted}
                      value={ingredientsText}
                      onChangeText={setIngredientsText}
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.analyzeBtn}
                onPress={handleStartAnalysis}
                disabled={isAnalyzing}
                activeOpacity={0.85}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                    <Text style={styles.analyzeBtnText}>Run Forensic Scan</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}


          {/* Analysis Error */}
          {analysisError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.errorBoxText}>{analysisError}</Text>
            </View>
          ) : null}

          {/* ACTIVE SCAN REPORT RESULTS */}
          {activeScanResult && (
            <View style={styles.resultsContainer}>
              {/* Top Score Banner */}
              <View
                style={[
                  styles.scoreCard,
                  activeScanResult.safetyStatus === 'SAFE' && {
                    backgroundColor: cards.green.bg,
                    borderColor: cards.green.border,
                  },
                  activeScanResult.safetyStatus === 'CAUTION' && {
                    backgroundColor: cards.yellow.bg,
                    borderColor: cards.yellow.border,
                  },
                  activeScanResult.safetyStatus === 'UNSAFE' && {
                    backgroundColor: cards.danger.bg,
                    borderColor: cards.danger.border,
                  },
                ]}
              >
                <View style={styles.scoreTopRow}>
                  <View style={[styles.scoreBadge, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
                    <Text style={[styles.scoreNumber, { color: isDarkMode ? '#F1F5F9' : '#111418' }]}>
                      {activeScanResult.safetyScore}
                    </Text>
                    <Text style={[styles.scoreOutOf, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>/100</Text>
                  </View>
                  <View style={[styles.scoreStatusPill, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
                    <Text
                      style={[
                        styles.scoreStatusText,
                        {
                          color:
                            activeScanResult.safetyStatus === 'SAFE'
                              ? cards.green.iconColor
                              : activeScanResult.safetyStatus === 'CAUTION'
                                ? cards.yellow.iconColor
                                : cards.danger.iconColor,
                        },
                      ]}
                    >
                      {activeScanResult.safetyStatus}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.resultProductName,
                    {
                      color:
                        activeScanResult.safetyStatus === 'SAFE'
                          ? cards.green.title
                          : activeScanResult.safetyStatus === 'CAUTION'
                            ? cards.yellow.title
                            : cards.danger.title,
                    },
                  ]}
                >
                  {activeScanResult.productName}
                </Text>

                {activeScanResult.allergenAlertMessage ? (
                  <View style={styles.allergenAlertRow}>
                    <Ionicons name="warning" size={18} color="#EF4444" />
                    <Text style={[styles.allergenAlertText, { color: cards.danger.title }]}>
                      {activeScanResult.allergenAlertMessage}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Categorized Ingredients */}
              {activeScanResult.avoidIngredients.length > 0 && (
                <View style={[styles.ingBox, { backgroundColor: cards.danger.bg, borderColor: cards.danger.border }]}>
                  <Text style={[styles.ingBoxTitle, { color: cards.danger.title }]}>
                    🚫 Avoid / Dangerous Substances ({activeScanResult.avoidIngredients.length})
                  </Text>
                  <View style={styles.ingTagsWrap}>
                    {activeScanResult.avoidIngredients.map((ing, i) => (
                      <View key={i} style={[styles.ingTag, { backgroundColor: isDarkMode ? '#3E151A' : '#FEE2E2', borderColor: cards.danger.border }]}>
                        <Text style={[styles.ingTagText, { color: cards.danger.title }]}>{ing}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {activeScanResult.cautionIngredients.length > 0 && (
                <View style={[styles.ingBox, { backgroundColor: cards.yellow.bg, borderColor: cards.yellow.border }]}>
                  <Text style={[styles.ingBoxTitle, { color: cards.yellow.title }]}>
                    ⚠️ Caution / Clinical Monitoring ({activeScanResult.cautionIngredients.length})
                  </Text>
                  <View style={styles.ingTagsWrap}>
                    {activeScanResult.cautionIngredients.map((ing, i) => (
                      <View key={i} style={[styles.ingTag, { backgroundColor: isDarkMode ? '#362A13' : '#FEF3C7', borderColor: cards.yellow.border }]}>
                        <Text style={[styles.ingTagText, { color: cards.yellow.title }]}>{ing}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {activeScanResult.safeIngredients.length > 0 && (
                <View style={[styles.ingBox, { backgroundColor: cards.sage.bg, borderColor: cards.sage.border }]}>
                  <Text style={[styles.ingBoxTitle, { color: cards.sage.title }]}>
                    ✅ Verified / Compatible Substances ({activeScanResult.safeIngredients.length})
                  </Text>
                  <View style={styles.ingTagsWrap}>
                    {activeScanResult.safeIngredients.map((ing, i) => (
                      <View key={i} style={[styles.ingTag, { backgroundColor: isDarkMode ? '#183328' : '#FFFFFF', borderColor: cards.sage.border }]}>
                        <Text style={[styles.ingTagText, { color: cards.sage.title }]}>{ing}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* NAFDAC Official Verification Callout Banner */}
              {activeScanResult.nafdacNumber ? (
                <View
                  style={[
                    styles.nafdacBanner,
                    {
                      backgroundColor: activeScanResult.nafdacVerified
                        ? isDarkMode
                          ? 'rgba(16, 185, 129, 0.12)'
                          : '#ECFDF5'
                        : isDarkMode
                          ? 'rgba(239, 68, 68, 0.12)'
                          : '#FEF2F2',
                      borderColor: activeScanResult.nafdacVerified ? '#10B981' : '#EF4444',
                    },
                  ]}
                >
                  <View style={styles.nafdacBannerTop}>
                    <View style={styles.nafdacBadge}>
                      <Ionicons
                        name={activeScanResult.nafdacVerified ? 'shield-checkmark' : 'alert-circle'}
                        size={18}
                        color={activeScanResult.nafdacVerified ? '#10B981' : '#EF4444'}
                      />
                      <Text
                        style={[
                          styles.nafdacBadgeText,
                          { color: activeScanResult.nafdacVerified ? '#10B981' : '#EF4444' },
                        ]}
                      >
                        {activeScanResult.nafdacVerified
                          ? 'OFFICIAL NAFDAC REGISTRATION VERIFIED'
                          : 'UNREGISTERED NAFDAC NUMBER'}
                      </Text>
                    </View>
                    <View style={[styles.nafdacNrnPill, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
                      <Text style={[styles.nafdacNrnText, { color: currentText }]}>
                        NRN: {activeScanResult.nafdacNumber}
                      </Text>
                    </View>
                  </View>

                  {activeScanResult.nafdacApplicant ? (
                    <Text style={[styles.nafdacApplicantText, { color: currentText }]}>
                      Licensed Licensee: {activeScanResult.nafdacApplicant}
                    </Text>
                  ) : null}

                  <Text style={[styles.nafdacStatusNote, { color: currentMuted }]}>
                    {activeScanResult.nafdacVerified
                      ? `Status: ${activeScanResult.nafdacStatus || 'Active'} • Greenbook National Registry Match`
                      : 'Warning: This product registration number was not found in the official NAFDAC Greenbook.'}
                  </Text>
                </View>
              ) : null}

              {/* Clinical Markdown Report without raw markdown markers */}
              <View style={[styles.reportCard, { backgroundColor: currentCard, borderColor: currentBorder }]}>
                <Text style={[styles.reportCardTitle, { color: currentText }]}>
                  Clinical Summary & Rationale
                </Text>
                <FormattedReportText
                  reportText={activeScanResult.summaryReport}
                  isDarkMode={isDarkMode}
                  textColor={currentText}
                />
              </View>

              {/* NAFDAC Verification Card with prefilled detected NRN/product */}
              <NafdacVerificationCard
                isDarkMode={isDarkMode}
                initialNrn={activeScanResult.nafdacNumber}
                initialProductName={activeScanResult.productName}
              />

              {/* Dual Action Buttons: Ask AI & New Scan */}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                <TouchableOpacity
                  style={[styles.newScanBtn, { flex: 1, backgroundColor: BrandColors.primary }]}
                  onPress={() => router.push('/ask-ai')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.newScanBtnText}>Ask AI</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.newScanBtn, { flex: 1, backgroundColor: '#111418' }]}
                  onPress={() => clearActiveScan()}
                  activeOpacity={0.85}
                >
                  <Ionicons name="scan-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.newScanBtnText}>New Scan</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Bottom spacing for floating dock */}
          <View style={{ height: 110 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  container: {
    alignSelf: 'center',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  photoActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoActionBtn: {
    flex: 1,
    height: 120,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#182A12',
    textAlign: 'center',
  },
  previewContainer: {
    position: 'relative',
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  retakeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  nameInputBox: {
    marginBottom: 16,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  analyzeBtn: {
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
  analyzeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  errorBoxText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  resultsContainer: {
    gap: 14,
  },
  scoreCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  scoreTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scoreOutOf: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 2,
    color: '#64748B',
  },
  scoreStatusPill: {
    backgroundColor: '#111418',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  scoreStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  resultProductName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  allergenAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 10,
    borderRadius: 12,
  },
  allergenAlertText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  ingBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  ingBoxTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  ingTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ingTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  ingTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reportCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  reportCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  reportCardText: {
    fontSize: 12,
    lineHeight: 18,
  },
  newScanBtn: {
    height: 50,
    backgroundColor: '#111418',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  newScanBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modeToggleRow: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  modeToggleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modeToggleTabActive: {
    backgroundColor: '#111418',
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modeToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  greenbookNoticePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  greenbookNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
    flex: 1,
  },
  textInputArea: {
    height: 90,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  nafdacBanner: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  nafdacBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  nafdacBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nafdacBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  nafdacNrnPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  nafdacNrnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  nafdacApplicantText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nafdacStatusNote: {
    fontSize: 11,
    fontWeight: '500',
  },
});

