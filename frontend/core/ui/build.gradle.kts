plugins { id("matrigluco.android.library") }
android { namespace = "com.matrigluco.core.ui" }
dependencies { implementation(project(":core:designsystem")); implementation(libs.androidx.core.ktx); implementation(libs.androidx.fragment.ktx); implementation(libs.androidx.lifecycle.runtime); testImplementation(libs.junit) }
