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
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";

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
        

        this.load.spritesheet("lightning", "project_assets/spritesheets/lightning.json");
        this.load.spritesheet("lightningv2", "project_assets/spritesheets/lightningv2.json");
        this.load.spritesheet("feather", "project_assets/spritesheets/Feather.json");
        this.load.image("lightning", "project_assets/sprites/lightning.png");
        this.load.image("lightningImg", "project_assets/sprites/lightning.png");

        //Load Challenge img
        this.load.image("objective", "project_assets/sprites/z1_challenge.png");

        //Load sound effect and music
        this.load.audio("weapon", "project_assets/sounds/lightning.wav");
        this.load.audio("weaponv2", "project_assets/sounds/lightningv2.wav");
        this.load.audio("zeus", "project_assets/music/zeus.mp3");

        super.loadScene();
    }

    initScene(init: Record<string, any>): void {
        this.invincible = init.invincible;
        this.unlockAll = init.unlockAll;
        this.instant_kill = init.instant_kill;
        this.speedUp = init.speedUp;
        this.unlockedLevels = init.unlockedLevels;
    }

    startScene(): void {
        // Add in the tilemap and get the wall layer
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "zeus", loop: true, holdReference: true});
        this.levelMusic = "zeus";
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
        // this.gameTimer = new Timer(10000);  // (testing timer)
        this.gameTimer = new Timer(150000); // (production timer)
        this.gameTime = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(this.viewport.getHalfSize().x, 20), text: `${this.parseTimeLeft(this.gameTimer.getTotalTime())}`});
    
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
            health: 150,
            player: this.player,
            speed: 115,
            weapon: this.createWeapon("knife"),
            range: 16,
            experience: 100
        });

        this.enemyConstructorPairings = new Map([["snake" , EnemyAI], ["harpy", RangeAI]]);
        //Position the rhea statue and zone
        this.rheaStatue = this.add.animatedSprite("rheaStatue", "primary");
        this.rheaStatue.position = new Vec2(33*32, 61*32);
        this.rheaStatue.animation.play("idle");

        this.rheaStatueZone = this.add.graphic(GraphicType.RECT, "primary",{position: new Vec2(33*32, 61*32), size: new Vec2(6*32,6*32)});
        this.rheaStatueZone.color = Color.TRANSPARENT;

        this.populateHUD();

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
        if (this.instant_kill) weapon.type.damage = 1000;
        
        this.playerStats = new CharacterStat(150, 1, 15, (this.speedUp) ? 15 : 2, weapon.cooldownTimer.getTotalTime());
        // TODO - ADD PLAYER AI HERE
        this.player.addAI(PlayerController,
            {
                speed:  this.playerStats.stats.speed,
                health: this.playerStats.stats.health,
                inputEnabled: true,
                range: -1,
                playerStats: this.playerStats,
                weapon: weapon,
                weaponV2: "lightningv2",
                invincible: this.invincible
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
                    health: enemyType.health*(Math.pow(1.05, this.playerStats.level)), // slight hp scaling increase
                    player: enemyType.player,
                    speed: enemyType.speed,
                    weapon: enemyType.weapon,
                    range: enemyType.range,
                    experience: enemyType.experience,
                    position: enemyPosition,
                    projectiles: this.createProjectiles(1 , "feather"),
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
                this.spawnableEnemies.push({
                    name: "harpy",
                    health: 300,
                    player: this.player,
                    speed: 145,
                    weapon: this.createWeapon("knife"),
                    range: 150,
                    experience: 200,
                });
                this.addedHarpy = true;
            }
    
            if(this.gameTimer.getTimeLeft() <= 0){
                //end level and move to level z2
         

                this.changeLevelTimer = new Timer(3000, () => {
                    this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "zeus"});
                    this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "main_menu", loop: true, holdReference: true});
                    this.viewport.setSize(1600, 900);
                    this.sceneManager.changeToScene(level_z2, {characterStats: this.playerStats, 
                    weapon: (<PlayerController>this.player._ai).weapon,
                    invincible: this.invincible, 
                    unlockAll: this.unlockAll,
                    instant_kill: this.instant_kill,
                    speedUp: this.speedUp, 
                    unlockedLevels: this.unlockedLevels,
                    upgradedWeapon: this.upgradedWeapon,
                    inventory: this.inventory
                }, this.sceneOptions);

                });
                this.changeLevelTimer.start();
                
            }
        }
        
    }
}