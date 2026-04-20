# Comment Service

## Responsibility

Handle social variant comments with anonymous-by-default identity handling.

## Public API

- `POST /v1/comments/append`
- `GET /v1/comments/{recordId}`
- `DELETE /v1/comments/{recordId}/{commentId}`

## Comment Contract

```json
{
  "recordId": "loc_01hxy2",
  "comment": {
    "x": "Customer requested before 5pm",
    "n": "Alex"
  }
}
```

- `n` is optional; omitted means anonymous display.

## Boundary Rules

- Only active for `social` variant.
- Uses same storage policy result as parent workpad.
- No mandatory user account binding.
