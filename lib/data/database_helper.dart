import 'dart:async';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

class DatabaseHelper {
  static DatabaseHelper instance = DatabaseHelper.internal();
  static Database? _database;

  DatabaseHelper.internal();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('trustlens.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE user_profile (
        email TEXT PRIMARY KEY,
        name TEXT,
        age INTEGER,
        gender TEXT,
        country TEXT,
        allergies TEXT,
        conditions TEXT,
        securityTier TEXT,
        isLoggedIn INTEGER
      )
    ''');

    await db.execute('''
      CREATE TABLE scan_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productName TEXT,
        productSubtitle TEXT,
        imageUrl TEXT,
        safetyScore INTEGER,
        safetyStatus TEXT,
        authenticityLabel TEXT,
        authenticityPercentage REAL,
        allergenAlertMessage TEXT,
        avoidIngredients TEXT,
        cautionIngredients TEXT,
        safeIngredients TEXT,
        fullMarkdownReport TEXT,
        timestamp INTEGER
      )
    ''');
  }

  // --- User Profile operations ---
  Future<Map<String, dynamic>?> getActiveUserProfile() async {
    final db = await instance.database;
    final maps = await db.query('user_profile', where: 'isLoggedIn = ?', whereArgs: [1], limit: 1);
    if (maps.isNotEmpty) {
      return maps.first;
    }
    return null;
  }

  Future<Map<String, dynamic>?> getUserProfile(String email) async {
    final db = await instance.database;
    final maps = await db.query(
      'user_profile',
      where: 'email = ?',
      whereArgs: [email.trim().toLowerCase()],
      limit: 1,
    );
    if (maps.isNotEmpty) {
      return maps.first;
    }
    return null;
  }

  Future<int> saveUserProfile(Map<String, dynamic> profile) async {
    final db = await instance.database;
    final email = (profile['email'] as String? ?? '').trim().toLowerCase();
    
    // Clean up profile dictionary to ensure email is formatted correctly
    final cleanProfile = Map<String, dynamic>.from(profile);
    cleanProfile['email'] = email;

    // If logging this user in, log out all other accounts first
    if (cleanProfile['isLoggedIn'] == 1) {
      await db.update('user_profile', {'isLoggedIn': 0});
    }

    return await db.insert(
      'user_profile',
      cleanProfile,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // --- Scan History operations ---
  Future<List<Map<String, dynamic>>> getAllScans() async {
    final db = await instance.database;
    return await db.query('scan_history', orderBy: 'timestamp DESC');
  }

  Future<int> saveScan(Map<String, dynamic> scan) async {
    final db = await instance.database;
    return await db.insert('scan_history', scan, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<int> deleteScan(int id) async {
    final db = await instance.database;
    return await db.delete('scan_history', where: 'id = ?', whereArgs: [id]);
  }

  Future<int> clearHistory() async {
    final db = await instance.database;
    return await db.delete('scan_history');
  }

  Future close() async {
    final db = _database;
    if (db != null) {
      await db.close();
    }
  }
}
