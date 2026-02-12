import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
// Using Stack and Box avoids the Grid version issues completely
import { Box, TextField, Button, Typography, Paper, Alert, Stack } from "@mui/material";

function EditBook() {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  
  const [authorId, setAuthorId] = useState("");
  const [title, setTitle] = useState("");
  const [pubYear, setPubYear] = useState("");
  const [genre, setGenre] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Fetch the existing book data to pre-fill the form
    axios.get(`/api/books/${id}`)
      .then((res) => {
        const book = res.data;
        setAuthorId(book.author_id);
        setTitle(book.title);
        setPubYear(book.pub_year);
        setGenre(book.genre || "");
      })
      .catch(() => {
        setErrorMsg("Could not load book data.");
      });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    try {
      // Send the update to the backend
      await axios.put(`/api/books/${id}`, {
        id, 
        author_id: authorId,
        title,
        pub_year: pubYear,
        genre
      });
      // Redirect back to home on success
      navigate("/");
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrorMsg("Validation Failed: " + err.response.data.errors.join(", "));
      } else {
        setErrorMsg(err.response?.data?.error || "Failed to update book");
      }
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h5" gutterBottom>
          Edit Book: {title}
        </Typography>
        
        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

        <Box component="form" onSubmit={handleSave}>
          <Stack spacing={3}>
            {/* Title - Full Width */}
            <TextField 
              label="Title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
              fullWidth 
            />

            {/* Author ID - Full Width */}
            <TextField 
              label="Author ID" 
              value={authorId} 
              onChange={e => setAuthorId(e.target.value)} 
              required 
              fullWidth 
              helperText="Must match an existing Author ID"
            />

            {/* Row for Year and Genre */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Publication Year" 
                value={pubYear} 
                onChange={e => setPubYear(e.target.value)} 
                required 
                sx={{ flex: 1 }}
              />
              <TextField 
                label="Genre" 
                value={genre} 
                onChange={e => setGenre(e.target.value)} 
                sx={{ flex: 1 }}
              />
            </Box>
            
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
              <Button type="submit" variant="contained" color="primary" size="large">
                Save Changes
              </Button>
              <Button variant="outlined" color="inherit" size="large" onClick={() => navigate("/")}>
                Cancel
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default EditBook;