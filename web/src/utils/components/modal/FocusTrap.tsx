import { FocusTrap as FocusTrapReact } from "focus-trap-react";

export default function FocusTrap({ children }: { children: React.ReactNode }) {
  return (
    <FocusTrapReact
      focusTrapOptions={{
        initialFocus: false, // false means don't focus on the first focusable element inside the modal
        allowOutsideClick: (e) => {
          const target = e.target as HTMLElement | null;
          return !!target?.closest("[data-allow-click='true']");
        }, // allows outside clicks, such as if there is an Error Modal
      }}
    >
      {children}
    </FocusTrapReact>
  );
}
