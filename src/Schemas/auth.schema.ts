import * as zod from "zod";

export const RegisterSchema = zod
  .object({
    name: zod
      .string()
      .nonempty("Name is Required")
      .min(3, "Min Length 3 Chars")
      .max(10, "Max Length is 10 Chars"),

    email: zod
      .email()
      .nonempty("Email is Required")
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid Email"),
    dateOfBirth: zod
      .string()
      .nonempty("Date of Birth is Required")
      .refine((dateOfBirthValue) => {
        const userDate = new Date(dateOfBirthValue).getFullYear();
        const nowDate = new Date().getFullYear();
        return nowDate - userDate > 10 ? true : false;
      }, "Age Must Be More Than 10 Years"),
    gender: zod.enum(["male", "female"]),
    password: zod
      .string()
      .nonempty("Password is Required")
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "The Password Must Be 8 Char And contain an Uppercase letter + a Lowercase Letter + a Number + a Special Char From The List above",
      ),
    rePassword: zod.string().nonempty("Confirm Password is Required"),
  })
  .refine(
    (obj) => {
      if (obj.password === obj.rePassword) {
        return true;
      } else {
        return false;
      }
    },
    {
      path: ["rePassword"],
      error: "Password and Confirm Password Not Match",
    },
  );

export type RegisterSchemaType = zod.infer<typeof RegisterSchema>;

////////////////////////////////////////////////////////////////////////////////////////

export const LoginSchema = zod.object({
  email: zod
    .email()
    .nonempty("Email is Required")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid Email"),

  password: zod
    .string()
    .nonempty("Password is Required")
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "The Password Must Be 8 Char And contain an Uppercase letter + a Lowercase Letter + a Number + a Special Char From The List above",
    ),
});

export type LoginSchemaType = zod.infer<typeof LoginSchema>;

////////////////////////////////////////////////////////////////////////////////////////

export const ChangePasswordSchema = zod
  .object({
    password: zod.string().nonempty("Current Password is Required"),
    newPassword: zod
      .string()
      .nonempty("New Password is Required")
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "The Password Must Be 8 Char And contain an Uppercase letter + a Lowercase Letter + a Number + a Special Char From The List above",
      ),
    rePassword: zod.string().nonempty("Confirm Password is Required"),
  })
  .refine((obj) => obj.newPassword === obj.rePassword, {
    path: ["rePassword"],
    error: "New Password and Confirm Password Not Match",
  })
  .refine((obj) => obj.newPassword !== obj.password, {
    path: ["newPassword"],
    error: "New Password Must Be Different From The Current One",
  });

export type ChangePasswordSchemaType = zod.infer<typeof ChangePasswordSchema>;
