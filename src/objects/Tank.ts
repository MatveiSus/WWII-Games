import { Bullet } from './Bullet';

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
        
        // Устанавливаем поворот для танков
        if (!isPlayer) {
            // Поворачиваем вражеский танк на 90 градусов по часовой стрелке
            this.setAngle(90); // Это повернет спрайт на 90 градусов по часовой стрелке
            this.rotation = Math.PI / 2; // Устанавливаем rotation для физики и стрельбы
        } else {
            // Поворачиваем танк игрока вверх
            this.setAngle(-90);
            this.rotation = -Math.PI / 2;
        }

        // Настраиваем физическое тело
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setCollideWorldBounds(true);
        }
    }

    // ... остальной код Tank.ts остается без изменений
}