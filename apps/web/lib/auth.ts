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

export const refreshToken = async (oldRefreshToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: oldRefreshToken }),
    });

    if (!response.ok) {
      throw new Error(
        "Failed to refresh token" + response.statusText
      );
    }
    const { accessToken, refreshToken } = await response.json();

    console.log("Refresh Token --->", refreshToken);


    // await updateTokens({
    //   accessToken,
    //   refreshToken
    // });

    const updateRes = await fetch("http://localhost:3000/api/auth/update", {
      method: "POST",
      body: JSON.stringify({
        accessToken,
        refreshToken,
      }),
    });

    if (!updateRes.ok) throw new Error("Failed to update tokens")

    return accessToken;

  } catch (err) {
    console.error("Refresh Token failed:", err);
    return null;
  }
}