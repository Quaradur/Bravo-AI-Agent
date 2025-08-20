# app/tool/planning.py
from typing import Dict, List, Literal, Optional

from app.exceptions import ToolError
from app.tool.base import BaseTool, ToolResult


_PLANNING_TOOL_DESCRIPTION = """
A planning tool that allows the agent to create and manage plans for solving complex tasks.
The tool provides functionality for creating plans, updating plan steps, and tracking progress.
"""


class PlanningTool(BaseTool):
    """
    A planning tool that allows the agent to create and manage plans for solving complex tasks.
    """

    name: str = "planning"
    description: str = _PLANNING_TOOL_DESCRIPTION
    parameters: dict = {
        "type": "object",
        "properties": {
            "command": {
                "description": "The command to execute. Available commands: create, update, list, get, set_active, mark_step, delete.",
                "enum": [
                    "create", "update", "list", "get", "set_active", "mark_step", "delete"
                ],
                "type": "string",
            },
            "plan_id": {"type": "string"},
            "title": {"type": "string"},
            "steps": {"type": "array", "items": {"type": "string"}},
            "step_index": {"type": "integer"},
            "step_status": {"enum": ["not_started", "in_progress", "completed", "blocked"], "type": "string"},
            "step_notes": {"type": "string"},
        },
        "required": ["command"],
        "additionalProperties": False,
    }

    plans: dict = {}
    _current_plan_id: Optional[str] = None

    async def execute(
        self,
        *,
        command: Literal["create", "update", "list", "get", "set_active", "mark_step", "delete"],
        plan_id: Optional[str] = None,
        title: Optional[str] = None,
        steps: Optional[List[str]] = None,
        step_index: Optional[int] = None,
        step_status: Optional[Literal["not_started", "in_progress", "completed", "blocked"]] = None,
        step_notes: Optional[str] = None,
        **kwargs,
    ):
        if command == "create":
            return await self._create_plan(plan_id, title, steps)
        elif command == "update":
            return await self._update_plan(plan_id, title, steps)
        elif command == "list":
            return self._list_plans()
        elif command == "get":
            return self._get_plan(plan_id)
        elif command == "set_active":
            return await self._set_active_plan(plan_id)
        elif command == "mark_step":
            return await self._mark_step(plan_id, step_index, step_status, step_notes)
        elif command == "delete":
            return self._delete_plan(plan_id)
        else:
            raise ToolError(f"Unrecognized command: {command}.")

    async def _send_plan_to_frontend(self, plan: Dict):
        """Helper function to format and send the plan to the frontend."""
        if not self.callback_handler:
            return

        def map_status(py_status: str) -> str:
            """Maps backend status to frontend status."""
            if py_status in ["completed", "in_progress"]:
                return py_status
            # Map 'not_started' and 'blocked' to 'pending'
            return "pending"

        plan_steps_for_frontend = [
            {
                "id": str(i),
                "text": step,
                "status": map_status(plan["step_statuses"][i])
            }
            for i, step in enumerate(plan["steps"])
        ]

        await self.callback_handler(
            "plan",
            steps=plan_steps_for_frontend
        )

    async def _create_plan(
        self, plan_id: Optional[str], title: Optional[str], steps: Optional[List[str]]
    ) -> ToolResult:
        if not plan_id:
            raise ToolError("Parameter `plan_id` is required for command: create")
        if plan_id in self.plans:
            raise ToolError(f"A plan with ID '{plan_id}' already exists.")
        if not title:
            raise ToolError("Parameter `title` is required for command: create")
        if not steps or not isinstance(steps, list) or not all(isinstance(s, str) for s in steps):
            raise ToolError("Parameter `steps` must be a non-empty list of strings.")

        plan = {
            "plan_id": plan_id,
            "title": title,
            "steps": steps,
            "step_statuses": ["not_started"] * len(steps),
            "step_notes": [""] * len(steps),
        }
        self.plans[plan_id] = plan
        self._current_plan_id = plan_id

        await self._send_plan_to_frontend(plan)

        return ToolResult(output=f"Plan created successfully with ID: {plan_id}\n\n{self._format_plan_for_agent(plan)}")

    async def _update_plan(
        self, plan_id: Optional[str], title: Optional[str], steps: Optional[List[str]]
    ) -> ToolResult:
        if not plan_id:
            raise ToolError("Parameter `plan_id` is required for command: update")
        if plan_id not in self.plans:
            raise ToolError(f"No plan found with ID: {plan_id}")

        plan = self.plans[plan_id]
        if title:
            plan["title"] = title
        if steps:
            if not isinstance(steps, list) or not all(isinstance(s, str) for s in steps):
                raise ToolError("Parameter `steps` must be a list of strings.")

            old_steps, old_statuses, old_notes = plan["steps"], plan["step_statuses"], plan["step_notes"]
            new_statuses, new_notes = [], []
            for i, step in enumerate(steps):
                if i < len(old_steps) and step == old_steps[i]:
                    new_statuses.append(old_statuses[i])
                    new_notes.append(old_notes[i])
                else:
                    new_statuses.append("not_started")
                    new_notes.append("")
            plan["steps"], plan["step_statuses"], plan["step_notes"] = steps, new_statuses, new_notes

        await self._send_plan_to_frontend(plan)

        return ToolResult(output=f"Plan updated successfully: {plan_id}\n\n{self._format_plan_for_agent(plan)}")

    def _list_plans(self) -> ToolResult:
        if not self.plans:
            return ToolResult(output="No plans available.")
        output = "Available plans:\n"
        for plan_id, plan in self.plans.items():
            current_marker = " (active)" if plan_id == self._current_plan_id else ""
            completed = sum(1 for s in plan["step_statuses"] if s == "completed")
            total = len(plan["steps"])
            output += f"• {plan_id}{current_marker}: {plan['title']} - {completed}/{total} steps completed\n"
        return ToolResult(output=output)

    def _get_plan(self, plan_id: Optional[str]) -> ToolResult:
        plan_id = plan_id or self._current_plan_id
        if not plan_id:
            raise ToolError("No active plan. Please specify a plan_id.")
        if plan_id not in self.plans:
            raise ToolError(f"No plan found with ID: {plan_id}")
        return ToolResult(output=self._format_plan_for_agent(self.plans[plan_id]))

    async def _set_active_plan(self, plan_id: Optional[str]) -> ToolResult:
        if not plan_id:
            raise ToolError("Parameter `plan_id` is required for command: set_active")
        if plan_id not in self.plans:
            raise ToolError(f"No plan found with ID: {plan_id}")

        self._current_plan_id = plan_id
        plan = self.plans[plan_id]

        await self._send_plan_to_frontend(plan)

        return ToolResult(output=f"Plan '{plan_id}' is now active.\n\n{self._format_plan_for_agent(plan)}")

    async def _mark_step(
        self, plan_id: Optional[str], step_index: Optional[int], step_status: Optional[str], step_notes: Optional[str]
    ) -> ToolResult:
        plan_id = plan_id or self._current_plan_id
        if not plan_id:
            raise ToolError("No active plan. Please specify a plan_id.")
        if plan_id not in self.plans:
            raise ToolError(f"No plan found with ID: {plan_id}")
        if step_index is None:
            raise ToolError("Parameter `step_index` is required.")

        plan = self.plans[plan_id]
        if not (0 <= step_index < len(plan["steps"])):
            raise ToolError(f"Invalid step_index: {step_index}.")
        if step_status and step_status not in ["not_started", "in_progress", "completed", "blocked"]:
            raise ToolError(f"Invalid step_status: {step_status}.")

        if step_status:
            plan["step_statuses"][step_index] = step_status
        if step_notes:
            plan["step_notes"][step_index] = step_notes

        await self._send_plan_to_frontend(plan)

        return ToolResult(output=f"Step {step_index} updated in plan '{plan_id}'.\n\n{self._format_plan_for_agent(plan)}")

    def _delete_plan(self, plan_id: Optional[str]) -> ToolResult:
        if not plan_id:
            raise ToolError("Parameter `plan_id` is required.")
        if plan_id not in self.plans:
            raise ToolError(f"No plan found with ID: {plan_id}")

        del self.plans[plan_id]
        if self._current_plan_id == plan_id:
            self._current_plan_id = None
        return ToolResult(output=f"Plan '{plan_id}' has been deleted.")

    def _format_plan_for_agent(self, plan: Dict) -> str:
        """Formats the plan as a simple string for the agent's context."""
        output = f"Plan: {plan['title']} (ID: {plan['plan_id']})\n"
        for i, (step, status) in enumerate(zip(plan["steps"], plan["step_statuses"])):
            output += f"{i}. [{status}] {step}\n"
        return output.strip()


