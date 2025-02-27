import 'phaser';
import { Tank } from '../objects/Tank';
import { Bullet } from '../objects/Bullet';

export class MainScene extends Phaser.Scene {
    private playerTank!: Tank;
    private enemyTanks: Tank[] = [];
    private bullets!: Phaser.GameObjects.Group;
    private background!: Phaser.GameObjects.TileSprite;
    private reichstag!: Phaser.GameObjects.Image;
    private gameOver: boolean = false;
    private victoryFlag!: Phaser.GameObjects.Sprite;

    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Load all necessary assets
        this.load.image('tank-player', 'assets/tank-player.png');
        this.load.image('tank-enemy', 'assets/tank-enemy.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('reichstag', 'assets/reichstag.png');
        this.load.image('background', 'assets/background.png');
        this.load.spritesheet('victory-flag', 'assets/victory-flag.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        
        // Load sound effects
        this.load.audio('shoot', 'assets/shoot.mp3');
        this.load.audio('explosion', 'assets/explosion.mp3');
        this.load.audio('victory', 'assets/victory.mp3');
    }

    create() {
        // Create background
        this.background = this.add.tileSprite(400, 300, 800, 600, 'background');
        
        // Create Reichstag
        this.reichstag = this.add.image(400, 100, 'reichstag');
        
        // Initialize bullet group
        this.bullets = this.add.group({
            classType: Bullet,
            runChildUpdate: true
        });

        // Create player tank
        this.playerTank = new Tank(this, 400, 500, 'tank-player', true);
        
        // Create enemy tanks
        const enemyPositions = [
            { x: 200, y: 200 },
            { x: 400, y: 200 },
            { x: 600, y: 200 }
        ];
        
        enemyPositions.forEach(pos => {
            const enemyTank = new Tank(this, pos.x, pos.y, 'tank-enemy', false);
            this.enemyTanks.push(enemyTank);
        });

        // Setup input
        this.setupControls();
    }

    update() {
        if (this.gameOver) return;

        // Update player tank
        this.playerTank.update();

        // Update enemy tanks
        this.enemyTanks.forEach(tank => {
            if (tank.active) {
                tank.update();
                if (Phaser.Math.Between(0, 100) < 2) { // 2% chance to shoot each frame
                    tank.shoot();
                }
            }
        });

        // Check for victory condition
        if (this.enemyTanks.every(tank => !tank.active) && !this.gameOver) {
            this.victory();
        }
    }

    private setupControls() {
        // Keyboard controls
        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.gameOver) this.playerTank.shoot();
        });

        // Mouse controls
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!this.gameOver && pointer.leftButtonDown()) {
                this.playerTank.shoot();
            }
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!this.gameOver) {
                const angle = Phaser.Math.Angle.Between(
                    this.playerTank.x,
                    this.playerTank.y,
                    pointer.x,
                    pointer.y
                );
                this.playerTank.rotation = angle;
            }
        });
    }

    private victory() {
        this.gameOver = true;
        
        // Create and animate victory flag
        this.victoryFlag = this.add.sprite(400, 100, 'victory-flag');
        this.victoryFlag.play('flag-wave');
        
        // Display victory message
        const victoryText = this.add.text(400, 300, 'Победа! Рейхстаг взят!', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // Play victory sound
        this.sound.play('victory');
        
        // Add restart button
        const restartButton = this.add.text(400, 350, 'Играть снова', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => this.scene.restart());
    }
}