import React, { useState } from 'react';
import './App.css';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [transcript, setTranscript] = useState('');

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);

      setMediaStream(stream);
      setAudioContext(audioCtx);
      
      // Now you can use the source node to process the audio data
      console.log('Audio context state:', audioCtx.state);

      // Additional audio processing logic can go here
      const analyser = audioCtx.createAnalyser();
      source.connect(analyser);

      // Example of how to log audio data
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      console.log('Audio data array:', dataArray);

      // Speech recognition setup
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + transcriptChunk);
          } else {
            interimTranscript += transcriptChunk;
          }
        }
        console.log('Interim transcript:', interimTranscript);
      };

      recognition.start();

      setIsListening(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopListening = () => {
    if (audioContext && mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      audioContext.close();

      setIsListening(false);
      setAudioContext(null);
      setMediaStream(null);
    }
  };

  const handleButtonClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="App">
      <p>Enter input audio</p>
      <button onClick={handleButtonClick}>
        <img src={"mic.png"} alt="mic" height='70px' width='70px'/>
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
<br></br><br></br>
      <textarea
        value={transcript}
        readOnly
        placeholder="Transcribed text will appear here..."
        rows="5"
        cols="50"
      />

      <p className='video'>Sign Language Video Output</p>
    </div>
  );
}

export default App;
