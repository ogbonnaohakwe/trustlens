import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../viewmodels/trust_lens_viewmodel.dart';

// Helper to provide nice icons for allergies
IconData _getAllergyIcon(String name) {
  switch (name) {
    case 'Nuts':
      return Icons.fiber_manual_record;
    case 'Milk':
      return Icons.water_drop_rounded;
    case 'Soy':
      return Icons.eco_rounded;
    case 'Gluten':
      return Icons.grain_rounded;
    case 'Seafood':
      return Icons.set_meal_rounded;
    case 'Eggs':
      return Icons.egg_rounded;
    case 'Peanuts':
      return Icons.bubble_chart_rounded;
    case 'Shellfish':
      return Icons.water_rounded;
    case 'Sesame':
      return Icons.grass_rounded;
    default:
      return Icons.check_circle_outline_rounded;
  }
}

// Custom setup AppBar
PreferredSizeWidget _buildSetupAppBar(BuildContext context) {
  return AppBar(
    backgroundColor: const Color(0xFF060B13),
    elevation: 0,
    iconTheme: const IconThemeData(color: Colors.white),
    bottom: PreferredSize(
      preferredSize: const Size.fromHeight(1.0),
      child: Container(
        color: const Color(0xFF1E293B),
        height: 1.0,
      ),
    ),
    title: Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Image.asset(
          'assets/tplus.png',
          width: 22,
          height: 22,
          errorBuilder: (_, __, ___) => const Icon(
            Icons.shield,
            color: Color(0xFFE50914),
            size: 22,
          ),
        ),
        const SizedBox(width: 8),
        const Text(
          'TrustLenAI Setup',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(width: 30), // Offset to center properly
      ],
    ),
  );
}

// STEP 1 SCREEN
class SetupStep1Screen extends StatefulWidget {
  const SetupStep1Screen({super.key});

  @override
  State<SetupStep1Screen> createState() => _SetupStep1ScreenState();
}

class _SetupStep1ScreenState extends State<SetupStep1Screen> {
  final TextEditingController _ageController = TextEditingController(text: '34');
  String _selectedGender = 'Male';

  @override
  void dispose() {
    _ageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<TrustLensViewModel>(context);

    return Scaffold(
      appBar: _buildSetupAppBar(context),
      bottomNavigationBar: Container(
        color: const Color(0xFF060B13),
        padding: const EdgeInsets.all(20.0),
        child: SizedBox(
          width: double.infinity,
          height: 56,
          child: ElevatedButton(
            onPressed: () {
              final age = int.tryParse(_ageController.text) ?? 34;
              final name = viewModel.userProfile?['name'] ?? 'Clinical Partner';
              viewModel.selectUserProfile(
                name: name,
                email: viewModel.userProfile?['email'] ?? 'user@example.com',
                age: age,
                gender: _selectedGender,
                country: 'United States',
                allergies: [],
                conditions: [],
              );
              viewModel.navigateTo(ScreenState.setupStep2);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE50914),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 0,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Text(
                  'NEXT STEP',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                ),
                SizedBox(width: 8),
                Icon(Icons.arrow_forward_rounded, color: Colors.white),
              ],
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Progress Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text(
                  'STEP 1 OF 3',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFE50914), letterSpacing: 1),
                ),
                Text(
                  'Basic parameters',
                  style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(99),
              child: const LinearProgressIndicator(
                value: 0.33,
                color: Color(0xFFE50914),
                backgroundColor: Color(0xFF1E293B),
                minHeight: 6,
              ),
            ),
            const SizedBox(height: 28),
            // Header
            const Text(
              'Setup Your Health Profile',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 8),
            const Text(
              'To provide accurate analytical indicators, our neural models calibrate biological risks near your local environments.',
              style: TextStyle(fontSize: 14, height: 1.4, color: Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 28),
            // Age Box
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.date_range_rounded, color: Color(0xFFE50914)),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Age',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Calibrates specific threshold tolerances.',
                            style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                          ),
                          const SizedBox(height: 12),
                          TextField(
                            controller: _ageController,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            decoration: const InputDecoration(
                              contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Gender Box
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.wc_rounded, color: Color(0xFFE50914)),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Biological Gender',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Provides medical risk check ranges.',
                            style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: ['Male', 'Female'].map((gender) {
                              final isSelected = _selectedGender == gender;
                              return Expanded(
                                child: GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _selectedGender = gender;
                                    });
                                  },
                                  child: Container(
                                    height: 50,
                                    margin: EdgeInsets.only(
                                      right: gender == 'Male' ? 6 : 0,
                                      left: gender == 'Female' ? 6 : 0,
                                    ),
                                    decoration: BoxDecoration(
                                      color: isSelected ? const Color(0xFF2E090F) : Colors.transparent,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: isSelected ? const Color(0xFFE50914) : const Color(0xFF1E293B),
                                        width: isSelected ? 2 : 1,
                                      ),
                                    ),
                                    alignment: Alignment.center,
                                    child: Text(
                                      gender,
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: isSelected ? const Color(0xFFE50914) : const Color(0xFF94A3B8),
                                        fontSize: 14,
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// STEP 2 SCREEN
class SetupStep2Screen extends StatefulWidget {
  const SetupStep2Screen({super.key});

  @override
  State<SetupStep2Screen> createState() => _SetupStep2ScreenState();
}

class _SetupStep2ScreenState extends State<SetupStep2Screen> {
  final List<String> _allergyOptions = ['Nuts', 'Milk', 'Soy', 'Gluten', 'Seafood', 'Eggs', 'Peanuts', 'Shellfish', 'Sesame'];
  final List<String> _selectedAllergies = [];

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<TrustLensViewModel>(context);

    return Scaffold(
      appBar: _buildSetupAppBar(context),
      bottomNavigationBar: Container(
        color: const Color(0xFF060B13),
        padding: const EdgeInsets.all(20.0),
        child: Row(
          children: [
            Expanded(
              child: SizedBox(
                height: 56,
                child: OutlinedButton(
                  onPressed: () {
                    final user = viewModel.userProfile;
                    if (user != null) {
                      viewModel.selectUserProfile(
                        name: user['name'],
                        email: user['email'],
                        age: user['age'],
                        gender: user['gender'],
                        country: user['country'],
                        allergies: [],
                        conditions: user['conditions'].toString().split(',').where((e) => e.isNotEmpty).toList(),
                      );
                    }
                    viewModel.navigateTo(ScreenState.setupStep3);
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF1E293B)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text(
                    'Skip',
                    style: TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: SizedBox(
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    final user = viewModel.userProfile;
                    if (user != null) {
                      viewModel.selectUserProfile(
                        name: user['name'],
                        email: user['email'],
                        age: user['age'],
                        gender: user['gender'],
                        country: user['country'],
                        allergies: _selectedAllergies,
                        conditions: user['conditions'].toString().split(',').where((e) => e.isNotEmpty).toList(),
                      );
                    }
                    viewModel.navigateTo(ScreenState.setupStep3);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE50914),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Continue',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Progress Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text(
                  'SETUP PROFILE',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFE50914), letterSpacing: 1),
                ),
                Text(
                  'Step 2 of 3',
                  style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(99),
              child: const LinearProgressIndicator(
                value: 0.66,
                color: Color(0xFFE50914),
                backgroundColor: Color(0xFF1E293B),
                minHeight: 6,
              ),
            ),
            const SizedBox(height: 20),
            // Header
            const Text(
              'Allergies & Dietary',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 6),
            const Text(
              'Select all substances that cause an allergic reaction. This data guarantees high-precision safety evaluation.',
              style: TextStyle(fontSize: 14, height: 1.4, color: Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 20),
            // Grid options
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.1,
                ),
                itemCount: _allergyOptions.length,
                itemBuilder: (context, index) {
                  final allergy = _allergyOptions[index];
                  final isSelected = _selectedAllergies.contains(allergy);

                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        if (isSelected) {
                          _selectedAllergies.remove(allergy);
                        } else {
                          _selectedAllergies.add(allergy);
                        }
                      });
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF2E090F) : const Color(0xFF0D1520),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isSelected ? const Color(0xFFE50914) : const Color(0xFF1E293B),
                          width: isSelected ? 2 : 1.5,
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFFE50914) : const Color(0xFF1E293B),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              _getAllergyIcon(allergy),
                              color: isSelected ? Colors.white : const Color(0xFFE50914),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            allergy,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 12),
            // Info Alert
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF0D1520),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              padding: const EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Icon(Icons.info_outline_rounded, color: Color(0xFFE50914)),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Selection accuracy is critical. High-Contrast detection filters prioritize scanning for specific allergen markers in chemical lists.',
                      style: TextStyle(fontSize: 11, height: 1.4, color: Color(0xFF94A3B8)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// STEP 3 SCREEN
class SetupStep3Screen extends StatefulWidget {
  const SetupStep3Screen({super.key});

  @override
  State<SetupStep3Screen> createState() => _SetupStep3ScreenState();
}

class _SetupStep3ScreenState extends State<SetupStep3Screen> {
  final List<Map<String, String>> _conditionOptions = [
    {'name': 'Diabetes', 'desc': 'Type 1 or Type 2 management'},
    {'name': 'Hypertension', 'desc': 'Chronic high blood pressure'},
    {'name': 'Heart Disease', 'desc': 'History of cardiovascular issues'},
    {'name': 'Kidney Disease', 'desc': 'Chronic kidney conditions (CKD)'},
    {'name': 'Pregnancy Status', 'desc': 'Currently pregnant or postpartum'},
    {'name': 'Celiac Disease', 'desc': 'Strict gluten-free safety audit'},
    {'name': 'Hyperlipidemia', 'desc': 'High cholesterol & lipid management'},
    {'name': 'Lactose Intolerance', 'desc': 'Dairy & lactose sensitive tracking'},
    {'name': 'Gout', 'desc': 'Uric acid & high-purine watch list'},
    {'name': 'Gastritis / GERD', 'desc': 'Acid reflux & stomach sensitivity alert'},
    {'name': 'Thyroid Disorder', 'desc': 'Hypo/Hyperthyroidism nutritional balance'},
    {'name': 'Asthma', 'desc': 'Airways & food-preservative allergen guard'},
    {'name': 'IBS', 'desc': 'FODMAP restriction & digestive tract care'}
  ];

  final List<String> _selectedConditions = [];

  void _finishSetup(TrustLensViewModel viewModel, List<String> conditions) async {
    final user = viewModel.userProfile;
    if (user != null) {
      final allergies = user['allergies'].toString().split(',').where((e) => e.isNotEmpty).toList();
      await viewModel.selectUserProfile(
        name: user['name'],
        email: user['email'],
        age: user['age'],
        gender: user['gender'],
        country: user['country'],
        allergies: allergies,
        conditions: conditions,
      );
    }
    viewModel.navigateTo(ScreenState.dashboard);
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<TrustLensViewModel>(context);

    return Scaffold(
      appBar: _buildSetupAppBar(context),
      bottomNavigationBar: Container(
        color: const Color(0xFF060B13),
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => _finishSetup(viewModel, _selectedConditions),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE50914),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'COMPLETE SETUP',
                  style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5),
                ),
              ),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => _finishSetup(viewModel, []),
              child: const Text(
                'Skip for now',
                style: TextStyle(
                  color: Color(0xFF94A3B8),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Progress Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'STEP 3 OF 3',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 1),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Medical Conditions',
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ],
                ),
                const Text(
                  '100% Ready',
                  style: TextStyle(fontSize: 13, color: Color(0xFFE50914), fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(99),
              child: const LinearProgressIndicator(
                value: 1.0,
                color: Color(0xFFE50914),
                backgroundColor: Color(0xFF1E293B),
                minHeight: 6,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Please select all conditions that apply to your current health status for accurate AI matching.',
              style: TextStyle(fontSize: 14, color: Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 16),
            // Scrollable List
            Expanded(
              child: ListView.builder(
                itemCount: _conditionOptions.length,
                itemBuilder: (context, index) {
                  final option = _conditionOptions[index];
                  final name = option['name']!;
                  final desc = option['desc']!;
                  final isChecked = _selectedConditions.contains(name);

                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        if (isChecked) {
                          _selectedConditions.remove(name);
                        } else {
                          _selectedConditions.add(name);
                        }
                      });
                    },
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isChecked ? const Color(0xFF2E090F) : const Color(0xFF0D1520),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isChecked ? const Color(0xFFE50914) : const Color(0xFF1E293B),
                          width: isChecked ? 2 : 1.5,
                        ),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  name,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: isChecked ? Colors.white : const Color(0xFFE2E8F0),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  desc,
                                  style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              color: isChecked ? const Color(0xFFE50914) : Colors.transparent,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isChecked ? const Color(0xFFE50914) : const Color(0xFF475569),
                                width: 2,
                              ),
                            ),
                            child: isChecked
                                ? const Icon(Icons.check, size: 16, color: Colors.white)
                                : null,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
