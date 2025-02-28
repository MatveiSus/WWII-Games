import { Bullet } from './Bullet';

export class Tank extends Phaser.GameObjects.Sprite {
    public active: boolean = true;
    private speed: number = 200;
    private isPlayer: boolean;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private lastFired: number = 0;
    private fireRate: number = 500;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, isPlayer: boolean) {
        super(scene, x, y, texture);
        
        this.isPlayer = isPlayer;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        if (isPlayer && scene.input?.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
            this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        }
        
        this.setOrigin(0.5);
        
        // Поворот танков
        if (!isPlayer) {
            // Поворачиваем вражеский танк на 90 градусов по часовой стрелке
            this.angle = 90;
            this.rotation = Math.PI / 2;
        } else {
            this.angle = -90;
            this.rotation = -Math.PI / 2;
        }

        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setCollideWorldBounds(true);
            body.setBounce(0);
            body.setSize(this.width * 0.8, this.height * 0.8);
        }
    }

    update(time: number) {
        if (!this.active) return;

        const body = this.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        if (this.isPlayer && this.cursors) {
            body.setVelocity(0);

            if (this.cursors.left?.isDown) {
                body.setVelocityX(-this.speed);
            }
            if (this.cursors.right?.isDown) {
                body.setVelocityX(this.speed);
            }
            if (this.cursors.up?.isDown) {
                body.setVelocityY(-this.speed);
            }
            if (this.cursors.down?.isDown) {
                body.setVelocityY(this.speed);
            }

            if (body.velocity.length() > this.speed) {
                body.velocity.normalize().scale(this.speed);
            }

            if (this.spaceKey?.isDown && time - this.lastFired > this.fireRate) {
                this.fire(time);
            }
        } else if (!this.isPlayer) {
            if (Math.random() < 0.02) {
                body.setVelocity(
                    (Math.random() - 0.5) * this.speed * 2,
                    Math.random() * this.speed // Только положительная скорость по Y
                );
            }

            if (Math.random() < 0.01) {
                this.fire(time);
            }
        }
    }

    fire(time: number) {
        if (!this.active || time - this.lastFired < this.fireRate) return;

        const bullet = new Bullet(
            this.scene,
            this.x,
            this.y,
            'bullet',
            this.rotation
        );
        
        // Помечаем пулю как принадлежащую игроку или врагу
        (bullet as any).isPlayerBullet = this.isPlayer;
        
        this.lastFired = time;
        return bullet;
    }

    destroy(fromScene?: boolean) {
        this.active = false;
        super.destroy(fromScene);
    }
}