import Vec2 from "../../DataTypes/Vec2";
import GameNode from "../../Nodes/GameNode";
import { GraphicType } from "../../Nodes/Graphics/GraphicTypes";
import Label from "../../Nodes/UIElements/Label";
import { UIElementType } from "../../Nodes/UIElements/UIElementTypes";
import ParallaxLayer from "../../Scene/Layers/ParallaxLayer";
import Scene from "../../Scene/Scene";
import PlayerController from "../Player/PlayerController";
import GoombaController from "../Enemies/GoombaController";
import OrthogonalTilemap from "../../Nodes/Tilemaps/OrthogonalTilemap";
import AnimatedSprite from "../../Nodes/Sprites/AnimatedSprite";
import Debug from "../../Debug/Debug";
import { EaseFunctionType } from "../../Utils/EaseFunctions";

export enum MarioEvents {
    PLAYER_HIT_COIN = "PlayerHitCoin",
    PLAYER_HIT_COIN_BLOCK = "PlayerHitCoinBlock"
}

export default class Level1 extends Scene {
    player: AnimatedSprite;
    coinCount: number = 0;
    coinCountLabel: Label;
    livesCount: number = 3;
    livesCountLabel: Label;

    loadScene(): void {
        this.load.tilemap("level1", "/assets/tilemaps/2bitlevel1.json");
        this.load.image("goomba", "assets/sprites/Goomba.png");
        this.load.image("koopa", "assets/sprites/Koopa.png");
        this.load.spritesheet("player", "assets/spritesheets/walking.json");
    }

    startScene(): void {
        let tilemap = <OrthogonalTilemap>this.add.tilemap("level1", new Vec2(2, 2))[0].getItems()[0];
        //tilemap.position.set(tilemap.size.x*tilemap.scale.x/2, tilemap.size.y*tilemap.scale.y/2);
        tilemap.position.set(0, 0);
        this.viewport.setBounds(0, 0, 128*32, 20*32);

        // Add the player (a rect for now)
        // this.player = this.add.graphic(GraphicType.RECT, "Main", {position: new Vec2(192, 1152), size: new Vec2(64, 64)});
        this.player = this.add.animatedSprite("player", "Main");
        this.player.scale.set(2, 2);
        this.player.position.set(5*32, 18*32);
        this.player.addPhysics();
        this.player.addAI(PlayerController, {playerType: "platformer", tilemap: "Main"});

        // Add triggers on colliding with coins or coinBlocks
        this.player.addTrigger("coin", MarioEvents.PLAYER_HIT_COIN);
        this.player.addTrigger("coinBlock", MarioEvents.PLAYER_HIT_COIN_BLOCK);
        this.player.setPhysicsLayer("player");

        this.player.tweens.add("flip", {
            startDelay: 0,
            duration: 500,
            effects: [
                {
                    property: "rotation",
                    start: 0,
                    end: 2*Math.PI,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ]
        });

        this.receiver.subscribe([MarioEvents.PLAYER_HIT_COIN, MarioEvents.PLAYER_HIT_COIN_BLOCK]);

        this.viewport.follow(this.player);
        this.viewport.enableZoom();
        this.viewport.setZoomLevel(2);

        // Add enemies
        // for(let pos of [{x: 21, y: 18}, {x: 30, y: 18}, {x: 37, y: 18}, {x: 41, y: 18}, {x: 105, y: 8}, {x: 107, y: 8}, {x: 125, y: 18}]){
        //     let goomba = this.add.sprite("goomba", "Main");
        //     goomba.position.set(pos.x*64, pos.y*64);
        //     goomba.scale.set(2, 2);
        //     goomba.addPhysics();
        //     goomba.addAI(GoombaController, {jumpy: false});
        //     goomba.setPhysicsLayer("enemy");
        // }

        // for(let pos of [{x: 67, y: 18}, {x: 86, y: 21}, {x: 128, y: 18}]){
        //     let koopa = this.add.sprite("koopa", "Main");
        //     koopa.position.set(pos.x*64, pos.y*64);
        //     koopa.scale.set(2, 2);
        //     koopa.addPhysics();
        //     koopa.addAI(GoombaController, {jumpy: true});
        //     koopa.setPhysicsLayer("enemy");
        // }

        // Add UI
        this.addUILayer("UI");

        this.coinCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(80, 30), text: "Coins: 0"});
        this.livesCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(600, 30), text: "Lives: 3"});
    }

    updateScene(deltaT: number): void {
        while(this.receiver.hasNextEvent()){
            let event = this.receiver.getNextEvent();
            
            if(event.type === MarioEvents.PLAYER_HIT_COIN){
                let coin;
                if(event.data.get("node") === this.player){
                    // Other is coin, disable
                    coin = event.data.get("other");  
                } else {
                    // Node is coin, disable
                    coin = event.data.get("node");
                }

                // Remove from physics and scene
                coin.active = false;
                coin.visible = false;
                this.coinCount += 1;

                this.coinCountLabel.setText("Coins: " + this.coinCount);

            } else if(event.type === MarioEvents.PLAYER_HIT_COIN_BLOCK){
                this.coinCount += 1;
                this.coinCountLabel.setText("Coins: " + this.coinCount);
            }
        }

        Debug.log("playerpos", this.player.position.toString());
        // If player falls into a pit, kill them off and reset their position
        if(this.player.position.y > 100*64){
            this.player.position.set(5*32, 18*32);
            this.livesCount -= 1
            this.livesCountLabel.setText("Lives: " + this.livesCount);
        }
    }
}