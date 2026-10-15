---
name: start
description: Resolve central Leitstand work and load its versioned workflow for Aufgaben, Vorhaben, Fragerunden, run, resume, handover and Abschluss. Use for meaningful changes, substantial briefs and coordination; not trivial questions, narrow lookups or one-step edits.
---

# Leitstand

Load the connected service's current entry instructions before selecting or
creating a project: discover `leitstand_workflow` and call it with
`section: "bootstrap"`, omitting `version`. Follow that section to resolve the
project and load its pinned workflow. Refresh the entry instructions when
resuming after a handover or when the service announces a workflow change.

The server owns workflow rules and durable State. This local Skill is only a
loader; runtime/system instructions and client permissions remain authoritative.
If the tool is unavailable or the call fails, report the concrete connection or
capability problem and preserve pending input in the conversation. Use the
client's supported connection flow; never invent access or create a local
replacement workflow.
