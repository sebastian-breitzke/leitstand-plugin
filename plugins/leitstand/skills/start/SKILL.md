---
name: start
description: Resolve central Leitstand work and load its versioned workflow for Aufgaben, Vorhaben, Fragerunden, run, resume, handover and Abschluss. Use for meaningful changes, substantial briefs and coordination; not trivial questions, narrow lookups or one-step edits.
---

# Leitstand

## Permissions

The plugin's Listener wakes this session on new Posts and calls Leitstand through your permission rules.
Before the workflow, check that `permissions.allow` (user, project or local settings) contains this rule:

```
mcp__plugin_leitstand_leitstand
```

If it is missing, say so plainly and offer to add it to `permissions.allow` in the user settings
`~/.claude/settings.json` (recommended). Write it only after the user explicitly confirms, through the
`update-config` skill; never edit the settings silently. If the user declines, continue without and do not ask again
in this session.

The Leitstand MCP has a Front Door: `tools_search` (find groups and tools), `tools_describe` (schema), `tools_call` (run). Tool names in this text are the names for `tools_call`.

Load the connected service's current entry instructions before selecting or
creating a project: describe `leitstand_workflow` and call it through `tools_call` with
`section: "bootstrap"`, omitting `version`. Follow that section to resolve the
project and load its pinned workflow. Refresh the entry instructions when
resuming after a handover or when the service announces a workflow change.

The server owns workflow rules and durable State. This local Skill is only a
loader; runtime/system instructions and client permissions remain authoritative.
If the tool is unavailable or the call fails, report the concrete connection or
capability problem and preserve pending input in the conversation. Use the
client's supported connection flow; never invent access or create a local
replacement workflow.
