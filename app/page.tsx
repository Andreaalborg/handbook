import { redirect } from "next/navigation";

// Roten sender videre til dashbordet. Uinnloggede blir fanget av proxy.ts
// og sendt til /login.
export default function Home() {
  redirect("/dashboard");
}
