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
import RangeAI from "../../AI/RangeAI";
import Timer from "../../../Wolfie2D/Timing/Timer";
import { TweenableProperties } from "../../../Wolfie2D/Nodes/GameNode";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import Sprite from "../../../Wolfie2D/Nodes/Sprites/Sprite";
import Weapon from "../../GameSystems/items/Weapon";
import LeviathanAI from "../../AI/LeviathanAI";
import MainMenu from "../MainMenu";
import CharacterStat from "../../PlayerStatus";
import { Project_Events } from "../../project_constants";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import level_h1 from "./Level_H1";
import Graphic from "../../../Wolfie2D/Nodes/Graphic";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";

export default class level_p3 extends GameLevel {
    private freeKill: boolean = false;
    private bossHealthBar: Graphic;
    private boss: CustomEnemy;
    private bossSpawned: boolean = false;
    private leviathan: AnimatedSprite;
    private weapon: Weapon;
    
    initScene(init: Record<string, any>): void {
        if (init.characterStats) {
            this.playerStats = init.characterStats;
            let weapon = <Weapon>init.weapon;
            weapon.cooldownTimer = new Timer(this.playerStats.weaponCoolDown);
            weapon.sprite.setScene(this);
            this.weapon = weapon;
        } 
        
        this.invincible = init.invincible;
        this.unlockAll = init.unlockAll;
        this.instant_kill = init.instant_kill;
        this.speedUp = init.speedUp;
        this.unlockedLevels = init.unlockedLevels;
        this.unlockedLevels[5] = true;
        this.inventory = init.inventory;
    }

    loadScene(): void {
        //Load Poseidon
        this.load.spritesheet("poseidon", "project_assets/spritesheets/Poseidon.json"); 
        this.load.spritesheet("trident", "project_assets/spritesheets/waterfall.json");
        this.load.spritesheet("waterfallv2", "project_assets/spritesheets/waterfallv2.json");
        this.load.image("trident", "project_assets/sprites/trident.png");
        this.load.image("tridentImg", "project_assets/sprites/trident.png");

        //Load Enemies
        this.load.spritesheet("leviathan", "project_assets/spritesheets/Leviathan.json");
        this.load.spritesheet("blast", "project_assets/spritesheets/blast.json");
        this.load.spritesheet("blastV2", "project_assets/spritesheets/blastV2.json");
        this.load.image("blast", "project_assets/sprites/blast.png");
        this.load.spritesheet("crab", "project_assets/spritesheets/Crab.json");
        this.load.spritesheet("cyclops", "project_assets/spritesheets/Cyclops.json");
        this.load.spritesheet("octopus", "project_assets/spritesheets/Octopus.json");
        this.load.spritesheet("ink", "project_assets/spritesheets/ink.json")

        //Load tilemap
        this.load.tilemap("levelP3", "project_assets/tilemaps/LevelP3.json");

        //Load Challenge img
        this.load.image("objective", "project_assets/sprites/p3_challenge.png");
        this.load.image("end", "project_assets/sprites/p3_end.png");

        //Load sound effect and music
        this.load.audio("weapon", "project_assets/sounds/waterfall.wav");
        this.load.audio("weaponv2", "project_assets/sounds/waterfallv2.wav");
        this.load.audio("projectile", "project_assets/sounds/blast.wav");
        this.load.audio("leviathan", "project_assets/music/leviathan.mp3");
        this.load.audio("main_menu", "project_assets/music/main_menu.mp3");

        super.loadScene();
    }

    startScene(): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "leviathan", loop: true, holdReference: true});
        this.levelMusic = "leviathan";
        // Add in the tilemap and get the wall layer
        let tilemapLayers = this.add.tilemap("levelP3", new Vec2(1, 1));
        this.walls = <OrthogonalTilemap>tilemapLayers[2].getItems()[0];
        this.walls.setGroup("wall");
        
        this.viewport.setBounds(0, 0, 64*32, 64*32);
        this.viewport.setSize(this.viewport.getHalfSize());
        
        this.playerSpawn = new Vec2((32*32) + 16, (32*32) + 16);
        // this.viewport.setFocus(new Vec2(this.playerSpawn.x, this.playerSpawn.y));
        
        this.maxEnemies = 15;
        
        super.startScene();
        this.initLayers();
        this.initializeWeapons();
        this.initPlayer();

        // update health bar
        let percentage = this.playerStats.stats.health/this.playerStats.stats.maxHealth;
        // scale by percentage
        this.healthBar.size = new Vec2(percentage*256, 8);
        // rebalance position
        this.healthBar.position = new Vec2(196 + (percentage-1)*128,16);
        
        this.levelUI = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(86, 32), 
            text: "Lvl" + this.playerStats.level});
        this.levelUI.textColor = Color.BLACK;

        this.weaponIcon = this.add.sprite("tridentImg", "gui");
        this.weaponIcon.position = new Vec2(48, 24);
        this.weaponIconCoolDown = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(48, 24), size: new Vec2(32,32)});
        this.weaponIconCoolDown.color = Color.GRAY;
        this.weaponIconCoolDown.alpha = 0;

        this.boss = {
            name: "leviathan",
            health: 8000,
            player: this.player,
            speed: 150,
            weapon: this.createWeapon("blast"),
            range: 500,
            experience: 5000
        }
        
        this.spawnableEnemies.push({
            name: "crab",
            health: 200,
            player: this.player,
            speed: 125,
            weapon: this.createWeapon("knife"),
            range: 16,
            experience: 200
        });

        this.spawnableEnemies.push({
            name: "cyclops",
            health: 450,
            player: this.player,
            speed: 100,
            weapon: this.createWeapon("knife"),
            range: 32,
            experience: 600,
        });

        this.spawnableEnemies.push({
            name: "octopus",
            health: 200,
            player: this.player,
            speed: 150,
            weapon: this.createWeapon("blast"),
            range: 125,
            experience: 250,
        });

        this.enemyConstructorPairings = new Map([["crab" , EnemyAI], ["cyclops", EnemyAI], ["octopus", RangeAI]]);

        //Add boss health bar
        this.bossHealthBar = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(400, 425), size: new Vec2(600, 16)});
        let bossHealthBarBorder = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(400, 425), size: new Vec2(600, 16)});
        bossHealthBarBorder.alpha = 0.5;
        
         //Position the rhea statue and zone
         this.rheaStatue = this.add.animatedSprite("rheaStatue", "primary");
         this.rheaStatue.position = new Vec2((48*32) + 32, (5*32) + 32);
        //  this.rheaStatue.addPhysics(new AABB(Vec2.ZERO, new Vec2(24, 40)));
        //  this.rheaStatue.setGroup("wall");
         this.rheaStatue.animation.play("idle");
         
         this.rheaStatueZone = this.add.graphic(GraphicType.RECT, "primary",{position: this.rheaStatue.position, size: new Vec2(3*32,3*32)});
         this.rheaStatueZone.color = Color.TRANSPARENT;
         this.rheaStatueCooldown = new Timer(30000);

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
        this.player = this.add.animatedSprite("poseidon", "primary");
        this.player.scale.set(1, 1);
        if(!this.playerSpawn){
            console.warn("Player spawn was never set - setting spawn to (0, 0)");
            this.playerSpawn = Vec2.ZERO;
        }
        this.player.position = this.playerSpawn;
        this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(12, 12)));
        //this.player.colliderOffset.set(0, 2);

        if (this.playerStats === undefined) {
            // create weapon
            this.weapon = this.createWeapon("trident");
            if (this.instant_kill) this.weapon.type.damage = 10000;
            this.playerStats = new CharacterStat(175, this.weapon.type.damage, 10, (this.speedUp) ? 15 : 2, this.weapon.cooldownTimer.getTotalTime());

            //Create an enemy for players to get exp
            let enemy = this.add.animatedSprite("crab", "primary");
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
                experience: 20000,
                projectiles: this.createProjectiles(3 , "ink"),
                cooldown: 1000,
                scene: this,
            }
            enemy.addAI(EnemyAI, options);
            enemy.setGroup("enemy");
            enemy.freeze();
            this.currentNumEnemies += 1;
            this.freeKill = true;

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
                weaponV2: "waterfallv2",
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
                this.player.unfreeze();
                this.player.setAIActive(true, {});
                this.startedLevel = true;
            }

            if (this.currentNumEnemies === 0 && this.freeKill) {
                this.freeKill = false;
            }

            if (!this.bossSpawned && !this.bossDefeated && !this.freeKill) {
                this.createChallengeLabel("objective");
                let enemyPosition = this.randomSpawn();
                let options = {
                    name: this.boss.name,
                    health: this.boss.health,
                    player: this.boss.player,
                    speed: this.boss.speed,
                    weapon: this.boss.weapon,
                    range: this.boss.range,
                    experience: this.boss.experience,
                    position: enemyPosition,
                    projectiles: this.createProjectiles(10, "blast"),
                    projectilesV2: this.createProjectiles(10, "blastV2"),
                    cooldown: 1000,
                    scene: this,
                    ai: LeviathanAI
                } 

                this.leviathan = this.add.animatedSprite("leviathan", "primary");

                this.leviathan.scale.set(1.5,1.5);
                this.leviathan.addPhysics(new AABB(Vec2.ZERO, new Vec2(8,8))); //Monkey patched collision box, dynamic later
                this.leviathan.animation.play("moving");
                this.leviathan.position = options.position;
                this.leviathan.addAI(options.ai, options);
                this.leviathan.setGroup("enemy");

                if(this.battleManager.enemies === undefined){
                    this.battleManager.setEnemies([<BattlerAI>this.leviathan._ai])
                } else {
                    this.battleManager.enemies.push(<BattlerAI>this.leviathan._ai);
                }

                this.enemyArray.push(this.leviathan);
                
                this.bossSpawned = true;
            }

            if(!this.freeKill && !this.bossDefeated && this.bossSpawned && this.currentNumEnemies < this.maxEnemies && !this.pauseFlag) {
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
                    projectiles: this.createProjectiles(2, (enemyType.name === "octopus") ? "ink" : null),
                    cooldown: 2000,
                    scene: this,
                    ai: this.enemyConstructorPairings.get(enemyType.name)
                }
                
                this.enemyArray.push(this.addEnemy(enemyType.name, options));
            }

            // Update health bar for leviathan
            if(!this.freeKill && this.leviathan._ai !== undefined){
                let bossPercentage = (<LeviathanAI>this.leviathan._ai).health/(<LeviathanAI>this.leviathan._ai).maxHealth;
                this.bossHealthBar.size = new Vec2(600*bossPercentage, 16);
            }
    
            if(this.bossDefeated && this.currentNumEnemies === 0) {
           
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "leviathan"});
                this.changeLevelTimer = new Timer(5000, () => {

                    this.viewport.setSize(1600, 900);
                    this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "leviathan"});
                    this.sceneManager.changeToScene(level_h1, {
                        invincible: this.invincible, 
                        unlockAll: this.unlockAll,
                        instant_kill: this.instant_kill,
                        speedUp: this.speedUp, 
                        unlockedLevels: this.unlockedLevels
                    }, this.sceneOptions);
                }); 
                this.createChallengeLabel("end");
                this.changeLevelTimer.start();
                
                
            }
        }
        
    }
}