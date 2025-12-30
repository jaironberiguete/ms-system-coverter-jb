export default function Hero() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6 text-center">

        {/* Badge */}
        <span className="inline-block mb-4 px-4 py-1 text-xs font-medium rounded-full bg-white/10 text-gray-200">
          Video → Audio Converter
        </span>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          Convert Videos to MP3
          <span className="block text-indigo-400">
            Securely & Effortlessly
          </span>
        </h1>

        {/* Subtext */}
        <p className="max-w-2xl mx-auto text-gray-300 ">
        Upload a video and extract high-quality MP3 audio.
        Built on a microservices architecture using containerized services,
        secure APIs, and scalable cloud infrastructure.
        </p>
      </div>
    </section>
  );
}
