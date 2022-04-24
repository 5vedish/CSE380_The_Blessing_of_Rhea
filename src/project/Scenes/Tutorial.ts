import PlayerController from "../AI/PlayerController";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import EnemyAI from "../AI/EnemyAI";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import BattlerAI from "../AI/BattlerAI";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Color from "../../Wolfie2D/Utils/Color";
import GameLevel from "./GameLevels/GameLevel";
import CharacterStat from "../PlayerStatus";
import Level_Z1_Cutscene from "./Cutscenes/Level_Z1_Cutscene";
import Input from "../../Wolfie2D/Input/Input";
import { Project_Events } from "../project_constants";
import CanvasNode from "../../Wolfie2D/Nodes/CanvasNode";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import ControlScreen from "./ControlScreen";
import RangeAI from "../AI/RangeAI";

export default class Tutorial extends GameLevel {
    protected tutorialTexts: Label[];
    protected tutorialZones: AABB[];

    loadScene(): void {
        //Load Zeus
        this.load.spritesheet("zeus", "project_assets/spritesheets/Zeus.json"); 

        //Load Snake
        this.load.spritesheet("snake", "project_assets/spritesheets/Snake.json")
        this.load.spritesheet("harpy", "project_assets/spritesheets/harpy.json")

        //Load tilemap
        this.load.tilemap("tutorial", "project_assets/tilemaps/tutorial.json");

        this.load.image("lightningImg", "project_assets/sprites/lightning.png")

        this.load.image("objective", "project_assets/sprites/tutorial.png")

        super.loadScene();
    }

    startScene(): void {
        // Add in the tilemap and get the wall layer
        let tilemapLayers = this.add.tilemap("tutorial", new Vec2(1, 1));
        this.walls = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];
        
        this.viewport.setBounds(0, 0, 64*32, 64*32);
        this.viewport.setSize(this.viewport.getHalfSize());

        this.playerSpawn = new Vec2(32*32, 50*32);
        // this.viewport.setFocus(new Vec2(this.playerSpawn.x, this.playerSpawn.y));
        
        this.maxEnemies = 50;
        
        super.startScene();
        this.initLayers();
        this.initializeWeapons();
        this.initPlayer();
        this.initTutorial();

        // //Health Bar top left
        // this.healthBar = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(196, 16), 
        //     size: new Vec2(256, 8)});
        // //Health Bar follows below character

        this.levelUI = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(86, 32), 
            text: "Lvl" + this.playerStats.level});
        this.levelUI.textColor = Color.BLACK;

        this.weaponIcon = this.add.sprite("lightningImg", "gui");
        this.weaponIcon.position = new Vec2(48, 24);
        this.weaponIconCoolDown = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(48, 24), size: new Vec2(32,32)});
        this.weaponIconCoolDown.color = Color.GRAY;
        this.weaponIconCoolDown.alpha = 0;
        
        this.spawnableEnemies.push({
            name: "snake",
            health: 2,
            player: this.player,
            speed: 200,
            weapon: this.createWeapon("knife"),
            range: 10,
            experience: 200
        });
        
        this.enemyConstructorPairings = new Map([["snake" , EnemyAI]]);
        
        let firstEnemy = this.add.animatedSprite("snake", "primary");
        firstEnemy.scale.set(1,1);
        firstEnemy.addPhysics(new AABB(Vec2.ZERO, new Vec2(8, 8)));
        firstEnemy.animation.play("moving");
        let options = {name: "snake",
            health: 1,
            player: this.player,
            speed: 5,
            weapon: this.createWeapon("knife"),
            experience: 200}
        firstEnemy.addAI(EnemyAI, options);
        firstEnemy.position.set(this.player.position.x, 44*32);
        firstEnemy.freeze();
        if(this.battleManager.enemies === undefined){
            this.battleManager.setEnemies([<BattlerAI>firstEnemy._ai])
        } else {
            this.battleManager.enemies.push(<BattlerAI>firstEnemy._ai);
        }

        let secondEnemy = this.add.animatedSprite("snake", "primary");
        secondEnemy.scale.set(1,1);
        secondEnemy.addPhysics(new AABB(Vec2.ZERO, new Vec2(8, 8)));
        secondEnemy.animation.play("moving");
        options = {name: "snake",
            health: 1,
            player: this.player,
            speed: 5,
            weapon: this.createWeapon("knife"),
            experience: 200}
        secondEnemy.addAI(EnemyAI, options);
        secondEnemy.position.set(33*32+16, 30*32+16);
        secondEnemy.freeze();
        if(this.battleManager.enemies === undefined){
            this.battleManager.setEnemies([<BattlerAI>secondEnemy._ai])
        } else {
            this.battleManager.enemies.push(<BattlerAI>secondEnemy._ai);
        }

        let thirdEnemy = this.add.animatedSprite("snake", "primary");
        thirdEnemy.scale.set(1,1);
        thirdEnemy.addPhysics(new AABB(Vec2.ZERO, new Vec2(8, 8)));
        thirdEnemy.animation.play("moving");
        options = {name: "snake",
            health: 1,
            player: this.player,
            speed: 5,
            weapon: this.createWeapon("knife"),
            experience: 200}
        thirdEnemy.addAI(EnemyAI, options);
        thirdEnemy.position.set(30*32+16, 30*32+16);
        thirdEnemy.freeze();
        if(this.battleManager.enemies === undefined){
            this.battleManager.setEnemies([<BattlerAI>thirdEnemy._ai])
        } else {
            this.battleManager.enemies.push(<BattlerAI>thirdEnemy._ai);
        }

        // this.enemyArray.push(enemy);
        // this.getLayer("movement").disable();
        
    }

    protected initTutorial(): void {
        this.tutorialTexts = new Array<Label>();
        this.tutorialZones = new Array<AABB>();

        //Movement tutorial
        let movementZone = this.add.graphic(GraphicType.RECT, "tutorial", {position: this.player.position.clone(), size: new Vec2(8*32, 4*32)});
        movementZone.color = Color.TRANSPARENT;
        this.tutorialZones.push(movementZone.boundary);

        let movementLabel = <Label>this.add.uiElement(UIElementType.LABEL, "tutorial", {position: new Vec2(32*32, 48*32), text:"Use W A S D to move"});
        this.tutorialTexts.push(movementLabel);
        
        //attack tutorial
        let attackZone = this.add.graphic(GraphicType.RECT, "tutorial", {position: this.player.position.clone().add(new Vec2(0, 5*32*-1)), size: new Vec2(8*32, 4*32)});
        attackZone.color = Color.TRANSPARENT;
        this.tutorialZones.push(attackZone.boundary);

        let attackLabel = <Label>this.add.uiElement(UIElementType.LABEL, "tutorial", {position: new Vec2(32*32, 42*32), text:"Left Click to attack"});
        this.tutorialTexts.push(attackLabel);

        //level up tutorial
        let levelupZone = this.add.graphic(GraphicType.RECT, "tutorial", {position: new Vec2(32*32, 37*32), size: new Vec2(2*32, 8*32)});
        levelupZone.color = Color.TRANSPARENT;
        this.tutorialZones.push(levelupZone.boundary);

        let levelupLabel = <Label>this.add.uiElement(UIElementType.LABEL, "tutorial", {position: new Vec2(32*32, 37*32), text: "Defeat enemies to lvl up and obtain stat upgrades"});
        this.tutorialTexts.push(levelupLabel);

        //end of tutorial
        let endTutorialZone = this.add.graphic(GraphicType.RECT, "tutorial",{position: new Vec2(32*32, 19*32), size: new Vec2(40*32,18*32)});
        endTutorialZone.color = Color.TRANSPARENT;
        this.tutorialZones.push(endTutorialZone.boundary);

        let endTutorialLabel = <Label>this.add.uiElement(UIElementType.LABEL, "tutorial", {position: new Vec2(32*32, 20*32), text: "Stand here! Good Luck on your adventure!"});
        this.tutorialTexts.push(endTutorialLabel);
    }

    
    protected initLayers() : void {
        // Add a layer for the UI
        this.addUILayer("UI");
        this.addLayer("tutorial", 12);
        
        // Add the primary layer for players and enemies
        this.addLayer("primary", 10);
    }

    protected initPlayer() : void {
        this.player = this.add.animatedSprite("zeus", "primary");
        this.player.scale.set(1, 1);
        if(!this.playerSpawn){
            console.warn("Player spawn was never set - setting spawn to (0, 0)");
            this.playerSpawn = Vec2.ZERO;
        }
        this.player.position = this.playerSpawn;
        this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(16, 16)));
        console.log(this.player.position);
        //this.player.colliderOffset.set(0, 2);

        // create weapon
        let weapon = this.createWeapon("lightning");
        
        this.playerStats = new CharacterStat(50, 1, 10, 2, weapon.cooldownTimer.getTotalTime());
        // TODO - ADD PLAYER AI HERE
        this.player.addAI(PlayerController,
            {
                speed: 2,
                health: 50,
                inputEnabled: true,
                range: 30,
                playerStats: this.playerStats,
                weapon: weapon
            });
        this.player.animation.play("idle");


        this.player.setGroup("player");
        // this.viewport.setCenter(this.playerSpawn);
        this.viewport.follow(this.player);

        this.battleManager.setPlayers([<BattlerAI>this.player._ai]);
        this.playerController = <PlayerController> this.player._ai;
        // this.player.freeze();
        // this.player.setAIActive(false, {});
    }
    
    updateScene(deltaT: number): void {
        //Check if player died// pause via escape
        if (Input.isKeyJustPressed("escape")){
            this.pauseFlag = !this.pauseFlag;

            if (this.pauseFlag){
                this.pauseEntities();
                this.getLayer("pause").enable();
            } else {
                this.unpauseEntities();
                this.getLayer("pause").disable();
            }

        }

        // handle leveling up
        if (this.levelChanged) {
            // level up events
            while(this.levelReceiver.hasNextEvent()){

                let event = this.levelReceiver.getNextEvent();
                
                switch (event.type) {
                        
                    case "one":

                        let item = new (this.itemConstructorPairings.get(this.selectionArray[0]))(new Sprite(this.selectionArray[0]));
                        item.use(this.player, this.playerController.weapon, this.playerStats, this.playerController);
                        break;

                    case "two":

                        let item2 = new (this.itemConstructorPairings.get(this.selectionArray[1]))(new Sprite(this.selectionArray[1]));
                        item2.use(this.player, this.playerController.weapon, this.playerStats, this.playerController);
                        break;

                    case "three":

                        let item3 = new (this.itemConstructorPairings.get(this.selectionArray[2]))(new Sprite(this.selectionArray[2]));
                        item3.use(this.player, this.playerController.weapon, this.playerStats, this.playerController);
                        break;

                }

                this.getLayer("levelUp").removeNode(this.item1);
                this.getLayer("levelUp").removeNode(this.item2);
                this.getLayer("levelUp").removeNode(this.item3);

                this.levelChanged--;
                // accounting for multiple levels
                if (this.levelChanged){
                    this.rollItems();
                }  
            }

            if (this.levelChanged === 0){
                this.pauseFlag = !this.pauseFlag;
                this.getLayer("levelUp").disable();
                this.unpauseEntities();        
            }
            
        }

        // main events
        while (this.receiver.hasNextEvent() && !this.pauseFlag) {
            let event = this.receiver.getNextEvent();

            switch (event.type) {

                case Project_Events.ENEMYDIED:
                    // remove enemy from both arrays
                    const enemy = <CanvasNode>event.data.get("enemy");
                    const enemyExperience = (<EnemyAI>enemy._ai).experience;
                    this.battleManager.enemies = this.battleManager.enemies.filter(enemy => enemy !== <BattlerAI>(event.data.get("enemy")._ai));
                    this.enemyArray = this.enemyArray.filter(enemy => enemy !== (event.data.get("enemy")));
                    enemy.destroy();
                    this.currentNumEnemies -= 1;
                    this.playerStats.gainedExperience(enemyExperience); // to-do : scaling

                    //Update the exp bar
                    let reqExp = Math.pow(this.playerStats.level, 1.5);
                    let expPercentage = this.playerStats.experience / (reqExp * 500);
                    this.expBar.size = new Vec2(expPercentage*216, 4);
                    this.expBar.position = new Vec2(108*expPercentage+(216/2), 32);
                    break;

                case Project_Events.HEALTHCHANGED:

                    // update health bar
                    let percentage = this.playerStats.stats.health/this.playerStats.stats.maxHealth;
                    // scale by percentage
                    this.healthBar.size = new Vec2(percentage*256, 8);
                    // rebalance position
                    this.healthBar.position = new Vec2(196 + (percentage-1)*128,16);
                    break;

                case Project_Events.LEVELUP:

                    this.pauseFlag = !this.pauseFlag;
                    this.pauseEntities();
                    //show layer
                    this.getLayer("levelUp").enable();
                    this.levelChanged = event.data.get("levelChange");
                    this.levelUI.text = "Lvl" + this.playerStats.level;
                    
                    this.rollItems();
                    break;
                           
            }
        }    
        
        //Update the weapon cooldown icon
        let weaponTimeLeft = this.playerController.weapon.cooldownTimer.getTimeLeft();
        let weaponTotalTime = this.playerController.weapon.cooldownTimer.getTotalTime();
        let timePercentage = weaponTimeLeft/weaponTotalTime;
        if(timePercentage > 0){
            this.weaponIconCoolDown.alpha = 0.5;
        } else {
            this.weaponIconCoolDown.alpha = 0;
        }
        // this.weaponIconCoolDown.alpha = timePercentage;
        this.weaponIconCoolDown.size = new Vec2(32, (1-timePercentage)*32);
        this.weaponIconCoolDown.position = new Vec2(48, 24+(timePercentage*16));

        // prevents the player from going out of bounds
        this.lockPlayer();   

        if(this.playerStats.stats.health <= 0){
            this.viewport.setSize(1600, 900);
            this.playerController.destroy();
    
            this.sceneManager.changeToScene(ControlScreen);
        }

        for (let i = 0; i < this.tutorialZones.length; i++) {
            if(this.tutorialZones[i].overlapArea(this.player.boundary)) {
                this.tutorialTexts[i].visible = true;
            } else {
                this.tutorialTexts[i].visible = false;
            }
        }

        if(this.player.position.y < 20*32){
            this.player.freeze();
            this.player.setAIActive(false, {});
            // Spawn enemies in
            if(this.currentNumEnemies < this.maxEnemies && !this.pauseFlag){
                let enemyType = this.spawnableEnemies[Math.floor(Math.random() * this.spawnableEnemies.length)];
    
                let enemyPosition = this.randomSpawn();
                let options = {
                    name: enemyType.name,
                    health: enemyType.health,
                    player: enemyType.player,
                    speed: enemyType.speed,
                    weapon: enemyType.weapon,
                    range: enemyType.range,
                    experience: enemyType.experience,
                    position: enemyPosition,
                    projectiles: this.createProjectiles(5 , "leaf"),
                    cooldown: 1000,
                    scene: this,
                    ai: this.enemyConstructorPairings.get(enemyType.name)
                }
                this.enemyArray.push(this.addEnemy(enemyType.name, options));
            }
        }

    }
}