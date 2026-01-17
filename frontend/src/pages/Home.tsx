import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { logout } = useAuth();
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the home page!</p>
      <Button onClick={logout}>Logout</Button>
    </div>
  )
}