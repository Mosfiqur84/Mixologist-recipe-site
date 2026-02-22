import { useState } from "react";
import axios from "axios";
import {
  Box, TextField, Button, Typography, Paper, Alert, Stack
} from "@mui/material";

function AddForms({ user }: { user: string | null }) {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const id = `user_${Date.now()}`;
      await axios.post("/api/recipes", {
        id,
        title,
        ingredients,
        instructions,
        image_url: imageUrl,
        category,
      }, { withCredentials: true });
      setSuccessMsg("Recipe created successfully!");
      setTitle(""); setIngredients(""); setInstructions(""); setImageUrl(""); setCategory("");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Something went wrong.");
    }
  };

  if (!user) {
    return (
      <Box sx={{ pt: 4 }}>
        <Alert severity="warning">You must be logged in to create a recipe.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight={700}>Create Your Own Recipe</Typography>

        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Recipe Name"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Category (e.g. Cocktail, Shot)"
              value={category}
              onChange={e => setCategory(e.target.value)}
              fullWidth
            />
            <TextField
              label="Ingredients (e.g. 2oz Vodka, 1oz Lime Juice)"
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Instructions"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              multiline
              rows={4}
              fullWidth
            />
            <TextField
              label="Image URL (optional)"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              fullWidth
            />
            <Button type="submit" variant="contained" sx={{ bgcolor: "#1a1a2e", color: "#D4AF37", alignSelf: "start", px: 4 }}>
              Create Recipe
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default AddForms;