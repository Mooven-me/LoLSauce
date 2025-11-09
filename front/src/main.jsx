import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Provider } from 'react-redux';
import { store } from './store/store';

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <App />
    </Provider>
)