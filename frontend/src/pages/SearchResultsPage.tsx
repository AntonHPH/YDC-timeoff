import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import { getSmartSearch } from "../services/api";
import { SmartSearchResultItem } from "../types";

function useQueryParam(name: string): string {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search).get(name)?.trim() ?? "", [location.search, name]);
}

export function SearchResultsPage() {
  const navigate = useNavigate();
  const query = useQueryParam("q");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<SmartSearchResultItem[]>([]);

  useEffect(() => {
    if (!query) {
      setItems([]);
      setError("");
      setLoading(false);
      return;
    }

    let disposed = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getSmartSearch(query, 50);
        if (!disposed) {
          setItems(response.items);
        }
      } catch {
        if (!disposed) {
          setError("Unable to load search results.");
          setItems([]);
        }
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      disposed = true;
    };
  }, [query]);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" fontWeight={800}>
          Search Results
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {query ? `Query: ${query}` : "Enter a keyword in the top search bar."}
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardContent>
          {loading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Searching...
              </Typography>
            </Stack>
          ) : items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No matching records.
            </Typography>
          ) : (
            <List disablePadding>
              {items.map((item) => (
                <ListItemButton key={`${item.entityType}-${item.entityId}`} onClick={() => navigate(item.route)}>
                  <ListItemText
                    primary={item.primaryText}
                    secondary={`${item.entityType} - ${item.secondaryText}`}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                  {item.badge && <Chip size="small" label={item.badge} color="primary" variant="outlined" />}
                </ListItemButton>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}

