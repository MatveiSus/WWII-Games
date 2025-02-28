export class Tank extends Phaser.GameObjects.Sprite {
    public active: boolean = true;
    private speed: number = 200;
    private isPlayer: boolean;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, isPlayer: boolean) {
        super(scene, x, y, texture);
        
        this.isPlayer = isPlayer;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Инициализируем клавиатуру, если её нет
        if (!scene.input.keyboard) {
            scene.input.keyboard = scene.input.keyboard || new Phaser.Input.Keyboard.KeyboardPlugin(scene.input);
        }
        
        // Создаем курсоры
        this.cursors = scene.input.keyboard.createCursorKeys();
        
        this.setOrigin(0.5);
        if (!isPlayer) {
            this.rotation = Math.PI;
        }
    }

    update() {
        if (!this.active) return;

        if (this.isPlayer) {
            this.updatePlayer();
        }
    }

    private updatePlayer() {
        if (!this.cursors) return; // Проверка на существование курсоров

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
        }
    }
}