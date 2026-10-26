import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { getErrorMessage } from "../../Logic/getErrorMessage";
import { useState } from "react";
import {
  RegisterSchema,
  type RegisterSchemaType,
} from "../../Schemas/auth.schema";
import { ImSpinner8 } from "react-icons/im";
import { Helmet } from "react-helmet";
import AuthSwitch from "../../Components/AuthSwitch/AuthSwitch";
import PasswordInput from "../../Components/PasswordInput/PasswordInput";

const MySwal = withReactContent(Swal);

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<RegisterSchemaType>({
    defaultValues: {
      name: "",
      email: "",
      dateOfBirth: "",
      gender: "male",
      password: "",
      rePassword: "",
    },
    resolver: zodResolver(RegisterSchema),
    mode: "onChange",
  });

  const { register, handleSubmit, formState } = form;

  function handleRegister(values: RegisterSchemaType) {
    setIsLoading(true);
    axios
      .post(`https://route-posts.routemisr.com/users/signup`, values)
      .then((res) => {
        if (res.data.success) {
          MySwal.fire({
            title: "Account created Successfully",
            icon: "success",
            draggable: true,
          });
          navigate("/login");
        }
      })
      .catch((err) => {
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: getErrorMessage(err),
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <>
      <Helmet>
        <title>Register</title>
      </Helmet>
      <div className="flex min-h-screen flex-wrap bg-canvas font-sans text-ink my-9 rounded-2xl">
        {/* Brand panel */}
        <aside className="flex min-w-0 flex-[1_1_420px] flex-col justify-between gap-12 bg-brand-900 p-8 text-white md:p-14 rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="font-display text-[26px] font-bold">Route</span>
          </div>

          <div className="flex flex-col gap-5">
            <h2 className="max-w-105 font-display text-4xl font-bold leading-[1.1] md:text-5xl">
              Share your world with people who get it.
            </h2>
            <p className="max-w-95 text-[17px] leading-normal text-brand-200">
              Post, follow and chat with friends in one place. Your account
              takes less than a minute.
            </p>
          </div>

          <div className="flex max-w-100 flex-col gap-3.5 rounded-[20px] bg-brand-950 p-5">
            <div className="flex items-center gap-3"></div>
            <p className="text-[15px] leading-normal">
              Just joined Route. Say hi and follow along!
            </p>
            <div className="flex gap-2">
              <span className="rounded-full bg-brand-900 px-3 py-1.5 text-xs font-semibold">
                Like
              </span>
              <span className="rounded-full bg-brand-900 px-3 py-1.5 text-xs font-semibold">
                Comment
              </span>
              <span className="rounded-full bg-brand-900 px-3 py-1.5 text-xs font-semibold">
                Share
              </span>
            </div>
          </div>
        </aside>

        {/* Form panel */}
        <main className="flex min-w-0 flex-[1_1_520px] flex-col items-center justify-center gap-6 px-8 py-12">
          <AuthSwitch />
          <form
            onSubmit={handleSubmit(handleRegister)}
            className="flex w-full max-w-115 flex-col gap-4.5"
          >
            <div className="mb-1.5 flex flex-col gap-1.5">
              <h1 className="font-display text-[34px] font-bold">
                Create your account
              </h1>
              <p className="text-[15px] text-muted">
                Fill in your details to get started.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-[13px] font-semibold text-ink-soft"
              >
                Full name
              </label>
              <input
                {...register("name")}
                id="name"
                className="h-11.5 w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 text-[15px] text-ink outline-none transition placeholder:text-subtle focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15"
              />
              {formState.errors.name?.message &&
                formState.touchedFields.name && (
                  <p className="text-red-700 font-bold">
                    {formState.errors.name?.message}
                  </p>
                )}
            </div>

            <div className="flex flex-wrap gap-4.5">
              <div className="flex min-w-0 flex-[1_1_180px] flex-col gap-1.5">
                <label
                  htmlFor="dateOfBirth"
                  className="text-[13px] font-semibold text-ink-soft"
                >
                  Date of birth
                </label>
                <input
                  {...register("dateOfBirth")}
                  id="dateOfBirth"
                  type="date"
                  className="h-11.5 w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 text-[15px] text-ink outline-none transition placeholder:text-subtle focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15"
                />
                <p className="text-red-700 font-bold">
                  {formState.errors.dateOfBirth?.message}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-[13px] font-semibold text-ink-soft"
              >
                Email
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                className="h-11.5 w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 text-[15px] text-ink outline-none transition placeholder:text-subtle focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15"
              />
              {formState.errors.email?.message &&
                formState.touchedFields.email && (
                  <p className="text-red-700 font-bold">
                    {formState.errors.email?.message}
                  </p>
                )}
            </div>

            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-[13px] font-semibold text-ink-soft">
                Gender
              </legend>
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer">
                  <input
                    {...register("gender")}
                    type="radio"
                    value="male"
                    className="peer sr-only"
                    defaultChecked
                  />
                  <span className="flex h-11.5 items-center justify-center rounded-xl border-2 border-line bg-white text-[15px] font-medium text-ink-soft transition hover:border-brand-300 peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:font-semibold peer-checked:text-brand-700 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-600/20">
                    Male
                  </span>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input
                    {...register("gender")}
                    type="radio"
                    value="female"
                    className="peer sr-only"
                  />
                  <span className="flex h-11.5 items-center justify-center rounded-xl border-2 border-line bg-white text-[15px] font-medium text-ink-soft transition hover:border-brand-300 peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:font-semibold peer-checked:text-brand-700 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-600/20">
                    Female
                  </span>
                </label>
              </div>
              {formState.errors.gender?.message &&
                formState.touchedFields.gender && (
                  <p className="text-red-700 font-bold">
                    {formState.errors.gender?.message}
                  </p>
                )}
            </fieldset>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-[13px] font-semibold text-ink-soft"
              >
                Password
              </label>
              <PasswordInput
                registration={register("password")}
                id="password"
                autoComplete="new-password"
              />
              {formState.errors.password?.message &&
                formState.touchedFields.password && (
                  <p className="text-red-700 font-bold">
                    {formState.errors.password?.message}
                  </p>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="rePassword"
                className="text-[13px] font-semibold text-ink-soft"
              >
                Confirm password
              </label>
              <PasswordInput
                registration={register("rePassword")}
                id="rePassword"
                autoComplete="new-password"
              />
              {formState.errors.rePassword?.message &&
                formState.touchedFields.rePassword && (
                  <p className="text-red-700 font-bold">
                    {formState.errors.rePassword?.message}
                  </p>
                )}
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="mt-1.5 flex h-13 w-full cursor-pointer items-center justify-center gap-2.5 rounded-[14px] bg-brand-600 text-base font-bold text-white transition duration-300 hover:bg-brand-800 focus:outline-none focus:ring-4 focus:ring-brand-600/30 disabled:cursor-not-allowed disabled:bg-brand-300 disabled:hover:bg-brand-400"
            >
              {isLoading ? (
                <>
                  <ImSpinner8 className="h-4.5 w-4.5 shrink-0 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                "Sign up"
              )}
            </button>

            <p className="text-center text-sm text-muted">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-600 hover:text-brand-800 duration-200"
              >
                Log in
              </Link>
            </p>
          </form>
        </main>
      </div>
    </>
  );
}
