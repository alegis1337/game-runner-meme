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
        name: "О как",
        altNames: ["ох", "ух ты", "ого", "вау"],
        wrongAnswers: ["Смешно", "Удивление", "Реакция", "Эмоция"]
    },
    {
        id: 2,
        image: "memes/meme2.png",
        name: "Смерть в нищите",
        altNames: ["смерть", "бедность", "нищета", "бедный"],
        wrongAnswers: ["Бедняга", "Печаль", "Отчаяние", "Грусть"]
    },
    {
        id: 3,
        image: "memes/meme3.png",
        name: "Умный человек в очках",
        altNames: ["умный", "очки", "интеллектуал", "ученый"],
        wrongAnswers: ["Профессор", "Доктор", "Ученый", "Гений"]
    },
    {
        id: 4,
        image: "memes/meme4.png",
        name: "Шлепа",
        altNames: ["большой шлепа", "шлёпа", "плюшевый", "медвежонок"],
        wrongAnswers: ["Мишка", "Плюшевый", "Игрушка", "Тедди"]
    },
    {
        id: 5,
        image: "memes/meme5.png",
        name: "Смайл фейс",
        altNames: ["фейс", "smile face", "улыбка", "смайлик"],
        wrongAnswers: ["Улыбка", "Радость", "Счастье", "Веселье"]
    },
    {
        id: 6,
        image: "memes/meme6.jpg",
        name: "Солнышко",
        altNames: ["любимая девочка", "милая", "девочка", "красивая"],
        wrongAnswers: ["Красотка", "Милашка", "Девочка", "Принцесса"]
    }
];

// ======================
// ИГРОВЫЕ ПЕРЕМЕННЫЕ
// ======================

let currentMemeIndex = 0;
let score = 0;
let streak = 0;
let isListening = false;
let recognition = null;
let gameActive = true;

// ======================
// DOM ЭЛЕМЕНТЫ
// ======================

function getElement(id) {
    return document.getElementById(id);
}

// ======================
// ФУНКЦИИ КАМЕРЫ
// ======================

async function startCamera() {
    try {
        const video = getElement('camera-bg');
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        
        cameraStream = stream;
        video.srcObject = stream;
        isCameraOn = true;
        
        // Обновляем кнопку
        const toggleBtn = getElement('toggle-camera');
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-video-slash"></i> КАМЕРА ВКЛЮЧЕНА';
            toggleBtn.style.background = 'linear-gradient(45deg, #00CCFF, #0066FF)';
            toggleBtn.style.color = 'white';
            toggleBtn.style.border = 'none';
        }
        
        const switchBtn = getElement('camera-switch');
        if (switchBtn) {
            switchBtn.innerHTML = '<i class="fas fa-video-slash"></i>';
        }
        
        console.log("✅ Камера включена");
        return true;
        
    } catch (error) {
        console.log("❌ Ошибка камеры:", error);
        alert("Разрешите доступ к камере для AR-режима!");
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

function loadGame() {
    // Скрываем экран загрузки
    const loadingScreen = getElement('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
    
    // Показываем стартовый экран
    const startScreen = getElement('start-screen');
    if (startScreen) {
        startScreen.classList.remove('hidden');
    }
    
    console.log("🎮 Игра загружена!");
}

function startGame() {
    const startScreen = getElement('start-screen');
    const gameScreen = getElement('game-screen');
    
    if (startScreen) startScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');
    
    // Сброс игры
    score = 0;
    streak = 0;
    currentMemeIndex = 0;
    gameActive = true;
    
    // Обновляем UI
    updateScore();
    updateStreak();
    
    // Загружаем первый мем
    loadCurrentMeme();
}

function loadCurrentMeme() {
    if (!gameActive) return;
    
    const currentMeme = memes[currentMemeIndex];
    
    // Устанавливаем изображение
    const memeImage = getElement('meme-image');
    if (memeImage) {
        memeImage.src = currentMeme.image;
        memeImage.alt = currentMeme.name;
    }
    
    // Генерируем варианты ответов
    generateAnswerOptions();
    
    // Сбрасываем подсказку
    const voiceHint = getElement('voice-hint');
    if (voiceHint) {
        voiceHint.textContent = "Нажми и назови мем вслух";
    }
    
    // Скрываем результат
    const resultOverlay = getElement('result-overlay');
    if (resultOverlay) {
        resultOverlay.classList.add('hidden');
        resultOverlay.innerHTML = '';
    }
    
    console.log(`🎯 Загружен мем: ${currentMeme.name}`);
}

function generateAnswerOptions() {
    const currentMeme = memes[currentMemeIndex];
    const answerGrid = getElement('answer-grid');
    
    if (!answerGrid) return;
    
    // Очищаем предыдущие варианты
    answerGrid.innerHTML = '';
    
    // Создаем массив всех вариантов
    let allAnswers = [
        currentMeme.name,
        ...currentMeme.wrongAnswers
    ];
    
    // Перемешиваем варианты
    allAnswers = shuffleArray(allAnswers);
    
    // Создаем кнопки для каждого варианта
    allAnswers.forEach((answer, index) => {
        const button = document.createElement('div');
        button.className = 'answer-option';
        button.textContent = answer;
        button.dataset.answer = answer;
        
        button.addEventListener('click', () => {
            if (!gameActive) return;
            checkAnswer(answer);
        });
        
        answerGrid.appendChild(button);
    });
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function checkAnswer(answer) {
    if (!gameActive) return;
    
    const currentMeme = memes[currentMemeIndex];
    const correctAnswers = [currentMeme.name.toLowerCase(), ...currentMeme.altNames.map(n => n.toLowerCase())];
    const userAnswer = answer.toLowerCase().trim();
    
    let isCorrect = false;
    for (const correct of correctAnswers) {
        if (userAnswer === correct || userAnswer.includes(correct) || correct.includes(userAnswer)) {
            isCorrect = true;
            break;
        }
    }
    
    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer();
    }
}

function handleCorrectAnswer() {
    gameActive = false;
    score += 10;
    streak++;
    
    // Обновляем UI
    updateScore();
    updateStreak();
    
    // Подсвечиваем правильный ответ
    const answerOptions = document.querySelectorAll('.answer-option');
    const currentMeme = memes[currentMemeIndex];
    
    answerOptions.forEach(option => {
        if (option.dataset.answer.toLowerCase() === currentMeme.name.toLowerCase()) {
            option.classList.add('correct');
        }
    });
    
    // Показываем результат
    showResult(true, currentMeme.name);
    
    // Бонус за серию
    if (streak % 3 === 0) {
        setTimeout(() => {
            showBonusPopup(`🔥 СЕРИЯ ${streak}!`);
        }, 800);
    }
    
    // Переход к следующему мему через 2 секунды
    setTimeout(() => {
        nextMeme();
    }, 2000);
    
    console.log(`✅ Правильно! +10 очков`);
}

function handleWrongAnswer() {
    gameActive = false;
    streak = 0;
    
    // Обновляем UI
    updateStreak();
    
    // Подсвечиваем правильный и неправильный ответы
    const answerOptions = document.querySelectorAll('.answer-option');
    const currentMeme = memes[currentMemeIndex];
    
    answerOptions.forEach(option => {
        const optionText = option.dataset.answer.toLowerCase();
        if (optionText === currentMeme.name.toLowerCase()) {
            option.classList.add('correct');
        } else {
            option.classList.add('wrong');
        }
    });
    
    // Показываем результат
    showResult(false, currentMeme.name);
    
    // Переход к следующему мему через 3 секунды
    setTimeout(() => {
        nextMeme();
    }, 3000);
    
    console.log(`❌ Неправильно!`);
}

function showResult(isCorrect, correctAnswer) {
    const resultOverlay = getElement('result-overlay');
    if (!resultOverlay) return;
    
    resultOverlay.innerHTML = '';
    
    if (isCorrect) {
        resultOverlay.classList.add('correct-overlay');
        resultOverlay.innerHTML = `
            <div class="result-message">✅</div>
            <div class="result-text">ПРАВИЛЬНО!</div>
        `;
    } else {
        resultOverlay.classList.add('wrong-overlay');
        resultOverlay.innerHTML = `
            <div class="result-message">❌</div>
            <div class="result-text">${correctAnswer}</div>
        `;
    }
    
    resultOverlay.classList.remove('hidden');
}

function showBonusPopup(message) {
    const resultOverlay = getElement('result-overlay');
    if (!resultOverlay) return;
    
    const bonusDiv = document.createElement('div');
    bonusDiv.style.cssText = `
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        padding: 20px 30px;
        border-radius: 20px;
        font-size: 28px;
        font-weight: 800;
        color: #FFD700;
        text-align: center;
        border: 3px solid #FFD700;
        box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
        z-index: 100;
    `;
    bonusDiv.textContent = message;
    
    resultOverlay.appendChild(bonusDiv);
    
    setTimeout(() => {
        bonusDiv.remove();
    }, 1500);
}

function nextMeme() {
    gameActive = true;
    currentMemeIndex = (currentMemeIndex + 1) % memes.length;
    loadCurrentMeme();
}

function updateScore() {
    const scoreValue = getElement('score-value');
    if (scoreValue) {
        scoreValue.textContent = score;
    }
}

function updateStreak() {
    const streakValue = getElement('streak-value');
    if (streakValue) {
        streakValue.textContent = streak;
    }
}

// ======================
// ГОЛОСОВОЕ УПРАВЛЕНИЕ
// ======================

function startVoiceRecognition() {
    if (!gameActive || isListening) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Ваш браузер не поддерживает голосовой ввод. Используйте Chrome или Safari.");
        return;
    }
    
    recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
        isListening = true;
        
        // Анимация кнопки микрофона
        const micButton = getElement('mic-button');
        if (micButton) {
            micButton.classList.add('listening');
        }
        
        // Обновляем подсказку
        const voiceHint = getElement('voice-hint');
        if (voiceHint) {
            voiceHint.textContent = "🎤 Слушаю... Говори!";
            voiceHint.style.color = "#FF0066";
        }
    };
    
    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        console.log("🎤 Распознано:", spokenText);
        
        // Обновляем подсказку
        const voiceHint = getElement('voice-hint');
        if (voiceHint) {
            voiceHint.textContent = `Вы сказали: "${spokenText}"`;
        }
        
        checkAnswer(spokenText);
    };
    
    recognition.onerror = (event) => {
        console.log("❌ Ошибка распознавания:", event.error);
        isListening = false;
        
        // Сбрасываем кнопку микрофона
        const micButton = getElement('mic-button');
        if (micButton) {
            micButton.classList.remove('listening');
        }
        
        // Обновляем подсказку
        const voiceHint = getElement('voice-hint');
        if (voiceHint) {
            voiceHint.textContent = "Не удалось распознать речь. Попробуй еще раз!";
            voiceHint.style.color = "#FF3300";
            
            setTimeout(() => {
                if (voiceHint) {
                    voiceHint.textContent = "Нажми и назови мем вслух";
                    voiceHint.style.color = "rgba(255, 255, 255, 0.7)";
                }
            }, 2000);
        }
    };
    
    recognition.onend = () => {
        isListening = false;
        
        // Сбрасываем кнопку микрофона
        const micButton = getElement('mic-button');
        if (micButton) {
            micButton.classList.remove('listening');
        }
    };
    
    recognition.start();
}

// ======================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ======================

document.addEventListener('DOMContentLoaded', function() {
    // Загрузка игры
    setTimeout(loadGame, 1500);
    
    // Кнопка включения камеры
    const toggleCameraBtn = getElement('toggle-camera');
    if (toggleCameraBtn) {
        toggleCameraBtn.addEventListener('click', async function() {
            const success = await startCamera();
            if (!success) {
                this.innerHTML = '<i class="fas fa-video"></i> ОШИБКА КАМЕРЫ';
                this.style.background = 'rgba(231, 76, 60, 0.2)';
                this.style.borderColor = '#E74C3C';
                this.style.color = '#E74C3C';
            }
        });
    }
    
    // Кнопка старта игры
    const startBtn = getElement('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }
    
    // Кнопка микрофона
    const micButton = getElement('mic-button');
    if (micButton) {
        micButton.addEventListener('click', startVoiceRecognition);
    }
    
    // Переключатель камеры в игре
    const cameraSwitch = getElement('camera-switch');
    if (cameraSwitch) {
        cameraSwitch.addEventListener('click', async function() {
            if (isCameraOn) {
                stopCamera();
                this.innerHTML = '<i class="fas fa-video"></i>';
            } else {
                const success = await startCamera();
                if (success) {
                    this.innerHTML = '<i class="fas fa-video-slash"></i>';
                }
            }
        });
    }
    
    // Кнопка пропуска
    const skipBtn = getElement('skip-btn');
    if (skipBtn) {
        skipBtn.addEventListener('click', function() {
            if (gameActive) {
                nextMeme();
            }
        });
    }
    
    // Кнопка подсказки
    const hintBtn = getElement('hint-btn');
    if (hintBtn) {
        hintBtn.addEventListener('click', function() {
            if (!gameActive) return;
            
            const currentMeme = memes[currentMemeIndex];
            const memeHint = getElement('meme-hint');
            if (memeHint) {
                const firstWord = currentMeme.name.split(' ')[0];
                memeHint.textContent = `Подсказка: начинается на "${firstWord}..."`;
                memeHint.style.color = "#FFD700";
                
                setTimeout(() => {
                    if (memeHint) {
                        memeHint.textContent = "Выбери вариант ниже или назови голосом";
                        memeHint.style.color = "rgba(255, 255, 255, 0.6)";
                    }
                }, 3000);
            }
        });
    }
    
    // Кнопка рестарта
    const restartBtn = getElement('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            startGame();
        });
    }
    
    // Остановка камеры при закрытии
    window.addEventListener('beforeunload', stopCamera);
});

// Fallback для браузеров без SpeechRecognition
if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.log("⚠️ Speech Recognition не поддерживается");
    
    document.addEventListener('DOMContentLoaded', function() {
        const micButton = getElement('mic-button');
        if (micButton) {
            micButton.style.display = 'none';
        }
        
        const voiceHint = getElement('voice-hint');
        if (voiceHint) {
            voiceHint.textContent = "Выбери вариант ответа выше";
        }
    });
}
