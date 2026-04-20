# CLI Quickstart

## How-To (Role Flows)

For the full role-based operational guide, see `cheat-sheet.md`.

You can also print role flows directly in CLI:

```bash
node ./workpads.js howto
node ./workpads.js howto --role owner
```

### Owner: Set policy defaults

```bash
node ./workpads.js storage:set --business biz_001 --default ephemeral --ttl-hours 24 --allow-override true
node ./workpads.js storage:get --business biz_001
```

### Dispatcher: Create, edit, and share

```bash
node ./workpads.js create --template svc-basic --variant plain --business biz_001 --set process.job="Replace faucet"
node ./workpads.js edit --record loc_000001 --add-action "Arrive|Inspect site" --set details="Bring standard tools"
node ./workpads.js share --record loc_000001
```

### Receiver: Import and view

```bash
echo "https://workpads.me/new#<payload>" | node ./workpads.js import
node ./workpads.js render --record loc_000002
```

### Team notes: Comment workflow

```bash
node ./workpads.js comment:add --record loc_000001 --text "Parts delivered" --name "Alex"
node ./workpads.js comment:list --record loc_000001
```

### Supervisor: Daily dashboard

```bash
node ./workpads.js list
node ./workpads.js dashboard
```

## Install

From `repos/workpads`:

```bash
npm install
```

## Run Commands

Use either:

```bash
npx workpads <command>
```

or:

```bash
node ./workpads.js <command>
```

Run local browser service:

```bash
node ./workpads.js browser
```

Custom port:

```bash
node ./workpads.js browser --port 8787
```

Auto-port fallback (recommended):

```bash
node ./workpads.js browser --auto-port true
```

Choose default UI at root:

```bash
node ./workpads.js browser --ui latest
node ./workpads.js browser --ui v1
```

Check running browser status:

```bash
node ./workpads.js browser:status
```

Stop running browser service:

```bash
node ./workpads.js browser:stop
```

Pinned simple version (fork snapshot) is available at:

```text
http://127.0.0.1:8787/v1/
```

## Commands

Validate template:

```bash
node ./workpads.js template:validate --file ./templates/svc-basic.kv --format kv
```

Compile template to runtime JSON:

```bash
node ./workpads.js template:compile --file ./templates/svc-basic.yaml --format yaml --out ./templates/runtime/svc-basic.v1.json
```

Show compiled template:

```bash
node ./workpads.js template:show --template svc-basic
```

Create a record:

```bash
node ./workpads.js create --template svc-basic --variant plain --set process.job="Replace faucet"
```

Create with storage policy context:

```bash
node ./workpads.js create --template svc-basic --variant plain --business biz_001 --set process.job="Replace faucet"
```

Edit a record:

```bash
node ./workpads.js edit --record loc_000001 --add-action "Arrive|Check scope" --set details="Bring tools"
```

Edit with storage override:

```bash
node ./workpads.js edit --record loc_000001 --business biz_001 --storage-override stored
```

Share as compact link:

```bash
node ./workpads.js share --record loc_000001
```

Import a shared link:

```bash
node ./workpads.js import --url "https://workpads.me/new#<payload>"
```

Import by paste/pipe:

```bash
echo "https://workpads.me/new#<payload>" | node ./workpads.js import
```

Round-trip example:

```bash
LINK=$(node ./workpads.js share --record loc_000001 | tr -d '\n')
node ./workpads.js import --url "$LINK"
```

Render in terminal:

```bash
node ./workpads.js render --record loc_000001
```

Render as JSON:

```bash
node ./workpads.js render --record loc_000001 --json
```

Export record to file:

```bash
node ./workpads.js export --record loc_000001 --out ./exports/loc_000001.json
```

List records:

```bash
node ./workpads.js list
```

Default list columns:

- `recordId`
- `variant`
- `storageMode`
- `shareBytes`
- `job`

List records as JSON:

```bash
node ./workpads.js list --json
```

Delete a record:

```bash
node ./workpads.js delete --record loc_000001
```

Get storage policy:

```bash
node ./workpads.js storage:get --business biz_001
```

Set storage policy:

```bash
node ./workpads.js storage:set --business biz_001 --default ephemeral --ttl-hours 24 --allow-override true
```

Resolve effective storage:

```bash
node ./workpads.js storage:resolve --business biz_001 --override stored
```

Compatibility aliases:

- `policy:get` -> `storage:get`
- `policy:set` -> `storage:set`
- `policy:resolve` -> `storage:resolve`

Add comment:

```bash
node ./workpads.js comment:add --record loc_000001 --text "Arrived on site" --name "Alex"
```

List comments:

```bash
node ./workpads.js comment:list --record loc_000001
```

Delete comment by index:

```bash
node ./workpads.js comment:delete --record loc_000001 --index 0
```

Size dashboard:

```bash
node ./workpads.js dashboard
```

Size dashboard (JSON):

```bash
node ./workpads.js dashboard --json
```

## Notes

- Local data store: `.workpads/records.json`
- Local storage policy store: `.workpads/storage-policies.json`
- Store is intentionally local and ephemeral-friendly.
- Share links use deflate-raw + base64url and hash suffix.
