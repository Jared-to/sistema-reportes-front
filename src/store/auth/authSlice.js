import {createSlice} from '@reduxjs/toolkit'

export const authSlice=createSlice({

    //donde se maneja los status mas los datos del usuario y estos se guardan en el redux
    name:'auth',
    initialState:{
        status:'not-authenticated',
        load:undefined,
        user:{},
        errorMessage:undefined
    },
    reducers:{
        checking:(state)=>{
            state.status='checking',
            state.load=undefined,
            state.user={},
            state.errorMessage=undefined
        },
        checkingLogin:(state)=>{
            state.status='not-authenticated',
            state.load=true,
            state.user={},
            state.errorMessage=undefined
        },
        onLogin:(state,{payload})=>{
            state.status='authenticated',
            state.load=false,
            state.user=payload,
            state.errorMessage=undefined
        },
        onLogout:(state,{payload})=>{
            state.status= 'not-authenticated';
            state.load=false,
            state.user={},
            state.errorMessage= payload
        },clearErrorMessage:(state)=>{
            state.errorMessage=undefined
            
        }
        }
})


export const {checking,onLogin,onLogout,clearErrorMessage,checkingLogin}=authSlice.actions