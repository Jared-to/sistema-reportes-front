import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./auth/authSlice";
import { authFunctions } from "./functions/authFunctions";


export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        functions:authFunctions.reducer,
    }
})