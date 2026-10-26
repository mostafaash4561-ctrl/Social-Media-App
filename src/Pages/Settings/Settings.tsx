import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useId, useState } from "react";
import { Helmet } from "react-helmet";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { AuthContext } from "../../Context/AuthContext/AuthContext";
import { getErrorMessage } from "../../Logic/getErrorMessage";
import { API_URL, authConfig } from "../../Logic/suggestions";
import {
  ChangePasswordSchema,
  type ChangePasswordSchemaType,
} from "../../Schemas/auth.schema";

const MySwal = withReactContent(Swal);

function PasswordField({
  label,
  error,
  registration,
  autoComplete,
}: {
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
  autoComplete: string;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-ink-soft">
        {label}
      </label>
      <div className="relative">
        <input
          {...registration}
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className="h-11.5 w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 pr-12 text-[15px] text-ink outline-none transition placeholder:text-subtle focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15"
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
        >
          {visible ? (
            <FiEyeOff className="h-4.5 w-4.5" />
          ) : (
            <FiEye className="h-4.5 w-4.5" />
          )}
        </button>
      </div>
      {error && <p className="text-sm font-bold text-red-700">{error}</p>}
    </div>
  );
}

export default function Settings() {
  const { setuserLogin } = useContext(AuthContext);

  const { register, handleSubmit, formState, reset } =
    useForm<ChangePasswordSchemaType>({
      defaultValues: { password: "", newPassword: "", rePassword: "" },
      resolver: zodResolver(ChangePasswordSchema),
      mode: "onTouched",
    });
  const { errors } = formState;

  const { mutate, isPending } = useMutation({
    mutationFn: (values: ChangePasswordSchemaType) =>
      axios.patch(
        `${API_URL}/users/change-password`,
        { password: values.password, newPassword: values.newPassword },
        authConfig(),
      ),
    onSuccess: (res) => {
      const token = res.data?.data?.token;
      if (typeof token === "string" && token) {
        localStorage.setItem("userToken", token);
        setuserLogin(token);
      }
      MySwal.fire({
        title: res.data?.message || "Password changed successfully",
        icon: "success",
        draggable: true,
      });
      reset();
    },
    onError: (err) => {
      MySwal.fire({ icon: "error", title: "Error", text: getErrorMessage(err) });
    },
  });

  return (
    <>
      <Helmet>
        <title>Settings</title>
      </Helmet>

      <section
        aria-label="Settings"
        className="mx-auto my-5 w-full max-w-2xl px-4 font-sans text-ink sm:px-0"
      >
        <h1 className="mb-4 font-display text-2xl font-bold">Settings</h1>

        <form
          onSubmit={handleSubmit((values) => mutate(values))}
          className="flex flex-col gap-4.5 rounded-3xl border border-line-soft bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <FiLock className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5">
              <h2 className="font-display text-lg font-bold">
                Change password
              </h2>
              <p className="text-sm text-muted">
                Enter your current password, then choose a new one.
              </p>
            </div>
          </div>

          <PasswordField
            label="Current password"
            autoComplete="current-password"
            registration={register("password")}
            error={errors.password?.message}
          />
          <PasswordField
            label="New password"
            autoComplete="new-password"
            registration={register("newPassword")}
            error={errors.newPassword?.message}
          />
          <PasswordField
            label="Confirm new password"
            autoComplete="new-password"
            registration={register("rePassword")}
            error={errors.rePassword?.message}
          />

          <button
            type="submit"
            disabled={isPending}
            className="mt-1.5 flex h-13 w-full cursor-pointer items-center justify-center gap-2.5 rounded-[14px] bg-brand-600 text-base font-bold text-white transition duration-300 hover:bg-brand-800 focus:outline-none focus:ring-4 focus:ring-brand-600/30 disabled:cursor-not-allowed disabled:bg-brand-400 disabled:hover:bg-brand-400"
          >
            {isPending ? (
              <>
                <ImSpinner8 className="h-4.5 w-4.5 shrink-0 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              "Change password"
            )}
          </button>
        </form>
      </section>
    </>
  );
}
