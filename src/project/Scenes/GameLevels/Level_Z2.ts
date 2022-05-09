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
import Weapon from "../../GameSystems/items/Weapon";
import Lightning from "../../GameSystems/items/WeaponTypes/Primary/Lightning";
import level_z3 from "./Level_Z3";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import Z3_Cutscene from "../Cutscenes/Z3_Cutscene";
import GiantAI from "../../AI/GiantAI";

export default class level_z2 extends GameLevel {

    private weapon: Weapon;

    private prep: boolean = false;
    private midWave: boolean;
    private currentWave: number = 0;

    loadScene(): void {
        //Load Zeus
        this.load.spritesheet("zeus", "project_assets/spritesheets/Zeus.json"); 

        //Load Enemies
        this.load.spritesheet("snake", "project_assets/spritesheets/Snake.json");
        this.load.spritesheet("harpy", "project_assets/spritesheets/harpy.json");
        this.load.spritesheet("giant", "project_assets/spritesheets/Giant.json")

        //Load tilemap
        this.load.tilemap("levelZ2", "project_assets/tilemaps/LevelZ2.json");

        this.load.spritesheet("lightning", "project_assets/spritesheets/lightning.json");
        this.load.spritesheet("lightningv2", "project_assets/spritesheets/lightningv2.json");
        this.load.spritesheet("batSwing", "project_assets/spritesheets/batSwing.json");
        this.load.spritesheet("feather", "project_assets/spritesheets/Feather.json");
        this.load.spritesheet("rock", "project_assets/spritesheets/boulder.json");
        this.load.image("lightning", "project_assets/sprites/lightning.png");

        this.load.image("lightningImg", "project_assets/sprites/lightning.png");

        //Load Challenge img
        this.load.image("objective", "project_assets/sprites/z2_challenge.png");
        this.load.image("wave_one", "project_assets/sprites/z2_wave1.png");
        this.load.image("wave_two", "project_assets/sprites/z2_wave2.png");
        this.load.image("wave_three", "project_assets/sprites/z2_wave3.png");

        //Load sound effect and music
        this.load.audio("weapon", "project_assets/sounds/lightning.wav");
        this.load.audio("weaponv2", "project_assets/sounds/lightningv2.wav");
        this.load.audio("zeus", "project_assets/music/zeus.mp3");

        super.loadScene();
    }

    initScene(init: Record<string, any>): void {
        if (init.characterStats) {
            this.playerStats = init.characterStats;
            let weapon = <Weapon>init.weapon;
            weapon.cooldownTimer = new Timer(this.playerStats.weaponCoolDown);
            weapon.sprite.setScene(this);
            this.weapon = weapon;
            this.upgradedWeapon = init.upgradedWeapon;
        } 
        
        this.invincible = init.invincible;
        this.unlockAll = init.unlockAll;
        this.instant_kill = init.instant_kill;
        this.speedUp = init.speedUp;
        this.unlockedLevels = init.unlockedLevels;
        this.unlockedLevels[1] = true;
        this.inventory = init.inventory;
    }
    
    startScene(): void {
        // Add in the tilemap and get the wall layer
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "zeus", loop: true, holdReference: true});
        this.levelMusic = "zeus";
        let tilemapLayers = this.add.tilemap("levelZ2", new Vec2(1, 1));
        this.walls = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];
        this.walls.setGroup("wall");
        
        this.viewport.setBounds(0, 0, 64*32, 64*32);
        this.viewport.setSize(this.viewport.getHalfSize());
        
        this.playerSpawn = new Vec2(32*32, 32*32);
        // this.viewport.setFocus(new Vec2(this.playerSpawn.x, this.playerSpawn.y));
        
        this.maxEnemies = 10;
        
        super.startScene();
        this.initLayers();
        this.initializeWeapons();
        this.initPlayer();

        this.enemyConstructorPairings = new Map([["snake" , EnemyAI], ["harpy", RangeAI], ["giant", GiantAI]]);

        this.gameTimer = new Timer(5000);
        this.gameTime = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(this.viewport.getHalfSize().x, 20), text: `${this.parseTimeLeft(this.gameTimer.getTotalTime())}`});
    
        //Add health bar and exp bar
        // update health bar
        let percentage = this.playerStats.stats.health/this.playerStats.stats.maxHealth;
        this.healthNumber = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(196, 17), text: `${this.playerStats.stats.health} / ${this.playerStats.stats.maxHealth}`});
        this.healthNumber.textColor = Color.WHITE;
        // scale by percentage
        this.healthBar.size = new Vec2(percentage*256, 8);
        // rebalance position
        this.healthBar.position = new Vec2(196 + (percentage-1)*128,16);

        //Update the exp bar
        let reqExp = Math.pow(this.playerStats.level, 1.5);
        let expPercentage = this.playerStats.experience / (reqExp * 500);
        this.expBar.size = new Vec2(expPercentage*216, 4);
        this.expBar.position = new Vec2(108*expPercentage+(216/2), 32);

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

        this.spawnableEnemies.push({
            name: "harpy",
            health: 200,
            player: this.player,
            speed: 145,
            weapon: this.createWeapon("knife"),
            range: 150,
            experience: 200,
        });

        this.spawnableEnemies.push({
            name: "giant",
            health: 600,
            player: this.player,
            speed: 100,
            weapon: this.createWeapon("batSwing"),
            range: 64,
            experience: 400,
        });
        //Position the rhea statue and zone
        this.rheaStatue = this.add.animatedSprite("rheaStatue", "primary");
        this.rheaStatue.position = new Vec2(35*32, 20*32);
        this.rheaStatue.animation.play("idle");

        this.rheaStatueZone = this.add.graphic(GraphicType.RECT, "primary",{position: new Vec2(35*32, 20*32), size: new Vec2(6*32,6*32)});
        this.rheaStatueZone.color = Color.TRANSPARENT;

        this.populateHUD();
        
        this.startSceneTimer.start();
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
        // Spawn enemies in

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
                            projectiles: (enemyType.name === "harpy") ? this.createProjectiles(3,"feather") : 
                                (enemyType.name === "giant") ? this.createProjectiles(1,"rock") : null,
                            cooldown: 2000,
                            scene: this,
                            ai: this.enemyConstructorPairings.get(enemyType.name)
                        }
                        this.enemyArray.push(this.addEnemy(enemyType.name, options));
                    }
    
                    this.currentWave += 1;
                    this.maxEnemies = Math.floor(this.maxEnemies * 1.75);
                    this.prep = false;
                }
            }
    
            if(this.currentWave >= 3 && this.currentNumEnemies === 0) {
                //end level and move to level z3
      
                this.cleanUp();
                this.changeLevelTimer = new Timer(5000, ()=> {

                    this.viewport.setSize(1600, 900);
                    this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "zeus"});
                    this.sceneManager.changeToScene(Z3_Cutscene, {characterStats: this.playerStats, 
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

    protected initPlayer() : void {
        this.player = this.add.animatedSprite("zeus", "primary");
        this.player.scale.set(1, 1);
        if(!this.playerSpawn){
            console.warn("Player spawn was never set - setting spawn to (0, 0)");
            this.playerSpawn = Vec2.ZERO;
        }
        this.player.position = this.playerSpawn;
        this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(16, 16)));

        if (this.playerStats === undefined) {
            // create weapon
            this.weapon = this.createWeapon("lightning");
            if (this.instant_kill) this.weapon.type.damage = 10000;
            this.playerStats = new CharacterStat(100, 100, 10, (this.speedUp) ? 15 : 2, this.weapon.cooldownTimer.getTotalTime(), .08);
            //Create an enemy for players to get exp
            let enemy = this.add.animatedSprite("snake", "primary");
            enemy.scale.set(1,1);
            enemy.addPhysics(new AABB(Vec2.ZERO, new Vec2(8,8))); //Monkey patched collision box, dynamic later
            enemy.animation.play("moving");
            enemy.position = new Vec2(this.player.position.x , this.player.position.y - 32);
            let options = {
                health: 1,
                player: this.player,    
                speed: 0,
                weapon: this.createWeapon("knife"),
                range: 0,
                experience: 9000, // for level 5
                projectiles: (false) ? this.createProjectiles(3 , "feather") : null,
                cooldown: 1000,
                scene: this,
            }
            enemy.addAI(EnemyAI, options);
            enemy.setGroup("enemy");
            enemy.freeze();
            this.currentNumEnemies += 1;

            if(this.battleManager.enemies === undefined){
                this.battleManager.setEnemies([<BattlerAI>enemy._ai])
            } else {
                this.battleManager.enemies.push(<BattlerAI>enemy._ai);
            }
        } else {
            this.weapon.battleManager = this.battleManager;
        }

        // TODO - ADD PLAYER AI HERE
        this.player.addAI(PlayerController,
            {
                speed: this.playerStats.stats.speed,
                health: this.playerStats.stats.health,
                inputEnabled: true,
                range: 30,
                playerStats: this.playerStats,
                weapon: this.weapon,
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

    protected initLayers() : void {
        // Add a layer for the UI
        this.addUILayer("UI");
        
        // Add the primary layer for players and enemies
        this.addLayer("primary", 10);
    }


}