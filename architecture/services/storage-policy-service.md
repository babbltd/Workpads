# Storage Policy Service

## Responsibility

Resolve effective storage behavior from business defaults and per-workpad overrides.

## Public API

- `GET /v1/policies/{businessId}`
- `PUT /v1/policies/{businessId}`
- `POST /v1/policies/resolve`

## Policy Contract

Request to resolve:

```json
{
  "businessId": "b_01",
  "businessDefault": "ephemeral",
  "override": "stored"
}
```

Response:

```json
{
  "effectiveMode": "stored",
  "ttlHours": null
}
```

## Boundary Rules

- Owns only policy decisions.
- Does not read or write record content.
