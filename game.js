const cvs = document.getElementById("breakOut");
const ctx = cvs.getContext("2d");

cvs.style.border = "1px solid #0ff";

ctx.lineWidth = 3;

const PADDLE_WIDTH = 100;
const PADDLE_MARGIN_BOTTOM = 50;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 8;
let LIFE = 3;
let SCORE = 0;
let LEVEL = 1;
const MAX_LEVEL = 4;
const SCORE_UNIT = 10;
let GAME_OVER = false;
let leftArrow = false;
let rightArrow = false;

const paddle = {
    x : cvs.width/2 - PADDLE_WIDTH/2,
    y : cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
    width : PADDLE_WIDTH,
    height : PADDLE_HEIGHT,
    dx : 5
}

function drawPaddle(){
    ctx.fillStyle = "#2e3548";
    ctx.fillRect(paddle.x,paddle.y,paddle.width,paddle.height);
    ctx.strokeStyle = "#ffcd05";
    ctx.strokeRect(paddle.x,paddle.y,paddle.width,paddle.height);
}

document.addEventListener("keydown", function(e){
    switch(e.code) {
        case "KeyA":
        case "ArrowLeft":
            leftArrow = true;
          break;
        case "KeyD":
        case "ArrowRight":
            rightArrow = true;
          break;
      }
});

document.addEventListener("keyup", function(e){
    switch(e.code) {
        case "KeyA":
        case "ArrowLeft":
            leftArrow = false;
          break;
        case "KeyD":
        case "ArrowRight":
            rightArrow = false;
          break;
      }
});


function movePaddle(){
    if (rightArrow && paddle.x + PADDLE_WIDTH < cvs.width){
        paddle.x += paddle.dx;
    }else if(leftArrow && paddle.x > 0){
        paddle.x -= paddle.dx;
    }
}

const ball = {
    x : cvs.width/2,
    y : paddle.y - BALL_RADIUS,
    radius : BALL_RADIUS,
    speed : 4,
    dx : 3,
    dy : -3
}

function drawBall(){
    ctx.beginPath();

    ctx.arc(ball.x , ball.y ,ball.radius, 0, Math.PI*2);
    ctx.fillStyle =  "#ffcd05";
    ctx.fill();
    ctx.strokeStyle = "#2e3548";
    ctx.stroke();

    ctx.closePath();
}

function moveBall(){
    ball.x += ball.dx;
    ball.y += ball.dy;
}

function ballWallCollision(){
    if(ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0 ){
        ball.dx = - ball.dx;
        WALL_HIT.play();
    }
    if(ball.y - ball.radius < 0){
        ball.dy = - ball.dy;
        WALL_HIT.play();
    } 
    if(ball.y + ball.radius > cvs.height){
        LIFE--;
        LIFE_LOST.play();
        reset();
    }
}

function ballPaddleCollision(){
    if(ball.x < paddle.x + paddle.width 
        && ball.x > paddle.x 
        && ball.y < paddle.y + paddle.height 
        && ball.y > paddle.y){  

            PADDLE_HIT.play();
        // Regarder ou la balle touche la paddle
            let collidePoint = ball.x - (paddle.x + paddle.width/2);
            collidePoint = collidePoint / (paddle.width/2);
        // Calculer l'angle
            let angle = collidePoint * Math.PI/3;

            ball.dx = ball.speed * Math.sin(angle);
            ball.dy = - ball.speed * Math.cos(angle);
       }
}

function reset(){
    paddle.x = cvs.width/2 - PADDLE_WIDTH/2;
    paddle.y = cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT;

    ball.x = cvs.width/2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -3;
}

const brick = {
    row : 2,
    column : 5,
    width : 55,
    height : 20,
    offSetLeft : 20,
    offSetTop : 20,
    marginTop : 40,
    fillColor : "#2e3548",
    strokeColor : "#FFF"
}

let bricks = [];

function createBricks(){
    for(let r = 0 ; r < brick.row ; r++){
        bricks[r]= [];
        for(let c = 0 ; c < brick.column ; c++){
            bricks[r][c] = {
                x : c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
                y : r * (brick.offSetTop + brick.height) + brick.offSetTop + brick.marginTop,
                status : true
            };
        }
    }
}

createBricks();

function drawBricks(){
    for(let r = 0 ; r < brick.row ; r++){
        for(let c = 0 ; c < brick.column ; c++){
            let b = bricks[r][c];
            if(b.status){
                ctx.fillStyle = brick.fillColor;
                ctx.fillRect(b.x,b.y,brick.width,brick.height);

                ctx.strokeStyle = brick.strokeColor;
                ctx.strokeRect(b.x,b.y,brick.width,brick.height);

            }
        }
    }
}

function ballBrickCollision(){
    for(let r = 0 ; r < brick.row ; r++){
        for(let c = 0 ; c < brick.column ; c++){
            let b = bricks[r][c];
            if(b.status){
                if(ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width
                    && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height ){
                    BRICK_HIT.play();
                    ball.dy = - ball.dy;
                    b.status = false;
                    SCORE += SCORE_UNIT;
                }
            }
        }
    }
}

function showGameStats(text,textX,textY,img,imgX,imgY){
    ctx.fillStyle ="#FFF";
    ctx.font = "24px Germania One";
    ctx.fillText(text,textX,textY);

    ctx.drawImage(img,imgX,imgY,25,25);
}

function draw(){
    drawPaddle();
    drawBall();
    drawBricks();
    showGameStats(SCORE,35,25,SCORE_IMG,5,5);
    showGameStats(LIFE,cvs.width - 25,25,LIFE_IMG,cvs.width - 55,5);
    showGameStats(LEVEL,cvs.width/2,25,LEVEL_IMG,cvs.width/2 - 30,5);
}

function gameOver(){
    if(LIFE <= 0){
        LOOSE.play();
        showYouLose();
        GAME_OVER = true;
    }
}

function levelUp(){
    let isLevelDone = true;
    for(let r = 0 ; r < brick.row ; r++){
        for(let c = 0 ; c < brick.column ; c++){
            isLevelDone = isLevelDone && ! bricks[r][c].status
        }
    }

    if(isLevelDone){
        WIN.play();
        if(LEVEL >= MAX_LEVEL){
            showYouWin();
            GAME_OVER = true;
            return;
        }
        brick.row++;
        createBricks();
        ball.speed += 1.25;
        reset();
        LEVEL ++;
    }
}

function update(){
    movePaddle();
    moveBall();
    ballWallCollision();
    ballPaddleCollision();
    ballBrickCollision();
    gameOver();
    levelUp();
}

function loop(){
    ctx.drawImage(BG_IMG,0,0);
    draw();
    update();
    if(! GAME_OVER){
        requestAnimationFrame(loop);
    }
    
}

loop();

const soundElement = document.getElementById("sound");
soundElement.addEventListener('click', audioManager);

function audioManager(){
    let imgSrc = soundElement.getAttribute("src");
    let SOUND_IMG = imgSrc == "img/SOUND_ON.png" ? "img/SOUND_OFF.png" : "img/SOUND_ON.png";
    soundElement.setAttribute("src", SOUND_IMG);

    WALL_HIT.muted = WALL_HIT.muted ? false : true;
    PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true;
    BRICK_HIT.muted = BRICK_HIT.muted ? false : true;
    WIN.muted = WIN.muted ? false : true;
    LIFE_LOST.muted = LIFE_LOST.muted ? false : true;
}


const gameover = document.getElementById("gameover");
const youwon = document.getElementById("youwon");
const youlose = document.getElementById("youlose");
const restart = document.getElementById("restart");

restart.addEventListener('click', function(){
    location.reload();
})

function showYouWin(){
    gameover.style.display = "block";
    youwon.style.display = "block";
}

function showYouLose(){
    gameover.style.display = "block";
    youlose.style.display = "block";
}
