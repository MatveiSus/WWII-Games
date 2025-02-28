import { Bullet } from './Bullet';

export class Tank extends Phaser.GameObjects.Sprite {
    public active: boolean = true;
    private speed: number = 200; // Скорость игрока
    private enemySpeed: number = 50; // Скорость врагов (медленнее)
    private isPlayer: boolean;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private spaceKey: Phaser.Input.Keyboard.Key;
    private lastFired: number = 0;
    private fireRate: number = 500;
    private moveDirection: number = 1; // Направление движения врагов

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, isPlayer: boolean) {
        super(scene, x, y, texture);
        
        this.isPlayer = isPlayer;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        if (!scene.input.keyboard) {
            scene.input.keyboard = scene.input.keyboard || new Phaser.Input.Keyboard.KeyboardPlugin(scene.input);
        }
        
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        this.setOrigin(0.5);
        
        // Устанавливаем правильную ротацию
        if (isPlayer) {
            this.rotation = -Math.PI / 2; // -90 градусов (вверх)
        } else {
            this.rotation = Math.PI / 2; // 90 градусов (вниз)
        }
    }

    update(time: number) {
        if (!this.active) return;

        if (this.isPlayer) {
            this.updatePlayer(time);
        } else {
            this.updateEnemy(time);
        }
    }

    private fire(time: number) {
        if (time - this.lastFired > this.fireRate) {
            // Создаем пулю с правильным направлением
            const bullet = new Bullet(
                this.scene,
                this.x,
                this.y,
                'bullet',
                this.rotation // Используем ротацию танка
            );
            this.lastFired = time;
        }
    }

    private updatePlayer(time: number) {
        if (!this.cursors) return;

        const body = this.body as Phaser.Physics.Arcade.Body;

        if (body) {
            body.setVelocity(0);

            // Управление только влево-вправо для игрока
            if (this.cursors.left?.isDown) {
                body.setVelocityX(-this.speed);
            } else if (this.cursors.right?.isDown) {
                body.setVelocityX(this.speed);
            }

            // Ограничиваем движение в пределах экрана
            const halfWidth = this.width / 2;
            const gameWidth = Number(this.scene.game.config.width);
            if (this.x < halfWidth) {
                this.x = halfWidth;
            } else if (this.x > gameWidth - halfWidth) {
                this.x = gameWidth - halfWidth;
            }

            if (this.spaceKey.isDown) {
                this.fire(time);
            }
        }
    }

    private updateEnemy(time: number) {
        const body = this.body as Phaser.Physics.Arcade.Body;
        
        if (body) {
            // Движение влево-вправо
            body.setVelocityX(this.enemySpeed * this.moveDirection);

            // Проверяем границы экрана и меняем направление
            const halfWidth = this.width / 2;
            const gameWidth = Number(this.scene.game.config.width);
            
            if (this.x <= halfWidth || this.x >= gameWidth - halfWidth) {
                this.moveDirection *= -1; // Меняем направление
            }

            // Случайная стрельба
            if (Math.random() < 0.01) { // 1% шанс выстрела каждый фрейм
                this.fire(time);
            }
        }
    }
}