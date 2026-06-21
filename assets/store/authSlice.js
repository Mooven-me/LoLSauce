import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userId: null,
  username: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.userId = action.payload.userId;
      state.username = action.payload.username;
      window.USERNAME = action.payload.username;
    },
    logout: (state) => {
      state.userId = null;
      state.username = null;
    },
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    }
  },
});

export const { setAuth, logout, setUsername, setUserId } = authSlice.actions;

export default authSlice.reducer;