"""
Email Notification Templates for MatriGluco.
"""


def password_reset_template(reset_url: str) -> str:
    return f"""
    <html>
    <body>
        <h2>MatriGluco Password Reset</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="{reset_url}">{reset_url}</a></p>
        <p>If you did not request this, please ignore this email.</p>
    </body>
    </html>
    """


def health_alert_template(patient_name: str, risk_level: str, recommendations: str) -> str:
    return f"""
    <html>
    <body>
        <h2>MatriGluco Health Notification</h2>
        <p>Dear {patient_name},</p>
        <p>A recent metabolic health evaluation indicated a <strong>{risk_level}</strong> level.</p>
        <p><strong>Guidance:</strong> {recommendations}</p>
    </body>
    </html>
    """
