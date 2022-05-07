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
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import EchidnaAI from "../../AI/EchidnaAI";
import Graphic from "../../../Wolfie2D/Nodes/Graphic";
import Receiver from "../../../Wolfie2D/Events/Receiver";
import { Project_Events } from "../../project_constants";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import MainMenu from "../MainMenu";
import level_p1 from "./Level_P1";
import { TweenableProperties } from "../../../Wolfie2D/Nodes/GameNode";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";

export default class level_z3 extends GameLevel {

    private weapon: Weapon;

    private echidna: AnimatedSprite;

    private fightStarted: boolean = false;

    private bossHealthBar: Graphic;

    private bossReceiver: Receiver;

    loadScene(): void {
        //Load Zeus
        this.load.spritesheet("zeus", "project_assets/spritesheets/Zeus.json"); 

        //Load Enemies
        this.load.spritesheet("snake", "project_assets/spritesheets/Snake.json");
        this.load.spritesheet("harpy", "project_assets/spritesheets/harpy.json");
        this.load.spritesheet("giant", "project_assets/spritesheets/Giant.json");
        this.load.spritesheet("echidna", "project_assets/spritesheets/echidna.json")

        //Load tilemap
        this.load.tilemap("levelZ3", "project_assets/tilemaps/LevelZ3.json");

        this.load.spritesheet("lightning", "project_assets/spritesheets/lightning.json");
        this.load.spritesheet("lightningv2", "project_assets/spritesheets/lightningv2.json");
        this.load.spritesheet("feather", "project_assets/spritesheets/Feather.json");
        this.load.spritesheet("tailwhip", "project_assets/spritesheets/tailwhip.json")
        this.load.image("lightning", "project_assets/sprites/lightning.png");
        this.load.image("end", "project_assets/sprites/z3_end.png");

        this.load.spritesheet("venom", "project_assets/spritesheets/venom.json")

        this.load.image("lightningImg", "project_assets/sprites/lightning.png");

        //Load Challenge img
        this.load.image("objective", "project_assets/sprites/z3_challenge.png");

        //Load sound effect and music
        this.load.audio("weapon", "project_assets/sounds/lightning.wav");
        this.load.audio("weaponv2", "project_assets/sounds/lightningv2.wav");

        this.load.audio("echidnaStart", "project_assets/music/echidnaStart.mp3");
        this.load.audio("echidna", "project_assets/music/echidna.mp3");

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
        this.unlockedLevels[2] = true;
        this.inventory = init.inventory;
    }

    startScene(): void {
        // Add in the tilemap and get the wall layer
        this.levelMusic = "echidna";
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "echidnaStart", loop: false, holdReference: true});
        let tilemapLayers = this.add.tilemap("levelZ3", new Vec2(1, 1));
        this.walls = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];
        this.walls.setGroup("wall");
        
        this.viewport.setBounds(0, 0, 64*32, 64*32);
        this.viewport.setSize(this.viewport.getHalfSize());
        
        this.playerSpawn = new Vec2(32*32, 49*32);

        this.bossReceiver = new Receiver();
        this.bossReceiver.subscribe(Project_Events.BOSSSPAWNENEMIES);

        this.maxEnemies = 15;
        
        super.startScene();
        this.initLayers();
        this.initializeWeapons();
        this.initPlayer();

        this.enemyConstructorPairings = new Map([["snake" , EnemyAI], ["harpy", RangeAI], ["giant", EnemyAI]]);
    
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
            health: 3,
            player: this.player,
            speed: 125,
            weapon: this.createWeapon("knife"),
            range: 10,
            experience: 200
        });

        this.spawnableEnemies.push({
            name: "harpy",
            health: 4,
            player: this.player,
            speed: 150,
            weapon: this.createWeapon("knife"),
            range: 150,
            experience: 250,
        });

        this.spawnableEnemies.push({
            name: "giant",
            health: 6,
            player: this.player,
            speed: 100,
            weapon: this.createWeapon("knife"),
            range: 20,
            experience: 320,
        });
        
        let echidnaTailWhip = this.createWeapon("tailwhip");
        // console.log(echidnaTailWhip);
        this.echidna = this.add.animatedSprite("echidna", "primary");
        this.echidna.position = new Vec2(32*32 , 24*32);
        this.echidna.scale.set(2,2);
        let options = {
            name: "echidna",
            health: 500,
            player: this.player,
            speed: 30,
            weapon: echidnaTailWhip,
            range: 50,
            venomRange: 200,
            experience: 1000,
            scene: this,
            projectiles: this.createProjectiles(3, "venom") 

        }
        this.echidna.addAI(EchidnaAI, options);
        this.echidna.addPhysics(new AABB(Vec2.ZERO, new Vec2(48,48)));
        this.echidna.animation.play("moving");
        this.echidna.freeze();
        this.echidna.setAIActive(false, {});
        this.echidna.setGroup("enemy");
        this.enemyArray.push(this.echidna);

        //Add boss health bar
        this.bossHealthBar = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(400, 425), size: new Vec2(600, 16)});
        let bossHealthBarBorder = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(400, 425), size: new Vec2(600, 16)});
        bossHealthBarBorder.alpha = 0.5;

        if(this.battleManager.enemies === undefined){
            this.battleManager.setEnemies([<BattlerAI>this.echidna._ai])
        } else {
            this.battleManager.enemies.push(<BattlerAI>this.echidna._ai);
        }

        //Position the rhea statue and zone
        this.rheaStatue = this.add.animatedSprite("rheaStatue", "primary");
        this.rheaStatue.position = new Vec2(32*32, 44*32);
        this.rheaStatue.animation.play("idle");

        this.rheaStatue.tweens.add("fadeOut", {
                startDelay: 0,
                duration: 3000,
                effects: [
                    {
                        property: TweenableProperties.alpha,
                        start: 1,
                        end: 0,
                        ease: EaseFunctionType.OUT_SINE
                    }
                ],
        })

        this.rheaStatueZone = this.add.graphic(GraphicType.RECT, "primary",{position: new Vec2(32*32, 44*32), size: new Vec2(6*32,6*32)});
        this.rheaStatueZone.color = Color.TRANSPARENT;

        this.startSceneTimer.start();

        
    }

    handleEvent(event: GameEvent){
        switch (event.type) {
            case Project_Events.BOSSSPAWNENEMIES:
                //Spawn two enemies next to the boss
                for(let i = 0; i < 2; i++){
                    let enemyType = this.spawnableEnemies[Math.floor(Math.random() * this.spawnableEnemies.length)]
                    let enemy = this.add.animatedSprite(enemyType.name, "primary");
                    enemy.scale.set(1.5,1.5);
                    enemy.addPhysics(new AABB(Vec2.ZERO, new Vec2(8,8))); //Monkey patched collision box, dynamic later
                    enemy.animation.play("moving");
                    enemy.position = new Vec2((this.echidna.position.clone().x + (i===0? -32 : 32)), this.echidna.position.y);
                    let options = {
                        health: enemyType.health,
                        player: enemyType.player,
                        speed: enemyType.speed,
                        weapon: enemyType.weapon,
                        range: enemyType.range,
                        experience: enemyType.experience,
                        projectiles: this.createProjectiles(3 , "feather"),
                        cooldown: 1000,
                        scene: this,
                    }
                    enemy.addAI(this.enemyConstructorPairings.get(enemyType.name), options);
                    enemy.setGroup("enemy");
                    this.currentNumEnemies += 1;

                    if(this.battleManager.enemies === undefined){
                        this.battleManager.setEnemies([<BattlerAI>enemy._ai])
                    } else {
                        this.battleManager.enemies.push(<BattlerAI>enemy._ai);
                    }
                }
                break;
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
            if (this.instant_kill) this.weapon.type.damage = 1000;
            this.playerStats = new CharacterStat(100, 100, 10, (this.speedUp) ? 15 : 2, this.weapon.cooldownTimer.getTotalTime());
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
                experience: 4500,
                projectiles: this.createProjectiles(3 , "feather"),
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

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);

        //Rhea statue
        if(!this.rheaStatueUsed){
            if (this.rheaStatueZone.boundary.overlapArea(this.player.boundary) && this.playerStats.stats.health < this.playerStats.stats.maxHealth) {
                this.rheaStatueUsed = true; 
                this.rheaStatue.tweens.play("fadeOut");                      
            } 
        }

        if(this.bossDefeated && this.currentNumEnemies === 0) {
    
            this.changeLevelTimer = new Timer(5000, ()=> {

                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "echidna"});
                this.viewport.setSize(1600, 900);
                this.sceneManager.changeToScene(level_p1, {
                invincible: this.invincible, 
                unlockAll: this.unlockAll,
                instant_kill: this.instant_kill,
                speedUp: this.speedUp, 
                unlockedLevels: this.unlockedLevels
            });

            });
            this.createChallengeLabel("end");
            this.changeLevelTimer.start();
            
            
        }

        while(this.bossReceiver.hasNextEvent()){
            this.handleEvent(this.bossReceiver.getNextEvent());
        }
        // Spawn enemies in
        if(this.startSceneTimer.isStopped()){
            if(!this.startedLevel){
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "echidnaStart"});
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "echidna", loop: true, holdReference: true});
                this.player.unfreeze();
                this.player.setAIActive(true, {});
                this.startedLevel = true;
            }
        }

        if(this.player.position.y < 34*32 && !this.fightStarted){
            this.fightStarted = true;
            this.echidna.unfreeze();
            this.echidna.setAIActive(true, {});
        }

        //Update boss health bar
        if(this.echidna._ai !== undefined){
            let bossPercentage = (<EchidnaAI>this.echidna._ai).health/(<EchidnaAI>this.echidna._ai).maxHealth;
            this.bossHealthBar.size = new Vec2(600*bossPercentage, 16);
        }
    }


}
