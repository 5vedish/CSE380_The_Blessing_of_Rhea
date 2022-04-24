import PlayerController from "../../AI/PlayerController";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import { GraphicType } from "../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import OrthogonalTilemap from "../../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import EnemyAI from "../../AI/EnemyAI";
import AABB from "../../../Wolfie2D/DataTypes/Shapes/AABB";
import BattlerAI from "../../AI/BattlerAI";
import Label from "../../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Color from "../../../Wolfie2D/Utils/Color";
import GameLevel, { CustomEnemy } from "./GameLevel";
import CharacterStat from "../../PlayerStatus";
import DeathScreen from "../DeathScreen";
import RangeAI from "../../AI/RangeAI";
import Timer from "../../../Wolfie2D/Timing/Timer";
import level_z2 from "./Level_Z2";
import Graphic from "../../../Wolfie2D/Nodes/Graphic";
import { TweenableProperties } from "../../../Wolfie2D/Nodes/GameNode";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import Sprite from "../../../Wolfie2D/Nodes/Sprites/Sprite";

export default class level_z1 extends GameLevel {

    protected removeEnemies: boolean = false;

    private addedHarpy: boolean = false;

    loadScene(): void {
        //Load Zeus
        this.load.spritesheet("zeus", "project_assets/spritesheets/Zeus.json"); 

        //Load Enemies
        this.load.spritesheet("snake", "project_assets/spritesheets/Snake.json")
        this.load.spritesheet("harpy", "project_assets/spritesheets/harpy.json")

        //Load tilemap
        this.load.tilemap("levelZ1", "project_assets/tilemaps/LevelZ1.json");

        this.load.spritesheet("lightningv2", "project_assets/spritesheets/lightningv2.json");

        this.load.image("lightningImg", "project_assets/sprites/lightning.png");

        //Load Challenge img
        this.load.image("objective", "project_assets/sprites/z1_challenge.png");

        super.loadScene();
    }

    startScene(): void {
        // Add in the tilemap and get the wall layer
        let tilemapLayers = this.add.tilemap("levelZ1", new Vec2(1, 1));
        this.walls = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];
        this.walls.setGroup("wall");
        
        this.viewport.setBounds(0, 0, 64*32, 64*32);
        this.viewport.setSize(this.viewport.getHalfSize());
        
        this.playerSpawn = new Vec2(32*32, 32*32);
        // this.viewport.setFocus(new Vec2(this.playerSpawn.x, this.playerSpawn.y));
        
        
        this.maxEnemies = 1;
        
        super.startScene();
        this.initLayers();
        this.initializeWeapons();
        this.initPlayer();
        
        //Create how long players need to survive for
        this.gameTimer = new Timer(120000);
        this.gameTime = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(this.viewport.getHalfSize().x, 20), text: `${this.parseTimeLeft(this.gameTimer.getTotalTime())}`});
    
        this.tilemap = this.player.getScene().getTilemap("Wall") as OrthogonalTilemap;

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
            speed: 100,
            weapon: this.createWeapon("knife"),
            range: 10,
            experience: 200
        });

        this.enemyConstructorPairings = new Map([["snake" , EnemyAI], ["harpy", RangeAI]]);
        

        //Start spawning delay
        this.startSceneTimer.start();
    }
    
    protected initLayers() : void {
        // Add a layer for the UI
        this.addUILayer("UI");
        
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
        //this.player.colliderOffset.set(0, 2);

        // create weapon
        let weapon = this.createWeapon("lightning");
        
        this.playerStats = new CharacterStat(100, 1, 10, 2, weapon.cooldownTimer.getTotalTime());
        // TODO - ADD PLAYER AI HERE
        this.player.addAI(PlayerController,
            {
                speed: this.playerStats.stats.speed,
                health: this.playerStats.stats.health,
                inputEnabled: true,
                range: 30,
                playerStats: this.playerStats,
                weapon: weapon,
                weaponV2: "lightningv2"
            });
        this.player.animation.play("idle");


        this.player.setGroup("player");
        // this.viewport.setCenter(this.playerSpawn);
        this.viewport.follow(this.player);

        this.battleManager.setPlayers([<BattlerAI>this.player._ai]);
        this.playerController = <PlayerController> this.player._ai;
        this.player.freeze();
        this.player.setAIActive(false, {});
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);

        // Spawn enemies in
        if(this.startSceneTimer.isStopped()){
            if(!this.startedLevel){
                this.gameTimer.start();
                this.player.unfreeze();
                this.player.setAIActive(true, {});
                this.startedLevel = true;
            }

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
                    projectiles: this.createProjectiles(1 , "leaf"),
                    cooldown: 1000,
                    scene: this,
                    ai: this.enemyConstructorPairings.get(enemyType.name)
                }
                this.enemyArray.push(this.addEnemy(enemyType.name, options));
            }
    
            //Update game timer
            this.gameTime.text = `${this.parseTimeLeft(this.gameTimer.getTimeLeft())}`;
    
            //Half way through add harpies
            if(this.gameTimer.getTimeLeft() <= this.gameTimer.getTotalTime()/2 && !this.addedHarpy){
                console.log("Adding harpy" + ` at ${this.parseTimeLeft(this.gameTimer.getTimeLeft())}`);
                this.spawnableEnemies.push({
                    name: "harpy",
                    health: 3,
                    player: this.player,
                    speed: 150,
                    weapon: this.createWeapon("knife"),
                    range: 150,
                    experience: 250,
                });
                this.addedHarpy = true;
            }
    
            if(this.gameTimer.getTimeLeft() <= 0){
                //end level and move to level z2
                if(this.changeLevelTimer === undefined){
                    this.changeLevelTimer = new Timer(5000);
                    this.changeLevelTimer.start();
                }
                //Remove all enemies
                
                if(!this.removeEnemies){
                    this.removeEnemies = true;
                    this.maxEnemies = 0;
                    for(let enemy of this.enemyArray){
                        this.battleManager.enemies.pop();
                        enemy.destroy();
                    }
                }
                if(this.changeLevelTimer.getTimeLeft() <= 0){
                    this.viewport.setSize(1600, 900);
                    this.sceneManager.changeToScene(level_z2, {characterStats: this.playerStats, weapon: (<PlayerController>this.player._ai).weapon}, this.sceneOptions);
                }
            }
        }
        
    }
}