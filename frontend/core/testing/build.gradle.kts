plugins { id("matrigluco.android.library") }
android { namespace = "com.matrigluco.core.testing"; buildFeatures.viewBinding = false }
dependencies { implementation(libs.junit); implementation(libs.kotlinx.coroutines.test); implementation(libs.turbine); implementation(libs.okhttp.mockwebserver) }
