import Header from "./Header";
import { ToastContainer } from "react-toastify";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-950 via-gray-950 to-green-950 text-white flex flex-col items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          className="mt-16"
        />
        <Header />
        <main className="w-full mt-8">{children}</main>
      </div>
    </div>
  );
}
