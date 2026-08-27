plugins { id("matrigluco.android.library") }
android { namespace = "com.matrigluco.core.designsystem" }
dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    testImplementation(libs.junit)
}
