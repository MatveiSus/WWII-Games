export class Bullet extends Phaser.GameObjects.Sprite {
    private speed: number = 400;
    
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, rotation: number) {
        super(scene, x, y, texture);
        
        this.rotation = rotation;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Настраиваем физическое тело пули
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            // Устанавливаем размер коллизии пули
            body.setSize(this.width * 0.8, this.height * 0.8);
            
            // Устанавливаем скорость в зависимости от направления
            const velocity = this.scene.physics.velocityFromRotation(this.rotation, this.speed);
            body.setVelocity(velocity.x, velocity.y);
        }
    }

    update() {
        // Уничтожаем пулю, если она вышла за пределы экрана
        const width = Number(this.scene.game.config.width);
        const height = Number(this.scene.game.config.height);

        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
            this.destroy();
        }
    }

    destroy(fromScene?: boolean) {
        super.destroy(fromScene);
    }
}