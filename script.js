// ======================
// НАСТРОЙКА КАМЕРЫ
// ======================

let cameraStream = null;
let isCameraOn = false;

// ======================
// НАСТРОЙКА МЕМОВ (используем ваши файлы из папки memes)
// ======================

const memes = [
    {
        id: 1,
        image: "memes/meme1.png",
        name: "о как",
        altNames: ["ох", "ух ты", "ого", "вау"]
    },
    {
        id: 2,
        image: "memes/meme2.png", 
        name: "смерть в нищите",
        altNames: ["смерть", "бедность", "нищета", "умри в бедности"]
    },
    {
        id: 3,
        image: "memes/meme3.png",
        name: "умный человек в очках",
        altNames: ["умный", "очки", "интеллектуал", "ученый", "профессор"]
    },
    {
        id: 4,
        image: "memes/meme4.png",
        name: "шлепа",
        altNames: ["большой шлепа", "шлёпа", "плюшевый", "игрушка", "медвежонок"]
    },
    {
        id: 5,
        image: "memes/meme5.png",
        name: "смайл фейс",
        altNames: ["фейс", "smile face", "улыбка", "смайлик", "улыбающееся лицо"]
    },
    {
        id: 6,
        image: "memes/meme6.jpg",
        name: "солнышко",
        altNames: ["любимая девочка", "милая", "девочка", "красивая", "прекрасная"]
    }
];

// ======================
// ИГРОВЫЕ ПЕРЕМЕННЫЕ
// ======================

let currentMemeIndex = 0;
let distance = 0; // Пройденная дистанция
let speed = 1; // Множитель скорости
let streak = 0; // Серия правильных ответов
let isCrashed = false;
let gameLoopId = null;
let recognition = null;
let memeElements = [];
let roadMarkers = [];

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
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        });
        
        cameraStream = stream;
        video.srcObject = stream;
        isCameraOn = true;
        
        video.classList.add('camera-active');
        console.log("Камера включена!");
        return true;
        
    } catch (error) {
        console.log("Ошибка камеры:", error);
        alert("Разрешите доступ к камере для лучшего опыта!");
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
// ФУНКЦИИ ДОРОГИ
// ======================

function createRoad() {
    const road = getElement('road');
    if (!road) return;
    
    road.innerHTML = '<div class="road-line"></div>';
    memeElements = [];
    roadMarkers = [];
    
    // Создаем разметку дороги
    for (let i = 0; i < 20; i++) {
        const marker = document.createElement('div');
        marker.className = 'road-mark';
        marker.style.left = `${i * 200}px`;
        road.appendChild(marker);
        roadMarkers.push(marker);
    }
    
    // Создаем мемы на дороге
    memes.forEach((meme, index) => {
        const memeElement = document.createElement('div');
        memeElement.className = 'meme-on-road';
        memeElement.dataset.index = index;
        memeElement.style.left = `${400 + index * 300}px`;
        
        const img = document.createElement('img');
        img.src = meme.image;
        img.alt = `Мем ${index + 1}`;
        
        // Fallback если изображение не загрузится
        img.onerror = function() {
            console.log(`Ошибка загрузки изображения: ${meme.image}`);
            // Создаем цветной блок с номером мема
            this.src = '';
            this.parentElement.style.background = getColorForMeme(index);
            this.parentElement.style.display = 'flex';
            this.parentElement.style.alignItems = 'center';
            this.parentElement.style.justifyContent = 'center';
            this.parentElement.innerHTML = `<span style="font-size: 24px; font-weight: bold;">МЕМ ${index + 1}</span>`;
        };
        
        memeElement.appendChild(img);
        road.appendChild(memeElement);
        memeElements.push(memeElement);
    });
    
    updateCurrentMeme();
}

function getColorForMeme(index) {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
    return colors[index % colors.length];
}

function updateCurrentMeme() {
    memeElements.forEach((el, index) => {
        el.classList.remove('current', 'passed');
        
        if (index === currentMemeIndex) {
            el.classList.add('current');
        } else if (index < currentMemeIndex) {
            el.classList.add('passed');
        }
    });
}

function moveRoad() {
    if (isCrashed) return;
    
    const road = getElement('road');
    const distanceElement = getElement('distance');
    
    if (!road || !distanceElement) return;
    
    // Двигаем дорогу (чем выше скорость, тем быстрее)
    const roadElements = road.querySelectorAll('.meme-on-road, .road-mark');
    roadElements.forEach(el => {
        const currentLeft = parseFloat(el.style.left) || 0;
        el.style.left = `${currentLeft - speed}px`;
        
        // Если элемент уехал за экран, перемещаем его в конец
        if (currentLeft < -200) {
            const lastElement = Array.from(roadElements)
                .filter(e => e.className.includes('meme-on-road') || e.className.includes('road-mark'))
                .reduce((max, e) => {
                    const left = parseFloat(e.style.left) || 0;
                    return left > max ? left : max;
                }, 0);
            
            el.style.left = `${lastElement + 300}px`;
        }
    });
    
    // Увеличиваем дистанцию
    distance += speed * 0.1;
    distanceElement.textContent = Math.floor(distance);
    
    // Анимация игрока
    const player = getElement('player');
    if (player) {
        player.classList.add('moving');
    }
}

// ======================
// ИГРОВАЯ ЛОГИКА
// ======================

function startVoiceRecognition() {
    if (isCrashed) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Ваш браузер не поддерживает голосовое управление. Используйте Chrome.");
        return;
    }
    
    recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
        const hint = getElement('hint');
        if (hint) hint.textContent = "🎤 Слушаю... Говорите!";
    };
    
    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        console.log("Вы сказали:", spokenText);
        checkAnswer(spokenText);
    };
    
    recognition.onerror = (event) => {
        console.log("Ошибка распознавания:", event.error);
        const hint = getElement('hint');
        if (hint) hint.textContent = "Не удалось распознать речь. Попробуйте еще раз.";
        setTimeout(() => {
            if (hint) hint.textContent = "Нажми и скажи название мема";
        }, 2000);
    };
    
    recognition.onend = () => {
        recognition = null;
    };
    
    recognition.start();
}

function checkAnswer(spokenText) {
    const currentMeme = memes[currentMemeIndex];
    const correctAnswers = [currentMeme.name.toLowerCase(), ...currentMeme.altNames.map(n => n.toLowerCase())];
    
    console.log("Проверяем ответ:", spokenText);
    console.log("Правильные варианты:", correctAnswers);
    
    let isCorrect = false;
    for (const answer of correctAnswers) {
        // Более гибкая проверка - ищем частичное совпадение
        if (answer && spokenText.includes(answer)) {
            isCorrect = true;
            break;
        }
        // Также проверяем наоборот - может ответ содержится в сказанном тексте
        if (spokenText && answer.includes(spokenText)) {
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
    streak++;
    
    // Обновляем скорость
    if (streak % 3 === 0) {
        speed = Math.min(speed + 0.2, 3);
        const streakElement = getElement('streak');
        if (streakElement) streakElement.textContent = speed.toFixed(1);
        
        // Показываем бонус
        showBonus("🔥 СЕРИЯ! +Скорость!");
    }
    
    // Показываем подсказку
    const hint = getElement('hint');
    if (hint) {
        hint.textContent = "✅ Правильно! Едем дальше...";
        hint.style.color = "#4ECDC4";
    }
    
    // Убираем эффект столкновения
    const crashEffect = getElement('crash-effect');
    if (crashEffect) crashEffect.classList.add('hidden');
    
    const player = getElement('player');
    if (player) player.classList.remove('crash');
    
    // Переход к следующему мему
    setTimeout(() => {
        currentMemeIndex = (currentMemeIndex + 1) % memes.length;
        updateCurrentMeme();
        
        if (hint) {
            hint.textContent = "Нажми и скажи название мема";
            hint.style.color = "#aaa";
        }
    }, 1000);
}

function handleWrongAnswer() {
    isCrashed = true;
    streak = 0;
    
    // Сбрасываем скорость
    speed = Math.max(1, speed - 0.3);
    const streakElement = getElement('streak');
    if (streakElement) streakElement.textContent = speed.toFixed(1);
    
    // Показываем подсказку
    const hint = getElement('hint');
    if (hint) {
        hint.textContent = `💥 Врезались! Название: ${memes[currentMemeIndex].name}`;
        hint.style.color = "#FF6B6B";
    }
    
    // Показываем эффект столкновения
    const crashEffect = getElement('crash-effect');
    if (crashEffect) crashEffect.classList.remove('hidden');
    
    const player = getElement('player');
    if (player) {
        player.classList.add('crash');
        player.classList.remove('moving');
    }
    
    // Через 2 секунды убираем эффект
    setTimeout(() => {
        if (crashEffect) crashEffect.classList.add('hidden');
        if (player) player.classList.remove('crash');
        
        if (hint) {
            hint.textContent = "Попробуй еще раз назвать мем";
            hint.style.color = "#aaa";
        }
        
        // Разрешаем продолжить через 3 секунды
        setTimeout(() => {
            isCrashed = false;
            if (hint) hint.textContent = "Нажми и скажи название мема";
        }, 3000);
    }, 2000);
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

function gameLoop() {
    moveRoad();
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
                this.style.background = '#4ECDC4';
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
            
            createRoad();
            stopGameLoop();
            gameLoop();
        });
    }
    
    // Кнопка микрофона
    const micBtn = getElement('mic-btn');
    if (micBtn) {
        micBtn.addEventListener('click', function() {
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
            } else {
                const success = await startCamera();
                if (success) {
                    this.innerHTML = '<i class="fas fa-video-slash"></i>';
                }
            }
        });
    }
    
    // Принудительный рестарт по двойному тапу
    let lastTap = 0;
    document.addEventListener('touchend', function(event) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
            // Двойной тап - рестарт
            distance = 0;
            streak = 0;
            speed = 1;
            currentMemeIndex = 0;
            isCrashed = false;
            
            const distanceElement = getElement('distance');
            const streakElement = getElement('streak');
            const hint = getElement('hint');
            
            if (distanceElement) distanceElement.textContent = "0";
            if (streakElement) streakElement.textContent = "1";
            if (hint) hint.textContent = "Нажми и скажи название мема";
            
            createRoad();
        }
        
        lastTap = currentTime;
    });
    
    // Остановка игры при закрытии
    window.addEventListener('beforeunload', function() {
        stopCamera();
        stopGameLoop();
    });
    
    console.log("🎮 Meme Road загружен!");
    
    // Автоматически запускаем камеру если пользователь уже разрешил доступ
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
                        }
                    }
                });
            })
            .catch(() => {
                // Камера не разрешена, ничего не делаем
            });
    }
});

// Альтернатива если нет поддержки SpeechRecognition
if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.log("Speech Recognition не поддерживается");
    
    // Добавляем текстовый ввод как fallback
    document.addEventListener('DOMContentLoaded', function() {
        const controls = document.querySelector('.controls');
        if (controls) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Введите название мема';
            input.style.cssText = `
                padding: 12px;
                border-radius: 25px;
                border: none;
                width: 100%;
                max-width: 300px;
                margin-bottom: 10px;
                text-align: center;
                font-size: 16px;
            `;
            
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    checkAnswer(this.value.toLowerCase());
                    this.value = '';
                }
            });
            
            controls.insertBefore(input, controls.firstChild);
        }
    });
}
