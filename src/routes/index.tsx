import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "lucide-react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const { user, isAuthenticated, isPending } = useAuth()

  if (isPending) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <div>Redirecting to login</div>
  }

  return <div className="container">
    <Home />
  </div>
}

function Loading() {
  return <div>Loading...</div>
}


function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-4">
      <Card>
        <CardHeader>
          <CardTitle>Credit Card Expense Tracker</CardTitle>
          <CardDescription>Track All Credit Card Expenses</CardDescription>
        </CardHeader>
        <CardFooter>
          <Link to="/expense-tracker">
            <Button>Open</Button>
          </Link>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    </div>
  );
}
