plugins { `kotlin-dsl`; `java-gradle-plugin` }
group = "com.matrigluco.buildlogic"
dependencies {
    implementation("com.android.tools.build:gradle:9.1.0")
    implementation("com.google.dagger:hilt-android-gradle-plugin:2.60.1")
    implementation("com.google.devtools.ksp:symbol-processing-gradle-plugin:2.3.10")
}
gradlePlugin {
    plugins {
        register("androidApplication") { id = "matrigluco.android.application"; implementationClass = "AndroidApplicationConventionPlugin" }
        register("androidLibrary") { id = "matrigluco.android.library"; implementationClass = "AndroidLibraryConventionPlugin" }
        register("androidHilt") { id = "matrigluco.android.hilt"; implementationClass = "AndroidHiltConventionPlugin" }
    }
}
