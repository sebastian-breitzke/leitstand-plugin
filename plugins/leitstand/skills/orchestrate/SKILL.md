---
disable-model-invocation: true
name: orchestrate
metadata:
  invocation: manual
description: Start or resume authorized Leitstand execution when explicitly requested. Load the same pinned Kopf guidance as the automatic guard. Not for Brainstorm intake, Slice planning or status inspection.
---

# Leitstand Orchestrate

Start or resume the accepted work as Kopf. This Skill loads central execution
guidance; invoking it does not authorize an unaccepted direction.

1. Read `../kopf-orchestration/SKILL.md`, relative to this Skill's directory,
   and follow its one loading procedure before work. That file contains the
   shared reuse, reload, safe migration and transport failure rules; this
   reference does not invoke a Skill automatically.
2. Follow the current start/resume and dispatch rules. Read current State,
   relevant stored task contracts and source bodies; reconcile Auftrag and Go
   with actual ownership and exposed runtime capacity before dispatch. Keep
   task, brief, model, effort, Context and return-point rules in that workflow.
3. Continue its bounded orchestration loop: process user steering and ready
   worker results, verify and integrate outcomes, and deliver through the
   authorized Workmode. The central Kopf job owns fachliche decisions and
   Review; product implementation goes to workers.

Report the next bounded execution step, observed result or exact affected
blocker with its evidence pointer. If project resolution, authority, ownership
or a required capability is unresolved, preserve pending work and follow the
pinned failure rule; do not claim dispatch or Delivery without observed proof,
reconstruct rules from memory or invent a replacement runtime.
