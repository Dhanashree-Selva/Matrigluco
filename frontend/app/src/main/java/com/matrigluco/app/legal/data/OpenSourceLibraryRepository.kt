package com.matrigluco.app.legal.data

import com.matrigluco.app.legal.model.LicenseCategory
import com.matrigluco.app.legal.model.OpenSourceLibrary
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OpenSourceLibraryRepository @Inject constructor() {

    private val apache2LicenseText = """
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.
      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      patent license to make, have made, use, offer to sell, sell, import,
      and otherwise transfer the Work.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:
      (a) You must give any other recipients of the Work or Derivative
          Works a copy of this License; and
      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and
      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices.

   5. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE.
    """.trimIndent()

    private val mitLicenseText = """
        MIT License

        Copyright (c) 2026

        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:

        The above copyright notice and this permission notice shall be included in all
        copies or substantial portions of the Software.

        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
        SOFTWARE.
    """.trimIndent()

    private val hugeiconsLicenseText = """
        MIT License

        Copyright (c) Hugeicons (hugeicons.com)

        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:

        The above copyright notice and this permission notice shall be included in all
        copies or substantial portions of the Software.

        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
        SOFTWARE.
    """.trimIndent()

    private val libraries: List<OpenSourceLibrary> = listOf(
        OpenSourceLibrary(
            name = "Retrofit",
            version = "3.0.0",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://github.com/square/retrofit",
            description = "A type-safe HTTP client for Android and the JVM by Square.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "OkHttp",
            version = "5.1.0",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://github.com/square/okhttp",
            description = "An HTTP & HTTP/2 client for Android and Java applications.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "Kotlinx Coroutines",
            version = "1.10.2",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://github.com/Kotlin/kotlinx.coroutines",
            description = "Library support for Kotlin coroutines with multiplatform support.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "Kotlinx Serialization",
            version = "1.11.0",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://github.com/Kotlin/kotlinx.serialization",
            description = "Kotlin multiplatform / multi-format reflectionless serialization.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "Dagger Hilt",
            version = "2.60.1",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://dagger.dev/hilt/",
            description = "A dependency injection library for Android that reduces the boilerplate of Dagger.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "AndroidX Room",
            version = "2.8.4",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://developer.android.com/training/data-storage/room",
            description = "Persistence library providing an abstraction layer over SQLite for robust database access.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "AndroidX WorkManager",
            version = "2.11.2",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://developer.android.com/topic/libraries/architecture/workmanager",
            description = "WorkManager enables scheduling deferrable, guaranteed background work in Android.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "AndroidX Navigation",
            version = "2.9.8",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://developer.android.com/guide/navigation",
            description = "Component for managing in-app navigation, deep links, and back stack management.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "AndroidX Lifecycle",
            version = "2.11.0",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://developer.android.com/topic/libraries/architecture/lifecycle",
            description = "Lifecycle-aware components helping manage UI state and coroutine scopes.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "AndroidX DataStore",
            version = "1.2.1",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://developer.android.com/topic/libraries/architecture/datastore",
            description = "Data storage solution allowing key-value and typed object persistence with Kotlin coroutines.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "AndroidX Core KTX",
            version = "1.17.0",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://developer.android.com/kotlin/ktx",
            description = "Kotlin extensions for Android Jetpack and system frameworks.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "AndroidX AppCompat",
            version = "1.7.1",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://developer.android.com/jetpack/androidx/releases/appcompat",
            description = "Backwards-compatible implementation of UI components and styling.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "AndroidX Fragment KTX",
            version = "1.8.9",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://developer.android.com/jetpack/androidx/releases/fragment",
            description = "Fragment extensions providing modern ViewBinding and ViewModel integration.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "AndroidX ConstraintLayout",
            version = "2.2.1",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://developer.android.com/reference/androidx/constraintlayout/widget/ConstraintLayout",
            description = "Layout manager that enables creating large and complex layouts with flat view hierarchy.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "AndroidX RecyclerView",
            version = "1.4.0",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://developer.android.com/guide/topics/ui/layout/recyclerview",
            description = "Efficient display of large datasets with view recycling and diff animations.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "AndroidX SwipeRefreshLayout",
            version = "1.1.0",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://developer.android.com/jetpack/androidx/releases/swiperefreshlayout",
            description = "Swipe-to-refresh pull gesture support for scrollable content containers.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "Material Components for Android",
            version = "1.13.0",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://github.com/material-components/material-components-android",
            description = "Modular and customizable Material Design UI components for Android.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "Turbine",
            version = "1.2.1",
            licenseName = "Apache-2.0",
            licenseCategory = LicenseCategory.APACHE,
            projectUrl = "https://github.com/cashapp/turbine",
            description = "A small testing library for Kotlin Flows by Cash App.",
            licenseText = apache2LicenseText
        ),
        OpenSourceLibrary(
            name = "Hugeicons Free Icons",
            version = "1.0.0",
            licenseName = "MIT",
            licenseCategory = LicenseCategory.MIT,
            projectUrl = "https://hugeicons.com",
            description = "Care Orbit visual iconography library used under MIT license attribution.",
            licenseText = hugeiconsLicenseText
        )
    )

    fun getLibraries(query: String = "", category: LicenseCategory = LicenseCategory.ALL): List<OpenSourceLibrary> {
        return libraries.filter { lib ->
            val matchesCategory = when (category) {
                LicenseCategory.ALL -> true
                LicenseCategory.APACHE -> lib.licenseCategory == LicenseCategory.APACHE
                LicenseCategory.MIT -> lib.licenseCategory == LicenseCategory.MIT
                LicenseCategory.BSD -> lib.licenseCategory == LicenseCategory.BSD
                LicenseCategory.OTHER -> lib.licenseCategory == LicenseCategory.OTHER
            }
            val matchesQuery = query.isBlank() ||
                lib.name.contains(query, ignoreCase = true) ||
                lib.licenseName.contains(query, ignoreCase = true) ||
                lib.description.contains(query, ignoreCase = true)

            matchesCategory && matchesQuery
        }.sortedBy { it.name }
    }

    fun getLibraryByName(name: String): OpenSourceLibrary? {
        return libraries.find { it.name.equals(name, ignoreCase = true) }
    }
}
