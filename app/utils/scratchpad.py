from typing import Any, Dict
from app.logger import logger

class Scratchpad:
    """
    A shared memory space for agents to collaborate.
    Acts as a simple key-value store where agents can read and write
    intermediate results, findings, and data.
    """
    def __init__(self, initial_data: Dict[str, Any] = None):
        self._data: Dict[str, Any] = initial_data or {}
        logger.info("📝 Scratchpad initialized.")

    def set(self, key: str, value: Any):
        """
        Writes or updates a value in the scratchpad.

        Args:
            key: The key to store the data under.
            value: The data to store.
        """
        logger.info(f"📝 Scratchpad SET: '{key}' = '{str(value)[:100]}...'")
        self._data[key] = value

    def get(self, key: str, default: Any = None) -> Any:
        """
        Reads a value from the scratchpad.

        Args:
            key: The key of the data to retrieve.
            default: The value to return if the key is not found.

        Returns:
            The stored data or the default value.
        """
        value = self._data.get(key, default)
        logger.info(f"📝 Scratchpad GET: '{key}' -> '{str(value)[:100]}...'")
        return value

    def get_all(self) -> Dict[str, Any]:
        """Returns a copy of all data in the scratchpad."""
        return self._data.copy()

    def __str__(self) -> str:
        """Provides a string representation of the scratchpad's content."""
        if not self._data:
            return "Scratchpad is empty."
        
        lines = ["--- SCRATCHPAD CONTENT ---"]
        for key, value in self._data.items():
            lines.append(f"  - {key}: {str(value)[:200]}")
        lines.append("--------------------------")
        return "\n".join(lines)
