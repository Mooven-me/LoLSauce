// src/store/roomSlice.js
import { createSlice } from '@reduxjs/toolkit';

const roomSlice = createSlice({
  name: 'room',
  initialState: {
    users: [],
    roomId: null,
    isLeader: false,
  },
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },

    setRoomId: (state, action) => {
      window.ROOM_ID = action.payload;
      state.roomId = action.payload;
    },
    
    userSuccess: (state, action) => {
      const { user_id, time, score } = action.payload;
      const totalTime = time.s + time.f;
      
      state.users = state.users.map(user => 
        user.user_id === user_id 
          ? { 
              ...user, 
              success: true,
              time: totalTime.toFixed(3) + 's',
              word: "",
              score: score
            }
          : user
      );
    },
    setIsLeader : (state, action) => {
      state.isLeader = action.payload;
    },
    userTry: (state, action) => {
      const { user_id, word } = action.payload;
      
      state.users = state.users.map(user => 
        user.user_id === user_id 
          ? { ...user, word: word }
          : user
      );
    },
    
    resetUsersWord: (state) => {
      state.users = state.users.map(user => ({
        ...user,
        time: "",
        success: false,
        word: "",
      }));
    },

    resetScores: (state) => {
      state.users = state.users.map(user => ({
        ...user,
        score: 0
      }))
    }
  },
});

export const { setUsers, setRoomId, userSuccess, userTry, resetUsersWord, setIsLeader, resetScores } = roomSlice.actions;
export default roomSlice.reducer;