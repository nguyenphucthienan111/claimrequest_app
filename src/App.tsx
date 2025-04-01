import "./App.css";
import ToastProvider from "./shared/components/ToastProvider";
import AppRoutes from "./shared/routes/routes";
import "animate.css/animate.min.css";

function App() {
  return (
    <>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </>
  );
}

export default App;