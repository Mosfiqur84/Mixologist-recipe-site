import { useState } from "react";
import axios from "axios";
import { 
  TextField, Button, Card, CardMedia, CardContent, Typography, Box, Dialog, 
  DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, 
  Divider, ToggleButton, ToggleButtonGroup 
} from "@mui/material";


interface Drink {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strCategory: string;
  strInstructions?: string; 
  [key: string]: any; 
}

interface RecipeDB {
  id: string;
  title: string;
  instructions?: string;
  ingredients?: string;
  image_url?: string;
  category?: string;
  created_by?: string;
}

type SearchItem = ({ source: "api" } & Drink) | ({ source: "db" } & RecipeDB);

function DrinkSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [open, setOpen] = useState(false);
  
  // 's' for name (search), 'i' for ingredient (filter)
  const [searchType, setSearchType] = useState<"s" | "i">("s");

  const [dbRecipes, setDbRecipes] = useState<RecipeDB[]>([]);
  const [selectedDbRecipe, setSelectedDbRecipe] = useState<RecipeDB | null>(null);

  const handleSearch = async () => {
    if (!searchTerm) return;

    try {
      // API uses 'search.php' for names and 'filter.php' for ingredients
      const endpoint = searchType === "s" ? "search.php?s=" : "filter.php?i=";

      const apiResponse = await axios.get(`https://www.thecocktaildb.com/api/json/v1/1/${endpoint}${searchTerm}`,{ withCredentials: false });
      const dbResponse = await axios.get<{ recipes: RecipeDB[] }>(`/api/recipes/search?q=${encodeURIComponent(searchTerm)}&type=${searchType}`);

      // const response = await axios.get(
      //   `https://www.thecocktaildb.com/api/json/v1/1/${endpoint}${searchTerm}`,
      //   { withCredentials: false }
      // );
      setDrinks(apiResponse.data.drinks || []);
      setDbRecipes(dbResponse.data.recipes || []);
    } catch (error) {
      console.error("Search failed", error);
    }
  };

  const handleTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: "s" | "i"
  ) => {
    if (newType !== null) {
      setSearchType(newType);
      setDrinks([]); // Clear results when switching modes
      setDbRecipes([]);
    }
  };

  const handleViewRecipe = async (id: string) => {
    try {
      const response = await axios.get(
        `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`,
        { withCredentials: false }
      );
      setSelectedDbRecipe(null);
      setSelectedDrink(response.data.drinks[0]);
      setOpen(true);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
    }
  };

  const handleViewDbRecipe = (recipe: RecipeDB) => {
    setSelectedDbRecipe(recipe);
    setSelectedDrink(null);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!selectedDrink) return;

    // Transform API ingredients into a single readable string for your database
    const ingredientsString = Array.from({ length: 15 })
      .map((_, i) => {
        const ing = selectedDrink[`strIngredient${i + 1}`];
        const meas = selectedDrink[`strMeasure${i + 1}`];
        return ing ? `${meas ? meas : ""} ${ing}`.trim() : null;
      })
      .filter(Boolean)
      .join(", ");

    try {
      await axios.post("/api/recipes", {
        id: selectedDrink.idDrink,
        title: selectedDrink.strDrink,
        instructions: selectedDrink.strInstructions,
        ingredients: ingredientsString,
        image_url: selectedDrink.strDrinkThumb,
        category: selectedDrink.strCategory,
      });
      alert("Saved to Cabinet!"); // This will now work for everyone
      handleCloseDialog();
    } catch (err: any) {
      alert("Could not save recipe.");
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedDrink(null);
    setSelectedDbRecipe(null);
  };

  const combinedResults: SearchItem[] = [
    ...dbRecipes.map((r) => ({ source: "db" as const, ...r })),
    ...drinks.map((d) => ({ source: "api" as const, ...d })),
  ].sort((a, b) => {
    const nameA = a.source === "db" ? a.title : a.strDrink;
    const nameB = b.source === "db" ? b.title : b.strDrink;
    return nameA.localeCompare(nameB);
  });


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Discover Cocktails</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        <ToggleButtonGroup
          value={searchType}
          exclusive
          onChange={handleTypeChange}
          aria-label="search type"
          color="primary"
        >
          <ToggleButton value="s">Search by Name</ToggleButton>
          <ToggleButton value="i">Search by Ingredient</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField 
            label={searchType === "s" ? "Enter drink name (e.g., Margarita)" : "Enter ingredient (e.g., Gin)"} 
            variant="outlined" 
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="contained" onClick={handleSearch} size="large">Search</Button>
        </Box>
      </Box>

      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 3 
        }}
      >
        {combinedResults.map((item) => {
          const key = item.source === "db" ? `db-${item.id}` : item.idDrink;
          const title = item.source === "db" ? item.title : item.strDrink;
          const category = item.source === "db" ? item.category : item.strCategory;
          const image = item.source === "db" ? (item.image_url || "https://via.placeholder.com/400x200?text=Recipe") : item.strDrinkThumb;
          return (
            <Card key={key} sx={{ display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="200"
              image={image}
              alt={title}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6">{title}</Typography>
              <Typography variant="body2" color="textSecondary">
                {category ? category : ""}
                {item.source === "db" ? " (Saved)" : ""}
              </Typography>
            </CardContent>
            <Box sx={{ p: 2, pt: 0 }}>
              <Button 
                size="small" 
                variant="outlined" 
                fullWidth 
                onClick={() => {
                  if (item.source === "db") {
                    handleViewDbRecipe(item);
                  } else {
                    handleViewRecipe(item.idDrink);
                  }
                }}
              >
                View Recipe
              </Button>
            </Box>
          </Card>
          );
        })}
      </Box>

      {/* --- RECIPE MODAL --- */}
      <Dialog 
      open={open} 
      onClose={handleCloseDialog} 
      maxWidth="sm" 
      fullWidth
      >
        {selectedDrink && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold' }}>{selectedDrink.strDrink}</DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Ingredients</Typography>
                <List dense>
                  {/* The API returns ingredients in keys strIngredient1 to strIngredient15 */}
                  {Array.from({ length: 15 }).map((_, i) => {
                    const ingredient = selectedDrink[`strIngredient${i + 1}`];
                    const measure = selectedDrink[`strMeasure${i + 1}`];
                    return ingredient ? (
                      <ListItem key={i} sx={{ py: 0 }}>
                        <ListItemText primary={`${measure ? measure : ""} ${ingredient}`} />
                      </ListItem>
                    ) : null;
                  })}
                </List>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Instructions</Typography>
              <Typography variant="body1">{selectedDrink.strInstructions}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              {/* Link the button to the handleSave function */}
              <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSave}
              >
                Save to My Cabinet
              </Button>
            </DialogActions>
          </>
        )}

        {selectedDbRecipe && (
          <>
            <DialogTitle sx={{ fontWeight: "bold" }}>{selectedDbRecipe.title}</DialogTitle>

            <DialogContent dividers>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  Ingredients
                </Typography>

                <List dense>
                  {(selectedDbRecipe.ingredients || "")
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean)
                    .map((ing, i) => (
                      <ListItem key={i} sx={{ py: 0 }}>
                        <ListItemText primary={ing} />
                      </ListItem>
                    ))}
                </List>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Instructions
              </Typography>

              <Typography variant="body1">
                {selectedDbRecipe.instructions || "No instructions provided."}
              </Typography>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default DrinkSearch;