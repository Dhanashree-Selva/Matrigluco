plugins { id("matrigluco.android.library"); id("matrigluco.android.hilt") }
android { namespace = "com.matrigluco.core.database"; buildFeatures.viewBinding = false }
ksp { arg("room.schemaLocation", "$projectDir/schemas") }
dependencies {
    implementation(libs.androidx.room.runtime); implementation(libs.androidx.room.ktx); implementation(libs.kotlinx.coroutines.core)
    ksp(libs.androidx.room.compiler)
    testImplementation(libs.junit); testImplementation(libs.androidx.room.testing)
    androidTestImplementation(libs.androidx.junit); androidTestImplementation(libs.androidx.room.testing); androidTestImplementation(libs.kotlinx.coroutines.test)
}
