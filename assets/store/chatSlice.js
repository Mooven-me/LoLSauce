import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
  },
  reducers: {
    messageReceived: (state, action) => {
      state.messages.push({
        message: action.payload.message,
        user_id: action.payload.user_id,
      });
    },
  },
});

export const { messageReceived } = chatSlice.actions;
export default chatSlice.reducer;