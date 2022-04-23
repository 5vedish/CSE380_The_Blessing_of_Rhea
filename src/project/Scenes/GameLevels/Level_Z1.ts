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

export default class level_z1 extends GameLevel {

    protected enemyConstructorPairings: Map<string,any> = new Map([["snake" , EnemyAI], ["harpy", RangeAI]]);

    loadScene(): void {
        //Load Zeus
        this.load.spritesheet("zeus", "project_assets/spritesheets/Zeus.json"); 

        //Load Snake
        this.load.spritesheet("snake", "project_assets/spritesheets/Snake.json")
        this.load.spritesheet("harpy", "project_assets/spritesheets/harpy.json")

        //Load tilemap
        this.load.tilemap("levelZ1", "project_assets/tilemaps/LevelZ1.json");

        this.load.image("lightningImg", "project_assets/sprites/lightning.png")

        super.loadScene();
    }

    startScene(): void {
        // Add in the tilemap and get the wall layer
        let tilemapLayers = this.add.tilemap("levelZ1", new Vec2(1, 1));
        this.walls = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];
        this.walls.setGroup("wall");
        
        this.viewport.setBounds(0, 0, 64*32, 64*32);
        this.viewport.setSize(this.viewport.getHalfSize());

        this.playerSpawn = new Vec2(32*32, 32*32);
        // this.viewport.setFocus(new Vec2(this.playerSpawn.x, this.playerSpawn.y));
        
        this.maxEnemies = 15;
        
        super.startScene();
        this.initLayers();
        this.initializeWeapons();
        this.initPlayer();
        // this.initializeProjectile();

        this.tilemap = this.player.getScene().getTilemap("Wall") as OrthogonalTilemap;

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
            health: 2,
            player: this.player,
            speed: 8,
            weapon: this.createWeapon("knife"),
            range: 10,
            experience: 200
        });
            
        this.spawnableEnemies.push({
            name: "harpy",
            health: 6,
            player: this.player,
            speed: 10,
            weapon: this.createWeapon("knife"),
            range: 150,
            experience: 250,
        });
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
        
        this.playerStats = new CharacterStat(100, 1, 10, 2);
        // TODO - ADD PLAYER AI HERE
        this.player.addAI(PlayerController,
            {
                speed: this.playerStats.stats.speed,
                health: this.playerStats.stats.health,
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
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);

        // Spawn enemies in
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
                positon: enemyPosition,
                projectiles: this.createProjectiles(5 , "leaf"),
                cooldown: 1000,
                ai: this.enemyConstructorPairings.get(enemyType.name)
            }
            this.enemyArray.push(this.addEnemy(enemyType.name, options));
        }
        
        //Check if player died
        if(this.playerStats.stats.health <= 0){
            this.viewport.setSize(1600, 900);
            this.sceneManager.changeToScene(DeathScreen);
        }
    }
}