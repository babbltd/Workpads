#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const http = require("http");
const net = require("net");
const { URL } = require("url");
const { spawnSync } = require("child_process");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, ".workpads");
const RECORDS_FILE = path.join(DATA_DIR, "records.json");
const STORAGE_POLICIES_FILE = path.join(DATA_DIR, "storage-policies.json");
const BROWSER_STATE_FILE = path.join(DATA_DIR, "browser-state.json");
const DEFAULT_BASE_URL = "https://workpads.me/new";
const DEFAULT_TEMPLATE_PATH = path.join(
  ROOT,
  "templates",
  "runtime",
  "svc-basic.v1.json"
);

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (part.startsWith("--")) {
      const key = part.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        args[key] = true;
      } else {
        if (args[key] === undefined) {
          args[key] = next;
        } else if (Array.isArray(args[key])) {
          args[key].push(next);
        } else {
          args[key] = [args[key], next];
        }
        i += 1;
      }
    } else {
      args._.push(part);
    }
  }
  return args;
}

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(RECORDS_FILE)) {
    fs.writeFileSync(RECORDS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(STORAGE_POLICIES_FILE)) {
    fs.writeFileSync(STORAGE_POLICIES_FILE, JSON.stringify({}, null, 2));
  }
}

function loadBrowserState() {
  ensureStore();
  if (!fs.existsSync(BROWSER_STATE_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(BROWSER_STATE_FILE, "utf8"));
  } catch (_) {
    return null;
  }
}

function saveBrowserState(state) {
  ensureStore();
  fs.writeFileSync(BROWSER_STATE_FILE, JSON.stringify(state, null, 2));
}

function clearBrowserState() {
  try {
    if (fs.existsSync(BROWSER_STATE_FILE)) fs.unlinkSync(BROWSER_STATE_FILE);
  } catch (_) {}
}

function loadTemplate(templatePath = DEFAULT_TEMPLATE_PATH) {
  return JSON.parse(fs.readFileSync(templatePath, "utf8"));
}

function loadRecords() {
  ensureStore();
  return JSON.parse(fs.readFileSync(RECORDS_FILE, "utf8"));
}

function saveRecords(records) {
  ensureStore();
  fs.writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2));
}

function loadStoragePolicies() {
  ensureStore();
  return JSON.parse(fs.readFileSync(STORAGE_POLICIES_FILE, "utf8"));
}

function saveStoragePolicies(policies) {
  ensureStore();
  fs.writeFileSync(STORAGE_POLICIES_FILE, JSON.stringify(policies, null, 2));
}

function readKvFile(filePath) {
  const lines = fs
    .readFileSync(filePath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  const out = {};
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!out[key]) out[key] = [];
    out[key].push(value);
  }
  return out;
}

function parseKvTemplate(filePath) {
  const parsed = readKvFile(filePath);
  const templateId = parsed.template_id && parsed.template_id[0];
  const version = toNumber(parsed.version && parsed.version[0], 1);
  const title = parsed.title && parsed.title[0];
  const variants = parsed.variants ? parsed.variants[0].split(",").map((v) => v.trim()).filter(Boolean) : [];
  const pads = parsed.pads ? parsed.pads[0].split(",").map((v) => v.trim()).filter(Boolean) : [];
  const fieldLines = parsed.field || [];
  const fields = fieldLines.map((line) => {
    const parts = line.split("|").map((x) => x.trim());
    const field = {
      id: parts[0],
      label: parts[1],
      type: parts[2],
      required: parts[3] === "required",
      max: null,
      pad: null,
      key: null
    };
    for (let i = 4; i < parts.length; i += 1) {
      const p = parts[i];
      if (p.startsWith("max=")) field.max = toNumber(p.slice(4), null);
      if (p.startsWith("pad=")) field.pad = p.slice(4);
      if (p.startsWith("key=")) field.key = p.slice(4);
    }
    return field;
  });
  return normalizeTemplate({
    template_id: templateId,
    version,
    title,
    variants,
    pads,
    fields
  });
}

function parseYamlTemplate(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split("\n");
  const out = { variants: [], pads: [], fields: [] };
  let section = "";
  let currentField = null;

  function pushField() {
    if (!currentField) return;
    if (currentField.required === undefined) currentField.required = false;
    if (currentField.max !== undefined) currentField.max = toNumber(currentField.max, null);
    out.fields.push(currentField);
    currentField = null;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed === "variants:") {
      pushField();
      section = "variants";
      continue;
    }
    if (trimmed === "pads:") {
      pushField();
      section = "pads";
      continue;
    }
    if (trimmed === "fields:") {
      pushField();
      section = "fields";
      continue;
    }

    if (section === "variants" && trimmed.startsWith("- ")) {
      out.variants.push(trimmed.slice(2).trim());
      continue;
    }
    if (section === "pads" && trimmed.startsWith("- ")) {
      out.pads.push(trimmed.slice(2).trim());
      continue;
    }

    if (section === "fields") {
      if (trimmed.startsWith("- ")) {
        pushField();
        currentField = {};
        const maybePair = trimmed.slice(2).trim();
        if (maybePair.includes(":")) {
          const idx = maybePair.indexOf(":");
          const k = maybePair.slice(0, idx).trim();
          const v = maybePair.slice(idx + 1).trim();
          currentField[k] = parseYamlScalar(v);
        }
        continue;
      }
      if (currentField && trimmed.includes(":")) {
        const idx = trimmed.indexOf(":");
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        currentField[k] = parseYamlScalar(v);
        continue;
      }
    }

    if (trimmed.includes(":")) {
      const idx = trimmed.indexOf(":");
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      out[key] = parseYamlScalar(value);
    }
  }

  pushField();
  return normalizeTemplate(out);
}

function parseYamlScalar(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^\d+$/.test(value)) return toNumber(value, 0);
  return value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}

function normalizeTemplate(input) {
  const templateId = input.template_id || input.templateId;
  const version = toNumber(input.version, 1);
  const title = input.title;
  const variants = Array.isArray(input.variants) ? input.variants : [];
  const pads = Array.isArray(input.pads) ? input.pads : ["process", "actions", "details", "story"];
  const fields = Array.isArray(input.fields) ? input.fields : [];

  if (!templateId) throw new Error("Template missing template_id");
  if (!title) throw new Error("Template missing title");
  if (!Array.isArray(variants) || variants.length === 0) throw new Error("Template missing variants");
  if (!Array.isArray(fields) || fields.length === 0) throw new Error("Template missing fields");

  const compactKeys = {};
  const normalizedFields = fields.map((f) => {
    if (!f.id || !f.type || !f.label) {
      throw new Error(`Invalid field entry: ${JSON.stringify(f)}`);
    }
    const out = {
      id: f.id,
      label: f.label,
      type: f.type,
      required: Boolean(f.required),
      max: f.max === null || f.max === undefined ? null : toNumber(f.max, null),
      pad: f.pad || null
    };
    if (f.key) compactKeys[f.id] = f.key;
    return out;
  });

  return {
    templateId,
    version,
    title,
    variants,
    pads,
    compactKeys,
    fields: normalizedFields
  };
}

function parseTemplateFile(filePath, format) {
  if (format === "kv") return parseKvTemplate(filePath);
  if (format === "yaml") return parseYamlTemplate(filePath);
  throw new Error(`Unsupported format: ${format}`);
}

function parseKeyValuePairs(setValue) {
  if (!setValue) return [];
  if (Array.isArray(setValue)) return setValue;
  return [setValue];
}

function applySetPairs(record, pairs) {
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx < 0) continue;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key.startsWith("process.")) {
      record.process[key.replace("process.", "")] = value;
    } else if (key === "details" || key === "story") {
      record[key] = value;
    } else {
      record.process[key] = value;
    }
  }
}

function compactRecord(record, template) {
  const compact = {
    v: 1,
    m: "legacy",
    t: record.templateId,
    r: record.variant,
    f: {},
    c: record.comments || []
  };

  const map = template.compactKeys || {};
  for (const [fieldPath, shortKey] of Object.entries(map)) {
    if (fieldPath === "details" || fieldPath === "story") {
      if (record[fieldPath]) compact.f[shortKey] = record[fieldPath];
      continue;
    }
    if (fieldPath === "actions[].title" || fieldPath === "actions[].notes") {
      continue;
    }
    const procKey = fieldPath;
    if (record.process[procKey]) {
      compact.f[shortKey] = record.process[procKey];
    }
  }

  if (Array.isArray(record.actions) && record.actions.length > 0) {
    compact.f.at = record.actions.map((a) => a.title || "");
    compact.f.an = record.actions.map((a) => a.notes || "");
  }
  return compact;
}

function normalizeRecordComments(record) {
  if (!Array.isArray(record.comments)) record.comments = [];
  record.comments = record.comments.map((c) => {
    if (typeof c === "string") {
      return { n: "", x: c, ts: new Date().toISOString() };
    }
    return {
      n: c.n || "",
      x: c.x || "",
      ts: c.ts || new Date().toISOString()
    };
  });
}

function buildShareLinkForRecord(record, baseUrl = DEFAULT_BASE_URL) {
  const template = loadTemplate();
  const payload = compactRecord(record, template);
  const encoded = encodePayload(payload);
  const link = `${baseUrl}#${encoded}`;
  return { link, bytes: Buffer.byteLength(link, "utf8") };
}

function encodePayload(payloadObj) {
  const json = JSON.stringify(payloadObj);
  const compressed = zlib.deflateRawSync(Buffer.from(json, "utf8"));
  return compressed.toString("base64url");
}

function decodePayload(encoded) {
  const compressed = Buffer.from(encoded, "base64url");
  const json = zlib.inflateRawSync(compressed).toString("utf8");
  return JSON.parse(json);
}

function newRecordId(records) {
  const seq = records.reduce((max, r) => Math.max(max, Number(r.seq || 0)), 0) + 1;
  return { id: `loc_${String(seq).padStart(6, "0")}`, seq };
}

function printHelp() {
  console.log(`Workpads CLI

Usage:
  workpads template:validate --file <path> --format kv|yaml
  workpads template:compile --file <path> --format kv|yaml --out <path>
  workpads template:show --template <template-id>
  workpads create --template svc-basic --variant plain --set process.job="Job title" [--business biz_001] [--storage-override ephemeral|stored]
  workpads edit --record <id> --set details="..." --add-action "Title|Notes" [--business biz_001] [--storage-override ephemeral|stored]
  workpads share --record <id> [--base-url https://workpads.me/new]
  workpads import --url <share-link>
  workpads render --record <id> [--json]
  workpads export --record <id> --out <path>
  workpads list [--json]
  workpads delete --record <id>
  workpads storage:get --business <id>
  workpads storage:set --business <id> --default ephemeral|stored [--ttl-hours N] [--allow-override true|false]
  workpads storage:resolve --business <id> [--override ephemeral|stored]
  workpads comment:add --record <id> --text "<comment>" [--name "<display>"]
  workpads comment:list --record <id>
  workpads comment:delete --record <id> --index <n>
  workpads dashboard [--json]
  workpads howto [--role owner|dispatcher|receiver|team|supervisor]
  workpads browser [--port 8787] [--ui latest|v1] [--auto-port true|false] [--max-port-tries 20]
  workpads browser:status
  workpads browser:stop

Notes:
  - Record store: .workpads/records.json
  - Base URL default: ${DEFAULT_BASE_URL}
`);
}

function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once("error", () => resolve(false));
    tester.once("listening", () => {
      tester.close(() => resolve(true));
    });
    tester.listen(port, "127.0.0.1");
  });
}

async function findAvailablePort(startPort, maxTries) {
  for (let i = 0; i < maxTries; i += 1) {
    const candidate = startPort + i;
    // eslint-disable-next-line no-await-in-loop
    const ok = await checkPortAvailable(candidate);
    if (ok) return candidate;
  }
  return null;
}

function printHowTo(role) {
  const sections = {
    owner: `OWNER: Set policy defaults
  node ./workpads.js storage:set --business biz_001 --default ephemeral --ttl-hours 24 --allow-override true
  node ./workpads.js storage:get --business biz_001`,
    dispatcher: `DISPATCHER: Create, edit, and share
  node ./workpads.js create --template svc-basic --variant plain --business biz_001 --set process.job="Replace faucet"
  node ./workpads.js edit --record loc_000001 --add-action "Arrive|Inspect site" --set details="Bring standard tools"
  node ./workpads.js share --record loc_000001`,
    receiver: `RECEIVER: Import and view
  echo "https://workpads.me/new#<payload>" | node ./workpads.js import
  node ./workpads.js render --record loc_000002`,
    team: `TEAM: Comment workflow
  node ./workpads.js comment:add --record loc_000001 --text "Parts delivered" --name "Alex"
  node ./workpads.js comment:list --record loc_000001`,
    supervisor: `SUPERVISOR: Daily dashboard
  node ./workpads.js list
  node ./workpads.js dashboard`
  };

  if (role) {
    const key = String(role).toLowerCase();
    if (!sections[key]) {
      throw new Error("Invalid --role. Expected owner|dispatcher|receiver|team|supervisor");
    }
    console.log(sections[key]);
    return;
  }

  console.log(
    [
      "WORKPADS HOW-TO",
      "",
      sections.owner,
      "",
      sections.dispatcher,
      "",
      sections.receiver,
      "",
      sections.team,
      "",
      sections.supervisor,
      "",
      "Docs:",
      "  - cli.md",
      "  - cheat-sheet.md"
    ].join("\n")
  );
}

function expandPayload(compact) {
  const record = {
    templateId: compact.t || "svc-basic",
    variant: compact.r || "plain",
    process: {},
    actions: [],
    details: "",
    story: "",
    comments: Array.isArray(compact.c) ? compact.c : []
  };

  const f = compact.f || {};
  if (f.j) record.process.job = f.j;
  if (f.c) record.process.customer = f.c;
  if (f.d) record.process.date = f.d;
  if (f.l) record.process.location = f.l;
  if (f.mt) record.process.meeting_time = f.mt;
  if (f.de) record.details = f.de;
  if (f.st) record.story = f.st;

  const at = Array.isArray(f.at) ? f.at : [];
  const an = Array.isArray(f.an) ? f.an : [];
  const maxLen = Math.max(at.length, an.length);
  for (let i = 0; i < maxLen; i += 1) {
    record.actions.push({
      title: at[i] || "",
      notes: an[i] || ""
    });
  }

  return record;
}

function commandTemplateValidate(args) {
  const filePath = args.file;
  const format = args.format || "kv";
  if (!filePath) throw new Error("Missing --file");
  const full = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
  if (!fs.existsSync(full)) throw new Error(`File not found: ${full}`);

  const normalized = parseTemplateFile(full, format);
  console.log(
    JSON.stringify(
      {
        ok: true,
        templateId: normalized.templateId,
        version: normalized.version,
        fields: normalized.fields.length
      },
      null,
      2
    )
  );
}

function commandTemplateCompile(args) {
  const filePath = args.file;
  const format = args.format || "kv";
  const outPath = args.out;
  if (!filePath) throw new Error("Missing --file");
  if (!outPath) throw new Error("Missing --out");
  const full = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
  const outFull = path.isAbsolute(outPath) ? outPath : path.join(ROOT, outPath);
  const normalized = parseTemplateFile(full, format);
  fs.mkdirSync(path.dirname(outFull), { recursive: true });
  fs.writeFileSync(outFull, JSON.stringify(normalized, null, 2));
  console.log(`Compiled template -> ${outFull}`);
}

function commandTemplateShow(args) {
  const templateId = args.template || "svc-basic";
  const runtimePath = path.join(ROOT, "templates", "runtime", `${templateId}.v1.json`);
  if (!fs.existsSync(runtimePath)) throw new Error(`Template runtime file not found: ${runtimePath}`);
  console.log(fs.readFileSync(runtimePath, "utf8"));
}

function commandCreate(args) {
  const template = loadTemplate();
  const records = loadRecords();
  const { id, seq } = newRecordId(records);
  const variant = args.variant || "plain";

  const record = {
    id,
    seq,
    templateId: args.template || template.templateId,
    variant,
    process: {},
    actions: [],
    details: "",
    story: "",
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  normalizeRecordComments(record);

  applySetPairs(record, parseKeyValuePairs(args.set));
  if (!record.process.job) {
    throw new Error("Missing required field: process.job");
  }
  const storage = resolveStorageDecision(args, null);
  if (storage) {
    record.storage = storage;
  }

  records.push(record);
  saveRecords(records);
  console.log(JSON.stringify(record, null, 2));
}

function commandEdit(args) {
  if (!args.record) throw new Error("Missing --record");
  const records = loadRecords();
  const record = records.find((r) => r.id === args.record);
  if (!record) throw new Error(`Record not found: ${args.record}`);
  normalizeRecordComments(record);

  applySetPairs(record, parseKeyValuePairs(args.set));

  if (args["add-action"]) {
    const [title, notes] = String(args["add-action"]).split("|");
    record.actions.push({ title: title || "", notes: notes || "" });
  }
  const storage = resolveStorageDecision(args, record.storage && record.storage.businessId);
  if (storage) {
    record.storage = storage;
  }

  record.updatedAt = new Date().toISOString();
  saveRecords(records);
  console.log(JSON.stringify(record, null, 2));
}

function commandShare(args) {
  if (!args.record) throw new Error("Missing --record");
  const records = loadRecords();
  const record = records.find((r) => r.id === args.record);
  if (!record) throw new Error(`Record not found: ${args.record}`);
  const baseUrl = args["base-url"] || DEFAULT_BASE_URL;
  const { link, bytes } = buildShareLinkForRecord(record, baseUrl);
  console.log(link);
  console.error(`bytes=${bytes} alg=deflate-raw+b64url`);
}

function commandImport(args) {
  let inputUrl = args.url;
  if (!inputUrl) {
    const stdin = fs.readFileSync(0, "utf8").trim();
    if (stdin) inputUrl = stdin;
  }
  if (!inputUrl) throw new Error("Missing --url");

  const hashIndex = inputUrl.indexOf("#");
  if (hashIndex < 0 || hashIndex === inputUrl.length - 1) {
    throw new Error("Invalid URL: missing payload hash suffix");
  }

  const encoded = inputUrl.slice(hashIndex + 1);
  const compact = decodePayload(encoded);
  const expanded = expandPayload(compact);

  const records = loadRecords();
  const { id, seq } = newRecordId(records);
  const now = new Date().toISOString();
  const imported = {
    id,
    seq,
    ...expanded,
    createdAt: now,
    updatedAt: now,
    importedFromLink: true
  };
  normalizeRecordComments(imported);

  if (!imported.process.job) {
    throw new Error("Imported payload missing required job field");
  }

  records.push(imported);
  saveRecords(records);
  console.log(JSON.stringify(imported, null, 2));
}

function commandRender(args) {
  if (!args.record) throw new Error("Missing --record");
  const records = loadRecords();
  const record = records.find((r) => r.id === args.record);
  if (!record) throw new Error(`Record not found: ${args.record}`);

  if (args.json) {
    console.log(JSON.stringify(record, null, 2));
    return;
  }

  const lines = [];
  lines.push(`ID: ${record.id}`);
  lines.push(`Template: ${record.templateId} (${record.variant})`);
  lines.push("");
  lines.push("PROCESS");
  lines.push(`- Job: ${record.process.job || ""}`);
  lines.push(`- Customer: ${record.process.customer || ""}`);
  lines.push(`- Date: ${record.process.date || ""}`);
  lines.push(`- Location: ${record.process.location || ""}`);
  lines.push(`- Meeting Time: ${record.process.meeting_time || ""}`);
  lines.push("");
  lines.push("ACTIONS");
  if (Array.isArray(record.actions) && record.actions.length > 0) {
    record.actions.forEach((a, idx) => {
      lines.push(`${idx + 1}. ${a.title || ""}${a.notes ? ` - ${a.notes}` : ""}`);
    });
  } else {
    lines.push("(none)");
  }
  lines.push("");
  lines.push("DETAILS");
  lines.push(record.details || "(none)");
  lines.push("");
  lines.push("STORY");
  lines.push(record.story || "(none)");
  console.log(lines.join("\n"));
}

function commandExport(args) {
  if (!args.record) throw new Error("Missing --record");
  if (!args.out) throw new Error("Missing --out");

  const records = loadRecords();
  const record = records.find((r) => r.id === args.record);
  if (!record) throw new Error(`Record not found: ${args.record}`);

  const outPath = path.isAbsolute(args.out) ? args.out : path.join(ROOT, args.out);
  const outDir = path.dirname(outPath);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(record, null, 2));
  console.log(`Exported ${record.id} -> ${outPath}`);
}

function commandList(args) {
  const records = loadRecords();
  if (args.json) {
    console.log(JSON.stringify(records, null, 2));
    return;
  }

  if (records.length === 0) {
    console.log("No records.");
    return;
  }

  records
    .sort((a, b) => Number(a.seq || 0) - Number(b.seq || 0))
    .forEach((record) => {
      const job = (record.process && record.process.job) || "";
      const variant = record.variant || "plain";
      const storageMode = (record.storage && record.storage.mode) || "unset";
      const bytes = buildShareLinkForRecord(record).bytes;
      console.log(`${record.id}\t${variant}\t${storageMode}\t${bytes}\t${job}`);
    });
}

function commandDelete(args) {
  if (!args.record) throw new Error("Missing --record");
  const records = loadRecords();
  const index = records.findIndex((r) => r.id === args.record);
  if (index < 0) throw new Error(`Record not found: ${args.record}`);
  const [removed] = records.splice(index, 1);
  saveRecords(records);
  console.log(`Deleted ${removed.id}`);
}

function getBusinessStoragePolicy(policies, businessId) {
  if (!policies[businessId]) {
    policies[businessId] = {
      businessId,
      defaultMode: "ephemeral",
      defaultTtlHours: 24,
      allowOverride: true,
      updatedAt: new Date().toISOString()
    };
  }
  return policies[businessId];
}

function parseBool(value, fallback) {
  if (value === undefined) return fallback;
  if (value === true) return true;
  const v = String(value).toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

function normalizeMode(mode) {
  const out = String(mode || "").toLowerCase();
  if (out !== "ephemeral" && out !== "stored") {
    throw new Error(`Invalid mode: ${mode}. Expected ephemeral|stored`);
  }
  return out;
}

function resolveStorageDecision(args, businessIdHint) {
  const businessId = args.business || businessIdHint;
  const hasOverride = args["storage-override"] !== undefined;
  if (!businessId && !hasOverride) return null;
  if (!businessId && hasOverride) {
    throw new Error("Missing --business when using --storage-override");
  }

  const policies = loadStoragePolicies();
  const policy = getBusinessStoragePolicy(policies, businessId);
  saveStoragePolicies(policies);

  let mode = policy.defaultMode || "ephemeral";
  let source = "business-default";
  if (hasOverride) {
    const overrideMode = normalizeMode(args["storage-override"]);
    if (policy.allowOverride) {
      mode = overrideMode;
      source = "record-override";
    } else {
      source = "business-default-override-disabled";
    }
  }

  const ttlHours = mode === "ephemeral" ? Number(policy.defaultTtlHours || 24) : null;
  const resolvedAt = new Date().toISOString();
  const expiresAt =
    ttlHours !== null
      ? new Date(new Date(resolvedAt).getTime() + ttlHours * 60 * 60 * 1000).toISOString()
      : null;

  return {
    businessId,
    mode,
    ttlHours,
    source,
    resolvedAt,
    expiresAt
  };
}

function commandStorageGet(args) {
  const businessId = args.business;
  if (!businessId) throw new Error("Missing --business");
  const policies = loadStoragePolicies();
  const policy = getBusinessStoragePolicy(policies, businessId);
  saveStoragePolicies(policies);
  console.log(JSON.stringify(policy, null, 2));
}

function commandStorageSet(args) {
  const businessId = args.business;
  if (!businessId) throw new Error("Missing --business");
  if (!args.default) throw new Error("Missing --default");

  const policies = loadStoragePolicies();
  const policy = getBusinessStoragePolicy(policies, businessId);
  policy.defaultMode = normalizeMode(args.default);
  if (args["ttl-hours"] !== undefined) {
    const ttl = Number(args["ttl-hours"]);
    if (Number.isNaN(ttl) || ttl < 0) {
      throw new Error("Invalid --ttl-hours");
    }
    policy.defaultTtlHours = ttl;
  }
  policy.allowOverride = parseBool(args["allow-override"], policy.allowOverride);
  policy.updatedAt = new Date().toISOString();

  policies[businessId] = policy;
  saveStoragePolicies(policies);
  console.log(JSON.stringify(policy, null, 2));
}

function commandStorageResolve(args) {
  const businessId = args.business;
  if (!businessId) throw new Error("Missing --business");

  const policies = loadStoragePolicies();
  const policy = getBusinessStoragePolicy(policies, businessId);
  saveStoragePolicies(policies);

  let effectiveMode = policy.defaultMode || "ephemeral";
  let source = "business-default";
  let effectiveTtlHours =
    effectiveMode === "ephemeral" ? Number(policy.defaultTtlHours || 24) : null;
  if (args.override !== undefined) {
    const overrideMode = normalizeMode(args.override);
    if (policy.allowOverride) {
      effectiveMode = overrideMode;
      source = "record-override";
      effectiveTtlHours =
        effectiveMode === "ephemeral" ? Number(policy.defaultTtlHours || 24) : null;
    } else {
      source = "business-default-override-disabled";
    }
  }

  console.log(
    JSON.stringify(
      {
        businessId,
        effectiveMode,
        effectiveTtlHours,
        source
      },
      null,
      2
    )
  );
}

function commandCommentAdd(args) {
  if (!args.record) throw new Error("Missing --record");
  if (!args.text) throw new Error("Missing --text");
  const records = loadRecords();
  const record = records.find((r) => r.id === args.record);
  if (!record) throw new Error(`Record not found: ${args.record}`);
  normalizeRecordComments(record);
  record.comments.push({
    n: args.name || "",
    x: String(args.text),
    ts: new Date().toISOString()
  });
  record.updatedAt = new Date().toISOString();
  saveRecords(records);
  console.log(JSON.stringify(record.comments, null, 2));
}

function commandCommentList(args) {
  if (!args.record) throw new Error("Missing --record");
  const records = loadRecords();
  const record = records.find((r) => r.id === args.record);
  if (!record) throw new Error(`Record not found: ${args.record}`);
  normalizeRecordComments(record);
  console.log(JSON.stringify(record.comments, null, 2));
}

function commandCommentDelete(args) {
  if (!args.record) throw new Error("Missing --record");
  if (args.index === undefined) throw new Error("Missing --index");
  const idx = toNumber(args.index, -1);
  if (idx < 0) throw new Error("Invalid --index");
  const records = loadRecords();
  const record = records.find((r) => r.id === args.record);
  if (!record) throw new Error(`Record not found: ${args.record}`);
  normalizeRecordComments(record);
  if (idx >= record.comments.length) throw new Error("Comment index out of range");
  record.comments.splice(idx, 1);
  record.updatedAt = new Date().toISOString();
  saveRecords(records);
  console.log(JSON.stringify(record.comments, null, 2));
}

function commandDashboard(args) {
  const records = loadRecords();
  const sizes = records.map((r) => ({ id: r.id, bytes: buildShareLinkForRecord(r).bytes }));
  if (sizes.length === 0) {
    const empty = { count: 0, lowest: null, highest: null, average: 0 };
    console.log(args.json ? JSON.stringify(empty, null, 2) : "No records.");
    return;
  }
  const sorted = sizes.slice().sort((a, b) => a.bytes - b.bytes);
  const total = sorted.reduce((sum, it) => sum + it.bytes, 0);
  const avg = Math.round(total / sorted.length);
  const out = {
    count: sorted.length,
    lowest: sorted[0],
    highest: sorted[sorted.length - 1],
    average: avg
  };
  if (args.json) {
    console.log(JSON.stringify(out, null, 2));
    return;
  }
  console.log(`count=${out.count}`);
  console.log(`lowest=${out.lowest.id}:${out.lowest.bytes}`);
  console.log(`highest=${out.highest.id}:${out.highest.bytes}`);
  console.log(`average=${out.average}`);
}

function commandHowTo(args) {
  printHowTo(args.role);
}

function runCliSubcommand(argv) {
  const result = spawnSync(process.execPath, [__filename, ...argv], {
    encoding: "utf8"
  });
  if (result.status !== 0) {
    const message = (result.stderr || result.stdout || "Unknown CLI error").trim();
    throw new Error(message);
  }
  return {
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || "").trim()
  };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 2 * 1024 * 1024) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store"
  });
  res.end(text);
}

function browserV1Html() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Workpads Browser</title>
  <link rel="stylesheet" href="/v1/app.css" />
</head>
<body>
  <main class="frame">
    <h1>Workpads Browser</h1>
    <p class="subtle">Simple local UI backed by <code>workpads browser</code>.</p>

    <section>
      <h2>Create Record</h2>
      <form id="create-form">
        <label>Job</label>
        <input id="job" required />
        <label>Location</label>
        <input id="location" />
        <label>Date (YYYY-MM-DD)</label>
        <input id="date" />
        <label>Details</label>
        <textarea id="details"></textarea>
        <label>Story</label>
        <textarea id="story"></textarea>
        <button type="submit">Create</button>
      </form>
    </section>

    <section>
      <h2>Import Link</h2>
      <form id="import-form">
        <input id="import-url" placeholder="https://workpads.me/new#..." />
        <button type="submit">Import</button>
      </form>
    </section>

    <section>
      <h2>Dashboard</h2>
      <pre id="dashboard"></pre>
    </section>

    <section>
      <h2>Records</h2>
      <div id="records"></div>
    </section>
  </main>

  <script src="/v1/app.js"></script>
</body>
</html>`;
}

function browserV1Css() {
  return `:root { color-scheme: light; }
* { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
body {
  margin: 0;
  background: #fff;
  color: #111;
}
.frame {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}
h1 { margin: 0 0 12px; font-size: 1.5rem; }
h2 { margin: 0 0 8px; font-size: 1.05rem; }
section { margin-bottom: 20px; border-top: 1px solid #ddd; padding-top: 12px; }
label { display: block; margin: 8px 0 4px; font-size: 0.9rem; }
input, textarea, button {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  font-size: 0.95rem;
}
textarea { min-height: 64px; resize: vertical; }
button { margin-top: 10px; cursor: pointer; background: #f4f4f4; }
.subtle { color: #555; font-size: 0.9rem; }
.record { border: 1px solid #ddd; padding: 10px; border-radius: 4px; margin-bottom: 8px; }
.row { display: flex; gap: 8px; flex-wrap: wrap; }
.row button { width: auto; padding: 6px 10px; margin-top: 8px; }
pre { margin: 0; white-space: pre-wrap; border: 1px solid #ddd; padding: 8px; border-radius: 4px; }
code { background: #f4f4f4; padding: 1px 4px; border-radius: 4px; }`;
}

function browserV1Js() {
  return `async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts
  });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (_) {}
  if (!res.ok) throw new Error(data.error || text || "Request failed");
  return data;
}

async function refresh() {
  const recordsRes = await api("/api/records");
  const dashRes = await api("/api/dashboard");
  document.getElementById("dashboard").textContent = JSON.stringify(dashRes, null, 2);
  const box = document.getElementById("records");
  box.innerHTML = "";
  for (const r of recordsRes.records) {
    const div = document.createElement("div");
    div.className = "record";
    const id = r.id;
    div.innerHTML = "<strong>" + id + "</strong><br/>"
      + "job: " + (r.process?.job || "") + "<br/>"
      + "variant: " + (r.variant || "plain") + "<br/>"
      + "storage: " + (r.storage?.mode || "unset");
    const row = document.createElement("div");
    row.className = "row";
    const shareBtn = document.createElement("button");
    shareBtn.textContent = "Share";
    shareBtn.onclick = async () => {
      const out = await api("/api/share", { method: "POST", body: JSON.stringify({ recordId: id }) });
      window.prompt("Share link", out.link);
      await refresh();
    };
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = async () => {
      await api("/api/records/" + encodeURIComponent(id), { method: "DELETE" });
      await refresh();
    };
    row.appendChild(shareBtn);
    row.appendChild(delBtn);
    div.appendChild(row);
    box.appendChild(div);
  }
}

document.getElementById("create-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    job: document.getElementById("job").value.trim(),
    location: document.getElementById("location").value.trim(),
    date: document.getElementById("date").value.trim(),
    details: document.getElementById("details").value.trim(),
    story: document.getElementById("story").value.trim()
  };
  await api("/api/records", { method: "POST", body: JSON.stringify(payload) });
  e.target.reset();
  await refresh();
});

document.getElementById("import-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = document.getElementById("import-url").value.trim();
  if (!url) return;
  await api("/api/import", { method: "POST", body: JSON.stringify({ url }) });
  e.target.reset();
  await refresh();
});

refresh().catch((err) => alert(err.message));`;
}

function browserHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Workpads Browser</title>
  <link rel="stylesheet" href="/app.css" />
</head>
<body>
  <main class="frame">
    <h1>Workpads Browser</h1>
    <p>Local browser service for Workpads CLI. <a href="/v1/">Open pinned v1 UI</a>.</p>

    <section>
      <h2>Create</h2>
      <form id="create-form">
        <label>Job</label><input id="c-job" required />
        <label>Location</label><input id="c-location" />
        <label>Date</label><input id="c-date" />
        <label>Details</label><textarea id="c-details"></textarea>
        <label>Story</label><textarea id="c-story"></textarea>
        <button type="submit">Create Record</button>
      </form>
    </section>

    <section>
      <h2>Edit</h2>
      <form id="edit-form">
        <label>Record ID</label><input id="e-id" required placeholder="loc_000001" />
        <label>Set Pairs (one per line, ex: process.location=Dock 7)</label><textarea id="e-set"></textarea>
        <label>Add Action (Title|Notes)</label><input id="e-action" />
        <button type="submit">Apply Edit</button>
      </form>
    </section>

    <section>
      <h2>Share / Import</h2>
      <form id="share-form">
        <label>Record ID</label><input id="s-id" required placeholder="loc_000001" />
        <button type="submit">Generate Share Link</button>
      </form>
      <input id="share-link" readonly />
      <form id="import-form">
        <label>Paste Link</label><input id="i-url" placeholder="https://workpads.me/new#..." />
        <button type="submit">Import Link</button>
      </form>
    </section>

    <section>
      <h2>Comments</h2>
      <form id="comment-add-form">
        <label>Record ID</label><input id="cm-id" required />
        <label>Name (optional)</label><input id="cm-name" />
        <label>Text</label><input id="cm-text" required />
        <button type="submit">Add Comment</button>
      </form>
      <form id="comment-list-form">
        <label>Record ID</label><input id="cl-id" required />
        <button type="submit">List Comments</button>
      </form>
      <pre id="comments-output"></pre>
    </section>

    <section>
      <h2>Storage Policy</h2>
      <form id="storage-set-form">
        <label>Business</label><input id="st-business" value="biz_001" />
        <label>Default Mode</label><input id="st-mode" value="ephemeral" />
        <label>TTL Hours</label><input id="st-ttl" value="24" />
        <button type="submit">Set Policy</button>
      </form>
      <button id="storage-get-btn">Get Policy</button>
      <button id="storage-resolve-btn">Resolve (override stored)</button>
      <pre id="storage-output"></pre>
    </section>

    <section>
      <h2>Templates</h2>
      <button id="template-show-btn">Show svc-basic</button>
      <button id="template-validate-kv-btn">Validate KV</button>
      <button id="template-validate-yaml-btn">Validate YAML</button>
      <pre id="template-output"></pre>
    </section>

    <section>
      <h2>Dashboard</h2>
      <pre id="dashboard"></pre>
    </section>

    <section>
      <h2>Records</h2>
      <div id="records"></div>
    </section>
  </main>
  <script src="/app.js"></script>
</body>
</html>`;
}

function browserCss() {
  return `*{box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}
body{margin:0;background:#fff;color:#111}
.frame{width:100%;max-width:600px;margin:0 auto;padding:16px}
section{border-top:1px solid #ddd;padding-top:10px;margin-bottom:16px}
label{display:block;margin:8px 0 4px}
input,textarea,button{width:100%;padding:8px;border:1px solid #ccc;border-radius:3px}
button{margin-top:8px;background:#f4f4f4;cursor:pointer}
textarea{min-height:60px}
pre{border:1px solid #ddd;padding:8px;white-space:pre-wrap}
.record{border:1px solid #ddd;padding:8px;margin-bottom:8px}
.row{display:flex;gap:8px;flex-wrap:wrap}
.row button{width:auto;padding:6px 10px}`;
}

function browserJs() {
  return `async function api(path, opts = {}) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (_) {}
  if (!res.ok) throw new Error(data.error || text || "Request failed");
  return data;
}

function parseSetLines(text) {
  return String(text || "").split("\\n").map(s => s.trim()).filter(Boolean);
}

async function refresh() {
  const recordsRes = await api("/api/records");
  const dashRes = await api("/api/dashboard");
  document.getElementById("dashboard").textContent = JSON.stringify(dashRes, null, 2);
  const box = document.getElementById("records");
  box.innerHTML = "";
  for (const r of recordsRes.records) {
    const id = r.id;
    const div = document.createElement("div");
    div.className = "record";
    div.innerHTML = "<strong>" + id + "</strong><br/>job: " + (r.process?.job || "") + "<br/>variant: " + (r.variant || "plain") + "<br/>storage: " + (r.storage?.mode || "unset");
    const row = document.createElement("div");
    row.className = "row";
    const shareBtn = document.createElement("button");
    shareBtn.textContent = "Share";
    shareBtn.onclick = async () => {
      const out = await api("/api/share", { method: "POST", body: JSON.stringify({ recordId: id }) });
      document.getElementById("share-link").value = out.link || "";
      await refresh();
    };
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = async () => {
      await api("/api/records/" + encodeURIComponent(id), { method: "DELETE" });
      await refresh();
    };
    row.appendChild(shareBtn);
    row.appendChild(delBtn);
    div.appendChild(row);
    box.appendChild(div);
  }
}

document.getElementById("create-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  await api("/api/records", {
    method: "POST",
    body: JSON.stringify({
      job: document.getElementById("c-job").value.trim(),
      location: document.getElementById("c-location").value.trim(),
      date: document.getElementById("c-date").value.trim(),
      details: document.getElementById("c-details").value.trim(),
      story: document.getElementById("c-story").value.trim()
    })
  });
  e.target.reset();
  await refresh();
});

document.getElementById("edit-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  await api("/api/records/edit", {
    method: "POST",
    body: JSON.stringify({
      recordId: document.getElementById("e-id").value.trim(),
      set: parseSetLines(document.getElementById("e-set").value),
      addAction: document.getElementById("e-action").value.trim()
    })
  });
  await refresh();
});

document.getElementById("share-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = await api("/api/share", { method: "POST", body: JSON.stringify({ recordId: document.getElementById("s-id").value.trim() }) });
  document.getElementById("share-link").value = out.link || "";
  await refresh();
});

document.getElementById("import-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  await api("/api/import", { method: "POST", body: JSON.stringify({ url: document.getElementById("i-url").value.trim() }) });
  e.target.reset();
  await refresh();
});

document.getElementById("comment-add-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = await api("/api/comments/add", {
    method: "POST",
    body: JSON.stringify({
      recordId: document.getElementById("cm-id").value.trim(),
      name: document.getElementById("cm-name").value.trim(),
      text: document.getElementById("cm-text").value.trim()
    })
  });
  document.getElementById("comments-output").textContent = JSON.stringify(out, null, 2);
});

document.getElementById("comment-list-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = await api("/api/comments/list", { method: "POST", body: JSON.stringify({ recordId: document.getElementById("cl-id").value.trim() }) });
  document.getElementById("comments-output").textContent = JSON.stringify(out, null, 2);
});

document.getElementById("storage-set-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = await api("/api/storage/set", {
    method: "POST",
    body: JSON.stringify({
      business: document.getElementById("st-business").value.trim(),
      mode: document.getElementById("st-mode").value.trim(),
      ttl: document.getElementById("st-ttl").value.trim()
    })
  });
  document.getElementById("storage-output").textContent = JSON.stringify(out, null, 2);
  await refresh();
});

document.getElementById("storage-get-btn").addEventListener("click", async () => {
  const out = await api("/api/storage/get?business=" + encodeURIComponent(document.getElementById("st-business").value.trim()));
  document.getElementById("storage-output").textContent = JSON.stringify(out, null, 2);
});

document.getElementById("storage-resolve-btn").addEventListener("click", async () => {
  const out = await api("/api/storage/resolve?business=" + encodeURIComponent(document.getElementById("st-business").value.trim()) + "&override=stored");
  document.getElementById("storage-output").textContent = JSON.stringify(out, null, 2);
});

document.getElementById("template-show-btn").addEventListener("click", async () => {
  const out = await api("/api/template/show?template=svc-basic");
  document.getElementById("template-output").textContent = JSON.stringify(out, null, 2);
});
document.getElementById("template-validate-kv-btn").addEventListener("click", async () => {
  const out = await api("/api/template/validate", { method: "POST", body: JSON.stringify({ file: "./templates/svc-basic.kv", format: "kv" }) });
  document.getElementById("template-output").textContent = JSON.stringify(out, null, 2);
});
document.getElementById("template-validate-yaml-btn").addEventListener("click", async () => {
  const out = await api("/api/template/validate", { method: "POST", body: JSON.stringify({ file: "./templates/svc-basic.yaml", format: "yaml" }) });
  document.getElementById("template-output").textContent = JSON.stringify(out, null, 2);
});

refresh().catch((err) => alert(err.message));`;
}

async function handleBrowserApi(req, res, pathname) {
  try {
    const parsedUrl = new URL(req.url, "http://127.0.0.1");
    if (req.method === "GET" && pathname === "/api/health") {
      sendJson(res, 200, { ok: true });
      return;
    }
    if (req.method === "GET" && pathname === "/api/records") {
      const out = runCliSubcommand(["list", "--json"]);
      sendJson(res, 200, { records: JSON.parse(out.stdout || "[]") });
      return;
    }
    if (req.method === "POST" && pathname === "/api/records") {
      const body = await readJsonBody(req);
      const argv = ["create", "--template", "svc-basic", "--variant", "plain"];
      if (body.business) argv.push("--business", String(body.business));
      if (body.storageOverride) argv.push("--storage-override", String(body.storageOverride));
      if (body.job) argv.push("--set", `process.job=${body.job}`);
      if (body.location) argv.push("--set", `process.location=${body.location}`);
      if (body.date) argv.push("--set", `process.date=${body.date}`);
      if (body.details) argv.push("--set", `details=${body.details}`);
      if (body.story) argv.push("--set", `story=${body.story}`);
      const out = runCliSubcommand(argv);
      sendJson(res, 200, { record: JSON.parse(out.stdout || "{}") });
      return;
    }
    if (req.method === "POST" && pathname === "/api/records/edit") {
      const body = await readJsonBody(req);
      const argv = ["edit", "--record", String(body.recordId || "")];
      const setPairs = Array.isArray(body.set)
        ? body.set
        : body.set
        ? [String(body.set)]
        : [];
      setPairs.forEach((pair) => argv.push("--set", String(pair)));
      if (body.addAction) argv.push("--add-action", String(body.addAction));
      if (body.business) argv.push("--business", String(body.business));
      if (body.storageOverride) argv.push("--storage-override", String(body.storageOverride));
      const out = runCliSubcommand(argv);
      sendJson(res, 200, { record: JSON.parse(out.stdout || "{}") });
      return;
    }
    if (req.method === "DELETE" && pathname.startsWith("/api/records/")) {
      const id = decodeURIComponent(pathname.replace("/api/records/", ""));
      runCliSubcommand(["delete", "--record", id]);
      sendJson(res, 200, { ok: true });
      return;
    }
    if (req.method === "POST" && pathname === "/api/import") {
      const body = await readJsonBody(req);
      const out = runCliSubcommand(["import", "--url", String(body.url || "")]);
      sendJson(res, 200, { record: JSON.parse(out.stdout || "{}") });
      return;
    }
    if (req.method === "POST" && pathname === "/api/share") {
      const body = await readJsonBody(req);
      const out = runCliSubcommand(["share", "--record", String(body.recordId || "")]);
      sendJson(res, 200, {
        link: out.stdout,
        meta: out.stderr
      });
      return;
    }
    if (req.method === "GET" && pathname === "/api/dashboard") {
      const out = runCliSubcommand(["dashboard", "--json"]);
      sendJson(res, 200, JSON.parse(out.stdout || "{}"));
      return;
    }
    if (req.method === "POST" && pathname === "/api/comments/add") {
      const body = await readJsonBody(req);
      const argv = [
        "comment:add",
        "--record",
        String(body.recordId || ""),
        "--text",
        String(body.text || "")
      ];
      if (body.name) argv.push("--name", String(body.name));
      const out = runCliSubcommand(argv);
      sendJson(res, 200, { comments: JSON.parse(out.stdout || "[]") });
      return;
    }
    if (req.method === "POST" && pathname === "/api/comments/list") {
      const body = await readJsonBody(req);
      const out = runCliSubcommand(["comment:list", "--record", String(body.recordId || "")]);
      sendJson(res, 200, { comments: JSON.parse(out.stdout || "[]") });
      return;
    }
    if (req.method === "GET" && pathname === "/api/storage/get") {
      const business = parsedUrl.searchParams.get("business") || "";
      const out = runCliSubcommand(["storage:get", "--business", business]);
      sendJson(res, 200, JSON.parse(out.stdout || "{}"));
      return;
    }
    if (req.method === "POST" && pathname === "/api/storage/set") {
      const body = await readJsonBody(req);
      const argv = [
        "storage:set",
        "--business",
        String(body.business || ""),
        "--default",
        String(body.mode || "")
      ];
      if (body.ttl !== undefined && body.ttl !== "") argv.push("--ttl-hours", String(body.ttl));
      const out = runCliSubcommand(argv);
      sendJson(res, 200, JSON.parse(out.stdout || "{}"));
      return;
    }
    if (req.method === "GET" && pathname === "/api/storage/resolve") {
      const business = parsedUrl.searchParams.get("business") || "";
      const override = parsedUrl.searchParams.get("override");
      const argv = ["storage:resolve", "--business", business];
      if (override) argv.push("--override", override);
      const out = runCliSubcommand(argv);
      sendJson(res, 200, JSON.parse(out.stdout || "{}"));
      return;
    }
    if (req.method === "POST" && pathname === "/api/template/validate") {
      const body = await readJsonBody(req);
      const out = runCliSubcommand([
        "template:validate",
        "--file",
        String(body.file || ""),
        "--format",
        String(body.format || "kv")
      ]);
      sendJson(res, 200, JSON.parse(out.stdout || "{}"));
      return;
    }
    if (req.method === "GET" && pathname === "/api/template/show") {
      const template = parsedUrl.searchParams.get("template") || "svc-basic";
      const out = runCliSubcommand(["template:show", "--template", template]);
      sendJson(res, 200, JSON.parse(out.stdout || "{}"));
      return;
    }
    sendJson(res, 404, { error: "Not found" });
  } catch (err) {
    sendJson(res, 400, { error: err.message });
  }
}

async function commandBrowser(args) {
  const requestedPort = Number(args.port || 8787);
  const autoPort = parseBool(args["auto-port"], true);
  const maxPortTries = Number(args["max-port-tries"] || 20);
  let port = requestedPort;
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("Invalid --port");
  }
  const uiMode = String(args.ui || "latest").toLowerCase();
  if (uiMode !== "latest" && uiMode !== "v1") {
    throw new Error("Invalid --ui. Expected latest|v1");
  }
  if (!Number.isInteger(maxPortTries) || maxPortTries <= 0) {
    throw new Error("Invalid --max-port-tries");
  }

  const requestedAvailable = await checkPortAvailable(requestedPort);
  if (!requestedAvailable) {
    if (!autoPort) {
      throw new Error(
        `Port ${requestedPort} is already in use. Re-run with --auto-port true or choose --port <n>.`
      );
    }
    const fallback = await findAvailablePort(requestedPort + 1, maxPortTries);
    if (!fallback) {
      throw new Error(
        `No free port found after ${maxPortTries} attempts starting at ${requestedPort + 1}.`
      );
    }
    port = fallback;
  }

  const server = http.createServer(async (req, res) => {
    const parsed = new URL(req.url, `http://127.0.0.1:${port}`);
    const pathname = parsed.pathname;
    if (pathname.startsWith("/api/")) {
      await handleBrowserApi(req, res, pathname);
      return;
    }
    if (req.method === "GET" && (pathname === "/v1" || pathname === "/v1/")) {
      sendText(res, 200, browserV1Html(), "text/html; charset=utf-8");
      return;
    }
    if (req.method === "GET" && pathname === "/v1/app.css") {
      sendText(res, 200, browserV1Css(), "text/css; charset=utf-8");
      return;
    }
    if (req.method === "GET" && pathname === "/v1/app.js") {
      sendText(res, 200, browserV1Js(), "application/javascript; charset=utf-8");
      return;
    }
    if (req.method === "GET" && pathname === "/") {
      if (uiMode === "v1") {
        sendText(res, 200, browserV1Html(), "text/html; charset=utf-8");
      } else {
        sendText(res, 200, browserHtml(), "text/html; charset=utf-8");
      }
      return;
    }
    if (req.method === "GET" && pathname === "/app.css") {
      sendText(res, 200, browserCss(), "text/css; charset=utf-8");
      return;
    }
    if (req.method === "GET" && pathname === "/app.js") {
      sendText(res, 200, browserJs(), "application/javascript; charset=utf-8");
      return;
    }
    sendText(res, 404, "Not found");
  });

  server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE") {
      console.error(`Error: Port ${port} is already in use on 127.0.0.1.`);
      console.error(`Try either:`);
      console.error(`  node ./workpads.js browser --auto-port true`);
      console.error(`  node ./workpads.js browser --port ${port + 1}`);
      console.error(`or stop existing service:`);
      console.error(`  node ./workpads.js browser:stop`);
      process.exit(1);
      return;
    }
    console.error(`Error: ${err.message || "Failed to start browser service"}`);
    process.exit(1);
  });

  server.listen(port, "127.0.0.1", () => {
    const state = {
      pid: process.pid,
      port,
      ui: uiMode,
      startedAt: new Date().toISOString(),
      url: `http://127.0.0.1:${port}`
    };
    saveBrowserState(state);
    if (port !== requestedPort) {
      console.log(
        `Workpads browser requested port ${requestedPort} was busy; started on ${port} instead.`
      );
    }
    console.log(`Workpads browser running at ${state.url} (ui=${uiMode})`);
  });

  const shutdown = () => {
    clearBrowserState();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

function commandBrowserStatus() {
  const state = loadBrowserState();
  if (!state) {
    console.log("No browser state found.");
    return;
  }
  console.log(JSON.stringify(state, null, 2));
}

function commandBrowserStop() {
  const state = loadBrowserState();
  if (!state || !state.pid) {
    console.log("No running browser recorded.");
    return;
  }
  try {
    process.kill(Number(state.pid), "SIGTERM");
    clearBrowserState();
    console.log(`Stopped browser process ${state.pid}.`);
  } catch (err) {
    console.error(`Could not stop process ${state.pid}: ${err.message}`);
    console.error("Try manually:");
    console.error(`  lsof -nP -iTCP:${state.port || 8787} -sTCP:LISTEN`);
    console.error("  kill <PID>");
    process.exit(1);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];
  if (!cmd || cmd === "help" || cmd === "--help") {
    printHelp();
    return;
  }

  if (cmd === "template:validate") return commandTemplateValidate(args);
  if (cmd === "template:compile") return commandTemplateCompile(args);
  if (cmd === "template:show") return commandTemplateShow(args);
  if (cmd === "create") return commandCreate(args);
  if (cmd === "edit") return commandEdit(args);
  if (cmd === "share") return commandShare(args);
  if (cmd === "import") return commandImport(args);
  if (cmd === "render") return commandRender(args);
  if (cmd === "export") return commandExport(args);
  if (cmd === "list") return commandList(args);
  if (cmd === "delete") return commandDelete(args);
  if (cmd === "storage:get" || cmd === "policy:get") return commandStorageGet(args);
  if (cmd === "storage:set" || cmd === "policy:set") return commandStorageSet(args);
  if (cmd === "storage:resolve" || cmd === "policy:resolve") return commandStorageResolve(args);
  if (cmd === "comment:add") return commandCommentAdd(args);
  if (cmd === "comment:list") return commandCommentList(args);
  if (cmd === "comment:delete") return commandCommentDelete(args);
  if (cmd === "dashboard") return commandDashboard(args);
  if (cmd === "howto") return commandHowTo(args);
  if (cmd === "browser") return commandBrowser(args);
  if (cmd === "browser:status") return commandBrowserStatus(args);
  if (cmd === "browser:stop") return commandBrowserStop(args);

  throw new Error(`Unknown command: ${cmd}`);
}

try {
  main();
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
