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
        image: "meme1",
        name: "о как",
        altNames: ["ох", "ух ты"]
    },
    {
        id: 2,
        image: "meme2",
        name: "смерть в нищите",
        altNames: ["смерть", "бедность", "нищета"]
    },
    {
        id: 3,
        image: "meme3",
        name: "умный человек в очках",
        altNames: ["умный", "очки", "интеллектуал"]
    },
    {
        id: 4,
        image: "meme4",
        name: "шлепа",
        altNames: ["большой шлепа", "шлёпа", "плюшевый"]
    },
    {
        id: 5,
        image: "meme5",
        name: "смайл фейс",
        altNames: ["фейс", "smile face", "улыбка"]
    },
    {
        id: 6,
        image: "meme6",
        name: "солнышко",
        altNames: ["любимая девочка", "милая", "девочка"]
    }
];

// ======================
// ИГРОВЫЕ ПЕРЕМЕННЫЕ
// ======================

let currentMemeIndex = 0;
let score = 0; // Дистанция в метрах
let speed = 1; // Множитель скорости
let isRunning = true;
let isCrashed = false;
let trackPosition = 0;
let passedMemes = 0;
let recognition = null;
let gameLoopId = null;

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
        console.log("Включаю камеру...");
        const videoElement = getElement('camera-video');
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false
        });
        
        cameraStream = stream;
        if (videoElement) videoElement.srcObject = stream;
        
        isCameraOn = true;
        if (videoElement) videoElement.classList.add('camera-active');
        
        console.log("Камера включена!");
        return true;
        
    } catch (error) {
        console.log("Ошибка камеры:", error);
        alert("Не удалось включить камеру. Разрешите доступ к камере для лучшего игрового опыта.");
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
// ФУНКЦИИ ДОРОЖКИ
// ======================

function createTrack() {
    const track = getElement('track');
    if (!track) return;
    
    track.innerHTML = '';
    
    // Создаем дорожку с мемами (3 раза для бесконечности)
    for (let i = 0; i < 3; i++) {
        memes.forEach((meme, index) => {
            const memeElement = document.createElement('div');
            memeElement.className = 'meme-on-track';
            memeElement.dataset.index = index;
            
            const img = document.createElement('img');
            img.src = meme.image;
            img.alt = `Мем ${index + 1}`;
            
            memeElement.appendChild(img);
            track.appendChild(memeElement);
        });
    }
    
    // Устанавливаем текущий мем как активный
    setCurrentMemeActive();
}

function setCurrentMemeActive() {
    const memeElements = document.querySelectorAll('.meme-on-track');
    memeElements.forEach((el, index) => {
        el.classList.remove('current', 'passed', 'crashed');
        
        // Находим текущий мем в дорожке (первое вхождение)
        const memeIndex = parseInt(el.dataset.index);
        if (memeIndex === currentMemeIndex && index < memes.length) {
            el.classList.add('current');
        } else if (memeIndex < currentMemeIndex) {
            el.classList.add('passed');
        }
    });
}

function moveTrack() {
    if (isCrashed) return;
    
    const track = getElement('track');
    const runner = getElement('runner');
    
    if (!track || !runner) return;
    
    // Двигаем дорожку (чем выше скорость, тем быстрее)
    trackPosition += 2 * speed;
    track.style.transform = `translateX(-${trackPosition}px)`;
    
    // Если прошли 200px, увеличиваем дистанцию
    if (trackPosition % 200 === 0) {
        score += 1;
        const scoreElement = getElement('score');
        if (scoreElement) scoreElement.textContent = score;
    }
    
    // Сброс позиции дорожки для бесконечности
    if (trackPosition >= 600) {
        trackPosition = 0;
    }
    
    // Анимация бегуна
    runner.classList.add('running');
}

// ======================
// ИГРОВАЯ ЛОГИКА
// ======================

function showCurrentMeme() {
    const meme = memes[currentMemeIndex];
    const memeImage = getElement('current-meme-image');
    const memeName = getElement('meme-name');
    const hintElement = getElement('hint');
    
    if (memeImage) {
        memeImage.src = meme.image;
        memeImage.alt = meme.name;
    }
    if (memeName) {
        memeName.textContent = '';
        memeName.classList.add('hidden');
    }
    if (hintElement) {
        hintElement.textContent = "Скажи название мема";
        hintElement.style.color = "rgba(255, 255, 255, 0.7)";
    }
    
    // Обновляем дорожку
    setCurrentMemeActive();
}

function startVoiceRecording() {
    if (isCrashed) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Ваш браузер не поддерживает распознавание речи. Используйте Chrome или Safari.");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        const hintElement = getElement('hint');
        if (hintElement) hintElement.textContent = "🎤 Говори сейчас...";
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        console.log("Распознано:", spokenText);
        checkAnswer(spokenText);
    };

    recognition.onerror = (event) => {
        console.log("Ошибка распознавания:", event.error);
        const hintElement = getElement('hint');
        if (hintElement) hintElement.textContent = "Ошибка микрофона. Попробуй еще раз.";
    };

    recognition.onend = () => {
        recognition = null;
    };

    try {
        recognition.start();
    } catch (error) {
        console.log("Ошибка запуска распознавания:", error);
        const hintElement = getElement('hint');
        if (hintElement) hintElement.textContent = "Нажми 'Говорить' еще раз";
    }
}

function checkAnswer(spokenText) {
    const meme = memes[currentMemeIndex];
    const correctAnswers = [meme.name.toLowerCase(), ...meme.altNames.map(n => n.toLowerCase())];
    
    console.log("Проверяем ответ:", spokenText);
    console.log("Правильные варианты:", correctAnswers);
    
    let isCorrect = false;
    for (const correct of correctAnswers) {
        if (correct && spokenText.includes(correct)) {
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
    const memeName = getElement('meme-name');
    const hintElement = getElement('hint');
    
    if (memeName) {
        memeName.textContent = `✅ Правильно!`;
        memeName.classList.remove('hidden');
        memeName.style.color = "#4CAF50";
    }
    
    if (hintElement) {
        hintElement.textContent = "Отлично! Бежим дальше!";
        hintElement.style.color = "#4CAF50";
    }
    
    // Увеличиваем скорость после каждого 3-го мема
    passedMemes++;
    if (passedMemes % 3 === 0) {
        speed = Math.min(speed + 0.2, 3);
        const streakElement = getElement('streak');
        if (streakElement) {
            streakElement.textContent = speed.toFixed(1);
            streakElement.style.animation = "streakGlow 1s";
            setTimeout(() => {
                streakElement.style.animation = "";
            }, 1000);
        }
        
        if (passedMemes % 6 === 0) {
            showConfetti();
        }
    }
    
    // Переход к следующему мему
    setTimeout(() => {
        currentMemeIndex = (currentMemeIndex + 1) % memes.length;
        showCurrentMeme();
        isCrashed = false;
        
        // Убираем эффект столкновения
        const crashEffect = getElement('crash-effect');
        if (crashEffect) crashEffect.classList.add('hidden');
        
        // Запускаем бег снова
        const runner = getElement('runner');
        if (runner) runner.classList.remove('crashed');
        
        // Убираем эффект столкновения с мема
        const crashedMeme = document.querySelector('.meme-on-track.crashed');
        if (crashedMeme) crashedMeme.classList.remove('crashed');
    }, 1500);
}

function handleWrongAnswer() {
    isCrashed = true;
    
    const memeName = getElement('meme-name');
    const hintElement = getElement('hint');
    const crashEffect = getElement('crash-effect');
    const runner = getElement('runner');
    
    if (memeName) {
        memeName.textContent = `❌ Неправильно! Правильно: ${memes[currentMemeIndex].name}`;
        memeName.classList.remove('hidden');
        memeName.style.color = "#E94057";
    }
    
    if (hintElement) {
        hintElement.textContent = "💥 Столкновение! Попробуй еще раз";
        hintElement.style.color = "#E94057";
    }
    
    if (crashEffect) {
        crashEffect.classList.remove('hidden');
    }
    
    if (runner) {
        runner.classList.remove('running');
        runner.classList.add('crashed');
    }
    
    // Подсветка мема, в который врезались
    const currentMemeElement = document.querySelector('.meme-on-track.current');
    if (currentMemeElement) {
        currentMemeElement.classList.add('crashed');
    }
    
    // Сбрасываем скорость при столкновении
    speed = Math.max(1, speed - 0.3);
    const streakElement = getElement('streak');
    if (streakElement) streakElement.textContent = speed.toFixed(1);
}

function nextMeme() {
    if (isCrashed) return;
    
    currentMemeIndex = (currentMemeIndex + 1) % memes.length;
    showCurrentMeme();
}

function showConfetti() {
    const canvas = getElement('confetti-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    score += 10; // Бонус за серию
    const scoreElement = getElement('score');
    if (scoreElement) {
        scoreElement.textContent = score;
        scoreElement.style.animation = "streakGlow 1s";
        setTimeout(() => {
            scoreElement.style.animation = "";
        }, 1000);
    }
    
    const particles = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
    
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4,
            speed: Math.random() * 3 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        });
    }
    
    let animationId;
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let p of particles) {
            ctx.save();
            ctx.translate(p.x + p.size / 2, p.y + p.size / 2);
            ctx.rotate(p.rotation * Math.PI / 180);
            
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            
            ctx.restore();
            
            p.y += p.speed;
            p.rotation += p.rotationSpeed;
            
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

function gameLoop() {
    if (!isCrashed) {
        moveTrack();
    }
    gameLoopId = requestAnimationFrame(gameLoop);
}

function stopGameLoop() {
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
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
            
            createTrack();
            showCurrentMeme();
            stopGameLoop();
            gameLoop();
        });
    }
    
    // Голосовая кнопка
    const speakBtn = getElement('speak-btn');
    if (speakBtn) {
        speakBtn.addEventListener('click', function() {
            this.classList.add('recording');
            startVoiceRecording();
            
            setTimeout(() => {
                this.classList.remove('recording');
            }, 1500);
        });
    }
    
    // Кнопка пропуска
    const skipBtn = getElement('skip-btn');
    if (skipBtn) skipBtn.addEventListener('click', nextMeme);
    
    // Кнопка подсказки
    const hintBtn = getElement('hint-btn');
    if (hintBtn) {
        hintBtn.addEventListener('click', function() {
            const meme = memes[currentMemeIndex];
            const hintElement = getElement('hint');
            if (hintElement) {
                hintElement.textContent = `💡 Подсказка: "${meme.name.split(' ')[0]}"...`;
                hintElement.style.color = "#FFD700";
                setTimeout(() => {
                    if (hintElement) {
                        hintElement.textContent = "Скажи название мема";
                        hintElement.style.color = "rgba(255, 255, 255, 0.7)";
                    }
                }, 3000);
            }
        });
    }
    
    // Кнопка перезапуска
    const restartBtn = getElement('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            score = 0;
            speed = 1;
            currentMemeIndex = 0;
            passedMemes = 0;
            isCrashed = false;
            trackPosition = 0;
            
            const scoreElement = getElement('score');
            const streakElement = getElement('streak');
            const crashEffect = getElement('crash-effect');
            const runner = getElement('runner');
            const hintElement = getElement('hint');
            
            if (scoreElement) scoreElement.textContent = score;
            if (streakElement) streakElement.textContent = speed;
            if (crashEffect) crashEffect.classList.add('hidden');
            if (runner) runner.classList.remove('crashed');
            if (hintElement) {
                hintElement.textContent = "Скажи название мема";
                hintElement.style.color = "rgba(255, 255, 255, 0.7)";
            }
            
            createTrack();
            showCurrentMeme();
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
    window.addEventListener('beforeunload', function() {
        stopCamera();
        stopGameLoop();
    });
    
    // Адаптация к изменению размера окна
    window.addEventListener('resize', function() {
        const canvas = getElement('confetti-canvas');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });
    
    console.log("🎮 Meme Runner загружен! Готов к запуску!");
});

