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
(Claude Code 2.1.295 oder neuer); beim Sessionstart bestätigt er Deployment-Hinweise, die älter als eine Stunde sind (weit über Uhr- und Zustellversatz), nur still, der Stand bleibt über `leitstand_deployments` (per `tools_call`) lesbar; Posts, Fix-Hinweise und offene Holds wecken weiter. Seine eigenen Aufrufe laufen über deine Berechtigungsregeln; gib sie
einmalig in `~/.claude/settings.json` frei (`/leitstand:start` bietet das Eintragen nach deiner Bestätigung an).
Der Leitstand-MCP hat eine Front Door (`tools_search`, `tools_describe`, `tools_call`); eine serverweite Regel genügt:

```json
{"permissions": {"allow": ["mcp__plugin_leitstand_leitstand"]}}
```

Hinweise ohne Blockade: Ist die Session einem Vorhaben zugeordnet, erinnert der Listener lokal und regelbasiert (kein Netzwerkaufruf, kein Modell) daran, HTML-Ergebnisse per `leitstand_artifact` in den Leitstand zu veröffentlichen, wenn die Session eine HTML-Datei schreibt oder das Artifact-Werkzeug des Clients nutzt. Zauberwörter in deiner Nachricht (Fragerunde, Checkpoint, Übergabe/Handover, Abschluss, Status, Artefakt/ins Material) verweisen einmal pro Session auf den passenden Workflow-Abschnitt, und viele Fragen im Chat auf eine Fragerunde. Codex kennt kein eigenes Artifact-Werkzeug; dort greift nur das Schreiben von HTML-Dateien.

Befehle: `/leitstand:start`, `/leitstand:status`, `/leitstand:brainstorm`, `/leitstand:slice`,
`/leitstand:orchestrate`, `/leitstand:checkpoint`, `/leitstand:handover`, `/leitstand:complete`.

## Codex Desktop und CLI

Installiere dasselbe Plugin mit Codex CLI 0.157.0 oder neuer:

```bash
codex plugin marketplace add sebastian-breitzke/leitstand-plugin
codex plugin add leitstand@leitstand
```

Für den Listener müssen `python3` und ein funktionsfähiges `codex` im `PATH` verfügbar sein.

Die neun Skills stehen nativ unter `leitstand:*` bereit. Trage für den nativen OAuth-Login
in `config.toml` in deinem `CODEX_HOME` folgende Einstellung ein:

```toml
mcp_oauth_credentials_store = "file"
```

Führe danach `codex mcp login leitstand` aus und gib die Verbindung im Browser frei.
Die Credentials bleiben im User-`CODEX_HOME`; das Plugin enthält keine Secrets.
Prüfe die Plugin-Hooks einmalig über `/hooks` und gib sie dort frei.

Der Listener kann wartende Sessions im selben erreichbaren nativen default App-Server wecken.
Starte dafür `codex app-server --listen unix://` und verbinde die User-CLI mit
`codex --remote unix://`. App-Server, CLI und Listener müssen dasselbe `CODEX_HOME` verwenden.
Wake für Codex Desktop und Web ist derzeit nicht nachgewiesen.

## Browser und andere Accounts

Die Installation aus diesem Git-Marketplace und der persönliche Account-Link eines hochgeladenen
Plugins sind kein öffentlich installierbares Web-Plugin. Ein Paket mit eigener MCP-Konfiguration
kann als „Desktop only“ erscheinen, auch wenn sein MCP-Server über HTTPS erreichbar ist.

Für eine native Cloud-Verbindung öffne auf ChatGPT Web **Plugins → + → Add custom MCP server**,
verwende `https://leitstand.s16e.de/mcp`, wähle OAuth und verbinde deinen eigenen Leitstand-Account.
Installiere danach das erzeugte Plugin und prüfe es in einem neuen Work-Chat. Dritte legen diese
Verbindung in ihrem eigenen Account an; ein privater Account-Link ersetzt diesen Schritt nicht.
Workspace-Sharing erfordert die passenden Permissions und App-Zugriffe.

Das aktuelle Codex Cloud startet im Browser über **Work in → Cloud** mit einem veröffentlichten
Repository-Environment. Prüfe Skills und MCP dort separat. Für klassische Tasks unter `/codex`
ist kein nativer Plugin-Installationsweg nachgewiesen. Die Web-Verbindung allein installiert noch
nicht die neun Workflow-Skills und weist keinen Wake nach.

### Workflow-Skills für ein verbundenes Cloud-Plugin exportieren

Maintainer erzeugen die neun Skills aus derselben kanonischen Quelle wie das Marketplace-Paket:

```bash
python3 apps/leitstand/scripts/build-marketplace.py /tmp/leitstand-marketplace --skills-archive /tmp/leitstand-skills.zip
```

Der Befehl läuft im Stellwerk-Source-Repo. Das ZIP enthält ausschließlich `skills/` und ist ein
Update-Overlay, kein installierbares Plugin. Lies vor einem Cloud-Update das bestehende App-backed
Plugin samt aktuellem Release und Manifesten zurück. Kombiniere dessen exakte Manifeste und
unveränderte App-Bindung mit den exportierten Skills und aktualisiere denselben Plugin-Eintrag.
Erfinde keine App-IDs und übernimm keine MCP- oder Hook-Konfiguration aus dem Desktop-Paket.
Prüfe nach dem Update in einer neuen Browser-Session alle neun Skills und einen Leitstand-Tool-Call.
Der Export erstellt oder veröffentlicht kein Account-Plugin und verbindet keine Nutzerkonten.

Offizielle Anleitung: [Custom MCP server](https://developers.openai.com/api/docs/guides/custom-mcp-server),
[Codex Cloud](https://learn.chatgpt.com/docs/cloud),
[Workspace-Import und Desktop-only-Grenze](https://learn.chatgpt.com/docs/enterprise/plugin-management).

Dieses Repo wird erzeugt und nicht von Hand bearbeitet.
