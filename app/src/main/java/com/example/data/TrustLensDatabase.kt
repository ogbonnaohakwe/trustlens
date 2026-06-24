package com.example.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [UserEntity::class, ScanEntity::class], version = 2, exportSchema = false)
abstract class TrustLensDatabase : RoomDatabase() {
    abstract fun trustLensDao(): TrustLensDao

    companion object {
        @Volatile
        private var INSTANCE: TrustLensDatabase? = null

        fun getDatabase(context: Context): TrustLensDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    TrustLensDatabase::class.java,
                    "trust_lens_db"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
