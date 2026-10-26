import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function PasswordInput({
  id,
  registration,
  autoComplete,
}: {
  id: string;
  registration: UseFormRegisterReturn;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...registration}
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        className="h-11.5 w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 pr-12 text-[15px] text-ink outline-none transition placeholder:text-subtle focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15"
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
      >
        {visible ? (
          <FiEyeOff className="h-4.5 w-4.5" />
        ) : (
          <FiEye className="h-4.5 w-4.5" />
        )}
      </button>
    </div>
  );
}