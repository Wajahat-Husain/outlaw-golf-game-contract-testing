import Header from "./Header";
import { ToastContainer } from "react-toastify";

export default function Layout({ children }) {
  return (
    <div className="og-app-bg min-h-screen text-white flex flex-col items-center p-4 sm:p-6 md:p-8 relative overflow-x-hidden">
      <div
        className="og-grid-overlay fixed inset-0 pointer-events-none z-1 opacity-70"
        aria-hidden
      />
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 left-[12%] h-112 w-md rounded-full bg-purple-600/15 blur-[100px]" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-violet-600/10 blur-[90px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-emerald-600/12 blur-[100px]" />
        <div className="absolute bottom-1/4 -left-16 h-72 w-72 rounded-full bg-fuchsia-900/20 blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
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
          toastClassName="!rounded-xl !border !border-white/10 !shadow-2xl"
          className="mt-14! sm:mt-16! z-100"
        />
        <Header />
        <main className="w-full mt-6 sm:mt-10">{children}</main>
      </div>
    </div>
  );
}
