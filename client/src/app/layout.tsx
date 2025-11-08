import type { Metadata } from "next";
import "./globals.css";
import { ruda, saira } from "./fonts";
import Image from "next/image";
import { auth0 } from "@/lib/auth0";
import Profile from "./(navbar)/Profile";

export const metadata: Metadata = {
  title: "SolidStore - Home",
  description: "SolidStore - Cloud Storage",
};

async function ProfilePicture() {
  const session = await auth0.getSession();

  return (
    <Image
      src={session?.user.picture || ""}
      width={36}
      height={36}
      alt="profile photo"
      className="rounded-full"
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" id="htmlElement">
      <body className={`${saira.className} dark:bg-gray-800`}>
        <nav className="flex justify-between py-1 px-4 sm:px-6 md:px-12 items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/company-logo.svg"
              width={24}
              height={24}
              alt="profile photo"
            />
            <span className={`${ruda.className} dark:text-white`}>
              SolidStore
            </span>
          </div>
          <Profile>
            <ProfilePicture />
          </Profile>
        </nav>
        <hr className="border-green-950 dark:border-green-400" />
        <main id="root" className="h-svh">
          {children}
        </main>
      </body>
    </html>
  );
}
