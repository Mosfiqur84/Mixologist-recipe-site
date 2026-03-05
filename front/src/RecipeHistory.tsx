import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Box, Typography, Paper, CircularProgress, Button, Stack, Container 
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
  parentId?: string;
  image_url?: string;
}

function RecipeHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [historyChain, setHistoryChain] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("/api/recipes");
        const allRecipes = res.data.recipes;
        
        let chain: Recipe[] = [];
        let current = allRecipes.find((r: any) => r.id === id);

        // Climb the tree using parentId
        while (current) {
          chain.unshift(current);
          current = allRecipes.find((r: any) => r.id === current.parentId);
        }

        setHistoryChain(chain);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress sx={{ color: "#D4AF37" }} />
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate("/cabinet")}
        sx={{ mb: 3, color: "#1a1a2e" }}
      >
        Back to Cabinet
      </Button>

      <Paper elevation={4} sx={{ p: 4, borderRadius: 2, bgcolor: "#fff" }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 4 }}>
          <HistoryIcon sx={{ fontSize: 40, color: "#D4AF37" }} />
          <Typography variant="h4" fontWeight={800} sx={{ color: "#1a1a2e" }}>
            Recipe Evolution
          </Typography>
        </Stack>
        
        <Timeline position="alternate">
          {historyChain.map((step, index) => {
            const isLast = index === historyChain.length - 1;
            return (
              <TimelineItem key={step.id}>
                <TimelineOppositeContent sx={{ m: 'auto 0' }} variant="body2" color="text.secondary">
                  {index === 0 ? "Original Creation" : `Remix v${index}`}
                </TimelineOppositeContent>
                
                <TimelineSeparator>
                  <TimelineConnector sx={{ bgcolor: index > 0 ? "#D4AF37" : "inherit" }} />
                  <TimelineDot 
                    sx={{ 
                      bgcolor: isLast ? "#D4AF37" : "#1a1a2e",
                      border: '2px solid #D4AF37',
                      boxShadow: isLast ? '0 0 10px #D4AF37' : 'none'
                    }} 
                  />
                  <TimelineConnector sx={{ bgcolor: !isLast ? "#D4AF37" : "transparent" }} />
                </TimelineSeparator>

                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <Paper 
                    elevation={isLast ? 6 : 1}
                    onClick={() => navigate(`/edit/${step.id}`)}
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer', 
                      transition: '0.2s',
                      border: isLast ? '2px solid #D4AF37' : '1px solid #eee',
                      '&:hover': { transform: 'scale(1.03)', bgcolor: '#fafafa' } 
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {step.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {step.id.split('_')[0]}...
                    </Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      </Paper>
    </Container>
  );
}

export default RecipeHistory;