import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Box, TextField, Button, Typography, Paper, Alert, Stack, CircularProgress } from "@mui/material";

interface Recipe {
  id: string;
  title: string;
  ingredients: string;
  instructions: string;
  image_url: string;
  category: string;
  parent_id?: string | null;
}

function EditRecipe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState<Omit<Recipe, 'id'>>({
    title: "",
    ingredients: "",
    instructions: "",
    image_url: "",
    category: "",
    parent_id: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const isRemixing = location.pathname.includes("remix");

  useEffect(() => {
  let isMounted = true;
  setLoading(true);

  const fetchData = async () => {
    try {
      // Case 1: External API (Initial ID is numeric, like "11007")
      if (isRemixing && !id?.startsWith("user_") && !id?.startsWith("remix_")) {
        const res = await axios.get(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`, { withCredentials: false });
        const drink = res.data.drinks?.[0];

        if (drink && isMounted) {
          const ings = Array.from({ length: 15 })
            .map((_, i) => {
              const ing = drink[`strIngredient${i + 1}`];
              const meas = drink[`strMeasure${i + 1}`];
              return ing ? `${meas ?? ""} ${ing}`.trim() : null;
            })
            .filter(Boolean)
            .join(", ");

          setFormData({
            title: drink.strDrink,
            category: drink.strCategory || "",
            instructions: drink.strInstructions || "",
            image_url: drink.strDrinkThumb || "",
            ingredients: ings,
            parent_id: id, // The external ID is the root parent
          });
        }
      } 
      else {
        const res = await axios.get(`/api/recipes`);
        const recipe = res.data.recipes.find((r: any) => r.id === id);

        if (recipe && isMounted) {
          setFormData({
            title: recipe.title,
            ingredients: recipe.ingredients || "",
            instructions: recipe.instructions || "",
            image_url: recipe.image_url || "",
            category: recipe.category || "",
            parent_id: isRemixing ? recipe.id : (recipe.parent_id || ""),
          });
        }
      }
    } catch (err) {
      setErrorMsg("Failed to load details.");
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchData();
  return () => { isMounted = false; };
}, [id, isRemixing]);

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        if (isRemixing) {
          let finalId = `remix_${Date.now()}`;
          await axios.post("/api/recipes", {
            id: finalId,
            ...formData,
            parent_id: id,
          }, { withCredentials: true });
        } else {
          await axios.put(`/api/recipes/${id}`, formData, { withCredentials: true });
        }
        navigate("/cabinet");
      } catch (err) {
        setErrorMsg("Failed to save. Please try again.");
        console.error(err);
      }
  };

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ pt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom fontWeight={700}>
          {isRemixing ? "Remix Recipe" : "Edit Recipe"}
        </Typography>

        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

        <Box component="form" onSubmit={handleSave}>
          <Stack spacing={3}>
            <TextField
              label="Recipe Name"
              value={formData.title}
              onChange={handleChange('title')}
              required
              fullWidth
            />

            <TextField
              label="Category"
              value={formData.category}
              onChange={handleChange('category')}
              fullWidth
            />

            <TextField
              label="Ingredients"
              value={formData.ingredients}
              onChange={handleChange('ingredients')}
              multiline
              rows={3}
              fullWidth
              placeholder="e.g. 2oz Gin, 1oz Lemon Juice..."
            />

            <TextField
              label="Instructions"
              value={formData.instructions}
              onChange={handleChange('instructions')}
              multiline
              rows={4}
              fullWidth
            />

            <TextField
              label="Image URL"
              value={formData.image_url}
              onChange={handleChange('image_url')}
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                sx={{ bgcolor: "#1a1a2e", color: "#D4AF37", px: 4, '&:hover': { bgcolor: '#252545' } }}
              >
                {isRemixing ? "Save as New Recipe" : "Save Changes"}
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate("/cabinet")}
                sx={{ color: "#666", borderColor: "#ccc" }}
              >
                Cancel
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default EditRecipe;