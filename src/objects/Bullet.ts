export class Bullet extends Phaser.GameObjects.Sprite {
    private speed: number = 400;
    
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, rotation: number) {
        super(scene, x, y, texture);
        
        this.rotation = rotation;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setSize(this.width * 0.8, this.height * 0.8);
            const velocity = this.scene.physics.velocityFromRotation(this.rotation, this.speed);
            body.setVelocity(velocity.x, velocity.y);
        }
    }

    update() {
        if (!this.scene) return;

        const width = Number(this.scene.game.config.width);
        const height = Number(this.scene.game.config.height);

        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
            this.destroy();
        }
    }
}