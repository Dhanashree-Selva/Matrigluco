plugins { id("matrigluco.android.library"); id("matrigluco.android.hilt"); alias(libs.plugins.kotlin.serialization) }
android { namespace = "com.matrigluco.core.auth"; buildFeatures.viewBinding = false }
dependencies {
    implementation(project(":core:network"))
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.kotlinx.serialization.json)
    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
}
