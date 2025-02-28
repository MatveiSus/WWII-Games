import { Bullet } from './Bullet';

export class Tank extends Phaser.GameObjects.Sprite {
    public active: boolean = true;
    private speed: number = 200;
    private isPlayer: boolean;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private spaceKey: Phaser.Input.Keyboard.Key;
    private lastFired: number = 0;
    private fireRate: number = 500;
    private reichstagBoundary: number = 160; // Граница движения выше Рейхстага

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
        
        // Поворачиваем вражеские танки вниз (90 градусов)
        if (!isPlayer) {
            this.rotation = Math.PI / 2; // 90 градусов (вниз)
            this.angle = 90; // Явно устанавливаем угол
        } else {
            this.rotation = -Math.PI / 2; // -90 градусов (вверх)
            this.angle = -90;
        }

        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setCollideWorldBounds(true);
        }
    }

    private checkBoundaries() {
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            // Не позволяем танкам заезжать выше определенной границы
            if (this.y < this.reichstagBoundary) {
                this.y = this.reichstagBoundary;
                body.setVelocityY(0);
            }
        }
    }

    update(time: number) {
        if (!this.active) return;

        if (this.isPlayer) {
            this.updatePlayer(time);
        } else {
            this.updateEnemy(time);
        }

        this.checkBoundaries();
    }

    private fire(time: number) {
        if (!this.active) return;
        
        if (time - this.lastFired > this.fireRate) {
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
        if (!this.cursors || !this.active) return;

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

            if (body.velocity.length() > 0) {
                body.velocity.normalize().scale(this.speed);
            }

            if (this.spaceKey.isDown) {
                this.fire(time);
            }
        }
    }

    private updateEnemy(time: number) {
        if (!this.active) return;

        const body = this.body as Phaser.Physics.Arcade.Body;
        
        if (body) {
            if (Math.random() < 0.02) {
                const randomDirection = Math.random();
                body.setVelocity(0);
                
                if (randomDirection < 0.25) {
                    body.setVelocityX(-this.speed);
                } else if (randomDirection < 0.5) {
                    body.setVelocityX(this.speed);
                } else if (randomDirection < 0.75) {
                    body.setVelocityY(-this.speed);
                } else {
                    body.setVelocityY(this.speed);
                }
            }

            if (Math.random() < 0.01) {
                this.fire(time);
            }
        }
    }
}