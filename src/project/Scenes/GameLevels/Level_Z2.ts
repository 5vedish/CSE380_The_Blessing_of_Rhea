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
        this.load.spritesheet("feather", "project_assets/spritesheets/Feather.json");
        this.load.image("lightning", "project_assets/sprites/lightning.png");

        this.load.image("lightningImg", "project_assets/sprites/lightning.png");

        //Load Challenge img
        this.load.image("objective", "project_assets/sprites/z2_challenge.png");
        this.load.image("wave_one", "project_assets/sprites/p1_wave1.png");
        this.load.image("wave_two", "project_assets/sprites/p1_wave2.png");
        this.load.image("wave_three", "project_assets/sprites/p1_wave3.png");

        super.loadScene();
    }

    initScene(init: Record<string, any>): void {
        this.playerStats = init.characterStats;
        let weapon = <Weapon>init.weapon;
        weapon.cooldownTimer = new Timer(this.playerStats.weaponCoolDown);
        weapon.sprite.setScene(this);
        this.weapon = weapon;
    }
    
    startScene(): void {
        // Add in the tilemap and get the wall layer
        let tilemapLayers = this.add.tilemap("levelZ2", new Vec2(1, 1));
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

        this.enemyConstructorPairings = new Map([["snake" , EnemyAI], ["harpy", RangeAI], ["giant", EnemyAI]]);

        this.gameTimer = new Timer(5000);
        this.gameTime = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(this.viewport.getHalfSize().x, 20), text: `${this.parseTimeLeft(this.gameTimer.getTotalTime())}`});
    
        //Add health bar and exp bar
        // update health bar
        let percentage = this.playerStats.stats.health/this.playerStats.stats.maxHealth;
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
            health: 2,
            player: this.player,
            speed: 125,
            weapon: this.createWeapon("knife"),
            range: 10,
            experience: 200
        });

        this.spawnableEnemies.push({
            name: "harpy",
            health: 3,
            player: this.player,
            speed: 150,
            weapon: this.createWeapon("knife"),
            range: 150,
            experience: 250,
        });

        this.spawnableEnemies.push({
            name: "giant",
            health: 5,
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
                            projectiles: this.createProjectiles(3, "feather"),
                            cooldown: 2000,
                            scene: this,
                            ai: this.enemyConstructorPairings.get(enemyType.name)
                        }
                        this.enemyArray.push(this.addEnemy(enemyType.name, options));
                    }
    
                    this.currentWave += 1;
                    // this.maxEnemies = Math.floor(this.maxEnemies * 1.75);
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
                    this.viewport.setSize(1600, 900);
                    this.sceneManager.changeToScene(level_z3, {characterStats: this.playerStats, weapon: (<PlayerController>this.player._ai).weapon}, this.sceneOptions);
                }
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

        this.weapon.battleManager = this.battleManager;
        // TODO - ADD PLAYER AI HERE
        this.player.addAI(PlayerController,
            {
                speed: this.playerStats.stats.speed,
                health: this.playerStats.stats.health,
                inputEnabled: true,
                range: 30,
                playerStats: this.playerStats,
                weapon: this.weapon,
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

    protected initLayers() : void {
        // Add a layer for the UI
        this.addUILayer("UI");
        
        // Add the primary layer for players and enemies
        this.addLayer("primary", 10);
    }


}