import { useState } from "react";
import { useSelector } from "react-redux";
import { ThemeProvider as MuiThemeProvider, Box, useTheme, IconButton, AppBar, Toolbar, useMediaQuery, Typography } from "@mui/material";

import { MenuUser } from "./components/menuUser/MenuUser";
import { MenuSuperior } from "./components/menuSuperior/MenuSuperior";

export const Navbar = ({ children }) => {
  const theme = useTheme();

  return (
    <>
      {/* Menu lateral */}
      <MuiThemeProvider theme={theme}>
        <Box sx={{
          display: "flex",
          backgroundColor: '#0f172a',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        }}>
          <AppBar position="fixed" sx={{
            zIndex: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            height: '70px',
            backdropFilter: 'blur(10px)',
            backgroundImage: 'linear-gradient(rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))'
          }}>
            <Toolbar sx={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 24px'
            }}>
              <Typography >
                PROYECTO RESONANCIA
              </Typography>

              <Box display={'flex'} >
                <MenuSuperior />
                {/* <CajaStatus contador={null} /> */}
                <MenuUser />
              </Box>
            </Toolbar>
          </AppBar>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexGrow: 1,
            overflow: 'auto',
            position: 'relative',
          }}>
            <Box mt={10} sx={{
              borderRadius: 3,
              p: { xs: 2, sm: 2, md: 4, lg: 3 },
            }}>
              {children}
            </Box>
          </Box>
        </Box>
      </MuiThemeProvider >
    </>
  );
};