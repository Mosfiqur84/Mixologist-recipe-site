import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";   
import "./RecipeTable.css";
import { Button, Typography, Box, Alert } from "@mui/material";

interface RecipeDB {
  id: string;
  title: string;
  instructions: string;
  ingredients: string;
  image_url: string;
  category: string;
  created_by: string;
}

function RecipeTable({ currentUser }: { currentUser: string | null }) {
  const [recipes, setRecipes] = useState<RecipeDB[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get<{ recipes: RecipeDB[] }>("/api/recipes");
      setRecipes(response.data.recipes);
    } catch (error) {
      setErrorMessage("Failed to fetch recipes.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this recipe?")) return;
    try {
      await axios.delete(`/api/recipes/${id}`);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      alert("Failed to delete recipe.");
    }
  };

  return (
    <div className="table-container">
      <Typography variant="h4" sx={{ my: 3, fontWeight: 'bold' }}>My Cabinet</Typography>
      
      {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

      <table className="recipe-table">
        <thead>
          <tr>
            <th>Drink</th>
            <th>Category</th>
            <th>Ingredients</th>
            <th>Actions</th> 
          </tr>
        </thead>
        <tbody>
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <tr key={recipe.id}>
                <td>
                  <Box className="recipe-title-cell">
                    <img src={recipe.image_url} alt={recipe.title} className="recipe-image" />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{recipe.title}</Typography>
                  </Box>
                </td>
                <td>{recipe.category}</td>
                <td>{recipe.ingredients}</td>
                <td>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {currentUser ? (
                      <>
                        {/* If signed in, "Remix" acts as the Edit/Copy function */}
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={() => navigate(`/edit/${recipe.id}`)}
                          sx={{ bgcolor: '#3182ce' }}
                        >
                          REMIX
                        </Button>
                        
                        {/* Only show delete if they own it */}
                        {(currentUser === recipe.created_by || recipe.created_by === null) && (
                          <Button 
                            variant="contained" 
                            size="small" 
                            color="error" 
                            onClick={() => handleDelete(recipe.id)}
                          >
                            DELETE
                          </Button>
                        )}
                      </>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        Login to Remix
                      </Typography>
                    )}
                  </Box>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                Your cabinet is empty. Find some drinks in Discover!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RecipeTable;