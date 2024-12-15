let recognition;
let analyzing = false;
let fillerWordsCount = 0;
const fillerWords = [
  "um", "uh", "like", "you know", "so", "actually", "basically", "literally", "well", "I mean", "okay", "right", "hmm"
];
let chart;

function initializeRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech Recognition is not supported in this browser.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    document.getElementById("statusMessage").innerText = "Analyzing speech...";
  };

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    processSpeech(transcript);
  };

  recognition.onerror = (event) => {
    alert(`Error occurred in recognition: ${event.error}`);
    stopAnalyzing();
  };

  recognition.onend = () => {
    if (analyzing) stopAnalyzing();
  };
}

function processSpeech(transcript) {
  const words = transcript.toLowerCase().split(/\\s+/);
  const detectedFillerWords = words.filter(word => fillerWords.includes(word));
  fillerWordsCount += detectedFillerWords.length;
}

function startAnalyzing() {
  if (!recognition) initializeRecognition();
  if (recognition && !analyzing) {
    recognition.start();
    analyzing = true;
    fillerWordsCount = 0;
    document.getElementById("startButton").disabled = true;
    document.getElementById("stopButton").disabled = false;
  }
}

function stopAnalyzing() {
  if (recognition && analyzing) {
    recognition.stop();
    analyzing = false;
    document.getElementById("startButton").disabled = false;
    document.getElementById("stopButton").disabled = true;
    document.getElementById("statusMessage").innerText = `Analysis complete! You used ${fillerWordsCount} filler words.`;
    updateGraph(new Date().toLocaleTimeString(), fillerWordsCount);
  }
}

function initializeGraph() {
  const ctx = document.getElementById("fillerWordGraph").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Filler Words Over Time",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: { beginAtZero: true },
        y: { beginAtZero: true }
      }
    }
  });
}

function updateGraph(label, data) {
  if (chart) {
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(data);
    chart.update();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeRecognition();
  initializeGraph();
  document.getElementById("startButton").addEventListener("click", startAnalyzing);
  document.getElementById("stopButton").addEventListener("click", stopAnalyzing);
});
