plugins { id("matrigluco.android.library"); id("matrigluco.android.hilt"); alias(libs.plugins.kotlin.serialization) }
android { namespace = "com.matrigluco.feature.assistant" }
dependencies {
    implementation(project(":core:auth")); implementation(project(":core:designsystem")); implementation(project(":core:network")); implementation(project(":core:ui"))
    implementation(libs.androidx.core.ktx); implementation(libs.androidx.fragment.ktx); implementation(libs.androidx.navigation.fragment); implementation(libs.androidx.lifecycle.runtime); implementation(libs.androidx.lifecycle.viewmodel); implementation(libs.androidx.recyclerview)
    implementation(libs.androidx.datastore.preferences); implementation(libs.retrofit.core); implementation(libs.kotlinx.serialization.json); implementation(libs.kotlinx.coroutines.core); implementation(libs.hilt.android); implementation(libs.material)
    testImplementation(libs.junit); testImplementation(libs.kotlinx.coroutines.test); testImplementation(libs.okhttp.mockwebserver)
}
