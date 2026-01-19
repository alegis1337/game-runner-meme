document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const cameraFeed = document.getElementById('camera-feed');
    const cameraContainer = document.getElementById('camera-container');
    const currentMeme = document.getElementById('current-meme');
    const memeImage = document.getElementById('meme-image');
    const memeNameInput = document.getElementById('meme-name-input');
    const submitBtn = document.getElementById('submit-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const messageEl = document.getElementById('message');
    const scoreEl = document.getElementById('score');
    const timerEl = document.getElementById('timer');
    const currentNumberEl = document.getElementById('current-number');
    const totalMemesEl = document.getElementById('total-memes');
    const loadingEl = document.getElementById('loading');
    const toggleCameraBtn = document.getElementById('toggle-camera');
    const toggleMicrophoneBtn = document.getElementById('toggle-microphone');
    
    // Данные игры
    const memes = [
        { image: 'meme1.png', name: 'Salamat po', altNames: ['спасибо', 'thank you'] },
        { image: 'meme2.png', name: 'Reels Друзья', altNames: ['reels друзья', 'friends reels'] },
        { image: 'meme3.png', name: 'Merci', altNames: ['merci', 'мерси', 'спасибо'] },
        { image: 'meme4.png', name: 'Gamsahabnida', altNames: ['gamsahabnida', '감사합니다', 'спасибо'] },
        { image: 'meme5.png', name: 'Looool', altNames: ['loool', 'лооол', 'lol'] },
        { image: 'meme6.jpg', name: 'thevisionfamshow', altNames: ['vision fam show', 'the vision fam show'] }
    ];
    
    let currentMemeIndex = 0;
    let score = 0;
    let timer = 30;
    let timerInterval;
    let isGameActive = false;
    let isCameraOn = true;
    let isMicrophoneOn = false;
    let recognition = null;
    
    // Инициализация игры
    function initGame() {
        totalMemesEl.textContent = memes.length;
        loadMeme(currentMemeIndex);
        startTimer();
        isGameActive = true;
        
        // Показать активную карточку мема
        setTimeout(() => {
            currentMeme.classList.add('active');
        }, 500);
    }
    
    // Загрузка мема
    function loadMeme(index) {
        if (index >= memes.length) {
            endGame();
            return;
        }
        
        const meme = memes[index];
        memeImage.src = meme.image;
        memeImage.alt = meme.name;
        currentNumberEl.textContent = index + 1;
        
        // Сброс таймера
        timer = 30;
        timerEl.textContent = timer;
        
        // Очистка сообщений и инпута
        messageEl.textContent = '';
        memeNameInput.value = '';
        memeNameInput.focus();
    }
    
    // Таймер
    function startTimer() {
        clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            if (!isGameActive) return;
            
            timer--;
            timerEl.textContent = timer;
            
            if (timer <= 0) {
                clearInterval(timerInterval);
                handleWrongAnswer();
            }
        }, 1000);
    }
    
    // Проверка ответа
    function checkAnswer() {
        if (!isGameActive) return;
        
        const userAnswer = memeNameInput.value.trim().toLowerCase();
        const currentMeme = memes[currentMemeIndex];
        const correctAnswers = [
            currentMeme.name.toLowerCase(),
            ...currentMeme.altNames.map(alt => alt.toLowerCase())
        ];
        
        // Проверка на правильный ответ
        if (correctAnswers.includes(userAnswer)) {
            handleCorrectAnswer();
        } else {
            handleWrongAnswer();
        }
    }
    
    // Правильный ответ
    function handleCorrectAnswer() {
        isGameActive = false;
        clearInterval(timerInterval);
        
        // Анимация
        currentMeme.classList.add('correct-animation');
        
        // Обновление счета
        score += Math.max(10, timer * 2);
        scoreEl.textContent = score;
        
        messageEl.textContent = 'Правильно! ✅';
        messageEl.style.color = '#4CAF50';
        
        // Переход к следующему мему
        setTimeout(() => {
            currentMeme.classList.remove('correct-animation');
            currentMeme.classList.remove('active');
            
            currentMemeIndex++;
            
            if (currentMemeIndex < memes.length) {
                setTimeout(() => {
                    loadMeme(currentMemeIndex);
                    currentMeme.classList.add('active');
                    isGameActive = true;
                    startTimer();
                }, 500);
            } else {
                endGame();
            }
        }, 1500);
    }
    
    // Неправильный ответ
    function handleWrongAnswer() {
        isGameActive = false;
        clearInterval(timerInterval);
        
        // Анимация
        currentMeme.classList.add('wrong-animation');
        
        messageEl.textContent = `Неправильно! Правильный ответ: ${memes[currentMemeIndex].name}`;
        messageEl.style.color = '#FF5252';
        
        // Переход к следующему мему
        setTimeout(() => {
            currentMeme.classList.remove('wrong-animation');
            currentMeme.classList.remove('active');
            
            currentMemeIndex++;
            
            if (currentMemeIndex < memes.length) {
                setTimeout(() => {
                    loadMeme(currentMemeIndex);
                    currentMeme.classList.add('active');
                    isGameActive = true;
                    startTimer();
                }, 500);
            } else {
                endGame();
            }
        }, 2000);
    }
    
    // Конец игры
    function endGame() {
        isGameActive = false;
        clearInterval(timerInterval);
        
        messageEl.innerHTML = `Игра завершена!<br>Ваш счет: <span style="color:#FFD700; font-size:24px;">${score}</span>`;
        messageEl.style.color = 'white';
        messageEl.style.fontSize = '20px';
        
        // Кнопка перезапуска
        submitBtn.textContent = 'Играть снова';
        submitBtn.onclick = restartGame;
        memeNameInput.style.display = 'none';
        voiceBtn.style.display = 'none';
    }
    
    // Перезапуск игры
    function restartGame() {
        currentMemeIndex = 0;
        score = 0;
        scoreEl.textContent = score;
        
        submitBtn.textContent = 'Ответить';
        submitBtn.onclick = checkAnswer;
        memeNameInput.style.display = 'block';
        voiceBtn.style.display = 'flex';
        
        initGame();
    }
    
    // Инициализация камеры
    async function initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user', // Фронтальная камера
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: true
            });
            
            cameraFeed.srcObject = stream;
            isCameraOn = true;
            isMicrophoneOn = true;
            
            // Обновление иконки микрофона
            toggleMicrophoneBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            
            // Скрыть загрузку
            setTimeout(() => {
                loadingEl.style.display = 'none';
                initGame();
            }, 1000);
            
        } catch (error) {
            console.error('Ошибка доступа к камере:', error);
            // Если нет доступа к камере, показываем статичный фон
            cameraContainer.style.background = 'linear-gradient(45deg, #1a1a2e, #16213e, #0f3460)';
            cameraContainer.innerHTML = '<div style="position:absolute; width:100%; height:100%; background:rgba(0,0,0,0.5);"></div>';
            
            // Скрыть загрузку и начать игру
            setTimeout(() => {
                loadingEl.style.display = 'none';
                initGame();
            }, 1000);
        }
    }
    
    // Переключение камеры
    toggleCameraBtn.addEventListener('click', function() {
        isCameraOn = !isCameraOn;
        
        if (cameraFeed.srcObject) {
            cameraFeed.srcObject.getTracks().forEach(track => {
                if (track.kind === 'video') {
                    track.enabled = isCameraOn;
                }
            });
        }
        
        toggleCameraBtn.innerHTML = isCameraOn ? 
            '<i class="fas fa-camera"></i>' : 
            '<i class="fas fa-camera-slash"></i>';
        
        cameraContainer.style.opacity = isCameraOn ? '1' : '0.5';
    });
    
    // Переключение микрофона
    toggleMicrophoneBtn.addEventListener('click', function() {
        isMicrophoneOn = !isMicrophoneOn;
        
        if (cameraFeed.srcObject) {
            cameraFeed.srcObject.getTracks().forEach(track => {
                if (track.kind === 'audio') {
                    track.enabled = isMicrophoneOn;
                }
            });
        }
        
        toggleMicrophoneBtn.innerHTML = isMicrophoneOn ? 
            '<i class="fas fa-microphone"></i>' : 
            '<i class="fas fa-microphone-slash"></i>';
    });
    
    // Голосовой ввод
    function initVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            
            recognition.lang = 'ru-RU';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                memeNameInput.value = transcript;
            };
            
            recognition.onerror = function(event) {
                console.error('Speech recognition error', event.error);
            };
            
            voiceBtn.addEventListener('click', function() {
                if (isMicrophoneOn) {
                    try {
                        recognition.start();
                        voiceBtn.innerHTML = '<i class="fas fa-microphone" style="color:#FF5252;"></i>';
                        
                        setTimeout(() => {
                            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                        }, 1000);
                    } catch (error) {
                        console.error('Voice recognition error:', error);
                    }
                }
            });
        } else {
            // Если голосовой ввод не поддерживается
            voiceBtn.style.display = 'none';
        }
    }
    
    // Обработчики событий
    submitBtn.addEventListener('click', checkAnswer);
    
    memeNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    // Инициализация приложения
    initCamera();
    initVoiceRecognition();
    
    // Предотвращение скролла на мобильных
    document.addEventListener('touchmove', function(e) {
        if (e.target.tagName !== 'INPUT') {
            e.preventDefault();
        }
    }, { passive: false });
});
