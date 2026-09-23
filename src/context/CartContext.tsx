/* eslint-disable react-refresh/only-export-components -- the useCart hook must
   stay in the same module as the context it reads; splitting it out would force
   a second context module for zero benefit (design "Component/state structure"). */
import { createContext, useContext, useMemo, useReducer, useState, type ReactNode } from "react";
import { cartReducer, initialCartState } from "../state/cartReducer";
import type { CartLine } from "../types/product";

/**
 * Product just added to the cart — drives the add-to-cart confirmation toast
 * (UX). The identity changes on every add (fresh object with a new `at`), so
 * consumers can key effects and animations on it.
 */
export interface AddedNotice {
  name: string;
  at: number;
}

/**
 * Cart API exposed by the provider — a thin, stable surface over the pure
 * reducer (design "Component/state structure"). The provider adds no logic:
 * every behavior lives in cartReducer.ts where it is unit-tested, and the
 * reducer state (lines + open flag) is exposed read-only. Add feedback
 * (lastAdded + addedSeq) lives here, outside the reducer, because it is
 * ephemeral UI state, not cart domain state.
 */
interface CartApi {
  lines: CartLine[];
  isOpen: boolean;
  /** Last product added, or null while no confirmation toast is pending. */
  lastAdded: AddedNotice | null;
  /** Monotonic counter bumped on every add — key for the badge pop animation. */
  addedSeq: number;
  addItem: (productId: number, name: string, size: string, unitPrice: number) => void;
  increment: (productId: number, size: string) => void;
  decrement: (productId: number, size: string) => void;
  removeItem: (productId: number, size: string) => void;
  clear: () => void;
  /** Clears the pending add notice (toast dismissal). */
  dismissAdded: () => void;
  setOpen: (open: boolean) => void;
}

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const [addedNotice, setAddedNotice] = useState<AddedNotice | null>(null);
  const [addedSeq, setAddedSeq] = useState(0);

  const api = useMemo<CartApi>(
    () => ({
      lines: state.lines,
      isOpen: state.isOpen,
      lastAdded: addedNotice,
      addedSeq,
      addItem: (productId, name, size, unitPrice) => {
        dispatch({ type: "ADD_ITEM", payload: { productId, name, size, unitPrice } });
        setAddedNotice({ name, at: Date.now() });
        setAddedSeq((seq) => seq + 1);
      },
      increment: (productId, size) => dispatch({ type: "INCREMENT", payload: { productId, size } }),
      decrement: (productId, size) => dispatch({ type: "DECREMENT", payload: { productId, size } }),
      removeItem: (productId, size) =>
        dispatch({ type: "REMOVE_ITEM", payload: { productId, size } }),
      clear: () => dispatch({ type: "CLEAR" }),
      dismissAdded: () => setAddedNotice(null),
      setOpen: (open) => dispatch({ type: "SET_OPEN", payload: open }),
    }),
    [state.lines, state.isOpen, addedNotice, addedSeq],
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
