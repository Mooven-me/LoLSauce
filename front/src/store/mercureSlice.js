import { createSlice } from '@reduxjs/toolkit';

const mercureSlice = createSlice({
  name: 'mercure',
  initialState: {
    connected: false,
    error: null,
  },
  reducers: {
    connect: (state) => {
      // Le reducer ne fait rien ici, c'est le middleware qui agit
      state.connected = false;
    },
    disconnect: (state) => {
      state.connected = false;
    },
    connected: (state) => {
      state.connected = true;
      state.error = null;
    },
    connectionError: (state, action) => {
      state.connected = false;
      state.error = action.payload;
    },
  },
});

export const { connect, disconnect, connected, connectionError } = mercureSlice.actions;
export default mercureSlice.reducer;