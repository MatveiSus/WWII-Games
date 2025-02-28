import { Tank } from '../objects/Tank';
import { Bullet } from '../objects/Bullet';

export class MainScene extends Phaser.Scene {
    private playerTank!: Tank;
    private enemyTanks: Tank[] = [];
    private gameOver: boolean = false;
    private bullets!: Phaser.GameObjects.Group;
    private playerHits: number = 0;
    private enemyHits: number = 0;
    private playerScoreText!: Phaser.GameObjects.Text;
    private enemyScoreText!: Phaser.GameObjects.Text;
    private maxHits: number = 5;
    private reichstagSprite!: Phaser.GameObjects.Image;
    private reichstagBoundary!: number;

    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        this.load.image('tank-player', 'assets/tank-player.png');
        this.load.image('tank-enemy', 'assets/tank-enemy.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('reichstag', 'assets/reichstag.png');
        this.load.image('background', 'assets/background.png');
    }

    create() {
        // Настраиваем физику
        this.physics.world.setBounds(0, 0, 800, 600);

        // Создаем группы для пуль
        const playerBullets = this.add.group({
            classType: Bullet,
            runChildUpdate: true
        });

        const enemyBullets = this.add.group({
            classType: Bullet,
            runChildUpdate: true
        });

        this.bullets = this.add.group([playerBullets, enemyBullets]);

        // Добавляем фон
        this.add.image(400, 300, 'background');

        // Добавляем рейхстаг и сохраняем его границу
        this.reichstagSprite = this.add.image(400, 100, 'reichstag');
        this.reichstagBoundary = this.reichstagSprite.y + this.reichstagSprite.height / 2;

        // Создаем тексты счета
        const scoreStyle = {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#808080',
            backgroundColor: '#00000055',
            padding: { x: 10, y: 5 }
        };

        this.enemyScoreText = this.add.text(10, 10, 'Немцы: 0', scoreStyle)
            .setScrollFactor(0)
            .setDepth(100);

        this.playerScoreText = this.add.text(620, 10, 'СССР: 0', scoreStyle)
            .setScrollFactor(0)
            .setDepth(100);

        // Создаем танк игрока
        this.playerTank = new Tank(this, 400, 500, 'tank-player', true);
        
        // Создаем вражеские танки
        const enemyPositions = [
            { x: 200, y: 100 },
            { x: 400, y: 100 },
            { x: 600, y: 100 }
        ];
        
        enemyPositions.forEach(pos => {
            const enemyTank = new Tank(this, pos.x, pos.y, 'tank-enemy', false);
            this.enemyTanks.push(enemyTank);
        });

        // Добавляем коллизии между танками
        this.physics.add.collider(this.playerTank, this.enemyTanks);
        this.physics.add.collider(this.enemyTanks, this.enemyTanks);

        // Регистрируем коллизии пуль
        this.physics.add.overlap(
            playerBullets,
            this.enemyTanks,
            (bullet, tank) => {
                this.handlePlayerBulletHit(bullet as unknown as Bullet, tank as Tank);
            },
            undefined,
            this
        );

        this.physics.add.overlap(
            enemyBullets,
            this.playerTank,
            (bullet, tank) => {
                this.handleEnemyBulletHit(bullet as unknown as Bullet, tank as Tank);
            },
            undefined,
            this
        );

        // Инициализируем начальный счет
        this.updateScoreText();
    }

    private handlePlayerBulletHit(bullet: Bullet, tank: Tank) {
        if (!bullet.active || !tank.active) return;

        console.log('Player bullet hit enemy tank!');
        bullet.destroy();
        tank.destroy();
        
        this.playerHits++;
        this.enemyTanks = this.enemyTanks.filter(t => t !== tank);
        
        if (this.playerHits >= this.maxHits) {
            this.gameOver = true;
            this.showGameOver('Победа СССР!', '#00FF00');
        }
        
        this.updateScoreText();
    }

    private handleEnemyBulletHit(bullet: Bullet, tank: Tank) {
        if (!bullet.active || !tank.active) return;

        console.log('Enemy bullet hit player tank!');
        bullet.destroy();
        
        this.enemyHits++;
        
        if (this.enemyHits >= this.maxHits) {
            this.gameOver = true;
            this.showGameOver('Победа Вермахта!', '#FF0000');
        }
        
        this.updateScoreText();
    }

    private updateScoreText() {
        if (this.enemyScoreText && this.playerScoreText) {
            this.enemyScoreText.setText(`Немцы: ${this.enemyHits}`);
            this.playerScoreText.setText(`СССР: ${this.playerHits}`);
        }
    }

    private showGameOver(message: string, color: string) {
        // Создаем затемненный фон
        const overlay = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(101);

        // Добавляем текст с результатом
        const gameOverText = this.add.text(400, 250, message, {
            fontSize: '64px',
            fontFamily: 'Arial',
            color: color,
            stroke: '#000000',
            strokeThickness: 6
        })
        .setOrigin(0.5)
        .setDepth(102);

        // Добавляем статистику
        const statsText = this.add.text(400, 350, 
            `Попадания СССР: ${this.playerHits}\nПопадания Вермахта: ${this.enemyHits}`, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        })
        .setOrigin(0.5)
        .setDepth(102);

        // Добавляем кнопку "Играть снова"
        const restartButton = this.add.text(400, 450, 'Играть снова', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            backgroundColor: '#444444',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(102);

        restartButton.on('pointerdown', () => {
            this.scene.restart();
        });

        restartButton.on('pointerover', () => {
            restartButton.setStyle({ backgroundColor: '#666666' });
        });

        restartButton.on('pointerout', () => {
            restartButton.setStyle({ backgroundColor: '#444444' });
        });
    }

    update(time: number) {
        if (this.gameOver) return;

        // Обновляем игрока
        if (this.playerTank && this.playerTank.active) {
            this.playerTank.update(time);
            
            // Ограничиваем движение игрока относительно рейхстага
            const playerBody = this.playerTank.body as Phaser.Physics.Arcade.Body;
            if (playerBody && this.playerTank.y < this.reichstagBoundary) {
                this.playerTank.y = this.reichstagBoundary;
                playerBody.setVelocityY(0);
            }
        }
        
        // Обновляем врагов
        this.enemyTanks.forEach(tank => {
            if (tank && tank.active) {
                tank.update(time);
                
                // Ограничиваем движение врагов относительно рейхстага
                const enemyBody = tank.body as Phaser.Physics.Arcade.Body;
                if (enemyBody && tank.y > this.reichstagBoundary) {
                    tank.y = this.reichstagBoundary;
                    enemyBody.setVelocityY(0);
                }
            }
        });
    }
}