package com.example.api

import android.util.Log
import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import java.util.concurrent.TimeUnit

@JsonClass(generateAdapter = true)
data class FirestoreUserDocument(
    val name: String? = null,
    val fields: FirestoreFields? = null
)

@JsonClass(generateAdapter = true)
data class FirestoreFields(
    val name: StringValue? = null,
    val email: StringValue? = null,
    val securityTier: StringValue? = null,
    val age: StringValue? = null,
    val gender: StringValue? = null,
    val country: StringValue? = null,
    val allergies: StringValue? = null,
    val conditions: StringValue? = null
)

@JsonClass(generateAdapter = true)
data class StringValue(
    val stringValue: String? = null
)

@JsonClass(generateAdapter = true)
data class AccountDeletionRequest(
    val email: String
)

@JsonClass(generateAdapter = true)
data class AccountDeletionResponse(
    val success: Boolean,
    val message: String? = null
)

interface FirestoreRestService {
    @GET("v1/projects/{projectId}/databases/(default)/documents/users/{email}")
    suspend fun getUserProfile(
        @Path("projectId") projectId: String,
        @Path("email") email: String
    ): FirestoreUserDocument

    @retrofit2.http.PATCH("v1/projects/{projectId}/databases/(default)/documents/users/{email}")
    suspend fun saveUserProfile(
        @Path("projectId") projectId: String,
        @Path("email") email: String,
        @Body document: FirestoreUserDocument
    ): FirestoreUserDocument
}

interface FirebaseFunctionsRestService {
    @POST("deleteUserAccount")
    suspend fun callAccountDeletion(
        @Body request: AccountDeletionRequest
    ): AccountDeletionResponse
}

object FirebaseRetrofitClient {
    private const val FIRESTORE_BASE_URL = "https://firestore.googleapis.com/"
    
    // Configurable cloud functions region and project ID.
    private const val FUNCTIONS_BASE_URL = "https://us-central1-trustlens-ai.cloudfunctions.net/"

    private val moshi = Moshi.Builder()
        .addLast(KotlinJsonAdapterFactory())
        .build()

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .addInterceptor(loggingInterceptor)
        .build()

    val firestoreService: FirestoreRestService by lazy {
        Retrofit.Builder()
            .baseUrl(FIRESTORE_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
            .create(FirestoreRestService::class.java)
    }

    val functionsService: FirebaseFunctionsRestService by lazy {
        Retrofit.Builder()
            .baseUrl(FUNCTIONS_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
            .create(FirebaseFunctionsRestService::class.java)
    }
}
