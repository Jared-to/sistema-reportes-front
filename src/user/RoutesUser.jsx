import { Route, Routes } from "react-router-dom"

import { Unauthorized } from "./Unauthorized"
import { RoutesProtected } from "./RoutesProtected"
import { Navbar } from "./navbar/Navbar"
import { PagHome } from "./pages/home/PagHome"
import { PagEquipoInfo } from "./pages/equipo-info/PagEquipoInfo"
import { PagUsuarios } from "./pages/usuarios/PagUsuarios"


export const RoutesUser = () => {
  return (
    <Navbar>
      <Routes>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={<PagHome />} />

        <Route path="/usuarios" element={
          <RoutesProtected element={<PagUsuarios />} allowedRoles={['admin']} />
        } />
        <Route path="/equipment/:institucion/:resonador" element={<PagEquipoInfo />} />
      </Routes>
    </Navbar>
  )
}
