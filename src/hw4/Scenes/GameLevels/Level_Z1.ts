import PlayerController from "../../AI/PlayerController";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../../../Wolfie2D/Scene/Scene";
import { GraphicType } from "../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import OrthogonalTilemap from "../../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import PositionGraph from "../../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Navmesh from "../../../Wolfie2D/Pathfinding/Navmesh";
import {hw4_Events, hw4_Names, hw4_Statuses} from "../../hw4_constants";
import EnemyAI from "../../AI/EnemyAI";
import WeaponType from "../../GameSystems/items/WeaponTypes/WeaponType";
import RegistryManager from "../../../Wolfie2D/Registry/RegistryManager";
import Weapon from "../../GameSystems/items/Weapon";
import Healthpack from "../../GameSystems/items/Healthpack";
import InventoryManager from "../../GameSystems/InventoryManager";
import Item from "../../GameSystems/items/Item";
import AABB from "../../../Wolfie2D/DataTypes/Shapes/AABB";
import BattleManager from "../../GameSystems/BattleManager";
import BattlerAI from "../../AI/BattlerAI";
import Label from "../../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Color from "../../../Wolfie2D/Utils/Color";
import Input from "../../../Wolfie2D/Input/Input";
import AttackAction from "../../AI/EnemyActions/AttackAction";
import Move from "../../AI/EnemyActions/Move";
import Retreat from "../../AI/EnemyActions/Retreat";
import { TweenableProperties } from "../../../Wolfie2D/Nodes/GameNode";
import Line from "../../../Wolfie2D/Nodes/Graphics/Line";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import GoapAction from "../../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import GoapActionPlanner from "../../../Wolfie2D/AI/GoapActionPlanner";
import Map from "../../../Wolfie2D/DataTypes/Map";
import Stack from "../../../Wolfie2D/DataTypes/Stack";
import Berserk from "../../AI/EnemyActions/Berserk";
import GameLevel from "./GameLevel";
import CharacterStat from "../../PlayerStatus";
import DeathScreen from "../DeathScreen";

export default class level_z1 extends GameLevel {

    loadScene(): void {
        //Load Zeus
        this.load.spritesheet("zeus", "project_assets/spritesheets/Zeus.json"); 

        //Load Snake
        this.load.spritesheet("snake", "project_assets/spritesheets/Snake.json")

        //Load tilemap
        this.load.tilemap("levelZ1", "project_assets/tilemaps/LevelZ1.json");

        super.loadScene();
    }

    startScene(): void {
        // Add in the tilemap and get the wall layer
        let tilemapLayers = this.add.tilemap("levelZ1", new Vec2(1, 1));
        this.walls = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];
        
        this.viewport.setBounds(0, 0, 64*32, 64*32);
        this.viewport.setSize(this.viewport.getHalfSize());

        this.playerSpawn = new Vec2(32*32, 32*32);
        // this.viewport.setFocus(new Vec2(this.playerSpawn.x, this.playerSpawn.y));
        
        this.maxEnemies = 2;
        
        super.startScene();
        this.initLayers();
        this.initializeWeapons();
        this.initPlayer();
        //Health Bar top left
        this.addUILayer("gui");
        this.healthBar = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(80, 5), 
            size: new Vec2(this.playerStats.stats.health * 2, 10)});

        this.levelUI = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(60, 42), 
                text: "Lvl: " + this.playerStats.level});
        this.levelUI.textColor = Color.BLACK;

        //Health Bar follows below character
        
        
    }
    
    protected initLayers() : void {
        // Add a layer for the UI
        this.addUILayer("UI");
        
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
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);

        // Spawn enemies in
        if(this.currentNumEnemies < this.maxEnemies){
            this.enemyArray.push(this.addEnemy("snake"));
        }
        
        //Check if player died
        if(this.playerStats.stats.health <= 0){
            this.sceneManager.changeToScene(DeathScreen);
        }
    }
}