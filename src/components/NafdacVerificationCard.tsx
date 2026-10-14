import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BrandColors } from '../constants/theme';
import { NafdacService, NafdacVerificationResult } from '../services/nafdacService';

interface NafdacVerificationCardProps {
  isDarkMode: boolean;
  onSelectProduct?: (productName: string, nrn: string) => void;
  initialNrn?: string;
  initialProductName?: string;
}

export const NafdacVerificationCard: React.FC<NafdacVerificationCardProps> = ({
  isDarkMode,
  onSelectProduct,
  initialNrn,
  initialProductName,
}) => {
  const [query, setQuery] = useState(initialNrn || initialProductName || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NafdacVerificationResult | null>(null);

  const currentCard = isDarkMode ? BrandColors.dark.card : BrandColors.light.card;
  const currentBorder = isDarkMode ? BrandColors.dark.surfaceBorder : BrandColors.light.surfaceBorder;
  const currentText = isDarkMode ? BrandColors.dark.text : BrandColors.light.text;
  const currentMuted = isDarkMode ? BrandColors.dark.textSecondary : BrandColors.light.textSecondary;

  const sampleCodes = [
    { label: 'Flu-Cof (B4-4561)', code: 'B4-4561' },
    { label: 'G-Clav (A4-6099)', code: 'A4-6099' },
    { label: 'Baby Greenlin (A4-1079)', code: 'A4-1079' },
    { label: 'Unregistered Test', code: 'XX-99999' },
  ];

  const handleVerify = async (testCode?: string) => {
    const target = (testCode || query).trim();
    if (!target) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await NafdacService.verifyNrn(target);
      setResult(res);
    } catch (e: any) {
      console.warn('NAFDAC verification error:', e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const candidate = (initialNrn || initialProductName || '').trim();
    if (candidate) {
      setQuery(candidate);
      handleVerify(candidate);
    }
  }, [initialNrn, initialProductName]);

  return (
    <View style={[styles.card, { backgroundColor: currentCard, borderColor: currentBorder }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#10B981" />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: currentText }]}>Verify</Text>
              <View style={styles.syncBadge}>
                <Text style={styles.syncBadgeText}>8,938 SYNCED</Text>
              </View>
            </View>
            <Text style={[styles.subtitle, { color: currentMuted }]}>
              Official Registry Verification & Counterfeit Detection
            </Text>
          </View>
        </View>
      </View>

      {/* Input row */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9',
              color: currentText,
              borderColor: currentBorder,
            },
          ]}
          placeholder="Enter NAFDAC No. or Brand (e.g. B4-4561, Baby Greenlin)"
          placeholderTextColor="#64748B"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleVerify()}
          autoCapitalize="characters"
        />
        <TouchableOpacity
          style={[styles.verifyBtn, loading && { opacity: 0.7 }]}
          onPress={() => handleVerify()}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="search" size={16} color="#FFFFFF" />
              <Text style={styles.verifyBtnText}>Verify</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Sample Pills */}
      <View style={styles.samplesRow}>
        <Text style={[styles.samplesLabel, { color: currentMuted }]}>Try sample:</Text>
        <View style={styles.pillsWrap}>
          {sampleCodes.map((s, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.samplePill,
                { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' },
              ]}
              onPress={() => {
                setQuery(s.code);
                handleVerify(s.code);
              }}
            >
              <Text style={[styles.samplePillText, { color: currentText }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Verification Result */}
      {result ? (
        <View
          style={[
            styles.resultBox,
            {
              backgroundColor:
                result.status === 'AUTHENTIC_ACTIVE'
                  ? 'rgba(16, 185, 129, 0.08)'
                  : result.status === 'EXPIRED_OR_INACTIVE'
                    ? 'rgba(245, 158, 11, 0.08)'
                    : 'rgba(239, 68, 68, 0.08)',
              borderColor:
                result.status === 'AUTHENTIC_ACTIVE'
                  ? '#10B981'
                  : result.status === 'EXPIRED_OR_INACTIVE'
                    ? '#F59E0B'
                    : '#EF4444',
            },
          ]}
        >
          {/* Status Header */}
          <View style={styles.resultHeader}>
            <View style={styles.resultBadge}>
              <Ionicons
                name={
                  result.status === 'AUTHENTIC_ACTIVE'
                    ? 'checkmark-circle'
                    : result.status === 'EXPIRED_OR_INACTIVE'
                      ? 'alert-circle'
                      : 'close-circle'
                }
                size={18}
                color={
                  result.status === 'AUTHENTIC_ACTIVE'
                    ? '#10B981'
                    : result.status === 'EXPIRED_OR_INACTIVE'
                      ? '#F59E0B'
                      : '#EF4444'
                }
              />
              <Text
                style={[
                  styles.resultBadgeText,
                  {
                    color:
                      result.status === 'AUTHENTIC_ACTIVE'
                        ? '#10B981'
                        : result.status === 'EXPIRED_OR_INACTIVE'
                          ? '#F59E0B'
                          : '#EF4444',
                  },
                ]}
              >
                {result.regulatoryBadge}
              </Text>
            </View>
            <Text style={[styles.confidenceText, { color: currentMuted }]}>
              {result.confidenceScore}% Confidence
            </Text>
          </View>

          {/* Official Product Details */}
          {result.officialProduct ? (
            <View style={styles.productDetails}>
              <Text style={[styles.productName, { color: currentText }]}>
                {result.officialProduct.productName}
              </Text>

              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: currentMuted }]}>NAFDAC Reg. No:</Text>
                <Text style={[styles.detailVal, { color: currentText }]}>
                  {result.officialProduct.nrn}
                </Text>
              </View>

              {result.officialProduct.applicantName ? (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailKey, { color: currentMuted }]}>Licensed Applicant:</Text>
                  <Text style={[styles.detailVal, { color: currentText }]}>
                    {result.officialProduct.applicantName}
                  </Text>
                </View>
              ) : null}

              {result.officialProduct.dosageForm ? (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailKey, { color: currentMuted }]}>Dosage Form:</Text>
                  <Text style={[styles.detailVal, { color: currentText }]}>
                    {result.officialProduct.dosageForm} {result.officialProduct.strength ? `(${result.officialProduct.strength})` : ''}
                  </Text>
                </View>
              ) : null}

              {result.officialProduct.ingredientName ? (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailKey, { color: currentMuted }]}>Active Formulation:</Text>
                  <Text style={[styles.detailVal, { color: currentText }]} numberOfLines={2}>
                    {result.officialProduct.ingredientName}
                  </Text>
                </View>
              ) : null}

              {result.officialProduct.expiryDate ? (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailKey, { color: currentMuted }]}>Registration Expiry:</Text>
                  <Text style={[styles.detailVal, { color: currentText }]}>
                    {result.officialProduct.expiryDate}
                  </Text>
                </View>
              ) : null}

              {result.officialProduct.smpcUrl ? (
                <TouchableOpacity
                  style={styles.smpcBtn}
                  onPress={() => Linking.openURL(result.officialProduct!.smpcUrl!)}
                >
                  <Ionicons name="document-text-outline" size={14} color="#10B981" />
                  <Text style={styles.smpcBtnText}>View Official SmPC Leaflet (PDF)</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={styles.unregisteredBox}>
              <Text style={styles.unregisteredText}>
                ⚠️ This number was not found in NAFDAC&apos;s approved database.
                Inspect packaging carefully for cloned labels or uncertified distribution.
              </Text>
            </View>
          )}

          {/* Forensic Notes */}
          {result.forensicNotes.length > 0 ? (
            <View style={styles.notesBox}>
              {result.forensicNotes.map((note, i) => (
                <Text key={i} style={[styles.noteText, { color: currentMuted }]}>
                  • {note}
                </Text>
              ))}
            </View>
          ) : null}

          {/* Analyze This Product Action Button */}
          {onSelectProduct ? (
            <TouchableOpacity
              style={styles.analyzeProductActionBtn}
              onPress={() => {
                const prodName = result.officialProduct?.productName || query;
                const prodNrn = result.officialProduct?.nrn || query;
                onSelectProduct(prodName, prodNrn);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="scan-outline" size={16} color="#FFFFFF" />
              <Text style={styles.analyzeProductActionBtnText}>
                Analyze Formulation with TrustLens
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  analyzeProductActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#111418',
  },
  analyzeProductActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.cardGrid.green.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  syncBadge: {
    backgroundColor: BrandColors.cardGrid.green.bg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  syncBadgeText: {
    color: '#16A34A',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: '600',
  },
  verifyBtn: {
    backgroundColor: '#111418',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  samplesRow: {
    gap: 6,
  },
  samplesLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  samplePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  samplePillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  resultBox: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    gap: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  productDetails: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.15)',
    paddingTop: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailKey: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 120,
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  smpcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingVertical: 4,
  },
  smpcBtnText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  unregisteredBox: {
    paddingVertical: 4,
  },
  unregisteredText: {
    color: '#EF4444',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  notesBox: {
    gap: 3,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.15)',
    paddingTop: 8,
  },
  noteText: {
    fontSize: 11,
    lineHeight: 15,
  },
});
