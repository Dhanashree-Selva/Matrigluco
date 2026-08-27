package com.matrigluco.feature.assistant.di

import com.matrigluco.feature.assistant.data.ChatRepositoryImpl
import com.matrigluco.feature.assistant.data.local.DataStoreChatDraftStore
import com.matrigluco.feature.assistant.data.remote.*
import com.matrigluco.feature.assistant.domain.ChatDraftStore
import com.matrigluco.feature.assistant.domain.ChatRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit

@Module @InstallIn(SingletonComponent::class) abstract class AssistantBindings { @Binds abstract fun repository(value:ChatRepositoryImpl):ChatRepository;@Binds abstract fun drafts(value:DataStoreChatDraftStore):ChatDraftStore }
@Module @InstallIn(SingletonComponent::class) object AssistantProviders { @Provides fun api(retrofit:Retrofit)=retrofit.create(ChatApi::class.java);@Provides fun remote(api:ChatApi):ChatRemoteDataSource=ChatRemoteDataSourceImpl(api) }
