document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const cameraFeed = document.getElementById('camera-feed');
    const cameraContainer = document.getElementById('camera-container');
    const currentMeme = document.getElementById('current-meme');
    const memeImage = document.getElementById('meme-image');
    const voiceBtn = document.getElementById('voice-btn');
    const voiceStatus = document.getElementById('voice-status');
    const voiceText = document.getElementById('voice-text');
    const messageEl = document.getElementById('message');
    const scoreEl = document.getElementById('score');
    const timerEl = document.getElementById('timer');
    const currentNumberEl = document.getElementById('current-number');
    const totalMemesEl = document.getElementById('total-memes');
    const loadingEl = document.getElementById('loading');
    const toggleCameraBtn = document.getElementById('toggle-camera');
    
    // Данные игры
    const memes = [
        { image: 'memes/meme1.png', name: 'Salamat po', altNames: ['спасибо', 'thank you', 'саламат по'] },
        { image: 'memes/meme2.png', name: 'Reels Друзья', altNames: ['reels друзья', 'friends reels', 'рилс друзья'] },
        { image: 'memes/meme3.png', name: 'Merci', altNames: ['merci', 'мерси', 'спасибо'] },
        { image: 'memes/meme4.png', name: 'Gamsahabnida', altNames: ['gamsahabnida', '감사합니다', 'спасибо', 'гамсахабнида'] },
        { image: 'memes/meme5.png', name: 'Looool', altNames: ['loool', 'лооол', 'lol', 'лул'] },
        { image: 'memes/meme6.jpg', name: 'thevisionfamshow', altNames: ['vision fam show', 'the vision fam show', 'зе вижн фам шоу'] }
    ];
    
    let currentMemeIndex = 0;
    let score = 0;
    let timer = 30;
    let timerInterval;
    let isGameActive = false;
    let isCameraOn = true;
    let isListening = false;
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
        memeImage.onerror = function() {
            console.error('Failed to load image:', meme.image);
            memeImage.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f0f0f0"/><text x="100" y="100" font-family="Arial" font-size="14" text-anchor="middle" fill="%23666">Мем ' + (index + 1) + '</text><text x="100" y="120" font-family="Arial" font-size="12" text-anchor="middle" fill="%23999">' + meme.name + '</text></svg>';
        };
        
        currentNumberEl.textContent = index + 1;
        
        // Сброс таймера
        timer = 30;
        timerEl.textContent = timer;
        
        // Очистка сообщений
        messageEl.textContent = '';
        voiceStatus.textContent = 'Нажмите микрофон, чтобы назвать мем';
        voiceText.textContent = '';
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
    
    // Проверка голосового ответа
    function checkVoiceAnswer(transcript) {
        if (!isGameActive || !transcript) return false;
        
        const userAnswer = transcript.trim().toLowerCase();
        const currentMeme = memes[currentMemeIndex];
        const correctAnswers = [
            currentMeme.name.toLowerCase(),
            ...currentMeme.altNames.map(alt => alt.toLowerCase())
        ];
        
        // Проверка на правильный ответ
        return correctAnswers.some(answer => userAnswer.includes(answer));
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
        
        messageEl.textContent = '✅ Правильно!';
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
    
    // Неправильный ответ (БЕЗ ПОКАЗА ПРАВИЛЬНОГО ОТВЕТА)
    function handleWrongAnswer() {
        isGameActive = false;
        clearInterval(timerInterval);
        
        // Анимация
        currentMeme.classList.add('wrong-animation');
        
        messageEl.textContent = `❌ Неправильно!`;
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
        
        messageEl.innerHTML = `🎮 Игра завершена!<br>🏆 Ваш счет: <span style="color:#FFD700; font-size:24px;">${score}</span>`;
        messageEl.style.color = 'white';
        messageEl.style.fontSize = '20px';
        
        // Обновление кнопки для перезапуска
        voiceStatus.textContent = 'Игра завершена! Нажмите для перезапуска';
        voiceBtn.innerHTML = '<i class="fas fa-redo"></i>';
        voiceBtn.onclick = restartGame;
    }
    
    // Перезапуск игры
    function restartGame() {
        currentMemeIndex = 0;
        score = 0;
        scoreEl.textContent = score;
        
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceBtn.onclick = window.startVoiceRecognition;
        
        initGame();
    }
    
    // Инициализация камеры
    async function initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            
            cameraFeed.srcObject = stream;
            isCameraOn = true;
            
            // Скрыть загрузку
            setTimeout(() => {
                loadingEl.style.display = 'none';
                initGame();
            }, 1000);
            
        } catch (error) {
            console.log('Камера не доступна, используем фон');
            cameraContainer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            cameraFeed.style.display = 'none';
            
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
        
        cameraContainer.style.opacity = isCameraOn ? '1' : '0.3';
    });
    
    // Инициализация голосового распознавания
    function initVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            
            recognition.lang = 'ru-RU';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.continuous = false;
            
            recognition.onstart = function() {
                isListening = true;
                voiceBtn.classList.add('listening');
                voiceStatus.textContent = 'Слушаю... Говорите сейчас';
                voiceText.textContent = '';
            };
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                voiceText.textContent = transcript;
                
                // Проверка ответа
                if (checkVoiceAnswer(transcript)) {
                    handleCorrectAnswer();
                } else {
                    handleWrongAnswer();
                }
            };
            
            recognition.onerror = function(event) {
                console.error('Speech recognition error:', event.error);
                voiceStatus.textContent = 'Ошибка распознавания. Попробуйте снова';
            };
            
            recognition.onend = function() {
                isListening = false;
                voiceBtn.classList.remove('listening');
                voiceStatus.textContent = 'Нажмите микрофон, чтобы назвать мем';
            };
            
            // Функция начала распознавания
            window.startVoiceRecognition = function() {
                if (isGameActive && !isListening) {
                    try {
                        recognition.start();
                    } catch (error) {
                        console.error('Voice recognition error:', error);
                        voiceStatus.textContent = 'Не удалось запустить распознавание';
                    }
                }
            };
            
            voiceBtn.addEventListener('click', window.startVoiceRecognition);
            
        } else {
            voiceBtn.style.display = 'none';
            voiceStatus.textContent = 'Голосовой ввод не поддерживается в вашем браузере';
            messageEl.textContent = 'Пожалуйста, используйте современный браузер с поддержкой голосового ввода';
        }
    }
    
    // Инициализация приложения
    initCamera();
    initVoiceRecognition();
    
    // Предотвращение скролла на мобильных
    document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
});
