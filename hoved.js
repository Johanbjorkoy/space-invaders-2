window.onload = function () {
  let c = document.querySelector("canvas");
  let canvas = document.querySelector("canvas");
  c.width = innerWidth;
  c.height = innerHeight;
  c = c.getContext("2d");

  let modal = document.getElementById("start-modul");
  modal.style.display = "block";

  const startknapp = document.getElementById("start-knapp");
  const startmodul = document.getElementById("start-modul");
  const vanskelighetsgrad = document.getElementById("hastighet");
  let originalHastighet = parseInt(vanskelighetsgrad.value);
  let hastighet = originalHastighet;

  let animationId;
  let score = 0;
  let health = 100;
  let _enemies = [];
  let _bullets = [];
  let _healthkits = [];
  let gameRunning = false;

  vanskelighetsgrad.addEventListener("change", () => {
    hastighet = parseInt(vanskelighetsgrad.value);
  });

  startknapp.addEventListener("click", () => {
    if (!gameRunning) {
      startGame();
      startmodul.style.display = "none";
    }
  });

  function startGame() {
    gameRunning = true;
    score = 0;
    health = 100;
    _enemies = [];
    _bullets = [];
    _healthkits = [];

    let mouse = {
      x: innerWidth / 2,
      y: innerHeight - 33,
    };

    let touch = {
      x: innerWidth / 2,
      y: innerHeight - 33,
    };

    canvas.addEventListener("mousemove", function (event) {
      mouse.x = event.clientX;
    });
    canvas.addEventListener("touchmove", function (event) {
      let rect = canvas.getBoundingClientRect();
      let root = document.documentElement;
      let touch = event.changedTouches[0];
      let touchX = parseInt(touch.clientX);
      let touchY = parseInt(touch.clientY) - rect.top - root.scrollTop;
      event.preventDefault();
      mouse.x = touchX;
      mouse.y = touchY;
    });

    let player_width = 64;
    let player_height = 64;
    let playerImg = new Image();
    playerImg.src = "skip.png";

    let bullet_width = 6;
    let bullet_height = 8;

    let enemyImg = new Image();
    enemyImg.src = "virus.png";
    let enemy_width = 48;
    let enemy_height = 48;

    let healthkitImg = new Image();
    healthkitImg.src = "medkit.png";
    let healthkit_width = 32;
    let healthkit_height = 32;

    function Player(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;

      this.draw = function () {
        c.beginPath();
        c.drawImage(
          playerImg,
          mouse.x - player_width / 2,
          mouse.y - player_height / 2,
          width,
          height
        );
      };

      this.update = function () {
        this.draw();
      };
    }

    function Bullet(x, y, width, height, speed) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.speed = speed;

      this.draw = function () {
        c.beginPath();
        c.rect(this.x, this.y, this.width, this.height);
        c.fillStyle = "white";
        c.fill();
      };

      this.update = function () {
        this.y -= this.speed;
        this.draw();
      };
    }

    function Enemy(x, y, width, height, speed) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.speed = speed;

      this.draw = function () {
        c.beginPath();
        c.drawImage(enemyImg, this.x, this.y, width, height);
      };

      this.update = function () {
        this.y += this.speed;
        this.draw();
      };
    }

    function Healthkit(x, y, width, height, speed) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.speed = speed;

      this.draw = function () {
        c.beginPath();
        c.drawImage(healthkitImg, this.x, this.y, width, height);
      };

      this.update = function () {
        this.y += this.speed;
        this.draw();
      };
    }

    let __player = new Player(mouse.x, mouse.y, player_width, player_height);

    function drawEnemies() {
      const numberOfEnemies = 5;
      for (let i = 0; i < numberOfEnemies; i++) {
        let x = Math.random() * (innerWidth - enemy_width);
        let y = -enemy_height;
        let width = enemy_width;
        let height = enemy_height;
        let speed = Math.random() * 2 + 1;
        let __enemy = new Enemy(x, y, width, height, speed);
        _enemies.push(__enemy);
      }
    }

    function drawHealthkits() {
      let x = Math.random() * (innerWidth - healthkit_width);
      let y = -healthkit_height;
      let width = healthkit_width;
      let height = healthkit_height;
      let speed = Math.random() * 2.6 + 0.4;
      let __healthkit = new Healthkit(x, y, width, height, speed);
      _healthkits.push(__healthkit);
    }

    function fire() {
      let x = mouse.x - bullet_width / 2;
      let y = mouse.y - player_height;
      let bullet_speed = hastighet;
      let __bullet = new Bullet(
        x,
        y,
        bullet_width,
        bullet_height,
        bullet_speed
      );
      _bullets.push(__bullet);
    }

    let enemyInterval = setInterval(drawEnemies, 3000);
    let healthkitInterval = setInterval(drawHealthkits, 15000);
    let fireInterval = setInterval(fire, 200);

    function collision(a, b) {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    }

    c.font = "1em Arial";

    function animate() {
      animationId = requestAnimationFrame(animate);

      c.clearRect(0, 0, innerWidth, innerHeight);
      c.fillStyle = "white";
      c.fillText("Health: " + health, 5, 20);
      c.fillText("Score: " + score, innerWidth - 100, 20);

      __player.update();

      for (let i = 0; i < _bullets.length; i++) {
        _bullets[i].update();
        if (_bullets[i].y < 0) {
          _bullets.splice(i, 1);
        }
      }

      for (let k = 0; k < _enemies.length; k++) {
        _enemies[k].update();
        if (_enemies[k].y > innerHeight) {
          _enemies.splice(k, 1);
          health -= 10;
          if (health <= 0) {
            cancelAnimationFrame(animationId);
            clearInterval(enemyInterval);
            clearInterval(healthkitInterval);
            clearInterval(fireInterval);
            const viewModul = document.getElementById("slutt-modul");
            const viewRecord = document.getElementById("insert-text");
            const restart = document.getElementById("restartBtn");
            viewModul.classList.add("active");
            viewRecord.textContent = "Din Score " + score;
            restart.addEventListener("click", () => {
              window.location.reload();
            });
            gameRunning = false;
            return;
          }
        }
      }

      for (let j = _enemies.length - 1; j >= 0; j--) {
        for (let l = _bullets.length - 1; l >= 0; l--) {
          if (collision(_enemies[j], _bullets[l])) {
            _enemies.splice(j, 1);
            _bullets.splice(l, 1);
            score++;
          }
        }
      }

      for (let h = 0; h < _healthkits.length; h++) {
        _healthkits[h].update();
      }
      for (let hh = _healthkits.length - 1; hh >= 0; hh--) {
        for (let hhh = _bullets.length - 1; hhh >= 0; hhh--) {
          if (collision(_healthkits[hh], _bullets[hhh])) {
            _healthkits.splice(hh, 1);
            _bullets.splice(hhh, 1);
            health += 10;
          }
        }
      }
    }

    Promise.all([
      loadImage(playerImg),
      loadImage(enemyImg),
      loadImage(healthkitImg),
    ]).then(() => {
      animate();
    });
  }

  function loadImage(image) {
    return new Promise((resolve) => {
      image.onload = resolve;
    });
  }
};
