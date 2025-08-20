# app/tool/base.py

from abc import ABC, abstractmethod
# --- INIZIO MODIFICA: Aggiunta import per il type hinting del callback ---
from typing import Any, Dict, Optional, Callable, Awaitable
# --- FINE MODIFICA ---

from pydantic import BaseModel, Field


class BaseTool(ABC, BaseModel):
    name: str
    description: str
    parameters: Optional[dict] = None

    # --- INIZIO MODIFICA: Aggiunta del callback_handler ---
    # Questo campo conterrà la funzione per inviare messaggi in tempo reale al frontend.
    # Viene inizializzato a None e sarà valorizzato dall'agente che utilizza il tool.
    callback_handler: Optional[Callable[[str, Any], Awaitable[None]]] = None
    # --- FINE MODIFICA ---


    class Config:
        arbitrary_types_allowed = True
        # Aggiungiamo 'extra' per permettere al callback_handler di essere
        # assegnato senza causare errori di validazione Pydantic.
        extra = "allow"

    async def __call__(self, **kwargs) -> Any:
        """Execute the tool with given parameters."""
        return await self.execute(**kwargs)

    @abstractmethod
    async def execute(self, **kwargs) -> Any:
        """Execute the tool with given parameters."""

    def to_param(self) -> Dict:
        """Convert tool to function call format."""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters,
            },
        }


class ToolResult(BaseModel):
    """Represents the result of a tool execution."""

    output: Any = Field(default=None)
    error: Optional[str] = Field(default=None)
    base64_image: Optional[str] = Field(default=None)
    system: Optional[str] = Field(default=None)

    class Config:
        arbitrary_types_allowed = True

    def __bool__(self):
        return any(getattr(self, field) for field in self.__fields__)

    def __add__(self, other: "ToolResult"):
        def combine_fields(
            field: Optional[str], other_field: Optional[str], concatenate: bool = True
        ):
            if field and other_field:
                if concatenate:
                    return field + other_field
                raise ValueError("Cannot combine tool results")
            return field or other_field

        return ToolResult(
            output=combine_fields(self.output, other.output),
            error=combine_fields(self.error, other.error),
            base64_image=combine_fields(self.base64_image, other.base64_image, False),
            system=combine_fields(self.system, other.system),
        )

    def __str__(self):
        return f"Error: {self.error}" if self.error else self.output

    def replace(self, **kwargs):
        """Returns a new ToolResult with the given fields replaced."""
        return type(self)(**{**self.dict(), **kwargs})


class CLIResult(ToolResult):
    """A ToolResult that can be rendered as a CLI output."""


class ToolFailure(ToolResult):
    """A ToolResult that represents a failure."""


