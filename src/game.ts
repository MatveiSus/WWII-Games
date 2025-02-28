import 'phaser';
import { MainScene } from './scenes/MainScene';
import { MenuScene } from './scenes/MenuScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { x: 0, y: 0 }
        }
    },
    input: {
        keyboard: true // Явно включаем поддержку клавиатуры
    },
    scene: [MenuScene, MainScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

window.onload = () => {
    new Phaser.Game(config);
};