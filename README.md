# Leitstand für Claude Code

Plugin für den Leitstand-Workflow (Vorhaben, Fragerunden, Übergaben) mit der MCP-Verbindung zu
https://leitstand.s16e.de.

```bash
claude plugin marketplace add sebastian-breitzke/leitstand-plugin
claude plugin install leitstand@leitstand
```

Starte danach eine neue Session und öffne `/mcp`, um die Verbindung im Browser freizugeben. Dafür
braucht es einen Account auf leitstand.s16e.de.

Der Listener des Plugins weckt eine wartende Session, sobald im Leitstand eine Post für sie eintrifft
(Claude Code 2.1.295 oder neuer). Seine eigenen Aufrufe laufen über deine Berechtigungsregeln; gib sie
einmalig in `~/.claude/settings.json` frei:

```json
{"permissions": {"allow": ["mcp__plugin_leitstand_leitstand__leitstand_session",
  "mcp__plugin_leitstand_leitstand__leitstand_guidance", "mcp__plugin_leitstand_leitstand__leitstand_watch",
  "mcp__plugin_leitstand_leitstand__leitstand_post_receive",
  "mcp__plugin_leitstand_leitstand__leitstand_repository_fix_ack"]}}
```

Befehle: `/leitstand:start`, `/leitstand:status`, `/leitstand:brainstorm`, `/leitstand:slice`,
`/leitstand:orchestrate`, `/leitstand:checkpoint`, `/leitstand:handover`, `/leitstand:complete`.

Dieses Repo wird erzeugt und nicht von Hand bearbeitet.
