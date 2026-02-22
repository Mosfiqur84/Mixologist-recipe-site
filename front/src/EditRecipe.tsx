import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, TextField, Button, Typography, Paper, Alert, Stack } from "@mui/material";

function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Fetch the existing recipe data to pre-fill the form
    axios.get(`/api/recipes`).then((res) => {
      const recipe = res.data.recipes.find((r: any) => r.id === id);
      if (recipe) {
        setTitle(recipe.title);
        setIngredients(recipe.ingredients || "");
        setInstructions(recipe.instructions || "");
        setImageUrl(recipe.image_url || "");
        setCategory(recipe.category || "");
      }
    }).catch(() => setErrorMsg("Could not load recipe data."));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // For now, this overwrites the existing recipe
      await axios.post("/api/recipes", {
        id, title, ingredients, instructions, image_url: imageUrl, category,
      });
      navigate("/cabinet");
    } catch (err) {
      setErrorMsg("Failed to save changes.");
    }
  };

  return (
    <Box sx={{ pt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight={700}>
          Edit Recipe
        </Typography>

        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

        <Box component="form" onSubmit={handleSave}>
          <Stack spacing={3}>
            <TextField
              label="Recipe Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Category (e.g. Cocktail, Shot)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              fullWidth
            />

            <TextField
              label="Ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />

            <TextField
              label="Instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              multiline
              rows={4}
              fullWidth
            />

            <TextField
              label="Image URL (optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                sx={{ bgcolor: "#1a1a2e", color: "#D4AF37", px: 4 }}
              >
                Save Changes
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