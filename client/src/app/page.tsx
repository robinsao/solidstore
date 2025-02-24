import { getSession } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();
  if (
    session &&
    session.accessTokenExpiresAt &&
    Date.now() / 1000 - session.accessTokenExpiresAt < 0
  )
    redirect("/app");

  return (
    <div className="h-full flex justify-center items-center">
      <p className="text-2xl">
        Click{" "}
        <a
          data-test="login-link"
          href={"/api/auth/login"}
          className="underline"
        >
          here
        </a>{" "}
        to log in
      </p>
    </div>
  );
}
