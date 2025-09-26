
import { Route, Routes } from 'react-router-dom'
import { Suspense, lazy } from 'react'

import PageLoading from '../components/PageLoading';

const PagLogin = lazy(() => import('./Page/PagLogin'));

export const RouteAuth = () => {

  return (
    <Suspense fallback={
      <PageLoading />
    }>
      <Routes>
        <Route path='/' element={<PagLogin />} />
      </Routes>
    </Suspense>
  )
}
