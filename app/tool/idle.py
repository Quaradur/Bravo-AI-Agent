from app.tool.terminate import Terminate

# La classe IdleTool eredita tutto da Terminate, ma con un nome diverso.
class IdleTool(Terminate):
    name: str = "idle"
    description: str = "A special tool to indicate all tasks are completed and the assistant is entering an idle state."