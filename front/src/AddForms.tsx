import { useState } from "react";
import axios from "axios";
import { 
  Box, TextField, Button, Typography, Paper, Alert, Stack 
} from "@mui/material";

function AddForms() {
  const [authorId, setAuthorId] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorBio, setAuthorBio] = useState("");
  
  const [bookId, setBookId] = useState("");
  const [bookAuthorId, setBookAuthorId] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookYear, setBookYear] = useState("");
  const [bookGenre, setBookGenre] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleError = (err: any) => {
    console.error(err);
    if (err.response?.data?.errors) {
      setErrorMsg("Validation Error: " + err.response.data.errors.join(", "));
    } else if (err.response?.data?.error) {
      setErrorMsg("Error: " + err.response.data.error);
    } else {
      setErrorMsg("An unexpected error occurred.");
    }
  };

  const handleAddAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await axios.post("/api/authors", { id: authorId, name: authorName, bio: authorBio });
      setSuccessMsg("Author added successfully!");
      setAuthorId(""); setAuthorName(""); setAuthorBio(""); 
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await axios.post("/api/books", { 
        id: bookId, author_id: bookAuthorId, title: bookTitle, pub_year: bookYear, genre: bookGenre 
      });
      setSuccessMsg("Book added successfully!");
      setBookId(""); setBookTitle(""); setBookYear(""); setBookGenre(""); 
    } catch (err: any) {
      handleError(err);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      {successMsg && <Alert severity="success">{successMsg}</Alert>}

      {/* AUTHOR FORM */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Add New Author</Typography>
        <Box component="form" onSubmit={handleAddAuthor} sx={{ mt: 2 }}>
          {/* Stack creates vertical spacing between rows */}
          <Stack spacing={2}>
            
            {/* Row 1: ID and Name side-by-side */}
            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <TextField 
                label="Author ID" 
                value={authorId} 
                onChange={e => setAuthorId(e.target.value)} 
                required 
                sx={{ flex: 1 }} 
              />
              <TextField 
                label="Name" 
                value={authorName} 
                onChange={e => setAuthorName(e.target.value)} 
                required 
                sx={{ flex: 2 }} 
              />
            </Box>

            {/* Row 2: Bio */}
            <TextField 
              fullWidth 
              multiline 
              rows={2} 
              label="Bio" 
              value={authorBio} 
              onChange={e => setAuthorBio(e.target.value)} 
            />

            <Button type="submit" variant="contained" color="primary" sx={{ alignSelf: "start" }}>
              Add Author
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* BOOK FORM */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Add New Book</Typography>
        <Box component="form" onSubmit={handleAddBook} sx={{ mt: 2 }}>
          <Stack spacing={2}>
            
            {/* Row 1: Book ID and Author ID */}
            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <TextField 
                label="Book ID" 
                value={bookId} 
                onChange={e => setBookId(e.target.value)} 
                required 
                sx={{ flex: 1 }} 
              />
              <TextField 
                label="Author ID (Foreign Key)" 
                value={bookAuthorId} 
                onChange={e => setBookAuthorId(e.target.value)} 
                required 
                sx={{ flex: 1 }} 
              />
            </Box>

            {/* Row 2: Title */}
            <TextField 
              fullWidth 
              label="Title" 
              value={bookTitle} 
              onChange={e => setBookTitle(e.target.value)} 
              required 
            />

            {/* Row 3: Year and Genre */}
            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <TextField 
                label="Year (YYYY)" 
                value={bookYear} 
                onChange={e => setBookYear(e.target.value)} 
                required 
                sx={{ flex: 1 }} 
              />
              <TextField 
                label="Genre" 
                value={bookGenre} 
                onChange={e => setBookGenre(e.target.value)} 
                sx={{ flex: 1 }} 
              />
            </Box>

            <Button type="submit" variant="contained" color="secondary" sx={{ alignSelf: "start" }}>
              Add Book
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default AddForms;