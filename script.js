(function () {

    let selectedDifficulty = null;
    let selectedColor = null;

    let score = 0;
    let gameActive = true;
    let roundTimer = null;
    let displayInterval = null;
    let roundEndTime = 0;

    const settings = {
        easy: {
            size: 70,
            clickTime: 5,
            spawnPadding: 80
        },
        normal: {
            size: 55,
            clickTime: 3,
            spawnPadding: 50
        },
        hard: {
            size: 40,
            clickTime: 1.5,
            spawnPadding: 25
        },
        superhard: {
            size: 28,
            clickTime: 0.7,
            spawnPadding: 10
        }
    };

    const startBtn = document.getElementById("startBtn");

    if (startBtn) {
        const difficultyInputs = document.getElementsByName("difficulty");
        const colorInputs = document.getElementsByName("color");
        const startMessage = document.getElementById("startMessage");

        for (let i = 0; i < difficultyInputs.length; i++) {
            difficultyInputs[i].addEventListener("change", function () {
                selectedDifficulty = this.value;
                validateStartForm();
            });
        }

        for (let i = 0; i < colorInputs.length; i++) {
            colorInputs[i].addEventListener("change", function () {
                selectedColor = this.value;
                validateStartForm();
            });
        }

        startBtn.addEventListener("click", function () {
            if (!selectedDifficulty || !selectedColor) {
                startMessage.textContent = "Choose difficulty and color first.";
                return;
            }

            localStorage.setItem("pixelHuntDifficulty", selectedDifficulty);
            localStorage.setItem("pixelHuntColor", selectedColor);

            window.location.href = "game.html";
        });

        function validateStartForm() {
            if (selectedDifficulty && selectedColor) {
                startBtn.disabled = false;
                startMessage.textContent = "";
            } else {
                startBtn.disabled = true;
            }
        }
    }

    const gameArea = document.getElementById("gameArea");

if (gameArea) {
    const navigationEntries = performance.getEntriesByType("navigation");

    if (navigationEntries.length > 0 && navigationEntries[0].type === "reload") {
        window.location.href = "index.html";
    }

    const pixel = document.getElementById("pixel");
    const scoreEl = document.getElementById("score");
    const timeLeftEl = document.getElementById("timeLeft");
    const difficultyLabel = document.getElementById("difficultyLabel");
    const gameOverMessage = document.getElementById("gameOverMessage");
    const finalScore = document.getElementById("finalScore");
    const hud = document.getElementById("hud");

    const difficulty = localStorage.getItem("pixelHuntDifficulty");
    const color = localStorage.getItem("pixelHuntColor");

    if (!difficulty || !color || !settings[difficulty]) {
        alert("Go back to the start page and choose game settings.");
        window.location.href = "index.html";
    } else {
        const currentLevel = settings[difficulty];
        difficultyLabel.textContent = difficulty.toUpperCase();
        pixel.style.backgroundColor = color;
        pixel.style.width = currentLevel.size + "px";
        pixel.style.height = currentLevel.size + "px";

        startGame();
    }

        function startGame() {
            score = 0;
            gameActive = true;
            scoreEl.textContent = score;
            spawnPixel();
        }

        function spawnPixel() {
            if (!gameActive) return;

            clearTimeout(roundTimer);
            clearInterval(displayInterval);

            const level = settings[difficulty];
            const gameAreaRect = gameArea.getBoundingClientRect();
            const hudRect = hud.getBoundingClientRect();

            const pixelSize = level.size;
            const padding = level.spawnPadding;

            const maxX = gameArea.clientWidth - pixelSize;
            const maxY = gameArea.clientHeight - pixelSize;

            let randomX;
            let randomY;
            let tries = 0;

            do {
                randomX = Math.floor(Math.random() * Math.max(maxX - padding * 2, 1)) + padding;
                randomY = Math.floor(Math.random() * Math.max(maxY - padding * 2, 1)) + padding;
                tries++;
            } while (
                isOverHud(randomX, randomY, pixelSize, gameAreaRect, hudRect) &&
                tries < 100
            );

            pixel.style.left = randomX + "px";
            pixel.style.top = randomY + "px";
            pixel.style.display = "block";

            roundEndTime = Date.now() + level.clickTime * 1000;
            updateDisplayedTimer();

            displayInterval = setInterval(updateDisplayedTimer, 30);

            roundTimer = setTimeout(function () {
                endGame();
            }, level.clickTime * 1000);
        }

        function isOverHud(x, y, size, gameAreaRect, hudRect) {
            const pixelLeft = gameAreaRect.left + x;
            const pixelTop = gameAreaRect.top + y;
            const pixelRight = pixelLeft + size;
            const pixelBottom = pixelTop + size;

            const hudLeft = hudRect.left;
            const hudTop = hudRect.top;
            const hudRight = hudRect.right;
            const hudBottom = hudRect.bottom;

            return !(
                pixelRight < hudLeft ||
                pixelLeft > hudRight ||
                pixelBottom < hudTop ||
                pixelTop > hudBottom
            );
        }

        function updateDisplayedTimer() {
            if (!gameActive) return;

            const time = Math.max(0, (roundEndTime - Date.now()) / 1000);
            timeLeftEl.textContent = time.toFixed(2);
        }

        pixel.addEventListener("click", function () {
            if (!gameActive) return;

            score++;
            scoreEl.textContent = score;

            spawnPixel();
        });

        function endGame() {
            if (!gameActive) return;

            gameActive = false;

            clearTimeout(roundTimer);
            clearInterval(displayInterval);

            pixel.style.display = "none";
            pixel.style.pointerEvents = "none";

            finalScore.textContent = score;
            gameOverMessage.classList.remove("hidden");
            timeLeftEl.textContent = "0.00";
        }
    }
})();