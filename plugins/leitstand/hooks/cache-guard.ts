import type { EngineInterface, PromptSubmitInput, Timer, TurnCompleteInput, TurnStartInput } from 'claude-code'

// Leitstand Cache-Guard as a Claude Code mod: the prompt cache expires after one hour without a request, and a cold restart of a long
// session costs a multiple of a ping. After 45 minutes of idleness the session is pinged once; it hands over through the Skill
// `leitstand:handover` or stays open with a reason. The decision is asked only while it is open: at the first ping of an idle phase
// or once the session has worked again; a follow-up ping without activity, or one after a handover, is a terse keep-warm turn that
// keeps the cache and asks for nothing. A handed-over session is sealed: it drops automatic
// origins, and any other input that is not isMeta wakes it again.
// The Listener's hooks call the guard first, before any early return, so it covers every session with the plugin whether or not the
// Listener runs. Its state is its own and reset at session start. A throwing guard never blocks a prompt or a hook.

const IDLE_MS = 45 * 60_000
const HANDOVER_SKILL = 'leitstand:handover'
const HANDOVER_TOOL = 'leitstand_handover'
// Origins that are not the user and are dropped while sealed (PromptOrigin kinds). Everything else, an unknown kind included, passes;
// a missing origin counts as the user's.
const AUTOMATIC_ORIGINS = new Set([
  'task-notification', 'scheduled-trigger', 'peer', 'peer-send-message', 'projects-relay', 'channel', 'coordinator', 'observer',
  'observer-activity', 'plugin',
])
const SEALED = 'Leitstand Cache-Guard: Diese Session wurde übergeben. Nur Eingaben des Users wecken sie wieder.'

export const PING = `Leitstand Cache-Guard: Diese Session ist seit 45 Minuten inaktiv. Der Prompt-Cache läuft in etwa 15 Minuten ab, danach wird jede Fortsetzung ein teurer Kaltstart. Entscheide jetzt:
1. Übergeben (Normalfall): Führe den Skill \`leitstand:handover\` aus. Ist die Session noch keinem Vorhaben zugeordnet, lege vorher mit \`leitstand:start\` eines an. Schreibe keinen eigenen Übergabe-Prompt aus dem Chat: Der Skill legt Aufgaben, State und Memories im Leitstand ab und erzeugt den Übergabe-Prompt. Danach nimmt diese Session nur noch Eingaben des Users an.
2. Offen lassen: nur wenn Subagenten oder Hintergrundarbeit noch laufen oder der Kontext wertvoller ist als ein Handover. Antworte dann in einem Satz mit dem Grund und tu sonst nichts. Der nächste Ping kommt in 45 Minuten.`

// The cache stays warm all the same; the agent is told not to repeat its earlier answer.
export const KEEP_WARM = 'Leitstand Cache-Guard (Keep-warm): Seit dem letzten Ping hat sich nichts geändert. Keine Entscheidung nötig: nichts tun, nichts wiederholen. Antworte höchstens mit einem Wort oder gar nicht.'

// Does this tool call hand the session over? The Skill tool with `leitstand:handover`, or the Front Door `tools_call`, whose `name` argument the engine spreads onto the event.
export function handoverCall(e: { tool: unknown } & Record<string, unknown>): boolean {
  if (e.tool === 'Skill') return e.skill === HANDOVER_SKILL
  if (!String(e.tool).endsWith('__tools_call')) return false
  return e.name === HANDOVER_TOOL
}

let timer: Timer | undefined
let sealed = false
// From the ping until the end of the turn it triggers.
let pinging = false
let handedOver = false
// The decision is open: the session has worked since the last ping (true at session start, so the first ping asks).
let decisionOpen = true
// The session handed over in its latest work; cleared when it works again.
let settled = false

// No wake while sealed or while the ping turn runs: its handover may still seal the session.
export const isQuiet = () => sealed || pinging

const stop = () => { timer?.cancel(); timer = undefined }

export function guardSessionStart() {
  stop()
  sealed = false
  pinging = false
  handedOver = false
  decisionOpen = true
  settled = false
}

// A /clear starts a new conversation without session.start.
export function guardSessionEnd(e: { reason: string }) {
  try { if (e.reason === 'clear') guardSessionStart() } catch { /* see below */ }
}

// The loop of a subagent or fork (agentId set) never counts. The ping's own turn is no activity.
export function guardTurnStart(e: Pick<TurnStartInput, 'agentId'>) {
  try {
    if (e.agentId !== undefined) return
    stop()
    if (!pinging) { decisionOpen = true; settled = false }
  } catch { /* a broken guard stays out of the way */ }
}

export function guardTurnComplete($: EngineInterface, e: Pick<TurnCompleteInput, 'agentId'>) {
  try {
    if (e.agentId !== undefined) return
    stop()
    if (pinging && handedOver) sealed = true
    pinging = false
    handedOver = false
    if (sealed) return
    timer = $.clock.after(IDLE_MS, () => {
      timer = undefined
      if (sealed) return
      const text = decisionOpen && !settled ? PING : KEEP_WARM
      decisionOpen = false
      pinging = true
      handedOver = false
      void $.prompt.submit({ text }).catch(() => { pinging = false })
    })
  } catch { /* a broken guard stays out of the way */ }
}

// Observes only; the caller always goes on with the call.
export function guardToolCall(e: { tool: unknown; agentId?: string } & Record<string, unknown>) {
  try {
    if (e.agentId !== undefined || !handoverCall(e)) return
    settled = true
    if (pinging) handedOver = true
  } catch { /* see above */ }
}

// `{ drop }` for an automatic prompt the sealed session refuses; any other prompt that is not isMeta lifts the seal. Any failure lets
// the prompt through.
export function guardPromptSubmit(e: Pick<PromptSubmitInput, 'origin' | 'isMeta'>): { drop: string } | undefined {
  try {
    if (e.origin !== undefined && AUTOMATIC_ORIGINS.has(e.origin.kind)) return sealed ? { drop: SEALED } : undefined
    if (!e.isMeta) {
      sealed = false
      pinging = false
      handedOver = false
      decisionOpen = true
    }
    return undefined
  } catch { return undefined }
}
