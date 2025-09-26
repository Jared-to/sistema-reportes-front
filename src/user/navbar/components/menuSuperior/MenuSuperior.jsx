import { Box, ButtonBase, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";

export const MenuSuperior = () => {
  return (
    <Box sx={{ ml: 8, display: 'flex', gap: 2 }}>
      <NavItem to="/" label="Inicio" />
      {/* <NavItem to="equipos" label="Equipos" /> */}
    </Box>
  );
};

const NavItem = ({ to, label, end = false }) => (
  <NavLink
    to={`/user/${to}`}
    style={{ textDecoration: "none" }}
    end={end}
  >
    {({ isActive }) => (
      <ButtonBase
        sx={{
          borderRadius: 2,
          padding: "8px 16px",
          transition: "all 0.3s ease",
          backgroundColor: isActive ? "rgba(124, 77, 255, 0.2)" : "transparent",
          border: isActive ? "1px solid rgba(124, 77, 255, 0.5)" : "1px solid transparent",
          '&:hover': {
            backgroundColor: "rgba(124, 77, 255, 0.1)",
            border: "1px solid rgba(124, 77, 255, 0.3)",
          },
        }}
      >
        <Typography
          sx={{
            color: isActive ? "#9e7bff" : "#cbd5e1",
            fontWeight: isActive ? "600" : "400",
            fontFamily: 'Nunito, sans-serif',
            position: "relative",
            transition: "all 0.3s",
            fontSize: "1rem",
            '&::after': {
              content: '""',
              position: "absolute",
              bottom: -4,
              left: 0,
              height: "2px",
              width: isActive ? "100%" : "0",
              backgroundColor: "#9e7bff",
              transition: "width 0.3s ease-in-out",
            },
            '&:hover::after': {
              width: "100%",
            },
            '&:hover': {
              color: "#e2e8f0",
            },
          }}
        >
          {label}
        </Typography>
      </ButtonBase>
    )}
  </NavLink>
);