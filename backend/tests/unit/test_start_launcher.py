"""
Unit tests for Matrigluco start.py runtime launcher.
"""

import sys
from unittest.mock import patch, MagicMock
import pytest
from start import (
    parse_arguments,
    build_uvicorn_command,
    build_celery_worker_command,
    build_celery_beat_command,
    redact_url,
    get_lan_ip,
    is_port_in_use,
    LauncherConfig,
)


def test_parse_arguments_default():
    config = parse_arguments([])
    assert config.host == "127.0.0.1"
    assert config.port == 8000
    assert config.external is False
    assert config.reload is True
    assert config.worker is True
    assert config.beat is False
    assert config.migrate is False
    assert config.check_only is False
    assert config.log_level == "info"


def test_parse_arguments_external():
    config = parse_arguments(["--external"])
    assert config.host == "0.0.0.0"
    assert config.external is True


def test_parse_arguments_custom_port_and_host():
    config = parse_arguments(["--host", "192.168.1.50", "--port", "8080"])
    assert config.host == "192.168.1.50"
    assert config.port == 8080


def test_parse_arguments_no_worker_and_beat():
    config = parse_arguments(["--no-worker", "--beat"])
    assert config.worker is False
    assert config.beat is True


def test_parse_arguments_no_reload():
    config = parse_arguments(["--no-reload"])
    assert config.reload is False


def test_parse_arguments_invalid_port():
    with pytest.raises(SystemExit):
        parse_arguments(["--port", "70000"])


def test_build_uvicorn_command():
    config = parse_arguments(["--host", "127.0.0.1", "--port", "8000", "--reload"])
    cmd = build_uvicorn_command(config)

    assert cmd[0] == sys.executable
    assert "-m" in cmd
    assert "uvicorn" in cmd
    assert "app.main:app" in cmd
    assert "--host" in cmd
    assert "127.0.0.1" in cmd
    assert "--port" in cmd
    assert "8000" in cmd
    assert "--reload" in cmd


def test_build_uvicorn_command_no_reload():
    config = parse_arguments(["--no-reload"])
    cmd = build_uvicorn_command(config)
    assert "--reload" not in cmd


def test_build_celery_worker_command():
    config = parse_arguments(["--celery-pool", "solo", "--celery-concurrency", "4"])
    cmd = build_celery_worker_command(config)

    assert cmd[0] == sys.executable
    assert "-m" in cmd
    assert "celery" in cmd
    assert "app.workers.celery_app:celery_app" in cmd
    assert "worker" in cmd
    assert "--pool=solo" in cmd
    assert "--concurrency=4" in cmd
    assert "--queues=default,reports,notifications,analytics" in cmd


def test_build_celery_beat_command():
    config = parse_arguments(["--beat"])
    cmd = build_celery_beat_command(config)

    assert cmd[0] == sys.executable
    assert "-m" in cmd
    assert "celery" in cmd
    assert "app.workers.celery_app:celery_app" in cmd
    assert "beat" in cmd


def test_redact_url():
    raw_db = "mysql+pymysql://admin:SuperSecretPassword123@127.0.0.1:3306/matrigluco"
    redacted = redact_url(raw_db)
    assert "SuperSecretPassword123" not in redacted
    assert ":***@" in redacted
    assert "admin" in redacted

    raw_redis = "redis://:SecretRedisPass@127.0.0.1:6379/1"
    redacted_redis = redact_url(raw_redis)
    assert "SecretRedisPass" not in redacted_redis


def test_get_lan_ip_mocked():
    with patch("socket.socket") as mock_sock_cls:
        mock_sock = MagicMock()
        mock_sock.getsockname.return_value = ("192.168.1.105", 54321)
        mock_sock_cls.return_value = mock_sock

        ip = get_lan_ip()
        assert ip == "192.168.1.105"


def test_is_port_in_use_mocked():
    with patch("socket.socket") as mock_sock_cls:
        mock_sock = MagicMock()
        mock_sock.connect_ex.return_value = 0  # 0 means port occupied
        mock_sock_cls.return_value.__enter__.return_value = mock_sock

        assert is_port_in_use(8000) is True

        mock_sock.connect_ex.return_value = 111  # non-zero means free
        assert is_port_in_use(8000) is False
