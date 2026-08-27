pluginManagement {
    includeBuild("build-logic")
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "Matrigluco"
include(":app")
include(":core:common", ":core:model", ":core:designsystem", ":core:ui")
include(":core:network", ":core:datastore", ":core:auth", ":core:testing")
include(":core:database")
include(":core:notifications", ":sync")
include(":feature:startup", ":feature:auth")
include(":feature:dashboard")
include(":feature:tracking")
include(":feature:assessment")
include(":feature:assistant")
include(":feature:reports")
include(":feature:history")
include(":benchmark")
