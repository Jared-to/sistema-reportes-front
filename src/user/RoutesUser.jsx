import { Route, Routes } from "react-router-dom"

import { Unauthorized } from "./Unauthorized"
import { RoutesProtected } from "./RoutesProtected"
import { Navbar } from "./navbar/Navbar"
import { PagHome } from "./pages/home/PagHome"
import { PagEquipoInfo } from "./pages/equipo-info/PagEquipoInfo"


export const RoutesUser = () => {
  return (
    <Navbar>
      <Routes>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={<PagHome />} />
        <Route path="/equipment/:institucion/:resonador" element={<PagEquipoInfo />} />
      </Routes>
    </Navbar>
  )
}
