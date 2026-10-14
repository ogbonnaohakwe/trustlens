import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors } from '../../constants/theme';
import { useTrustLens } from '../../context/TrustLensContext';

export const COMPREHENSIVE_ALLERGIES = [
  // Antibiotics & Antimicrobials
  'Penicillin',
  'Amoxicillin',
  'Ampicillin',
  'Cephalosporins (Keflex, Rocephin)',
  'Sulfa Drugs (Sulfonamides, Bactrim)',
  'Tetracycline & Doxycycline',
  'Ciprofloxacin & Fluoroquinolones',
  'Azithromycin & Macrolides',
  'Erythromycin',
  'Vancomycin',
  'Clindamycin',
  'Gentamicin & Aminoglycosides',
  'Metronidazole (Flagyl)',
  'Nitrofurantoin',

  // Pain Relievers, NSAIDs & Analgesics
  'Aspirin',
  'Ibuprofen (Advil, Motrin)',
  'Diclofenac',
  'Naproxen (Aleve)',
  'Celecoxib (Celebrex)',
  'Paracetamol / Acetaminophen',
  'Codeine',
  'Tramadol',
  'Morphine & Opiates',

  // Anesthetics & Cardiovascular Agents
  'Lidocaine & Local Anesthetics',
  'Novocaine',
  'ACE Inhibitors (Lisinopril, Enalapril)',
  'Beta-Blockers (Atenolol, Propranolol)',
  'Statins (Atorvastatin, Simvastatin)',
  'Heparin',
  'Contrast Media (Iodine Dyes)',

  // Pharmaceutical Excipients & Preservatives
  'Sulfites / Preservatives (Sodium Metabisulfite)',
  'Benzalkonium Chloride',
  'Parabens (Methylparaben, Propylparaben)',
  'Propylene Glycol',
  'Polyethylene Glycol (PEG / Macrogol)',
  'Polysorbate 80',
  'Benzoic Acid & Sodium Benzoate',
  'Tartrazine (FD&C Yellow 5)',
  'Sunset Yellow (FD&C Yellow 6)',
  'Carmine / Cochineal (Red 4)',

  // Biologicals, Environmental & Food Allergens
  'Peanuts',
  'Tree Nuts (Almonds, Cashews, Walnuts)',
  'Gluten / Wheat',
  'Milk / Dairy / Lactose',
  'Seafood / Shellfish',
  'Soy & Soybean Oil',
  'Eggs & Egg Albumin',
  'Gelatin (Capsule Excipient)',
  'Sesame',
  'Latex (Medical Gloves & Vial Stoppers)',
  'Nickel & Metal Alloys',
  'Bee & Wasp Venom',
  'Dust Mites & Mold Spores',
];

const CATEGORIES = [
  'All',
  'Antibiotics',
  'Pain & NSAIDs',
  'Excipients & Dyes',
  'Food & Natural',
];

export default function SetupStep2Screen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { userProfile, selectUserProfile } = useTrustLens();

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    userProfile?.allergies ? userProfile.allergies.split(',').filter(Boolean) : ['Penicillin']
  );
  const [customInput, setCustomInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const maxContentWidth = Math.min(width - 32, 520);
  const currentBg = BrandColors.light.background;
  const currentCard = BrandColors.light.card;
  const currentBorder = BrandColors.light.surfaceBorder;
  const currentText = BrandColors.light.text;
  const currentMuted = BrandColors.light.textSecondary;

  const toggleAllergy = (name: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const addCustomAllergy = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selectedAllergies.includes(trimmed)) {
      setSelectedAllergies((prev) => [...prev, trimmed]);
      setCustomInput('');
    }
  };

  const handleNext = async () => {
    await selectUserProfile({
      name: userProfile?.name || 'Clinical User',
      email: userProfile?.email || '',
      age: userProfile?.age || 28,
      gender: userProfile?.gender || 'Prefer not to say',
      country: userProfile?.country || 'Nigeria',
      allergies: selectedAllergies,
      conditions: userProfile?.conditions ? userProfile.conditions.split(',').filter(Boolean) : [],
      hasGivenBirth: userProfile?.hasGivenBirth || 'No',
      childrenCount: userProfile?.childrenCount || 0,
      hadSurgery: userProfile?.hadSurgery || 'No',
      surgeryType: userProfile?.surgeryType || 'None',
    });
    router.push('/setup/step3');
  };

  // Filter based on category and search query
  const filteredAllergies = COMPREHENSIVE_ALLERGIES.filter((item) => {
    const matchesSearch = item.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeCategory === 'Antibiotics') {
      return (
        item.includes('Penicillin') ||
        item.includes('Amoxicillin') ||
        item.includes('Ampicillin') ||
        item.includes('Cephalosporin') ||
        item.includes('Sulfa') ||
        item.includes('Tetracycline') ||
        item.includes('Ciprofloxacin') ||
        item.includes('Azithromycin') ||
        item.includes('Erythromycin') ||
        item.includes('Vancomycin') ||
        item.includes('Clindamycin') ||
        item.includes('Gentamicin') ||
        item.includes('Metronidazole') ||
        item.includes('Nitrofurantoin')
      );
    }
    if (activeCategory === 'Pain & NSAIDs') {
      return (
        item.includes('Aspirin') ||
        item.includes('Ibuprofen') ||
        item.includes('Diclofenac') ||
        item.includes('Naproxen') ||
        item.includes('Celecoxib') ||
        item.includes('Paracetamol') ||
        item.includes('Codeine') ||
        item.includes('Tramadol') ||
        item.includes('Morphine')
      );
    }
    if (activeCategory === 'Excipients & Dyes') {
      return (
        item.includes('Sulfite') ||
        item.includes('Benzalkonium') ||
        item.includes('Paraben') ||
        item.includes('Glycol') ||
        item.includes('Polysorbate') ||
        item.includes('Benzoic') ||
        item.includes('Yellow') ||
        item.includes('Carmine') ||
        item.includes('Gelatin') ||
        item.includes('Latex')
      );
    }
    if (activeCategory === 'Food & Natural') {
      return (
        item.includes('Peanut') ||
        item.includes('Nut') ||
        item.includes('Gluten') ||
        item.includes('Milk') ||
        item.includes('Seafood') ||
        item.includes('Soy') ||
        item.includes('Egg') ||
        item.includes('Sesame') ||
        item.includes('Venom') ||
        item.includes('Mite')
      );
    }
    return true;
  });

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
            <Text style={[styles.headerTitle, { color: currentText }]}>Clinical Setup</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Progress Tracker */}
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: currentMuted }]}>STEP 2 OF 3</Text>
            <View style={styles.dotsRow}>
              <View style={[styles.dot, { backgroundColor: currentBorder }]} />
              <View style={[styles.dot, styles.dotActive]} />
              <View style={[styles.dot, { backgroundColor: currentBorder }]} />
            </View>
          </View>

          {/* Title block */}
          <View style={styles.headingBlock}>
            <Text style={[styles.title, { color: currentText }]}>Allergies & Sensitivities</Text>
            <Text style={[styles.subtitle, { color: currentMuted }]}>
              Select any medicinal, chemical, or excipient sensitivities. Scanned medications and supplements will trigger real-time hazard alerts if matches or derivatives are detected.
            </Text>
          </View>

          {/* Search and Category Filter */}
          <View style={[styles.searchBox, { backgroundColor: currentCard, borderColor: currentBorder }]}>
            <Ionicons name="search" size={18} color={currentMuted} />
            <TextInput
              style={[styles.searchInput, { color: currentText }]}
              placeholder="Search 50+ pharmaceutical & food allergens..."
              placeholderTextColor={currentMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={currentMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryTab,
                    { borderColor: currentBorder, backgroundColor: currentCard },
                    isActive && {
                      backgroundColor: BrandColors.primary,
                      borderColor: BrandColors.primary,
                    },
                  ]}
                  onPress={() => setActiveCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      { color: isActive ? '#FFFFFF' : currentMuted },
                      isActive && { fontWeight: '800' },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Add custom tag */}
          <View style={[styles.addBox, { backgroundColor: currentCard, borderColor: currentBorder }]}>
            <TextInput
              style={[styles.addInput, { color: currentText }]}
              placeholder="Add other allergen (e.g. Amoxicillin Clavulanate)..."
              placeholderTextColor={currentMuted}
              value={customInput}
              onChangeText={setCustomInput}
              onSubmitEditing={addCustomAllergy}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addCustomAllergy} activeOpacity={0.8}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Selected Summary Pill */}
          <View style={styles.selectedCountBanner}>
            <Ionicons name="shield-checkmark" size={16} color={BrandColors.safe} />
            <Text style={styles.selectedCountText}>
              {selectedAllergies.length} active allergy flags registered
            </Text>
          </View>

          {/* Allergy Chips Grid */}
          <View style={[styles.chipsContainer, { backgroundColor: currentCard, borderColor: currentBorder }]}>
            {filteredAllergies.map((item) => {
              const isSelected = selectedAllergies.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    { borderColor: currentBorder },
                    isSelected && {
                      backgroundColor: BrandColors.cardGrid.yellow.bg,
                      borderColor: BrandColors.cardGrid.yellow.border,
                    },
                  ]}
                  onPress={() => toggleAllergy(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={isSelected ? BrandColors.cardGrid.yellow.title : currentMuted}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? BrandColors.cardGrid.yellow.title : currentText },
                      isSelected && { fontWeight: '800' },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>
              Continue to Medical Conditions ({selectedAllergies.length} selected)
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
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
    marginBottom: 16,
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
    gap: 8,
  },
  addInput: {
    flex: 1,
    fontSize: 13.5,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  selectedCountText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#166534',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '500',
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
});
