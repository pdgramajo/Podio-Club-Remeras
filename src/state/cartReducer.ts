import type { CartLine } from "../types/product";
import { cartLineKey } from "../utils/cart";

/**
 * Pure cart state machine (shopping-cart spec). Held in memory only — no
 * persistence; reloading resets the cart. Totals are never stored here:
 * every consumer derives them via `cartTotal` (design "Cart state contract").
 */
export interface CartState {
  lines: CartLine[];
  isOpen: boolean;
}

export type CartAction =
  | {
      type: "ADD_ITEM";
      payload: { productId: number; name: string; size: string; unitPrice: number };
    }
  | { type: "INCREMENT"; payload: { productId: number; size: string } }
  | { type: "DECREMENT"; payload: { productId: number; size: string } }
  | { type: "REMOVE_ITEM"; payload: { productId: number; size: string } }
  | { type: "CLEAR" }
  | { type: "SET_OPEN"; payload: boolean };

export const initialCartState: CartState = { lines: [], isOpen: false };

function lineKey(productId: number, size: string): string {
  return cartLineKey({ productId, size });
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { productId, name, size, unitPrice } = action.payload;
      const key = lineKey(productId, size);
      const existing = state.lines.some((line) => lineKey(line.productId, line.size) === key);

      const lines = existing
        ? state.lines.map((line) =>
            lineKey(line.productId, line.size) === key
              ? { ...line, quantity: line.quantity + 1 }
              : line,
          )
        : [...state.lines, { productId, name, size, unitPrice, quantity: 1 }];

      return { ...state, lines };
    }

    case "INCREMENT":
      return {
        ...state,
        lines: state.lines.map((line) =>
          lineKey(line.productId, line.size) ===
          lineKey(action.payload.productId, action.payload.size)
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        ),
      };

    case "DECREMENT": {
      const key = lineKey(action.payload.productId, action.payload.size);
      // Decrementing a line at quantity 1 removes it — quantity never reaches 0.
      const lines = state.lines.flatMap((line) =>
        lineKey(line.productId, line.size) === key
          ? line.quantity <= 1
            ? []
            : [{ ...line, quantity: line.quantity - 1 }]
          : [line],
      );
      return { ...state, lines };
    }

    case "REMOVE_ITEM": {
      const key = lineKey(action.payload.productId, action.payload.size);
      return {
        ...state,
        lines: state.lines.filter((line) => lineKey(line.productId, line.size) !== key),
      };
    }

    case "CLEAR":
      // Explicit cart reset (dispatch-level addition); never closes the drawer.
      return { ...state, lines: [] };

    case "SET_OPEN":
      // Drawer flag only — closing never clears the cart.
      return { ...state, isOpen: action.payload };
  }
}
