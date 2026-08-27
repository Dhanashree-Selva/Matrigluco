plugins { id("matrigluco.android.library"); id("matrigluco.android.hilt") }
android { namespace = "com.matrigluco.sync" }
dependencies {
    implementation(project(":core:auth"))
    implementation(libs.androidx.work.runtime)
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.hilt.android)
    testImplementation(libs.junit)
}
