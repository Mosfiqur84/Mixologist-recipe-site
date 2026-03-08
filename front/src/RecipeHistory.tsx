import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box, Typography, Paper, CircularProgress, Button, Container
} from "@mui/material";
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector,
  TimelineContent, TimelineDot, TimelineOppositeContent
} from "@mui/lab";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";

interface Recipe {
  id: string;
  title: string;
  image_url?: string;
  category?: string;
  created_by?: string;
  parent_id?: string;
}

function RecipeHistory() {
  let { id } = useParams();
  let navigate = useNavigate();
  let [chain, setChain] = useState<Recipe[]>([]);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState("");

  useEffect(() => {
    let fetchHistory = async () => {
      try {
        let [historyRes, remixRes] = await Promise.all([
          axios.get(`/api/recipes/${id}/history`),
          axios.get(`/api/recipes/${id}/remixes`),
        ]);
        let chain = historyRes.data.chain || [];
        let remixes = remixRes.data.remixes || [];
        setChain([...chain, ...remixes]);
      } catch (err) {
        setError("Could not load recipe history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: "#D4AF37" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, fontFamily: "'DM Sans', sans-serif" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/cabinet")}
        sx={{ mb: 3, color: "#1a1a2e", pl: 0 }}
      >
        Back to Cabinet
      </Button>

      <Paper
        elevation={0}
        sx={{ p: { xs: 3, md: 5 }, border: "1px solid #e8e8e8" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center", mb: 5 }}>
          <HistoryIcon sx={{ fontSize: 36, color: "#D4AF37" }} />
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2rem",
              fontWeight: 700,
              color: "#1a1a2e",
            }}
          >
            Recipe Evolution
          </Typography>
        </Box>

        {chain.length === 0 ? (
          <Typography sx={{ textAlign: "center", color: "#888" }}>
            No history found for this recipe.
          </Typography>
        ) : (
          <Timeline position="alternate">
            {chain.map((recipe, index) => {
              let isFirst = index === 0;
              let isLast = index === chain.length - 1;

              return (
                <TimelineItem key={recipe.id}>
                  <TimelineOppositeContent
                    sx={{ m: "auto 0", color: "#888", fontSize: "0.82rem", fontStyle: "italic" }}
                  >
                    {isFirst ? "Original" : `Remix ${index}`}
                    {recipe.created_by && (
                      <Typography sx={{ fontSize: "0.78rem", color: "#bbb", display: "block" }}>
                        by {recipe.created_by}
                      </Typography>
                    )}
                  </TimelineOppositeContent>

                  <TimelineSeparator>
                    <TimelineConnector
                      sx={{ bgcolor: index > 0 ? "#D4AF37" : "transparent" }}
                    />
                    <TimelineDot
                      sx={{
                        bgcolor: isLast ? "#D4AF37" : "#1a1a2e",
                        border: "2px solid #D4AF37",
                        boxShadow: isLast ? "0 0 12px rgba(212,175,55,0.5)" : "none",
                        width: 14,
                        height: 14,
                      }}
                    />
                    <TimelineConnector
                      sx={{ bgcolor: isLast ? "transparent" : "#D4AF37" }}
                    />
                  </TimelineSeparator>

                  <TimelineContent sx={{ py: "12px", px: 2 }}>
                    <Paper
                      elevation={0}
                      onClick={() => navigate(`/edit/${recipe.id}`)}
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        border: isLast ? "2px solid #D4AF37" : "1px solid #e8e8e8",
                        borderRadius: 0,
                        transition: "all 0.2s",
                        bgcolor: isLast ? "#fffdf5" : "#fff",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                        },
                      }}
                    >
                      {recipe.image_url && (
                        <Box
                          component="img"
                          src={recipe.image_url}
                          alt={recipe.title}
                          sx={{
                            width: "100%",
                            height: 100,
                            objectFit: "cover",
                            display: "block",
                            mb: 1.5,
                          }}
                          onError={(e: any) => { e.target.style.display = "none"; }}
                        />
                      )}
                      <Typography
                        sx={{
                          fontFamily: "'Playfair Display', serif",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: "#1a1a1a",
                        }}
                      >
                        {recipe.title}
                      </Typography>
                      {recipe.category && (
                        <Typography sx={{ fontSize: "0.78rem", color: "#aaa", mt: 0.25 }}>
                          {recipe.category}
                        </Typography>
                      )}
                      {isLast && (
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: "#D4AF37",
                            fontWeight: 600,
                            mt: 1,
                            letterSpacing: 0.5,
                          }}
                        >
                          CURRENT VERSION
                        </Typography>
                      )}
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        )}
      </Paper>
    </Container>
  );
}

export default RecipeHistory;