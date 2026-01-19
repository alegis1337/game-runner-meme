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
        altNames: ["ох", "ух ты", "ого", "вау", "о как так"]
    },
    {
        id: 2,
        image: "memes/meme2.png", 
        name: "смерть в нищите",
        altNames: ["смерть", "бедность", "нищета", "умри в бедности", "бедный"]
    },
    {
        id: 3,
        image: "memes/meme3.png",
        name: "умный человек в очках",
        altNames: ["умный", "очки", "интеллектуал", "ученый", "профессор", "умняшка"]
    },
    {
        id: 4,
        image: "memes/meme4.png",
        name: "шлепа",
        altNames: ["большой шлепа", "шлёпа", "плюшевый", "игрушка", "медвежонок", "плюшевый мишка"]
    },
    {
        id: 5,
        image: "memes/meme5.png",
        name: "смайл фейс",
        altNames: ["фейс", "smile face", "улыбка", "смайлик", "улыбающееся лицо", "счастливый"]
    },
    {
        id: 6,
        image: "memes/meme6.jpg",
        name: "солнышко",
        altNames: ["любимая девочка", "милая", "девочка", "красивая", "прекрасная", "милашка"]
    }
];

// ======================
// ИГРОВЫЕ ПЕРЕМЕННЫЕ
// ======================

let currentMemeIndex = 0;
let score = 0;
let streak = 1;
let isCrashed = false;
let isGameRunning = false;
let roadSpeed = 3;
let gameLoopId = null;
let memeElements = [];
let laneMarkers = [];
let recognition = null;

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
                facingMode: 'user'
            },
            audio: false
        });
        
        cameraStream = stream;
        video.srcObject = stream;
        isCameraOn = true;
        
        console.log("✅ Камера включена!");
        return true;
        
    } catch (error) {
        console.log("❌ Ошибка камеры:", error);
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
// СОЗДАНИЕ ДОРОГИ И МЕМОВ
// ======================

function createRoad() {
    const roadContainer = getElement('road-container');
    if (!roadContainer) return;
    
    // Очищаем дорогу
    memeElements = [];
    laneMarkers = [];
    
    // Создаем дорожную разметку
    createLaneMarkers();
    
    // Создаем мемы на дороге
    createMemesOnRoad();
}

function createLaneMarkers() {
    const roadContainer = getElement('road-container');
    
    // Создаем несколько полос разметки
    for (let i = 0; i < 15; i++) {
        const laneMark = document.createElement('div');
        laneMark.className = 'lane-mark';
        
        // Позиционируем полосы на дороге
        const leftPosition = 20 + Math.random() * 60;
        laneMark.style.left = `${leftPosition}%`;
        
        // Начальная позиция (за экраном сверху)
        laneMark.style.top = `${-100 - i * 150}px`;
        
        roadContainer.appendChild(laneMark);
        laneMarkers.push(laneMark);
    }
}

function createMemesOnRoad() {
    const roadContainer = getElement('road-container');
    
    // Создаем только текущий мем
    const currentMeme = memes[currentMemeIndex];
    const memeElement = document.createElement('div');
    memeElement.className = 'meme-on-road current';
    memeElement.dataset.id = currentMeme.id;
    
    // Позиция по центру дороги
    memeElement.style.left = '50%';
    memeElement.style.transform = 'translateX(-50%)';
    memeElement.style.bottom = '180px'; // На дорожном полотне
    
    const img = document.createElement('img');
    img.src = currentMeme.image;
    img.alt = currentMeme.name;
    
    // Fallback если изображение не загрузится
    img.onerror = function() {
        console.log(`Ошибка загрузки: ${currentMeme.image}`);
        this.style.display = 'none';
        memeElement.style.background = getMemeColor(currentMeme.id);
        memeElement.style.display = 'flex';
        memeElement.style.alignItems = 'center';
        memeElement.style.justifyContent = 'center';
        memeElement.innerHTML = `<span style="font-size: 24px; font-weight: bold; color: white;">МЕМ ${currentMemeIndex + 1}</span>`;
    };
    
    memeElement.appendChild(img);
    roadContainer.appendChild(memeElement);
    memeElements.push(memeElement);
    
    console.log(`🚗 Мем "${currentMeme.name}" создан на дороге`);
}

function getMemeColor(id) {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
    return colors[(id - 1) % colors.length];
}

// ======================
// ДВИЖЕНИЕ ДОРОГИ
// ======================

function moveRoad() {
    if (!isGameRunning || isCrashed) return;
    
    // Двигаем полосы разметки
    laneMarkers.forEach(mark => {
        let currentTop = parseFloat(mark.style.top) || -100;
        currentTop += roadSpeed;
        mark.style.top = `${currentTop}px`;
        
        // Если полоса ушла за экран, перемещаем ее в начало
        if (currentTop > window.innerHeight) {
            mark.style.top = `${-100}px`;
            mark.style.left = `${20 + Math.random() * 60}%`;
        }
    });
    
    // Двигаем мемы на дороге
    memeElements.forEach(meme => {
        let currentBottom = parseFloat(meme.style.bottom) || 180;
        currentBottom += roadSpeed * 0.5; // Мемы двигаются медленнее разметки
        meme.style.bottom = `${currentBottom}px`;
        
        // Проверяем столкновение (мем слишком близко к низу экрана)
        if (currentBottom > 250 && meme.classList.contains('current')) {
            // Мем достиг точки столкновения
            if (!isCrashed) {
                handleCollision();
            }
        }
        
        // Если мем ушел за экран, удаляем его
        if (currentBottom > window.innerHeight + 100) {
            meme.remove();
            const index = memeElements.indexOf(meme);
            if (index > -1) {
                memeElements.splice(index, 1);
            }
        }
    });
}

function handleCollision() {
    if (isCrashed) return;
    
    isCrashed = true;
    isGameRunning = false;
    
    // Показываем эффект столкновения
    const crashEffect = getElement('crash-effect');
    if (crashEffect) {
        crashEffect.classList.remove('hidden');
        
        // Убираем эффект через 1 секунду
        setTimeout(() => {
            crashEffect.classList.add('hidden');
            
            // Показываем экран рестарта
            showCrashScreen();
        }, 1000);
    }
    
    // Останавливаем движение
    stopGameLoop();
    
    console.log("💥 СТОЛКНОВЕНИЕ!");
}

function showCrashScreen() {
    const crashScreen = getElement('crash-screen');
    const correctMemeName = getElement('correct-meme-name');
    const currentMeme = memes[currentMemeIndex];
    
    if (crashScreen && correctMemeName) {
        correctMemeName.textContent = `Правильно: "${currentMeme.name}"`;
        crashScreen.classList.remove('hidden');
    }
}

// ======================
// ИГРОВАЯ ЛОГИКА
// ======================

function startVoiceRecognition() {
    if (isCrashed || !isGameRunning) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Ваш браузер не поддерживает голосовое управление.");
        return;
    }
    
    recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
        const hint = getElement('hint');
        if (hint) {
            hint.textContent = "🎤 Слушаю... Говори!";
            hint.style.color = "#FFD166";
        }
        
        // Анимация кнопки
        const micBtn = getElement('mic-btn');
        if (micBtn) {
            micBtn.style.animation = "pulse 0.5s infinite alternate";
        }
    };
    
    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase().trim();
        console.log("🎤 Вы сказали:", spokenText);
        checkAnswer(spokenText);
    };
    
    recognition.onerror = (event) => {
        console.log("❌ Ошибка распознавания:", event.error);
        const hint = getElement('hint');
        if (hint) {
            hint.textContent = "Не слышу тебя. Попробуй еще раз!";
            hint.style.color = "#FF6B6B";
        }
        
        // Сбрасываем анимацию кнопки
        const micBtn = getElement('mic-btn');
        if (micBtn) {
            micBtn.style.animation = "";
        }
        
        setTimeout(() => {
            if (hint) {
                hint.textContent = "Нажми и скажи название мема вслух";
                hint.style.color = "#aaa";
            }
        }, 2000);
    };
    
    recognition.onend = () => {
        recognition = null;
        
        // Сбрасываем анимацию кнопки
        const micBtn = getElement('mic-btn');
        if (micBtn) {
            micBtn.style.animation = "";
        }
    };
    
    recognition.start();
}

function checkAnswer(spokenText) {
    const currentMeme = memes[currentMemeIndex];
    const correctAnswers = [currentMeme.name.toLowerCase(), ...currentMeme.altNames.map(n => n.toLowerCase())];
    
    console.log("🔍 Проверяем:", spokenText);
    console.log("✅ Варианты:", correctAnswers);
    
    let isCorrect = false;
    for (const answer of correctAnswers) {
        const cleanAnswer = answer.trim();
        const cleanSpoken = spokenText.trim();
        
        if (cleanSpoken === cleanAnswer || 
            cleanSpoken.includes(cleanAnswer) || 
            cleanAnswer.includes(cleanSpoken)) {
            isCorrect = true;
            break;
        }
    }
    
    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        // Неправильный ответ, но не сразу врезаемся
        const hint = getElement('hint');
        if (hint) {
            hint.textContent = "❌ Неправильно! Попробуй еще раз";
            hint.style.color = "#FF6B6B";
        }
    }
}

function handleCorrectAnswer() {
    // Увеличиваем счет
    score++;
    streak++;
    
    // Обновляем UI
    const scoreElement = getElement('score');
    const streakElement = getElement('streak');
    if (scoreElement) scoreElement.textContent = score;
    if (streakElement) streakElement.textContent = streak;
    
    // Показываем подсказку
    const hint = getElement('hint');
    if (hint) {
        hint.textContent = `✅ Правильно! ${memes[currentMemeIndex].name}`;
        hint.style.color = "#4ECDC4";
    }
    
    // Убираем текущий мем с дороги
    const currentMemeElement = document.querySelector('.meme-on-road.current');
    if (currentMemeElement) {
        currentMemeElement.classList.remove('current');
        currentMemeElement.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
        currentMemeElement.style.transform = 'translateX(-50%) scale(0.8)';
        currentMemeElement.style.opacity = '0';
        
        // Удаляем через анимацию
        setTimeout(() => {
            currentMemeElement.remove();
            const index = memeElements.indexOf(currentMemeElement);
            if (index > -1) {
                memeElements.splice(index, 1);
            }
        }, 500);
    }
    
    // Увеличиваем скорость после 3 правильных ответов подряд
    if (streak % 3 === 0) {
        roadSpeed = Math.min(roadSpeed + 1, 8);
        showBonus(`🔥 СЕРИЯ ${streak}! +Скорость!`);
    }
    
    // Переходим к следующему мему через 1 секунду
    setTimeout(() => {
        // Переход к следующему мему
        currentMemeIndex = (currentMemeIndex + 1) % memes.length;
        
        // Создаем новый мем на дороге
        createMemesOnRoad();
        
        // Сбрасываем подсказку
        if (hint) {
            hint.textContent = "Нажми и скажи название мема вслух";
            hint.style.color = "#aaa";
        }
        
        // Увеличиваем скорость дороги
        roadSpeed = Math.min(roadSpeed + 0.2, 10);
    }, 1000);
}

function showBonus(message) {
    const bonusPopup = getElement('bonus-popup');
    if (bonusPopup) {
        bonusPopup.textContent = message;
        bonusPopup.classList.remove('hidden');
        
        setTimeout(() => {
            bonusPopup.classList.add('hidden');
        }, 1500);
    }
}

// ======================
// ИГРОВОЙ ЦИКЛ
// ======================

function gameLoop() {
    moveRoad();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function startGameLoop() {
    if (!gameLoopId) {
        isGameRunning = true;
        gameLoop();
    }
}

function stopGameLoop() {
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
        isGameRunning = false;
    }
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
                this.style.background = '#4ECDC4';
                this.style.border = 'none';
            }
        });
    }
    
    // Кнопка старта игры
    const startBtn = getElement('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            const startScreen = getElement('start-screen');
            const gameScreen = getElement('game-screen');
            
            if (startScreen) startScreen.classList.add('hidden');
            if (gameScreen) gameScreen.classList.remove('hidden');
            
            // Сбрасываем игру
            score = 0;
            streak = 1;
            currentMemeIndex = 0;
            roadSpeed = 3;
            isCrashed = false;
            
            // Обновляем UI
            const scoreElement = getElement('score');
            const streakElement = getElement('streak');
            if (scoreElement) scoreElement.textContent = score;
            if (streakElement) streakElement.textContent = streak;
            
            // Создаем дорогу и начинаем игру
            createRoad();
            stopGameLoop();
            startGameLoop();
        });
    }
    
    // Кнопка микрофона
    const micBtn = getElement('mic-btn');
    if (micBtn) {
        micBtn.addEventListener('click', function() {
            if (isCrashed || !isGameRunning) return;
            startVoiceRecognition();
        });
    }
    
    // Кнопка рестарта после столкновения
    const restartBtn = getElement('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            const crashScreen = getElement('crash-screen');
            if (crashScreen) crashScreen.classList.add('hidden');
            
            // Сбрасываем состояние столкновения
            isCrashed = false;
            
            // Удаляем старые мемы
            memeElements.forEach(meme => meme.remove());
            memeElements = [];
            
            // Создаем текущий мем заново
            createMemesOnRoad();
            
            // Продолжаем игру
            startGameLoop();
        });
    }
    
    // Переключатель камеры в игре
    const cameraToggleBtn = getElement('camera-toggle');
    if (cameraToggleBtn) {
        cameraToggleBtn.addEventListener('click', async function() {
            if (isCameraOn) {
                stopCamera();
                this.innerHTML = '<i class="fas fa-video"></i>';
                this.style.background = 'rgba(255, 255, 255, 0.15)';
            } else {
                const success = await startCamera();
                if (success) {
                    this.innerHTML = '<i class="fas fa-video-slash"></i>';
                    this.style.background = '#4ECDC4';
                }
            }
        });
    }
    
    // Остановка при закрытии
    window.addEventListener('beforeunload', function() {
        stopCamera();
        stopGameLoop();
    });
    
    console.log("🎮 Meme Road загружен!");
});

// Fallback для голосового ввода
if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.log("⚠️ Speech Recognition не поддерживается");
    
    document.addEventListener('DOMContentLoaded', function() {
        const micContainer = document.querySelector('.mic-container');
        if (micContainer) {
            // Создаем текстовый ввод
            const inputContainer = document.createElement('div');
            inputContainer.style.cssText = `
                width: 100%;
                max-width: 320px;
                margin-bottom: 15px;
            `;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Введи название мема';
            input.style.cssText = `
                width: 100%;
                padding: 15px 20px;
                border-radius: 25px;
                border: 2px solid #FFD166;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                font-size: 16px;
                text-align: center;
                outline: none;
            `;
            
            const submitBtn = document.createElement('button');
            submitBtn.textContent = 'ПРОВЕРИТЬ';
            submitBtn.style.cssText = `
                width: 100%;
                padding: 12px;
                border-radius: 25px;
                border: none;
                background: linear-gradient(45deg, #4ECDC4, #06D6A0);
                color: white;
                font-size: 16px;
                font-weight: 600;
                margin-top: 10px;
                cursor: pointer;
            `;
            
            submitBtn.addEventListener('click', function() {
                if (input.value.trim() && !isCrashed && isGameRunning) {
                    checkAnswer(input.value.toLowerCase());
                    input.value = '';
                }
            });
            
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !isCrashed && isGameRunning) {
                    if (input.value.trim()) {
                        checkAnswer(input.value.toLowerCase());
                        input.value = '';
                    }
                }
            });
            
            inputContainer.appendChild(input);
            inputContainer.appendChild(submitBtn);
            micContainer.insertBefore(inputContainer, micContainer.firstChild);
        }
    });
}
