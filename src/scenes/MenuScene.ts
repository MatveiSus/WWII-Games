import 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Add title
        this.add.text(width / 2, height / 3, 'БИТВА ЗА РЕЙХСТАГ', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add start button
        const startButton = this.add.text(width / 2, height / 2, 'НАЧАТЬ ИГРУ', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        startButton.on('pointerover', () => startButton.setTint(0x00ff00));
        startButton.on('pointerout', () => startButton.clearTint());
        startButton.on('pointerdown', () => this.scene.start('MainScene'));

        // Add controls info
        const controlsText = [
            'Управление:',
            'Стрелки - движение танка',
            'Пробел - выстрел',
            'Мышь - прицеливание',
            'ЛКМ - выстрел',
            'ПКМ - движение вперёд'
        ];

        let yPos = height * 0.65;
        controlsText.forEach(text => {
            this.add.text(width / 2, yPos, text, {
                fontSize: '16px',
                color: '#ffffff'
            }).setOrigin(0.5);
            yPos += 25;
        });
    }
}