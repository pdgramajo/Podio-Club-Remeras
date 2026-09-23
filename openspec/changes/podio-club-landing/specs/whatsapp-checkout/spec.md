# WhatsApp Checkout Specification

## Purpose

Defines how the cart is converted into a WhatsApp order: the pure message-construction function with its exact format contract, the deep link that opens the chat with the preconfigured number, and the empty-cart guard. Checkout is the final step of the flow since there is no backend or payment system.

## Requirements

### Requirement: Checkout message construction

The system MUST build the checkout message as a pure function of the cart state, in exactly this format:

```
Hola! Quiero comprar:
{n}x {nombre} - Talle {talle} ({precio_unitario})
...one line per cart line item...
Total: {total}
```

Where:

- Each line item occupies its own line.
- `{n}` is the line quantity.
- `{nombre}` is the product name.
- `{talle}` is the selected size in canonical format.
- `{precio_unitario}` is the unit price formatted with the shared es-AR formatter.
- `{total}` is the cart total (sum of unit price × quantity) formatted with the same formatter.

Line items MUST appear in the order they were added to the cart. The message MUST be produced by a single exported function that takes the cart state and returns the exact string; the function MUST have no side effects so tests can assert its exact output.

#### Scenario: Exact message for a two-item cart

- GIVEN a cart with lines `2 × "Camiseta Argentina Local 2024" / size L / 45000` and `1 × "Camiseta River Plate 2024" / size NIÑO-8 / 40000`
- WHEN the message builder runs
- THEN the output is exactly:

```
Hola! Quiero comprar:
2x Camiseta Argentina Local 2024 - Talle L ($45.000,00)
1x Camiseta River Plate 2024 - Talle NIÑO-8 ($40.000,00)
Total: $130.000,00
```

#### Scenario: Single-item cart

- GIVEN a cart with one line `1 × "Camiseta Boca Juniors 2024" / size XL / 50000`
- WHEN the message builder runs
- THEN the output contains exactly the one item line
- AND the total line is `Total: $50.000,00`

#### Scenario: Empty cart

- GIVEN an empty cart
- WHEN the message builder runs
- THEN it returns the empty string

### Requirement: WhatsApp deep link

The system MUST open the WhatsApp conversation with the preconfigured number `+5493884372397` when the user activates the checkout control, using the standard deep link `https://wa.me/5493884372397?text={url-encoded message}`. The phone number MUST be defined once as a single shared constant (single source of truth, no environment variable needed for a static site) and MUST NOT accept user-provided numbers. The `text` parameter MUST be the exact output of the checkout message builder, URL-encoded so that WhatsApp decodes it to the identical text (spaces, newlines, accents, and `$` preserved).

#### Scenario: Checkout control targets the deep link

- GIVEN a cart with one line item
- WHEN the user activates the checkout control
- THEN the control's link target is `https://wa.me/5493884372397` with the message in the `text` parameter
- AND the decoded `text` equals the exact output of the message builder

#### Scenario: URL-encoding round-trip

- GIVEN a message containing spaces, newlines, accented characters, and `$`
- WHEN the deep link URL is parsed and the `text` parameter decoded
- THEN the decoded value equals the original message character-for-character

### Requirement: Empty-cart checkout guard

The system MUST NOT offer the WhatsApp checkout when the cart is empty: the checkout control MUST be disabled and MUST never open a link in that state.

#### Scenario: Guarded checkout with empty cart

- GIVEN an empty cart drawer
- WHEN the user activates the disabled checkout control
- THEN no WhatsApp link is opened
- AND an empty-cart message in Spanish is shown instead

### Requirement: Message visibility as fallback

The system SHOULD expose the generated message as readable, copyable text in the checkout area (a read-only preview or a copy-to-clipboard control), so that if the `wa.me` deep link does not open WhatsApp on the user's device (desktop app vs web vs mobile differences), the user can still send the order manually.

#### Scenario: Copyable message

- GIVEN a non-empty cart
- WHEN the user activates the copy control in the checkout area
- THEN the exact checkout message text is copied to the clipboard
- AND the copied text matches the message builder output exactly
