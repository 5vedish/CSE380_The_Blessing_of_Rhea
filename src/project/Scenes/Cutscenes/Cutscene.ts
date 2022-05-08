import Scene from "../../../Wolfie2D/Scene/Scene";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Timer, { TimerState } from "../../../Wolfie2D/Timing/Timer";
import { UIElementType } from "../../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Label, { HAlign } from "../../../Wolfie2D/Nodes/UIElements/Label";
import Input from "../../../Wolfie2D/Input/Input";
import level_z1 from "../GameLevels/Level_Z1";
import { GraphicType } from "../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Color from "../../../Wolfie2D/Utils/Color";
import CharacterStat from "../../PlayerStatus";
import Weapon from "../../GameSystems/items/Weapon";
import { InventoryItemGraphic } from "../GameLevels/GameLevel";

export default class Cutscene extends Scene{

    //loads
    protected tileMapName: string;
    protected playerName: string;

    private lines: string[];
    private dialogueNumber = 0;
    private speaker: number[];
    private speakerSprite: string[];
    private speakerPositions: string[];
    private speakerAnimations: string[];
    private speakerName: string[];
    private scroll: Timer;

    private line1: Label;
    private line2: Label;
    private line3: Label;
    private line4: Label;
    private currentLine: number = 0; 
    private buffers: string[] = ["", "", "", ""];
    private subLen: number = 0;

    private leftSprite: AnimatedSprite;
    private rightSprite: AnimatedSprite;
    private speakerNameLabel: Label;

    private invincible: boolean;
    private unlockAll: boolean;
    private instant_kill: boolean;
    private speedUp: boolean;
    private unlockedLevels: boolean[];
    private characterStats: CharacterStat;
    private weapon: Weapon;
    private inventory: InventoryItemGraphic;

    protected nextScene: Record<string,any>;

    initScene(init: Record<string, any>): void {
        this.invincible = init.invincible;
        this.unlockAll = init.unlockAll;
        this.instant_kill = init.instant_kill;
        this.speedUp = init.speedUp;
        this.unlockedLevels = init.unlockedLevels;
        this.characterStats = init.characterStats;
        this.weapon = init.weapon;
        this.inventory = init.inventory;
    }

    loadScene(): void {
        // load tilemap + dialogue object + player + displayed sprites
    }

    startScene(): void {

        // add layers
        this.addLayer("top", 10);
        this.addLayer("lit", 11);
        // add the map
        this.add.tilemap(this.tileMapName, new Vec2(1,1));
        this.viewport.setBounds(0, 0, 64*32, 64*32);
        this.viewport.setSize(this.viewport.getHalfSize());
        
        // add the player
        let player = this.add.animatedSprite(this.playerName, "top");
        player.position = new Vec2(32*32, 32*32);
        player.animation.play("idle");
        // center viewport around player
        this.viewport.follow(player);

        const dialogueData = this.load.getObject("dialogue");
        
        this.lines = dialogueData.dialogue.lines;
        this.speaker = dialogueData.dialogue.speaker;
        this.speakerSprite = dialogueData.dialogue.speakerSprite;
        this.speakerPositions = dialogueData.dialogue.speakerPositions;
        this.speakerAnimations = dialogueData.dialogue.speakerAnimations;
        this.speakerName = dialogueData.dialogue.speakerName;

        this.loadBuffers();

        const dim = this.add.graphic(GraphicType.RECT, "top", { position: player.position, size: new Vec2(this.viewport.getHalfSize().x*2,
            this.viewport.getHalfSize().y*2) });
        dim.setColor(Color.BLACK);
        dim.alpha = .5;

        const box = this.add.graphic(GraphicType.RECT, "top", {position: new Vec2(player.position.x, player.position.y+145), size: new Vec2(750,200)});
        box.setColor(Color.BLACK);
        box.alpha = .7;

        this.line1 = <Label> this.add.uiElement(UIElementType.LABEL, "lit", { position: new Vec2(player.position.x-300, player.position.y+100),text: ""});
        this.line1.fontSize = 32;
        this.line1.setHAlign(HAlign.LEFT);
        this.line1.setTextColor(Color.WHITE);

        this.line2 = <Label> this.add.uiElement(UIElementType.LABEL, "lit", { position: new Vec2(player.position.x-330, player.position.y+130),text: ""});
        this.line2.fontSize = 32;
        this.line2.setHAlign(HAlign.LEFT);
        this.line2.setTextColor(Color.WHITE);

        this.line3 = <Label> this.add.uiElement(UIElementType.LABEL, "lit", { position: new Vec2(player.position.x-330, player.position.y+160),text: ""});
        this.line3.fontSize = 32;
        this.line3.setHAlign(HAlign.LEFT);
        this.line3.setTextColor(Color.WHITE);

        this.line4 = <Label> this.add.uiElement(UIElementType.LABEL, "lit", { position: new Vec2(player.position.x-330, player.position.y+190),text: ""});
        this.line4.fontSize = 32;
        this.line4.setHAlign(HAlign.LEFT);
        this.line3.setTextColor(Color.WHITE);

        this.scroll = new Timer(1000, () => {
            if (this.currentLine < this.buffers.length - 1){
                this.currentLine++;
                this.subLen = 0;
                this.scroll.reset();
            }  
        }, true);

        this.scroll.start();

        if (this.speakerPositions[this.dialogueNumber] === "left"){
            this.leftSprite = this.add.animatedSprite(this.speakerSprite[this.speaker[this.dialogueNumber]], "top");
            this.leftSprite.position = new Vec2(824, 1124);
            let size = this.leftSprite.size;
            (<AnimatedSprite> this.leftSprite).scale.set((256 / size.x), (256 / size.y));
            this.leftSprite.animation.play(this.speakerAnimations[this.dialogueNumber]);
        } else {
            this.rightSprite = this.add.animatedSprite(this.speakerSprite[this.speaker[this.dialogueNumber]], "top");
            this.rightSprite.position = new Vec2(1324, 1124);
            let size = this.rightSprite.size;
            (<AnimatedSprite> this.rightSprite).scale.set((256 / size.x), (256 / size.y));
            this.rightSprite.animation.play(this.speakerAnimations[this.dialogueNumber]);
        }

        this.speakerNameLabel = <Label> this.add.uiElement(UIElementType.LABEL, "lit", { position: new Vec2(player.position.x-330, 1090),text: this.speakerName[0]});
        this.speakerNameLabel.fontSize = 64;
        this.speakerNameLabel.setHAlign(HAlign.LEFT);
        this.speakerNameLabel.setTextColor(Color.WHITE);
        
    }

    updateScene(deltaT: number): void {

        if (Input.isMouseJustPressed()){
            

            this.buffers = ["", "", "", ""]; // resetting everything
            this.subLen = 0;
            this.currentLine = 0;
            this.dialogueNumber += 1;

            this.line1.setText("");
            this.line2.setText("");
            this.line3.setText("");
            this.line4.setText("");

            if (this.dialogueNumber === this.lines.length){

                this.viewport.setSize(1600, 900);
                let options = {
                    invincible: this.invincible, 
                    unlockAll: this.unlockAll,
                    instant_kill: this.instant_kill,
                    speedUp: this.speedUp,
                    unlockedLevels: this.unlockedLevels,
                    characterStats: this.characterStats,
                    weapon: this.weapon,
                    inventory: this.inventory
                }
                
                this.sceneManager.changeToScene(this.nextScene.next, options, this.sceneOptions);
            } else {

                this.speakerNameLabel.setText(this.speakerName[this.dialogueNumber]);
                if (this.speakerPositions[this.dialogueNumber] === "left"){

                    if (this.rightSprite){
                        this.rightSprite.alpha = .5;
                    }

                    if (this.leftSprite){
                        this.leftSprite.destroy();
                    }
    
                    this.leftSprite = this.add.animatedSprite(this.speakerSprite[this.speaker[this.dialogueNumber]], "top");
                    this.leftSprite.position = new Vec2(824, 1124);
                    let size = this.leftSprite.size;
                    (<AnimatedSprite> this.leftSprite).scale.set((256 / size.x), (256 / size.y));
                    this.leftSprite.animation.play(this.speakerAnimations[this.dialogueNumber]);

                } else {
    
                    if (this.leftSprite){
                        this.leftSprite.alpha = .5;
                    }

                    if (this.rightSprite){
                    this.rightSprite.destroy();
                    }
                    
                    this.rightSprite = this.add.animatedSprite(this.speakerSprite[this.speaker[this.dialogueNumber]], "top");
                    this.rightSprite.position = new Vec2(1324, 1124);
                    let size = this.rightSprite.size;
                    (<AnimatedSprite> this.rightSprite).scale.set((256 / size.x), (256 / size.y));
                    this.rightSprite.animation.play(this.speakerAnimations[this.dialogueNumber]);
                }

                this.loadBuffers();
                this.scroll.start();
            }
        }

        let sub = this.buffers[this.currentLine].substring(0, Math.ceil(-1 * (this.buffers[this.currentLine].length) * (this.scroll.getTimeLeft()/1000) + 
        this.buffers[this.currentLine].length));

        if (this.subLen < sub.length){
            this.subLen = sub.length;

            switch(this.currentLine){
                case 0:
                    this.line1.setText(sub);
                    break;
                case 1:
                    this.line2.setText(sub);
                    break;
                case 2:
                    this.line3.setText(sub);
                    break;
                case 3:
                    this.line4.setText(sub);
                    break;
            }
        }

    }

    loadBuffers(){

        let line = this.lines[this.dialogueNumber];
        let splitline = line.split(" ");
        
        let num = 0;

        splitline.map((word) => {
            if (word.length + 1 + this.buffers[num].length > 69){
                this.buffers[++num] += word + " ";
            } else {
                this.buffers[num] += word + " ";
            }
        });

    }

}