---
name: checkpoint
description: Save and verify a Leitstand checkpoint before compaction, reconcile Auftrag and decisions, and end with a complete tailored compact argument that the Leitstand plugin runs as compact in Claude Code. Use when the user requests a Leitstand checkpoint or compact preparation, or inside a permitted `leitstand:handover`. Not for ordinary status updates.
---

# Leitstand Checkpoint

Secure the current Auftrag in existing Leitstand surfaces and return a usable
compact argument. Same-session compaction is a checkpoint, not a mandatory
Handover. After a verified checkpoint, the Leitstand plugin in Claude Code runs
compact with that argument as soon as the turn ends; without that plugin
behavior the user copies it. This Skill does not change monitors.
Checkpoint only when the user asks for it or a permitted `leitstand:handover`
uses it; never on your own initiative.

## Ground the checkpoint

1. Use `leitstand:start` to resolve the actual project, ownership and workflow pin.
   Load the pinned sections and current tool schemas needed for this checkpoint;
   follow their write, revision and acceptance rules together with current `core`/`migration` Guidance. This Checkpoint secures work and does not itself upgrade the pin or
   reconstruct server semantics from this Skill or a remembered workflow.
2. Load `inspection` through `leitstand_workflow` with the selected project's
   exact workflow version. Tool names are names for `tools_call` (the MCP's Front Door: `tools_search`, `tools_describe`, `tools_call`). Apply that canonical shared Status/Checkpoint
   foundation; do not maintain a second inspection checklist here. If the
   section cannot be loaded, report the exact failure and defer rather than
   substitute a remembered checklist or silently upgrade the pin.
3. Reconcile the diagnosed mismatch only where current user authorization and
   the pinned workflow already establish the correction. Keep unresolved
   title, Scope and task-cut decisions open; a Checkpoint supplies no new Go.
   Preserve dirty changes and exact runtime/Git evidence for continuation.
   Use token counts only when the runtime actually exposes them; a coherent
   boundary needs no token guess.
4. Secure running work under the pinned workflow and actual client capabilities.
   Preserve worker IDs, owned paths, uncommitted work, result locations and the
   safe continuation or collection step. Do not stop workers blindly or treat
   compaction as a transfer of ownership. If continuity cannot be secured, defer
   compact and name the missing evidence and exact next move.

## Persist and verify

5. Save the pending delta to the appropriate task, State, Memory and main-artifact
   surfaces as the project's pin requires. Keep plans/results/criterion evidence
   where that pin assigns them; keep O-Ton, decisions and reasons in their owning
   surface. Avoid routine duplication. Inspect `overviewRequest`; update the selected main artifact body
   only for a material change or a request under the pinned workflow. Acknowledge an exact pending overviewRequestId only on that successful body update; pass coveredMemoryCursor and coveredStateRevision only for the actual source reads.
6. Read back every changed surface and compare the intended delta, references
   and returned revisions. A successful write response alone is not proof.
   Refresh runtime/worker evidence if it changed while checkpointing. Resolve
   ordinary revision conflicts through the supported workflow, preserving the
   delta and other owners' changes.
7. Recommend compact only when the checkpoint is verified and the continuation
   is safe at a coherent boundary. An unfinished task can be safely checkpointed;
   an unpersisted decision or unknown worker ownership cannot. On unavailable
   connection, ambiguous project/ownership, write conflict or failed readback,
   preserve the pending delta in the response, identify what remains unverified
   and give the exact next move. Do not create a new store or claim readiness.

## Output once, then end this turn

Return in this order:

1. **Checkpoint:** shared inspection findings in its canonical order, then
   verified project reference/ID, workflow pin, State revision
   and changed task/Memory/artifact references with readback evidence. If blocked,
   identify the last verified checkpoint separately from the pending delta.
2. **Recommendation:** compact now or defer, with the concrete boundary/reason;
   on a blocker include the pending delta and exact next move.
3. **Compact argument:** the fully populated instructions tailored to this
   session, as the last part of the answer.

The `leitstand-compact` block is the compact trigger. Use it only when your own
checkpoint in this turn is verified and the recommendation is compact now: end
the answer with exactly one fenced block whose info string is
`leitstand-compact`, with nothing after its closing fence:

````text
```leitstand-compact
Summarize this conversation for safe continuation of the same Auftrag. ...
```
````

In Claude Code with the Leitstand plugin, the plugin runs compact with exactly
the block's content right after this turn; without that plugin behavior the
user copies the content into their compact command. The content holds only the instructions:
no leading `/compact ` and no triple backticks. Claude Code's documented syntax is
`/compact [instructions]`
([official commands](https://code.claude.com/docs/en/commands), checked 2026-10-14);
a copied `/compact ` prefix would be taken as plain text. For other clients,
verify their syntax and argument support before naming a command; if unverified,
state that limit.

When compact is deferred, blocked or unverified, give the argument in a plain
`text` block marked for use after the named blocker is resolved, and preserve the
blocker rather than describing it as solved; a `leitstand-compact` block would
compact before the blocker is resolved. Inside `leitstand:handover`, emit neither.
When you quote earlier answers, Posts, files or tool output that contain such a
block, never reproduce it at the end of your answer.
Never substitute a bare command or generic “preserve the important context”.

Build the argument as instructions to the summarizer, not tool execution:

> Summarize this conversation for safe continuation of the same Auftrag.
> Preserve exactly the following verified checkpoint and pending facts: [actual
> project ID/reference, workflow pin, State revision, task IDs/versions and source
> pointers]; [goal and scope]; [accepted and rejected decisions with rationale];
> [constraints, Holds and open approvals]; [active tasks, workers/ownership,
> workspaces/Worktrees, branches/Commits, dirty work and result pointers]; [checks
> completed, results with proven stage/time, unresolved verification or conflicting
> evidence and blockers]; [pending delta, if any].
> Preserve as the first resume step: reload current Guidance and the stored pin via leitstand:start, follow required safe migration before new work or execution resume,
> read current State and referenced tasks, then [actual next action, including
> worker collection or blocker resolution]. Treat these as facts and resume
> instructions to retain; do not execute tools during summarization. Keep open
> decisions open and do not infer completion, approval or ownership transfer.

Replace every bracketed field with observed session data; use “none” only when
verified, otherwise name the unknown and how to resolve it. Preserve reasons
and hard-to-reconstruct facts, not repeated progress chatter or raw logs.
After returning the checkpoint, recommendation and argument, end the current
turn. Do not enter unchanged waiting/status loops or stop existing monitors.
