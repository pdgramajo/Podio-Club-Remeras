/* eslint-disable react-refresh/only-export-components -- the useCart hook must
   stay in the same module as the context it reads; splitting it out would force
   a second context module for zero benefit (design "Component/state structure"). */
import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { cartReducer, initialCartState } from "../state/cartReducer";
import type { CartLine } from "../types/product";

/**
 * Cart API exposed by the provider — a thin, stable surface over the pure
 * reducer (design "Component/state structure"). The provider adds no logic:
 * every behavior lives in cartReducer.ts where it is unit-tested, and the
 * reducer state (lines + open flag) is exposed read-only.
 */
interface CartApi {
  lines: CartLine[];
  isOpen: boolean;
  addItem: (productId: number, name: string, size: string, unitPrice: number) => void;
  increment: (productId: number, size: string) => void;
  decrement: (productId: number, size: string) => void;
  removeItem: (productId: number, size: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  const api = useMemo<CartApi>(
    () => ({
      lines: state.lines,
      isOpen: state.isOpen,
      addItem: (productId, name, size, unitPrice) =>
        dispatch({ type: "ADD_ITEM", payload: { productId, name, size, unitPrice } }),
      increment: (productId, size) => dispatch({ type: "INCREMENT", payload: { productId, size } }),
      decrement: (productId, size) => dispatch({ type: "DECREMENT", payload: { productId, size } }),
      removeItem: (productId, size) =>
        dispatch({ type: "REMOVE_ITEM", payload: { productId, size } }),
      clear: () => dispatch({ type: "CLEAR" }),
      setOpen: (open) => dispatch({ type: "SET_OPEN", payload: open }),
    }),
    [state.lines, state.isOpen],
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const api = useContext(CartContext);
  if (api === null) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return api;
}
