const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = .4

const background = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    imageSrc: './img/forest.png'
})

const orangeFire = new Sprite({
    position: {
        x: 10,
        y: 487,
    },
    imageSrc: './img/orangeFire.png',
    scale: 2.75,
    framesMax: 8,
})

const orangeFire2 = new Sprite({
    position: {
        x: 955,
        y: 487,
    },
    imageSrc: './img/orangeFire2.png',
    scale: 2.75,
    framesMax: 8,
})

const player = new Fighter({
    position: {
        x: 0,
        y: 0
    },
    velocity: {
        x: 0,
        y: 10
    },
    offset: {
        x: 0,
        y: 0
    },
    imageSrc: './img/persone/Idle.png',
    framesMax: 10,
    scale: 2.5,
    offset: {
        x: 100,
        y: -28
    },
    sprites: {
        idle: {
            imageSrc: './img/persone/Idle.png',
            framesMax: 10,
        },
        run: {
            imageSrc: './img/persone/Run.png',
            framesMax: 6,
        },
        jump: {
            imageSrc: './img/persone/Jump.png',
            framesMax: 2,
        },
        fall: {
            imageSrc: './img/persone/Fall.png',
            framesMax: 2,
        },
        attack1: {
            imageSrc: './img/persone/Attack3.png',
            framesMax: 5,
        },
        takeHit: {
            imageSrc: './img/persone/Get Hit.png',
            framesMax: 3,
        },
        death: {
            imageSrc: './img/persone/Death.png',
            framesMax: 9
        }
    },
    attackBox: {
        offset: {
            x: 100,
            y: 50
        },
        width: 107,
        height: 50
    }
})

const enemy = new Fighter({
    position: {
        x: 900,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0
    },
    offset: {
        x: -50,
        y: 0
    },
    imageSrc: './img/huy/Idle.png',
    framesMax: 10,
    scale: 2.2,
    offset: {
        x: 100,
        y: -62
    },
    sprites: {
        idle: {
            imageSrc: './img/huy/Idle.png',
            framesMax: 10,
        },
        run: {
            imageSrc: './img/huy/Run.png',
            framesMax: 8,
        },
        jump: {
            imageSrc: './img/huy/Going Up.png',
            framesMax: 3,
        },
        fall: {
            imageSrc: './img/huy/Going Down.png',
            framesMax: 3,
        },
        attack1: {
            imageSrc: './img/huy/Attack1.png',
            framesMax: 7,
        },
        takeHit: {
            imageSrc: './img/huy/Take Hit.png',
            framesMax: 3,
        },
        death: {
            imageSrc: './img/huy/Death.png',
            framesMax: 11
        }
    },
    attackBox: {
        offset: {
            x: -95,
            y: 50
        },
        width: 100,
        height: 50
    }
})

console.log(player);

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
}

decreaseTimer()

function animate() {
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update()
    orangeFire.update()
    orangeFire2.update()
    c.fillStyle = 'rgba(255, 255, 255, 0.15)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    enemy.update()

    player.velocity.x = 0
    enemy.velocity.x = 0

    // движение первого игрока
    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5
        player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 5
        player.switchSprite('run')
    } else {
        player.switchSprite('idle')
    }

    // прыжок
    if (player.velocity.y < 0) {
        player.switchSprite('jump')
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall')
    }

    // движение второго игрока
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5
        enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5
        enemy.switchSprite('run')
    } else {
        enemy.switchSprite('idle')
    }

    // прыжок
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump')
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall')
    }

    //распонзать что атака хуйнула
    if (
        rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
        }) &&
        player.isAttacking &&
        player.framesCurrent === 2
    ) {
        enemy.takeHit()
        player.isAttacking = false

        gsap.to('#enemyHealth', {
            width: enemy.health + '%'
        })
    }

    // если промахнуться
    if (player.isAttacking && player.framesCurrent === 2) {
        player.isAttacking = false
    }

    // нашего челика пиздят
    if (
        rectangularCollision({
            rectangle1: enemy,
            rectangle2: player
        }) &&
        enemy.isAttacking &&
        enemy.framesCurrent === 2
    ) {
        player.takeHit()
        enemy.isAttacking = false
        
        gsap.to('#playerHealth', {
            width: player.health + '%'
        })
    }

    // если промахнуться
    if (enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false
    }

    //два воина адын побидетель
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerId })
    }
}

animate()

window.addEventListener('keydown', (event) => {
    if (!player.dead) {
        switch (event.key) {
            case 'd':
                keys.d.pressed = true
                player.lastKey = 'd'
                break
            case 'a':
                keys.a.pressed = true
                player.lastKey = 'a'
                break
            case 'w':
                player.velocity.y = -12
                break
            case ' ':
                player.attack()
                break
        }
    }

    if (!enemy.dead){
        switch (event.key) {
            case 'ArrowRight':
                keys.ArrowRight.pressed = true
                enemy.lastKey = 'ArrowRight'
                break
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true
                enemy.lastKey = 'ArrowLeft'
                break
            case 'ArrowUp':
                enemy.velocity.y = -12
                break
            case 'ArrowDown':
                enemy.attack()

                break
        }
    }
    
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
    }

    //вражеские клюички
    switch (event.key) {
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
    }
})