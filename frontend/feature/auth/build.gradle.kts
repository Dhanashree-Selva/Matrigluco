plugins { id("matrigluco.android.library"); id("matrigluco.android.hilt"); alias(libs.plugins.kotlin.serialization) }
android { namespace = "com.matrigluco.feature.auth"; buildFeatures.viewBinding = true }
dependencies {
    implementation(project(":core:auth")); implementation(project(":core:model")); implementation(project(":core:network"))
    implementation(project(":core:designsystem")); implementation(project(":core:ui"))
    implementation(libs.androidx.fragment.ktx); implementation(libs.androidx.navigation.fragment); implementation(libs.androidx.lifecycle.viewmodel)
    implementation(libs.retrofit.core); implementation(libs.kotlinx.serialization.json); implementation(libs.kotlinx.coroutines.core)
    testImplementation(project(":core:testing")); testImplementation(libs.junit); testImplementation(libs.kotlinx.coroutines.test); testImplementation(libs.turbine); testImplementation(libs.okhttp.mockwebserver)
}
