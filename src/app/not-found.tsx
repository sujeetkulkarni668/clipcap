import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090b0e] text-white flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-4xl font-bold mb-4 font-['Poppins_ExtraBold',sans-serif]">
        Page <span className="text-cyan-400">Not Found</span>
      </h2>
      <p className="text-gray-400 mb-8 max-w-md">
        Could not find requested resource. Return back to the editing studio.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:opacity-90 transition-opacity"
      >
        Back to Studio
      </Link>
    </div>
  );
}
