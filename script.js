const memes = [
  { file: 'meme1.png', answer: 'доги' },
  { file: 'meme2.png', answer: 'пепе' },
  { file: 'meme3.png', answer: 'гигачад' },
  { file: 'meme4.png', answer: 'чед' },
  { file: 'meme5.png', answer: 'шрек' },
  { file: 'meme6.jpg', answer: 'плачущий котик' }
];

let currentMemeIndex = 0;

const memeImage = document.getElementById('meme-image');
const micButton = document.getElementById('mic-button');
const statusText = document.getElementById('status-text');

function showMeme() {
  const meme = memes[currentMemeIndex];
  memeImage.src = `memes/${meme.file}`;
  statusText.textContent = 'Назови мем голосом';
}

function checkAnswer(transcript) {
  const correct = memes[currentMemeIndex].answer.toLowerCase();
  const spoken = transcript.toLowerCase();

  if (spoken.includes(correct)) {
    statusText.textContent = '✅ Верно!';
    currentMemeIndex++;

    if (currentMemeIndex < memes.length) {
      setTimeout(() => {
        showMeme();
      }, 1500);
    } else {
      statusText.textContent = '🎉 Ты угадал все мемы!';
    }
  } else {
    statusText.textContent = '❌ Неправильно, попробуй ещё раз';
  }
}

function startRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Распознавание речи не поддерживается в этом браузере');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'ru-RU';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();
  statusText.textContent = '🎤 Слушаю...';

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    checkAnswer(transcript);
  };

  recognition.onerror = (event) => {
    statusText.textContent = 'Ошибка: ' + event.error;
  };
}

micButton.addEventListener('click', startRecognition);

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    const video = document.getElementById('camera-bg');
    video.srcObject = stream;
  } catch (err) {
    alert('Ошибка доступа к камере: ' + err.message);
  }
}

startCamera();
showMeme();
