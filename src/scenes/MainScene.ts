import { Tank } from '../objects/Tank';
import { Bullet } from '../objects/Bullet';

export class MainScene extends Phaser.Scene {
    private playerTank!: Tank;
    private enemyTanks: Tank[] = [];
    private gameOver: boolean = false;

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
        // Инициализируем клавиатуру
        if (!this.input.keyboard) {
            this.input.keyboard = new Phaser.Input.Keyboard.KeyboardPlugin(this.input);
        }

        // Add background
        this.add.image(400, 300, 'background');
        
        // Add Reichstag
        this.add.image(400, 100, 'reichstag');

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
    }

    update() {
        if (this.gameOver) return;

        if (this.playerTank) {
            this.playerTank.update();
        }
        
        this.enemyTanks.forEach(tank => {
            if (tank && tank.active) {
                tank.update();
            }
        });
    }
}