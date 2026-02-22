import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box, Typography, Card, CardMedia, CardContent, Tabs, Tab, Button,
  DialogContent,
  DialogActions,
  Dialog,
  DialogTitle,
  Stack,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddIcon from "@mui/icons-material/Add";

interface Recipe {
  id: string;
  title: string;
  image_url?: string;
  genre?: string;
  category?: string;
  created_by?: string;
  instructions?: string;
  ingredients?: string;
  saved_at?: string;
}

function MyCabinet({ user }: { user: string | null }) {
  let navigate = useNavigate();
  let [tab, setTab] = useState(0);
  let [ownRecipes, setOwnRecipes] = useState<Recipe[]>([]);

  let [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  let [openFav, setOpenFav] = useState(false);
  let [selectedFav, setSelectedFav] = useState<Recipe | null>(null);
  let [remixedRecipes, setRemixedRecipes] = useState<Recipe[]>([]);


  useEffect(() => {
    if (!user) return;

    //user's recipes
    axios.get("/api/recipes").then((res) => {
      let all: Recipe[] = res.data.recipes || [];
      setOwnRecipes(all.filter((r) => r.created_by === user && !r.id.startsWith("remix_")));
      setRemixedRecipes(all.filter((r) => r.created_by === user && r.id.startsWith("remix_")));
    });

    // favorites (cabinet)
    axios.get("/api/cabinet").then((res) => {
      setFavoriteRecipes(res.data.recipes || []);
    });
  }, [user]);

  const handleOpenFav = (r: Recipe) => {
    setSelectedFav(r);
    setOpenFav(true);
  };

  const handleCloseFav = () => {
    setOpenFav(false);
    setSelectedFav(null);
  };

  if (!user) {
    return (
      <Box sx={{ textAlign: "center", pt: 10 }}>
        <Typography
          sx={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", mb: 2, color: "#1a1a1a" }}
        >
          Your Cabinet
        </Typography>
        <Typography sx={{ color: "#888", mb: 4 }}>
          Sign in to save favorites and manage your recipes.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{ bgcolor: "#1a1a2e", color: "#D4AF37", borderRadius: 0, px: 4, py: 1.5, fontWeight: 700 }}
        >
          Sign In
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ fontFamily: "'DM Sans', sans-serif", pt: 2, pb: 8 }}>
      <Box sx={{ mb: 5 }}>
        <Typography
          sx={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2.2rem",
            fontWeight: 700,
            color: "#1a1a1a",
          }}
        >
          My Cabinet
        </Typography>
        <Typography sx={{ color: "#888", mt: 0.5 }}>
          Welcome back, {user}
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 4,
          borderBottom: "2px solid #e8e8e8",
          "& .MuiTab-root": {
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: "0.9rem",
            letterSpacing: 0.5,
            color: "#888",
            textTransform: "uppercase",
            minWidth: 120,
          },
          "& .Mui-selected": { color: "#1a1a1a !important" },
          "& .MuiTabs-indicator": { bgcolor: "#D4AF37", height: 2 },
        }}
      >
        <Tab label="Favorites" />
        <Tab label="My Recipes" />
        <Tab label="Remixed" />
      </Tabs>
      {tab === 0 && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <FavoriteIcon sx={{ color: "#D4AF37", fontSize: 20 }} />
            <Typography sx={{ fontWeight: 600, color: "#444", fontSize: "0.9rem" }}>
              Your saved cocktails
            </Typography>
          </Box>

          {favoriteRecipes.length === 0 ? (
            <Box
              sx={{
                border: "2px dashed #e8e8e8",
                borderRadius: 0,
                p: 6,
                textAlign: "center",
              }}
            >
              <Typography sx={{ color: "#bbb", mb: 2 }}>No favorites yet</Typography>
              <Button
                onClick={() => navigate("/drinks")}
                sx={{ color: "#D4AF37", fontWeight: 600 }}
              >
                Discover Recipes →
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" },
                gap: 3,
              }}
            >
              {favoriteRecipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  elevation={0}
                  sx={{
                    borderRadius: 0,
                    border: "1px solid #e8e8e8",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  {recipe.image_url ? (
                    <CardMedia component="img" height="180" image={recipe.image_url} alt={recipe.title} />
                  ) : (
                    <Box
                      sx={{
                        height: 180,
                        bgcolor: "#f5f0e8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography sx={{ color: "#D4AF37", fontFamily: "'Playfair Display', serif", fontSize: "2rem" }}>
                        🍸
                      </Typography>
                    </Box>
                  )}

                  <CardContent sx={{ p: 2 }}>
                    <Typography sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "1rem" }}>
                      {recipe.title}
                    </Typography>

                    {(recipe.category || recipe.genre) && (
                      <Typography variant="body2" sx={{ color: "#888", fontSize: "0.8rem" }}>
                        {recipe.category || recipe.genre}
                      </Typography>
                    )}

                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 1.5, borderRadius: 0, borderColor: "#e8e8e8", color: "#1a1a1a" }}
                      onClick={() => handleOpenFav(recipe)}
                    >
                      View
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

        </Box>
      )}
      {/* My Recipes Tab */}
{tab === 1 && (
  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" }, gap: 3 }}>
    {ownRecipes.map((recipe) => (
      <Card key={recipe.id} elevation={0} sx={{ borderRadius: 0, border: "1px solid #e8e8e8" }}>
        <CardMedia component="img" height="180" image={recipe.image_url || "https://via.placeholder.com/180"} />
        <CardContent sx={{ p: 2 }}>
  <Typography sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "1rem" }}>
    {recipe.title}
  </Typography>
  <Typography variant="body2" sx={{ color: "#888", fontSize: "0.8rem", mb: 2 }}>
    {recipe.category || "Custom Recipe"}
  </Typography>

  <Stack spacing={1}>
    {/* This button opens the modal using the local recipe data */}
    <Button 
      variant="outlined" 
      fullWidth 
      size="small" 
      sx={{ borderRadius: 0, borderColor: "#e8e8e8", color: "#1a1a1a" }}
      onClick={(e) => {
        e.stopPropagation(); // Prevents navigating to edit if the card has a click listener
        handleOpenFav(recipe); 
      }}
    >
      View
    </Button>
    
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button variant="outlined" fullWidth size="small" onClick={() => navigate(`/edit/${recipe.id}`)}>
        Edit
      </Button>
      <Button variant="outlined" fullWidth size="small" onClick={() => navigate(`/remix/${recipe.id}`)}>
        Remix
      </Button>
    </Box>
  </Stack>
</CardContent>
      </Card>
    ))}
  </Box>
)}
      {/* Remixed Tab */}
{tab === 2 && (
  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" }, gap: 3 }}>
    {remixedRecipes.map((recipe) => (
      <Card key={recipe.id} elevation={0} sx={{ borderRadius: 0, border: "1px solid #e8e8e8" }}>
        <CardMedia component="img" height="180" image={recipe.image_url || "https://via.placeholder.com/180"} />
        <CardContent sx={{ p: 2 }}>
          <Typography sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "1rem" }}>
            {recipe.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "#D4AF37", fontSize: "0.8rem", fontWeight: 600, mb: 2 }}>
            Remixed by: {recipe.created_by}
          </Typography>

          <Stack spacing={1}>
            <Button 
              variant="outlined" fullWidth size="small" 
              sx={{ borderRadius: 0, borderColor: "#e8e8e8", color: "#1a1a1a" }}
              onClick={() => handleOpenFav(recipe)} // Uses the Favorites-style modal
            >
              View
            </Button>
            <Button 
              variant="outlined" fullWidth size="small" sx={{ borderRadius: 0 }}
              onClick={() => navigate(`/remix/${recipe.id}`)}
            >
              Remix
            </Button>
          </Stack>
        </CardContent>
      </Card>
    ))}
  </Box>
)}


{/* Favorites modal */}
          <Dialog open={openFav} onClose={handleCloseFav} maxWidth="sm" fullWidth>
            {selectedFav && (
              <>
                <DialogTitle sx={{ fontWeight: "bold" }}>{selectedFav.title}</DialogTitle>
                <DialogContent dividers>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Ingredients
                    </Typography>

                    {(selectedFav.ingredients || "").trim() ? (
                      <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        {selectedFav.ingredients!
                          .split(",")
                          .map((x) => x.trim())
                          .filter(Boolean)
                          .map((ing, i) => (
                            <li key={i}>
                              <Typography variant="body2">{ing}</Typography>
                            </li>
                          ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: "#888" }}>
                        No ingredients listed.
                      </Typography>
                    )}
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Instructions
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#444" }}>
                    {selectedFav.instructions || "No instructions provided."}
                  </Typography>
                </DialogContent>

                <DialogActions>
                  <Button onClick={handleCloseFav}>Close</Button>
                </DialogActions>
              </>
            )}
          </Dialog>
    </Box>
  );
}

export default MyCabinet;