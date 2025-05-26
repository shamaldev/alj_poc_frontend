// // App.jsx

// import { useState, useRef } from 'react';
// import {
//   PlayCircleIcon,
//   StopCircleIcon,
//   ArrowDownCircleIcon,
//   MicrophoneIcon,
// } from '@heroicons/react/24/solid';

// export default function App() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [mediaRecorder, setMediaRecorder] = useState(null);
//   const [audioUrl, setAudioUrl] = useState(null);
//   const chunksRef = useRef([]);

//   const startRecording = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const recorder = new MediaRecorder(stream);
//     recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
//     recorder.onstop = () => {
//       const blob = new Blob(chunksRef.current, { type: 'audio/mp3' });
//       const url = URL.createObjectURL(blob);
//       setAudioUrl(url);
//       chunksRef.current = [];
//     };
//     recorder.start();
//     setMediaRecorder(recorder);
//     setIsRecording(true);
//   };

//   const stopRecording = () => {
//     if (mediaRecorder) {
//       mediaRecorder.stop();
//       setIsRecording(false);
//     }
//   };

//   const downloadRecording = () => {
//     if (!audioUrl) return;
//     const a = document.createElement('a');
//     a.href = audioUrl;
//     a.download = 'recording.mp3';
//     a.click();
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
//       <div className="bg-white shadow-lg rounded-2xl p-6 max-w-md w-full text-center">
//         {/* Company Logo */}
//         <div className="flex flex-col items-center mb-4">
//           <img
//             src="/novigologo.png"
//             alt="Company Logo"
//             className="w-40 h-auto mb-2"
//           />
//           <h1 className="text-2xl font-bold text-blue-700">🎙️ Voice Recorder</h1>
//         </div>

//         <p className="text-blue-600 font-medium mb-4">
//           {isRecording ? 'Recording...' : 'Click to start recording'}
//         </p>

//         {/* Action Buttons */}
//         <div className="flex items-center justify-center gap-6 mb-4">
//           {!isRecording ? (
//             <button
//               onClick={startRecording}
//               className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow transition"
//               title="Start Recording"
//             >
//               <MicrophoneIcon className="h-6 w-6" />
//             </button>
//           ) : (
//             <button
//               onClick={stopRecording}
//               className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow transition"
//               title="Stop Recording"
//             >
//               <StopCircleIcon className="h-6 w-6" />
//             </button>
//           )}

//           {audioUrl && (
//             <>
//               <button
//                 onClick={() => {
//                   const audio = new Audio(audioUrl);
//                   audio.play();
//                 }}
//                 className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow transition"
//                 title="Play"
//               >
//                 <PlayCircleIcon className="h-6 w-6" />
//               </button>

//               <button
//                 onClick={downloadRecording}
//                 className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow transition"
//                 title="Download"
//               >
//                 <ArrowDownCircleIcon className="h-6 w-6" />
//               </button>
//             </>
//           )}
//         </div>

//         {/* Audio Player Preview (optional fallback UI) */}
//         {audioUrl && (
//           <audio controls src={audioUrl} className="w-full mt-2 rounded" />
//         )}
//       </div>
//     </div>
//   );
// }

// App.jsx
// App.jsx
import { useState, useRef } from "react";
import axios from "axios";
import {
  PlayCircleIcon,
  StopCircleIcon,
  ArrowDownCircleIcon,
  MicrophoneIcon,
  UserCircleIcon,
  CpuChipIcon,
} from "@heroicons/react/24/solid";

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [aiAudioUrl, setAiAudioUrl] = useState(null);
  const [isAiAudioLoading, setIsAiAudioLoading] = useState(false);
  const [aiAudioStatusMessage, setAiAudioStatusMessage] = useState(
    "Upload and wait for AI audio generation."
  ); // New state for messages

  const chunksRef = useRef([]);
  const pollingIntervalRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/mp3" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        chunksRef.current = [];
        setAiAudioUrl(null);
        setIsAiAudioLoading(false);
        setAiAudioStatusMessage("Upload and wait for AI audio generation."); // Reset message
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      alert("Could not start recording. Please allow microphone access.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const downloadRecording = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "recording.mp3";
    a.click();
  };

  const uploadThroughBackend = async () => {
    if (!audioUrl) {
      alert("No recording to upload!");
      return;
    }

    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const file = new File([blob], "recording.mp3", { type: "audio/mpeg" });

      const formData = new FormData();
      formData.append("file", file);

      setIsAiAudioLoading(true);
      setAiAudioUrl(null); // Clear previous AI audio
      setAiAudioStatusMessage("Uploading audio..."); // New message

      // Upload to backend
      await axios.post("https://alj-poc-backend.onrender.com/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAiAudioStatusMessage(
        "Upload successful. Waiting for AI processing to start (this might take a minute)..."
      );

      // Start polling for AI audio status after upload is confirmed
      startPollingForAiAudio();
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console for details.");
      setIsAiAudioLoading(false);
      setAiAudioStatusMessage("Upload failed."); // New message
    }
  };

  const startPollingForAiAudio = () => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        // You need to create this new endpoint in your backend
        const res = await axios.get("https://alj-poc-backend.onrender.com/ai-audio-status");
        const { isProcessing, isReady } = res.data;

        if (isProcessing) {
          setAiAudioStatusMessage("AI is processing your audio... ⏳");
        } else if (isReady) {
          setAiAudioStatusMessage("AI audio ready! ▶️");
          // Fetch the AI generated audio binary
          const audioRes = await axios.get("https://alj-poc-backend.onrender.com/audio-binary", {
            responseType: "arraybuffer", // Important for binary data
          });
          const blob = new Blob([audioRes.data], { type: "audio/mpeg" });
          const url = URL.createObjectURL(blob);
          setAiAudioUrl(url);
          setIsAiAudioLoading(false);
          clearInterval(pollingIntervalRef.current); // Stop polling
        } else {
          // This state might occur if no job is active or initial delay
          setAiAudioStatusMessage("Waiting for AI processing to begin...");
        }
      } catch (err) {
        console.error("Polling error:", err);
        setAiAudioStatusMessage("Error checking AI audio status.");
        setIsAiAudioLoading(false);
        clearInterval(pollingIntervalRef.current); // Stop polling on error
      }
    }, 12000); // Poll every 5 seconds
  };

  const clearHistory = async ()=>{
    try {
      const clearUrl = "https://alj-poc-backend.onrender.com/file";
      const response = await axios.delete(clearUrl);
      if (response.status === 200) {
        setAudioUrl(null);
        setAiAudioUrl(null);
        setIsAiAudioLoading(false);
        setAiAudioStatusMessage("Upload and wait for AI audio generation.");
        alert("History cleared successfully!");
      } else {
        alert("Failed to clear history.");
      }
    } catch (error) {
      console.error("Error clearing jistory:",error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-6">
      <div className="bg-white shadow-xl rounded-3xl p-8 max-w-lg w-full text-center">
        {/* Logos and title */}
        <div className="relative mb-6">
          <img
            src="/novigologo.png"
            alt="Company Logo Left"
            className="absolute top-0 left-0 w-24 h-auto"
          />
          <img
            src="/logo-abdul-latif-jameel.png"
            alt="Company Logo Right"
            className="absolute top-0 right-0 w-24 h-auto"
          />
          <div className="flex justify-center pt-16">
            <h1 className="text-3xl font-extrabold text-blue-800 flex items-center gap-2">
              <MicrophoneIcon className="h-8 w-8 text-blue-600" />
              Voice Recorder
            </h1>
          </div>
        </div>

        <p
          className={`mb-5 font-semibold ${
            isRecording ? "text-red-600" : "text-blue-700"
          }`}
          aria-live="polite"
        >
          {isRecording ? "Recording... 🎙️" : "Click the mic to start recording"}
        </p>

        <div className="flex items-center justify-center gap-5 flex-wrap mb-10">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white p-4 rounded-full shadow-lg transition"
              aria-label="Start Recording"
              title="Start Recording"
            >
              <MicrophoneIcon className="h-7 w-7" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 text-white p-4 rounded-full shadow-lg transition"
              aria-label="Stop Recording"
              title="Stop Recording"
            >
              <StopCircleIcon className="h-7 w-7" />
            </button>
          )}

          {audioUrl && (
            <>
              <button
                onClick={() => new Audio(audioUrl).play()}
                className="bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white p-4 rounded-full shadow-lg transition"
                aria-label="Play Recorded Audio"
                title="Play Recorded Audio"
              >
                <PlayCircleIcon className="h-7 w-7" />
              </button>

              <button
                onClick={downloadRecording}
                className="bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white p-4 rounded-full shadow-lg transition"
                aria-label="Download Recorded Audio"
                title="Download Recorded Audio"
              >
                <ArrowDownCircleIcon className="h-7 w-7" />
              </button>

              <button
                onClick={uploadThroughBackend}
                className="bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 text-white p-4 rounded-full shadow-lg transition"
                aria-label="Upload Recorded Audio"
                title="Upload Recorded Audio"
              >
                Upload
              </button>
            </>
          )}
        </div>

        {audioUrl && (
          <section className="mb-8 p-5 border border-blue-300 rounded-2xl shadow-sm bg-blue-50">
            <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2 mb-3">
              <UserCircleIcon className="h-6 w-6 text-blue-600" />
              Your Recorded Audio
            </h2>
            <p className="text-blue-600 mb-3 text-sm">
              This is the audio you recorded. You can play, download, or upload it.
            </p>
            <audio
              controls
              src={audioUrl}
              className="w-full rounded-lg border border-blue-300 shadow-inner"
              aria-label="User recorded audio playback"
            />
          </section>
        )}

        {audioUrl && (
          <section className="p-5 border border-green-300 rounded-2xl shadow-sm bg-green-50">
            <h2 className="text-xl font-bold text-green-700 flex items-center gap-2 mb-3">
              <CpuChipIcon className="h-6 w-6 text-green-600" />
              AI-Assistant Audio
            </h2>
            <p className="text-green-600 mb-3 text-sm">
              This audio is generated by our AI agents based on your input.
            </p>

            {isAiAudioLoading ? (
              <div className="text-green-700 font-semibold">
                {aiAudioStatusMessage}
              </div>
            ) : aiAudioUrl ? (
              <audio
                controls
                className="w-full rounded-lg border border-green-300 shadow-inner"
                src={aiAudioUrl}
                aria-label="AI generated audio playback"
              />
            ) : (
              <div className="text-green-700 font-semibold">
                {aiAudioStatusMessage}
              </div>
            )}
          </section>
        )}

{aiAudioUrl && <button
      onClick={clearHistory}
      className="mt-4 bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 text-white px-4 py-2 rounded shadow-lg transition"
      aria-label="Clear History"
      title="Clear History"
    >
      Clear History
    </button>}
 <div className="mt-6 flex justify-center items-center">
        <p className="text-sm text-gray-500 font-medium mr-2">Powered by</p>
        <img
          src="/databricks-logo.png" // Replace with the correct path to the Databricks logo
          alt="Databricks Logo"
          className="h-10"
        />
      </div>
      </div>
     
    </div>
  );
}