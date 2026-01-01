import { authClient } from "@/lib/authClient";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const { data } = authClient.useSession();

  return <div>{data?.user.name}</div>;
}
