import { createSlice } from '@reduxjs/toolkit';

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    isStarted: false,
    questionData: {},
    foundAnswer: false
  },
  reducers: {
    start: (state) => {
      state.isStarted = true;
      state.questionData = {}
    },
    
    setQuestionData: (state, action) => {
      state.questionData = action.payload;
    },

    stop: (state) => {
      state.isStarted = false;
      state.questionData = {};
      state.foundAnswer = false;
    },
  },
});

export const { start, setQuestionData, stop } = gameSlice.actions;
export default gameSlice.reducer;