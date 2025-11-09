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
    },
    
    setQuestionData: (state, action) => {
      state.questionData = action.payload;
    },

    stop: (state) => {
      state.isStarted = false;
      state.questionData = {};
      state.foundAnswer = false;
    },
    setUserFoundAnswer: (state, action) => {
      state.foundAnswer = action.payload
    }
  },
});

export const { start, setQuestionData, stop, setUserFoundAnswer } = gameSlice.actions;
export default gameSlice.reducer;