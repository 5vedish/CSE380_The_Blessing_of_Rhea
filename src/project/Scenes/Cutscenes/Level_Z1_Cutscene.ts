import Scene from "../../../Wolfie2D/Scene/Scene";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Timer from "../../../Wolfie2D/Timing/Timer";
import { UIElementType } from "../../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Label, { HAlign } from "../../../Wolfie2D/Nodes/UIElements/Label";
import Input from "../../../Wolfie2D/Input/Input";
import level_z1 from "../GameLevels/Level_Z1";
import { GraphicType } from "../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Color from "../../../Wolfie2D/Utils/Color";

export default class Level_Z1_Cutscene extends Scene{

    private lines: string[];
    private dialogueNumber = 0;
    private speaker: number[];
    private speakerName: string[];
    private speakerPositions: string[];
    private speakerAnimations: string[];
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

    loadScene(): void {
        this.load.tilemap("levelZ1", "project_assets/tilemaps/LevelZ1.json");
        this.load.spritesheet("zeus", "project_assets/spritesheets/Zeus.json"); 
        this.load.spritesheet("Bigzeus", "project_assets/spritesheets/BigZeus.json");

        this.load.spritesheet("snake", "project_assets/spritesheets/Snake.json");
        this.load.spritesheet("bigsnake", "project_assets/spritesheets/BigSnake.json");
        this.load.spritesheet("harpy", "project_assets/spritesheets/harpy.json");

        this.load.object("dialogue", "project_assets/data/level_z1_dialogue.json");

    }

    startScene(): void {

        this.addLayer("top", 10);
        this.addLayer("lit", 11);
        // add the map
        this.add.tilemap("levelZ1", new Vec2(1,1));
        this.viewport.setBounds(0, 0, 64*32, 64*32);
        this.viewport.setSize(this.viewport.getHalfSize());
        
        // add the player
        let player = this.add.animatedSprite("zeus", "top");
        player.position = new Vec2(32*32, 32*32);
        player.animation.play("idle");
        // center viewport around player
        this.viewport.follow(player);

        const dialogueData = this.load.getObject("dialogue");
        
        this.lines = dialogueData.dialogue.lines;
        this.speaker = dialogueData.dialogue.speaker;
        this.speakerName = dialogueData.dialogue.speakerName;
        this.speakerPositions = dialogueData.dialogue.speakerPositions;
        this.speakerAnimations = dialogueData.dialogue.speakerAnimations;

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
            this.leftSprite = this.add.animatedSprite(this.speakerName[this.speaker[this.dialogueNumber]], "top");
            this.leftSprite.position = new Vec2(824, 1124);
            this.leftSprite.animation.play(this.speakerAnimations[this.dialogueNumber]);
        } else {
            this.rightSprite = this.add.animatedSprite(this.speakerName[this.speaker[this.dialogueNumber]], "top");
            this.rightSprite.position = new Vec2(1324, 1124);
            this.rightSprite.animation.play(this.speakerAnimations[this.dialogueNumber]);
        }

        
    }

    updateScene(deltaT: number): void {

        if (Input.isMouseJustPressed()){
            
            console.log(this.dialogueNumber);
            console.log(this.lines.length);

            this.buffers = ["", "", "", ""]; // resetting everything
            this.subLen = 0;
            this.currentLine = 0;
            this.dialogueNumber += 1;

            this.line1.setText("");
            this.line2.setText("");
            this.line3.setText("");
            this.line4.setText("");

            if (this.dialogueNumber === this.lines.length){

                let physicsOptions = {
                    physics: {
                        groupNames: ["Wall", "player", "enemy"],
                        collisions:
                        [
                            [0, 1, 1],
                            [1, 0, 0],
                            [1, 0, 1]
                        ]
                    }
                }

                this.viewport.setSize(1600, 900);
                this.sceneManager.changeToScene(level_z1, {}, physicsOptions);
            } else {

                if (this.speakerPositions[this.dialogueNumber] === "left"){

                    if (this.rightSprite){
                        this.rightSprite.destroy();
                    }
    
                    this.leftSprite = this.add.animatedSprite(this.speakerName[this.speaker[this.dialogueNumber]], "top");
                    this.leftSprite.position = new Vec2(824, 1124);
                    this.leftSprite.animation.play(this.speakerAnimations[this.dialogueNumber]);
                } else {
    
                    if (this.leftSprite){
                        this.leftSprite.destroy();
                    }
                    
                    this.rightSprite = this.add.animatedSprite(this.speakerName[this.speaker[this.dialogueNumber]], "top");
                    this.rightSprite.position = new Vec2(1324, 1124);
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

        console.log(this.buffers);
    }

}