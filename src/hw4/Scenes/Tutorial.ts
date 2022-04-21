import PlayerController from "../AI/PlayerController";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../../Wolfie2D/Scene/Scene";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Navmesh from "../../Wolfie2D/Pathfinding/Navmesh";
import {hw4_Events, hw4_Names, hw4_Statuses} from "../hw4_constants";
import EnemyAI from "../AI/EnemyAI";
import WeaponType from "../GameSystems/items/WeaponTypes/WeaponType";
import RegistryManager from "../../Wolfie2D/Registry/RegistryManager";
import Weapon from "../GameSystems/items/Weapon";
import Healthpack from "../GameSystems/items/Healthpack";
import InventoryManager from "../GameSystems/InventoryManager";
import Item from "../GameSystems/items/Item";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import BattleManager from "../GameSystems/BattleManager";
import BattlerAI from "../AI/BattlerAI";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Color from "../../Wolfie2D/Utils/Color";
import Input from "../../Wolfie2D/Input/Input";
import AttackAction from "../AI/EnemyActions/AttackAction";
import Move from "../AI/EnemyActions/Move";
import Retreat from "../AI/EnemyActions/Retreat";
import GameNode, { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import Line from "../../Wolfie2D/Nodes/Graphics/Line";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import GoapAction from "../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import GoapActionPlanner from "../../Wolfie2D/AI/GoapActionPlanner";
import Map from "../../Wolfie2D/DataTypes/Map";
import Stack from "../../Wolfie2D/DataTypes/Stack";
import Berserk from "../AI/EnemyActions/Berserk";
import GameLevel from "./GameLevels/GameLevel";
import CharacterStat from "../PlayerStatus";
import DeathScreen from "DeathScreen";
import Graphic from "../../Wolfie2D/Nodes/Graphic";
import Level_Z1_Cutscene from "./GameLevels/Level_Z1_Cutscene";

export default class Tutorial extends GameLevel {
    protected tutorialTexts: Label[];
    protected tutorialZones: AABB[];

    loadScene(): void {
        //Load Zeus
        this.load.spritesheet("zeus", "project_assets/spritesheets/Zeus.json"); 

        //Load Snake
        this.load.spritesheet("snake", "project_assets/spritesheets/Snake.json")
        this.load.spritesheet("harpy", "project_assets/spritesheets/harpy.json")

        //Load tilemap
        this.load.tilemap("tutorial", "project_assets/tilemaps/tutorial.json");

        this.load.image("lightningImg", "project_assets/sprites/lightning.png")

        super.loadScene();
    }

    startScene(): void {
        // Add in the tilemap and get the wall layer
        let tilemapLayers = this.add.tilemap("tutorial", new Vec2(1, 1));
        this.walls = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];
        
        this.viewport.setBounds(0, 0, 64*32, 64*32);
        this.viewport.setSize(this.viewport.getHalfSize());

        this.playerSpawn = new Vec2(32*32, 50*32);
        // this.viewport.setFocus(new Vec2(this.playerSpawn.x, this.playerSpawn.y));
        
        this.maxEnemies = 15;
        
        super.startScene();
        this.initLayers();
        this.initializeWeapons();
        this.initPlayer();
        this.initTutorial();

        //Health Bar top left
        this.healthBar = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(196, 16), 
            size: new Vec2(256, 8)});
        //Health Bar follows below character

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
            health: 1,
            player: this.player,
            speed: 5,
            weapon: this.createWeapon("knife"),
            experience: 200});
            
        this.spawnableEnemies.push({
            name: "harpy",
            health: 3,
            player: this.player,
            speed: 10,
            weapon: this.createWeapon("knife"),
            experience: 250});
        
        let firstEnemy = this.add.animatedSprite("snake", "primary");
        firstEnemy.scale.set(1,1);
        firstEnemy.addPhysics(new AABB(Vec2.ZERO, new Vec2(8, 8)));
        firstEnemy.animation.play("moving");
        let options = {name: "snake",
            health: 1,
            player: this.player,
            speed: 5,
            weapon: this.createWeapon("knife"),
            experience: 200}
        firstEnemy.addAI(EnemyAI, options);
        firstEnemy.position.set(this.player.position.x, 44*32);
        firstEnemy.freeze();
        if(this.battleManager.enemies === undefined){
            this.battleManager.setEnemies([<BattlerAI>firstEnemy._ai])
        } else {
            this.battleManager.enemies.push(<BattlerAI>firstEnemy._ai);
        }

        let secondEnemy = this.add.animatedSprite("snake", "primary");
        secondEnemy.scale.set(1,1);
        secondEnemy.addPhysics(new AABB(Vec2.ZERO, new Vec2(8, 8)));
        secondEnemy.animation.play("moving");
        options = {name: "snake",
            health: 1,
            player: this.player,
            speed: 5,
            weapon: this.createWeapon("knife"),
            experience: 200}
        secondEnemy.addAI(EnemyAI, options);
        secondEnemy.position.set(33*32+16, 30*32+16);
        secondEnemy.freeze();
        if(this.battleManager.enemies === undefined){
            this.battleManager.setEnemies([<BattlerAI>secondEnemy._ai])
        } else {
            this.battleManager.enemies.push(<BattlerAI>secondEnemy._ai);
        }

        let thirdEnemy = this.add.animatedSprite("snake", "primary");
        thirdEnemy.scale.set(1,1);
        thirdEnemy.addPhysics(new AABB(Vec2.ZERO, new Vec2(8, 8)));
        thirdEnemy.animation.play("moving");
        options = {name: "snake",
            health: 1,
            player: this.player,
            speed: 5,
            weapon: this.createWeapon("knife"),
            experience: 200}
        thirdEnemy.addAI(EnemyAI, options);
        thirdEnemy.position.set(30*32+16, 30*32+16);
        thirdEnemy.freeze();
        if(this.battleManager.enemies === undefined){
            this.battleManager.setEnemies([<BattlerAI>thirdEnemy._ai])
        } else {
            this.battleManager.enemies.push(<BattlerAI>thirdEnemy._ai);
        }

        // this.enemyArray.push(enemy);
        // this.getLayer("movement").disable();
        
    }

    protected initTutorial(): void {
        this.tutorialTexts = new Array<Label>();
        this.tutorialZones = new Array<AABB>();

        //Movement tutorial
        let movementZone = this.add.graphic(GraphicType.RECT, "tutorial", {position: this.player.position.clone(), size: new Vec2(8*32, 4*32)});
        movementZone.color = Color.TRANSPARENT;
        this.tutorialZones.push(movementZone.boundary);

        let movementLabel = <Label>this.add.uiElement(UIElementType.LABEL, "tutorial", {position: new Vec2(32*32, 48*32), text:"Use W A S D to move"});
        this.tutorialTexts.push(movementLabel);
        
        //attack tutorial
        let attackZone = this.add.graphic(GraphicType.RECT, "tutorial", {position: this.player.position.clone().add(new Vec2(0, 5*32*-1)), size: new Vec2(8*32, 4*32)});
        attackZone.color = Color.TRANSPARENT;
        this.tutorialZones.push(attackZone.boundary);

        let attackLabel = <Label>this.add.uiElement(UIElementType.LABEL, "tutorial", {position: new Vec2(32*32, 42*32), text:"Left Click to attack"});
        this.tutorialTexts.push(attackLabel);

        //level up tutorial
        let levelupZone = this.add.graphic(GraphicType.RECT, "tutorial", {position: new Vec2(32*32, 37*32), size: new Vec2(2*32, 8*32)});
        levelupZone.color = Color.TRANSPARENT;
        this.tutorialZones.push(levelupZone.boundary);

        let levelupLabel = <Label>this.add.uiElement(UIElementType.LABEL, "tutorial", {position: new Vec2(32*32, 37*32), text: "Defeat enemies to lvl up and obtain stat upgrades"});
        this.tutorialTexts.push(levelupLabel);

        //end of tutorial
        let endTutorialZone = this.add.graphic(GraphicType.RECT, "tutorial",{position: new Vec2(32*32, 19*32), size: new Vec2(40*32,18*32)});
        endTutorialZone.color = Color.TRANSPARENT;
        this.tutorialZones.push(endTutorialZone.boundary);

        let endTutorialLabel = <Label>this.add.uiElement(UIElementType.LABEL, "tutorial", {position: new Vec2(32*32, 20*32), text: "Stand here! Good Luck on your adventure!"});
        this.tutorialTexts.push(endTutorialLabel);
    }
    
    protected initLayers() : void {
        // Add a layer for the UI
        this.addUILayer("UI");
        this.addLayer("tutorial", 12);
        
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
        console.log(this.player.position);
        //this.player.colliderOffset.set(0, 2);

        // create weapon
        let weapon = this.createWeapon("lightning");
        
        this.playerStats = new CharacterStat(50, 1, 10, 2);
        // TODO - ADD PLAYER AI HERE
        this.player.addAI(PlayerController,
            {
                speed: 2,
                health: 50,
                inputEnabled: true,
                range: 30,
                playerStats: this.playerStats,
                weapon: weapon
            });
        this.player.animation.play("idle");


        this.player.setGroup("player");
        // this.viewport.setCenter(this.playerSpawn);
        this.viewport.follow(this.player);

        this.battleManager.setPlayers([<BattlerAI>this.player._ai]);
        this.playerController = <PlayerController> this.player._ai;
        // this.player.freeze();
        // this.player.setAIActive(false, {});
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
        for (let i = 0; i < this.tutorialZones.length; i++) {
            if(this.tutorialZones[i].overlapArea(this.player.boundary)) {
                this.tutorialTexts[i].visible = true;
            } else {
                this.tutorialTexts[i].visible = false;
            }
        }

        if(this.player.position.y < 21*32){
            this.player.freeze();
            this.player.setAIActive(false, {});
            // Spawn enemies in
            if(this.currentNumEnemies < this.maxEnemies && !this.pauseFlag){
                let enemyType = this.spawnableEnemies[Math.floor(Math.random() * this.spawnableEnemies.length)];

                // randomly select one of the spawnpoints outside the viewport;
                let spawnPointIndex = Math.floor(Math.random() * 4);
                let viewportCenter = this.viewport.getCenter();
                let enemyPosition;
                //check if spawn position is out of bounds
                while(true){
                    if(this.boundaryCheck(viewportCenter, this.enemySpawns[spawnPointIndex])){
                        spawnPointIndex = (spawnPointIndex + 1) % 4;
                    } else {
                        // find a random x or y of that side
                        if(this.enemySpawns[spawnPointIndex].x === 0){
                            //along top or bottom
                            let xOffset = Math.floor(Math.random() * 736) - 368
                            enemyPosition = new Vec2(viewportCenter.x + xOffset, viewportCenter.y + this.enemySpawns[spawnPointIndex].y);
                        } else {
                            let yOffset =Math.floor(Math.random() * 386) - 193
                            enemyPosition = new Vec2(viewportCenter.x + this.enemySpawns[spawnPointIndex].x,viewportCenter.y + yOffset);
                        }
                        break;
                    }
                }
                let options = {
                    health: enemyType.health,
                    player: enemyType.player,
                    speed: enemyType.speed,
                    weapon: enemyType.weapon,
                    experience: enemyType.experience,
                    positon: enemyPosition
                }
                let enemy =this.addEnemy(enemyType.name, options);
                this.enemyArray.push(enemy);
            }
        }


        //Check if player died
        if(this.playerStats.stats.health <= 0){
            this.sceneManager.changeToScene(Level_Z1_Cutscene);
        }
    }
}