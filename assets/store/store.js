import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import roomReducer from './roomSlice';
import chatReducer from './chatSlice';
import gameReudcer from './gameSlice';
import { mercureMiddleware } from './mercureMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    room: roomReducer,
    chat: chatReducer,
    game: gameReudcer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(mercureMiddleware)
});