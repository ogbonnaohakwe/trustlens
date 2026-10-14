import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors, getCardGrid } from '../../constants/theme';
import { useTrustLens } from '../../context/TrustLensContext';
import { NafdacVerificationCard } from '../../components/NafdacVerificationCard';

export default function HomeTab() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isDarkMode, allScans } = useTrustLens();

  // State for guide & alerts modals
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [alertsModalVisible, setAlertsModalVisible] = useState(false);
  const [nafdacModalVisible, setNafdacModalVisible] = useState(false);

  // Responsiveness calculations
  const contentWidth = Math.min(width - 32, 640);
  const cardGap = 12;
  const cardWidth = (contentWidth - cardGap) / 2;

  const currentBg = isDarkMode ? BrandColors.dark.background : BrandColors.light.background;
  const currentText = isDarkMode ? BrandColors.dark.text : BrandColors.light.text;
  const currentCard = isDarkMode ? BrandColors.dark.card : BrandColors.light.card;
  const currentBorder = isDarkMode ? BrandColors.dark.surfaceBorder : BrandColors.light.surfaceBorder;
  const currentMuted = isDarkMode ? BrandColors.dark.textSecondary : BrandColors.light.textSecondary;

  const cards = getCardGrid(isDarkMode);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentBg }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { alignItems: 'center' }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: contentWidth }}>
          {/* Top Bar: Help, Theme Switch, and Notification Bell */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={[
                styles.iconCircleBtn,
                {
                  backgroundColor: currentCard,
                  borderColor: currentBorder,
                },
              ]}
              onPress={() => setHelpModalVisible(true)}
              activeOpacity={0.8}
              accessibilityLabel="Clinical safety help"
            >
              <Ionicons name="help-circle-outline" size={24} color={currentText} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                style={[
                  styles.iconCircleBtn,
                  {
                    backgroundColor: currentCard,
                    borderColor: currentBorder,
                  },
                ]}
                onPress={() => setAlertsModalVisible(true)}
                activeOpacity={0.8}
                accessibilityLabel="Recall alerts"
              >
                <Ionicons name="notifications-outline" size={22} color={currentText} />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>5</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2x2 Hero Grid */}
          <View style={[styles.gridContainer, { gap: cardGap }]}>
            {/* 1. Top Left: Scan Card */}
            <TouchableOpacity
              style={[
                styles.heroCard,
                {
                  width: cardWidth,
                  backgroundColor: cards.sage.bg,
                  borderColor: cards.sage.border,
                },
              ]}
              onPress={() => router.push('/(tabs)/scan')}
              activeOpacity={0.88}
            >
              <View style={[styles.cardIconCircle, { backgroundColor: cards.sage.iconBg }]}>
                <Ionicons name="scan-outline" size={26} color={cards.sage.iconColor} />
              </View>
              <Text style={[styles.cardTitle, { color: cards.sage.title }]}>
                Scan
              </Text>
              <Text
                style={[styles.cardSubtitle, { color: cards.sage.subtitle }]}
                numberOfLines={2}
              >
                Medicines, ID labels, Ingredients, Food, Barcodes...
              </Text>
            </TouchableOpacity>

            {/* 2. Top Right: NAFDAC Verify Card */}
            <TouchableOpacity
              style={[
                styles.heroCard,
                {
                  width: cardWidth,
                  backgroundColor: cards.yellow.bg,
                  borderColor: cards.yellow.border,
                },
              ]}
              onPress={() => setNafdacModalVisible(true)}
              activeOpacity={0.88}
            >
              <View style={[styles.cardIconCircle, { backgroundColor: cards.yellow.iconBg }]}>
                <Ionicons name="shield-checkmark-outline" size={26} color={cards.yellow.iconColor} />
              </View>
              <Text style={[styles.cardTitle, { color: cards.yellow.title }]}>
                NAFDAC
              </Text>
              <Text
                style={[styles.cardSubtitle, { color: cards.yellow.subtitle }]}
                numberOfLines={2}
              >
                Greenbook registry, NRN check, Counterfeit alerts...
              </Text>
            </TouchableOpacity>

            {/* 3. Bottom Left: Profile / Health Guard Card */}
            <TouchableOpacity
              style={[
                styles.heroCard,
                {
                  width: cardWidth,
                  backgroundColor: cards.green.bg,
                  borderColor: cards.green.border,
                },
              ]}
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.88}
            >
              <View style={[styles.cardIconCircle, { backgroundColor: cards.green.iconBg }]}>
                <Ionicons name="heart-circle-outline" size={26} color={cards.green.iconColor} />
              </View>
              <Text style={[styles.cardTitle, { color: cards.green.title }]}>
                Profile
              </Text>
              <Text
                style={[styles.cardSubtitle, { color: cards.green.subtitle }]}
                numberOfLines={2}
              >
                Allergies, conditions, personalized contraindications...
              </Text>
            </TouchableOpacity>

            {/* 4. Bottom Right: Ask AI Card */}
            <TouchableOpacity
              style={[
                styles.heroCard,
                {
                  width: cardWidth,
                  backgroundColor: cards.peach.bg,
                  borderColor: cards.peach.border,
                },
              ]}
              onPress={() => router.push('/ask-ai')}
              activeOpacity={0.88}
            >
              <View style={[styles.cardIconCircle, { backgroundColor: cards.peach.iconBg }]}>
                <Ionicons name="sparkles-outline" size={26} color={cards.peach.iconColor} />
              </View>
              <Text style={[styles.cardTitle, { color: cards.peach.title }]}>
                Ask AI
              </Text>
              <Text
                style={[styles.cardSubtitle, { color: cards.peach.subtitle }]}
                numberOfLines={2}
              >
                Summarize risks, drug interactions, simplify, verify...
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recent Scans Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: currentText }]}>Recent Scans</Text>
            {allScans.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
                <Text style={styles.sectionSeeAll}>See all ({allScans.length})</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Real Recent Scans Content */}
          {allScans.length === 0 ? (
            <TouchableOpacity
              style={[styles.emptyScansCard, { backgroundColor: currentCard, borderColor: currentBorder }]}
              onPress={() => router.push('/(tabs)/scan')}
              activeOpacity={0.85}
            >
              <View style={[styles.emptyIconCircle, { backgroundColor: cards.sage.bg }]}>
                <Ionicons name="scan" size={24} color={cards.sage.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.emptyTitle, { color: currentText }]}>No recent scans</Text>
                <Text style={[styles.emptySubtitle, { color: currentMuted }]}>
                  Tap to scan your first medicine or cosmetic product formulation
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={currentMuted} />
            </TouchableOpacity>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentScrollContent}
            >
              {allScans.slice(0, 8).map((scan) => {
                const isSafe = scan.safetyStatus === 'SAFE';
                const isCaution = scan.safetyStatus === 'CAUTION';

                const cardStyle = isSafe
                  ? cards.green
                  : isCaution
                  ? cards.yellow
                  : cards.danger;

                const iconName = isSafe
                  ? 'shield-checkmark-outline'
                  : isCaution
                  ? 'alert-circle-outline'
                  : 'warning-outline';

                return (
                  <TouchableOpacity
                    key={scan.id}
                    style={[styles.recentItemCard, { backgroundColor: cardStyle.bg, borderColor: cardStyle.border }]}
                    onPress={() => router.push('/(tabs)/history')}
                    activeOpacity={0.85}
                  >
                    <View style={styles.recentItemTop}>
                      <View style={[styles.recentItemIconBox, { backgroundColor: cardStyle.iconBg }]}>
                        <Ionicons name={iconName as any} size={18} color={cardStyle.iconColor} />
                      </View>
                      <View style={[styles.recentScoreBadge, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
                        <Text style={[styles.recentScoreText, { color: isDarkMode ? '#F1F5F9' : '#111418' }]}>
                          {scan.safetyScore}
                        </Text>
                      </View>
                    </View>
                    <View>
                      <Text style={[styles.recentItemTitle, { color: cardStyle.title }]} numberOfLines={1}>
                        {scan.productName}
                      </Text>
                      <Text style={[styles.recentItemType, { color: cardStyle.subtitle }]}>{scan.safetyStatus}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Bottom spacing for the floating dock tab bar */}
          <View style={{ height: 110 }} />
        </View>
      </ScrollView>

      {/* 1. Clinical Guide Modal (?) */}
      <Modal
        visible={helpModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentCard, borderColor: currentBorder }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="help-circle" size={24} color={BrandColors.safe} />
                <Text style={[styles.modalTitle, { color: currentText }]}>Clinical Safety Guide</Text>
              </View>
              <TouchableOpacity onPress={() => setHelpModalVisible(false)}>
                <Ionicons name="close" size={24} color={currentMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.guideParagraph, { color: currentText }]}>
                Welcome to <Text style={{ fontWeight: '800' }}>TrustLens AI</Text>, your mobile clinical decision assistant.
              </Text>
              <View style={styles.guideStepRow}>
                <View style={[styles.guideStepNum, { backgroundColor: cards.sage.bg }]}>
                  <Text style={[styles.guideStepNumText, { color: cards.sage.title }]}>1</Text>
                </View>
                <Text style={[styles.guideStepText, { color: currentText }]}>
                  <Text style={{ fontWeight: '700' }}>Scan or Upload:</Text> Capture any medicine packaging, label, or cosmetic ingredient list.
                </Text>
              </View>
              <View style={styles.guideStepRow}>
                <View style={[styles.guideStepNum, { backgroundColor: cards.yellow.bg }]}>
                  <Text style={[styles.guideStepNumText, { color: cards.yellow.title }]}>2</Text>
                </View>
                <Text style={[styles.guideStepText, { color: currentText }]}>
                  <Text style={{ fontWeight: '700' }}>NAFDAC Cross-Check:</Text> The offline Greenbook engine verifies the genuine registration number against 8,938 vetted entries.
                </Text>
              </View>
              <View style={styles.guideStepRow}>
                <View style={[styles.guideStepNum, { backgroundColor: cards.green.bg }]}>
                  <Text style={[styles.guideStepNumText, { color: cards.green.title }]}>3</Text>
                </View>
                <Text style={[styles.guideStepText, { color: currentText }]}>
                  <Text style={{ fontWeight: '700' }}>Personalized Contraindications:</Text> Every scanned ingredient is cross-checked against your clinical allergies and conditions.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. Health Alerts / Recalls Modal (Bell) */}
      <Modal
        visible={alertsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAlertsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentCard, borderColor: currentBorder }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="notifications" size={24} color={BrandColors.accentCoral} />
                <Text style={[styles.modalTitle, { color: currentText }]}>Regulatory Safety Alerts</Text>
              </View>
              <TouchableOpacity onPress={() => setAlertsModalVisible(false)}>
                <Ionicons name="close" size={24} color={currentMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={[styles.alertCard, { backgroundColor: isDarkMode ? '#281114' : '#FEF2F2', borderColor: isDarkMode ? '#4E1D22' : '#FCA5A5' }]}>
                <Text style={[styles.alertCardTitle, { color: isDarkMode ? '#FCA5A5' : '#991B1B' }]}>⚠️ Paracetamol Syrup Warning (NAFDAC Alert 024)</Text>
                <Text style={[styles.alertCardText, { color: isDarkMode ? '#CBD5E1' : '#4B5563' }]}>
                  Recall notice for contaminated batches containing diethylene glycol. Verify your packaging immediately.
                </Text>
              </View>
              <View style={[styles.alertCard, { backgroundColor: isDarkMode ? '#241D0D' : '#FEF3C7', borderColor: isDarkMode ? '#453518' : '#FCD34D' }]}>
                <Text style={[styles.alertCardTitle, { color: isDarkMode ? '#FDE047' : '#92400E' }]}>⚡ Counterfeit Augmentin Advisory</Text>
                <Text style={[styles.alertCardText, { color: isDarkMode ? '#CBD5E1' : '#B45309' }]}>
                  Cloned packaging detected in circulation. Check NRN verification via Greenbook tab before use.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 3. NAFDAC Greenbook Quick Verification Modal */}
      <Modal
        visible={nafdacModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNafdacModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentCard, borderColor: currentBorder, maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="shield-checkmark" size={24} color={BrandColors.safe} />
                <Text style={[styles.modalTitle, { color: currentText }]}>NAFDAC Greenbook Check</Text>
              </View>
              <TouchableOpacity onPress={() => setNafdacModalVisible(false)}>
                <Ionicons name="close" size={24} color={currentMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
              <NafdacVerificationCard
                isDarkMode={isDarkMode}
                onSelectProduct={(name, nrn) => {
                  setNafdacModalVisible(false);
                  router.push({
                    pathname: '/(tabs)/scan',
                    params: { productName: name, nafdacNumber: nrn },
                  });
                }}
              />
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
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  themeToggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    minHeight: 160,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSeeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.primary,
  },
  emptyScansCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  emptySubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  recentScrollContent: {
    gap: 12,
    paddingVertical: 4,
  },
  recentItemCard: {
    width: 140,
    height: 104,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  recentItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentItemIconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentScoreBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recentScoreText: {
    fontSize: 11,
    fontWeight: '800',
  },
  recentItemTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  recentItemType: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingTop: 20,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  guideParagraph: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  guideStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  guideStepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideStepNumText: {
    fontSize: 13,
    fontWeight: '800',
  },
  guideStepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  alertCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  alertCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  alertCardText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
