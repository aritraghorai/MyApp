import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { authClient } from "@/lib/authClient";

export default function Header() {
  return (
    <>
      <header className="header bg-red-50 h-10 flex items-center px-4 shadow-md">
        <div>
          <h2>AI Chat App</h2>
        </div>
        <div className="ml-auto">
          <Link to="/" className="px-2">
            <Button
              onClick={() => {
                authClient.signIn.oauth2({
                  providerId: "authelia",
                });
              }}
            >
              login
            </Button>
          </Link>
        </div>
      </header>
    </>
  );
}
