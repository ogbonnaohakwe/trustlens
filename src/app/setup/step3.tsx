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

export interface MedicalConditionItem {
  name: string;
  category: 'Cardiovascular' | 'Metabolic & Renal' | 'Respiratory & GI' | 'Neurological & Autoimmune' | 'Other';
  desc: string;
}

export const COMPREHENSIVE_CONDITIONS: MedicalConditionItem[] = [
  // Cardiovascular
  { name: 'Hypertension (High Blood Pressure)', category: 'Cardiovascular', desc: 'Monitors sodium, vasoconstrictors, pseudoephedrine & NSAIDs' },
  { name: 'Hypotension (Low Blood Pressure)', category: 'Cardiovascular', desc: 'Monitors vasodilators, diuretics & sedative antihypertensives' },
  { name: 'Coronary Artery Disease (CAD)', category: 'Cardiovascular', desc: 'Monitors antiplatelet, nitrate & anticoagulant drug interactions' },
  { name: 'Congestive Heart Failure (CHF)', category: 'Cardiovascular', desc: 'Flags fluid-retaining agents, NSAIDs & calcium channel blockers' },
  { name: 'Cardiac Arrhythmia / Atrial Fibrillation', category: 'Cardiovascular', desc: 'Monitors QT-prolonging drugs, digoxin & rate-altering agents' },
  { name: 'Hyperlipidemia (High Cholesterol)', category: 'Cardiovascular', desc: 'Monitors statin-fibrate-macrolide rhabdomyolysis interactions' },
  { name: 'Deep Vein Thrombosis (DVT) / Pulmonary Embolism', category: 'Cardiovascular', desc: 'Flags estrogen, progestin, antifibrinolytics & pro-thrombotic agents' },
  { name: 'Peripheral Artery Disease (PAD)', category: 'Cardiovascular', desc: 'Flags vasoconstrictive alkaloid derivatives and beta-blocker cautions' },

  // Metabolic & Renal
  { name: 'Type 1 Diabetes Mellitus', category: 'Metabolic & Renal', desc: 'Monitors dextrose, insulin requirements, beta-blocker masking' },
  { name: 'Type 2 Diabetes Mellitus', category: 'Metabolic & Renal', desc: 'Flags hidden medicinal syrups, sucrose, systemic corticosteroids & carbs' },
  { name: 'Chronic Kidney Disease (CKD Stage 1-4)', category: 'Metabolic & Renal', desc: 'Renal-excreted drug accumulation toxicity & GFR clearance alerts' },
  { name: 'End-Stage Renal Disease (Dialysis)', category: 'Metabolic & Renal', desc: 'Strict flags on potassium, magnesium, phosphate & nephrotoxic drugs' },
  { name: 'Acute Kidney Injury (AKI History)', category: 'Metabolic & Renal', desc: 'Flags high-dose NSAIDs, aminoglycosides & iodinated contrast' },
  { name: 'Liver Cirrhosis / Hepatic Impairment', category: 'Metabolic & Renal', desc: 'Paracetamol hepatotoxicity thresholds & hepatic CYP clearance flags' },
  { name: 'Chronic Hepatitis (Hep B / Hep C)', category: 'Metabolic & Renal', desc: 'Flags hepatotoxic excipients and enzyme-inducing medications' },
  { name: 'Non-Alcoholic Fatty Liver Disease (NAFLD)', category: 'Metabolic & Renal', desc: 'Monitors lipid-metabolized pharmaceuticals and alcohol-base tinctures' },
  { name: 'Gout / Hyperuricemia', category: 'Metabolic & Renal', desc: 'Flags thiazide diuretics, aspirin and niacin-induced uric acid spikes' },
  { name: 'Kidney Stones (Nephrolithiasis)', category: 'Metabolic & Renal', desc: 'Flags high-dose calcium/vitamin C, topiramate & carbonic anhydrase inhibitors' },

  // Respiratory & Gastrointestinal
  { name: 'Asthma (Bronchial Asthma)', category: 'Respiratory & GI', desc: 'Aspirin/NSAID-exacerbated respiratory disease & non-selective beta-blockers' },
  { name: 'Chronic Obstructive Pulmonary Disease (COPD)', category: 'Respiratory & GI', desc: 'Flags CNS respiratory depressants, sedatives & opioids' },
  { name: 'Peptic Ulcer Disease (PUD)', category: 'Respiratory & GI', desc: 'GI mucosal irritation, bleeding risk & systemic NSAID contraindications' },
  { name: 'Gastroesophageal Reflux Disease (GERD)', category: 'Respiratory & GI', desc: 'Flags anticholinergics, calcium blockers & esophageal irritants' },
  { name: 'Ulcerative Colitis', category: 'Respiratory & GI', desc: 'Monitors mucosal irritants and NSAID-induced flare triggers' },
  { name: 'Crohn’s Disease', category: 'Respiratory & GI', desc: 'Monitors immunosuppressive absorption & enteric-coated drug bioavailability' },
  { name: 'Celiac Disease', category: 'Respiratory & GI', desc: 'Flags gluten-containing binders, starches and wheat-derived excipients' },
  { name: 'Irritable Bowel Syndrome (IBS)', category: 'Respiratory & GI', desc: 'Monitors sorbitol, osmotic laxatives & pro-motility stimulants' },
  { name: 'Chronic Pancreatitis', category: 'Respiratory & GI', desc: 'Flags drug-induced pancreatitis agents (valproate, azathioprine, tetracycline)' },
  { name: 'Gallbladder Disease / Gallstones', category: 'Respiratory & GI', desc: 'Monitors lipid-clearing agents and biliary colic triggers' },

  // Neurological & Autoimmune
  { name: 'Epilepsy / Seizure Disorders', category: 'Neurological & Autoimmune', desc: 'Flags proconvulsant agents (tramadol, bupropion, fluoroquinolones)' },
  { name: 'Migraine Headaches (Chronic)', category: 'Neurological & Autoimmune', desc: 'Monitors vasoconstrictors (triptans, ergotamines) & tyramine triggers' },
  { name: 'Parkinson’s Disease', category: 'Neurological & Autoimmune', desc: 'Flags dopamine D2 receptor antagonists and neuroleptic interactions' },
  { name: 'Alzheimer’s Disease / Cognitive Decline', category: 'Neurological & Autoimmune', desc: 'Flags high-anticholinergic-burden drugs & sedative delirium risks' },
  { name: 'Ischemic Stroke / TIA History', category: 'Neurological & Autoimmune', desc: 'Monitors blood thinners, hemorrhagic risks & sympathomimetics' },
  { name: 'Rheumatoid Arthritis (RA)', category: 'Neurological & Autoimmune', desc: 'Monitors methotrexate, biologics & NSAID multi-organ toxicity' },
  { name: 'Systemic Lupus Erythematosus (SLE)', category: 'Neurological & Autoimmune', desc: 'Flags drug-induced lupus triggers (hydralazine, procainamide, isoniazid)' },
  { name: 'Multiple Sclerosis (MS)', category: 'Neurological & Autoimmune', desc: 'Monitors immunomodulator therapies, live vaccines & fever-inducing agents' },
  { name: 'Myasthenia Gravis', category: 'Neurological & Autoimmune', desc: 'Strict alerts on fluoroquinolones, aminoglycosides, beta-blockers & magnesium' },
  { name: 'Psoriasis (Plaque Psoriasis)', category: 'Neurological & Autoimmune', desc: 'Flags systemic withdrawal flares and beta-blocker/lithium triggers' },

  // Other Vital Conditions
  { name: 'Pregnancy (1st Trimester)', category: 'Other', desc: 'Strict Category C/D/X teratogen contraindications & organogenesis safety' },
  { name: 'Pregnancy (2nd / 3rd Trimester)', category: 'Other', desc: 'Monitors preeclampsia risk, premature ductus arteriosus closure from NSAIDs' },
  { name: 'Breastfeeding / Lactation', category: 'Other', desc: 'Alerts for active metabolites excreted into breast milk & infant sedation' },
  { name: 'Sickle Cell Disease (HbSS / HbSC)', category: 'Other', desc: 'Monitors dehydration-inducing diuretics, hypoxia triggers & acidosis' },
  { name: 'G6PD Deficiency', category: 'Other', desc: 'Severe hemolytic anemia triggers (primaquine, sulfas, nitrofurantoin, dapsone)' },
  { name: 'Bleeding Disorders (Hemophilia / vWD)', category: 'Other', desc: 'Absolute contraindications on anticoagulants, antiplatelets & high-dose NSAIDs' },
  { name: 'Glaucoma (Closed-Angle)', category: 'Other', desc: 'Severe hazard on anticholinergics, decongestants & pupil-dilating agents' },
  { name: 'Glaucoma (Open-Angle)', category: 'Other', desc: 'Monitors corticosteroid-induced intraocular pressure elevation' },
  { name: 'Benign Prostatic Hyperplasia (BPH)', category: 'Other', desc: 'Flags urinary retention from oral decongestants and first-gen antihistamines' },
  { name: 'Hypothyroidism (Underactive Thyroid)', category: 'Other', desc: 'Flags levothyroxine absorption inhibitors (calcium carbonate, ferrous sulfate)' },
  { name: 'Hyperthyroidism / Graves’ Disease', category: 'Other', desc: 'Monitors sympathomimetics, iodine contrast & pseudoephedrine adrenergic spikes' },
  { name: 'Osteoporosis / Low Bone Density', category: 'Other', desc: 'Monitors long-term systemic corticosteroids & proton pump inhibitor calcium loss' },
  { name: 'Severe Depression (MDD)', category: 'Other', desc: 'Serotonin syndrome contraindications (MAOIs, SSRIs, SNRIs, tramadol, linezolid)' },
  { name: 'Generalized Anxiety Disorder (GAD)', category: 'Other', desc: 'Monitors high-dose central nervous system stimulants, caffeine & decongestants' },
  { name: 'Bipolar Disorder', category: 'Other', desc: 'Flags antidepressant-induced manic episode switching & lithium clearance changes' },
  { name: 'Active Cancer / Chemotherapy', category: 'Other', desc: 'Flags myelosuppressive clash, immunosuppression risks & CYP3A4 inhibitors' },
  { name: 'Organ Transplant Recipient', category: 'Other', desc: 'Critical narrow-therapeutic-index flags on tacrolimus and cyclosporine levels' },
  { name: 'HIV / AIDS (Antiretroviral Therapy)', category: 'Other', desc: 'CYP3A4/protease inhibitor contraindications, ritonavir booster interactions' },
];

const CONDITION_CATEGORIES = [
  'All',
  'Cardiovascular',
  'Metabolic & Renal',
  'Respiratory & GI',
  'Neurological & Autoimmune',
  'Other',
];

export default function SetupStep3Screen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { userProfile, selectUserProfile } = useTrustLens();

  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    userProfile?.conditions ? userProfile.conditions.split(',').filter(Boolean) : ['Hypertension (High Blood Pressure)']
  );
  const [customInput, setCustomInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const maxContentWidth = Math.min(width - 32, 520);
  const currentBg = BrandColors.light.background;
  const currentCard = BrandColors.light.card;
  const currentBorder = BrandColors.light.surfaceBorder;
  const currentText = BrandColors.light.text;
  const currentMuted = BrandColors.light.textSecondary;

  const toggleCondition = (name: string) => {
    setSelectedConditions((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const addCustomCondition = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selectedConditions.includes(trimmed)) {
      setSelectedConditions((prev) => [...prev, trimmed]);
      setCustomInput('');
    }
  };

  const handleComplete = async () => {
    await selectUserProfile({
      name: userProfile?.name || 'Clinical User',
      email: userProfile?.email || '',
      age: userProfile?.age || 28,
      gender: userProfile?.gender || 'Prefer not to say',
      country: userProfile?.country || 'Nigeria',
      allergies: userProfile?.allergies ? userProfile.allergies.split(',').filter(Boolean) : [],
      conditions: selectedConditions,
      hasGivenBirth: userProfile?.hasGivenBirth || 'No',
      childrenCount: userProfile?.childrenCount || 0,
      hadSurgery: userProfile?.hadSurgery || 'No',
      surgeryType: userProfile?.surgeryType || 'None',
    });
    router.replace('/(tabs)');
  };

  const filteredConditions = COMPREHENSIVE_CONDITIONS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeCategory !== 'All' && item.category !== activeCategory) {
      return false;
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
            <Text style={[styles.progressLabel, { color: currentMuted }]}>STEP 3 OF 3</Text>
            <View style={styles.dotsRow}>
              <View style={[styles.dot, { backgroundColor: currentBorder }]} />
              <View style={[styles.dot, { backgroundColor: currentBorder }]} />
              <View style={[styles.dot, styles.dotActive]} />
            </View>
          </View>

          {/* Title block */}
          <View style={styles.headingBlock}>
            <Text style={[styles.title, { color: currentText }]}>Medical Conditions</Text>
            <Text style={[styles.subtitle, { color: currentMuted }]}>
              Chronic conditions calibrate precision drug-disease contraindications against WHO and NAFDAC/FDA black-box safety warnings.
            </Text>
          </View>

          {/* Search Box */}
          <View style={[styles.searchBox, { backgroundColor: currentCard, borderColor: currentBorder }]}>
            <Ionicons name="search" size={18} color={currentMuted} />
            <TextInput
              style={[styles.searchInput, { color: currentText }]}
              placeholder="Search 50+ medical conditions & flags..."
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

          {/* Category Horizontal Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CONDITION_CATEGORIES.map((cat) => {
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

          {/* Add custom condition */}
          <View style={[styles.addBox, { backgroundColor: currentCard, borderColor: currentBorder }]}>
            <TextInput
              style={[styles.addInput, { color: currentText }]}
              placeholder="Add other medical condition (e.g. Scleroderma)..."
              placeholderTextColor={currentMuted}
              value={customInput}
              onChangeText={setCustomInput}
              onSubmitEditing={addCustomCondition}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addCustomCondition} activeOpacity={0.8}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Active Counter Header */}
          <View style={styles.selectedCountBanner}>
            <Ionicons name="fitness-outline" size={16} color={BrandColors.safe} />
            <Text style={styles.selectedCountText}>
              {selectedConditions.length} clinical conditions monitored
            </Text>
          </View>

          {/* Conditions List Cards */}
          <View style={styles.cardsList}>
            {filteredConditions.map((item) => {
              const isSelected = selectedConditions.includes(item.name);
              return (
                <TouchableOpacity
                  key={item.name}
                  style={[
                    styles.conditionCard,
                    { backgroundColor: currentCard, borderColor: currentBorder },
                    isSelected && {
                      backgroundColor: BrandColors.cardGrid.sage.bg,
                      borderColor: BrandColors.cardGrid.sage.border,
                    },
                  ]}
                  onPress={() => toggleCondition(item.name)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeaderRow}>
                    <Text
                      style={[
                        styles.conditionName,
                        { color: isSelected ? BrandColors.cardGrid.sage.title : currentText },
                        isSelected && { fontWeight: '800' },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Ionicons
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={isSelected ? BrandColors.cardGrid.sage.title : currentMuted}
                    />
                  </View>
                  <Text
                    style={[
                      styles.conditionDesc,
                      { color: isSelected ? BrandColors.cardGrid.sage.subtitle : currentMuted },
                    ]}
                  >
                    {item.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Complete Button */}
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={handleComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.completeBtnText}>
              Launch Health Dashboard ({selectedConditions.length} active)
            </Text>
            <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
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
  cardsList: {
    gap: 10,
    marginBottom: 24,
  },
  conditionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conditionName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  conditionDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  completeBtn: {
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
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
