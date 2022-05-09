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
import { Cerberus_Positions, Project_Events } from "../../project_constants";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import MainMenu from "../MainMenu";
import level_p1 from "./Level_P1";
import { TweenableProperties } from "../../../Wolfie2D/Nodes/GameNode";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import CerberusAI from "../../AI/CerberusAI";
import HadesController from "../../AI/HadesController";
import FireballAI from "../../AI/FireballAI";
import CanvasNode from "../../../Wolfie2D/Nodes/CanvasNode";
import HoundAI from "../../AI/HoundAI";
import SplashScreen from "../SplashScreen";

export default class level_h3 extends GameLevel {

    // time triggers (perhaps for phases)
    
    // boss data
    private Cerberus: AnimatedSprite;
    private Cerberus2: AnimatedSprite;
    private Cerberus3: AnimatedSprite;
    private bossHealthBar: Graphic;
    private bossHealthBar2: Graphic;
    private bossHealthBar3: Graphic;

    private bossHealthBarNumber: Label;
    private bossHealthBarNumber2: Label;
    private bossHealthBarNumber3: Label;
    private bossReceiver: Receiver;
    private deadBosses: number = 0;

    // lava check
    private floorCheck: OrthogonalTilemap;

    // spawnable cages
    private cageSpawns: Array<Vec2> = [new Vec2(20*32, 24*32), new Vec2(44*32, 24*32), new Vec2(20*32, 40*32), new Vec2(44*32, 40*32)];


    loadScene(): void {
        // load player
        this.load.spritesheet("hades", "project_assets/spritesheets/Hades.json"); 

        // load Enemies
        this.load.spritesheet("Skull", "project_assets/spritesheets/Skull.json");
        this.load.spritesheet("Witch", "project_assets/spritesheets/Witch.json");
        this.load.spritesheet("Hellhound", "project_assets/spritesheets/Hellhound.json");
        this.load.spritesheet("Cerberus", "project_assets/spritesheets/Cerberus.json")

        // load tilemap
        this.load.tilemap("levelH3", "project_assets/tilemaps/LevelH3.json");

        // load projectiles
        this.load.spritesheet("fireball", "project_assets/spritesheets/fireball.json");
        this.load.spritesheet("Hex", "project_assets/spritesheets/Hex.json");

        // load images
        this.load.image("bident", "project_assets/sprites/bident.png");
        this.load.image("objective", "project_assets/sprites/h3_challenge.png");
        this.load.image("end", "project_assets/sprites/h3_end.png");

        // load sound effects (tbd)

        this.load.audio("hades", "project_assets/music/Tartarus.mp3");


        super.loadScene();
    }
    

    initScene(init: Record<string, any>): void {

        // retain stats if possible
        if (init.characterStats) {
            this.playerStats = init.characterStats;
            this.upgradedWeapon = init.upgradedWeapon;
        } 
        
        // retain scene variables
        this.invincible = init.invincible;
        this.unlockAll = init.unlockAll;
        this.instant_kill = init.instant_kill;
        this.speedUp = init.speedUp;
        this.unlockedLevels = init.unlockedLevels;
        this.unlockedLevels[2] = true;
        this.inventory = init.inventory;
    }

    startScene(): void {

        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "hades", loop: true});

        // add in the tilemap and walls
        let tilemapLayers = this.add.tilemap("levelH3", new Vec2(1, 1));
        this.walls = <OrthogonalTilemap>tilemapLayers[2].getItems()[0];
        this.walls.setGroup("wall");

        // get the floor layer
        this.floorCheck = <OrthogonalTilemap>tilemapLayers[0].getItems()[0];
        
        // viewport specs
        this.viewport.setBounds(0, 0, 64*32, 64*32);
        this.viewport.setSize(this.viewport.getHalfSize());
        
        // spawn player
        this.playerSpawn = new Vec2(32*32, 32*32);

        // specify enemy count
        this.maxEnemies = 4;
        
        // super methods from GameLevel
        super.startScene();
        this.initLayers();
        this.initializeWeapons();
        this.initPlayer();

        this.enemyConstructorPairings = new Map([["Skull" , EnemyAI], ["Witch", RangeAI], ["Hellhound", HoundAI]]);
    
    
        // healthbar adjustment and rebalancing
        let percentage = this.playerStats.stats.health/this.playerStats.stats.maxHealth;
        this.healthBar.size = new Vec2(percentage*256, 8);
        this.healthBar.position = new Vec2(196 + (percentage-1)*128,16);

        // expbar adjustment and rebalancing
        let reqExp = Math.pow(this.playerStats.level, 1.5);
        let expPercentage = this.playerStats.experience / (reqExp * 500);
        this.expBar.size = new Vec2(expPercentage*216, 4);
        this.expBar.position = new Vec2(108*expPercentage+(216/2), 32);

        // upper left GUI
        this.levelUI = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(86, 32), 
            text: "Lvl" + this.playerStats.level});
        this.levelUI.textColor = Color.BLACK;

        this.healthNumber = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(196, 17), text: `${this.playerStats.stats.health} / ${this.playerStats.stats.maxHealth}`})
        this.healthNumber.textColor = Color.WHITE;
        // weapon cooldown indicator
        this.weaponIcon = this.add.sprite("bident", "gui");
        this.weaponIcon.position = new Vec2(48, 24);
        this.weaponIconCoolDown = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(48, 24), size: new Vec2(32,32)});
        this.weaponIconCoolDown.color = Color.GRAY;
        this.weaponIconCoolDown.alpha = 0;
        
        // specify level enemy types
        this.spawnableEnemies.push({
            name: "Skull",
            health: 47,
            player: this.player,
            speed: 200,
            weapon: this.createWeapon("knife"),
            range: 16,
            experience: 25
        });

        this.spawnableEnemies.push({
            name: "Witch",
            health: 200,
            player: this.player,
            speed: 100,
            weapon: this.createWeapon("knife"),
            range: 500,
            experience: 250,
        });

        this.spawnableEnemies.push({
            name: "Hellhound",
            health: 500,
            player: this.player,
            speed: 125,
            weapon: this.createWeapon("knife"),
            range: 16,
            experience: 1000
        });

        // boss initialization
        this.bossReceiver = new Receiver();
        this.bossReceiver.subscribe([Project_Events.BOSSSPAWNENEMIES, Project_Events.CERBERUSDIED, Project_Events.CERBERUSDAMAGED]);

        // CERBERUS
        
        this.Cerberus = this.add.animatedSprite("Cerberus", "primary");
        this.Cerberus.position = new Vec2(24*32 , 24*32);

        let options = {
            name: "Cerberus",
            health: 3000,
            player: this.player,
            speed: 50,
            weapon: this.createWeapon("knife"),
            range: 1000,
            experience: 1,
            scene: this,
            projectiles: this.createProjectiles(10, "CerberusFireball"),
            startingPosition: Cerberus_Positions.CAGEONE,
            headNum: 1
        }

        this.Cerberus.addAI(CerberusAI, options);
        this.Cerberus.addPhysics(new AABB(Vec2.ZERO, new Vec2(8,8)));
        this.Cerberus.animation.play("moving");
        this.Cerberus.freeze();
        this.Cerberus.setAIActive(false, {});
        this.Cerberus.setGroup("enemy");
        this.enemyArray.push(this.Cerberus);

        // include boss in battle manager
        if(this.battleManager.enemies === undefined){
            this.battleManager.setEnemies([<BattlerAI>this.Cerberus._ai])
        } else {
            this.battleManager.enemies.push(<BattlerAI>this.Cerberus._ai);
        }

        // CERBERUS2

        this.Cerberus2 = this.add.animatedSprite("Cerberus", "primary");
        this.Cerberus2.position = new Vec2(40*32 , 24*32);

        let options2 = {
            name: "Cerberus",
            health: 3000,
            player: this.player,
            speed: 50,
            weapon: this.createWeapon("knife"),
            range: 1000,
            experience: 1,
            scene: this,
            projectiles: this.createProjectiles(10, "CerberusFireball"),
            startingPosition: Cerberus_Positions.CAGETWO,
            headNum: 2
        }

        this.Cerberus2.addAI(CerberusAI, options2);
        this.Cerberus2.addPhysics(new AABB(Vec2.ZERO, new Vec2(8,8)));
        this.Cerberus2.animation.play("moving");
        this.Cerberus2.freeze();
        this.Cerberus2.setAIActive(false, {});
        this.Cerberus2.setGroup("enemy");
        this.enemyArray.push(this.Cerberus2);

        // include boss in battle manager
        if(this.battleManager.enemies === undefined){
            this.battleManager.setEnemies([<BattlerAI>this.Cerberus2._ai])
        } else {
            this.battleManager.enemies.push(<BattlerAI>this.Cerberus2._ai);
        }

        // CERBERUS 3 

        this.Cerberus3 = this.add.animatedSprite("Cerberus", "primary");
        this.Cerberus3.position = new Vec2(40*32 , 40*32);

        let options3 = {
            name: "Cerberus",
            health: 3000,
            player: this.player,
            speed: 50,
            weapon: this.createWeapon("knife"),
            range: 1000,
            experience: 1,
            scene: this,
            projectiles: this.createProjectiles(10, "CerberusFireball"),
            startingPosition: Cerberus_Positions.CAGETHREE,
            headNum: 3
        }

        this.Cerberus3.addAI(CerberusAI, options3);
        this.Cerberus3.addPhysics(new AABB(Vec2.ZERO, new Vec2(8,8)));
        this.Cerberus3.animation.play("moving");
        this.Cerberus3.freeze();
        this.Cerberus3.setAIActive(false, {});
        this.Cerberus3.setGroup("enemy");
        this.enemyArray.push(this.Cerberus3);

        this.currentNumEnemies += 3;

        // include boss in battle manager
        if(this.battleManager.enemies === undefined){
            this.battleManager.setEnemies([<BattlerAI>this.Cerberus3._ai])
        } else {
            this.battleManager.enemies.push(<BattlerAI>this.Cerberus3._ai);
        }

        // boss GUIs
        this.bossHealthBar = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(400, 425), size: new Vec2(160, 16)});
        let bossHealthBarBorder = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(400, 425), size: new Vec2(160, 16)});
        bossHealthBarBorder.alpha = 0.5;

        this.bossHealthBarNumber = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(400, 425), text: `${(<CerberusAI>this.Cerberus._ai).health} / ${(<CerberusAI>this.Cerberus._ai).maxHealth}`});
        this.bossHealthBarNumber.textColor = Color.WHITE;

        this.bossHealthBar2 = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(150, 425), size: new Vec2(160, 16)});
        let bossHealthBarBorder2 = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(150, 425), size: new Vec2(160, 16)});
        bossHealthBarBorder2.alpha = 0.5;

        this.bossHealthBarNumber2 = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(150, 425), text: `${(<CerberusAI>this.Cerberus2._ai).health} / ${(<CerberusAI>this.Cerberus2._ai).maxHealth}`});
        this.bossHealthBarNumber2.textColor = Color.WHITE;

        this.bossHealthBar3 = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(650, 425), size: new Vec2(160, 16)});
        let bossHealthBarBorder3 = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(650, 425), size: new Vec2(160, 16)});
        bossHealthBarBorder3.alpha = 0.5;

        this.bossHealthBarNumber3 = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(650, 425), text: `${(<CerberusAI>this.Cerberus3._ai).health} / ${(<CerberusAI>this.Cerberus3._ai).maxHealth}`});
        this.bossHealthBarNumber3.textColor = Color.WHITE;


        // position the Rhea statue and zone
        this.rheaStatue = this.add.animatedSprite("rheaStatue", "primary");
        this.rheaStatue.position = new Vec2(31*32, 31*32);
        this.rheaStatue.animation.play("idle");

        this.rheaStatueZone = this.add.graphic(GraphicType.RECT, "primary",{position: new Vec2(31*32, 31*32), size: new Vec2(12*32,12*32)});
        this.rheaStatueZone.color = Color.TRANSPARENT;

        this.populateHUD();

        this.startSceneTimer.start();
    }

    handleEvent(event: GameEvent){

        switch (event.type) {

            case Project_Events.BOSSSPAWNENEMIES:
                // spawn enemies
                for(let i = 0; i < this.maxEnemies; i++){

                    let enemyType = this.spawnableEnemies[Math.floor(Math.random() * this.spawnableEnemies.length)];
                    let enemy = this.add.animatedSprite(enemyType.name, "primary");
                    console.log(`H3 spawn enemies: ${enemy.id} of enemy type: ${enemyType.name}`)
                    enemy.animation.play("moving");
                    // specify enemy position (one of four cage zones)
                    enemy.position = this.cageSpawns[Math.floor(Math.random()*this.cageSpawns.length)].clone();

                    let options = {
                        health: enemyType.health*(Math.pow(1.05, this.playerStats.level)),
                        player: enemyType.player,
                        speed: enemyType.speed*.75, // slow them down a bit
                        weapon: enemyType.weapon,
                        range: enemyType.range,
                        experience: enemyType.experience,
                        projectiles: this.createProjectiles(1 , (enemyType.name === "Witch") ? "Hex" : null),
                        cooldown: 1000,
                        scene: this,
                    }

                    enemy.addPhysics(new AABB(Vec2.ZERO, new Vec2(8,8)));
                    enemy.addAI(this.enemyConstructorPairings.get(enemyType.name), options);
                    enemy.setGroup("enemy");

                    if(this.battleManager.enemies === undefined){
                        this.battleManager.setEnemies([<BattlerAI>enemy._ai])
                    } else {
                        this.battleManager.enemies.push(<BattlerAI>enemy._ai);
                    }

                    this.currentNumEnemies += 1;
                    this.enemyArray.push(enemy);

                     // tailored to update enemy array
                     const fireballs = (<HadesController> this.playerController).projectiles

                     for (let f of fireballs){
                         (<FireballAI> f._ai).setEnemies(this.enemyArray);
                     }

                }
                break; // end of event

                case Project_Events.CERBERUSDAMAGED:

                const headNum = event.data.get("headNum");
                const dead = event.data.get("dead");

                // update bosses healthbar
                if (headNum === 1){

                    // if (dead){

                    //     // this.bossHealthBar.visible = false;
                    //     // this.bossHealthBarNumber.setText("");

                    // } else {

                        const bossPercentage = (<CerberusAI>this.Cerberus._ai).health/(<CerberusAI>this.Cerberus._ai).maxHealth;
                        this.bossHealthBar.size = new Vec2(160*bossPercentage, 16);
                        this.bossHealthBar.position = new Vec2(400 + (bossPercentage-1)*80,425);
                        this.bossHealthBarNumber.text = `${(<CerberusAI>this.Cerberus._ai).health.toFixed(2)} / ${(<CerberusAI>this.Cerberus._ai).maxHealth}`
                        console.log("I'M NOT DEAD");

                    // }

                } 

                if (headNum === 2){

                    // if (dead){

                    //     // this.bossHealthBar2.visible = false;
                    //     // this.bossHealthBarNumber2.setText("");

                    // } else {

                        const bossPercentage2 = (<CerberusAI>this.Cerberus2._ai).health/(<CerberusAI>this.Cerberus2._ai).maxHealth;
                        this.bossHealthBar2.size = new Vec2(160*bossPercentage2, 16);
                        this.bossHealthBar2.position = new Vec2(150 + (bossPercentage2-1)*80,425);
                        this.bossHealthBarNumber2.text = `${(<CerberusAI>this.Cerberus2._ai).health.toFixed(2)} / ${(<CerberusAI>this.Cerberus2._ai).maxHealth}`
                        console.log("I'M NOT DEAD");

                    // }

                } 

                if (headNum === 3){

                    // if (dead){

                    //     // this.bossHealthBar3.visible = false;
                    //     // this.bossHealthBarNumber3.setText("");

                    // } else {

                        const bossPercentage3 = (<CerberusAI>this.Cerberus3._ai).health/(<CerberusAI>this.Cerberus3._ai).maxHealth;
                        this.bossHealthBar3.size = new Vec2(160*bossPercentage3, 16);
                        this.bossHealthBar3.position = new Vec2(650 + (bossPercentage3-1)*80,425);
                        this.bossHealthBarNumber3.text = `${(<CerberusAI>this.Cerberus3._ai).health.toFixed(2)} / ${(<CerberusAI>this.Cerberus3._ai).maxHealth}`
                    // }

                } 

                break;
                
                case Project_Events.CERBERUSDIED:

                    const cerberus = <CanvasNode>event.data.get("enemy");

                    this.battleManager.enemies = this.battleManager.enemies.filter(enemy => enemy !== <BattlerAI>(cerberus._ai));
                    this.enemyArray = this.enemyArray.filter(enemy => enemy !== cerberus);
                    cerberus.destroy();
                    this.currentNumEnemies -= 1;
                    this.deadBosses += 1;

                break;
            }
        }

    protected initPlayer() : void {

        this.player = this.add.animatedSprite("hades", "primary");
        this.player.scale.set(1, 1);

        // spawning player
        if(!this.playerSpawn){
            console.warn("Player spawn was never set - setting spawn to (0, 0)");
            this.playerSpawn = Vec2.ZERO;
        }

        this.player.position = this.playerSpawn;
        this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(16, 16)));

        let enemy;
        if (this.playerStats === undefined) {
       
            this.playerStats = new CharacterStat(75, 50, 5, (this.speedUp) ? 15 : 3, HadesController.HADESCD, .05);

            // exp supply drop
            enemy = this.add.animatedSprite("Skull", "primary");
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
                experience: 25000,
                projectiles: this.createProjectiles(0, ""),
                cooldown: 0,
                scene: this,
                floor: this.floorCheck
            }
            enemy.addAI(EnemyAI, options);
            enemy.setGroup("enemy");
            enemy.freeze();
            this.enemyArray.push(enemy);
            this.currentNumEnemies += 1;

            if(this.battleManager.enemies === undefined){
                this.battleManager.setEnemies([<BattlerAI>enemy._ai])
            } else {
                this.battleManager.enemies.push(<BattlerAI>enemy._ai);
            }
        }

        // add player AI
        this.player.addAI(HadesController,
            {
                speed: this.playerStats.stats.speed,
                health: this.playerStats.stats.health,
                inputEnabled: true,
                range: 1,
                playerStats: this.playerStats,
                weapon: null,
                weaponV2: null,
                projectiles: this.createProjectiles(2, "fireball"),
                floor: this.floorCheck,
                invincible: this.invincible
            });


        // add in projectile attack and cooldown

        const fireballs = (<HadesController> this.player._ai).projectiles
   
        for (let f of fireballs){
            (<FireballAI> f._ai).setDamage(this.playerStats.stats.attack);
        }

        (<HadesController> this.player._ai).attackCooldown = new Timer(this.playerStats.weaponCoolDown);

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
                (<FireballAI> f._ai).setDamage(100000);
            }
        }

        if (enemy !== undefined) {
             // tailored to update enemy array
             const fireballs = (<HadesController> this.playerController).projectiles

             for (let f of fireballs){
                 (<FireballAI> f._ai).setEnemies(this.enemyArray);
             }
         }

    }

    protected initLayers() : void {
        // add a layer for the UI
        this.addUILayer("UI");
        
        // add the primary layer for players and enemies
        this.addLayer("primary", 10);
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);

        if(this.startSceneTimer.isStopped()){
            if(!this.startedLevel){
                this.player.unfreeze();
                this.player.setAIActive(true, {});
                this.Cerberus.unfreeze();
                this.Cerberus.setAIActive(true, {});
                this.Cerberus2.unfreeze();
                this.Cerberus2.setAIActive(true, {});
                this.Cerberus3.unfreeze();
                this.Cerberus3.setAIActive(true, {});

                this.startedLevel = true;
            }
        }

        // boss is defeated and no enemies remaining -> end level timer
        if(this.deadBosses === 3 && this.currentNumEnemies === 0) {
  
            this.cleanUp();
            this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "hades"});
            this.changeLevelTimer = new Timer(5000, () => {

                this.viewport.setSize(1600, 900);
                // maintain scene variables
                this.sceneManager.changeToScene(SplashScreen, {
                    invincible: this.invincible, 
                    unlockAll: this.unlockAll,
                    instant_kill: this.instant_kill,
                    speedUp: this.speedUp, 
                    unlockedLevels: this.unlockedLevels
                });

            });
            this.createChallengeLabel("end");
            this.changeLevelTimer.start();
            
            
            // once end level timer has elapsed -> end level

        }

        while(this.bossReceiver.hasNextEvent()){
            this.handleEvent(this.bossReceiver.getNextEvent());
        }

    }

}
