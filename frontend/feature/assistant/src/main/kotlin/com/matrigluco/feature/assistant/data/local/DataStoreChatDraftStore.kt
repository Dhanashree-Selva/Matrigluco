package com.matrigluco.feature.assistant.data.local

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.matrigluco.feature.assistant.domain.ChatDraftStore
import java.security.MessageDigest
import javax.inject.Inject
import kotlinx.coroutines.flow.first

class DataStoreChatDraftStore @Inject constructor(private val store:DataStore<Preferences>):ChatDraftStore{
    private fun key(owner:String,conversation:String)=stringPreferencesKey("chat_draft_"+MessageDigest.getInstance("SHA-256").digest("$owner:$conversation".toByteArray()).joinToString(""){"%02x".format(it)}.take(24))
    override suspend fun read(ownerId:String,conversationId:String)=store.data.first()[key(ownerId,conversationId)].orEmpty()
    override suspend fun write(ownerId:String,conversationId:String,text:String){store.edit{if(text.isBlank())it.remove(key(ownerId,conversationId))else it[key(ownerId,conversationId)]=text.take(2000)}}
    override suspend fun clear(ownerId:String,conversationId:String){store.edit{it.remove(key(ownerId,conversationId))}}
}
