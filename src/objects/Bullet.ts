import 'phaser';

export class Bullet extends Phaser.GameObjects.Sprite {
    private speed: number;
    private isPlayerBullet: boolean;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        rotation: number,
        speed: number,
        isPlayerBullet: boolean
    ) {
        super(scene, x, y, texture);
        
        this.speed = speed;
        this.isPlayerBullet = isPlayerBullet;
        this.rotation = rotation;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set bullet velocity based on rotation
        const velocity = this.scene.physics.velocityFromRotation(this.rotation, this.speed);
        (this.body as Phaser.Physics.Arcade.Body).setVelocity(velocity.x, velocity.y);
    }

    update() {
        // Destroy bullet if it goes off screen
        if (
            this.x < 0 ||
            this.x > this.scene.game.config.width ||
            this.y < 0 ||
            this.y > this.scene.game.config.height
        ) {
            this.destroy();
        }
    }
}