import {createSlice} from '@reduxjs/toolkit'

export const authFunctions=createSlice({

    //donde se maneja los status y cargas de funciones async
    name:'functions',
    initialState:{
        load:false,
        message:{},
        errorMessage:undefined
    },
    reducers:{
        checking:(state)=>{
            state.load=true,
            state.message={},
            state.errorMessage=undefined
        },
        onTrue:(state,{payload})=>{
            state.load=false,
            state.message=payload,
            state.errorMessage=undefined
        },
        onFalse:(state,{payload})=>{
            state.load=false,
            state.message={},
            state.errorMessage= payload
        },clearErrorMessage:(state)=>{
            state.errorMessage=undefined
            
        }
        }
})


export const {checking,onTrue,onFalse,clearErrorMessage}=authFunctions.actions