# Workpads Codec — Current Overview (codebook b)

**Algorithm:** pads-v1, codebook b  
**Scheme tag:** `1bg` (version 1, codebook b, DEFLATE via fflate)  
**Backwards compat:** `1ag` URLs (codebook a) remain decodable  
**Canonical spec:** `workpads-standard/codec.md` (pending update to codebook b)

---

## URL Structure

```
https://workpads.me/p#1bg/<base64url>&c=<chainRef>
```

- Hash fragment only — never sent to a server
- `1bg/` = 3-char scheme tag + literal `/` separator
- `<base64url>` = compressed binary frame, base64url-encoded (no padding)
- `&c=<chainRef>` = optional 4-char base64url chain reference (3 random bytes)

Detection: `/^[0-9][a-z][a-z]\//.test(hash)` — extract payload as `hash.slice(4)`.

---

## Binary Frame

```
Byte 0:    Template byte (0x01 = svc-basic)
Bytes 1–2: Presence flags (uint16, big-endian)
[low scalar blobs, bits 0–8 in ascending order]
[actions blob, if bit 9 set]
[high scalar blobs, bits 10–11 in ascending order]
[financial block, if bit 12 set]
```

### Presence Flags — 16-bit Big-Endian

| Bit | Field | Notes |
|-----|-------|-------|
| 0 | `job` | scalar |
| 1 | `customer` | scalar |
| 2 | `date` | scalar |
| 3 | `location` | scalar |
| 4 | `meeting_time` | scalar |
| 5 | `start_time` | scalar |
| 6 | `end_time` | scalar |
| 7 | `customer_phone` | scalar |
| 8 | `worker` | scalar |
| 9 | actions blob | — |
| 10 | `details` | scalar |
| 11 | `story` | scalar |
| 12 | financial block | FIN flag — codebook b |
| 13–15 | — | reserved for future use |

### Scalar Blob Format

```
[uint16 big-endian length][UTF-8 bytes...]
```

### Actions Blob (bit 9)

```
[uint8 count]
  [uint16 title_len][title UTF-8]
  [uint16 notes_len][notes UTF-8]
  ... repeated for each action (max 20)
```

---

## Financial Block (bit 12)

All financial data — scalars and line items — in a single structured block, within the same deflate context as the main frame.

```
[uint8 fin_flags]
```

| fin_flag bit | Field | Encoding |
|-------------|-------|----------|
| `0x01` | `record_type` | enum byte¹ |
| `0x02` | `currency` | enum byte² |
| `0x04` | `vat` | enum byte³ |
| `0x08` | `amount` | `[uint16][UTF-8]` |
| `0x10` | expenses | `[uint8 count]` + items |
| `0x20` | payments | `[uint8 count]` + items |

¹ `record_type` enum: `0=quote, 1=invoice, 2=expense, 3=payment` (255 = custom string: `[uint16][UTF-8]`)  
² `currency` enum: `0=GBP, 1=USD, 2=EUR, 3=CAD, 4=AUD, 5=NZD, 6=ZAR` (255 = custom)  
³ `vat` enum: `0=0, 1=5, 2=7.5, 3=10, 4=12.5, 5=15, 6=20, 7=23, 8=25` (255 = custom)

### Expense Item

```
[uint8 item_flags]
[uint16][UTF-8 amount]          — always present
[uint16][UTF-8 job]             — if item_flags & 0x01
[uint16][UTF-8 date]            — if item_flags & 0x02
[uint8 billing_enum]            — if item_flags & 0x04  (0=billable,1=non-billable,2=absorbed,3=cogs)
[uint8 actionIdx]               — if item_flags & 0x08
is_viewer flag                  — item_flags & 0x10 (no extra bytes; bit only)
```

### Payment Item

```
[uint8 item_flags]
[uint16][UTF-8 amount]          — always present
[uint16][UTF-8 job]             — if item_flags & 0x01
[uint16][UTF-8 date]            — if item_flags & 0x02
```

---

## Codebook a (backwards compat)

Codebook-a URLs (`1ag/`) use bits 12–15 as plain scalars:

| Bit | Field |
|-----|-------|
| 12 | `amount` (scalar string) |
| 13 | `currency` (scalar string) |
| 14 | `vat` (scalar string) |
| 15 | `record_type` (scalar string) |

No financial line items. Decoders must check scheme tag and route accordingly.

---

## Implementations

| File | Role |
|------|------|
| `workpadsdotme/js/lib/codec.js` | Canonical JS — `window.WPCodec = {encode, decode}` |
| `workpadsdotme/p/index.html` | Inline copy — decode + ACK encode + augmented share |
| `workpadsdotme/p/customer.html` | Inline copy — decode + full encode (viewer expense flow) |
| `workpads-codec/` | npm package — pending promotion of codebook b (v0.2) |

All three inline copies must stay byte-for-byte identical. See `workpads/system/SYNC.md`.
