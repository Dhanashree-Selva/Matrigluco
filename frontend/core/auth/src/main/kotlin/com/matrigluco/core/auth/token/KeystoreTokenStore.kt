package com.matrigluco.core.auth.token

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.io.File
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json

class KeystoreTokenStore(context: Context, private val json: Json) : SecureTokenStore {
    private val directory = File(context.noBackupFilesDir, "auth")
    private val file = File(directory, "session.bin")
    override suspend fun read(): TokenSnapshot? = withContext(Dispatchers.IO) {
        if (!file.exists()) return@withContext null
        val bytes = file.readBytes(); if (bytes.size < 13) error("Invalid encrypted session")
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, bytes.copyOfRange(0, 12)))
        json.decodeFromString<TokenSnapshot>(cipher.doFinal(bytes.copyOfRange(12, bytes.size)).decodeToString())
    }
    override suspend fun write(tokens: TokenSnapshot) = withContext(Dispatchers.IO) {
        directory.mkdirs()
        val cipher = Cipher.getInstance(TRANSFORMATION); cipher.init(Cipher.ENCRYPT_MODE, key())
        val encrypted = cipher.iv + cipher.doFinal(json.encodeToString(TokenSnapshot.serializer(), tokens).encodeToByteArray())
        val temporary = File(directory, "session.tmp"); temporary.writeBytes(encrypted)
        check(temporary.renameTo(file) || run { file.delete(); temporary.renameTo(file) }) { "Unable to atomically persist session" }
    }
    override suspend fun clear() = withContext(Dispatchers.IO) { file.delete(); Unit }
    private fun key(): SecretKey {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (store.getKey(ALIAS, null) as? SecretKey)?.let { return it }
        return KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore").apply {
            init(KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build())
        }.generateKey()
    }
    private companion object { const val ALIAS = "matrigluco_session_v1"; const val TRANSFORMATION = "AES/GCM/NoPadding" }
}
