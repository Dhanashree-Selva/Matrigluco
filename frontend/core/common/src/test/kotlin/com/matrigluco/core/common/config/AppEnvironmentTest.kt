package com.matrigluco.core.common.config

import org.junit.Assert.assertEquals
import org.junit.Test

class AppEnvironmentTest {
    @Test fun mapsBuildConfigValue() = assertEquals(AppEnvironment.STAGING, AppEnvironment.from("staging"))
}
