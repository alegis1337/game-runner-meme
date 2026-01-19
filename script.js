// ======================
// НАСТРОЙКА КАМЕРЫ
// ======================

let cameraStream = null;
let isCameraOn = false;

// ======================
// НАСТРОЙКА МЕМОВ (ваши файлы из папки memes)
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
let score = 0; // Счет правильных ответов
let streak = 1; // Множитель скорости/серии
let isCrashed = false;
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
        alert("Разрешите доступ к камере для AR-эффекта!");
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

function loadMemeImages() {
    const currentMeme = memes[currentMemeIndex];
    const prevMeme = memes[(currentMemeIndex - 1 + memes.length) % memes.length];
    const nextMeme = memes[(currentMemeIndex + 1) % memes.length];
    
    // Устанавливаем центральный мем
    const currentImg = getElement('current-meme-img');
    if (currentImg) {
        currentImg.src = currentMeme.image;
        currentImg.alt = currentMeme.name;
    }
    
    // Устанавливаем левый мем (предыдущий)
    const leftMeme = getElement('left-meme');
    if (leftMeme) {
        const leftImg = leftMeme.querySelector('img');
        if (leftImg) {
            leftImg.src = prevMeme.image;
            leftImg.alt = prevMeme.name;
        }
    }
    
    // Устанавливаем правый мем (следующий)
    const rightMeme = getElement('right-meme');
    if (rightMeme) {
        const rightImg = rightMeme.querySelector('img');
        if (rightImg) {
            rightImg.src = nextMeme.image;
            rightImg.alt = nextMeme.name;
        }
    }
    
    // Обновляем подсказку
    const hint = getElement('hint');
    if (hint) {
        hint.textContent = `Назови этот мем`;
        hint.style.color = "#aaa";
    }
    
    // Добавляем пульсацию к текущему мему
    const currentMemeElement = getElement('current-meme');
    if (currentMemeElement) {
        currentMemeElement.classList.add('pulse');
    }
}

function startVoiceRecognition() {
    if (isCrashed) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Ваш браузер не поддерживает голосовое управление. Используйте Chrome или Safari.");
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
        
        // Добавляем анимацию кнопке
        const micBtn = getElement('mic-btn');
        if (micBtn) {
            micBtn.style.background = "linear-gradient(45deg, #FFD166, #FF8E53)";
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
        
        // Возвращаем обычный цвет кнопки
        const micBtn = getElement('mic-btn');
        if (micBtn) {
            micBtn.style.background = "linear-gradient(45deg, #FF6B6B, #FF8E8E)";
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
        
        // Возвращаем обычный цвет кнопки
        const micBtn = getElement('mic-btn');
        if (micBtn) {
            micBtn.style.background = "linear-gradient(45deg, #FF6B6B, #FF8E8E)";
        }
    };
    
    recognition.start();
}

function checkAnswer(spokenText) {
    const currentMeme = memes[currentMemeIndex];
    const correctAnswers = [currentMeme.name.toLowerCase(), ...currentMeme.altNames.map(n => n.toLowerCase())];
    
    console.log("🔍 Проверяем ответ:", spokenText);
    console.log("✅ Правильные варианты:", correctAnswers);
    
    let isCorrect = false;
    for (const answer of correctAnswers) {
        // Убираем лишние пробелы и проверяем
        const cleanAnswer = answer.trim();
        const cleanSpoken = spokenText.trim();
        
        // Проверяем полное совпадение или частичное
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
        handleWrongAnswer();
    }
}

function handleCorrectAnswer() {
    isCrashed = false;
    score++;
    streak++;
    
    // Обновляем счет
    const scoreElement = getElement('score');
    if (scoreElement) scoreElement.textContent = score;
    
    // Обновляем множитель
    const streakElement = getElement('streak');
    if (streakElement) streakElement.textContent = streak;
    
    // Показываем эффект правильного ответа
    const correctEffect = getElement('correct-effect');
    if (correctEffect) {
        correctEffect.classList.remove('hidden');
        setTimeout(() => {
            correctEffect.classList.add('hidden');
        }, 500);
    }
    
    // Показываем подсказку
    const hint = getElement('hint');
    if (hint) {
        hint.textContent = `✅ Правильно! ${memes[currentMemeIndex].name}`;
        hint.style.color = "#4ECDC4";
    }
    
    // Убираем блокировку
    const blockOverlay = getElement('block-overlay');
    if (blockOverlay) blockOverlay.classList.add('hidden');
    
    // Показываем бонус за серию
    if (streak % 3 === 0) {
        showBonus(`🔥 СЕРИЯ ${streak}!`);
    }
    
    // Через 1.5 секунды переходим к следующему мему
    setTimeout(() => {
        // Переходим к следующему мему
        currentMemeIndex = (currentMemeIndex + 1) % memes.length;
        loadMemeImages();
        
        // Сбрасываем подсказку
        if (hint) {
            hint.textContent = "Нажми и скажи название мема вслух";
            hint.style.color = "#aaa";
        }
    }, 1500);
}

function handleWrongAnswer() {
    isCrashed = true;
    streak = 1; // Сбрасываем серию
    
    // Обновляем множитель
    const streakElement = getElement('streak');
    if (streakElement) streakElement.textContent = streak;
    
    // Показываем подсказку
    const hint = getElement('hint');
    if (hint) {
        hint.textContent = `💥 Неправильно! Попробуй еще раз: ${memes[currentMemeIndex].name}`;
        hint.style.color = "#FF6B6B";
    }
    
    // Показываем эффект столкновения
    const crashEffect = getElement('crash-effect');
    if (crashEffect) {
        crashEffect.classList.remove('hidden');
    }
    
    // Блокируем кнопку
    const blockOverlay = getElement('block-overlay');
    if (blockOverlay) {
        blockOverlay.classList.remove('hidden');
    }
    
    // Убираем пульсацию с мема
    const currentMemeElement = getElement('current-meme');
    if (currentMemeElement) {
        currentMemeElement.classList.remove('pulse');
    }
    
    // Через 2 секунды убираем эффект столкновения
    setTimeout(() => {
        if (crashEffect) {
            crashEffect.classList.add('hidden');
        }
        
        // Восстанавливаем пульсацию
        if (currentMemeElement) {
            currentMemeElement.classList.add('pulse');
        }
        
        // Через еще 1 секунду разблокируем
        setTimeout(() => {
            isCrashed = false;
            
            if (blockOverlay) {
                blockOverlay.classList.add('hidden');
            }
            
            if (hint) {
                hint.textContent = "Попробуй еще раз назвать мем";
                hint.style.color = "#FFD166";
            }
        }, 1000);
    }, 2000);
}

function showBonus(message) {
    const bonusPopup = getElement('bonus-popup');
    if (bonusPopup) {
        bonusPopup.textContent = message;
        bonusPopup.classList.remove('hidden');
        
        setTimeout(() => {
            bonusPopup.classList.add('hidden');
        }, 2000);
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
            
            // Загружаем первый мем
            loadMemeImages();
        });
    }
    
    // Кнопка микрофона
    const micBtn = getElement('mic-btn');
    if (micBtn) {
        micBtn.addEventListener('click', function() {
            if (isCrashed) return;
            startVoiceRecognition();
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
    
    // Двойной тап для подсказки
    let lastTap = 0;
    document.addEventListener('touchend', function(event) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
            // Двойной тап - показываем подсказку
            const hint = getElement('hint');
            if (hint && !isCrashed) {
                const currentMeme = memes[currentMemeIndex];
                hint.textContent = `💡 Подсказка: "${currentMeme.name}"`;
                hint.style.color = "#FFD166";
                
                setTimeout(() => {
                    if (hint) {
                        hint.textContent = "Нажми и скажи название мема вслух";
                        hint.style.color = "#aaa";
                    }
                }, 3000);
            }
        }
        
        lastTap = currentTime;
    });
    
    // Остановка камеры при закрытии
    window.addEventListener('beforeunload', function() {
        stopCamera();
    });
    
    console.log("🎮 Meme Road загружен!");
    
    // Пытаемся автоматически включить камеру если уже было разрешение
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => {
                // Пользователь уже разрешил камеру
                startCamera().then(success => {
                    if (success) {
                        const toggleBtn = getElement('toggle-camera');
                        if (toggleBtn) {
                            toggleBtn.innerHTML = '<i class="fas fa-video-slash"></i> КАМЕРА ВКЛЮЧЕНА';
                            toggleBtn.style.background = '#4ECDC4';
                            toggleBtn.style.border = 'none';
                        }
                    }
                });
            })
            .catch(() => {
                // Камера не разрешена, ничего не делаем
            });
    }
});

// Fallback для браузеров без поддержки SpeechRecognition
if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.log("⚠️ Speech Recognition не поддерживается");
    
    document.addEventListener('DOMContentLoaded', function() {
        const micContainer = document.querySelector('.mic-container');
        if (micContainer) {
            // Создаем текстовое поле для ввода
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
                if (input.value.trim()) {
                    checkAnswer(input.value.toLowerCase());
                    input.value = '';
                }
            });
            
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    if (input.value.trim()) {
                        checkAnswer(input.value.toLowerCase());
                        input.value = '';
                    }
                }
            });
            
            inputContainer.appendChild(input);
            inputContainer.appendChild(submitBtn);
            micContainer.insertBefore(inputContainer, micContainer.firstChild);
            
            // Обновляем подсказку
            const hint = getElement('hint');
            if (hint) {
                hint.textContent = "Введи название мема в поле выше";
            }
        }
    });
}
