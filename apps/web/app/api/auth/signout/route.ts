import { deleteSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  await deleteSession();

  revalidatePath("/");
  return NextResponse.redirect(new URL("/", req.url))
};

// import { deleteSession } from "@/lib/session";
// import { revalidatePath } from "next/cache";
// import { NextRequest, NextResponse } from "next/server";

// const redirectToHome = (req: NextRequest) => {
//   return NextResponse.redirect(new URL("/", req.url));
// };

// const handleSignOut = async (req: NextRequest) => {
//   await deleteSession();
//   revalidatePath("/");
//   return redirectToHome(req);
// };

// export async function GET(req: NextRequest) {
//   return handleSignOut(req);
// };