package com.matrigluco.feature.auth.presentation.login

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class LoginValidatorTest {
    @Test fun validCredentialsHaveNoFieldErrors() {
        assertTrue(LoginValidator.validate("person@example.com", "secret").isValid)
    }

    @Test fun invalidFieldsReturnSemanticErrorsWithoutUiStrings() {
        assertEquals(
            LoginValidation(LoginFieldError.INVALID_EMAIL, LoginFieldError.REQUIRED),
            LoginValidator.validate("not-an-email", ""),
        )
    }
}
