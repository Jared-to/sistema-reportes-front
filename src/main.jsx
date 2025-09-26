
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './store/store'
import './index.css'
import { GlobalRoutes } from './routes/GlobalRoutes.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <Toaster
      position="top-right"
      reverseOrder={false} />
    <Provider store={store}>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <GlobalRoutes />
      </HashRouter>
    </Provider>
  </>
)
