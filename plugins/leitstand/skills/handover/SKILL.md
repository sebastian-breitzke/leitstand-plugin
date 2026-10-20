---
name: handover
description: Load the pinned Leitstand Handover for continuation in another session or client, reusing Checkpoint where supported. Use when the user explicitly asks for a Handover or the Leitstand Cache-Guard requests one; not same-session compaction, ordinary Status or parallel delegation.
---

# Leitstand Handover

This loader routes a Handover to the central workflow.
The pinned `handover` section owns preservation, observed stop, source access,
registration/transfer, failure handling, resume and continuation requirements.

Hand over only when the Leitstand Cache-Guard ping asked for it or the user
explicitly asks for a Handover; never on your own initiative. A Handover needs an
observed stop of every worker this session started (subagents, background jobs).
While one still runs or its stop is not observed, do not hand over: under the
Cache-Guard, keep the session open and give the reason in one sentence. Open
decisions stay open: do not decide or close them, and list each one in the
continuation prompt.

1. Use `leitstand:start` to resolve the actual project, ownership and exact workflow
   pin. Load current `core`/`migration` Guidance first. Handover secures existing work; execution resume requires safe migration. Load its manifest and `handover` section, then only the sections and tool
   schemas that path requires. Do not substitute or silently upgrade the pin.
2. Only on an executable pin whose manifest exposes `inspection`, use
   `leitstand:checkpoint` and that shared foundation for reconciliation,
   persistence and readback. Reuse a current verified checkpoint after refreshing
   changed evidence. Suppress its Compact recommendation/argument and emit the
   Handover output once. Historical/non-executable pins follow their pinned
   `handover`/`legacy` preservation and authorized upgrade path; do not require
   `core`, Checkpoint or `inspection` there.
3. Follow the central Handover sequence and its supported capabilities. It grants
   no new Scope or Build-Go. Missing capability or evidence follows that section's
   blocked path; a prompt is not proof of transfer.

Return once in this order, using the central requirements:

1. **Checkpoint:** shared inspection findings and verified reconciliation/readback
   on supported pins; on historical pins, the preserved evidence and exact pin.
2. **Handover:** preservation, actual stops, target access, registration/ownership
   outcome and blocker/next action.
3. **Continuation prompt:** one fully populated copy-paste block meeting the
   central `handover` contract, including unresolved blockers when deferred.

End the turn after this output; do not emit a Compact argument or unchanged wait
loop.
