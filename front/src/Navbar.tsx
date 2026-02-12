import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function Navbar({ user }: { user: string | null }) {
  return (
    <Box sx={{ flexGrow: 1, mb: 4 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mixologist {/* UPDATED TITLE */}
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">
            My Cabinet {/* RENAMED FROM COLLECTION */}
          </Button>
          
          {/* NEW DRINKS TAB */}
          <Button color="inherit" component={RouterLink} to="/drinks">
            Discover
          </Button>
          
          {user ? (
            <>
              <Button color="inherit" component={RouterLink} to="/add">
                New Recipe
              </Button>
              <Typography sx={{ ml: 2, fontStyle: 'italic' }}>
                Welcome, {user}!
              </Typography>
            </>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;