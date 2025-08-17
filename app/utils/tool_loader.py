import os
import importlib.util
import inspect
from pathlib import Path
from typing import List
from app.tool.base import BaseTool
from app.logger import logger

# Nomi di file da escludere durante la scansione degli strumenti.
# Escludiamo i file di base che non contengono strumenti concreti.
EXCLUDED_FILES = [
    "__init__.py",
    "base.py",
    "tool_collection.py",
    "file_operators.py",
    "shell_manager.py",
    "browser_manager.py",
    "mcp.py" # Escludiamo anche questo per ora per evitare dipendenze complesse all'avvio
]

def load_tools_from_directory(directory: Path) -> List[BaseTool]:
    """
    Scansiona una directory, importa dinamicamente i moduli Python
    e restituisce un'istanza di ogni classe che eredita da BaseTool.

    Args:
        directory: Il percorso della cartella contenente gli strumenti.

    Returns:
        Una lista di istanze degli strumenti trovati.
    """
    loaded_tools = []
    logger.info(f"🔎 Scansione della directory '{directory}' per gli strumenti...")

    for filename in os.listdir(directory):
        if filename.endswith(".py") and filename not in EXCLUDED_FILES:
            module_path = directory / filename
            module_name = filename[:-3]
            
            try:
                # Importa il modulo dinamicamente dal suo percorso
                spec = importlib.util.spec_from_file_location(module_name, module_path)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)

                # Cerca le classi all'interno del modulo
                for name, obj in inspect.getmembers(module, inspect.isclass):
                    # Controlla se la classe è una sottoclasse di BaseTool
                    # e non è BaseTool stessa.
                    if issubclass(obj, BaseTool) and obj is not BaseTool:
                        # Crea un'istanza dello strumento e aggiungila alla lista
                        tool_instance = obj()
                        loaded_tools.append(tool_instance)
                        logger.info(f"  -> Caricato strumento: {tool_instance.name} da {filename}")
            
            except Exception as e:
                logger.error(f"⚠️ Errore durante il caricamento dello strumento da {filename}: {e}")

    logger.info(f"✅ Caricamento completato. Trovati {len(loaded_tools)} strumenti.")
    return loaded_tools
