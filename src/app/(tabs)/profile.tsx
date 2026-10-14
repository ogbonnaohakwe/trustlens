import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors, getCardGrid } from '../../constants/theme';
import { useTrustLens } from '../../context/TrustLensContext';

export default function ProfileTab() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const {
    userProfile,
    isDarkMode,
    signOut,
  } = useTrustLens();

  const maxContentWidth = Math.min(width - 32, 580);
  const currentBg = isDarkMode ? BrandColors.dark.background : BrandColors.light.background;
  const currentCard = isDarkMode ? BrandColors.dark.card : BrandColors.light.card;
  const currentBorder = isDarkMode ? BrandColors.dark.surfaceBorder : BrandColors.light.surfaceBorder;
  const currentText = isDarkMode ? BrandColors.dark.text : BrandColors.light.text;
  const currentMuted = isDarkMode ? BrandColors.dark.textSecondary : BrandColors.light.textSecondary;

  const cards = getCardGrid(isDarkMode);

  const allergiesList = userProfile?.allergies ? userProfile.allergies.split(',').filter(Boolean) : [];
  const conditionsList = userProfile?.conditions ? userProfile.conditions.split(',').filter(Boolean) : [];

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/access-system');
        },
      },
    ]);
  };

  const isGuest =
    !userProfile?.email ||
    userProfile.email.trim() === '' ||
    userProfile.email.toLowerCase().includes('guest') ||
    userProfile.securityTier === 'Guest';

  const demographicItems = [
    userProfile?.age ? `${userProfile.age} yrs` : null,
    userProfile?.gender && userProfile.gender !== 'Unspecified' ? userProfile.gender : null,
    userProfile?.hasGivenBirth === 'Yes' ? `${userProfile.childrenCount || 1} Children` : null,
    userProfile?.hadSurgery === 'Yes' && userProfile.surgeryType ? `Surgery: ${userProfile.surgeryType}` : null,
    userProfile?.country || null,
  ].filter(Boolean);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentBg }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { alignItems: 'center' }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { width: maxContentWidth }]}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            <Text style={[styles.headerTitle, { color: currentText }]}>Profile & Settings</Text>
            {isGuest ? (
              <View style={styles.guestBadge}>
                <Ionicons name="person-outline" size={14} color={BrandColors.safe} />
                <Text style={styles.guestBadgeText}>Guest Session</Text>
              </View>
            ) : null}
          </View>

          {/* User Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: cards.sage.bg, borderColor: cards.sage.border }]}>
            <View style={[styles.avatarCircle, { backgroundColor: cards.sage.iconBg, borderColor: cards.sage.border }]}>
              <Text style={[styles.avatarLetter, { color: cards.sage.title }]}>
                {userProfile?.name && userProfile.name.trim().length > 0
                  ? userProfile.name.trim().charAt(0).toUpperCase()
                  : 'G'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: cards.sage.title }]} numberOfLines={1}>
                {userProfile?.name || (isGuest ? 'Guest User' : 'Clinical User')}
              </Text>
              <Text style={[styles.userEmail, { color: cards.sage.subtitle }]} numberOfLines={1}>
                {userProfile?.email ? userProfile.email : 'Unlinked local session'}
              </Text>
              {demographicItems.length > 0 && (
                <View style={styles.demographicsPillRow}>
                  <Text style={[styles.demographicsPill, { color: cards.sage.subtitle }]}>
                    {demographicItems.join(' • ')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Edit Profile & Health Preferences Button */}
          <TouchableOpacity
            style={[styles.editParamsBtn, { backgroundColor: currentCard, borderColor: currentBorder }]}
            onPress={() => router.push('/setup/step1')}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="options-outline" size={20} color={BrandColors.primary} />
              <Text style={[styles.editParamsText, { color: currentText }]}>Update Profile & Health Preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={currentMuted} />
          </TouchableOpacity>

          {/* Allergies Card */}
          <View style={[styles.sectionCard, { backgroundColor: currentCard, borderColor: currentBorder }]}>
            <View style={styles.sectionCardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="alert-circle" size={18} color="#D97706" />
                <Text style={[styles.sectionTitle, { color: currentText }]}>Active Allergies ({allergiesList.length})</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/setup/step2')}>
                <Text style={styles.sectionEditLink}>Edit</Text>
              </TouchableOpacity>
            </View>

            {allergiesList.length === 0 ? (
              <Text style={[styles.emptyHint, { color: currentMuted }]}>No allergy tags recorded.</Text>
            ) : (
              <View style={styles.chipsWrap}>
                {allergiesList.map((alg, i) => (
                  <View key={i} style={[styles.chip, { backgroundColor: cards.yellow.bg, borderColor: cards.yellow.border }]}>
                    <Text style={[styles.chipText, { color: cards.yellow.title }]}>{alg}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Chronic Conditions Card */}
          <View style={[styles.sectionCard, { backgroundColor: currentCard, borderColor: currentBorder }]}>
            <View style={styles.sectionCardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="heart" size={18} color="#16A34A" />
                <Text style={[styles.sectionTitle, { color: currentText }]}>Chronic Conditions ({conditionsList.length})</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/setup/step3')}>
                <Text style={styles.sectionEditLink}>Edit</Text>
              </TouchableOpacity>
            </View>

            {conditionsList.length === 0 ? (
              <Text style={[styles.emptyHint, { color: currentMuted }]}>No conditions registered.</Text>
            ) : (
              <View style={styles.chipsWrap}>
                {conditionsList.map((cond, i) => (
                  <View key={i} style={[styles.chip, { backgroundColor: cards.green.bg, borderColor: cards.green.border }]}>
                    <Text style={[styles.chipText, { color: cards.green.title }]}>{cond}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Account Actions */}
          {isGuest ? (
            <View style={styles.actionGroup}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#111418', borderColor: '#111418' }]}
                onPress={() => router.push('/')}
                activeOpacity={0.85}
              >
                <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
                <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Create Account or Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionGroup}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: currentCard, borderColor: currentBorder }]}
                onPress={handleSignOut}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Sign Out</Text>
              </TouchableOpacity>
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
  guestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: BrandColors.cardGrid.sage.bg,
    borderWidth: 1,
    borderColor: BrandColors.cardGrid.sage.border,
  },
  guestBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.cardGrid.sage.title,
  },
  profileCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 24,
    fontWeight: '900',
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  demographicsPillRow: {
    marginTop: 6,
  },
  demographicsPill: {
    fontSize: 11,
    fontWeight: '600',
  },
  editParamsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  editParamsText: {
    fontSize: 14,
    fontWeight: '700',
  },
  themeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  themeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionEditLink: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.primary,
  },
  emptyHint: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionGroup: {
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
