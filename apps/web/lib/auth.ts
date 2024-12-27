"use server";

import { redirect } from "next/navigation";
import { BACKEND_URL } from "./constants";
import { createSession } from "./session";
import {
  FormState,
  LoginFormSchema,
  SignupFormSchema
} from "./type";

export async function signUp(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validationFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  console.log("validationFields", validationFields);


  if (!validationFields.success) {
    return {
      error: validationFields.error.flatten().fieldErrors,
    };
  }

  const response = await fetch(
    `${BACKEND_URL}/auth/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validationFields?.data),
    }
  );

  console.log("Response ---> ", response);

  if (response.ok) {
    redirect("/auth/signin");
  } else
    return {
      message:
        response.status === 409
          ? "The user is already existed!"
          : response.statusText,
    };
}

export async function signIn(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validationFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!validationFields.success)
    return {
      error: validationFields.error.flatten().fieldErrors,
    };

  try {
    const response = await fetch(`${BACKEND_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(validationFields?.data)
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Authentication result:", result);
      // TODO: Create The Session For Authenticated User.
      await createSession({
        user: {
          id: result.id,
          name: result.name
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      });
      // redirect("/auth/signup");
      return { success: true };
    } else {
      const errorText = await response.text(); // Log response text for error
      console.error("Non-OK Response:", response.status, errorText);
      return {
        message: response.status === 401 ? "Invalid Credentials!" : response.statusText,
      }
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return {
      message: "An error occurred while signing in.",
    };
  }

}