"""
Shared rate-limiter instance.

Defined here (not in main.py) to avoid circular imports:
  main.py imports routers → routers import limiter → limiter was in main.py → circular
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=[])
