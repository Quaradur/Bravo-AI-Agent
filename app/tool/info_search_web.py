from app.tool.base import BaseTool, ToolResult
from app.tool.web_search import WebSearch as InternalWebSearch

class InfoSearchWebTool(BaseTool):
    name: str = "info_search_web"
    description: str = "Searches the web using a Google-like query with optional date range filtering for up-to-date information or references."
    parameters: dict = {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Search query in Google search style, using 3-5 keywords."
            }
        },
        "required": ["query"]
    }

    def __init__(self, **data):
        super().__init__(**data)
        # Usiamo lo strumento WebSearch interno già esistente nel progetto
        self._internal_search = InternalWebSearch()

    async def execute(self, query: str) -> ToolResult:
        try:
            # Esegui la ricerca interna, chiedendo 5 risultati
            search_response = await self._internal_search.execute(query=query, num_results=5)
            
            if search_response.error or not search_response.results:
                return ToolResult(error=search_response.error or "No search results found.")

            # Formatta l'output per l'agente
            output_lines = [f"Search results for query: '{query}'\n"]
            for result in search_response.results:
                output_lines.append(f"[{result.position}] {result.title}")
                output_lines.append(f"    URL: {result.url}")
                if result.description:
                    output_lines.append(f"    Snippet: {result.description}")
            
            return ToolResult(output="\n".join(output_lines))

        except Exception as e:
            return ToolResult(error=f"Web search failed for query '{query}': {str(e)}")