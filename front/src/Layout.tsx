import { Outlet } from "react-router-dom";
import { Container, CssBaseline } from "@mui/material";
import Navbar from "./Navbar";

function Layout({ user }: { user: string | null }) {
  return (
    <>
      <CssBaseline />
      <Navbar user={user} /> 
      <Container maxWidth="md">
        <Outlet />
      </Container>
    </>
  );
}

export default Layout;