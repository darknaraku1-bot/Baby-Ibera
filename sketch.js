// --- VARIABLES GLOBALES ---
let fondo, fondo2, noche, defaultImg, portada;
let botonComer, botonCurar, botonJugar, botonDormir, botonSonido, botonSilencio, botonReiniciar, introImg;
let flechaIzq, flechaDer;
let fondosGaleria = [];
let nombresFondos = ["Habitación 1", "Habitación 2", "Habitación 3", "Habitación 4"];

let jumpSound, collectSound, powerupSound, backgroundMusic, tamagotchiMusic, burbujaSound, zSound;
let introPelicula;

let estado = -6.0; // Estado inicial especial para el overlay HTML

// Variables de Estadísticas y Juego
let tiempoNacimiento = 0, hambre = 100, felicidad = 100, salud = 100, energia = 100;
let comiendo = false, durmiendo = false, muted = false;
let tiempoComiendo = 0, tiempoDormir = 0, introTimer = 0;
let ultimaActualizacion = 0;
let estadoPrevio = -3.0;
let fondoIdx = 0;
let carruselOffset = 0, carruselTarget = 0;
let carruselOffsetFondo = 0, carruselTargetFondo = 0;

// Variables para control de movimiento fluido (Solución al lag)
let moveLeft = false, moveRight = false;

// Variables de control de pantalla táctil
let isTouchDevice = false;

// --- VARIABLES DE POSICIÓN (LAYOUT) ---
let huevoX, huevoY;
let personajeX, personajeY;
let barraX, barraY;

// Variables UI y Editor
let botonW = 120, botonH = 120;
let botonX = new Array(6);
let botonY = new Array(6);
let botonPressed = new Array(6).fill(false);
let nombresBotones = ["btn_comer", "btn_curar", "btn_jugar", "btn_dormir", "btn_sonido", "btn_reiniciar"];

let personajeIdx = 0;
let personajes = [];
let personajeActual;

let panelConfirmacion;
let botonSi = [], botonNo = [], botonJugarPortada;
let botonSiPressed = false, botonNoPressed = false;

// Animación carga
let barraSuave = 0.0;
let brilloOffset = 0.0;

// --- VARIABLES DE ANIMACIÓN Y MEJORAS ---
let btnScale = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
let confirmSiScale = 1.0;
let confirmNoScale = 1.0;
let portadaJugarScale = 1.0;
let arrowIzqScale = 1.0;
let arrowDerScale = 1.0;

let hambreVisual = 100;
let felicidadVisual = 100;
let saludVisual = 100;
let energiaVisual = 100;

let fadeAlpha = 255;
let lastEstado = -5.0;

let shakeIntensity = 0;

let particles = [];
let awtGif;
let frameCountMini = 0;

// --- VARIABLES MODO EDITOR ---
let modoEditor = false;
let elementoSeleccionado = -1;
let offsetX = 0, offsetY = 0;

// Variables para huevos cargados en Preload
let huevoCapibara, huevoYaca, huevoAguara, huevoYaguarete;

// --- CLASES ---

class Particle {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 0 = heart, 1 = cross, 2 = star, 3 = bubble, 4 = zzz
    this.vx = random(-2, 2);
    this.vy = random(-2, -5);
    this.size = random(15, 30);
    this.alpha = 255;
    this.rotation = random(TWO_PI);
    this.rotSpeed = random(-0.05, 0.05);
    if (type === 4) {
      this.txt = random(1) < 0.3 ? "z" : (random(1) < 0.6 ? "Zz" : "Zzz");
      this.vx = random(-0.5, 0.5);
      this.vy = random(-1, -3);
      this.size = random(20, 35);
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotSpeed;
    this.alpha -= 4;
    if (this.type === 4) {
      this.alpha -= 2;
      this.x += sin(frameCount * 0.1) * 0.5;
    }
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    noStroke();

    if (this.type === 0) { // Heart
      fill(255, 100, 150, this.alpha);
      beginShape();
      vertex(0, -this.size * 0.3);
      bezierVertex(-this.size / 2, -this.size * 0.8, -this.size, -this.size * 0.1, 0, this.size * 0.6);
      bezierVertex(this.size, -this.size * 0.1, this.size / 2, -this.size * 0.8, 0, -this.size * 0.3);
      endShape(CLOSE);
    } else if (this.type === 1) { // Cross
      fill(100, 255, 100, this.alpha);
      rectMode(CENTER);
      rect(0, 0, this.size, this.size / 3, 2);
      rect(0, 0, this.size / 3, this.size, 2);
      rectMode(CORNER);
    } else if (this.type === 2) { // Star
      fill(255, 230, 100, this.alpha);
      beginShape();
      for (let i = 0; i < 10; i++) {
        let angle = i * TWO_PI / 10;
        let r = (i % 2 === 0) ? this.size / 2 : this.size / 4;
        vertex(cos(angle) * r, sin(angle) * r);
      }
      endShape(CLOSE);
    } else if (this.type === 3) { // Bubble
      stroke(150, 200, 255, this.alpha);
      strokeWeight(2);
      fill(200, 230, 255, this.alpha * 0.4);
      ellipse(0, 0, this.size, this.size);
      noStroke();
      fill(255, this.alpha * 0.8);
      ellipse(-this.size / 4, -this.size / 4, this.size / 5, this.size / 5);
    } else if (this.type === 4) { // Zzz
      fill(180, 220, 255, this.alpha);
      textSize(this.size);
      textAlign(CENTER, CENTER);
      text(this.txt, 0, 0);
    }
    pop();
  }
}

class Personaje {
  constructor(nombre, carpeta, minijuegoTipo) {
    this.nombre = nombre;
    this.carpetaRuta = carpeta;
    this.minijuegoTipo = minijuegoTipo;
    this.huevo = null;
    this.eclosion = [];
    this.feliz = [];
    this.hambre = [];
    this.esperando = [];
    this.sueno = [];
    this.enfermo = [];
    this.comiendo = [];
    this.minijuegoSprites = [];
    this.minijuegoSpritesExtra = [];
    this.fondoMinijuego = null;
    this.collectible1 = null;
    this.collectible2 = null;
    this.obstaculo = null;
    this.obstacles = [];
    this.collectibles = [];
    this.gameSpeed = 5.0;
    this.spriteX = 200;
    this.spriteY = 1080 - 250;
    this.spriteSpeed = 0;
    this.spriteSpeedX = 0;
    this.gravity = 2;
    this.jumpForce = -30;
    this.score = 0;
    this.highScore = 0;
    this.isJumping = false;
    this.isGameOver = false;
    this.hasPowerUp = false;
    this.isJumpAnimating = false;
    this.canJump = false;
    this.powerUpTimer = 0;
    this.obstacleSpawnRate = 240;
    this.collectibleSpawnRate = 120;
    this.bgOffset = 0;
    this.animationFrame = 0;
    this.jumpAnimationFrame = 0;
    this.animationSpeed = 4;
    this.validSpritesCount = 0;
    this.validJumpSpritesCount = 0;
    this.recursosCargados = false;
    this.progresoCarga = 0.0;
  }

  liberarRecursos() {
    this.eclosion = [];
    this.feliz = [];
    this.hambre = [];
    this.esperando = [];
    this.sueno = [];
    this.enfermo = [];
    this.comiendo = [];
    this.minijuegoSprites = [];
    this.minijuegoSpritesExtra = [];
    this.fondoMinijuego = null;
    this.collectible1 = null;
    this.collectible2 = null;
    this.obstaculo = null;
    this.recursosCargados = false;
    this.progresoCarga = 0.0;
  }

  async cargarRecursosCompletos() {
    if (this.recursosCargados) {
      this.progresoCarga = 1.0;
      return;
    }
    this.progresoCarga = 0.05;

    let urls = [];

    // 1. Secuencia de Eclosión
    let endFrame = 174;
    let eggPrefix = "";
    if (this.nombre === "Capibara") eggPrefix = "carpincho_huevo_";
    else if (this.nombre === "Yacaré") eggPrefix = "yacare_huevo_";
    else if (this.nombre === "Yaguareté") eggPrefix = "yaguarete_huevo_";
    else if (this.nombre === "Aguará") eggPrefix = "aguara_huevo_";

    for (let i = 0; i <= endFrame; i++) {
      urls.push({
        type: 'eclosion',
        index: i,
        path: this.carpetaRuta + eggPrefix + nf(i, 5) + ".png"
      });
    }

    // 2. Animaciones de Estado (25 frames cada una)
    for (let i = 1; i <= 25; i++) {
      urls.push({ type: 'feliz', index: i - 1, path: `${this.carpetaRuta}feliz${i}.png` });
      urls.push({ type: 'hambre', index: i - 1, path: `${this.carpetaRuta}hambre${i}.png` });
      urls.push({ type: 'esperando', index: i - 1, path: `${this.carpetaRuta}esperando${i}.png` });
      urls.push({ type: 'sueno', index: i - 1, path: `${this.carpetaRuta}sueno${i}.png` });
      urls.push({ type: 'enfermo', index: i - 1, path: `${this.carpetaRuta}enfermo${i}.png` });
    }

    // 3. Secuencia Comiendo
    let startFrameComiendo = -1, endFrameComiendo = -1, prefixComiendo = "";
    if (this.nombre === "Aguará") { startFrameComiendo = 6; endFrameComiendo = 175; prefixComiendo = "Aguará guazú comiendo 2_"; }
    else if (this.nombre === "Capibara") { startFrameComiendo = 6; endFrameComiendo = 214; prefixComiendo = "carpincho_comiendo_"; }
    else if (this.nombre === "Yacaré") { startFrameComiendo = 0; endFrameComiendo = 177; prefixComiendo = "Yacaré_comiendo_"; }
    else if (this.nombre === "Yaguareté") { startFrameComiendo = 0; endFrameComiendo = 135; prefixComiendo = "yaguarete_comiendo_"; }

    if (startFrameComiendo !== -1) {
      for (let i = startFrameComiendo; i <= endFrameComiendo; i++) {
        urls.push({
          type: 'comiendo',
          index: i - startFrameComiendo,
          path: this.carpetaRuta + prefixComiendo + nf(i, 5) + ".png"
        });
      }
    }

    // 4. Fondos y Objetos de Minijuego
    let bgPath = "", coll1Path = "", coll2Path = "", obsPath = "";
    if (this.nombre === "Capibara") {
      bgPath = "data/galeria/river.png"; coll1Path = "mango.png"; coll2Path = "hierba.png"; obsPath = "tronco.png";
    } else if (this.nombre === "Yacaré") {
      bgPath = "data/galeria/river.png"; coll1Path = "pez.png"; coll2Path = "hotspring.png"; obsPath = "roca_agua.png";
    } else if (this.nombre === "Aguará") {
      bgPath = "data/galeria/bosque.jpg"; coll1Path = "fruta.png"; coll2Path = "carne.png"; obsPath = "roca.png";
    } else if (this.nombre === "Yaguareté") {
      bgPath = "data/galeria/bosque.jpg"; coll1Path = "carne.png"; coll2Path = "hueso.png"; obsPath = "espinas.png";
    }

    urls.push({ type: 'minijuegoBg', index: 0, path: bgPath });
    urls.push({ type: 'collectible1', index: 0, path: this.carpetaRuta + coll1Path });
    urls.push({ type: 'collectible2', index: 0, path: this.carpetaRuta + coll2Path });
    urls.push({ type: 'obstaculo', index: 0, path: this.carpetaRuta + obsPath });

    // 5. Sprites del Minijuego (25 frames)
    for (let i = 0; i < 25; i++) {
      let spriteName = (i === 0) ? this.nombre.toLowerCase() + ".png" : this.nombre.toLowerCase() + (i + 1) + ".png";
      urls.push({ type: 'minijuegoSprite', index: i, path: this.carpetaRuta + spriteName });
    }

    // 6. Sprites de Salto para Minijuego Vertical (si aplica)
    if (this.minijuegoTipo === "vertical" && this.nombre !== "Capibara" && this.nombre !== "Yacaré") {
      for (let i = 0; i < 25; i++) {
        let spriteName = (i === 0) ? "salto.png" : "salto" + (i + 1) + ".png";
        urls.push({ type: 'minijuegoSpriteExtra', index: i, path: this.carpetaRuta + spriteName });
      }
    }

    // Realizar la carga asíncrona por lotes (batch)
    let loadedCount = 0;
    let totalCount = urls.length;

    let loadedImages = await loadBatch(urls, () => {
      loadedCount++;
      this.progresoCarga = map(loadedCount, 0, totalCount, 0.05, 1.0);
    });

    // Distribuir imágenes cargadas en sus variables respectivas
    this.eclosion = new Array(175);
    this.feliz = new Array(25);
    this.hambre = new Array(25);
    this.esperando = new Array(25);
    this.sueno = new Array(25);
    this.enfermo = new Array(25);
    let sizeComiendo = (startFrameComiendo !== -1) ? (endFrameComiendo - startFrameComiendo + 1) : 0;
    this.comiendo = new Array(sizeComiendo);
    this.minijuegoSprites = new Array(25);
    this.minijuegoSpritesExtra = new Array(25);

    this.validSpritesCount = 0;
    this.validJumpSpritesCount = 0;

    for (let i = 0; i < urls.length; i++) {
      let u = urls[i];
      let img = loadedImages[i];
      if (!img) continue;

      if (u.type === 'eclosion') this.eclosion[u.index] = img;
      else if (u.type === 'feliz') this.feliz[u.index] = img;
      else if (u.type === 'hambre') this.hambre[u.index] = img;
      else if (u.type === 'esperando') this.esperando[u.index] = img;
      else if (u.type === 'sueno') this.sueno[u.index] = img;
      else if (u.type === 'enfermo') this.enfermo[u.index] = img;
      else if (u.type === 'comiendo') this.comiendo[u.index] = img;
      else if (u.type === 'minijuegoBg') this.fondoMinijuego = img;
      else if (u.type === 'collectible1') this.collectible1 = img;
      else if (u.type === 'collectible2') this.collectible2 = img;
      else if (u.type === 'obstaculo') this.obstaculo = img;
      else if (u.type === 'minijuegoSprite') {
        this.minijuegoSprites[u.index] = img;
        if (img !== defaultImg) this.validSpritesCount++;
      }
      else if (u.type === 'minijuegoSpriteExtra') {
        this.minijuegoSpritesExtra[u.index] = img;
        if (img !== defaultImg) this.validJumpSpritesCount++;
      }
    }

    this.spriteY = height - 250;
    
    // Configurar velocidades del juego
    if (this.nombre === "Capibara" || this.nombre === "Yacaré") {
      this.gameSpeed = 10.0;
      this.collectibleSpawnRate = 60;
      this.canJump = false;
    } else {
      this.gameSpeed = 8.0;
      this.collectibleSpawnRate = 120;
      this.canJump = true;
    }

    this.recursosCargados = true;
    this.progresoCarga = 1.0;
  }

  drawMinijuego() {
    if (this.minijuegoTipo === "vertical") this.drawMinijuegoVertical();
    else this.drawMinijuegoHorizontal();

    if (!this.isGameOver) this.updateGame();
    else drawGameOverScreen(this);

    drawHUD(this);
    this.drawSprite();
  }

  drawSprite() {
    if (this.minijuegoTipo === "vertical" && this.isJumpAnimating && this.validJumpSpritesCount > 0) {
      let frame = Math.floor(this.jumpAnimationFrame / this.animationSpeed);
      if (frame < this.validJumpSpritesCount && this.minijuegoSpritesExtra[frame]) {
        image(this.minijuegoSpritesExtra[frame], Math.floor(this.spriteX), Math.floor(this.spriteY), 120, 120);
      } else {
        image(defaultImg, Math.floor(this.spriteX), Math.floor(this.spriteY), 120, 120);
      }
      this.jumpAnimationFrame++;
      if (this.jumpAnimationFrame >= this.validJumpSpritesCount * this.animationSpeed) {
        this.isJumpAnimating = false;
      }
    } else if (this.validSpritesCount > 0) {
      this.animationFrame = Math.floor(frameCountMini / this.animationSpeed) % this.validSpritesCount;
      if (this.minijuegoSprites[this.animationFrame]) {
        image(this.minijuegoSprites[this.animationFrame], Math.floor(this.spriteX), Math.floor(this.spriteY), 120, 120);
      } else {
        image(defaultImg, Math.floor(this.spriteX), Math.floor(this.spriteY), 120, 120);
      }
    } else {
      image(defaultImg, Math.floor(this.spriteX), Math.floor(this.spriteY), 120, 120);
    }
  }

  drawMinijuegoHorizontal() {
    if (this.fondoMinijuego) {
      this.bgOffset = (this.bgOffset + this.gameSpeed) % width;
      image(this.fondoMinijuego, Math.floor(-this.bgOffset), 0, width, height);
      image(this.fondoMinijuego, Math.floor(-this.bgOffset + width), 0, width, height);
    } else {
      background(20, 30, 50);
    }
  }

  drawMinijuegoVertical() {
    background(0);
    if (this.fondoMinijuego) {
      this.bgOffset = (this.bgOffset + this.gameSpeed / 2) % height;
      image(this.fondoMinijuego, 0, Math.floor(this.bgOffset - height), width, height);
      image(this.fondoMinijuego, 0, Math.floor(this.bgOffset), width, height);
    } else {
      background(20, 100, 150);
      fill(0, 150, 0);
      rect(0, height - 200, width, 200);
    }
  }

  updateGame() {
    frameCountMini++;
    this.spriteY += this.spriteSpeed;
    this.spriteSpeed += this.gravity;
    this.spriteX += this.spriteSpeedX;
    this.spriteX = Math.floor(constrain(this.spriteX, 0, width - 120));

    if (this.spriteY > height - 250) {
      this.spriteY = height - 250;
      this.spriteSpeed = 0;
      this.isJumping = false;
    }

    if (this.minijuegoTipo === "vertical") {
      this.canJump = this.hasPowerUp;
    }

    if (frameCountMini % this.obstacleSpawnRate === 0) this.spawnObstacle();
    if (frameCountMini % this.collectibleSpawnRate === 0) this.spawnCollectible();

    let speedDiv = (this.minijuegoTipo === "vertical") ? 200 : 600;
    let speedInc = (this.minijuegoTipo === "vertical") ? 0.2 : 1.5;
    if (frameCountMini % speedDiv === 0) {
      this.gameSpeed = min(this.gameSpeed + speedInc, 25.0);
    }

    // Actualizar obstáculos
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      let obs = this.obstacles[i];
      if (this.minijuegoTipo === "vertical") obs.y += this.gameSpeed;
      else obs.x -= this.gameSpeed;

      if (this.obstaculo && this.obstaculo !== defaultImg) {
        image(this.obstaculo, Math.floor(obs.x), Math.floor(obs.y), 100, 100);
      } else {
        fill(150);
        rect(Math.floor(obs.x), Math.floor(obs.y), 80, 80);
      }

      // Colisión
      if (this.spriteX + 80 > obs.x && this.spriteX < obs.x + 80 && this.spriteY + 80 > obs.y && this.spriteY < obs.y + 80) {
        if (this.hasPowerUp) {
          this.obstacles.splice(i, 1);
          this.score += 10;
          spawnParticles(obs.x + 40, obs.y + 40, 2, 12);
        } else {
          gameOver(this);
          shakeIntensity = 25.0;
        }
      }
      
      if (obs) {
        if ((this.minijuegoTipo === "vertical" && obs.y > height) || (this.minijuegoTipo === "horizontal" && obs.x + 80 < 0)) {
          this.obstacles.splice(i, 1);
        }
      }
    }

    // Actualizar coleccionables
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      let col = this.collectibles[i];
      if (this.minijuegoTipo === "vertical") col.y += this.gameSpeed;
      else col.x -= this.gameSpeed;

      if (col.z === 0 && this.collectible1) {
        image(this.collectible1, Math.floor(col.x), Math.floor(col.y), 60, 60);
      } else if (col.z === 1 && this.collectible2) {
        image(this.collectible2, Math.floor(col.x), Math.floor(col.y), 60, 60);
      } else {
        fill(150);
        rect(Math.floor(col.x), Math.floor(col.y), 50, 50);
      }

      // Colisión coleccionable
      if (dist(this.spriteX + 60, this.spriteY + 60, col.x + 30, col.y + 30) < 60) {
        if (col.z === 0) {
          this.score += 20;
          spawnParticles(col.x + 30, col.y + 30, 2, 8);
          if (!muted && collectSound) collectSound.play();
        } else {
          this.hasPowerUp = true;
          this.powerUpTimer = (this.minijuegoTipo === "vertical") ? 300 : 150;
          spawnParticles(col.x + 30, col.y + 30, 0, 12);
          if (!muted && powerupSound) powerupSound.play();
        }
        this.collectibles.splice(i, 1);
      }
      
      if (col) {
        if ((this.minijuegoTipo === "vertical" && col.y > height) || (this.minijuegoTipo === "horizontal" && col.x + 50 < 0)) {
          this.collectibles.splice(i, 1);
        }
      }
    }

    if (this.hasPowerUp && --this.powerUpTimer <= 0) {
      this.hasPowerUp = false;
    }
    this.score += 1;
  }

  spawnObstacle() {
    let validPosition;
    let newObstacle;
    let attempts = 0;
    do {
      validPosition = true;
      if (this.minijuegoTipo === "vertical") {
        let pos = random(50, width - 150);
        newObstacle = createVector(pos, -80, 0);
      } else {
        newObstacle = createVector(width, height - 200, random(1) < 0.5 ? 1 : 0);
      }
      for (let obs of this.obstacles) {
        if (abs(newObstacle.x - obs.x) < 200) {
          validPosition = false;
          break;
        }
      }
    } while (!validPosition && ++attempts < 10);
    this.obstacles.push(newObstacle);
  }

  spawnCollectible() {
    let validPosition;
    let newCollectible;
    let attempts = 0;
    do {
      validPosition = true;
      let isSpecial = random(1) < 0.2;
      if (this.minijuegoTipo === "vertical") {
        let pos = random(50, width - 150);
        newCollectible = createVector(pos, -80, isSpecial ? 1 : 0);
      } else {
        newCollectible = createVector(width, random(height - 400, height - 250), isSpecial ? 1 : 0);
      }
      for (let obs of this.obstacles) {
        if (abs(newCollectible.x - obs.x) < 200) {
          validPosition = false;
          break;
        }
      }
    } while (!validPosition && ++attempts < 10);
    this.collectibles.push(newCollectible);
  }
}

class Capibara extends Personaje { constructor(carpeta) { super("Capibara", carpeta, "vertical"); } }
class Yaca extends Personaje { constructor(carpeta) { super("Yacaré", carpeta, "vertical"); } }
class Aguara extends Personaje { constructor(carpeta) { super("Aguará", carpeta, "horizontal"); } }
class Yaguarete extends Personaje { constructor(carpeta) { super("Yaguareté", carpeta, "horizontal"); } }

// --- FUNCIONES UTILITARIAS ---

function nf(num, size) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

// Carga asíncrona por lotes (Batch) para evitar bloquear el navegador
async function loadBatch(urls, onLoadItem) {
  const batchSize = 15;
  const results = new Array(urls.length);
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const promises = batch.map((urlObj, index) => {
      const idx = i + index;
      return new Promise((resolve) => {
        loadImage(urlObj.path, (img) => {
          onLoadItem();
          results[idx] = img;
          resolve(img);
        }, () => {
          console.warn("Fallo cargando: " + urlObj.path);
          onLoadItem();
          results[idx] = defaultImg;
          resolve(defaultImg);
        });
      });
    });
    await Promise.all(promises);
  }
  return results;
}

function limpiarMemoria() {
  for (let p of personajes) p.liberarRecursos();
  console.log("--- MEMORIA LIBERADA ---");
}

// --- SISTEMA DE GUARDADO/CARGA DE LAYOUT ---

function guardarLayout() {
  let json = {};
  for (let i = 0; i < 6; i++) {
    json[nombresBotones[i] + "_x"] = botonX[i];
    json[nombresBotones[i] + "_y"] = botonY[i];
  }
  json["personajeX"] = personajeX;
  json["personajeY"] = personajeY;
  json["huevoX"] = Math.floor(huevoX);
  json["huevoY"] = Math.floor(huevoY);
  json["barraX"] = barraX;
  json["barraY"] = barraY;
  
  localStorage.setItem('baby_ibera_layout_ui', JSON.stringify(json));
  console.log("LAYOUT GUARDADO");
}

function cargarLayout() {
  let data = localStorage.getItem('baby_ibera_layout_ui');
  if (data) {
    try {
      let json = JSON.parse(data);
      for (let i = 0; i < 6; i++) {
        if (json[nombresBotones[i] + "_x"] !== undefined) {
          botonX[i] = json[nombresBotones[i] + "_x"];
          botonY[i] = json[nombresBotones[i] + "_y"];
        }
      }
      personajeX = json["personajeX"] !== undefined ? json["personajeX"] : 532;
      personajeY = json["personajeY"] !== undefined ? json["personajeY"] : 626;
      huevoX = json["huevoX"] !== undefined ? json["huevoX"] : 522;
      huevoY = json["huevoY"] !== undefined ? json["huevoY"] : 704;
      barraX = json["barraX"] !== undefined ? json["barraX"] : 81;
      barraY = json["barraY"] !== undefined ? json["barraY"] : 70;
      return;
    } catch (e) {
      setDefaultsPos();
    }
  }
  setDefaultsPos();
}

function setDefaultsPos() {
  botonX[0] = 887; botonY[0] = 307; // btn_comer
  botonX[1] = 890; botonY[1] = 468; // btn_curar
  botonX[2] = 891; botonY[2] = 635; // btn_jugar
  botonX[3] = 893; botonY[3] = 800; // btn_dormir
  botonX[4] = 880; botonY[4] = 64;  // btn_sonido
  botonX[5] = 726; botonY[5] = 63;  // btn_reiniciar
  personajeX = 532;
  personajeY = 626;
  huevoX = 522;
  huevoY = 704;
  barraX = 81;
  barraY = 70;
}

// --- SETUP & PRELOAD ---

function preload() {
  portada = loadImage("portada.png");
  botonJugarPortada = loadImage("boton_jugar.png");
  introImg = loadImage("data/galeria/intro.png");
  fondo = loadImage("data/galeria/fondo.png");
  noche = loadImage("data/galeria/noche.png");

  botonComer = loadImage("data/galeria/boton_comer.png");
  botonCurar = loadImage("data/galeria/boton_curar.png");
  botonJugar = loadImage("data/galeria/boton_jugar.png");
  botonDormir = loadImage("data/galeria/boton_dormir.png");
  botonSonido = loadImage("data/galeria/boton_sonido.png");
  botonSilencio = loadImage("data/galeria/boton_silencio.png");
  botonReiniciar = loadImage("data/galeria/boton_reiniciar.png");

  flechaIzq = loadImage("data/galeria/flecha_izq.png");
  flechaDer = loadImage("data/galeria/flecha_der.png");

  for (let i = 0; i < 4; i++) {
    fondosGaleria[i] = loadImage("data/Fondo/habitaciones_" + (i + 1) + ".png");
  }

  // Cargar huevos de los personajes
  huevoCapibara = loadImage("data/capibara/Huevo.png");
  huevoYaca = loadImage("data/Yaca/Huevo.png");
  huevoAguara = loadImage("data/Aguara/Huevo.png");
  huevoYaguarete = loadImage("data/Yaguarete/Huevo.png");

  botonSi = [];
  botonNo = [];
  for (let i = 0; i < 3; i++) {
    botonSi[i] = loadImage("data/galeria/Boton_si_" + i + ".png");
    botonNo[i] = loadImage("data/galeria/Boton_no_" + i + ".png");
  }

  // Cargar sonidos de manera segura
  if (typeof loadSound === 'function') {
    try {
      soundFormats('mp3');
      jumpSound = loadSound("data/sounds/salto.mp3");
      collectSound = loadSound("data/sounds/coleccionar.mp3");
      powerupSound = loadSound("data/sounds/powerup.mp3");
      backgroundMusic = loadSound("data/sounds/tema2.mp3");
      tamagotchiMusic = loadSound("data/sounds/tamagotchi_music.mp3");
      burbujaSound = loadSound("data/sounds/burbuja.mp3");
      zSound = loadSound("data/sounds/z.mp3");
    } catch (e) {
      console.warn("Fallo al cargar sonidos de p5.sound:", e);
      jumpSound = null;
      collectSound = null;
      powerupSound = null;
      backgroundMusic = null;
      tamagotchiMusic = null;
      burbujaSound = null;
      zSound = null;
    }
  } else {
    console.warn("Librería p5.sound no detectada. Los sonidos estarán desactivados.");
    jumpSound = null;
    collectSound = null;
    powerupSound = null;
    backgroundMusic = null;
    tamagotchiMusic = null;
    burbujaSound = null;
    zSound = null;
  }

  // Cargar GIF de carga
  awtGif = loadImage("triple_n.gif");
}

function setup() {
  let canvas = createCanvas(1080, 1080);
  canvas.parent('game-container');
  frameRate(60);

  // Detectar pantalla táctil
  isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  setDefaultsPos();
  cargarLayout();

  // Crear e inicializar reproductor de video
  try {
    introPelicula = createVideo(['data/triple_M.mp4']);
    introPelicula.hide();
    introPelicula.elt.onended = () => {
      if (estado === -0.5) {
        introPelicula.stop();
        estado = -5.0;
      }
    };
  } catch (e) {
    console.error("Error cargando video:", e);
  }

  // Crear instancias de personajes y asociar huevos pre-cargados
  personajes.push(new Capibara("data/capibara/"));
  personajes.push(new Yaca("data/Yaca/"));
  personajes.push(new Aguara("data/Aguara/"));
  personajes.push(new Yaguarete("data/Yaguarete/"));

  personajes[0].huevo = huevoCapibara;
  personajes[1].huevo = huevoYaca;
  personajes[2].huevo = huevoAguara;
  personajes[3].huevo = huevoYaguarete;

  personajeIdx = 0;
  personajeActual = personajes[personajeIdx];
  carruselTarget = -personajeIdx * 350;

  ultimaActualizacion = Date.now();

  defaultImg = createImage(350, 350);
  defaultImg.loadPixels();
  for (let i = 0; i < defaultImg.width * defaultImg.height * 4; i += 4) {
    defaultImg.pixels[i] = 150;
    defaultImg.pixels[i + 1] = 150;
    defaultImg.pixels[i + 2] = 150;
    defaultImg.pixels[i + 3] = 255;
  }
  defaultImg.updatePixels();

  // Escuchar botón HTML para desbloqueo de AudioContext
  let startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      function iniciarJuego() {
        let overlay = document.getElementById('start-overlay');
        if (overlay) overlay.classList.add('hidden');
        estado = -1.0;
        introTimer = 0;
      }

      if (typeof userStartAudio === 'function') {
        userStartAudio().then(() => {
          iniciarJuego();
        }).catch((e) => {
          console.warn("No se pudo inicializar AudioContext, iniciando juego de todos modos:", e);
          iniciarJuego();
        });
      } else {
        console.warn("userStartAudio no está definido, iniciando juego sin él");
        iniciarJuego();
      }
    });
  }
}

// --- LOGICA PRINCIPAL DE CARGA Y PINTADO ---

function iniciarCargaHilo() {
  estado = -2.6;
  barraSuave = 0.0;
  ejecutarCargaSegundoPlano();
}

async function ejecutarCargaSegundoPlano() {
  limpiarMemoria();
  await personajeActual.cargarRecursosCompletos();
  setTimeout(() => {
    estado = -2.5;
    saveGameState();
  }, 500);
}

async function cargarYJugar() {
  limpiarMemoria();
  await personajeActual.cargarRecursosCompletos();
  setTimeout(() => {
    actualizarEstadisticasDesdeUltimaVez();
    carruselTarget = -personajeIdx * 350;
    carruselOffset = carruselTarget;
    carruselTargetFondo = -fondoIdx * 350;
    carruselOffsetFondo = carruselTargetFondo;
    
    fondo2 = fondosGaleria[fondoIdx];
    estado = 1.0;
  }, 500);
}

function dibujarPantallaCarga() {
  if (awtGif) {
    image(awtGif, 0, 0, width, height);
  } else {
    background(20, 20, 25);
  }

  fill(255);
  textSize(40);
  textAlign(CENTER, BOTTOM);
  text("Cargando " + personajeActual.nombre + "...", width / 2, height / 2 - 50);

  let anchoBarra = 600;
  let altoBarra = 30;
  let xBarra = (width - anchoBarra) / 2;
  let yBarra = height / 2;

  // Dibujo track fondo barra
  fill(30, 45, 70, 180);
  stroke(100, 150, 255, 100);
  strokeWeight(2);
  rect(xBarra, yBarra, anchoBarra, altoBarra, 15);
  noStroke();

  // Progreso lerpeado suave
  barraSuave = lerp(barraSuave, personajeActual.progresoCarga, 0.1);
  let anchoActual = anchoBarra * barraSuave;

  if (anchoActual > 5) {
    fill(50, 150, 255);
    rect(xBarra, yBarra, anchoActual, altoBarra, 15);

    fill(255, 40);
    rect(xBarra, yBarra, anchoActual, altoBarra / 2, 15);
  }

  fill(255);
  textSize(24);
  textAlign(CENTER, TOP);
  text(Math.floor(barraSuave * 100) + "%", width / 2, yBarra + altoBarra + 15);
}

function dibujarModoEditor() {
  if (modoEditor) {
    if (frameCount % 60 < 30) {
      fill(255, 0, 0);
      textSize(30);
      textAlign(CENTER, TOP);
      text("MODO EDITOR ACTIVADO", width / 2, 20);
      textSize(20);
      text("Presiona 'G' para Guardar | 'E' para Salir", width / 2, 55);
    }
    noFill();
    stroke(0, 255, 0);
    strokeWeight(2);
    for (let i = 0; i < 6; i++) {
      if (i === elementoSeleccionado) stroke(255, 255, 0); else stroke(0, 255, 0);
      rect(botonX[i], botonY[i], botonW, botonH);
      fill(255);
      textSize(14);
      textAlign(CENTER, CENTER);
      text(nombresBotones[i], botonX[i] + botonW / 2, botonY[i] + botonH / 2);
      noFill();
    }
    if (elementoSeleccionado === 10) stroke(255, 255, 0); else stroke(0, 255, 0);
    rect(personajeX - 225, personajeY - 225, 450, 450);
    fill(255);
    textAlign(CENTER);
    text("Personaje", personajeX, personajeY);
    noFill();
    if (elementoSeleccionado === 11) stroke(255, 255, 0); else stroke(0, 255, 0);
    rect(huevoX - 175, huevoY - 175, 350, 350);
    fill(255);
    text("Huevo", huevoX, huevoY);
    noFill();
    if (elementoSeleccionado === 12) stroke(255, 255, 0); else stroke(0, 255, 0);
    rect(barraX, barraY, 300, 160);
    fill(255);
    text("Barras", barraX + 150, barraY + 80);
    noFill();
  }
}

function draw() {
  if (estado === -6.0) {
    background(0);
    if (portada) image(portada, 0, 0, width, height);
    return;
  }

  // Manejo de transiciones con fundido a negro
  if (estado !== lastEstado) {
    fadeAlpha = 255;
    lastEstado = estado;
  }

  // Actualizar escalas
  updateButtonScales();
  updateConfirmButtonScales();

  // Interpolación suave estadísticas
  hambreVisual = lerp(hambreVisual, hambre, 0.1);
  felicidadVisual = lerp(felicidadVisual, felicidad, 0.1);
  saludVisual = lerp(saludVisual, salud, 0.1);
  energiaVisual = lerp(energiaVisual, energia, 0.1);

  // Efecto shake
  push();
  if (shakeIntensity > 0.1) {
    translate(random(-shakeIntensity, shakeIntensity), random(-shakeIntensity, shakeIntensity));
    shakeIntensity *= 0.85;
  }

  // Emisión pasiva partículas dormir
  if (durmiendo && estado === 1.0 && frameCount % 45 === 0) {
    spawnParticles(width / 2, height / 2 + 100, 4, 1);
  }
  // Emisión pasiva comida
  if (comiendo && estado === 1.0 && frameCount % 12 === 0) {
    spawnParticles(personajeX, personajeY, 3, 2);
  }

  // Lógica principal de pintado de estados
  if (estado === -5.0) dibujarPantallaInicio();
  else if (estado === -3.0) dibujarSeleccionPersonaje();
  else if (estado === -2.75) dibujarConfirmacionPersonaje();
  else if (estado === -2.6) dibujarPantallaCarga();
  else if (estado === -2.5) dibujarSeleccionFondo();
  else if (estado === -2.0) dibujarMenuInicial();
  else if (estado === -4.0) dibujarConfirmarReinicio();
  else {
    actualizarEstadisticas();
    if (estado === -1.0) {
      background(0);
      if (introImg) {
        let alpha = 255;
        if (introTimer >= 4) alpha = map(introTimer, 4, 6, 255, 0);
        tint(255, alpha);
        image(introImg, 0, 0, width, height);
        noTint();
      }
      introTimer += 0.033;
      if (introTimer >= 6) {
        estado = -0.5;
        introTimer = 0;
        if (introPelicula) introPelicula.play();
      }
    } else if (estado === -0.5) {
      background(0);
      if (introPelicula) {
        image(introPelicula, 0, 0, width, height);
        // Fallback si onended de p5 no dispara
        if (introPelicula.time() >= introPelicula.duration() - 0.1 && introPelicula.duration() > 0) {
          introPelicula.stop();
          estado = -5.0;
        }
      } else {
        estado = -5.0;
      }
      introTimer += 0.033;
    } else if (estado === 0.0) {
      background(0);
      if (!fondo2) fondo2 = fondosGaleria[fondoIdx];
      if (fondo2) image(fondo2, 0, 0, width, height);
      dibujarHuevo();
      tiempoNacimiento += 0.033;
      if (tiempoNacimiento >= 5) estado = 1.0;
      dibujarBotonesHUD();
    } else if (estado === 1.0) {
      background(0);
      if (!fondo2) fondo2 = fondosGaleria[fondoIdx];
      if (fondo2) image(fondo2, 0, 0, width, height);

      if (durmiendo) {
        dibujarDormir();
        dibujarBotonesHUD();
      } else {
        dibujarTamagotchi();
        dibujarBarras();
        dibujarBotones();
        dibujarBotonesHUD();
      }
    } else if (estado === 2.0) {
      personajeActual.drawMinijuego();
      dibujarBotonesHUD();
      dibujarTutorial();
      
      // Manejo de entrada táctil para móviles en minijuegos
      manejarControlesTactiles();

      if (personajeActual.isGameOver && keyIsPressed && key === 'r') {
        restartGame();
        estado = 1.0;
      }
    }
    dibujarModoEditor();
  }

  // Partículas
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.draw();
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }

  pop(); // Cierra efecto shake

  // Dibujar capa de fundido de pantalla
  if (fadeAlpha > 0) {
    fill(0, fadeAlpha);
    noStroke();
    rect(0, 0, width, height);
    fadeAlpha = max(fadeAlpha - 15, 0);
  }
}

function dibujarPantallaInicio() {
  if (portada) image(portada, 0, 0, width, height);
  else {
    background(0); fill(255); textSize(50); textAlign(CENTER, CENTER); text("Cargando...", width / 2, height / 2);
  }

  if (botonJugarPortada) {
    let bW = 400;
    let bH = 150;
    push();
    translate(width / 2, height / 2 + 150 + bH / 2);
    scale(portadaJugarScale);
    if (portadaJugarScale > 1.05) tint(255); else tint(210);
    image(botonJugarPortada, -bW / 2, -bH / 2, bW, bH);
    noTint();
    pop();
  } else {
    fill(0, 200, 0);
    rect(width / 2 - 200, height / 2 + 150, 400, 150);
    fill(255);
    textSize(40);
    textAlign(CENTER, CENTER);
    text("Jugar", width / 2, height / 2 + 225);
  }
}

function dibujarSeleccionPersonaje() {
  background(0);
  if (fondo) image(fondo, 0, 0, width, height);
  carruselOffset += (carruselTarget - carruselOffset) * 0.2;
  // Implementación en JS
  for (let i = 0; i < personajes.length; i++) {
    let offset = (i * 350) + carruselOffset;
    let x = width / 2 + offset;
    let scaleVal = (i === personajeIdx) ? 1.0 : 0.7;
    let alphaVal = (i === personajeIdx) ? 255 : 150;

    push();
    translate(x, height / 2 - 50);
    scale(scaleVal);
    tint(255, alphaVal);
    if (personajes[i].huevo) {
      imageMode(CENTER);
      image(personajes[i].huevo, 0, 0, 350, 350);
      imageMode(CORNER);
    } else {
      fill(150);
      rectMode(CENTER);
      rect(0, 0, 350, 350);
      rectMode(CORNER);
    }
    noTint();
    pop();

    if (i === personajeIdx) {
      let borderPulse = 1.0 + sin(frameCount * 0.1) * 0.03;
      push();
      translate(x, height / 2 - 50);
      scale(borderPulse);
      noFill();
      stroke(255, 200 + sin(frameCount * 0.1) * 55);
      strokeWeight(4);
      rectMode(CENTER);
      rect(0, 0, 350, 350, 20);
      rectMode(CORNER);
      noStroke();
      pop();

      fill(255);
      textSize(42);
      textAlign(CENTER, CENTER);
      text(personajes[i].nombre, width / 2, height / 2 + 200);
    }
  }

  // Flecha Izquierda animada
  push();
  translate(50 + 40, height / 2 - 40 + 40);
  scale(arrowIzqScale);
  if (arrowIzqScale > 1.05) tint(255); else tint(200);
  if (flechaIzq) image(flechaIzq, -40, -40, 80, 80);
  noTint();
  pop();

  // Flecha Derecha animada
  push();
  translate(width - 130 + 40, height / 2 - 40 + 40);
  scale(arrowDerScale);
  if (arrowDerScale > 1.05) tint(255); else tint(200);
  if (flechaDer) image(flechaDer, -40, -40, 80, 80);
  noTint();
  pop();
}

function dibujarConfirmacionPersonaje() {
  background(0);
  if (fondo) image(fondo, 0, 0, width, height);
  if (panelConfirmacion) {
    image(panelConfirmacion, 0, 0, width, height);
  }
  let frameSi = botonSiPressed ? 1 : 0;
  let frameNo = botonNoPressed ? 1 : 0;

  // Botón Sí
  push();
  translate(width / 2 - 180 + 60, height / 2 + 100 + 60);
  scale(confirmSiScale);
  if (confirmSiScale > 1.05) tint(255); else tint(210);
  if (botonSi[frameSi]) image(botonSi[frameSi], -60, -60, 120, 120);
  noTint();
  pop();

  // Botón No
  push();
  translate(width / 2 + 60 + 60, height / 2 + 100 + 60);
  scale(confirmNoScale);
  if (confirmNoScale > 1.05) tint(255); else tint(210);
  if (botonNo[frameNo]) image(botonNo[frameNo], -60, -60, 120, 120);
  noTint();
  pop();
}

function dibujarSeleccionFondo() {
  background(0);
  if (fondo) image(fondo, 0, 0, width, height);
  carruselOffsetFondo += (carruselTargetFondo - carruselOffsetFondo) * 0.2;

  for (let i = 0; i < fondosGaleria.length; i++) {
    let offset = (i * 350) + carruselOffsetFondo;
    let x = width / 2 + offset;
    let scaleVal = (i === fondoIdx) ? 1.0 : 0.7;
    let alphaVal = (i === fondoIdx) ? 255 : 150;

    push();
    translate(x, height / 2);
    scale(scaleVal);
    tint(255, alphaVal);
    if (fondosGaleria[i]) {
      imageMode(CENTER);
      image(fondosGaleria[i], 0, 0, 300, 300);
      imageMode(CORNER);
    } else {
      fill(150);
      rectMode(CENTER);
      rect(0, 0, 300, 300);
      rectMode(CORNER);
    }
    noTint();
    pop();

    if (i === fondoIdx) {
      let borderPulse = 1.0 + sin(frameCount * 0.1) * 0.03;
      push();
      translate(x, height / 2);
      scale(borderPulse);
      noFill();
      stroke(255, 200 + sin(frameCount * 0.1) * 55);
      strokeWeight(4);
      rectMode(CENTER);
      rect(0, 0, 300, 300, 20);
      rectMode(CORNER);
      noStroke();
      pop();

      fill(255);
      textSize(42);
      textAlign(CENTER, CENTER);
      text(nombresFondos[i], width / 2, height / 2 + 200);
    }
  }

  // Flechas
  push();
  translate(50 + 40, height / 2 - 40 + 40);
  scale(arrowIzqScale);
  if (arrowIzqScale > 1.05) tint(255); else tint(200);
  if (flechaIzq) image(flechaIzq, -40, -40, 80, 80);
  noTint();
  pop();

  push();
  translate(width - 130 + 40, height / 2 - 40 + 40);
  scale(arrowDerScale);
  if (arrowDerScale > 1.05) tint(255); else tint(200);
  if (flechaDer) image(flechaDer, -40, -40, 80, 80);
  noTint();
  pop();
}

function dibujarMenuInicial() {
  background(0);
  fill(255);
  textSize(50);
  textAlign(CENTER, CENTER);
  text("¿Continuar (C) o Reiniciar (R)?", width / 2, height / 2);
}

function dibujarConfirmarReinicio() {
  background(0);
  if (fondo) image(fondo, 0, 0, width, height);
  fill(0, 150);
  rect(0, 0, width, height);
  fill(255);
  textSize(40);
  textAlign(CENTER, CENTER);
  text("¿Reiniciar? (S/N)", width / 2, height / 2);
}

function actualizarEstadisticas() {
  let ahora = Date.now();
  let segundosTranscurridos = (ahora - ultimaActualizacion) / 1000.0;
  ultimaActualizacion = ahora;

  if (!durmiendo) {
    hambre -= 0.05 * segundosTranscurridos;
    felicidad -= 0.03 * segundosTranscurridos;
    salud -= 0.01 * segundosTranscurridos;
    energia -= 0.04 * segundosTranscurridos;

    if (hambre < 30) felicidad -= 0.05 * segundosTranscurridos;
    if (hambre < 10) salud -= 0.05 * segundosTranscurridos;
    if (energia < 30) felicidad -= 0.05 * segundosTranscurridos;
    if (felicidad < 40) salud -= 0.02 * segundosTranscurridos;

    if (zSound && zSound.isPlaying()) zSound.stop();
  } else {
    if (!muted && zSound && !zSound.isPlaying()) zSound.loop();
    energia += 0.06 * segundosTranscurridos;
    if (energia > 100) energia = 100;
    tiempoDormir -= segundosTranscurridos;
    if (tiempoDormir <= 0) {
      durmiendo = false;
      if (zSound && zSound.isPlaying()) zSound.stop();
    }
  }

  hambre = constrain(hambre, 0, 100);
  felicidad = constrain(felicidad, 0, 100);
  salud = constrain(salud, 0, 100);
  energia = constrain(energia, 0, 100);

  if (comiendo) {
    tiempoComiendo += 0.033;
    if (personajeActual.comiendo && personajeActual.comiendo.length > 0) {
      let totalFrames = personajeActual.comiendo.length;
      let frameRateAnim = 30;
      let currentFrame = Math.floor(tiempoComiendo * frameRateAnim) % totalFrames;
      if (currentFrame === totalFrames - 1) {
        comiendo = false;
        tiempoComiendo = 0;
        hambre = min(hambre + 20, 100.0);
        felicidad = min(felicidad + 10, 100.0);
      }
    } else {
      comiendo = false;
    }
  }
}

function actualizarEstadisticasDesdeUltimaVez() {
  let ahora = Date.now();
  let segundosTranscurridos = (ahora - ultimaActualizacion) / 1000.0;
  ultimaActualizacion = ahora;

  hambre -= 0.05 * segundosTranscurridos;
  felicidad -= 0.03 * segundosTranscurridos;
  salud -= 0.01 * segundosTranscurridos;
  energia -= 0.04 * segundosTranscurridos;

  hambre = constrain(hambre, 0, 100);
  felicidad = constrain(felicidad, 0, 100);
  salud = constrain(salud, 0, 100);
  energia = constrain(energia, 0, 100);
}

function dibujarHuevo() {
  imageMode(CENTER);
  if (personajeActual.eclosion && personajeActual.eclosion.length > 0 && tiempoNacimiento >= 0) {
    let totalFrames = personajeActual.eclosion.length;
    let frameRateVal = 30;
    let currentFrame = Math.floor(tiempoNacimiento * frameRateVal) % totalFrames;
    if (currentFrame < totalFrames && personajeActual.eclosion[currentFrame]) {
      image(personajeActual.eclosion[currentFrame], huevoX, huevoY, 350, 350);
    } else if (personajeActual.huevo) {
      image(personajeActual.huevo, huevoX, huevoY, 350, 350);
    }
  } else if (personajeActual.huevo) {
    image(personajeActual.huevo, huevoX, huevoY, 350, 350);
  }
  imageMode(CORNER);
}

function dibujarTamagotchi() {
  let estadoActual = personajeActual.esperando;
  let frame = Math.floor(frameCount / 6) % 25;

  if (comiendo && personajeActual.comiendo && personajeActual.comiendo.length > 0) {
    estadoActual = personajeActual.comiendo;
    let totalFrames = estadoActual.length;
    frame = Math.floor(tiempoComiendo * 30) % totalFrames;
  } else {
    if (comiendo) estadoActual = personajeActual.comiendo;
    else if (hambre <= 50) estadoActual = personajeActual.hambre;
    else if (salud <= 50) estadoActual = personajeActual.enfermo;
    else if (energia <= 50) estadoActual = personajeActual.sueno;
    else if (felicidad <= 50) estadoActual = personajeActual.enfermo;
    else estadoActual = personajeActual.feliz;
  }

  imageMode(CENTER);
  if (estadoActual && frame < estadoActual.length && estadoActual[frame]) {
    image(estadoActual[frame], personajeX, personajeY, 450, 450);
  }
  imageMode(CORNER);
}

function dibujarDormir() {
  if (noche) {
    image(noche, 0, 0, width, height);
    if (random(1) < 0.005) {
      fill(255);
      textSize(40);
      text("zzzzz", random(width - 50), random(height - 20));
    }
  } else {
    background(0);
    fill(50);
    rect(0, 0, width, height);
  }

  if (tiempoDormir > 0) {
    fill(0, map(tiempoDormir, 60, 0, 0, 150));
    rect(0, 0, width, height);
  }
}

function dibujarBarras() {
  push();
  translate(barraX, barraY);

  // Vidrio glassmorphic
  fill(30, 45, 70, 180);
  stroke(100, 150, 255, 100);
  strokeWeight(2);
  rect(0, 0, 300, 160, 18);
  noStroke();

  let barW = 250;
  let barH = 16;
  let startX = 25;

  // Hambre
  fill(40, 50, 65);
  rect(startX, 24, barW, barH, 8);
  fill(255, 100, 100);
  rect(startX, 24, map(hambreVisual, 0, 100, 0, barW), barH, 8);
  fill(255, 30);
  rect(startX, 24, map(hambreVisual, 0, 100, 0, barW), barH / 2, 8);
  fill(255);
  textSize(14);
  textAlign(LEFT, CENTER);
  text("Hambre", startX + 10, 32);

  // Felicidad
  fill(40, 50, 65);
  rect(startX, 56, barW, barH, 8);
  fill(255, 200, 90);
  rect(startX, 56, map(felicidadVisual, 0, 100, 0, barW), barH, 8);
  fill(255, 30);
  rect(startX, 56, map(felicidadVisual, 0, 100, 0, barW), barH / 2, 8);
  fill(255);
  text("Felicidad", startX + 10, 64);

  // Salud
  fill(40, 50, 65);
  rect(startX, 88, barW, barH, 8);
  fill(100, 240, 100);
  rect(startX, 88, map(saludVisual, 0, 100, 0, barW), barH, 8);
  fill(255, 30);
  rect(startX, 88, map(saludVisual, 0, 100, 0, barW), barH / 2, 8);
  fill(255);
  text("Salud", startX + 10, 96);

  // Energía
  fill(40, 50, 65);
  rect(startX, 120, barW, barH, 8);
  fill(90, 180, 255);
  rect(startX, 120, map(energiaVisual, 0, 100, 0, barW), barH, 8);
  fill(255, 30);
  rect(startX, 120, map(energiaVisual, 0, 100, 0, barW), barH / 2, 8);
  fill(255);
  text("Energía", startX + 10, 128);

  pop();
}

function dibujarBotones() {
  let botonSprites = [botonComer, botonCurar, botonJugar, botonDormir];
  for (let i = 0; i < 4; i++) {
    let offsetY = sin(frameCount * 0.05 + i) * 5;
    push();
    translate(botonX[i] + botonW / 2, botonY[i] + botonH / 2 + offsetY);
    scale(btnScale[i]);
    if (btnScale[i] > 1.05) tint(255);
    else if (btnScale[i] < 0.95) tint(150);
    else tint(210);
    if (botonSprites[i]) image(botonSprites[i], -botonW / 2, -botonH / 2, botonW, botonH);
    noTint();
    pop();
  }
}

function dibujarBotonesHUD() {
  let soundImg = muted ? botonSilencio : botonSonido;

  let offsetY4 = sin(frameCount * 0.05 + 4) * 5;
  push();
  translate(botonX[4] + botonW / 2, botonY[4] + botonH / 2 + offsetY4);
  scale(btnScale[4]);
  if (btnScale[4] > 1.05) tint(255);
  else if (btnScale[4] < 0.95) tint(150);
  else tint(210);
  if (soundImg) image(soundImg, -botonW / 2, -botonH / 2, botonW, botonH);
  noTint();
  pop();

  let offsetY5 = sin(frameCount * 0.05 + 5) * 5;
  push();
  translate(botonX[5] + botonW / 2, botonY[5] + botonH / 2 + offsetY5);
  scale(btnScale[5]);
  if (btnScale[5] > 1.05) tint(255);
  else if (btnScale[5] < 0.95) tint(150);
  else tint(210);
  if (botonReiniciar) image(botonReiniciar, -botonW / 2, -botonH / 2, botonW, botonH);
  noTint();
  pop();
}

function dibujarTutorial() {
  fill(255);
  textSize(30);
  textAlign(CENTER, BOTTOM);
  if (isTouchDevice) {
    text("Usa los controles táctiles en pantalla", width / 2, height - 20);
  } else {
    text("< A Izquierda    D Derecha >    Salta: Espacio", width / 2, height - 20);
  }
}

function spawnParticles(x, y, type, count) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, type));
  }
}

function updateButtonScales() {
  for (let i = 0; i < 6; i++) {
    let target = 1.0;
    if (mouseX > botonX[i] && mouseX < botonX[i] + botonW && mouseY > botonY[i] && mouseY < botonY[i] + botonH) {
      target = (mouseIsPressed && mouseButton === LEFT) ? 0.9 : 1.15;
    }
    btnScale[i] = lerp(btnScale[i], target, 0.2);
  }
}

function updateConfirmButtonScales() {
  if (estado === -2.75) {
    let siX = width / 2 - 180;
    let siY = height / 2 + 100;
    let targetSi = 1.0;
    if (mouseX > siX && mouseX < siX + 120 && mouseY > siY && mouseY < siY + 120) {
      targetSi = (mouseIsPressed && mouseButton === LEFT) ? 0.9 : 1.15;
    }
    confirmSiScale = lerp(confirmSiScale, targetSi, 0.2);

    let noX = width / 2 + 60;
    let noY = height / 2 + 100;
    let targetNo = 1.0;
    if (mouseX > noX && mouseX < noX + 120 && mouseY > noY && mouseY < noY + 120) {
      targetNo = (mouseIsPressed && mouseButton === LEFT) ? 0.9 : 1.15;
    }
    confirmNoScale = lerp(confirmNoScale, targetNo, 0.2);
  }

  if (estado === -5.0 && botonJugarPortada) {
    let bW = 400;
    let bH = 150;
    let bX = width / 2 - bW / 2;
    let bY = height / 2 + 150;
    let target = 1.0;
    if (mouseX > bX && mouseX < bX + bW && mouseY > bY && mouseY < bY + bH) {
      target = (mouseIsPressed && mouseButton === LEFT) ? 0.9 : 1.1;
    }
    portadaJugarScale = lerp(portadaJugarScale, target, 0.2);
  }

  if (estado === -3.0 || estado === -2.5) {
    let targetIzq = 1.0;
    if (mouseX >= 50 && mouseX <= 130 && mouseY >= height / 2 - 40 && mouseY <= height / 2 + 40) {
      targetIzq = (mouseIsPressed && mouseButton === LEFT) ? 0.9 : 1.2;
    }
    arrowIzqScale = lerp(arrowIzqScale, targetIzq, 0.2);

    let targetDer = 1.0;
    if (mouseX >= width - 130 && mouseX <= width - 50 && mouseY >= height / 2 - 40 && mouseY <= height / 2 + 40) {
      targetDer = (mouseIsPressed && mouseButton === LEFT) ? 0.9 : 1.2;
    }
    arrowDerScale = lerp(arrowDerScale, targetDer, 0.2);
  }
}

// --- INPUT HANDLERS ---

function mousePressed() {
  if (modoEditor) {
    for (let i = 0; i < 6; i++) {
      if (mouseX > botonX[i] && mouseX < botonX[i] + botonW && mouseY > botonY[i] && mouseY < botonY[i] + botonH) {
        elementoSeleccionado = i;
        offsetX = mouseX - botonX[i];
        offsetY = mouseY - botonY[i];
        return;
      }
    }
    if (dist(mouseX, mouseY, personajeX, personajeY) < 150) { elementoSeleccionado = 10; offsetX = mouseX - personajeX; offsetY = mouseY - personajeY; return; }
    if (dist(mouseX, mouseY, huevoX, huevoY) < 150) { elementoSeleccionado = 11; offsetX = mouseX - Math.floor(huevoX); offsetY = mouseY - Math.floor(huevoY); return; }
    if (mouseX > barraX && mouseX < barraX + 300 && mouseY > barraY && mouseY < barraY + 160) { elementoSeleccionado = 12; offsetX = mouseX - barraX; offsetY = mouseY - barraY; return; }
    return;
  }

  // Si estamos en minijuego en dispositivo táctil, ignoramos clicks en zonas de botones de movimiento
  if (isTouchDevice && estado === 2.0) {
    // Si toca en controles táctiles, los maneja manejarControlesTactiles() en el draw
    if (dist(mouseX, mouseY, 100, height - 120) < 60 ||
        dist(mouseX, mouseY, 250, height - 120) < 60 ||
        dist(mouseX, mouseY, width - 120, height - 120) < 60) {
      return;
    }
  }

  // LOGICA NORMAL
  if (estado === -5.0 && botonJugarPortada) {
    let bW = 400;
    let bH = 150;
    let bx = width / 2 - bW / 2;
    let by = height / 2 + 150;
    if (mouseX >= bx && mouseX <= bx + bW && mouseY >= by && mouseY <= by + bH) {
      if (loadGameState()) iniciarCargaHilo();
      else estado = -3.0;
      if (!muted && burbujaSound) burbujaSound.play();
    }
  } else if (estado === -3.0) {
    if (mouseX >= 50 && mouseX <= 130 && mouseY >= height / 2 - 40 && mouseY <= height / 2 + 40) {
      personajeIdx = (personajeIdx - 1 + personajes.length) % personajes.length;
      personajeActual = personajes[personajeIdx];
      carruselTarget = -personajeIdx * 350;
      saveGameState();
      if (!muted && burbujaSound) burbujaSound.play();
    } else if (mouseX >= width - 130 && mouseX <= width - 50 && mouseY >= height / 2 - 40 && mouseY <= height / 2 + 40) {
      personajeIdx = (personajeIdx + 1) % personajes.length;
      personajeActual = personajes[personajeIdx];
      carruselTarget = -personajeIdx * 350;
      saveGameState();
      if (!muted && burbujaSound) burbujaSound.play();
    } else {
      let offset = (personajeIdx * 350) + carruselOffset;
      let x = width / 2 + offset;
      if (dist(mouseX, mouseY, x, height / 2 - 50) < 175) {
        personajeActual = personajes[personajeIdx];
        
        let pathSelect = "";
        if (personajeActual.nombre === "Yacaré") pathSelect = "data/Yaca/panel_seleccion_yacaré.png";
        else if (personajeActual.nombre === "Aguará") pathSelect = "data/Aguara/panel_seleccion_aguará.png";
        else if (personajeActual.nombre === "Yaguareté") pathSelect = "data/Yaguarete/panel_seleccion_yaguareté.png";
        else pathSelect = "data/capibara/panel_seleccion_capibara.png";
        
        loadImage(pathSelect, (img) => {
          panelConfirmacion = img;
          estado = -2.75;
          saveGameState();
          if (!muted && burbujaSound) burbujaSound.play();
        }, () => {
          panelConfirmacion = defaultImg;
          estado = -2.75;
          saveGameState();
          if (!muted && burbujaSound) burbujaSound.play();
        });
      }
    }
  } else if (estado === -2.75) {
    if (mouseX >= width / 2 - 180 && mouseX <= width / 2 - 60 && mouseY >= height / 2 + 100 && mouseY <= height / 2 + 220) {
      botonSiPressed = true;
      iniciarCargaHilo();
      if (!muted && burbujaSound) burbujaSound.play();
    } else if (mouseX >= width / 2 + 60 && mouseX <= width / 2 + 180 && mouseY >= height / 2 + 100 && mouseY <= height / 2 + 220) {
      botonNoPressed = true;
      estado = -3.0;
      saveGameState();
      if (!muted && burbujaSound) burbujaSound.play();
    }
  } else if (estado === -2.5) {
    if (mouseX >= 50 && mouseX <= 130 && mouseY >= height / 2 - 40 && mouseY <= height / 2 + 40) {
      fondoIdx = (fondoIdx - 1 + fondosGaleria.length) % fondosGaleria.length;
      carruselTargetFondo = -fondoIdx * 350;
      saveGameState();
      if (!muted && burbujaSound) burbujaSound.play();
    } else if (mouseX >= width - 130 && mouseX <= width - 50 && mouseY >= height / 2 - 40 && mouseY <= height / 2 + 40) {
      fondoIdx = (fondoIdx + 1) % fondosGaleria.length;
      carruselTargetFondo = -fondoIdx * 350;
      saveGameState();
      if (!muted && burbujaSound) burbujaSound.play();
    } else {
      let offset = (fondoIdx * 350) + carruselOffsetFondo;
      let x = width / 2 + offset;
      if (dist(mouseX, mouseY, x, height / 2) < 150) {
        fondo2 = fondosGaleria[fondoIdx];
        estado = 0.0;
        saveGameState();
        if (!muted && burbujaSound) burbujaSound.play();
      }
    }
  } else if (estado === 1.0 && !durmiendo && !modoEditor) {
    for (let i = 0; i < 4; i++) {
      if (mouseX > botonX[i] && mouseX < botonX[i] + botonW && mouseY > botonY[i] && mouseY < botonY[i] + botonH) {
        if (i === 0 && hambre < 100) {
          botonPressed[0] = true;
          comiendo = true;
          if (!muted && collectSound) collectSound.play();
          saveGameState();
        }
        if (i === 1) {
          botonPressed[1] = true;
          salud = min(salud + 30, 100.0);
          spawnParticles(personajeX, personajeY, 1, 15);
          if (!muted && burbujaSound) burbujaSound.play();
          saveGameState();
        }
        if (i === 2) {
          botonPressed[2] = true;
          if (!muted && burbujaSound) burbujaSound.play();
          if (tamagotchiMusic) tamagotchiMusic.stop();
          estado = 2.0;
          restartGame();
          saveGameState();
        }
        if (i === 3) {
          botonPressed[3] = true;
          energia = min(energia + 30, 100.0);
          felicidad = min(felicidad + 5, 100.0);
          durmiendo = true;
          tiempoDormir = 60;
          spawnParticles(width / 2, height / 2 + 100, 4, 8);
          if (!muted && burbujaSound) burbujaSound.play();
          saveGameState();
        }
      }
    }
  }

  if (estado >= -1.0 && estado !== -3.0 && estado !== -2.5 && estado !== -2.0 && estado !== -4.0 && estado !== -2.6 && !modoEditor) {
    if (mouseX > botonX[4] && mouseX < botonX[4] + botonW && mouseY > botonY[4] && mouseY < botonY[4] + botonH) {
      botonPressed[4] = true;
      toggleMute();
      if (!muted && burbujaSound) burbujaSound.play();
      saveGameState();
    }
    if (mouseX > botonX[5] && mouseX < botonX[5] + botonW && mouseY > botonY[5] && mouseY < botonY[5] + botonH) {
      botonPressed[5] = true;
      estadoPrevio = estado;
      estado = -4.0;
      if (!muted && burbujaSound) burbujaSound.play();
    }
  }

  if (estado === 2.0 && !personajeActual.isJumping && !personajeActual.isGameOver && !isTouchDevice) {
    if (personajeActual.minijuegoTipo === "vertical" && !personajeActual.hasPowerUp) return;
    personajeActual.spriteSpeed = personajeActual.jumpForce;
    personajeActual.isJumping = true;
    if (!muted && jumpSound) jumpSound.play();
    if (personajeActual.minijuegoTipo === "vertical") {
      personajeActual.isJumpAnimating = true;
      personajeActual.jumpAnimationFrame = 0;
    }
  }
}

function mouseDragged() {
  if (modoEditor && elementoSeleccionado !== -1) {
    if (elementoSeleccionado < 6) {
      botonX[elementoSeleccionado] = mouseX - offsetX;
      botonY[elementoSeleccionado] = mouseY - offsetY;
    } else if (elementoSeleccionado === 10) {
      personajeX = mouseX - offsetX;
      personajeY = mouseY - offsetY;
    } else if (elementoSeleccionado === 11) {
      huevoX = mouseX - offsetX;
      huevoY = mouseY - offsetY;
    } else if (elementoSeleccionado === 12) {
      barraX = mouseX - offsetX;
      barraY = mouseY - offsetY;
    }
  }
}

function mouseReleased() {
  for (let i = 0; i < botonPressed.length; i++) botonPressed[i] = false;
  botonSiPressed = false;
  botonNoPressed = false;
  elementoSeleccionado = -1;
  
  if (isTouchDevice && estado === 2.0) {
    moveLeft = false;
    moveRight = false;
    updateHorizontalSpeed();
  }
}

// --- SOPORTE TÁCTIL PARA DISPOSITIVOS MÓVILES EN MINIJUEGOS ---

function manejarControlesTactiles() {
  if (!isTouchDevice || estado !== 2.0) return;

  // Dibujar botones virtuales
  fill(255, 255, 255, 80);
  stroke(255, 120);
  strokeWeight(3);
  ellipse(100, height - 120, 120, 120); // Izquierda
  ellipse(250, height - 120, 120, 120); // Derecha
  ellipse(width - 120, height - 120, 120, 120); // Salto

  fill(255, 200);
  noStroke();
  // Triángulo izquierda
  triangle(80, height - 120, 115, height - 140, 115, height - 100);
  // Triángulo derecha
  triangle(270, height - 120, 235, height - 140, 235, height - 100);
  // Triángulo arriba (salto)
  triangle(width - 120, height - 140, width - 140, height - 105, width - 100, height - 105);

  // Procesar toques activos
  let touchLeft = false;
  let touchRight = false;
  let touchJump = false;

  if (mouseIsPressed) {
    if (dist(mouseX, mouseY, 100, height - 120) < 60) touchLeft = true;
    if (dist(mouseX, mouseY, 250, height - 120) < 60) touchRight = true;
    if (dist(mouseX, mouseY, width - 120, height - 120) < 60) touchJump = true;
  }

  // Toques múltiples en p5.js
  if (touches && touches.length > 0) {
    for (let t of touches) {
      if (dist(t.x, t.y, 100, height - 120) < 60) touchLeft = true;
      if (dist(t.x, t.y, 250, height - 120) < 60) touchRight = true;
      if (dist(t.x, t.y, width - 120, height - 120) < 60) touchJump = true;
    }
  }

  if (touchLeft) {
    moveLeft = true;
    moveRight = false;
  } else if (touchRight) {
    moveRight = true;
    moveLeft = false;
  } else {
    moveLeft = false;
    moveRight = false;
  }
  updateHorizontalSpeed();

  if (touchJump && !personajeActual.isJumping && !personajeActual.isGameOver) {
    if (personajeActual.minijuegoTipo === "vertical" && !personajeActual.hasPowerUp) return;
    personajeActual.spriteSpeed = personajeActual.jumpForce;
    personajeActual.isJumping = true;
    if (!muted && jumpSound) jumpSound.play();
    if (personajeActual.minijuegoTipo === "vertical") {
      personajeActual.isJumpAnimating = true;
      personajeActual.jumpAnimationFrame = 0;
    }
  }
}

// --- TECLADO ---

function keyPressed(event) {
  if ((key === 'e' || key === 'E') && event && event.ctrlKey && event.shiftKey) {
    modoEditor = !modoEditor;
    console.log("Modo Editor: " + (modoEditor ? "ACTIVADO" : "DESACTIVADO"));
    if (!modoEditor) {
      guardarLayout();
      console.log("Layout guardado automáticamente al desactivar el modo editor.");
    }
    return false; // Evita el comportamiento predeterminado del navegador
  }
  if (modoEditor && (key === 'g' || key === 'G')) guardarLayout();

  if (estado === -2.0) {
    if (key === 'c' || key === 'C') {
      estado = 0.0;
      saveGameState();
    } else if (key === 'r' || key === 'R') {
      estado = -4.0;
    }
  } else if (estado === -4.0) {
    if (key === 's' || key === 'S') {
      resetGame();
      limpiarMemoria();
      estado = -1.0;
      if (introPelicula) {
        introPelicula.stop();
        introPelicula.play();
      }
    } else if (key === 'n' || key === 'N') {
      estado = estadoPrevio;
    }
  } else if (estado === 2.0 && !personajeActual.isGameOver) {
    if (key === 'a' || key === 'A') moveLeft = true;
    if (key === 'd' || key === 'D') moveRight = true;
    updateHorizontalSpeed();

    if (key === ' ' && !personajeActual.isJumping && personajeActual.canJump) {
      personajeActual.spriteSpeed = personajeActual.jumpForce;
      personajeActual.isJumping = true;
      if (!muted && jumpSound) jumpSound.play();
      if (personajeActual.minijuegoTipo === "vertical") {
        personajeActual.isJumpAnimating = true;
        personajeActual.jumpAnimationFrame = 0;
      }
    } else if (key === 'r' || key === 'R') {
      restartGame();
      estado = 1.0;
      saveGameState();
    }
  }
}

function keyReleased() {
  if (estado === 2.0 && !personajeActual.isGameOver) {
    if (key === 'a' || key === 'A') moveLeft = false;
    if (key === 'd' || key === 'D') moveRight = false;
    updateHorizontalSpeed();
  }
}

function updateHorizontalSpeed() {
  if (moveLeft && !moveRight) personajeActual.spriteSpeedX = -7;
  else if (moveRight && !moveLeft) personajeActual.spriteSpeedX = 7;
  else personajeActual.spriteSpeedX = 0;
}

function toggleMute() {
  muted = !muted;
  if (muted) {
    if (backgroundMusic) backgroundMusic.stop();
    if (tamagotchiMusic) tamagotchiMusic.stop();
    if (zSound) zSound.stop();
  } else {
    if (estado === 1.0 && tamagotchiMusic) tamagotchiMusic.loop();
    if (estado === 2.0 && backgroundMusic) backgroundMusic.loop();
    if (durmiendo && zSound) zSound.loop();
  }
}

function restartGame() {
  moveLeft = false;
  moveRight = false;
  personajeActual.obstacles = [];
  personajeActual.collectibles = [];
  personajeActual.score = 0;
  personajeActual.gameSpeed = (personajeActual.nombre === "Capibara" || personajeActual.nombre === "Yacaré") ? 10.0 : 8.0;
  personajeActual.spriteX = 200;
  personajeActual.spriteY = height - 250;
  personajeActual.spriteSpeed = 0;
  personajeActual.spriteSpeedX = 0;
  personajeActual.isJumping = false;
  personajeActual.isGameOver = false;
  personajeActual.hasPowerUp = false;
  personajeActual.powerUpTimer = 0;
  personajeActual.bgOffset = 0;
  frameCountMini = 0;
  felicidad = min(felicidad + 20, 100.0);

  if (!muted && backgroundMusic) {
    backgroundMusic.stop();
    backgroundMusic.loop();
  }
  if (tamagotchiMusic && !tamagotchiMusic.isPlaying() && estado === 1.0) {
    tamagotchiMusic.loop();
  }
  saveGameState();
}

function gameOver(p) {
  p.isGameOver = true;
  p.highScore = max(p.highScore, p.score);
  felicidad = min(felicidad + Math.floor(p.score / 10), 100.0);
  if (!muted && backgroundMusic) backgroundMusic.stop();
  if (!muted && tamagotchiMusic && estado === 1.0) tamagotchiMusic.loop();
  saveGameState();
}

function drawGameOverScreen(p) {
  fill(0, 150);
  rect(0, 0, width, height);
  fill(255);
  textSize(50);
  textAlign(CENTER, CENTER);
  text("Game Over", width / 2, height / 2 - 100);
  text("Puntaje: " + p.score, width / 2, height / 2);
  text("Mejor: " + p.highScore, width / 2, height / 2 + 100);
  textSize(40);
  if (isTouchDevice) {
    text("Presiona en el centro para volver", width / 2, height / 2 + 200);
  } else {
    text("Presiona 'R' para volver", width / 2, height / 2 + 200);
  }
}

function drawHUD(p) {
  fill(255);
  textSize(30);
  textAlign(LEFT, TOP);
  text("Puntaje: " + p.score, 20, 20);
  text("Mejor: " + p.highScore, 20, 60);
  if (p.hasPowerUp) {
    fill(255, 255, 0);
    text("Power-Up: " + p.powerUpTimer, 20, 100);
  }
}

function resetGame() {
  if (backgroundMusic) backgroundMusic.stop();
  if (tamagotchiMusic) tamagotchiMusic.stop();
  if (zSound) zSound.stop();
  hambre = 100;
  felicidad = 100;
  salud = 100;
  energia = 100;
  tiempoNacimiento = 0;
  comiendo = false;
  durmiendo = false;
  tiempoComiendo = 0;
  tiempoDormir = 0;
  personajeIdx = 0;
  fondoIdx = 0;
  personajeActual = personajes[personajeIdx];
  carruselTarget = -personajeIdx * 350;
  carruselOffset = carruselTarget;
  carruselTargetFondo = -fondoIdx * 350;
  carruselOffsetFondo = carruselTargetFondo;

  fondo2 = fondosGaleria[fondoIdx];
  introTimer = 0;
  estado = -1.0;
  localStorage.removeItem('baby_ibera_game_state');
}

function saveGameState() {
  let state = {
    estado: estado,
    personajeIdx: personajeIdx,
    fondoIdx: fondoIdx,
    hambre: hambre,
    felicidad: felicidad,
    salud: salud,
    energia: energia,
    tiempoNacimiento: tiempoNacimiento,
    comiendo: comiendo,
    durmiendo: durmiendo,
    tiempoComiendo: tiempoComiendo,
    tiempoDormir: tiempoDormir,
    muted: muted,
    score: personajeActual ? personajeActual.score : 0,
    highScore: personajeActual ? personajeActual.highScore : 0
  };
  localStorage.setItem('baby_ibera_game_state', JSON.stringify(state));
}

function loadGameState() {
  let data = localStorage.getItem('baby_ibera_game_state');
  if (!data) return false;
  try {
    let state = JSON.parse(data);
    estado = parseFloat(state.estado);
    personajeIdx = parseInt(state.personajeIdx);
    personajeActual = personajes[personajeIdx];
    fondoIdx = parseInt(state.fondoIdx);
    hambre = parseFloat(state.hambre);
    felicidad = parseFloat(state.felicidad);
    salud = parseFloat(state.salud);
    energia = parseFloat(state.energia);
    tiempoNacimiento = parseFloat(state.tiempoNacimiento);
    comiendo = state.comiendo === true || state.comiendo === "true";
    durmiendo = state.durmiendo === true || state.durmiendo === "true";
    tiempoComiendo = parseFloat(state.tiempoComiendo);
    tiempoDormir = parseFloat(state.tiempoDormir);
    muted = state.muted === true || state.muted === "true";
    if (personajeActual) {
      personajeActual.score = parseInt(state.score);
      personajeActual.highScore = parseInt(state.highScore);
    }
    return true;
  } catch (e) {
    console.error("Error cargando estado:", e);
    return false;
  }
}
