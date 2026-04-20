# Workpads CLI Cheat Sheet

Fast reference for real-world use.

## 0) Setup

From `repos/workpads`:

```bash
npm install
node ./workpads.js help
```

## 1) Owner (Business Setup)

### Set storage defaults for business

```bash
node ./workpads.js storage:set --business biz_001 --default ephemeral --ttl-hours 24 --allow-override true
```

### Check current storage policy

```bash
node ./workpads.js storage:get --business biz_001
```

### Confirm effective mode with override example

```bash
node ./workpads.js storage:resolve --business biz_001 --override stored
```

## 2) Dispatcher (Create and Share Job)

### Create a new workpad quickly

```bash
node ./workpads.js create --template svc-basic --variant plain --business biz_001 --set process.job="Replace faucet" --set process.location="11 River Rd" --set process.date="2026-04-20"
```

### Add actions and details

```bash
node ./workpads.js edit --record loc_000001 --add-action "Arrive|Inspect site" --add-action "Install|Replace fixture" --set details="Bring standard tools"
```

### Generate share link

```bash
node ./workpads.js share --record loc_000001
```

### Generate link with temporary base URL override

```bash
node ./workpads.js share --record loc_000001 --base-url "https://workpads.me/new"
```

## 3) Worker/Receiver (Open and Rehydrate)

### Import from pasted link

```bash
node ./workpads.js import --url "https://workpads.me/new#<payload>"
```

### Import from pipe (fast paste workflow)

```bash
echo "https://workpads.me/new#<payload>" | node ./workpads.js import
```

### Render readable view

```bash
node ./workpads.js render --record loc_000002
```

## 4) Social/Comment Workflow

### Add comment (optional name)

```bash
node ./workpads.js comment:add --record loc_000001 --text "Parts delivered" --name "Alex"
```

### List comments

```bash
node ./workpads.js comment:list --record loc_000001
```

### Delete comment by index

```bash
node ./workpads.js comment:delete --record loc_000001 --index 0
```

## 5) Template Workflow

### Validate KV template

```bash
node ./workpads.js template:validate --file ./templates/svc-basic.kv --format kv
```

### Validate YAML template

```bash
node ./workpads.js template:validate --file ./templates/svc-basic.yaml --format yaml
```

### Compile template to runtime JSON

```bash
node ./workpads.js template:compile --file ./templates/svc-basic.yaml --format yaml --out ./templates/runtime/svc-basic.v1.json
```

### Inspect compiled template

```bash
node ./workpads.js template:show --template svc-basic
```

## 6) Daily Operations

### List records (with storage mode and share size)

```bash
node ./workpads.js list
```

### List full JSON

```bash
node ./workpads.js list --json
```

### Dashboard (size stats)

```bash
node ./workpads.js dashboard
```

### Dashboard as JSON

```bash
node ./workpads.js dashboard --json
```

### Export a record

```bash
node ./workpads.js export --record loc_000001 --out ./exports/loc_000001.json
```

### Delete a record

```bash
node ./workpads.js delete --record loc_000001
```

## 7) Common Patterns

### Force stored mode for one sensitive record

```bash
node ./workpads.js edit --record loc_000001 --business biz_001 --storage-override stored
```

### Return same record to default business policy

```bash
node ./workpads.js edit --record loc_000001 --business biz_001
```

### Round trip in one block

```bash
node ./workpads.js create --template svc-basic --variant plain --set process.job="Demo Job"
node ./workpads.js share --record loc_000001
echo "https://workpads.me/new#<payload>" | node ./workpads.js import
```

## 8) Quick Troubleshooting

- `Missing required field: process.job`
  - Add `--set process.job="..."`
- `Record not found`
  - Run `node ./workpads.js list` to confirm id.
- `Invalid mode`
  - Use only `ephemeral` or `stored`.
- `Missing --business when using --storage-override`
  - Include `--business biz_001`.

## 9) Alias Reminder

Storage policy commands support aliases:

- `policy:get` == `storage:get`
- `policy:set` == `storage:set`
- `policy:resolve` == `storage:resolve`
