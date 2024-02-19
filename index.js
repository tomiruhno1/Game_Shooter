
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const bigScoreEl = document.querySelector('#bigScoreEl');

const levelUpEl = document.querySelector('#levelUpEl');
const speedBtn = document.querySelector('#speedBtn');

levelUpEl.style.display = 'none';


//////////////////////////////////////////////////////////////////////////////


//PLAYER Variables
class Player {
    constructor(x, y, radius, color){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}


//Projectile Variables
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}


//Enemy Variables
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}


//Particle Variables
const friction  = 0.98;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -=0.01;
    }
}


//////////////////////////////////////////////////////////////////////////////


//Game overall settings
const  x = canvas.width / 2;
const  y = canvas.height / 2;

let player = new Player(x, y, 10, 'white');
let projectiles = []
let enemies = []
let particles = []

function init(){
    player = new Player(x, y, 10, 'white');
    projectiles = []
    enemies = []
    particles = []
    frames = 0;
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
}

const projectile = new Projectile
    (canvas.width / 2, //projectile location
    canvas.height / 2, 
    5, //projectile radius
    'blue', //projectile color
    {
        x: 1, //projectile velocity
        y: 1
    }) 

    let frames = 0;
    let intervalId; // Declare a variable to store the interval ID


//////////////////////////////////////////////////////////////////////////////


function pauseGame() {
    clearInterval(intervalId);
}

function spawnEnemies() {
    intervalId = setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;
        let x;
        let y;
        console.log(frames);
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}


let animationId;
let score = 0;

function animate() {
    frames++;
    if( frames % 60 === 0 ){
        setInterval(intervalId);
    }

    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0){
            particles.splice(index, 1);
        }else {
            particle.update();
        }
    });

    projectiles.forEach((projectile, index) => {
        projectile.update();
        //remove projectiles when out of canvas panel
        if (projectile.x + projectile.radius < 0 || 
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height){
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, index) => {
        enemy.update()

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        //end game
        if(dist - enemy.radius - player.radius + 1 < 1){
            cancelAnimationFrame(animationId);
            modalEl.style.display = 'flex';
            bigScoreEl.innerHTML = score;
        }

        projectiles.forEach((projectile, projectileIndex )=> {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            //IF projectile touches enemy
            if(dist - enemy.radius - projectile.radius + 5 < 1){

                //create explosions when projectile hits enemy
                for(let i = 0; i < enemy.radius * 2; i++ ){
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) * (Math.random() * 6), y: (Math.random() - 0.5) * (Math.random() * 6) }))
                }

                if(enemy.radius - 10 > 5){
                    //Increase Score When Touching Enemy
                    score += 100;
                    scoreEl.innerHTML = score;

                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                } else{
                    //Increase Score When Touching Enemy
                    score += 250;
                    scoreEl.innerHTML = score;

                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0);
                }
            }
        });
    });
}


let velocityLevel = 1;
//Listen for mouse left click to shoot
addEventListener('click', (event) => {
    {
        const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
        const velocity = {
            x: Math.cos(angle) * velocityLevel,
            y: Math.sin(angle) * velocityLevel
        }
        projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
    }
})

//Listen for button click to start game//
startGameBtn.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
    modalEl.style.display = 'none';
})

//Listen for button click to upgrade bullet velocity//
speedBtn.addEventListener('click', () => {
    velocityLevel += 0.5;
    levelUpEl.style.display = 'none';
    console.log(velocityLevel);
})

//Listen for keys to react//
document.addEventListener('keydown', function(event) {
    // Example: Detect if the 'A' key is pressed
    if (event.key === 'A' || event.key === 'a') {
        // Handle the 'A' key press here
        levelUpEl.style.display = 'flex';
    }
    if (event.key === 'D' || event.key === 'd') {
        // Handle the 'A' key press here
    }
})