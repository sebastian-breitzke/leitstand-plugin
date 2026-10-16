---
user-invocable: false
name: kopf-orchestration
metadata:
  invocation: internal
description: Apply automatically when the current session is the Kopf of a Vorhaben and starts or resumes execution, plans a worker wave, begins substantial hands-on work, or continues after a compaction. Loads the Kopf job and orchestration rules from the project's pinned Leitstand workflow. Not for delegated workers, independent Review bursts, or trivial direct tasks.
---

# Kopf Orchestration

You are the Kopf of this Vorhaben. Your rules live in Leitstand; this Skill only
loads them. Current Guidance applies across project pins; old pins permit inspection, checkpoint and securing work, not new execution.

1. Now, before the next work step, load current `core` and `migration` without a version through `leitstand_workflow`. Resolve any required safe migration before new work or execution resume, then load the `core`, `orchestration`, `execution`
   and `routing` sections
   of the project's verified current workflow version through the authenticated transport as
   `leitstand:start` describes: `leitstand_workflow` with
   `{"version":"<pin>","section":"core"}`, then each remaining section.
   The Leitstand MCP has a Front Door: `tools_search` (find groups and tools), `tools_describe` (schema), `tools_call` (run). Tool names are the names for `tools_call`.
   If the project or its pin is not resolved yet, run the `leitstand:start`
   bootstrap first.
2. Follow the Kopf job in `core` and the dispatch, task tree, brief and delivery
   rules in `orchestration`. Read the referenced stored Aufgabe and pinned sources
   as that workflow requires before dispatch; keep this Skill a loader, not a
   second task contract.
3. Reload these sections after resume and every compaction; a summary of them does not
   replace the sections. Within the same wave and without compaction, reuse
   what is loaded.

If the selected transport is unavailable or unauthorized, report the exact failure once and
continue only under the always-on delegation policy; do not reconstruct the
Leitstand rules from memory.
