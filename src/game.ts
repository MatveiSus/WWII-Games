import 'phaser';
import { MainScene } from './scenes/MainScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 }, // Исправлено: добавлен x
            debug: false
        }
    },
    scene: MainScene,
    input: {
        keyboard: true
    }
};

window.addEventListener('load', () => {
    new Phaser.Game(config);
});