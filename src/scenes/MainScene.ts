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
        // Настраиваем границы мира
        this.physics.world.setBounds(0, 0, 800, 600);

        // Создаем группу для пуль
        this.bullets = this.add.group({
            classType: Bullet,
            runChildUpdate: true,
            maxSize: 30 // Ограничиваем количество пуль
        });

        // Добавляем фон
        this.add.image(400, 300, 'background');

        // Добавляем рейхстаг и сохраняем ссылку
        this.reichstagSprite = this.add.image(400, 100, 'reichstag');

        // Создаем тексты счета с отступами и фоном
        const scoreStyle = {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#808080',
            backgroundColor: '#00000055',
            padding: { x: 10, y: 5 }
        };

        // Создаем счет для обеих сторон
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

        // Обработка попаданий пуль
        this.physics.add.collider(
            this.bullets,
            this.enemyTanks,
            (bullet: any, tank: any) => {
                this.handleBulletHit(bullet, tank);
            },
            undefined,
            this
        );
        
        this.physics.add.collider(
            this.bullets,
            this.playerTank,
            (bullet: any, tank: any) => {
                this.handleBulletHit(bullet, tank);
            },
            undefined,
            this
        );

        // Инициализируем начальный счет
        this.updateScoreText();
    }

    private updateScoreText() {
        if (this.enemyScoreText && this.playerScoreText) {
            console.log('Updating score texts:', this.enemyHits, this.playerHits);
            this.enemyScoreText.setText(`Немцы: ${this.enemyHits}`).setDepth(100);
            this.playerScoreText.setText(`СССР: ${this.playerHits}`).setDepth(100);
        }
    }

    private handleBulletHit(bullet: Phaser.GameObjects.GameObject, tank: Phaser.GameObjects.GameObject) {
        // Проверяем, что оба объекта все еще существуют
        if (!bullet || !tank || !bullet.active || !tank.active) return;

        // Уничтожаем пулю
        bullet.destroy();

        // Приводим tank к правильному типу
        const tankSprite = tank as Tank;

        if (tankSprite === this.playerTank) {
            // Попадание в игрока
            this.enemyHits++;
            console.log('Enemy hit! Score:', this.enemyHits);
            
            if (this.enemyHits >= this.maxHits) {
                this.gameOver = true;
                this.updateScoreText();
                this.showGameOver('Победа Вермахта!', '#FF0000');
            }
        } else {
            // Попадание во врага
            this.playerHits++;
            console.log('Player hit! Score:', this.playerHits);
            
            // Уничтожаем вражеский танк
            tankSprite.destroy();
            
            // Удаляем танк из массива
            this.enemyTanks = this.enemyTanks.filter(t => t !== tankSprite);
            
            if (this.playerHits >= this.maxHits) {
                this.gameOver = true;
                this.updateScoreText();
                this.showGameOver('Победа СССР!', '#00FF00');
            }
        }

        // Обновляем отображение счета
        this.updateScoreText();
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

        // Обработчики событий кнопки
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
        }
        
        // Обновляем врагов
        this.enemyTanks.forEach(tank => {
            if (tank && tank.active) {
                tank.update(time);
            }
        });

        // Проверяем границы рейхстага для танков
        const reichstagBottom = this.reichstagSprite.y + this.reichstagSprite.height / 2;
        
        this.enemyTanks.forEach(tank => {
            if (tank.y > reichstagBottom) {
                tank.y = reichstagBottom;
            }
        });

        if (this.playerTank.y < reichstagBottom) {
            this.playerTank.y = reichstagBottom;
        }
    }
}