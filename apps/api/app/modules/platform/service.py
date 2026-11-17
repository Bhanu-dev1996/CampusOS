import logging
import secrets

from app.core.config import get_settings

logger = logging.getLogger(__name__)

DEFAULT_PRINCIPAL_TEMP_PASSWORD_LENGTH = 16


def generate_principal_temporary_password() -> str:
    """Generate a one-time credential for the Principal until email invite ships (US-1.1)."""
    return secrets.token_urlsafe(DEFAULT_PRINCIPAL_TEMP_PASSWORD_LENGTH)


def dispatch_principal_onboarding_invite(
    *,
    tenant_name: str,
    subdomain: str,
    principal_email: str,
    temporary_password: str,
) -> None:
    """MVP stub: log invite payload; replace with email/queue in a later story."""
    settings = get_settings()
    login_hint = f"https://{subdomain}.campusos.io/login"
    if settings.app_env == "development":
        logger.info(
            "Principal onboarding invite (dev stub): tenant=%r subdomain=%r email=%r "
            "temporary_password=%r login_url=%r",
            tenant_name,
            subdomain,
            principal_email,
            temporary_password,
            login_hint,
        )
    else:
        logger.info(
            "Principal onboarding invite queued: tenant=%r subdomain=%r email=%r",
            tenant_name,
            subdomain,
            principal_email,
        )