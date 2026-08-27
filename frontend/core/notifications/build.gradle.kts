plugins { id("matrigluco.android.library") }
android { namespace = "com.matrigluco.core.notifications" }
dependencies {
    implementation(libs.androidx.core.ktx)
    testImplementation(libs.junit)
}
