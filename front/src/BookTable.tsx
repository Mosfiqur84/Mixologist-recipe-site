import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";   
import "./BookTable.css";
import { Button, Typography } from "@mui/material";

interface BookDB {
  id: string;
  author_id: string;
  title: string;
  pub_year: string;
  genre?: string;
  created_by: string;
}

function BookTable({ currentUser }: { currentUser: string | null }) {
  const [books, setBooks] = useState<BookDB[]>([]);
  const [yearFilter, setYearFilter] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get<{ books: BookDB[] }>("/api/books");
      setBooks(response.data.books);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to fetch books.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      await axios.delete(`/api/books/${id}`);
      
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete book.");
    }
  };

  const filteredBooks = books.filter((book) => {
    if (!yearFilter) return true;
    return parseInt(book.pub_year) >= parseInt(yearFilter);
  });

  return (
    <div className="table-container">
      <h3>Book Collection</h3>
      
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="search-container">
        <label htmlFor="yearSearch">Filter by year (published on or after): </label>
        <input
          id="yearSearch"
          type="number"
          placeholder="e.g. 1990"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author ID</th>
            <th>Year</th>
            <th>Genre</th>
            <th>Actions</th> 
          </tr>
        </thead>
        <tbody>
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <tr key={book.id}>
                <td className="book-title">{book.title}</td>
                <td>{book.author_id}</td>
                <td>{book.pub_year}</td>
                <td>{book.genre || "N/A"}</td>
                <td style={{ display: "flex", gap: "10px" }}>
  {/* Only show buttons if the user is the owner */}
  {currentUser === book.created_by ? (
    <>
      <Link to={`/edit/${book.id}`}>
        <Button variant="contained" size="small">Edit</Button>
      </Link>
      <Button variant="contained" size="small" color="error" onClick={() => handleDelete(book.id)}>
        Delete
      </Button>
    </>
  ) : (
    <Typography variant="caption" color="textSecondary">Read Only</Typography>
  )}
</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>No books match your search.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default BookTable;