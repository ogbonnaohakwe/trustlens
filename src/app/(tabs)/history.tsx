import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors, getCardGrid } from '../../constants/theme';
import { useTrustLens } from '../../context/TrustLensContext';
import { FormattedReportText } from '../../components/FormattedReportText';

export default function HistoryTab() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const {
    allScans,
    deleteScan,
    clearAllScans,
    isDarkMode,
  } = useTrustLens();

  const [filter, setFilter] = useState<'ALL' | 'SAFE' | 'CAUTION' | 'UNSAFE'>('ALL');
  const [selectedScan, setSelectedScan] = useState<any | null>(null);

  const maxContentWidth = Math.min(width - 32, 600);
  const currentBg = isDarkMode ? BrandColors.dark.background : BrandColors.light.background;
  const currentCard = isDarkMode ? BrandColors.dark.card : BrandColors.light.card;
  const currentBorder = isDarkMode ? BrandColors.dark.surfaceBorder : BrandColors.light.surfaceBorder;
  const currentText = isDarkMode ? BrandColors.dark.text : BrandColors.light.text;
  const currentMuted = isDarkMode ? BrandColors.dark.textSecondary : BrandColors.light.textSecondary;

  const cards = getCardGrid(isDarkMode);

  const filteredScans = allScans.filter((s) => {
    if (filter === 'ALL') return true;
    return s.safetyStatus === filter;
  });

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Records',
      'Are you sure you want to permanently erase your scan history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Erase All', style: 'destructive', onPress: () => clearAllScans() },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentBg }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { alignItems: 'center' }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { width: maxContentWidth }]}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            <View>
              <Text style={[styles.headerTitle, { color: currentText }]}>Recent Scans</Text>
              <Text style={[styles.headerSubtitle, { color: currentMuted }]}>
                {allScans.length} archived safety evaluations
              </Text>
            </View>

            {allScans.length > 0 && (
              <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={styles.clearBtnText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Pills */}
          <View style={styles.filterRow}>
            {(['ALL', 'SAFE', 'CAUTION', 'UNSAFE'] as const).map((f) => {
              const isSelected = filter === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    { borderColor: currentBorder, backgroundColor: currentCard },
                    isSelected && {
                      backgroundColor: isDarkMode ? '#10B981' : '#111418',
                      borderColor: isDarkMode ? '#10B981' : '#111418',
                    },
                  ]}
                  onPress={() => setFilter(f)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: isSelected ? (isDarkMode ? '#0A0E14' : '#FFFFFF') : currentMuted },
                      isSelected && { fontWeight: '800' },
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Empty State */}
          {filteredScans.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: currentCard, borderColor: currentBorder }]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: cards.sage.bg }]}>
                <Ionicons name="document-text-outline" size={32} color={cards.sage.iconColor} />
              </View>
              <Text style={[styles.emptyTitle, { color: currentText }]}>No Scans Found</Text>
              <Text style={[styles.emptySubtitle, { color: currentMuted }]}>
                Take a photo of product ingredients or enter text manually to run your first forensic analysis.
              </Text>
              <TouchableOpacity
                style={styles.startScanBtn}
                onPress={() => router.push('/(tabs)/scan')}
                activeOpacity={0.85}
              >
                <Ionicons name="scan" size={18} color="#FFFFFF" />
                <Text style={styles.startScanBtnText}>Start First Scan</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.scansList}>
              {filteredScans.map((scan) => {
                const isSafe = scan.safetyStatus === 'SAFE';
                const isCaution = scan.safetyStatus === 'CAUTION';

                const cardStyle = isSafe
                  ? cards.green
                  : isCaution
                  ? cards.yellow
                  : cards.danger;

                return (
                  <TouchableOpacity
                    key={scan.id}
                    style={[styles.scanItemCard, { backgroundColor: cardStyle.bg, borderColor: cardStyle.border }]}
                    onPress={() => setSelectedScan(scan)}
                    activeOpacity={0.88}
                  >
                    <View style={styles.scanItemLeft}>
                      <View style={[styles.scanIconBadge, { backgroundColor: cardStyle.iconBg }]}>
                        <Ionicons
                          name={isSafe ? 'checkmark-circle' : isCaution ? 'alert-circle' : 'close-circle'}
                          size={24}
                          color={cardStyle.iconColor}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.scanItemTitle, { color: cardStyle.title }]} numberOfLines={1}>
                          {scan.productName}
                        </Text>
                        <Text style={[styles.scanItemDate, { color: cardStyle.subtitle }]}>
                          {new Date(scan.timestamp).toLocaleDateString()} • {scan.safetyStatus}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.scanItemRight}>
                      <View style={[styles.scorePill, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
                        <Text style={[styles.scorePillText, { color: isDarkMode ? '#F1F5F9' : '#111418' }]}>
                          {scan.safetyScore}/100
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => deleteScan(scan.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="trash-outline" size={18} color={currentMuted} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Bottom spacing for floating dock */}
          <View style={{ height: 110 }} />
        </View>
      </ScrollView>

      {/* Scan Detail Modal */}
      <Modal
        visible={selectedScan !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedScan(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentCard, borderColor: currentBorder }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: currentText }]} numberOfLines={1}>
                  {selectedScan?.productName}
                </Text>
                <Text style={[styles.modalSubtitle, { color: currentMuted }]}>
                  {selectedScan && new Date(selectedScan.timestamp).toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedScan(null)}>
                <Ionicons name="close" size={24} color={currentMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {selectedScan && (
                <View style={{ gap: 14 }}>
                  {/* Score Row */}
                  <View style={[styles.modalScoreBanner, { backgroundColor: cards.sage.bg }]}>
                    <Text style={[styles.modalScoreText, { color: cards.sage.title }]}>
                      Safety Rating: {selectedScan.safetyScore} / 100
                    </Text>
                    <Text style={[styles.modalStatusText, { color: cards.sage.title }]}>
                      {selectedScan.safetyStatus}
                    </Text>
                  </View>

                  {/* Allergen Alert */}
                  {selectedScan.allergenAlertMessage ? (
                    <View style={styles.modalAlertBox}>
                      <Ionicons name="warning" size={18} color="#EF4444" />
                      <Text style={styles.modalAlertText}>{selectedScan.allergenAlertMessage}</Text>
                    </View>
                  ) : null}

                  {/* NAFDAC Verification Badge */}
                  {selectedScan.nafdacNumber ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 1,
                        borderColor: '#10B981',
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        marginBottom: 12,
                      }}
                    >
                      <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                      <Text style={{ fontSize: 13, fontWeight: '700', color: currentText, flex: 1 }}>
                        NAFDAC Reg. No: {selectedScan.nafdacNumber}
                      </Text>
                      <View style={{ backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}>VERIFIED</Text>
                      </View>
                    </View>
                  ) : null}

                  {/* Report Text without raw markdown markers */}
                  <View style={[styles.modalReportBox, { borderColor: currentBorder }]}>
                    <Text style={[styles.modalReportTitle, { color: currentText }]}>Clinical Evaluation</Text>
                    <FormattedReportText
                      reportText={selectedScan.summaryReport}
                      isDarkMode={isDarkMode}
                      textColor={currentText}
                    />
                  </View>
                </View>
              )}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  startScanBtn: {
    height: 48,
    backgroundColor: '#111418',
    borderRadius: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startScanBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  scansList: {
    gap: 12,
  },
  scanItemCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  scanItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  scanIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111418',
  },
  scanItemDate: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
  },
  scanItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scorePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  scorePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111418',
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
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalScroll: {
    paddingBottom: 24,
  },
  modalScoreBanner: {
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalScoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#182A12',
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#182A12',
  },
  modalAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 14,
  },
  modalAlertText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  modalReportBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  modalReportTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalReportBody: {
    fontSize: 12,
    lineHeight: 18,
  },
});
