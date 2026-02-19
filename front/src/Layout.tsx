import { Outlet } from "react-router-dom";
import { Container, CssBaseline } from "@mui/material";
import Navbar from "./Navbar";

function Layout({ user, onLogout }: { user: string | null; onLogout: () => void }) {
  return (
    <>
      <CssBaseline />
      <Navbar user={user} onLogout={onLogout} />
      <Container maxWidth="md">
        <Outlet />
      </Container>
    </>
  );
}

export default Layout;