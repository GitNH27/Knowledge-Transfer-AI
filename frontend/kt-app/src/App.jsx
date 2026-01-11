import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("Disconnected");

  function connectApi() {
    // simulate an API call
    setStatus("Connected ✅");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          My First React + Tailwind App
        </h1>

        {/* Counter */}
        <div className="space-y-2">
          <p className="text-lg text-gray-600">Counter</p>
          <p className="text-4xl font-bold text-blue-500">{count}</p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setCount(count - 1)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              −
            </button>

            <button
              onClick={() => setCount(count + 1)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              +
            </button>
          </div>
        </div>

        {/* API status */}
        <div className="space-y-2">
          <p className="text-gray-600">API Status</p>
          <p className="font-medium">{status}</p>

          <button
            onClick={connectApi}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Connect to API
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
