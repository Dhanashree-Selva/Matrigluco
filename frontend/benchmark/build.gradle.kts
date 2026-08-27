plugins {
    id("com.android.test")
}

android {
    namespace = "com.matrigluco.benchmark"
    compileSdk = 36
    targetProjectPath = ":app"

    defaultConfig {
        minSdk = 28
        targetSdk = 36
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
}

dependencies {
    implementation(libs.androidx.junit)
    implementation(libs.androidx.benchmark.macro)
    implementation(libs.androidx.uiautomator)
}
