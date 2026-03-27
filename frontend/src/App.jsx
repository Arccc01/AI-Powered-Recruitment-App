import React from 'react'
import Mainroutes from './routes/Mainroutes'
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "./features/authslice";
import Loader from "./components/Loader";

const App = () => {
  const dispatch = useDispatch();
  const { token, user, initializing } = useSelector((state) => state.auth);

  // ✅ on every refresh — if token exists, fetch user data again
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchProfile());
    }
  }, []);

   // ✅ only block render during app boot — not during login/signup
  if (initializing && token && !user) {
    return <Loader />;
  }
  return (
    <Mainroutes/>
  )
}

export default App
