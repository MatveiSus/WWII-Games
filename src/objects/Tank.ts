import { Bullet } from './Bullet'; // Добавляем этот импорт в начало файла

export class Tank extends Phaser.GameObjects.Sprite {
    public active: boolean = true;
    private speed: number = 200;
    private isPlayer: boolean;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private spaceKey: Phaser.Input.Keyboard.Key;
    private lastFired: number = 0;
    private fireRate: number = 500;

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
        if (!isPlayer) {
            this.rotation = Math.PI;
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
            // Создаем пулю
            const bullet = new Bullet(
                this.scene,
                this.x,
                this.y,
                'bullet',
                this.rotation
            );
            this.lastFired = time;
        }
    }

    private updatePlayer(time: number) {
        if (!this.cursors) return;

        const body = this.body as Phaser.Physics.Arcade.Body;

        if (body) {
            body.setVelocity(0);

            if (this.cursors.up?.isDown) {
                body.setVelocityY(-this.speed);
            } else if (this.cursors.down?.isDown) {
                body.setVelocityY(this.speed);
            }

            if (this.cursors.left?.isDown) {
                body.setVelocityX(-this.speed);
            } else if (this.cursors.right?.isDown) {
                body.setVelocityX(this.speed);
            }

            body.velocity.normalize().scale(this.speed);

            if (this.spaceKey.isDown) {
                this.fire(time);
            }
        }
    }

    private updateEnemy(time: number) {
        if (Math.random() < 0.02) {
            this.fire(time);
        }
    }
}