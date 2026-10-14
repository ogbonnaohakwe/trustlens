import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors } from '../../constants/theme';
import { useTrustLens } from '../../context/TrustLensContext';

export const ALL_COUNTRIES_JURISDICTIONS = [
  { name: 'Nigeria', agency: 'NAFDAC (National Agency for Food & Drug Admin)' },
  { name: 'Ghana', agency: 'FDA (Food and Drugs Authority Ghana)' },
  { name: 'South Africa', agency: 'SAHPRA (South African Health Products Reg. Auth.)' },
  { name: 'Kenya', agency: 'PPB (Pharmacy and Poisons Board)' },
  { name: 'United States', agency: 'FDA (Food and Drug Administration)' },
  { name: 'United Kingdom', agency: 'MHRA (Medicines and Healthcare Products Reg. Agency)' },
  { name: 'Canada', agency: 'Health Canada (Santé Canada)' },
  { name: 'Australia', agency: 'TGA (Therapeutic Goods Administration)' },
  { name: 'India', agency: 'CDSCO (Central Drugs Standard Control Org.)' },
  { name: 'Germany', agency: 'BfArM (Federal Institute for Drugs & Medical Devices)' },
  { name: 'France', agency: 'ANSM (National Agency for the Safety of Medicine)' },
  { name: 'Egypt', agency: 'EDA (Egyptian Drug Authority)' },
  { name: 'Rwanda', agency: 'Rwanda FDA (Food and Drugs Authority)' },
  { name: 'Ethiopia', agency: 'EFDA (Ethiopian Food and Drug Authority)' },
  { name: 'Uganda', agency: 'NDA (National Drug Authority)' },
  { name: 'Tanzania', agency: 'TMDA (Tanzania Medicines and Medical Devices)' },
  { name: 'Cameroon', agency: 'DPML (Direction de la Pharmacie et du Médicament)' },
  { name: 'Ivory Coast', agency: 'AIRP (Autorité Ivoirienne de Régulation Pharmaceutique)' },
  { name: 'Senegal', agency: 'ARP (Agence Sénégalaise de Réglementation Pharmaceutique)' },
  { name: 'Brazil', agency: 'ANVISA (Agência Nacional de Vigilância Sanitária)' },
  { name: 'China', agency: 'NMPA (National Medical Products Administration)' },
  { name: 'Japan', agency: 'PMDA (Pharmaceuticals and Medical Devices Agency)' },
  { name: 'Saudi Arabia', agency: 'SFDA (Saudi Food and Drug Authority)' },
  { name: 'United Arab Emirates', agency: 'MoHAP (Ministry of Health and Prevention)' },
  { name: 'Mexico', agency: 'COFEPRIS (Federal Commission for Sanitary Risk)' },
  { name: 'Argentina', agency: 'ANMAT (National Administration of Drugs & Foods)' },
  { name: 'Spain', agency: 'AEMPS (Agencia Española de Medicamentos)' },
  { name: 'Italy', agency: 'AIFA (Agenzia Italiana del Farmaco)' },
  { name: 'Switzerland', agency: 'Swissmedic (Swiss Agency for Therapeutic Products)' },
  { name: 'Netherlands', agency: 'CBG-MEB (Medicines Evaluation Board)' },
  { name: 'Sweden', agency: 'Läkemedelsverket (Medical Products Agency)' },
  { name: 'Ireland', agency: 'HPRA (Health Products Regulatory Authority)' },
  { name: 'Singapore', agency: 'HSA (Health Sciences Authority)' },
  { name: 'Malaysia', agency: 'NPRA (National Pharmaceutical Regulatory Agency)' },
  { name: 'Indonesia', agency: 'BPOM (Badan Pengawas Obat dan Makanan)' },
  { name: 'Philippines', agency: 'FDA (Food and Drug Administration Philippines)' },
  { name: 'New Zealand', agency: 'Medsafe (NZ Medicines & Medical Devices Safety Auth.)' },
  { name: 'Austria', agency: 'AGES (Austrian Medicines & Medical Devices Agency)' },
  { name: 'Belgium', agency: 'FAMHP (Federal Agency for Medicines and Health Products)' },
  { name: 'Denmark', agency: 'Danish Medicines Agency (Lægemiddelstyrelsen)' },
  { name: 'Finland', agency: 'Fimea (Finnish Medicines Agency)' },
  { name: 'Greece', agency: 'EOF (National Organization for Medicines)' },
  { name: 'Norway', agency: 'DMP (Norwegian Medical Products Agency)' },
  { name: 'Poland', agency: 'URPL (Office for Registration of Medicinal Products)' },
  { name: 'Portugal', agency: 'INFARMED (National Authority of Medicines)' },
  { name: 'Turkey', agency: 'TITCK (Turkish Medicines and Medical Devices Agency)' },
  { name: 'Pakistan', agency: 'DRAP (Drug Regulatory Authority of Pakistan)' },
  { name: 'Thailand', agency: 'Thai FDA (Food and Drug Administration)' },
  { name: 'Vietnam', agency: 'DAV (Drug Administration of Vietnam)' },
  { name: 'Zimbabwe', agency: 'MCAZ (Medicines Control Authority of Zimbabwe)' },
  { name: 'International / Other', agency: 'WHO & Global Pharmacopeia Consensus' },
];

const FEMALE_SURGERIES = [
  'Caesarean Section (C-Section)',
  'Appendectomy',
  'Cholecystectomy (Gallbladder)',
  'Hysterectomy',
  'Cardiac / Heart Surgery',
  'Orthopedic / Joint Surgery',
  'Hernia Repair',
  'Thyroid Surgery',
  'Other Surgery',
];

const MALE_SURGERIES = [
  'Appendectomy',
  'Hernia Repair',
  'Cardiac / Heart Surgery',
  'Orthopedic / Joint Surgery',
  'Gallbladder Surgery',
  'Prostate Surgery',
  'Thyroid Surgery',
  'Other Surgery',
];

export default function SetupStep1Screen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { userProfile, selectUserProfile } = useTrustLens();

  // Primary fields
  const [name, setName] = useState(userProfile?.name || '');
  const [age, setAge] = useState(userProfile?.age?.toString() || '28');
  // Biological gender: strictly Female or Male
  const [selectedGender, setSelectedGender] = useState<'Female' | 'Male'>(
    userProfile?.gender === 'Male' ? 'Male' : 'Female'
  );

  // Female-specific reproductive history
  const [hasGivenBirth, setHasGivenBirth] = useState<'No' | 'Yes'>(
    (userProfile?.hasGivenBirth as 'No' | 'Yes') || 'No'
  );
  const [childrenCount, setChildrenCount] = useState<string>(
    userProfile?.childrenCount ? userProfile.childrenCount.toString() : '1'
  );

  // Surgical history
  const [hadSurgery, setHadSurgery] = useState<'No' | 'Yes'>(
    (userProfile?.hadSurgery as 'No' | 'Yes') || 'No'
  );
  const [surgeryType, setSurgeryType] = useState<string>(userProfile?.surgeryType || '');
  const [customSurgery, setCustomSurgery] = useState<string>('');

  // Regulatory Jurisdiction Country Dropdown
  const [country, setCountry] = useState(userProfile?.country || 'Nigeria');
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const maxContentWidth = Math.min(width - 32, 500);

  // Light mode colors
  const currentBg = BrandColors.light.background;
  const currentCard = BrandColors.light.card;
  const currentBorder = BrandColors.light.surfaceBorder;
  const currentText = BrandColors.light.text;
  const currentMuted = BrandColors.light.textSecondary;

  const handleContinue = async () => {
    const ageNum = parseInt(age, 10) || 28;
    const countNum = hasGivenBirth === 'Yes' ? parseInt(childrenCount, 10) || 1 : 0;
    const finalSurgeryType =
      hadSurgery === 'Yes'
        ? surgeryType === 'Other Surgery' && customSurgery.trim()
          ? customSurgery.trim()
          : surgeryType || 'General Surgery'
        : 'None';

    await selectUserProfile({
      name: name.trim() || userProfile?.name || 'User',
      email: userProfile?.email || '',
      age: ageNum,
      gender: selectedGender,
      country: country.trim() || 'Nigeria',
      allergies: userProfile?.allergies ? userProfile.allergies.split(',').filter(Boolean) : [],
      conditions: userProfile?.conditions ? userProfile.conditions.split(',').filter(Boolean) : [],
      hasGivenBirth: selectedGender === 'Female' ? hasGivenBirth : 'No',
      childrenCount: selectedGender === 'Female' ? countNum : 0,
      hadSurgery,
      surgeryType: finalSurgeryType,
    });
    router.push('/setup/step2');
  };

  const filteredCountries = ALL_COUNTRIES_JURISDICTIONS.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.agency.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const activeSurgeriesList = selectedGender === 'Female' ? FEMALE_SURGERIES : MALE_SURGERIES;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentBg }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { alignItems: 'center' }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container, { width: maxContentWidth }]}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backBtn, { backgroundColor: currentCard, borderColor: currentBorder }]}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color={currentText} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: currentText }]}>Profile Setup</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Progress Tracker */}
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: currentMuted }]}>STEP 1 OF 3</Text>
            <View style={styles.dotsRow}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={[styles.dot, { backgroundColor: currentBorder }]} />
              <View style={[styles.dot, { backgroundColor: currentBorder }]} />
            </View>
          </View>

          {/* Title block */}
          <View style={styles.headingBlock}>
            <Text style={[styles.title, { color: currentText }]}>Demographics & Health History</Text>
            <Text style={[styles.subtitle, { color: currentMuted }]}>
              Biological parameters, surgical history, and regulatory jurisdiction calibrate precision drug safety warnings.
            </Text>
          </View>

          {/* Card Form */}
          <View style={[styles.formCard, { backgroundColor: currentCard, borderColor: currentBorder }]}>
            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: currentText }]}>Full Name</Text>
              <View style={[styles.inputBox, { borderColor: currentBorder, backgroundColor: '#F8FAFC' }]}>
                <Ionicons name="person-outline" size={18} color={currentMuted} />
                <TextInput
                  style={[styles.textInput, { color: currentText }]}
                  placeholder="Enter your name"
                  placeholderTextColor={currentMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Age Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: currentText }]}>Age (Years)</Text>
              <View style={[styles.inputBox, { borderColor: currentBorder, backgroundColor: '#F8FAFC' }]}>
                <Ionicons name="calendar-outline" size={18} color={currentMuted} />
                <TextInput
                  style={[styles.textInput, { color: currentText }]}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                  maxLength={3}
                />
              </View>
            </View>

            {/* Biological Gender (Strictly Female or Male) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: currentText }]}>Biological Gender</Text>
              <View style={styles.genderGrid}>
                {(['Female', 'Male'] as const).map((g) => {
                  const isSelected = selectedGender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderPill,
                        { borderColor: currentBorder },
                        isSelected && {
                          backgroundColor: BrandColors.cardGrid.sage.bg,
                          borderColor: BrandColors.cardGrid.sage.border,
                        },
                      ]}
                      onPress={() => setSelectedGender(g)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={g === 'Female' ? 'female' : 'male'}
                        size={16}
                        color={isSelected ? BrandColors.cardGrid.sage.title : currentMuted}
                      />
                      <Text
                        style={[
                          styles.genderText,
                          { color: isSelected ? BrandColors.cardGrid.sage.title : currentMuted },
                          isSelected && { fontWeight: '800' },
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Female Reproductive History: Have you given birth? */}
            {selectedGender === 'Female' && (
              <View style={styles.subCardSection}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="heart-circle-outline" size={18} color={BrandColors.safe} />
                  <Text style={[styles.subCardTitle, { color: currentText }]}>Maternal & Reproductive History</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputSubLabel, { color: currentText }]}>Have you given birth?</Text>
                  <View style={styles.binaryChoiceRow}>
                    {(['No', 'Yes'] as const).map((choice) => {
                      const isSelected = hasGivenBirth === choice;
                      return (
                        <TouchableOpacity
                          key={choice}
                          style={[
                            styles.choicePill,
                            { borderColor: currentBorder },
                            isSelected && {
                              backgroundColor: BrandColors.cardGrid.peach.bg,
                              borderColor: BrandColors.cardGrid.peach.border,
                            },
                          ]}
                          onPress={() => setHasGivenBirth(choice)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                            size={16}
                            color={isSelected ? '#7C2D12' : currentMuted}
                          />
                          <Text
                            style={[
                              styles.choiceText,
                              { color: isSelected ? '#7C2D12' : currentMuted },
                              isSelected && { fontWeight: '800' },
                            ]}
                          >
                            {choice}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {hasGivenBirth === 'Yes' && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputSubLabel, { color: currentText }]}>How many children?</Text>
                    <View style={styles.childrenStepperRow}>
                      {['1', '2', '3', '4', '5+'].map((count) => {
                        const isSelected = childrenCount === count;
                        return (
                          <TouchableOpacity
                            key={count}
                            style={[
                              styles.counterPill,
                              { borderColor: currentBorder },
                              isSelected && {
                                backgroundColor: BrandColors.cardGrid.peach.bg,
                                borderColor: BrandColors.cardGrid.peach.border,
                              },
                            ]}
                            onPress={() => setChildrenCount(count)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.counterText,
                                { color: isSelected ? '#7C2D12' : currentText },
                                isSelected && { fontWeight: '800' },
                              ]}
                            >
                              {count}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Surgical History for Both Female and Male */}
            <View style={styles.subCardSection}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="medkit-outline" size={18} color="#D97706" />
                <Text style={[styles.subCardTitle, { color: currentText }]}>Surgical History</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputSubLabel, { color: currentText }]}>
                  Have you undergone any surgical operation?
                </Text>
                <View style={styles.binaryChoiceRow}>
                  {(['No', 'Yes'] as const).map((choice) => {
                    const isSelected = hadSurgery === choice;
                    return (
                      <TouchableOpacity
                        key={choice}
                        style={[
                          styles.choicePill,
                          { borderColor: currentBorder },
                          isSelected && {
                            backgroundColor: BrandColors.cardGrid.yellow.bg,
                            borderColor: BrandColors.cardGrid.yellow.border,
                          },
                        ]}
                        onPress={() => setHadSurgery(choice)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                          size={16}
                          color={isSelected ? BrandColors.cardGrid.yellow.title : currentMuted}
                        />
                        <Text
                          style={[
                            styles.choiceText,
                            { color: isSelected ? BrandColors.cardGrid.yellow.title : currentMuted },
                            isSelected && { fontWeight: '800' },
                          ]}
                        >
                          {choice}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {hadSurgery === 'Yes' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputSubLabel, { color: currentText }]}>
                    Select type of surgery undergone:
                  </Text>
                  <View style={styles.chipsWrap}>
                    {activeSurgeriesList.map((surg) => {
                      const isSelected = surgeryType === surg;
                      return (
                        <TouchableOpacity
                          key={surg}
                          style={[
                            styles.surgeryChip,
                            { borderColor: currentBorder },
                            isSelected && {
                              backgroundColor: BrandColors.cardGrid.sage.bg,
                              borderColor: BrandColors.cardGrid.sage.border,
                            },
                          ]}
                          onPress={() => setSurgeryType(surg)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.surgeryChipText,
                              { color: isSelected ? BrandColors.cardGrid.sage.title : currentText },
                              isSelected && { fontWeight: '800' },
                            ]}
                          >
                            {surg}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {surgeryType === 'Other Surgery' && (
                    <View style={[styles.inputBox, { borderColor: currentBorder, backgroundColor: '#F8FAFC', marginTop: 10 }]}>
                      <Ionicons name="create-outline" size={18} color={currentMuted} />
                      <TextInput
                        style={[styles.textInput, { color: currentText }]}
                        placeholder="Specify surgical procedure..."
                        placeholderTextColor={currentMuted}
                        value={customSurgery}
                        onChangeText={setCustomSurgery}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Country / Jurisdictional Registry Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: currentText }]}>Regulatory Jurisdiction</Text>
              <TouchableOpacity
                style={[styles.dropdownTrigger, { borderColor: currentBorder, backgroundColor: '#F8FAFC' }]}
                onPress={() => setCountryModalVisible(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="globe-outline" size={18} color={BrandColors.safe} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dropdownValueText, { color: currentText }]}>{country}</Text>
                  <Text style={[styles.dropdownSubText, { color: currentMuted }]} numberOfLines={1}>
                    {ALL_COUNTRIES_JURISDICTIONS.find((c) => c.name === country)?.agency || 'Global Regulatory Standard'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={18} color={currentMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>Continue to Allergies</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Country Selection Dropdown Modal */}
      <Modal visible={countryModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: currentCard, borderColor: currentBorder }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: currentText }]}>Select Jurisdiction</Text>
                <Text style={[styles.modalSubtitle, { color: currentMuted }]}>
                  Calibrates drug databases and authenticity authorities
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setCountryModalVisible(false);
                  setCountrySearch('');
                }}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={currentMuted} />
              </TouchableOpacity>
            </View>

            {/* Country Search Bar */}
            <View style={[styles.searchBox, { borderColor: currentBorder, backgroundColor: '#F8FAFC' }]}>
              <Ionicons name="search" size={18} color={currentMuted} />
              <TextInput
                style={[styles.searchInput, { color: currentText }]}
                placeholder="Search country or regulatory body..."
                placeholderTextColor={currentMuted}
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoCorrect={false}
              />
              {countrySearch.length > 0 && (
                <TouchableOpacity onPress={() => setCountrySearch('')}>
                  <Ionicons name="close-circle" size={18} color={currentMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Countries List */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.name}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => {
                const isSelected = country === item.name;
                return (
                  <TouchableOpacity
                    style={[
                      styles.countryItem,
                      { borderBottomColor: currentBorder },
                      isSelected && { backgroundColor: BrandColors.cardGrid.sage.bg },
                    ]}
                    onPress={() => {
                      setCountry(item.name);
                      setCountryModalVisible(false);
                      setCountrySearch('');
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.countryName,
                          { color: currentText },
                          isSelected && { fontWeight: '800', color: BrandColors.cardGrid.sage.title },
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text style={[styles.agencyName, { color: currentMuted }]}>
                        {item.agency}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={BrandColors.safe} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 24,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: '#111418',
  },
  headingBlock: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  formCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputSubLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
  },
  genderGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  genderPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  genderText: {
    fontSize: 13,
    fontWeight: '600',
  },
  subCardSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  subCardTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  binaryChoiceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  choicePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  choiceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  childrenStepperRow: {
    flexDirection: 'row',
    gap: 8,
  },
  counterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  counterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  surgeryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  surgeryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  dropdownValueText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownSubText: {
    fontSize: 11,
    marginTop: 2,
  },
  continueBtn: {
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
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: '85%',
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
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    gap: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  countryName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  agencyName: {
    fontSize: 11.5,
  },
});
