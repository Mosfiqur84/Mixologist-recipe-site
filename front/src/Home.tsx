import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Button, Card, CardMedia, CardContent, IconButton, Skeleton } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNavigate } from "react-router-dom";

interface Drink {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strCategory: string;
}

let POPULAR_SEARCHES = ["Margarita", "Mojito", "Martini", "Old Fashioned", "Daiquiri", "Negroni"];

function Home({ user }: { user: string | null }) {
  let [popularDrinks, setPopularDrinks] = useState<Drink[]>([]);
  let [loading, setLoading] = useState(true);
  let [favorites, setFavorites] = useState<Set<string>>(new Set());
  let navigate = useNavigate();

  useEffect(() => {
    let fetchPopular = async () => {
      try {
        let results = await Promise.all(
          POPULAR_SEARCHES.map((term) =>
            axios.get(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${term}`, {
              withCredentials: false,
            })
          )
        );
        let drinks = results
          .map((r) => r.data.drinks?.[0])
          .filter(Boolean) as Drink[];
        setPopularDrinks(drinks);
      } catch (err) {
        console.error("Failed to fetch popular drinks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  let toggleFavorite = (id: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setFavorites((prev) => {
      let next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <Box sx={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Box
        sx={{
          position: "relative",
          mx: { xs: -2, sm: -3, md: -4 },
          mb: 8,
          height: { xs: 320, md: 440 },
          background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b00 50%, #1a1a2e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 60% 50%, rgba(212,175,55,0.18) 0%, transparent 70%)",
          },
        }}
      >
        <Box sx={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.15)" }} />
        <Box sx={{ position: "absolute", bottom: -80, left: -40, width: 240, height: 240, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.10)" }} />

        <Box sx={{ textAlign: "center", zIndex: 1, px: 3 }}>
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: { xs: "2.4rem", md: "3.8rem" },
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.1,
              mb: 1,
            }}
          >
            Craft Your Perfect
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: { xs: "2.4rem", md: "3.8rem" },
              fontWeight: 700,
              color: "#D4AF37",
              lineHeight: 1.1,
              mb: 3,
            }}
          >
            Cocktail
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.65)", mb: 4, fontSize: "1.05rem", maxWidth: 420, mx: "auto" }}>
            Discover thousands of recipes, remix classics, and share your creations.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              onClick={() => navigate("/drinks")}
              sx={{
                bgcolor: "#D4AF37",
                color: "#1a1a2e",
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: 0,
                letterSpacing: 1,
                fontSize: "0.85rem",
                "&:hover": { bgcolor: "#c49b2a" },
              }}
            >
              Discover Recipes
            </Button>
            {!user && (
              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{
                  borderColor: "rgba(255,255,255,0.4)",
                  color: "#fff",
                  px: 4,
                  py: 1.5,
                  borderRadius: 0,
                  letterSpacing: 1,
                  fontSize: "0.85rem",
                  "&:hover": { borderColor: "#D4AF37", color: "#D4AF37" },
                }}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Box>
      </Box>
      <Box sx={{ mb: 2, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <Typography
          sx={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#1a1a1a",
          }}
        >
          Popular Drinks
        </Typography>
        <Button
          onClick={() => navigate("/drinks")}
          sx={{ color: "#D4AF37", fontWeight: 600, fontSize: "0.85rem", letterSpacing: 0.5 }}
        >
          View All →
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" },
          gap: 3,
          mb: 8,
        }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Box key={i}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 0 }} />
                <Skeleton variant="text" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="60%" />
              </Box>
            ))
          : popularDrinks.map((drink) => (
              <Card
                key={drink.idDrink}
                elevation={0}
                sx={{
                  borderRadius: 0,
                  border: "1px solid #e8e8e8",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
                  },
                }}
                onClick={() => navigate(`/recipe/${drink.idDrink}`)}
              >
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={drink.strDrinkThumb}
                    alt={drink.strDrink}
                    sx={{ display: "block" }}
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(drink.idDrink);
                    }}
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      bgcolor: "rgba(255,255,255,0.9)",
                      width: 34,
                      height: 34,
                      "&:hover": { bgcolor: "#fff" },
                    }}
                  >
                    {favorites.has(drink.idDrink) ? (
                      <FavoriteIcon sx={{ fontSize: 18, color: "#e53935" }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ fontSize: 18, color: "#666" }} />
                    )}
                  </IconButton>
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <Typography sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "1rem", mb: 0.25 }}>
                    {drink.strDrink}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#888", fontSize: "0.8rem" }}>
                    {drink.strCategory}
                  </Typography>
                </CardContent>
              </Card>
            ))}
      </Box>
    </Box>
  );
}

export default Home;