import { useState } from "react";
import axios from "axios";
import { TextField, Button, Typography, Paper, Alert, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }: { onLogin: (user: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegister ? "/api/register" : "/api/login";
    try {
      const res = await axios.post(endpoint, { username, password });
      if (!isRegister) {
        onLogin(res.data.username); // Store user in App state
        navigate("/");
      } else {
        setMsg({ type: "success", text: "Account created! You can now login." });
        setIsRegister(false);
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err.response?.data?.error || "Auth failed" });
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 8 }}>
      <Typography variant="h5">{isRegister ? "Create Account" : "Login"}</Typography>
      {msg.text && <Alert severity={msg.type as any} sx={{ my: 2 }}>{msg.text}</Alert>}
      <Stack component="form" onSubmit={handleSubmit} spacing={2}>
        <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <Button type="submit" variant="contained">{isRegister ? "Sign Up" : "Login"}</Button>
        <Button onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Already have an account? Login" : "Need an account? Register"}
        </Button>
      </Stack>
    </Paper>
  );
}
export default Login;