import { connect, disconnect, connected, connectionError } from './mercureSlice';
import { resetScores, resetUsersWord, setUsers, userSuccess, userTry } from './roomSlice';
import { start, setQuestionData, stop, setUserFoundAnswer } from './gameSlice';
import { messageReceived } from './chatSlice';

let eventSource = null;

export const mercureMiddleware = (store) => (next) => (action) => {
  if (connect.match(action)) {
    const { roomId } = action.payload;
    
    if (eventSource) {
      eventSource.close();
    }
    
    const url = new URL(import.meta.env.VITE_MERCURE_PUBLIC_URL);
    url.searchParams.append('topic', `https://subscribed.channel/${roomId}/room`);
    eventSource = new EventSource(url.toString(), { withCredentials: true });
    
    eventSource.onopen = () => {
      store.dispatch(connected());
    };
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case "userMessage":
          store.dispatch(messageReceived(data));
          break;
          
        case "usersUpdate":
          store.dispatch(setUsers(data.users));
          break;
          
        case "question":
        case "end":
          store.dispatch(resetUsersWord());
        case "answer":
          store.dispatch(setQuestionData(data));
          break;
          
        case "start":
          store.dispatch(start());
          store.dispatch(resetScores())
          break;
          
        case "success":
          store.dispatch(userSuccess(data));
          
          const currentUserId = store.getState().auth.userId;
          if (data.user_id === currentUserId) {
            store.dispatch(setUserFoundAnswer());
          }
          break;
          
        case "try":
          store.dispatch(userTry(data));
          break;
      }
    };
    
    eventSource.onerror = (err) => {
      store.dispatch(connectionError(err.message));
    };
  }
  
  if (disconnect.match(action)) {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  }
  
  return next(action);
};