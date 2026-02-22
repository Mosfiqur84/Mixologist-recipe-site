import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Box, TextField, Button, Typography, Paper, Alert, Stack, CircularProgress } from "@mui/material";

// Define a clear interface for your Recipe data
interface Recipe {
  id: string;
  title: string;
  ingredients: string;
  instructions: string;
  image_url: string;
  category: string;
}

function EditRecipe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [formData, setFormData] = useState<Omit<Recipe, 'id'>>({
    title: "",
    ingredients: "",
    instructions: "",
    image_url: "",
    category: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const isRemixing = location.pathname.includes("remix");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        // 1. Logic for Remixing from TheCocktailDB
        if (isRemixing && !id?.startsWith("user_") && !id?.startsWith("remix_")) {
          const res = await axios.get(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`, {
    withCredentials: false 
  });
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
            });
          }
        } 
        // 2. Logic for Editing existing local recipe
        else {
          // Better practice: Fetch specific ID if your API supports it
          // const res = await axios.get(`/api/recipes/${id}`);
          const res = await axios.get(`/api/recipes`);
          const recipe = res.data.recipes.find((r: any) => r.id === id);
          
          if (recipe && isMounted) {
            setFormData({
              title: recipe.title,
              ingredients: recipe.ingredients || "",
              instructions: recipe.instructions || "",
              image_url: recipe.image_url || "",
              category: recipe.category || "",
            });
          }
        }
      } catch (err) {
        setErrorMsg("Failed to load recipe details.");
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
      const finalId = isRemixing ? `remix_${Date.now()}` : id;
      
      await axios.post("/api/recipes", {
        id: finalId,
        ...formData,
        image_url: formData.image_url // mapping state name to DB field name
      });
      
      navigate("/cabinet");
    } catch (err) {
      setErrorMsg("Could not save recipe. Please try again.");
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