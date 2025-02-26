"use client"

export default function Home() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-auto my-4 p-4 sm:p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-600">Invalid or missing session</h1>
          <p className="text-gray-600 max-w-sm mx-auto bg-red-100 p-4 rounded-md">
            Please provide a valid session to proceed
          </p>
        </div>
      </div>
    </div>
  );
}
