import {
  readFile,
  readdir,
  lstat,
  realpath,
  writeFile,
} from "node:fs/promises";
import { resolve, relative, isAbsolute, join } from "node:path";
import { hostname } from "node:os";
import { createHash, generateKeyPairSync, randomUUID, sign } from "node:crypto";
import { pathToFileURL } from "node:url";

const sha = (text) => createHash("sha256").update(text).digest("hex");
const canonical = (b) => ({
  formatVersion: 1,
  sourceId: b.sourceId,
  title: b.title,
  kind: b.kind,
  files: [...b.files]
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
    .map((f) => ({ path: f.path, content: f.content })),
});

export async function readSource(directory) {
  const files = [];
  async function walk(folder, prefix = "") {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = prefix + entry.name,
        full = join(folder, entry.name);
      if ((await lstat(full)).isSymbolicLink())
        throw Error(`Symlink wird nicht importiert: ${path}`);
      if (entry.isDirectory()) {
        await walk(full, path + "/");
        continue;
      }
      if (!entry.isFile()) throw Error(`Keine reguläre Datei: ${path}`);
      if ((await lstat(full)).size > 1024 * 1024)
        throw Error(`Datei größer als 1 MiB: ${path}`);
      const content = new TextDecoder("utf-8", {
        fatal: true,
        ignoreBOM: true,
      }).decode(await readFile(full));
      if (content.includes("\0"))
        throw Error(`Binärdatei wird nicht importiert: ${path}`);
      if (path.endsWith(".jsonl"))
        for (const [index, line] of content.split(/\r?\n/).entries()) {
          if (!line.trim()) continue;
          let row;
          try {
            row = JSON.parse(index === 0 ? line.replace(/^\uFEFF/, "") : line);
          } catch {
            throw Error(`Ungültiges JSONL: ${path}:${index + 1}`);
          }
          if (!row || typeof row !== "object" || Array.isArray(row))
            throw Error(`JSONL-Eintrag ist kein Objekt: ${path}:${index + 1}`);
        }
      files.push({ path, content });
      if (files.length > 200) throw Error("Mehr als 200 Dateien im Leitstand.");
    }
  }
  if ((await lstat(directory)).isSymbolicLink())
    throw Error("Leitstand-Ordner darf kein Symlink sein.");
  await walk(directory);
  if (!files.some((f) => f.path === "leitstand.jsonl"))
    throw Error("leitstand.jsonl fehlt im gewählten Ordner.");
  if (
    files.reduce((n, f) => n + Buffer.byteLength(f.content), 0) >
    8 * 1024 * 1024
  )
    throw Error("Originaldateien sind größer als 8 MiB.");
  return files;
}

export async function pack(directory, title, kind = "vorhaben") {
  if (!title || title.length > 200 || !["aufgabe", "vorhaben"].includes(kind))
    throw Error("Titel und Art (aufgabe/vorhaben) angeben.");
  const root = await realpath(directory);
  const bundle = canonical({
    sourceId: sha(`${hostname()}\n${root}`),
    title,
    kind,
    files: await readSource(directory),
  });
  if (Buffer.byteLength(JSON.stringify(bundle)) > 16 * 1024 * 1024)
    throw Error("Import-Paket ist größer als 16 MiB.");
  return bundle;
}

export async function verify(directory, exported, mark = false) {
  const b = canonical(exported.bundle),
    evidence = exported.evidence;
  const files = canonical({ ...b, files: await readSource(directory) }).files;
  if (JSON.stringify(files) !== JSON.stringify(b.files))
    throw Error(
      "Originaldateien unterscheiden sich vom Import. Lokale Arbeit nicht umstellen.",
    );
  if (
    sha(JSON.stringify(b)) !== evidence.bundleHash ||
    b.files.length !== evidence.fileCount ||
    evidence.sourceId !== b.sourceId ||
    evidence.verified !== true ||
    evidence.totalBytes !==
      b.files.reduce((n, f) => n + Buffer.byteLength(f.content), 0) ||
    evidence.eventCount !==
      b.files
        .filter((f) => f.path.toLowerCase().endsWith(".jsonl"))
        .reduce(
          (n, f) =>
            n + f.content.split("\n").filter((line) => line.trim()).length,
          0,
        ) ||
    !Number.isInteger(evidence.memoryCount) ||
    evidence.memoryCount < evidence.eventCount ||
    JSON.stringify(evidence.files) !==
      JSON.stringify(
        b.files.map((f) => ({
          path: f.path,
          sha256: sha(f.content),
          bytes: Buffer.byteLength(f.content),
        })),
      )
  )
    throw Error("Import-Prüfbeleg stimmt nicht.");
  if (!/^[a-zA-Z0-9-]+$/.test(evidence.projectId))
    throw Error("Ungültige Vorhaben-ID im Prüfbeleg.");
  const marker = {
    formatVersion: 1,
    projectId: evidence.projectId,
    bundleHash: evidence.bundleHash,
    sourceId: b.sourceId,
    verifiedAt: new Date().toISOString(),
  };
  if (mark)
    await writeFile(
      resolve(directory) + ".central.json",
      JSON.stringify(marker, null, 2) + "\n",
      { flag: "wx", mode: 0o600 },
    );
  return marker;
}

export async function upload(
  operation,
  endpoint,
  path,
  emit = (value) => process.stdout.write(JSON.stringify(value) + "\n"),
) {
  if (!["artifact", "resource", "import"].includes(operation))
    throw Error("Unbekannte Upload-Operation.");
  const url = new URL(endpoint);
  const requestId = url.pathname.match(
    /^\/file-transfer\/([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i,
  )?.[1];
  if (
    (url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        ["127.0.0.1", "[::1]"].includes(url.hostname)
      )) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !requestId
  )
    throw Error(
      "Upload benötigt den HTTPS-Endpunkt aus leitstand_upload_open per tools_call (HTTP nur auf Loopback).",
    );
  let sourceId = null;
  let bytes;
  if (operation === "import") {
    sourceId = sha(`${hostname()}\n${await realpath(path)}`);
    bytes = Buffer.from(
      JSON.stringify({
        formatVersion: 1,
        sourceId,
        files: await readSource(path),
      }),
    );
  } else {
    const file = await lstat(path);
    if (!file.isFile() || file.isSymbolicLink())
      throw Error("Upload benötigt eine reguläre Datei, keinen Symlink.");
    const max = operation === "artifact" ? 10 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > max)
      throw Error(`Datei überschreitet das Upload-Limit von ${max} Bytes.`);
    bytes = await readFile(path);
    if (bytes.length > max)
      throw Error(
        "Datei ist während des Lesens über das Upload-Limit gewachsen.",
      );
  }
  if (operation === "import" && bytes.length > 16 * 1024 * 1024)
    throw Error("Import-Paket ist größer als 16 MiB.");
  const { privateKey, publicKey } = generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
  });
  const jwk = publicKey.export({ format: "jwk" });
  const publicJwk = { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y };
  const candidate = {
    v: 1,
    requestId,
    candidateId: randomUUID(),
    operation,
    sha256: sha(bytes),
    bytes: bytes.length,
    keyFingerprint: sha(JSON.stringify(publicJwk)),
    sourceId,
  };
  const signature = (value) =>
    sign("sha256", Buffer.from(JSON.stringify(value)), {
      key: privateKey,
      dsaEncoding: "ieee-p1363",
    }).toString("base64url");
  const deadline = Date.now() + 10 * 60 * 1000;
  async function request(action, body, proof) {
    const headers = {};
    if (proof) {
      const value = {
        v: 1,
        action,
        requestId,
        candidateId: candidate.candidateId,
        timestamp: Math.floor(Date.now() / 1000),
        nonce: randomUUID(),
        sha256: candidate.sha256,
        bytes: candidate.bytes,
        keyFingerprint: candidate.keyFingerprint,
      };
      headers["X-Leitstand-Proof"] = Buffer.from(
        JSON.stringify({ ...value, signature: signature(value) }),
      ).toString("base64url");
    }
    const response = await fetch(`${endpoint}/${action}`, {
      method: "POST",
      body,
      headers,
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    });
    let result;
    try {
      result = await response.json();
    } catch {
      throw Error(
        `Upload ${action}: ungültige Server-Antwort (HTTP ${response.status}).`,
      );
    }
    if (!response.ok) {
      const error = Error(
        `Upload ${action}: ${result.error || `HTTP ${response.status}`}`,
      );
      error.terminal = response.status < 500;
      throw error;
    }
    return result;
  }
  async function call(action, body, proof = true) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await request(action, body, proof);
      } catch (error) {
        if (error.terminal) throw error;
        if (action === "content") {
          const status = await call("status");
          if (status.state === "completed") return status.receipt;
        }
        if (attempt >= 3 || Date.now() + 2000 >= deadline)
          throw Error(
            `Upload ${action} konnte nach Wiederholungen nicht bestätigt werden: ${error.message}`,
          );
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1)),
        );
      }
    }
  }
  await call(
    "candidate",
    JSON.stringify({
      ...candidate,
      publicJwk,
      signature: signature(candidate),
    }),
    false,
  );
  emit({
    event: "candidate",
    requestId,
    candidateId: candidate.candidateId,
    sha256: candidate.sha256,
    bytes: candidate.bytes,
    keyFingerprint: candidate.keyFingerprint,
    ...(sourceId ? { sourceId } : {}),
  });
  let receipt;
  while (Date.now() < deadline) {
    const status = await call("status");
    if (status.state === "approved") {
      receipt = await call("content", bytes);
      break;
    }
    if (status.state === "completed") {
      receipt = status.receipt;
      break;
    }
    if (status.state !== "opened")
      throw Error(`Unerwarteter Upload-Status: ${status.state}`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  if (!receipt)
    throw Error(
      "Upload-Freigabe ist abgelaufen. Neuen Request öffnen; Originaldatei bleibt unverändert.",
    );
  if (
    receipt.contentSha256 !== candidate.sha256 ||
    receipt.contentBytes !== candidate.bytes
  )
    throw Error(
      "Server-Receipt stimmt nicht mit den übertragenen Originalbytes überein.",
    );
  if (operation === "import") {
    const exported = await call("readback");
    await verify(path, exported, false);
    receipt = { ...receipt, importVerified: true };
  }
  emit({ event: "completed", ...receipt });
  return receipt;
}

async function main() {
  const [command, directory, output, title, kind] = process.argv.slice(2);
  if (command === "upload" && directory && output && title) {
    await upload(directory, output, title);
    return;
  }
  if (command === "pack" && directory && output && title) {
    const root = await realpath(directory),
      target = resolve(output),
      rel = relative(root, target);
    if (!isAbsolute(rel) && rel !== ".." && !rel.startsWith("../"))
      throw Error("Import-Paket außerhalb des Leitstand-Ordners speichern.");
    const bundle = await pack(directory, title, kind);
    await writeFile(target, JSON.stringify(bundle), {
      flag: "wx",
      mode: 0o600,
    });
    console.log(`${bundle.files.length} Originaldateien gebündelt: ${target}`);
  } else if (command === "verify" && directory && output) {
    const marker = await verify(
      directory,
      JSON.parse(await readFile(output, "utf8")),
      title === "--mark",
    );
    console.log(
      `Originaldateien vollständig geprüft. Vorhaben-ID: ${marker.projectId}${title === "--mark" ? " (lokale Zuordnung gespeichert)" : ""}`,
    );
  } else
    throw Error(
      'Aufruf: node import-local.mjs upload <artifact|resource|import> <Endpunkt-aus-MCP> <Datei-oder-Ordner>\nOder: node import-local.mjs pack <Ordner> <Paket.json> "Titel" [aufgabe|vorhaben]\nOder: node import-local.mjs verify <Ordner> <Prüfbeleg.json> [--mark]',
    );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
