package com.matrigluco.core.testing.clock

class FakeClock(initialEpochMillis: Long = 0L) {
    var epochMillis: Long = initialEpochMillis
        private set

    fun advanceBy(millis: Long) {
        require(millis >= 0)
        epochMillis += millis
    }
}
