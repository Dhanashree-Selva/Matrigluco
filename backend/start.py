"""
Matrigluco — Professional Unified Development Backend Launcher.

Supervises FastAPI/Uvicorn API server, Celery asynchronous worker, and optional Celery Beat.
Provides cross-platform process management, LAN IP detection, preflight checks, and graceful shutdown.
"""

from __future__ import annotations

import argparse
import os
import platform
import re
import signal
import socket
import subprocess
import sys
import time
from dataclasses import dataclass
from typing import List, Optional

# Ensure standard UTF-8 stream handling on Windows
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    from rich.text import Text
    HAS_RICH = True
except ImportError:
    HAS_RICH = False

    class Console:
        def __init__(self, *args, **kwargs): pass
        def print(self, *args, **kwargs):
            clean_args = [re.sub(r"\[/?[\w# -]+\]", "", str(a)) for a in args]
            print(*clean_args)

    class Panel:
        def __init__(self, renderable, title="", *args, **kwargs):
            self.renderable = renderable
            self.title = title
        def __str__(self):
            return f"{'='*20} {self.title} {'='*20}\n{self.renderable}"

    class Table:
        def __init__(self, *args, **kwargs):
            self.rows = []
        def add_column(self, *args, **kwargs): pass
        def add_row(self, *args):
            self.rows.append(args)
        def __str__(self):
            return "\n".join(f"{r[0]}: {r[1]}" for r in self.rows if len(r) >= 2)

    class Text:
        def __init__(self, text=""):
            self.text = text
        def append(self, text, *args, **kwargs):
            self.text += text
        def __str__(self):
            return self.text


# Safe Terminal Icons
CAN_UNICODE = bool(sys.stdout.encoding and "utf" in sys.stdout.encoding.lower())
ICON_OK = "✓" if CAN_UNICODE else "[OK]"
ICON_ERR = "✗" if CAN_UNICODE else "[FAIL]"
ICON_WARN = "⚠" if CAN_UNICODE else "[WARN]"
ICON_BULLET = "•" if CAN_UNICODE else "*"


@dataclass(frozen=True)
class LauncherConfig:
    host: str
    port: int
    external: bool
    display_host: Optional[str]
    reload: bool
    api: bool
    worker: bool
    beat: bool
    migrate: bool
    check_only: bool
    log_level: str
    celery_pool: Optional[str]
    celery_concurrency: Optional[int]
    no_color: bool


@dataclass
class ManagedProcess:
    name: str
    process: subprocess.Popen
    command: List[str]


# ─── Network & Helper Utilities ───────────────────────────────────────────────


def get_lan_ip() -> str:
    """Discovers local network IPv4 address using a non-destructive socket connection."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Does not actually transmit packets; connects logically to determine routing interface
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        try:
            ip = socket.gethostbyname(socket.gethostname())
        except Exception:
            ip = "127.0.0.1"
    finally:
        s.close()
    return ip


def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    """Checks if a TCP port is currently occupied."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0


def redact_url(url: str) -> str:
    """Removes passwords/credentials from database or broker URLs for safe display."""
    if not url:
        return ""
    return re.sub(r":([^:@]+)@", ":***@", url)


# ─── CLI Argument Parser ──────────────────────────────────────────────────────


def parse_arguments(args: Optional[List[str]] = None) -> LauncherConfig:
    parser = argparse.ArgumentParser(
        prog="python start.py",
        description="Matrigluco Backend — Unified Development Runtime Launcher",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python start.py                    # Local API + Celery worker (default)
  python start.py --external         # Bind to 0.0.0.0 for LAN / mobile device testing
  python start.py --port 8080        # Custom API port
  python start.py --api-only         # Run FastAPI API only (no background worker)
  python start.py --worker-only      # Run Celery worker only (no API server)
  python start.py --beat             # Start API + Worker + Celery Beat scheduler
  python start.py --migrate          # Run Alembic migrations before starting
  python start.py --check            # Run preflight verification and exit
        """,
    )

    parser.add_argument(
        "--host",
        type=str,
        default=None,
        help="Custom IP address to bind Uvicorn (default: 127.0.0.1 or 0.0.0.0 if --external).",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port number for the API server (default: 8000).",
    )
    parser.add_argument(
        "--external",
        action="store_true",
        help="Bind API server to 0.0.0.0 to allow access from other devices on the local network.",
    )
    parser.add_argument(
        "--display-host",
        type=str,
        default=None,
        help="Override the detected LAN IP address displayed in console output.",
    )

    # Mode / Process Selection Flags
    parser.add_argument(
        "--api-only",
        action="store_true",
        default=False,
        help="Run FastAPI API server only (disables Celery worker and Beat scheduler).",
    )
    parser.add_argument(
        "--worker-only",
        action="store_true",
        default=False,
        help="Run Celery background worker only (disables FastAPI API server).",
    )

    # Reload flags
    reload_group = parser.add_mutually_exclusive_group()
    reload_group.add_argument(
        "--reload",
        dest="reload",
        action="store_true",
        default=True,
        help="Enable Uvicorn development auto-reload on code change (default: enabled).",
    )
    reload_group.add_argument(
        "--no-reload",
        dest="reload",
        action="store_false",
        help="Disable Uvicorn auto-reload.",
    )

    # Worker flags
    worker_group = parser.add_mutually_exclusive_group()
    worker_group.add_argument(
        "--worker",
        dest="worker",
        action="store_true",
        default=True,
        help="Start Celery background worker (default: enabled).",
    )
    worker_group.add_argument(
        "--no-worker",
        dest="worker",
        action="store_false",
        help="Disable Celery background worker (run API only).",
    )

    parser.add_argument(
        "--beat",
        action="store_true",
        default=False,
        help="Start Celery Beat periodic scheduler (default: disabled).",
    )
    parser.add_argument(
        "--celery-pool",
        type=str,
        default=None,
        help="Celery execution pool (e.g. 'solo', 'prefork', 'gevent'). Defaults to 'solo' on Windows.",
    )
    parser.add_argument(
        "--celery-concurrency",
        type=int,
        default=None,
        help="Number of concurrent Celery worker processes.",
    )
    parser.add_argument(
        "--migrate",
        action="store_true",
        default=False,
        help="Execute 'alembic upgrade head' before starting services.",
    )
    parser.add_argument(
        "--check",
        dest="check_only",
        action="store_true",
        default=False,
        help="Run environment and preflight connectivity checks then exit.",
    )
    parser.add_argument(
        "--log-level",
        type=str,
        default="info",
        choices=["debug", "info", "warning", "error", "critical"],
        help="Logging level for API and worker processes (default: info).",
    )
    parser.add_argument(
        "--no-color",
        action="store_true",
        default=False,
        help="Disable colored terminal formatting.",
    )

    parsed = parser.parse_args(args)

    if parsed.port < 1 or parsed.port > 65535:
        parser.error(f"Invalid port: {parsed.port}. Must be between 1 and 65535.")

    # Determine process execution modes
    api_enabled = True
    worker_enabled = parsed.worker

    if parsed.api_only:
        api_enabled = True
        worker_enabled = False
    elif parsed.worker_only:
        api_enabled = False
        worker_enabled = True
    elif not parsed.worker:
        worker_enabled = False

    # Determine effective host binding (respecting HOST from .env or defaulting to 0.0.0.0)
    env_host = os.getenv("HOST", "0.0.0.0")
    if parsed.host:
        effective_host = parsed.host
    elif parsed.external:
        effective_host = "0.0.0.0"
    else:
        effective_host = env_host

    # Determine default Celery pool
    if parsed.celery_pool:
        effective_pool = parsed.celery_pool
    elif os.name == "nt" or platform.system() == "Windows":
        effective_pool = "solo"
    else:
        effective_pool = None

    return LauncherConfig(
        host=effective_host,
        port=parsed.port,
        external=parsed.external or (effective_host == "0.0.0.0"),
        display_host=parsed.display_host,
        reload=parsed.reload,
        api=api_enabled,
        worker=worker_enabled,
        beat=parsed.beat,
        migrate=parsed.migrate,
        check_only=parsed.check_only,
        log_level=parsed.log_level,
        celery_pool=effective_pool,
        celery_concurrency=parsed.celery_concurrency,
        no_color=parsed.no_color,
    )


# ─── Command Builders ─────────────────────────────────────────────────────────


def build_uvicorn_command(config: LauncherConfig) -> List[str]:
    cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        config.host,
        "--port",
        str(config.port),
        "--log-level",
        config.log_level.lower(),
    ]
    if config.reload:
        cmd.append("--reload")
    return cmd


def build_celery_worker_command(config: LauncherConfig) -> List[str]:
    cmd = [
        sys.executable,
        "-m",
        "celery",
        "-A",
        "app.workers.celery_app:celery_app",
        "worker",
        f"--loglevel={config.log_level.upper()}",
        "--queues=default,reports,notifications,analytics",
    ]
    if config.celery_pool:
        cmd.append(f"--pool={config.celery_pool}")
    if config.celery_concurrency:
        cmd.append(f"--concurrency={config.celery_concurrency}")
    return cmd


def build_celery_beat_command(config: LauncherConfig) -> List[str]:
    return [
        sys.executable,
        "-m",
        "celery",
        "-A",
        "app.workers.celery_app:celery_app",
        "beat",
        f"--loglevel={config.log_level.upper()}",
    ]


# ─── Preflight Checks ─────────────────────────────────────────────────────────


def check_redis_broker(broker_url: str) -> tuple[bool, str]:
    """Tests Redis broker connectivity with a short timeout."""
    try:
        import redis
        r = redis.Redis.from_url(broker_url, socket_connect_timeout=1.5)
        r.ping()
        return True, "Connected"
    except Exception as exc:
        return False, str(exc)


def run_preflight_checks(config: LauncherConfig, console: Console) -> bool:
    """Executes environment, dependency, and connectivity verifications before startup."""
    has_errors = False

    # 1. Virtual Environment check
    in_venv = sys.prefix != getattr(sys, "base_prefix", sys.prefix)
    if not in_venv:
        console.print(f"[yellow]{ICON_WARN} Warning: No active virtual environment detected.[/yellow]")

    # 2. Dependency checks
    required_modules = ["fastapi", "uvicorn", "pydantic", "sqlalchemy", "pymysql"]
    if config.worker or config.beat:
        required_modules.extend(["celery", "redis"])

    for mod in required_modules:
        try:
            __import__(mod)
        except ImportError:
            console.print(f"[bold red]{ICON_ERR} Missing dependency:[/bold red] '{mod}' is not installed in the active environment.")
            has_errors = True

    if has_errors:
        console.print("\n[yellow]Run: pip install -r requirements/dev.txt[/yellow]")
        return False

    # 3. Port collision check (only if attempting to bind/start, or check)
    if is_port_in_use(config.port, host="127.0.0.1"):
        console.print(f"[bold red]{ICON_ERR} Port collision:[/bold red] Port {config.port} is already occupied.")
        console.print(f"[yellow]Suggestion: Choose another port with --port {config.port + 1}[/yellow]")
        return False

    # 4. Redis check (if worker or beat enabled)
    if config.worker or config.beat:
        try:
            from app.core.config import get_settings
            settings = get_settings()
            broker_url = settings.CELERY_BROKER_URL
            ok, msg = check_redis_broker(broker_url)
            if not ok:
                safe_broker = redact_url(broker_url)
                console.print(f"[bold red]{ICON_ERR} Redis unavailable:[/bold red] Cannot connect to Redis broker at [cyan]{safe_broker}[/cyan].")
                console.print(f"[dim]Detail: {msg}[/dim]")
                console.print("[yellow]Make sure Redis is running (127.0.0.1:6379) or run with --no-worker.[/yellow]")
                return False
        except Exception as exc:
            console.print(f"[yellow]{ICON_WARN} Notice: Unable to verify Redis broker settings ({exc}).[/yellow]")

    return True


def execute_database_migrations(console: Console) -> bool:
    """Executes Alembic migrations when --migrate is supplied."""
    console.print("[cyan]Running database migrations (alembic upgrade head)...[/cyan]")
    res = subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"])
    if res.returncode != 0:
        console.print(f"[bold red]{ICON_ERR} Migration failed.[/bold red] Aborting service launch.")
        return False
    console.print(f"[bold green]{ICON_OK} Database migrations completed successfully.[/bold green]\n")
    return True


# ─── Terminal Presentation (Rich UI) ──────────────────────────────────────────


def render_banner(console: Console) -> None:
    banner_text = Text()
    banner_text.append("MATRIGLUCO\n", style="bold #F06F9D")
    banner_text.append("Clinical Maternal Health & AI Backend Runtime", style="dim white")
    console.print(
        Panel(
            banner_text,
            border_style="#D94F7D",
            padding=(1, 2),
            title="[bold white]Care Orbit v2.0[/bold white]",
            title_align="right",
        )
    )


def render_runtime_summary(
    console: Console, config: LauncherConfig, lan_ip: str
) -> None:
    # 1. Runtime Config Table
    cfg_table = Table(show_header=False, box=None, padding=(0, 2))
    cfg_table.add_column("Key", style="bold dim")
    cfg_table.add_column("Value", style="white")

    cfg_table.add_row("Python Interpreter", sys.executable)
    cfg_table.add_row("Platform OS", f"{platform.system()} {platform.release()} ({os.name})")
    cfg_table.add_row("API Host Binding", f"{config.host}:{config.port}")
    cfg_table.add_row("Uvicorn Auto-Reload", "[green]enabled[/green]" if config.reload else "[dim]disabled[/dim]")
    cfg_table.add_row("Celery Worker", "[green]enabled[/green]" if config.worker else "[dim]disabled[/dim]")
    if config.worker:
        cfg_table.add_row("Celery Worker Pool", f"[cyan]{config.celery_pool or 'default'}[/cyan]")
    cfg_table.add_row("Celery Beat Scheduler", "[yellow]enabled[/yellow]" if config.beat else "[dim]disabled[/dim]")

    console.print(Panel(cfg_table, title="[bold #D94F7D]Runtime Topology[/bold #D94F7D]", border_style="dim"))

    # 2. Endpoint Table
    url_table = Table(show_header=False, box=None, padding=(0, 2))
    url_table.add_column("Service", style="bold dim")
    url_table.add_column("URL", style="bold cyan")

    url_table.add_row("Local API Base", f"http://127.0.0.1:{config.port}/api/v1")
    url_table.add_row("Local Swagger Docs", f"http://127.0.0.1:{config.port}/docs")
    url_table.add_row("Local ReDoc", f"http://127.0.0.1:{config.port}/redoc")
    url_table.add_row("OpenAPI Schema", f"http://127.0.0.1:{config.port}/openapi.json")

    if config.external:
        display_ip = config.display_host or lan_ip
        url_table.add_row("LAN Network API", f"http://{display_ip}:{config.port}/api/v1")
        url_table.add_row("LAN Network Docs", f"http://{display_ip}:{config.port}/docs")

    console.print(Panel(url_table, title="[bold #D94F7D]Active Endpoints[/bold #D94F7D]", border_style="dim"))

    if config.external:
        console.print(
            "[yellow]Notice: LAN access is enabled. Devices on your local network can reach this API if your firewall allows port "
            f"{config.port}.[/yellow]\n"
        )


# ─── Process Management & Supervision ─────────────────────────────────────────


def start_process(name: str, cmd: List[str]) -> ManagedProcess:
    """Spawns a child process with appropriate process group flags."""
    kwargs = {}
    if os.name == "nt":
        kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        kwargs["start_new_session"] = True

    proc = subprocess.Popen(cmd, **kwargs)
    return ManagedProcess(name=name, process=proc, command=cmd)


def shutdown_processes(processes: List[ManagedProcess], console: Console) -> None:
    """Gracefully terminates all managed child processes with escalation."""
    if not processes:
        return

    console.print("\n[bold yellow]Stopping Matrigluco services...[/bold yellow]")

    for mp in processes:
        if mp.process.poll() is None:
            try:
                if os.name == "nt":
                    mp.process.send_signal(signal.CTRL_BREAK_EVENT)
                else:
                    mp.process.terminate()
            except Exception:
                try:
                    mp.process.terminate()
                except Exception:
                    pass

    # Wait for clean termination
    deadline = time.time() + 5.0
    for mp in processes:
        while mp.process.poll() is None and time.time() < deadline:
            time.sleep(0.1)

        # Force kill if still running
        if mp.process.poll() is None:
            try:
                mp.process.kill()
                console.print(f"[red]{ICON_BULLET} Force killed {mp.name}[/red]")
            except Exception:
                pass
        else:
            console.print(f"[green]{ICON_OK} {mp.name} stopped cleanly[/green]")

    console.print("[bold #F06F9D]Matrigluco backend stopped.[/bold #F06F9D]\n")


def supervise_processes(processes: List[ManagedProcess], console: Console) -> int:
    """Supervises active child processes until interrupt or unexpected failure."""
    console.print("[dim]Press Ctrl+C to stop all services.[/dim]\n")

    try:
        while True:
            for mp in processes:
                exit_code = mp.process.poll()
                if exit_code is not None:
                    if exit_code != 0:
                        console.print(f"\n[bold red]{ICON_ERR} {mp.name} exited unexpectedly with code {exit_code}.[/bold red]")
                    else:
                        console.print(f"\n[yellow]{ICON_BULLET} {mp.name} stopped (code 0).[/yellow]")
                    return exit_code if exit_code != 0 else 1
            time.sleep(0.5)
    except KeyboardInterrupt:
        return 0


# ─── Main Entry Point ─────────────────────────────────────────────────────────


def main(args: Optional[List[str]] = None) -> int:
    config = parse_arguments(args)
    console = Console(no_color=config.no_color or not HAS_RICH, highlight=False)

    render_banner(console)

    lan_ip = get_lan_ip()

    # Preflight Checks
    if not run_preflight_checks(config, console):
        return 1

    if config.check_only:
        console.print(f"[bold green]{ICON_OK} Preflight verification passed.[/bold green]")
        return 0

    # Optional Migrations
    if config.migrate:
        if not execute_database_migrations(console):
            return 1

    render_runtime_summary(console, config, lan_ip)

    # Spawn Managed Processes
    processes: List[ManagedProcess] = []

    # 1. Celery Worker (if enabled)
    if config.worker:
        worker_cmd = build_celery_worker_command(config)
        console.print("[dim]Starting Celery worker...[/dim]")
        processes.append(start_process("Celery Worker", worker_cmd))

    # 2. Celery Beat (if enabled)
    if config.beat:
        beat_cmd = build_celery_beat_command(config)
        console.print("[dim]Starting Celery Beat scheduler...[/dim]")
        processes.append(start_process("Celery Beat", beat_cmd))

    # 3. FastAPI / Uvicorn API Server (if enabled)
    if config.api:
        uvicorn_cmd = build_uvicorn_command(config)
        console.print("[dim]Starting FastAPI Uvicorn server...[/dim]")
        processes.append(start_process("FastAPI (Uvicorn)", uvicorn_cmd))

    # Handle Signals
    def sig_handler(signum, frame):
        shutdown_processes(processes, console)
        sys.exit(0)

    try:
        signal.signal(signal.SIGINT, sig_handler)
        signal.signal(signal.SIGTERM, sig_handler)
    except Exception:
        pass

    try:
        exit_code = supervise_processes(processes, console)
    finally:
        shutdown_processes(processes, console)

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
