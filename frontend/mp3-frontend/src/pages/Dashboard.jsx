import Navbar from "../components/NavBar";
import Hero from "../components/Hero";
import UploadForm from "../components/UploadForm";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white ">
      <Navbar />
      <Hero />
      <main className="p-6 max-w-6xl mx-auto">
        <UploadForm />
      </main>
    </div>
  );
}