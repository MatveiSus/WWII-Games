import { Tank } from '../objects/Tank';
import { Bullet } from '../objects/Bullet';

export class MainScene extends Phaser.Scene {
    private playerTank!: Tank;
    private enemyTanks: Tank[] = [];
    private gameOver: boolean = false;
    private bullets!: Phaser.GameObjects.Group;

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

        this.bullets = this.add.group({
            classType: Bullet,
            runChildUpdate: true
        });

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

        // Добавляем коллизии для пуль
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
    }

    private handleBulletHit(bullet: Phaser.GameObjects.GameObject, tank: Tank) {
        if (!tank.active) return; // Пропускаем, если танк уже уничтожен

        // Уничтожаем пулю
        bullet.destroy();

        // Уничтожаем танк
        tank.destroy();

        // Если это игрок, завершаем игру
        if (tank === this.playerTank) {
            this.gameOver = true;
            // Можно добавить текст "Game Over"
            this.add.text(400, 300, 'Game Over', {
                fontSize: '64px',
                color: '#FF0000'
            }).setOrigin(0.5);
        } else {
            // Удаляем танк из массива врагов
            this.enemyTanks = this.enemyTanks.filter(t => t !== tank);
            
            // Проверяем условие победы
            if (this.enemyTanks.length === 0) {
                this.add.text(400, 300, 'Victory!', {
                    fontSize: '64px',
                    color: '#00FF00'
                }).setOrigin(0.5);
                this.gameOver = true;
            }
        }
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
    }
}