import { useState } from 'react';
import { Avatar, Box, ButtonBase, Divider, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material'
import { useSelector } from 'react-redux';

import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SettingsSuggestOutlinedIcon from '@mui/icons-material/SettingsSuggestOutlined';

import { useAuthStore } from '../../../../hooks/useAuthStore';

export const MenuUser = () => {
  //?estados
  const [anchorEl, setAnchorEl] = useState(null);
  const { starLogout } = useAuthStore();
  const { user } = useSelector((state) => state.auth);
  //?funciones
  //menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    starLogout();
  };

  //?booleans
  const openMenu = Boolean(anchorEl);
  return (
    <Box>
      <ButtonBase onClick={handleClick} sx={{ borderBottomLeftRadius: '27px', borderBottomRightRadius: '27px', borderTopLeftRadius: '27px', borderTopRightRadius: '27px', }}>
        <Box
          sx={{
            bgcolor: 'white',
            borderBottomLeftRadius: '27px',
            borderBottomRightRadius: '27px',
            borderBottomWidth: '1px',
            borderTopLeftRadius: '27px',
            borderTopRightRadius: '27px',
            p: 1,
            pr: 2,
            pl: 2,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: '#2194f0',
              '& .icon': {
                color: 'white',
              },
            },
          }}
        >
          <Avatar
            src={user.foto}
            sx={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', width: 35, height: 35, }} />
          <SettingsSuggestOutlinedIcon className="icon" sx={{ color: '#2194f0', fontSize: '1.8rem', ml: 1, '&:hover': { color: 'white' } }} />
        </Box>
      </ButtonBase>
      {/* User menu */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 1,
            marginTop: 1,
            minWidth: '12%',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            padding: 0,
          },
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <Typography
            sx={{
              textAlign: 'center',
              fontFamily: 'Nunito, sans-serif',
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {getGreeting()} {user.name}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Box mt={2}>
            {/* Logout */}
            <MenuItem
              onClick={handleLogout}
              sx={{
                '&:hover': { backgroundColor: '#ececec' },
                color: 'inherit',
                borderRadius: '4px',
                transition: 'background-color 0.3s ease',
                fontSize: '0.85rem',
                padding: '6px 12px',
              }}
            >
              <ListItemIcon>
                <ExitToAppIcon sx={{ fontSize: '1rem' }} />
              </ListItemIcon>
              <Typography variant="inherit">Cerrar Sesión</Typography>
            </MenuItem>
          </Box>
        </Box>
      </Menu>
    </Box>
  )
}


const getGreeting = () => {
  const hours = new Date().getHours();
  if (hours < 12) {
    return "Buenos días";
  } else if (hours < 18) {
    return "Buenas tardes";
  } else {
    return "Buenas noches";
  }
};