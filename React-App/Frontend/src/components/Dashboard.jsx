
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.email}</p>
      <p>Your role: <strong>{role}</strong></p>

      {role === "admin" && (
        <button onClick={() => navigate("/admin")}>
          Go to Admin Panel
        </button>
      )}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}