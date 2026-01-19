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
    const currentNumberEl = document.getElementById('current-number');
    const totalMemesEl = document.getElementById('total-memes');
    const loadingEl = document.getElementById('loading');
    const toggleCameraBtn = document.getElementById('toggle-camera');
    const currentMemeInfo = document.getElementById('current-meme-info');
    
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
    let isGameActive = false;
    let isCameraOn = true;
    let isListening = false;
    let recognition = null;
    
    // Инициализация игры
    function initGame() {
        totalMemesEl.textContent = memes.length;
        isGameActive = true;
        
        // Показываем первый мем с анимацией прибытия
        showNextMeme();
    }
    
    // Показать следующий мем с анимацией прибытия
    function showNextMeme() {
        if (currentMemeIndex >= memes.length) {
            endGame();
            return;
        }
        
        const meme = memes[currentMemeIndex];
        memeImage.src = meme.image;
        memeImage.alt = meme.name;
        memeImage.onerror = function() {
            console.error('Failed to load image:', meme.image);
            memeImage.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f0f0f0"/><text x="100" y="100" font-family="Arial" font-size="14" text-anchor="middle" fill="%23666">Мем ' + (currentMemeIndex + 1) + '</text><text x="100" y="120" font-family="Arial" font-size="12" text-anchor="middle" fill="%23999">' + meme.name + '</text></svg>';
        };
        
        currentNumberEl.textContent = currentMemeIndex + 1;
        currentMemeInfo.textContent = 'Назовите мем!';
        
        // Очистка сообщений
        messageEl.textContent = '';
        voiceStatus.textContent = 'Нажмите микрофон, чтобы назвать мем';
        voiceText.textContent = '';
        
        // Анимация прибытия мема справа
        currentMeme.classList.remove('active', 'departing');
        currentMeme.classList.add('arriving');
        
        setTimeout(() => {
            currentMeme.classList.remove('arriving');
            currentMeme.classList.add('active');
        }, 2000);
    }
    
    // Убрать текущий мем с анимацией отъезда
    function departMeme() {
        currentMeme.classList.remove('active');
        currentMeme.classList.add('departing');
        
        setTimeout(() => {
            currentMeme.classList.remove('departing');
        }, 3000);
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
        if (!isGameActive) return;
        
        isGameActive = false;
        
        // Анимация правильного ответа
        currentMeme.classList.add('correct-animation');
        
        // Обновление счета
        score += 10;
        scoreEl.textContent = score;
        
        messageEl.textContent = '✅ Правильно!';
        messageEl.style.color = '#4CAF50';
        currentMemeInfo.textContent = 'Правильно!';
        
        // Мем уезжает
        setTimeout(() => {
            currentMeme.classList.remove('correct-animation');
            departMeme();
            
            // Переход к следующему мему
            setTimeout(() => {
                currentMemeIndex++;
                
                if (currentMemeIndex < memes.length) {
                    isGameActive = true;
                    showNextMeme();
                } else {
                    endGame();
                }
            }, 2500);
        }, 1000);
    }
    
    // Неправильный ответ
    function handleWrongAnswer() {
        if (!isGameActive) return;
        
        messageEl.textContent = `❌ Попробуйте еще раз`;
        messageEl.style.color = '#FF5252';
        currentMemeInfo.textContent = 'Попробуйте еще раз';
        
        // Сброс голосового текста через 2 секунды
        setTimeout(() => {
            voiceText.textContent = '';
            messageEl.textContent = '';
            currentMemeInfo.textContent = 'Назовите мем!';
        }, 2000);
    }
    
    // Конец игры
    function endGame() {
        isGameActive = false;
        
        messageEl.innerHTML = `🎮 Игра завершена!<br>🏆 Ваш счет: <span style="color:#FFD700; font-size:24px;">${score}</span>`;
        messageEl.style.color = 'white';
        messageEl.style.fontSize = '20px';
        currentMemeInfo.textContent = 'Игра завершена!';
        
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
                messageEl.textContent = '';
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
                setTimeout(() => {
                    voiceStatus.textContent = 'Нажмите микрофон, чтобы назвать мем';
                }, 2000);
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
