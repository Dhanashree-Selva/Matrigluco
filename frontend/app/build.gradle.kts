plugins {
    id("matrigluco.android.application")
    id("matrigluco.android.hilt")
}

fun apiBaseUrl(propertyName: String, defaultValue: String): String =
    providers.gradleProperty(propertyName)
        .orElse(providers.environmentVariable(propertyName))
        .orElse(defaultValue)
        .get()

android {
    namespace = "com.matrigluco.app"

    defaultConfig {
        applicationId = "com.matrigluco.app"
        versionCode = 1
        versionName = "0.1.0"
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
            buildConfigField("String", "APP_ENV", "\"debug\"")
            buildConfigField("String", "API_BASE_URL", "\"${apiBaseUrl("MATRIGLUCO_DEBUG_API_BASE_URL", "http://10.0.2.2:8000/")}\"")
        }
        create("staging") {
            initWith(getByName("release"))
            matchingFallbacks += listOf("release")
            applicationIdSuffix = ".staging"
            versionNameSuffix = "-staging"
            isDebuggable = false
            buildConfigField("String", "APP_ENV", "\"staging\"")
            buildConfigField("String", "API_BASE_URL", "\"${apiBaseUrl("MATRIGLUCO_STAGING_API_BASE_URL", "https://staging-api.matrigluco.invalid/")}\"")
        }
        release {
            buildConfigField("String", "APP_ENV", "\"release\"")
            buildConfigField("String", "API_BASE_URL", "\"${apiBaseUrl("MATRIGLUCO_RELEASE_API_BASE_URL", "")}\"")
            optimization {
                enable = true
            }
        }
    }
    buildFeatures.buildConfig = true
}

dependencies {
    implementation(project(":core:common"))
    implementation(project(":core:auth"))
    implementation(project(":core:designsystem"))
    implementation(project(":core:ui"))
    implementation(project(":core:network"))
    implementation(project(":core:database"))
    implementation(project(":core:datastore"))
    implementation(project(":core:notifications"))
    implementation(project(":sync"))
    implementation(project(":feature:startup"))
    implementation(project(":feature:auth"))
    implementation(project(":feature:dashboard"))
    implementation(project(":feature:tracking"))
    implementation(project(":feature:assessment"))
    implementation(project(":feature:assistant"))
    implementation(project(":feature:reports"))
    implementation(project(":feature:history"))
    implementation(libs.androidx.activity)
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.fragment.ktx)
    implementation(libs.androidx.navigation.fragment)
    implementation(libs.androidx.navigation.ui)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.material)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime)
    implementation(libs.androidx.swiperefreshlayout)
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.retrofit.core)
    implementation(libs.androidx.profileinstaller)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
}

val configuredReleaseApiUrl = providers.gradleProperty("MATRIGLUCO_RELEASE_API_BASE_URL")
    .orElse(providers.environmentVariable("MATRIGLUCO_RELEASE_API_BASE_URL"))
    .orNull

tasks.matching { it.name == "preReleaseBuild" }.configureEach {
    inputs.property("releaseApiUrl", configuredReleaseApiUrl ?: "")
    doFirst {
        val url = inputs.properties["releaseApiUrl"] as String
        require(!url.isNullOrBlank()) { "MATRIGLUCO_RELEASE_API_BASE_URL is required for release builds." }
        require(url.startsWith("https://") && url.endsWith("/")) { "Release API URL must use HTTPS and end with '/'." }
    }
}
