import { Tank } from '../objects/Tank';
import { Bullet } from '../objects/Bullet';

export class MainScene extends Phaser.Scene {
    private playerTank!: Tank;
    private enemyTanks: Tank[] = [];
    private gameOver: boolean = false;
    private bullets!: Phaser.GameObjects.Group;
    
    // Счетчики попаданий
    private playerHits: number = 0;
    private enemyHits: number = 0;
    private playerScoreText!: Phaser.GameObjects.Text;
    private enemyScoreText!: Phaser.GameObjects.Text;
    private maxHits: number = 5;

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
        // Создаем группу для пуль
        this.bullets = this.add.group({
            classType: Bullet,
            runChildUpdate: true
        });

        // Добавляем фон
        this.add.image(400, 300, 'background');
        this.add.image(400, 100, 'reichstag');

        // Создаем текст счета ПЕРЕД созданием танков
        // Стиль для текста счета
        const scoreStyle = {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#808080',
            backgroundColor: '#00000055'
        };

        // Создаем тексты счета с отступами от краев и фоном
        this.enemyScoreText = this.add.text(10, 10, 'Немцы: 0', scoreStyle)
            .setScrollFactor(0)
            .setDepth(100); // Устанавливаем высокий z-index

        this.playerScoreText = this.add.text(620, 10, 'СССР: 0', scoreStyle)
            .setScrollFactor(0)
            .setDepth(100); // Устанавливаем высокий z-index

        // Обновляем счет сразу после создания
        this.updateScoreText();

        // Создаем танки
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

        // Добавляем коллизии
        this.physics.add.collider(this.playerTank, this.enemyTanks);
        this.physics.add.collider(this.enemyTanks, this.enemyTanks);

        // Добавляем обработку попаданий
        this.physics.add.overlap(
            this.bullets,
            this.enemyTanks,
            this.handleBulletHit as any,
            undefined,
            this
        );
        
        this.physics.add.overlap(
            this.bullets,
            this.playerTank,
            this.handleBulletHit as any,
            undefined,
            this
        );

        // Устанавливаем границы мира
        this.physics.world.setBounds(0, 0, 800, 600);
    }

    private updateScoreText() {
        if (this.enemyScoreText && this.playerScoreText) {
            this.enemyScoreText.setText(`Немцы: ${this.enemyHits}`);
            this.playerScoreText.setText(`СССР: ${this.playerHits}`);
            
            // Обновляем глубину отображения, чтобы текст всегда был поверх
            this.enemyScoreText.setDepth(100);
            this.playerScoreText.setDepth(100);
        }
    }

    private handleBulletHit(bullet: Phaser.GameObjects.GameObject, tank: Tank) {
        if (!tank.active) return;

        bullet.destroy();

        if (tank === this.playerTank) {
            this.enemyHits++;
            if (this.enemyHits >= this.maxHits) {
                this.gameOver = true;
                this.updateScoreText(); // Обновляем счет перед показом окна победы
                this.showGameOver('Победа Вермахта!', '#FF0000');
            }
        } else {
            this.playerHits++;
            tank.destroy();
            if (this.playerHits >= this.maxHits) {
                this.gameOver = true;
                this.updateScoreText(); // Обновляем счет перед показом окна победы
                this.showGameOver('Победа СССР!', '#00FF00');
            }
        }

        // Обновляем счет после каждого попадания
        this.updateScoreText();
    }

    private showGameOver(message: string, color: string) {
        // Создаем полупрозрачный черный фон
        const overlay = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(101); // Выше счета

        // Текст окончания игры
        const gameOverText = this.add.text(400, 250, message, {
            fontSize: '64px',
            fontFamily: 'Arial',
            color: color,
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(102);

        // Статистика
        const statsText = this.add.text(400, 350, 
            `Попадания СССР: ${this.playerHits}\nПопадания Вермахта: ${this.enemyHits}`, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(102);

        // Кнопка перезапуска
        const restartButton = this.add.text(400, 450, 'Играть снова', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            backgroundColor: '#444444',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5)
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

        if (this.playerTank && this.playerTank.active) {
            this.playerTank.update(time);
        }
        
        this.enemyTanks.forEach(tank => {
            if (tank && tank.active) {
                tank.update(time);
            }
        });
    }
}