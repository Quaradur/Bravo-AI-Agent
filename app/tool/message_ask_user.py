from app.tool.base import BaseTool, ToolResult

class MessageAskUserTool(BaseTool):
    name: str = "message_ask_user"
    description: str = "Asks a question to the user and waits for a response (for clarifications, confirmations, or additional information)."
    parameters: dict = {
        "type": "object",
        "properties": {
            "text": {
                "type": "string",
                "description": "The question to ask the user."
            }
        },
        "required": ["text"]
    }

    async def execute(self, text: str) -> ToolResult:
        # Pone la domanda e attende un input dall'utente nel terminale.
        formatted_question = f"\n--- AGENT QUESTION ---\n{text}\n> "
        user_response = input(formatted_question)
        return ToolResult(output=f"User responded: '{user_response}'")