plugins { id("matrigluco.android.library"); id("matrigluco.android.hilt"); alias(libs.plugins.kotlin.serialization) }
android { namespace = "com.matrigluco.core.network"; buildFeatures.viewBinding = false }
dependencies {
    implementation(project(":core:common"))
    implementation(libs.retrofit.core)
    implementation(libs.retrofit.kotlinx.serialization)
    implementation(libs.okhttp.core)
    implementation(libs.okhttp.logging)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.androidx.core.ktx)
    implementation(libs.kotlinx.coroutines.core)
    testImplementation(libs.junit)
    testImplementation(libs.okhttp.mockwebserver)
}
