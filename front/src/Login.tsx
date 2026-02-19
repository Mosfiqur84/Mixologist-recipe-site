import { useState } from "react";
import axios from "axios";
import { TextField, Button, Typography, Paper, Alert, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }: { onLogin: (user: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  let [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 let validate = (): string | null => {
    if (username.trim().length < 3) return "Username must be at least 3 characters.";
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return "Username can only contain letters, numbers, and underscores.";
    if (password.length < 3) return "Password must be at least 3 characters.";
    return null;
  };

  let handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (isRegister) {
      let validationError = validate();
      if (validationError) {
        setMsg({ type: "error", text: validationError });
        return;
      }
    }

    setLoading(true);
    let endpoint = isRegister ? "/api/register" : "/api/login";

    try {
      let res = await axios.post(endpoint, { username, password });

      if (isRegister) {
        setMsg({ type: "success", text: "Account created! You can now log in." });
        setIsRegister(false);
        setPassword("");
      } else {
        onLogin(res.data.username);
        navigate("/");
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err.response?.data?.error || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  let switchMode = () => {
    setIsRegister((prev) => !prev);
    setMsg({ type: "", text: "" });
    setPassword("");
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 8 }}>
      <Typography variant="h5">{isRegister ? "Create Account" : "Login"}</Typography>
      {msg.text && <Alert severity={msg.type as any} sx={{ my: 2 }}>{msg.text}</Alert>}
    <Stack component="form" onSubmit={handleSubmit} spacing={2}>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          helperText={isRegister ? "Letters, numbers, and underscores only." : undefined}
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={isRegister ? "new-password" : "current-password"}
          helperText={isRegister ? "Minimum 3 characters." : undefined}
        />

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Please wait…" : isRegister ? "Sign Up" : "Login"}
        </Button>

        <Button onClick={switchMode} size="small">
          {isRegister ? "Already have an account? Log in" : "Need an account? Register"}
        </Button>
      </Stack>
    </Paper>
  );
}
export default Login;