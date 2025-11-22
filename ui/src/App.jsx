import "./App.css";
import Login from "./Components/Login/Login";
import { Toaster } from 'react-hot-toast';  // ← ADICIONE ESTA LINHA

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="App">
        <Login />
      </div>
    </>
  );
}

export default App;