import UploadForm from "../components/UploadForm";

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Video</h1>
      <UploadForm />
    </div>
  );
}
