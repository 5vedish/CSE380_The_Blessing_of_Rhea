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
import RangeAI from "../../AI/RangeAI";
import Timer from "../../../Wolfie2D/Timing/Timer";
import level_z3 from "./Level_Z3";
import HadesController from "../../AI/HadesController";
import FireballAI from "../../AI/FireballAI";

export default class level_h2 extends GameLevel {

    private prep: boolean = false;
    private midWave: boolean;
    private currentWave: number = 0;

    private floorCheck: OrthogonalTilemap;

    loadScene(): void {
        // load Hades
        this.load.spritesheet("Hades", "project_assets/spritesheets/Hades.json"); 

        // load enemies
        this.load.spritesheet("Skull", "project_assets/spritesheets/Skull.json");
        this.load.spritesheet("Witch", "project_assets/spritesheets/Witch.json");
        this.load.spritesheet("Hellhound", "project_assets/spritesheets/Hellhound.json")

        // load tilemap
        this.load.tilemap("levelH2", "project_assets/tilemaps/LevelH2.json");

        this.load.spritesheet("fireball", "project_assets/spritesheets/fireball.json");
        this.load.spritesheet("Hex", "project_assets/spritesheets/Hex.json");

        this.load.image("bident", "project_assets/sprites/bident.png");

        // load challenge img
        this.load.image("objective", "project_assets/sprites/h2_challenge.png");
        this.load.image("wave_one", "project_assets/sprites/h2_wave1.png");
        this.load.image("wave_two", "project_assets/sprites/h2_wave2.png");
        this.load.image("wave_three", "project_assets/sprites/h2_wave3.png");

        super.loadScene();
    }

    initScene(init: Record<string, any>): void {

        // retrieve stats from previous level
        if (init.characterStats) {
            this.playerStats = init.characterStats;
        } 
        
        // preserve cheats
        this.invincible = init.invincible;
        this.unlockAll = init.unlockAll;
        this.instant_kill = init.instant_kill;
        this.speedUp = init.speedUp;
    }
    
    startScene(): void {
        // add in the tilemap and get the wall layer
        let tilemapLayers = this.add.tilemap("levelH2", new Vec2(1, 1));
        this.walls = <OrthogonalTilemap>tilemapLayers[2].getItems()[0];
        this.walls.setGroup("wall");

        // get the floor layer
        this.floorCheck = <OrthogonalTilemap>tilemapLayers[0].getItems()[0];
        
        // handles spawning and viewport tracing
        this.viewport.setBounds(0, 0, 64*32, 64*32);
        this.viewport.setSize(this.viewport.getHalfSize());  
        this.playerSpawn = new Vec2(32*32, 32*32);

        // initial number of enemies
        this.maxEnemies = 20;
        
        super.startScene();
        this.initLayers();
        this.initializeWeapons();
        this.initPlayer();

        this.enemyConstructorPairings = new Map([["Skull" , EnemyAI], ["Witch", RangeAI], ["Hellhound", EnemyAI]]);

        // set game time
        this.gameTimer = new Timer(5000);
        this.gameTime = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(this.viewport.getHalfSize().x, 20), text: `${this.parseTimeLeft(this.gameTimer.getTotalTime())}`});
    
        // update health
        let percentage = this.playerStats.stats.health/this.playerStats.stats.maxHealth;
        this.healthBar.size = new Vec2(percentage*256, 8);
        this.healthBar.position = new Vec2(196 + (percentage-1)*128,16);

        // update exp
        let reqExp = Math.pow(this.playerStats.level, 1.5);
        let expPercentage = this.playerStats.experience / (reqExp * 500);
        this.expBar.size = new Vec2(expPercentage*216, 4);
        this.expBar.position = new Vec2(108*expPercentage+(216/2), 32);

        // player GUI
        this.levelUI = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(86, 32), 
            text: "Lvl" + this.playerStats.level});
        this.levelUI.textColor = Color.BLACK;

        // cooldown icon
        this.weaponIcon = this.add.sprite("bident", "gui");
        this.weaponIcon.position = new Vec2(48, 24);
        this.weaponIconCoolDown = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(48, 24), size: new Vec2(32,32)});
        this.weaponIconCoolDown.color = Color.GRAY;
        this.weaponIconCoolDown.alpha = 0;
        
        // add spawnable enemies
        this.spawnableEnemies.push({
            name: "Skull",
            health: 1,
            player: this.player,
            speed: 125,
            weapon: this.createWeapon("knife"),
            range: 10,
            experience: 200
        });

        this.spawnableEnemies.push({
            name: "Witch",
            health: 1,
            player: this.player,
            speed: 150,
            weapon: this.createWeapon("knife"),
            range: 150,
            experience: 250,
        });

        this.spawnableEnemies.push({
            name: "Hellhound",
            health: 1,
            player: this.player,
            speed: 100,
            weapon: this.createWeapon("knife"),
            range: 20,
            experience: 320,
        });
        
        this.startSceneTimer.start();
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
        // spawn enemies in
        if(this.startSceneTimer.isStopped()){
            if(!this.startedLevel){
                this.player.unfreeze();
                this.player.setAIActive(true, {});
                this.startedLevel = true;
            }

            if (this.currentWave < 3 && this.currentNumEnemies === 0 && !this.prep) {
                this.midWave = false;
                switch (this.currentWave) {
                    case 0:
                        this.createChallengeLabel("wave_one");
                        break;
                    case 1:
                        this.createChallengeLabel("wave_two");
                        break;
                    case 2:
                        this.createChallengeLabel("wave_three");
                        break;
                    default:
                        break;
                }
                this.gameTimer.start();
                this.prep = true;
            }
            
            if (!this.gameTimer.isStopped()) {
                this.gameTime.text = `${this.parseTimeLeft(this.gameTimer.getTimeLeft())}`;
            } else this.midWave = true;

            if(this.currentWave < 3 && this.currentNumEnemies === 0 && !this.pauseFlag){
                if (this.midWave) {
                    for (let i = 0; i < this.maxEnemies; i++) {
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
                            projectiles: this.createProjectiles(3, "Hex"),
                            cooldown: 2000,
                            scene: this,
                            ai: this.enemyConstructorPairings.get(enemyType.name)
                        }
                        this.enemyArray.push(this.addEnemy(enemyType.name, options));

                         // tailored to update enemy array
                        const fireballs = (<HadesController> this.playerController).projectiles

                        for (let f of fireballs){
                            (<FireballAI> f._ai).setEnemies(this.enemyArray);
                        }

                    }
    
                    this.currentWave += 1;
                    this.maxEnemies = Math.floor(this.maxEnemies * 1.75);
                    this.prep = false;
                }
            }
    
            if(this.currentWave >= 3 && this.currentNumEnemies === 0) {
                //end level and move to level z3
                if(this.changeLevelTimer === undefined){
                    this.changeLevelTimer = new Timer(5000);
                    this.changeLevelTimer.start();
                }

                if(this.changeLevelTimer.getTimeLeft() <= 0){

                    console.log("YOU WIN");
                    this.viewport.setSize(1600, 900);
                    // this.sceneManager.changeToScene(level_z3, {characterStats: this.playerStats, 
                    //     weapon: (<PlayerController>this.player._ai).weapon,
                    //     invincible: this.invincible, 
                    //     unlockAll: this.unlockAll,
                    //     instant_kill: this.instant_kill,
                    //     speedUp: this.speedUp
                    // }, this.sceneOptions);
                }
            }
        }
    }

    protected initPlayer() : void {
       // player spawning and handling
       this.player = this.add.animatedSprite("Hades", "primary");
       this.player.scale.set(1, 1);
       if(!this.playerSpawn){
           console.warn("Player spawn was never set - setting spawn to (0, 0)");
           this.playerSpawn = Vec2.ZERO;
       }
       this.player.position = this.playerSpawn;
       this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(16, 16)));
       
       // if fresh incoming
       // last argument is arbitrary because Hades will not use the weapon system, health was 75
       if (!this.playerStats){
        this.playerStats = new CharacterStat(75000, 5, 5, 3, 1);
       }

       // add player AI: range/weapon is arbitrary ... weaponV2 will possible be an updated sprite
       this.player.addAI(HadesController,
           {
               speed: this.playerStats.stats.speed,
               health: this.playerStats.stats.health,
               inputEnabled: true,
               range: 1,
               playerStats: this.playerStats,
               weapon: null,
               weaponV2: null,
               projectiles: this.createProjectiles(5, "fireball"),
               floor: this.floorCheck
           });

       // setup player and viewport tracking
       this.player.animation.play("idle");
       this.player.setGroup("player");
       this.player.freeze();
       this.player.setAIActive(false, {});
       this.viewport.follow(this.player);

       // place player in battle manager and pass player controller back into parent
       this.battleManager.setPlayers([<BattlerAI>this.player._ai]);
       this.playerController = <PlayerController> this.player._ai;
    }

    protected initLayers() : void {
        // Add a layer for the UI
        this.addUILayer("UI");
        
        // Add the primary layer for players and enemies
        this.addLayer("primary", 10);
    }


}