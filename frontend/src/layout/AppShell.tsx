import {
  Badge,
  AppBar,
  Box,
  Breadcrumbs,
  CircularProgress,
  ClickAwayListener,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  Link,
  Menu,
  MenuItem,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Tooltip,
  ButtonBase,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getSmartSearch } from "../services/api";
import { SmartSearchResultItem } from "../types";
import { navConfig, NavNode, routeTitleMap } from "./navConfig";

const drawerWidth = 280;

interface Props {
  children: ReactNode;
  mode: "light" | "dark";
  onToggleTheme: () => void;
  userEmail?: string;
  onLogout?: () => void;
}

export function AppShell({ children, mode, onToggleTheme, userEmail, onLogout }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<SmartSearchResultItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchRequested, setSearchRequested] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [accountAnchor, setAccountAnchor] = useState<null | HTMLElement>(null);

  const crumbs = useMemo(() => {
    const path = location.pathname;
    if (path === "/") {
      return [{ label: "Home", path: "/" }];
    }

    const segments = path.split("/").filter(Boolean);
    const built: Array<{ label: string; path: string }> = [];

    segments.reduce((acc, segment) => {
      const current = `${acc}/${segment}`;
      built.push({ label: routeTitleMap[current] ?? segment, path: current });
      return current;
    }, "");

    return [{ label: "Home", path: "/" }, ...built.filter((x) => x.label !== "Home")];
  }, [location.pathname]);

  const renderNode = (node: NavNode, depth = 0) => {
    if (node.divider) {
      return <Divider key={`${node.label}-${depth}`} sx={{ my: 1 }} />;
    }

    const selected = node.path ? location.pathname === node.path : false;

    return (
      <Fragment key={`${node.label}-${depth}`}>
        <ListItemButton
          selected={selected}
          onClick={() => {
            if (node.path) {
              navigate(node.path);
              if (isMobile) {
                setOpen(false);
              }
            }
          }}
          sx={{ pl: 2 + depth * 2 }}
        >
          <ListItemText
            primary={node.label}
            primaryTypographyProps={{ fontWeight: depth === 0 ? 700 : 500, fontSize: 14 }}
          />
        </ListItemButton>
        {node.children?.map((child) => renderNode(child, depth + 1))}
      </Fragment>
    );
  };

  const runSearch = async (rawQuery: string) => {
    const q = rawQuery.trim();
    if (!q) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchRequested(false);
      return;
    }

    setSearchRequested(true);
    setSearchLoading(true);
    try {
      const response = await getSmartSearch(q, 8);
      setSearchResults(response.items);
      setSearchOpen(true);
    } finally {
      setSearchLoading(false);
    }
  };

  const completionPreview = useMemo(() => {
    const q = searchInput.trim();
    if (!q) {
      return "";
    }

    const matched = searchResults.find((x) => x.primaryText.toLowerCase().startsWith(q.toLowerCase()));
    if (!matched) {
      return "";
    }

    return matched.primaryText;
  }, [searchInput, searchResults]);

  const openSearchResults = (rawQuery: string) => {
    const q = rawQuery.trim();
    if (!q) {
      return;
    }

    // Add a monotonic token so same-query submits still trigger a route refresh.
    navigate(`/search?q=${encodeURIComponent(q)}&t=${Date.now()}`);
    setSearchOpen(false);
  };

  useEffect(() => {
    const q = searchInput.trim();
    if (!q) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchRequested(false);
      return;
    }

    const timer = setTimeout(() => {
      void runSearch(q);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const navigateToSearchItem = (item: SmartSearchResultItem) => {
    navigate(item.route);
    setSearchOpen(false);
    if (isMobile) {
      setOpen(false);
    }
  };

  const drawer = (
    <Box>
      <Box px={2} py={2}>
        <Typography variant="h6" color="primary" fontWeight={800}>
          Hutchison Ports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          E-Leave System
        </Typography>
      </Box>
      <Divider />
      <List>{navConfig.map((node) => renderNode(node))}</List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: "1px solid rgba(15, 23, 42, 0.1)",
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {isMobile && (
            <IconButton onClick={() => setOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}

          <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
            <Box sx={{ position: "relative", minWidth: 260, width: { xs: "100%", sm: 360 } }}>
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  openSearchResults(searchInput);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  backgroundColor: "action.hover",
                }}
              >
                <SearchIcon sx={{ mr: 1, fontSize: 18 }} />
                <InputBase
                  placeholder="Smart search (leave, ref, person)"
                  fullWidth
                  value={searchInput}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Tab" && completionPreview && completionPreview.toLowerCase() !== searchInput.trim().toLowerCase()) {
                      e.preventDefault();
                      setSearchInput(completionPreview);
                      return;
                    }

                    if (e.key === "Enter" || e.key === "NumpadEnter") {
                      e.preventDefault();
                      openSearchResults(searchInput);
                    }
                  }}
                />
                {searchLoading && <CircularProgress size={14} />}
                <ButtonBase
                  type="submit"
                  sx={{ ml: 0.5, borderRadius: 1, px: 0.5, py: 0.25 }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Go
                  </Typography>
                </ButtonBase>
              </Box>

              {completionPreview && completionPreview.toLowerCase() !== searchInput.trim().toLowerCase() && (
                <Typography variant="caption" color="text.secondary" sx={{ px: 1.25, pt: 0.25, display: "block" }}>
                  Press Tab to autocomplete: {completionPreview}
                </Typography>
              )}

              {searchOpen && (searchLoading || searchResults.length > 0 || searchRequested) && (
                <Box
                  sx={{
                    position: "absolute",
                    zIndex: 1400,
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    borderRadius: 2,
                    backgroundColor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: 6,
                    maxHeight: 320,
                    overflowY: "auto",
                  }}
                >
                  {!searchLoading && searchRequested && searchResults.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, py: 1 }}>
                      No matching records.
                    </Typography>
                  )}

                  {searchResults.map((item) => (
                    <ListItemButton key={`${item.entityType}-${item.entityId}`} onClick={() => navigateToSearchItem(item)}>
                      <ListItemText
                        primary={item.primaryText}
                        secondary={`${item.entityType} - ${item.secondaryText}`}
                        primaryTypographyProps={{ fontWeight: 600, fontSize: 13 }}
                        secondaryTypographyProps={{ fontSize: 12 }}
                      />
                      {item.badge && (
                        <Badge
                          color="primary"
                          badgeContent={item.badge}
                          sx={{ "& .MuiBadge-badge": { right: -4, top: 8 } }}
                        >
                          <Box sx={{ width: 2, height: 18 }} />
                        </Badge>
                      )}
                    </ListItemButton>
                  ))}
                </Box>
              )}
            </Box>
          </ClickAwayListener>

          <Box sx={{ flexGrow: 1 }} />

          {userEmail && (
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", md: "block" } }}>
              {userEmail}
            </Typography>
          )}

          <Tooltip title="Toggle theme">
            <IconButton onClick={onToggleTheme}>{mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}</IconButton>
          </Tooltip>
          <IconButton onClick={(e) => setNotificationAnchor(e.currentTarget)}>
            <NotificationsNoneIcon />
          </IconButton>
          <IconButton onClick={(e) => setAccountAnchor(e.currentTarget)}>
            <AccountCircleIcon />
          </IconButton>
          {onLogout && (
            <Tooltip title="Logout">
              <IconButton onClick={onLogout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>

        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={() => setNotificationAnchor(null)}
        >
          <MenuItem disabled>No notifications</MenuItem>
        </Menu>

        <Menu
          anchorEl={accountAnchor}
          open={Boolean(accountAnchor)}
          onClose={() => setAccountAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              setAccountAnchor(null);
              navigate("/my-preferences");
            }}
          >
            My Preferences
          </MenuItem>
          <MenuItem
            disabled={!onLogout}
            onClick={() => {
              setAccountAnchor(null);
              onLogout?.();
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", md: "none" } }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid rgba(15, 23, 42, 0.1)",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, px: { xs: 2, md: 3 }, pt: 11, pb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;
            return isLast ? (
              <Typography key={crumb.path} color="text.primary" fontWeight={700}>
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={crumb.path}
                underline="hover"
                color="inherit"
                component="button"
                onClick={() => navigate(crumb.path)}
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>

        {children}
      </Box>
    </Box>
  );
}
