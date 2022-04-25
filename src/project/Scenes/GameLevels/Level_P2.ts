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
import level_p3 from "./Level_P3";
import CharacterStat from "../../PlayerStatus";
import { Project_Events } from "../../project_constants";

export default class level_p2 extends GameLevel {
    private halfway: boolean = false;
    private rheaStatueUsed: boolean;
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
        this.load.tilemap("levelP1", "project_assets/tilemaps/LevelP2.json");

        //Load Challenge img
        this.load.image("objective", "project_assets/sprites/p1_challenge.png");
        this.load.image("end", "project_assets/sprites/p2_end.png");

        super.loadScene();
    }

    startScene(): void {
        // Add in the tilemap and get the wall layer
        let tilemapLayers = this.add.tilemap("levelP1", new Vec2(1, 1));
        this.walls = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];
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
        this.gameTimer = new Timer(120000);
        this.gameTime = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(this.viewport.getHalfSize().x, 20), text: `${this.parseTimeLeft(this.gameTimer.getTotalTime())}`});
    
        this.levelUI = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(86, 32), 
            text: "Lvl" + this.playerStats.level});
        this.levelUI.textColor = Color.BLACK;

        this.weaponIcon = this.add.sprite("tridentImg", "gui");
        this.weaponIcon.position = new Vec2(48, 24);
        this.weaponIconCoolDown = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(48, 24), size: new Vec2(32,32)});
        this.weaponIconCoolDown.color = Color.GRAY;
        this.weaponIconCoolDown.alpha = 0;
        
        this.spawnableEnemies.push({
            name: "crab",
            health: 2,
            player: this.player,
            speed: 125,
            weapon: this.createWeapon("knife"),
            range: 10,
            experience: 200
        });

        this.spawnableEnemies.push({
            name: "cyclops",
            health: 3,
            player: this.player,
            speed: 100,
            weapon: this.createWeapon("knife"),
            range: 10,
            experience: 250,
        });

        this.enemyConstructorPairings = new Map([["crab" , EnemyAI], ["cyclops", EnemyAI], ["octopus", RangeAI]]);
        
        //Position the rhea statue and zone
        this.rheaStatue = this.add.animatedSprite("rheaStatue", "primary");
        this.rheaStatue.position = new Vec2((61*32) + 32, (36*32) + 32);
        this.rheaStatue.addPhysics(new AABB(Vec2.ZERO, new Vec2(24, 40)));
        this.rheaStatue.setGroup("wall");
        this.rheaStatue.animation.play("idle");
        
        this.rheaStatueZone = this.add.graphic(GraphicType.RECT, "primary",{position: this.rheaStatue.position, size: new Vec2(3*32,3*32)});
        this.rheaStatueZone.color = Color.TRANSPARENT;
        this.rheaStatueCooldown = new Timer(30000);

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
            if (this.instant_kill) this.weapon.type.damage = 1000;
            this.playerStats = new CharacterStat(100, this.weapon.type.damage, 10, 2, this.weapon.cooldownTimer.getTotalTime());
        } else {
            this.weapon.battleManager = this.battleManager;
        }

        this.player.addAI(PlayerController,
            {
                speed: this.playerStats.stats.speed,
                health: this.playerStats.stats.health,
                inputEnabled: true,
                range: 30,
                playerStats: this.playerStats,
                weapon: this.weapon,
                weaponV2: "waterfallv2"
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

            if(this.rheaStatueCooldown.isStopped()){
                if (this.rheaStatueZone.boundary.overlapArea(this.player.boundary)) {
                    this.rheaStatue.animation.play("heal");
                    this.rheaStatue.animation.queue("used");
                    this.playerStats.editHealth(this.rheaStatueHeal);
                    this.emitter.fireEvent(Project_Events.HEALTHCHANGED);
                    this.rheaStatueCooldown.start();
                } else this.rheaStatue.animation.playIfNotAlready("idle");
            }

            if(!this.gameTimer.isStopped() && this.currentNumEnemies < this.maxEnemies && !this.pauseFlag){
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
                    projectiles: this.createProjectiles(2, "ink"),
                    cooldown: 2000,
                    scene: this,
                    ai: this.enemyConstructorPairings.get(enemyType.name)
                }
                
                this.enemyArray.push(this.addEnemy(enemyType.name, options));
            }
    
            //Update game timer
            this.gameTime.text = `${this.parseTimeLeft(this.gameTimer.getTimeLeft())}`;

            if(this.gameTimer.getTimeLeft() <= this.gameTimer.getTotalTime()/2 && !this.halfway){
                this.spawnableEnemies.push({
                    name: "octopus",
                    health: 2,
                    player: this.player,
                    speed: 125,
                    weapon: this.createWeapon("knife"),
                    range: 150,
                    experience: 250,
                });
                this.halfway = true;
            }
    
            //Half way through add harpies
            // console.log(this.gameTimer.getTimeLeft() + " | " + this.gameTimer.getTotalTime()/2)
    
            if(this.gameTimer.getTimeLeft() <= 0) {
                //end level and move to level z2
                if(this.changeLevelTimer === undefined){
                    this.changeLevelTimer = new Timer(5000);
                    this.createChallengeLabel("end");
                    this.changeLevelTimer.start();
                }
                
                if(this.changeLevelTimer.getTimeLeft() <= 0){
                    this.viewport.setSize(1600, 900);
                    this.sceneManager.changeToScene(level_p3, {
                        characterStats: this.playerStats, 
                        weapon: (<PlayerController>this.player._ai).weapon,
                        invincible: this.invincible, 
                        unlockAll: this.unlockAll,
                        instant_kill: this.instant_kill,
                        speedUp: this.speedUp
                    }, this.sceneOptions);
                }
            }
        }
        
    }
}