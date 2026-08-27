package com.matrigluco.app.legal.model

data class OpenSourceLibrary(
    val name: String,
    val version: String?,
    val licenseName: String,
    val licenseCategory: LicenseCategory,
    val projectUrl: String?,
    val description: String,
    val licenseText: String
)

enum class LicenseCategory {
    ALL,
    APACHE,
    MIT,
    BSD,
    OTHER
}
