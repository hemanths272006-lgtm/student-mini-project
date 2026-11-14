import time
from typing import Any, Optional, Dict

class SimpleCache:
    def __init__(self, default_ttl: int = 120):  # 2 minutes default TTL
        self.default_ttl = default_ttl
        self.storage: Dict[str, Any] = {}
        self.expiry: Dict[str, float] = {}

    def get(self, key: str) -> Optional[Any]:
        if key in self.storage:
            if time.time() < self.expiry.get(key, 0):
                return self.storage[key]
            else:
                self.delete(key)
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        duration = ttl if ttl is not None else self.default_ttl
        self.storage[key] = value
        self.expiry[key] = time.time() + duration

    def delete(self, key: str):
        self.storage.pop(key, None)
        self.expiry.pop(key, None)

    def clear(self):
        self.storage.clear()
        self.expiry.clear()

cache = SimpleCache(default_ttl=120)

