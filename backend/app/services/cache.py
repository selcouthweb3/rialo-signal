import time
from typing import Any, Optional

class InMemoryCache:
    """
    Simple in-memory cache with TTL.
    MVP replacement for Redis — swap out for Redis later
    by implementing the same interface.
    """
    def __init__(self):
        self.store: dict = {}

    def get(self, key: str) -> Optional[Any]:
        if key not in self.store:
            return None
        value, expires_at = self.store[key]
        if time.time() > expires_at:
            del self.store[key]
            return None
        return value

    def set(self, key: str, value: Any, ttl: int = 30):
        self.store[key] = (value, time.time() + ttl)

    def delete(self, key: str):
        self.store.pop(key, None)

    def flush(self):
        self.store.clear()

cache = InMemoryCache()
