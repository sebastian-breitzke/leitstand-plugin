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

## Auto-update

Claude Code does not auto-update third-party marketplaces by default, so plugin fixes only arrive after a manual
update. Once per user, tell them to enable it for the `leitstand` marketplace: run `/plugin`, open the tab
Marketplaces, select `leitstand` and choose "Enable auto-update". Claude Code then refreshes the marketplace and the
installed plugins in the background (up to about 10 minutes after the first message of a session); this session keeps
the old version until `/reload-plugins` or the next session. Ask later whether it worked, and do not repeat the hint
once the user confirms or declines. The manual path stays valid: `claude plugin marketplace update leitstand`, then
`claude plugin update leitstand@leitstand`.

The Leitstand MCP has a Front Door: `tools_search` (find groups and tools), `tools_describe` (schema), `tools_call` (run). Tool names in this text are the names for `tools_call`.

Load the connected service's current entry instructions before selecting or
creating a project: describe `leitstand_workflow` and call it through `tools_call` with
`section: "bootstrap"`, omitting `version`. Follow that section to resolve the
project and load current `core`/`migration` Guidance plus its exact history pin. Current Guidance applies across pins; before new work or execution resume, follow the required safe migration. Read-only Status does not upgrade. Refresh the entry instructions when
resuming after a handover or when the service announces a workflow change.

The server owns workflow rules and durable State. This local Skill is only a
loader; runtime/system instructions and client permissions remain authoritative.
If the tool is unavailable or the call fails, report the concrete connection or
capability problem and preserve pending input in the conversation. Use the
client's supported connection flow; never invent access or create a local
replacement workflow.
