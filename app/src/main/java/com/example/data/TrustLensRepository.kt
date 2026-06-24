package com.example.data

import kotlinx.coroutines.flow.Flow

class TrustLensRepository(private val dao: TrustLensDao) {
    val userProfile: Flow<UserEntity?> = dao.getUserProfile()
    val allScans: Flow<List<ScanEntity>> = dao.getAllScans()

    suspend fun saveUserProfile(profile: UserEntity) {
        dao.insertUserProfile(profile)
    }

    suspend fun saveScan(scan: ScanEntity) {
        dao.insertScan(scan)
    }

    suspend fun deleteScan(id: Int) {
        dao.deleteScanById(id)
    }

    suspend fun clearHistory() {
        dao.clearAllScans()
    }
}
