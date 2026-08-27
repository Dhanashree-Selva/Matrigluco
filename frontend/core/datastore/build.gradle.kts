plugins { id("matrigluco.android.library"); id("matrigluco.android.hilt") }
android { namespace = "com.matrigluco.core.datastore"; buildFeatures.viewBinding = false }
dependencies { implementation(libs.androidx.datastore.preferences); implementation(libs.kotlinx.coroutines.core); testImplementation(libs.junit); testImplementation(libs.kotlinx.coroutines.test) }
