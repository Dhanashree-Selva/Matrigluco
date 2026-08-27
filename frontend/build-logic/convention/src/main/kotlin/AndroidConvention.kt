import com.android.build.api.dsl.ApplicationExtension
import com.android.build.api.dsl.LibraryExtension
import org.gradle.api.JavaVersion

internal fun ApplicationExtension.configureMatriglucoAndroid() {
    compileSdk { version = release(36) { minorApiLevel = 1 } }
    defaultConfig { minSdk = 24; targetSdk = 36; testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner" }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    buildFeatures.viewBinding = true
    testOptions.unitTests.isIncludeAndroidResources = true
}

internal fun LibraryExtension.configureMatriglucoAndroid() {
    compileSdk { version = release(36) { minorApiLevel = 1 } }
    defaultConfig { minSdk = 24; testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner" }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    buildFeatures.viewBinding = true
    testOptions.unitTests.isIncludeAndroidResources = true
}
