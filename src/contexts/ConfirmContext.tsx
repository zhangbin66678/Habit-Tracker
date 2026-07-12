"use client";

import { useState, useCallback, ReactNode } from "react";

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmContextType {
  confirm: (opts: Omit<ConfirmState, "open">) => void;
}

const ConfirmContext = React.createContext<ConfirmContextType | null>(null);

import React from "react";

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState>({ open: false, title: "", message: "", onConfirm: () => {} });

  const confirm = useCallback((opts: Omit<ConfirmState, "open">) => {
    setState({ ...opts, open: true });
  }, []);

  const handleClose = () => setState((s) => ({ ...s, open: false }));

  const handleConfirm = () => {
    state.onConfirm();
    handleClose();
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.open && (
        <div className="fixed inset-0 bg-black/40 z-[150] flex items-center justify-center p-4" onClick={handleClose}>
          <div className="bg-white rounded-2xl w-full max-w-xs p-5 shadow-xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 text-base mb-2">{state.title}</h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">{state.message}</p>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                {state.cancelText || "取消"}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white ${
                  state.danger ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {state.confirmText || "确定"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}