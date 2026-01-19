// ======================
// НАСТРОЙКА КАМЕРЫ
// ======================

let cameraStream = null;
let isCameraOn = false;

// ======================
// НАСТРОЙКА МЕМОВ
// ======================

const memes = [
    {
        id: 1,
        image: "memes/meme1.png",
        name: "о как",
        altNames: ["ох", "ух ты"]
    },
    {
        id: 2,
        image: "memes/meme2.png",
        name: "смерть в нищите",
        altNames: ["смерть", "бедность", "нищета"]
    },
    {
        id: 3,
        image: "memes/meme3.png",
        name: "умный человек в очках",
        altNames: ["умный", "очки", "интеллектуал"]
    },
    {
        id: 4,
        image: "memes/meme4.png",
        name: "шлепа",
        altNames: ["большой шлепа", "шлёпа", "плюшевый"]
    },
    {
        id: 5,
        image: "memes/meme5.png",
        name: "смайл фейс",
        altNames: ["фейс", "smile face", "улыбка"]
    },
    {
        id: 6,
        image: "memes/meme6.jpg",
        name: "солнышко",
        altNames: ["любимая девочка", "милая", "девочка"]
    }
];

// ======================
// ИГРОВЫЕ ПЕРЕМЕННЫЕ
// ======================

let currentMemeIndex = 0;
let score = 0;
let streak = 0;
let isRecording = false;
let recognition = null;

// ======================
// ФУНКЦИИ КАМЕРЫ
// ======================

async function startCamera() {
    try {
        console.log("Включаю камеру...");
        const videoElement = document.getElementById('camera-video');
        const faceElement = document.getElementById('face-video');
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false
        });
        
        cameraStream = stream;
        if (videoElement) videoElement.srcObject = stream;
        if (faceElement) faceElement.srcObject = stream;
        
        isCameraOn = true;
        if (videoElement) videoElement.classList.add('camera-active');
        
        console.log("Камера включена!");
        return true;
        
    } catch (error) {
        console.log("Ошибка камеры:", error);
        return false;
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    isCameraOn = false;
}

// ======================
// ИГРОВАЯ ЛОГИКА
// ======================

function getElement(id) {
    return document.getElementById(id);
}

function showMeme() {
    const meme = memes[currentMemeIndex];
    const memeImage = getElement('meme-image');
    const memeName = getElement('meme-name');
    const hintElement = getElement('hint');
    const gameScreen = getElement('game-screen');
    const resultElement = getElement('result');
    
    if (memeImage) memeImage.src = meme.image;
    if (memeName) {
        memeName.textContent = '';
        memeName.classList.add('hidden');
    }
    if (hintElement) hintElement.textContent = "Скажи название мема";
    if (resultElement) resultElement.classList.add('hidden');
    
    if (gameScreen) {
        gameScreen.classList.remove('green-bg', 'red-bg');
        if (isCameraOn) {
            gameScreen.classList.add('with-camera');
        }
    }
}

function startVoiceRecording() {
    if (isRecording) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Используй Safari на iPhone");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;

    recognition.onstart = () => {
        isRecording = true;
        const hintElement = getElement('hint');
        if (hintElement) hintElement.textContent = "Говори сейчас...";
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        checkAnswer(spokenText);
    };

    recognition.onend = () => {
        isRecording = false;
        recognition = null;
    };

    recognition.start();
}

function checkAnswer(spokenText) {
    const meme = memes[currentMemeIndex];
    const correctAnswers = [meme.name.toLowerCase(), ...meme.altNames.map(n => n.toLowerCase())];
    
    let isCorrect = false;
    for (const correct of correctAnswers) {
        if (correct && spokenText.includes(correct)) {
            isCorrect = true;
            break;
        }
    }
    
    const resultElement = getElement('result');
    const resultText = getElement('result-text');
    if (resultElement) resultElement.classList.remove('hidden');
    
    if (isCorrect) {
        handleCorrectAnswer(meme);
    } else {
        handleWrongAnswer(meme);
    }
}

function handleCorrectAnswer(meme) {
    score += 10;
    streak++;
    
    const scoreElement = getElement('score');
    const streakElement = getElement('streak');
    const gameScreen = getElement('game-screen');
    const resultText = getElement('result-text');
    const memeName = getElement('meme-name');
    
    if (scoreElement) scoreElement.textContent = score;
    if (streakElement) streakElement.textContent = streak;
    
    if (gameScreen) {
        gameScreen.classList.remove('red-bg');
        gameScreen.classList.add('green-bg');
    }
    
    if (resultText) {
        resultText.textContent = "✅ ПРАВИЛЬНО! +10 очков";
        resultText.style.color = "#4CAF50";
    }
    
    if (memeName) {
        memeName.textContent = meme.name;
        memeName.classList.remove('hidden');
    }
    
    if (streak % 3 === 0) {
        setTimeout(showConfetti, 500);
    }
    
    setTimeout(nextMeme, 2000);
}

function handleWrongAnswer(meme) {
    streak = 0;
    
    const streakElement = getElement('streak');
    const gameScreen = getElement('game-screen');
    const resultText = getElement('result-text');
    const memeName = getElement('meme-name');
    
    if (streakElement) streakElement.textContent = streak;
    
    if (gameScreen) {
        gameScreen.classList.remove('green-bg');
        gameScreen.classList.add('red-bg');
    }
    
    if (resultText) {
        resultText.textContent = "❌ НЕПРАВИЛЬНО";
        resultText.style.color = "#E94057";
    }
    
    if (memeName) {
        memeName.textContent = `Правильно: ${meme.name}`;
        memeName.classList.remove('hidden');
    }
    
    setTimeout(nextMeme, 3000);
}

function nextMeme() {
    currentMemeIndex = (currentMemeIndex + 1) % memes.length;
    showMeme();
}

function showConfetti() {
    const canvas = getElement('confetti-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    score += 20;
    const scoreElement = getElement('score');
    if (scoreElement) scoreElement.textContent = score;
    
    const particles = [];
    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 6 + 3,
            speed: Math.random() * 2 + 1,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
        });
    }
    
    let animationId;
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let p of particles) {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            p.y += p.speed;
            
            if (p.y > canvas.height) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
            }
        }
        
        animationId = requestAnimationFrame(draw);
    }
    
    draw();
    
    setTimeout(() => {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 3000);
}

// ======================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ======================

document.addEventListener('DOMContentLoaded', function() {
    // Кнопка включения камеры
    const toggleCameraBtn = getElement('toggle-camera');
    if (toggleCameraBtn) {
        toggleCameraBtn.addEventListener('click', async function() {
            const success = await startCamera();
            if (success) {
                this.innerHTML = '<i class="fas fa-video-slash"></i> КАМЕРА ВКЛЮЧЕНА';
                this.style.background = 'linear-gradient(45deg, #4CAF50, #2E7D32)';
            }
        });
    }
    
    // Кнопка запуска игры
    const startBtn = getElement('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            const startScreen = getElement('start-screen');
            const gameScreen = getElement('game-screen');
            
            if (startScreen) startScreen.classList.add('hidden');
            if (gameScreen) {
                gameScreen.classList.remove('hidden');
                if (isCameraOn) {
                    gameScreen.classList.add('with-camera');
                }
            }
            
            showMeme();
        });
    }
    
    // Остальные кнопки
    const speakBtn = getElement('speak-btn');
    if (speakBtn) speakBtn.addEventListener('click', startVoiceRecording);
    
    const skipBtn = getElement('skip-btn');
    if (skipBtn) skipBtn.addEventListener('click', nextMeme);
    
    const hintBtn = getElement('hint-btn');
    if (hintBtn) {
        hintBtn.addEventListener('click', function() {
            const meme = memes[currentMemeIndex];
            const hintElement = getElement('hint');
            if (hintElement) {
                hintElement.textContent = `Подсказка: "${meme.name.split(' ')[0]}"...`;
                setTimeout(() => {
                    if (hintElement) hintElement.textContent = "Скажи название мема";
                }, 3000);
            }
        });
    }
    
    const restartBtn = getElement('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            score = 0;
            streak = 0;
            currentMemeIndex = 0;
            
            const scoreElement = getElement('score');
            const streakElement = getElement('streak');
            if (scoreElement) scoreElement.textContent = score;
            if (streakElement) streakElement.textContent = streak;
            
            showMeme();
        });
    }
    
    // Кнопка камеры в игре
    const cameraToggleBtn = getElement('camera-toggle');
    if (cameraToggleBtn) {
        cameraToggleBtn.addEventListener('click', async function() {
            if (isCameraOn) {
                stopCamera();
                this.innerHTML = '<i class="fas fa-video"></i>';
                const gameScreen = getElement('game-screen');
                if (gameScreen) gameScreen.classList.remove('with-camera');
            } else {
                const success = await startCamera();
                if (success) {
                    this.innerHTML = '<i class="fas fa-video-slash"></i>';
                    const gameScreen = getElement('game-screen');
                    if (gameScreen) gameScreen.classList.add('with-camera');
                }
            }
        });
    }
    
    // Выключить камеру при закрытии
    window.addEventListener('beforeunload', stopCamera);
    
    // Инициализация
    showMeme();
    console.log("Игра загружена!");
});

