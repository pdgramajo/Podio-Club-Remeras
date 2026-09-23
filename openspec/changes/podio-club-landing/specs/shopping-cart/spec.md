# Shopping Cart Specification

## Purpose

Defines the client-side cart: state management (add with size, quantity handling, removal, running total) and the lateral drawer presentation with open/close behavior and animation. Cart state lives only in the browser session; there is no persistence and no backend.

## Requirements

### Requirement: Cart state model

The system MUST hold cart state entirely client-side using React Context with a reducer (`useReducer`), with no extra state library. The cart state MUST consist of a list of line items and an open/closed flag. Each line item MUST carry: product id, product name, selected size, unit price (ARS, from the product data), and quantity (positive integer). Line items MUST be keyed by the product id + size combination.

#### Scenario: Initial cart state

- GIVEN a fresh page load
- WHEN no cart actions have been dispatched
- THEN the cart holds zero line items
- AND the drawer is closed

### Requirement: Adding items with aggregation

The system MUST add an item with its selected size and quantity 1 when an add-to-cart action is dispatched. Adding a product+size combination that already exists in the cart MUST increment that line item's quantity by 1 instead of creating a duplicate line. The unit price MUST remain the product's stored price; the line total is unit price × quantity.

#### Scenario: Adding the same product+size twice

- GIVEN an empty cart
- WHEN two add actions for product `1`, size `L`, price `45000` are dispatched
- THEN the cart contains a single line item for product `1` / size `L` with quantity 2
- AND the line total is `90000`

#### Scenario: Same product, different sizes

- GIVEN a cart containing product `1` size `L`
- WHEN an add action for product `1`, size `M` is dispatched
- THEN a second line item is created for the same product with the different size
- AND the existing line is unchanged

### Requirement: Quantity adjustment and removal

The system MUST let the user adjust the quantity of a line item (increment and decrement) and remove a line item entirely from the drawer. Decrementing a line at quantity 1 MUST remove the line rather than reaching quantity 0. Any quantity change MUST recompute the running total.

#### Scenario: Increment and decrement round-trip

- GIVEN a cart with one line item of quantity 1
- WHEN the user increments and then decrements the quantity
- THEN the quantity returns to 1
- AND the running total reflects the current quantity at every step

#### Scenario: Decrement from one removes the line

- GIVEN a cart with one line item of quantity 1
- WHEN the user decrements the quantity
- THEN the line item is removed
- AND the cart reaches the empty state

#### Scenario: Explicit removal

- GIVEN a cart with two line items
- WHEN the user removes one line item via its remove control
- THEN only that line is removed
- AND the other line and its quantity are unchanged
- AND the total is recomputed

### Requirement: Running total

The system MUST derive the cart total exclusively from line items, as the sum of unit price × quantity per line, formatted with the single shared ARS formatter (see product-data: Single ARS price formatter). The total shown in the drawer MUST be semantically identical to the total used in the WhatsApp checkout message.

#### Scenario: Multi-line total

- GIVEN a cart with two lines: 2 × `45000` and 1 × `40000`
- WHEN the total is computed
- THEN the total equals `130000`
- AND it displays with the es-AR formatter as `$130.000,00`
- AND the WhatsApp checkout total uses the same computed value

### Requirement: Cart drawer presentation

The system MUST present the cart as a lateral drawer (a panel sliding in from the side of the viewport) that lists each line item with name, size, unit price, quantity, and a per-item remove control, followed by the running total and the WhatsApp checkout control. The drawer MUST open when an item is added to the cart and when the user activates the cart control; it MUST close via its close control and via clicking the backdrop overlay. Closing the drawer MUST NOT clear the cart. On mobile the drawer MUST occupy the full viewport width. The drawer open/close transition MUST be animated.

#### Scenario: Open on add-to-cart

- GIVEN a user on a product detail page
- WHEN the user adds a size-selected product to the cart
- THEN the drawer opens with a slide-in animation
- AND the drawer lists the added item with name, size, price, and quantity

#### Scenario: Close via backdrop without clearing

- GIVEN an open drawer with two line items
- WHEN the user clicks the backdrop overlay or the close control
- THEN the drawer closes
- AND the cart still holds the two line items

#### Scenario: Empty drawer state

- GIVEN a cart with no line items
- WHEN the drawer is opened
- THEN an empty-cart message in Spanish is shown
- AND the WhatsApp checkout control is disabled

#### Scenario: Mobile width

- GIVEN a mobile viewport
- WHEN the drawer is opened
- THEN the drawer spans the full width of the viewport
- AND all line items and the total remain readable and tappable

### Requirement: Cart ephemerality

The system MUST keep cart state in memory only: reloading the page MUST reset the cart to empty. No persistence mechanism (localStorage, sessionStorage, cookies, or backend) is allowed.

#### Scenario: Refresh resets the cart

- GIVEN a cart with two line items
- WHEN the user reloads the page
- THEN the cart renders empty
- AND the drawer is closed
