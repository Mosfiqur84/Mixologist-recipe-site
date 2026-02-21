import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box, Typography, Button, Chip, Divider, IconButton, Skeleton,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface Drink {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strCategory: string;
  strAlcoholic: string;
  strGlass: string;
  strInstructions: string;
  [key: string]: any;
}

function RecipeDetail({ user }: { user: string | null }) {
  let { id } = useParams<{ id: string }>();
  let navigate = useNavigate();
  let [drink, setDrink] = useState<Drink | null>(null);
  let [loading, setLoading] = useState(true);
  let [favorited, setFavorited] = useState(false);

  useEffect(() => {
    let fetchDrink = async () => {
      try {
        let res = await axios.get(
          `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`,
          { withCredentials: false }
        );
        setDrink(res.data.drinks?.[0] || null);
      } catch (err) {
        console.error("Failed to fetch drink", err);
      } finally {
        setLoading(false);
      }
    };

    let checkFavorited = async () => {
      try {
        let res = await axios.get(`/api/favorites/${id}`, { withCredentials: true });
        setFavorited(res.data.favorited);
      } catch (err) {
        // not logged in, just leave as false
      }
    };

    fetchDrink();
    checkFavorited();
  }, [id]);

  let ingredients = drink
    ? Array.from({ length: 15 })
        .map((_, i) => ({
          ingredient: drink[`strIngredient${i + 1}`],
          measure: drink[`strMeasure${i + 1}`],
        }))
        .filter((x) => x.ingredient)
    : [];

  let handleFavorite = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      if (favorited) {
        await axios.delete(`/api/favorites/${id}`, { withCredentials: true });
        setFavorited(false);
      } else {
        await axios.post(`/api/favorites/${id}`, {
          title: drink?.strDrink,
          instructions: drink?.strInstructions,
          ingredients: ingredients.map(i => `${i.measure || ""} ${i.ingredient}`).join(", "),
          image_url: drink?.strDrinkThumb,
          category: drink?.strCategory,
        }, { withCredentials: true });
        setFavorited(true);
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  let handleRemix = () => {
    if (!user) { navigate("/login"); return; }
    navigate(`/remix/${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ pt: 4 }}>
        <Skeleton variant="rectangular" height={400} />
        <Skeleton variant="text" sx={{ mt: 2, fontSize: "2rem" }} />
        <Skeleton variant="text" width="40%" />
      </Box>
    );
  }

  if (!drink) {
    return <Typography sx={{ pt: 4 }}>Drink not found.</Typography>;
  }

  return (
    <Box sx={{ fontFamily: "'DM Sans', sans-serif", pt: 2, pb: 8 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ color: "#666", mb: 3, pl: 0, "&:hover": { color: "#1a1a1a", bgcolor: "transparent" } }}
      >
        Back
      </Button>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "420px 1fr" },
          gap: { xs: 4, md: 6 },
          mb: 6,
        }}
      >
        <Box
          sx={{
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -8,
              right: -8,
              width: "100%",
              height: "100%",
              border: "2px solid #D4AF37",
              zIndex: -1,
            },
          }}
        >
          <Box
            component="img"
            src={drink.strDrinkThumb}
            alt={drink.strDrink}
            sx={{ width: "100%", display: "block", aspectRatio: "1", objectFit: "cover" }}
          />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
            <Chip
              label={drink.strCategory}
              size="small"
              sx={{ borderRadius: 0, bgcolor: "#f5f0e8", color: "#8B6914", fontWeight: 600, fontSize: "0.75rem" }}
            />
            <Chip
              label={drink.strAlcoholic}
              size="small"
              sx={{ borderRadius: 0, bgcolor: "#f0f0f0", color: "#555", fontSize: "0.75rem" }}
            />
            <Chip
              label={drink.strGlass}
              size="small"
              sx={{ borderRadius: 0, bgcolor: "#f0f0f0", color: "#555", fontSize: "0.75rem" }}
            />
          </Box>

          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: { xs: "2rem", md: "2.8rem" },
              fontWeight: 700,
              lineHeight: 1.1,
              mb: 3,
              color: "#1a1a1a",
            }}
          >
            {drink.strDrink}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
            <IconButton onClick={handleFavorite} sx={{ p: 0.5 }}>
              {favorited ? (
                <FavoriteIcon sx={{ color: "#e53935", fontSize: 24 }} />
              ) : (
                <FavoriteBorderIcon sx={{ color: "#aaa", fontSize: 24 }} />
              )}
            </IconButton>
            <Typography sx={{ color: "#888", fontSize: "0.9rem" }}>
              {favorited ? "Saved to favorites" : "Save to favorites"}
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Button
            variant="contained"
            onClick={handleRemix}
            sx={{
              bgcolor: "#1a1a2e",
              color: "#D4AF37",
              borderRadius: 0,
              px: 4,
              py: 1.5,
              fontWeight: 700,
              letterSpacing: 1,
              fontSize: "0.85rem",
              alignSelf: "flex-start",
              "&:hover": { bgcolor: "#2d1b00" },
            }}
          >
            Remix Recipe
          </Button>

          {!user && (
            <Typography sx={{ mt: 1.5, color: "#aaa", fontSize: "0.8rem" }}>
              Sign in to remix or save recipes
            </Typography>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
          gap: 4,
          border: "1px solid #e8e8e8",
          p: { xs: 3, md: 5 },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.25rem",
              fontWeight: 700,
              mb: 3,
              pb: 1.5,
              borderBottom: "2px solid #D4AF37",
              display: "inline-block",
            }}
          >
            Ingredients
          </Typography>
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
            {ingredients.map((item, i) => (
              <Box
                key={i}
                component="li"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1.25,
                  borderBottom: "1px solid #f0f0f0",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Typography sx={{ fontWeight: 500, fontSize: "0.95rem", color: "#1a1a1a" }}>
                  {item.ingredient}
                </Typography>
                <Typography sx={{ color: "#888", fontSize: "0.88rem", ml: 2, textAlign: "right" }}>
                  {item.measure?.trim() || "to taste"}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.25rem",
              fontWeight: 700,
              mb: 3,
              pb: 1.5,
              borderBottom: "2px solid #D4AF37",
              display: "inline-block",
            }}
          >
            Instructions
          </Typography>
          <Typography
            sx={{
              lineHeight: 1.9,
              color: "#444",
              fontSize: "0.98rem",
            }}
          >
            {drink.strInstructions}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default RecipeDetail;