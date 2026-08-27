plugins { id("matrigluco.android.library") }
android { namespace = "com.matrigluco.feature.startup"; buildFeatures.viewBinding = false }
dependencies { implementation(project(":core:auth")) }
