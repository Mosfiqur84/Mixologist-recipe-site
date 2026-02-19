import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

function Navbar({ user, onLogout }: { user: string | null; onLogout: () => void }) {
  let navigate = useNavigate();

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <Box sx={{ flexGrow: 1, mb: 4 }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: "#fff",
            borderBottom: "1px solid #e8e8e8",
            color: "#1a1a1a",
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <Typography
              component={RouterLink}
              to="/"
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#1a1a1a",
                textDecoration: "none",
                flexGrow: 1,
                letterSpacing: -0.5,
              }}
            >
              Mixologist
            </Typography>

            <Button
              component={RouterLink}
              to="/drinks"
              sx={{ color: "#444", fontWeight: 500, fontSize: "0.85rem", letterSpacing: 0.3 }}
            >
              Discover
            </Button>

            {user ? (
              <>
                <Button
                  component={RouterLink}
                  to="/cabinet"
                  sx={{ color: "#444", fontWeight: 500, fontSize: "0.85rem", letterSpacing: 0.3 }}
                >
                  My Cabinet
                </Button>
                <Button
                  component={RouterLink}
                  to="/add"
                  sx={{ color: "#444", fontWeight: 500, fontSize: "0.85rem", letterSpacing: 0.3 }}
                >
                  New Recipe
                </Button>
                <Box
                  sx={{
                    ml: 1,
                    pl: 2,
                    borderLeft: "1px solid #e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{ fontSize: "0.82rem", color: "#888", fontStyle: "italic" }}
                  >
                    {user}
                  </Typography>
                  <Button
                    onClick={onLogout}
                    sx={{
                      color: "#aaa",
                      fontWeight: 500,
                      fontSize: "0.82rem",
                      "&:hover": { color: "#e53935" },
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </>
            ) : (
              <Button
                onClick={() => navigate("/login")}
                sx={{
                  bgcolor: "#1a1a2e",
                  color: "#D4AF37",
                  borderRadius: 0,
                  px: 3,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  letterSpacing: 0.5,
                  "&:hover": { bgcolor: "#2d1b00" },
                }}
              >
                Sign In
              </Button>
            )}
          </Toolbar>
        </AppBar>
      </Box>
    </>
  );
}

export default Navbar;