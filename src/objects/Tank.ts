import 'phaser';
import { Bullet } from './Bullet';

export class Tank extends Phaser.GameObjects.Sprite {
    private speed: number = 200;
    private bulletSpeed: number = 400;
    private lastShot: number = 0;
    private shotDelay: number = 500; // 0.5 seconds between shots
    public active: boolean = true;
    private isPlayer: boolean;
    
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, isPlayer: boolean) {
        super(scene, x, y, texture);
        
        this.isPlayer = isPlayer;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set tank properties
        this.setOrigin(0.5);
        if (!isPlayer) {
            this.rotation = Math.PI; // Enemy tanks face down
        }
    }

    update() {
        if (!this.active) return;

        if (this.isPlayer) {
            this.updatePlayer();
        } else {
            this.updateEnemy();
        }
    }

    private updatePlayer() {
        const cursors = this.scene.input.keyboard.createCursorKeys();
        const body = this.body as Phaser.Physics.Arcade.Body;

        // Reset velocity
        body.setVelocity(0);

        // Movement
        if (cursors.up.isDown) {
            body.setVelocityY(-this.speed);
        } else if (cursors.down.isDown) {
            body.setVelocityY(this.speed);
        }

        if (cursors.left.isDown) {
            body.setVelocityX(-this.speed);
        } else if (cursors.right.isDown) {
            body.setVelocityX(this.speed);
        }

        // Normalize and scale the velocity
        body.velocity.normalize().scale(this.speed);
    }

    private updateEnemy() {
        // Simple AI: Track and shoot at player
        const player = this.scene.children.getByName('playerTank') as Tank;
        if (player && player.active) {
            this.rotation = Phaser.Math.Angle.Between(
                this.x,
                this.y,
                player.x,
                player.y
            );
        }
    }

    shoot() {
        const time = this.scene.time.now;
        if (time - this.lastShot < this.shotDelay) return;

        this.lastShot = time;

        // Create bullet
        const bullet = new Bullet(
            this.scene,
            this.x,
            this.y,
            'bullet',
            this.rotation,
            this.bulletSpeed,
            this.isPlayer
        );

        // Play shoot sound
        this.scene.sound.play('shoot');
    }

    destroy() {
        this.active = false;
        super.destroy();
    }
}