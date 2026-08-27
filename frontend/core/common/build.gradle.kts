plugins { id("matrigluco.android.library") }
android { namespace = "com.matrigluco.core.common"; buildFeatures.viewBinding = false }
dependencies { testImplementation(libs.junit) }
