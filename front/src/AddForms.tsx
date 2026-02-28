import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box, TextField, Button, Typography, Paper, Alert, Stack, Select, MenuItem, FormControl, InputLabel, IconButton, Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

interface Ingredient {
  id: number;
  value: string;
}

interface Step {
  id: number;
  value: string;
}

function AddForms({ user }: { user: string | null }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ id: 1, value: "" }]);
  const [instructions, setInstructions] = useState<Step[]>([{ id: 1, value: "" }]);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [category, setCategory] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [nextIngredientId, setNextIngredientId] = useState(2);
  const [nextStepId, setNextStepId] = useState(2);

  const categories = ["Cocktail", "Shot", "Mocktail", "Long Drink", "Punch", "Other"];

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      
      // Compress image by creating a canvas version
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        
        // Scale down to max 800px while maintaining aspect ratio
        const maxSize = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG with compression
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
        setImageUrl(compressedBase64);
        setImagePreview(compressedBase64);
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    if (url.trim()) {
      setImagePreview(url);
    } else {
      setImagePreview("");
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { id: nextIngredientId, value: "" }]);
    setNextIngredientId(nextIngredientId + 1);
  };

  const removeIngredient = (id: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(ing => ing.id !== id));
    }
  };

  const updateIngredient = (id: number, value: string) => {
    setIngredients(ingredients.map(ing => ing.id === id ? { ...ing, value } : ing));
  };

  const addStep = () => {
    setInstructions([...instructions, { id: nextStepId, value: "" }]);
    setNextStepId(nextStepId + 1);
  };

  const removeStep = (id: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter(step => step.id !== id));
    }
  };

  const updateStep = (id: number, value: string) => {
    setInstructions(instructions.map(step => step.id === id ? { ...step, value } : step));
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setErrorMsg("Recipe name is required.");
      return false;
    }
    if (!category.trim()) {
      setErrorMsg("Category is required.");
      return false;
    }
    const filledIngredients = ingredients.filter(ing => ing.value.trim());
    if (filledIngredients.length === 0) {
      setErrorMsg("Add at least one ingredient.");
      return false;
    }
    const filledSteps = instructions.filter(step => step.value.trim());
    if (filledSteps.length === 0) {
      setErrorMsg("Add at least one instruction step.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validateForm()) return;

    try {
      const ingredientsList = ingredients
        .filter(ing => ing.value.trim())
        .map(ing => ing.value.trim())
        .join(", ");
      
      const instructionsList = instructions
        .filter(step => step.value.trim())
        .map((step, idx) => `${idx + 1}. ${step.value.trim()}`)
        .join("\n");

      const id = `user_${Date.now()}`;
      await axios.post("/api/recipes", {
        id,
        title: title.trim(),
        ingredients: ingredientsList,
        instructions: instructionsList,
        image_url: imageUrl.trim() || null,
        category: category.trim(),
      }, { withCredentials: true });
      
      setSuccessMsg("Recipe created successfully! Go to your cabinet to see it.");
      setTitle("");
      setIngredients([{ id: 1, value: "" }]);
      setInstructions([{ id: 1, value: "" }]);
      setImageUrl("");
      setImagePreview("");
      setCategory("");
      setNextIngredientId(2);
      setNextStepId(2);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMsg(""), 5000);
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
    <Box sx={{ pt: 4, pb: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 } }}>
        <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, mb: 1 }}>
          Create Your Own Recipe
        </Typography>
        <Typography sx={{ color: "#888", mb: 3 }}>Share your unique drink creation with the community</Typography>

        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
        {successMsg && (
          <Alert 
            severity="success" 
            sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}
            action={
              <Button 
                size="small" 
                onClick={() => navigate("/cabinet")}
                sx={{ color: "#1a1a2e", fontWeight: 600 }}
              >
                VIEW
              </Button>
            }
          >
            {successMsg}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={4}>
            {/* RECIPE NAME & CATEGORY */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 3 }}>
              <TextField
                label="Recipe Name"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Midnight Margarita"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  label="Category"
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* IMAGE UPLOAD */}
            <Box>
              <Typography sx={{ fontWeight: 600, mb: 1.5 }}>Recipe Image (Optional)</Typography>
              <Stack spacing={2}>
                <Box
                  sx={{
                    border: "2px dashed #D4AF37",
                    borderRadius: 1,
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    backgroundColor: "#fafaf8",
                    "&:hover": {
                      backgroundColor: "#f5f0e8",
                    }
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFile(file);
                    }}
                    style={{ display: "none" }}
                  />
                  <Typography sx={{ fontWeight: 500, color: "#1a1a1a" }}>
                    Click to upload or drag and drop
                  </Typography>
                  <Typography sx={{ color: "#888", fontSize: "0.85rem", mt: 0.5 }}>
                    PNG, JPG, GIF up to 5MB
                  </Typography>
                </Box>

                <Typography sx={{ textAlign: "center", color: "#aaa" }}>OR</Typography>

                <TextField
                  label="Paste image URL"
                  value={imageUrl.startsWith("data:") ? "" : imageUrl}
                  onChange={e => handleImageUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  fullWidth
                  size="small"
                />
              </Stack>

              {imagePreview && (
                <Box sx={{ 
                  mt: 2, 
                  position: "relative",
                  width: "100%", 
                  maxWidth: "300px",
                  aspectRatio: "1",
                  overflow: "hidden",
                  borderRadius: 1,
                  border: "1px solid #ddd"
                }}>
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={() => setImagePreview("")}
                  />
                </Box>
              )}
            </Box>

            <Divider />

            {/* INGREDIENTS */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "1.1rem" }}>Ingredients</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addIngredient}
                  size="small"
                  sx={{ color: "#D4AF37", fontWeight: 600 }}
                >
                  Add
                </Button>
              </Box>
              <Stack spacing={2}>
                {ingredients.map((ing) => (
                  <Box key={ing.id} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                    <TextField
                      placeholder={`e.g. 2oz Vodka`}
                      value={ing.value}
                      onChange={e => updateIngredient(ing.id, e.target.value)}
                      fullWidth
                      size="small"
                      multiline
                      maxRows={2}
                    />
                    {ingredients.length > 1 && (
                      <IconButton
                        onClick={() => removeIngredient(ing.id)}
                        size="small"
                        sx={{ color: "#999", mt: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>

            <Divider />

            {/* INSTRUCTIONS */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "1.1rem" }}>Instructions</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addStep}
                  size="small"
                  sx={{ color: "#D4AF37", fontWeight: 600 }}
                >
                  Add Step
                </Button>
              </Box>
              <Stack spacing={2}>
                {instructions.map((step, idx) => (
                  <Box key={step.id} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                    <Typography sx={{ pt: 1.5, fontWeight: 600, minWidth: "24px", color: "#888" }}>
                      {idx + 1}.
                    </Typography>
                    <TextField
                      placeholder={`Step ${idx + 1}`}
                      value={step.value}
                      onChange={e => updateStep(step.id, e.target.value)}
                      fullWidth
                      size="small"
                      multiline
                      maxRows={3}
                    />
                    {instructions.length > 1 && (
                      <IconButton
                        onClick={() => removeStep(step.id)}
                        size="small"
                        sx={{ color: "#999", mt: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* SUBMIT BUTTON */}
            <Box sx={{ pt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: "#1a1a2e",
                  color: "#D4AF37",
                  borderRadius: 0,
                  px: 5,
                  py: 1.5,
                  fontWeight: 700,
                  letterSpacing: 1,
                  fontSize: "0.9rem",
                  "&:hover": { bgcolor: "#2d1b00" }
                }}
              >
                Create Recipe
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default AddForms;