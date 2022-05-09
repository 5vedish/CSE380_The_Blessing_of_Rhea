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
import Graphic from "../../../Wolfie2D/Nodes/Graphic";
import { TweenableProperties } from "../../../Wolfie2D/Nodes/GameNode";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import Sprite from "../../../Wolfie2D/Nodes/Sprites/Sprite";
import level_p2 from "./Level_P2";
import { Project_Events } from "../../project_constants";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import P2_Cutscene from "../Cutscenes/P2_Cutscene";

export default class level_p1 extends GameLevel {
    private prep: boolean = false;
    private midWave: boolean;
    private currentWave: number = 0;

    initScene(init: Record<string, any>): void {
        this.invincible = init.invincible;
        this.unlockAll = init.unlockAll;
        this.instant_kill = init.instant_kill;
        this.speedUp = init.speedUp;
        this.unlockedLevels = init.unlockedLevels;
        this.unlockedLevels[3] = true;
    }

    loadScene(): void {
        //Load Poseidon
        this.load.spritesheet("poseidon", "project_assets/spritesheets/Poseidon.json"); 
        this.load.spritesheet("trident", "project_assets/spritesheets/waterfall.json");
        this.load.spritesheet("waterfallv2", "project_assets/spritesheets/waterfallv2.json");
        this.load.image("trident", "project_assets/sprites/trident.png");
        this.load.image("tridentImg", "project_assets/sprites/trident.png");

        //Load Enemies
        this.load.spritesheet("crab", "project_assets/spritesheets/Crab.json");
        this.load.spritesheet("cyclops", "project_assets/spritesheets/Cyclops.json");
        this.load.spritesheet("octopus", "project_assets/spritesheets/Octopus.json");
        this.load.spritesheet("ink", "project_assets/spritesheets/ink.json")

        //Load tilemap
        this.load.tilemap("levelP1", "project_assets/tilemaps/LevelP1.json");

        //Load Challenge img
        this.load.image("objective", "project_assets/sprites/p1_challenge.png");
        this.load.image("wave_one", "project_assets/sprites/p1_wave1.png");
        this.load.image("wave_two", "project_assets/sprites/p1_wave2.png");
        this.load.image("wave_three", "project_assets/sprites/p1_wave3.png");

        //Load sound effect and music
        this.load.audio("weapon", "project_assets/sounds/waterfall.wav");
        this.load.audio("weaponv2", "project_assets/sounds/waterfallv2.wav");
        this.load.audio("projectile", "project_assets/sounds/blast.wav");
        this.load.audio("poseidon", "project_assets/music/poseidon.mp3");

        super.loadScene();
    }

    startScene(): void {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "poseidon", loop: true, holdReference: true});
        this.levelMusic = "poseidon";
        // Add in the tilemap and get the wall layer
        let tilemapLayers = this.add.tilemap("levelP1", new Vec2(1, 1));
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
        
        //Create how long players need to survive for
        this.gameTimer = new Timer(5000);
        this.gameTime = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(this.viewport.getHalfSize().x, 20), text: `${this.parseTimeLeft(this.gameTimer.getTotalTime())}`});
    
        this.levelUI = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(86, 32), 
            text: "Lvl" + this.playerStats.level});
        this.levelUI.textColor = Color.BLACK;

        this.healthNumber = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(196, 17), text: `${this.playerStats.stats.health} / ${this.playerStats.stats.maxHealth}`})
        this.healthNumber.textColor = Color.WHITE;

        this.weaponIcon = this.add.sprite("tridentImg", "gui");
        this.weaponIcon.position = new Vec2(48, 24);
        this.weaponIconCoolDown = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(48, 24), size: new Vec2(32,32)});
        this.weaponIconCoolDown.color = Color.GRAY;
        this.weaponIconCoolDown.alpha = 0;
        
        this.spawnableEnemies.push({
            name: "crab",
            health: 200,
            player: this.player,
            speed: 125,
            weapon: this.createWeapon("knife"),
            range: 16,
            experience: 100
        });

        this.spawnableEnemies.push({
            name: "cyclops",
            health: 550,
            player: this.player,
            speed: 100,
            weapon: this.createWeapon("knife"),
            range: 32,
            experience: 400,
        });

        this.spawnableEnemies.push({
            name: "octopus",
            health: 250,
            player: this.player,
            speed: 150,
            weapon: this.createWeapon("knife"),
            range: 150,
            experience: 250,
        });

        this.enemyConstructorPairings = new Map([["crab" , EnemyAI], ["cyclops", EnemyAI], ["octopus", RangeAI]]);
        
        //Position the rhea statue and zone
        this.rheaStatue = this.add.animatedSprite("rheaStatue", "primary");
        this.rheaStatue.position = new Vec2((29*32) + 32, (4*32) + 32);
        // this.rheaStatue.addPhysics(new AABB(Vec2.ZERO, new Vec2(24, 20)));
        // this.rheaStatue.setGroup("wall");
        this.rheaStatue.animation.play("idle");
        
        this.rheaStatueZone = this.add.graphic(GraphicType.RECT, "primary",{position: this.rheaStatue.position, size: new Vec2(3*32,3*32)});
        this.rheaStatueZone.color = Color.TRANSPARENT;
        this.rheaStatueCooldown = new Timer(20000);

        this.populateHUD();
        
        //Start spawning delay
        this.createChallengeLabel("objective");
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

        // create weapon
        let weapon = this.createWeapon("trident");
        if (this.instant_kill) weapon.type.damage = 10000;
        
        this.playerStats = new CharacterStat(175, weapon.type.damage, 10,(this.speedUp) ? 15 :  2, weapon.cooldownTimer.getTotalTime(), .05);
        // TODO - ADD PLAYER AI HERE
        this.player.addAI(PlayerController,
            {
                speed: this.playerStats.stats.speed,
                health: this.playerStats.stats.health,
                inputEnabled: true,
                range: 30,
                playerStats: this.playerStats,
                weapon: weapon,
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
                            projectiles: this.createProjectiles(2, (enemyType.name === "octopus") ? "ink" : null),
                            cooldown: 2000,
                            scene: this,
                            ai: this.enemyConstructorPairings.get(enemyType.name)
                        }
                        this.enemyArray.push(this.addEnemy(enemyType.name, options));
                    }
    
                    this.currentWave += 1;
                    this.prep = false;
                }
            }
    
            if(this.currentWave >= 3 && this.currentNumEnemies === 0) {
                //end level and move to level z2
      
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "poseidon"});
                this.cleanUp();
                this.changeLevelTimer = new Timer(5000, () => {

                    this.viewport.setSize(1600, 900);
                    this.sceneManager.changeToScene(P2_Cutscene, {
                        invincible: this.invincible, 
                        unlockAll: this.unlockAll,
                        instant_kill: this.instant_kill,
                        speedUp: this.speedUp, 
                        unlockedLevels: this.unlockedLevels,
                        characterStats: this.playerStats, 
                        weapon: (<PlayerController>this.player._ai).weapon,
                        inventory: this.inventory
                    }, this.sceneOptions);

                });
                this.changeLevelTimer.start();
            }
        }
        
    }
}