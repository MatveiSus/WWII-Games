export class Bullet extends Phaser.GameObjects.Sprite {
    private speed: number = 400;
    
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, rotation: number) {
        super(scene, x, y, texture);
        
        this.rotation = rotation;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const velocity = this.scene.physics.velocityFromRotation(this.rotation, this.speed);
        (this.body as Phaser.Physics.Arcade.Body).setVelocity(velocity.x, velocity.y);
    }

    update() {
        const width = Number(this.scene.game.config.width);
        const height = Number(this.scene.game.config.height);

        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
            this.destroy();
        }
    }
}