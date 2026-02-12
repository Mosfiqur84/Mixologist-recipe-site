import { useState } from "react";
import axios from "axios";
import { TextField, Button, Card, CardMedia, CardContent, Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions, 
  List, ListItem, ListItemText, Divider } from "@mui/material";

interface Drink {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strCategory: string;
  strInstructions?: string; 
  [key: string]: any; 
}

function DrinkSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [drinks, setDrinks] = useState<Drink[]>([]);
  // NEW: State for Modal control
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [open, setOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) return;
    try {
      const response = await axios.get(
        `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`,
        { withCredentials: false } 
      );
      setDrinks(response.data.drinks || []);
    } catch (error) {
      console.error("Error fetching drinks:", error);
    }
  };

  const handleViewRecipe = async (id: string) => {
    try {
      const response = await axios.get(
        `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`,
        { withCredentials: false }
      );
      setSelectedDrink(response.data.drinks[0]);
      setOpen(true);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Find New Recipes</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField 
          label="Search for a recipe..." 
          variant="outlined" 
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button variant="contained" onClick={handleSearch}>Search</Button>
      </Box>

      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 3 
        }}
      >
        {drinks.map((drink) => (
          <Card key={drink.idDrink} sx={{ display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="200"
              image={drink.strDrinkThumb}
              alt={drink.strDrink}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6">{drink.strDrink}</Typography>
              <Typography variant="body2" color="textSecondary">
                {drink.strCategory}
              </Typography>
            </CardContent>
            <Box sx={{ p: 2, pt: 0 }}>
              <Button 
                size="small" 
                variant="outlined" 
                fullWidth 
                onClick={() => handleViewRecipe(drink.idDrink)}
              >
                View Recipe
              </Button>
            </Box>
          </Card>
        ))}
      </Box>

      {/* --- RECIPE MODAL --- */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
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
              <Button onClick={() => setOpen(false)}>Close</Button>
              {/* Future Remix/Save hook */}
              <Button variant="contained">Save to My Cabinet</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default DrinkSearch;