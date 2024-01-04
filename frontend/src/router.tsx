import { createBrowserRouter } from 'react-router-dom'
import ErrorPage from './error-page'
import Home, { loader as homeLoader } from './routes/home'
import Login from './routes/login'
import { Profile } from './routes/profile'
import Register from './routes/register'
import Root from './routes/root'
import SSOLogin, { loader as ssoLoader } from './routes/sso.login'
import Users, { loader as usersLoader } from './routes/users'
import Events from './routes/events'
import EventProfile from './routes/event_profile'
import RedeemCode from './routes/redeem_code'


export const routes = [
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home />, loader: homeLoader },
      {
        path: 'sso-login-callback',
        element: <SSOLogin />,
        loader: ssoLoader,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'users',
        element: <Users />,
        loader: usersLoader,
      },
      {
        path: 'events',
        element: <Events />,
      },
      {
        path: 'event_profile',
        element: <EventProfile />,
      },
      {
        path: 'redeem_code',
        element: <RedeemCode />,
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
