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
import HadesController from "../../AI/HadesController";
import FireballAI from "../../AI/FireballAI";
import level_h2 from "./Level_H2";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";

export default class level_h1 extends GameLevel {

    protected removeEnemies: boolean = false;

    private addedWitch: boolean = false;

    private floorCheck: OrthogonalTilemap;

    loadScene(): void {
        //Load Hades
        this.load.spritesheet("hades", "project_assets/spritesheets/Hades.json"); 

        //Load Enemies
        this.load.spritesheet("Skull", "project_assets/spritesheets/Skull.json")
        this.load.spritesheet("Witch", "project_assets/spritesheets/Witch.json")

        //Load tilemap
        this.load.tilemap("levelH1", "project_assets/tilemaps/LevelH1.json");
        

        this.load.spritesheet("fireball", "project_assets/spritesheets/fireball.json");
        this.load.spritesheet("hex", "project_assets/spritesheets/Hex.json");
        this.load.image("bident", "project_assets/sprites/bident.png");

        //Load Challenge img
        this.load.image("objective", "project_assets/sprites/h1_challenge.png");

        // Load audio and music
        this.load.audio("hades", "project_assets/music/main_menu.mp3");

        super.loadScene();
    }

    initScene(init: Record<string, any>): void {
        this.invincible = init.invincible;
        this.unlockAll = init.unlockAll;
        this.instant_kill = init.instant_kill;
        this.speedUp = init.speedUp;
        this.unlockedLevels = init.unlockedLevels;

        this.unlockedLevels[6] = true;
    }

    startScene(): void {
        // add in the tilemap and get the wall layer
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "hades", loop: true, holdReference: true});
        this.levelMusic = "hades";
        let tilemapLayers = this.add.tilemap("levelH1", new Vec2(1, 1));
        this.walls = <OrthogonalTilemap>tilemapLayers[2].getItems()[0];
        this.walls.setGroup("wall");

        // get the floor layer
        this.floorCheck = <OrthogonalTilemap>tilemapLayers[0].getItems()[0];
        
        this.viewport.setBounds(0, 0, 64*32, 64*32);
        this.viewport.setSize(this.viewport.getHalfSize());
        
        this.playerSpawn = new Vec2(32*32, 32*32);        
        
        this.maxEnemies = 30;
        
        super.startScene();
        this.initLayers();
        this.initializeWeapons(); // skulls will use slice
        this.initPlayer();
        
        // level timer and UI
        this.gameTimer = new Timer(30000);
        this.gameTime = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(this.viewport.getHalfSize().x, 20), text: `${this.parseTimeLeft(this.gameTimer.getTotalTime())}`});
    
        // player stat UI
        this.levelUI = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(86, 32), 
            text: "Lvl" + this.playerStats.level});
        this.levelUI.textColor = Color.BLACK;

        // cooldown icon
        this.weaponIcon = this.add.sprite("bident", "gui");
        this.weaponIcon.position = new Vec2(48, 24);
        this.weaponIconCoolDown = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(48, 24), size: new Vec2(32,32)});
        this.weaponIconCoolDown.color = Color.GRAY;
        this.weaponIconCoolDown.alpha = 0;
        
        this.spawnableEnemies.push({
            name: "Skull",
            health: 1,
            player: this.player,
            speed: 200,
            weapon: this.createWeapon("knife"),
            range: 16,
            experience: 50
        });

        this.enemyConstructorPairings = new Map([["Skull" , EnemyAI], ["Witch", RangeAI]]);
        
        //Position the rhea statue and zone
        this.rheaStatue = this.add.animatedSprite("rheaStatue", "primary");
        this.rheaStatue.position = new Vec2((37*32) + 32, (40*32) + 32);
        this.rheaStatue.animation.play("idle");
        
        this.rheaStatueZone = this.add.graphic(GraphicType.RECT, "primary",{position: this.rheaStatue.position, size: new Vec2(3*32,3*32)});
        this.rheaStatueZone.color = Color.TRANSPARENT;
        this.rheaStatueCooldown = new Timer(30000);

        // start spawning delay
        this.startSceneTimer.start();
    }
    
    protected initLayers() : void {
        // Add a layer for the UI
        this.addUILayer("UI");
        
        // Add the primary layer for players and enemies
        this.addLayer("primary", 10);
    }

    protected initPlayer() : void {
        // player spawning and handling
        this.player = this.add.animatedSprite("hades", "primary");
        this.player.scale.set(1, 1);
        if(!this.playerSpawn){
            console.warn("Player spawn was never set - setting spawn to (0, 0)");
            this.playerSpawn = Vec2.ZERO;
        }
        this.player.position = this.playerSpawn;
        this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(16, 16)));
        
        // last argument is arbitrary because Hades will not use the weapon system, health was 75
        this.playerStats = new CharacterStat(75, 5, 5, 3, 1);
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
            if (this.instant_kill) {
                const fireballs = (<HadesController> this.playerController).projectiles
    
                for (let f of fireballs){
                    (<FireballAI> f._ai).setDamage(1000);
                }
            }
        }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);

        // spawn enemies in
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
                    projectiles: this.createProjectiles(1 , "hex"),
                    cooldown: 1000,
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
    
            // update game timer label
            this.gameTime.text = `${this.parseTimeLeft(this.gameTimer.getTimeLeft())}`;
    
            // dynamically add new enemies
            if(this.gameTimer.getTimeLeft() <= this.gameTimer.getTotalTime()*.99 && !this.addedWitch){
                this.spawnableEnemies.push({
                    name: "Witch",
                    health: 25,
                    player: this.player,
                    speed: 100,
                    weapon: this.createWeapon("knife"),
                    range: 400,
                    experience: 250,
                });
                this.addedWitch = true;
            }
    
            if(this.gameTimer.getTimeLeft() <= 0){
                // end level and move to level 2
                if(this.changeLevelTimer === undefined){
                    this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "hades"});
                    this.changeLevelTimer = new Timer(3000);
                    this.changeLevelTimer.start();
                }
                if(this.changeLevelTimer.getTimeLeft() <= 0){
                    this.viewport.setSize(1600, 900); // switch to H2
                    this.sceneManager.changeToScene(level_h2, {characterStats: this.playerStats,
                        invincible: this.invincible, 
                        unlockAll: this.unlockAll,
                        instant_kill: this.instant_kill,
                        speedUp: this.speedUp,
                        unlockedLevels: this.unlockedLevels
                    }, this.sceneOptions);
                }
            }
        }
        
    }
}