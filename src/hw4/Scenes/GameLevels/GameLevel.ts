import AABB from "../../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Debug from "../../../Wolfie2D/Debug/Debug";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import Input from "../../../Wolfie2D/Input/Input";
import GameNode, { TweenableProperties } from "../../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Point from "../../../Wolfie2D/Nodes/Graphics/Point";
import Rect from "../../../Wolfie2D/Nodes/Graphics/Rect";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Label from "../../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../../Wolfie2D/Scene/Scene";
import Timer from "../../../Wolfie2D/Timing/Timer";
import Color from "../../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import EnemyAI from "../../AI/EnemyAI";
import { hw4_Statuses } from "../../hw4_constants";
import Move from "../../AI/EnemyActions/Move";
import PositionGraph from "../../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Navmesh from "../../../Wolfie2D/Pathfinding/Navmesh";
import { Project_Events
 } from "../../project_constants";
import WeaponType from "../../GameSystems/items/WeaponTypes/WeaponType";
import RegistryManager from "../../../Wolfie2D/Registry/RegistryManager";
import BattleManager from "../../GameSystems/BattleManager";
import Weapon from "../../GameSystems/items/Weapon";
import BattlerAI from "../../AI/BattlerAI";
import Graphic from "../../../Wolfie2D/Nodes/Graphic";
import CharacterStat from "../../PlayerStatus";

export default class GameLevel extends Scene{
    //Player info
    protected playerSpawn: Vec2;
    protected player: AnimatedSprite;

    //Each level has a timer
    protected levelTimer: Timer;
    protected invincibilityTimer: Timer;

    //Each level has a set number of enemies
    protected maxEnemies: number;
    protected enemyTypes: Array<AnimatedSprite>;
    protected enemies: Array<AnimatedSprite>;
    protected enemySpawns: Array<Vec2>;

    protected playerStats: CharacterStat

    protected healthBar: Graphic;

    // Tilemap walls
    protected walls: OrthogonalTilemap;

    protected battleManager: BattleManager;

    loadScene(): void {
        this.load.spritesheet("slice", "project_assets/spritesheets/slice.json");
        this.load.object("weaponData", "project_assets/data/weaponData.json");
        this.load.image("knife", "project_assets/sprites/knife.png");
        this.load.image("laserGun", "project_assets/sprites/laserGun.png");
        this.load.image("pistol", "project_assets/sprites/pistol.png");
        this.load.image("lightning", "project_assets/sprites/lightning.png");
        this.load.spritesheet("lightning", "project_assets/spritesheets/lightning.json");
        //Initialize the possible spawning areas for enemies
        //Each Vec2 holds the pixels that will be added to the center of the viewport so enemies spawn outside
        //View port is 800x450
        this.enemySpawns = new Array<Vec2>();
        this.enemyTypes = new Array<AnimatedSprite>();
        this.enemies = new Array<AnimatedSprite>();
        this.enemySpawns.push(new Vec2(-450, 0)); //Left of viewport
        this.enemySpawns.push(new Vec2(450, 0)); //Right of viewport
        this.enemySpawns.push(new Vec2(0, -275)); //Top of viewport
        this.enemySpawns.push(new Vec2(0, 275)); //Bottom of viewport      
    }

    startScene(): void {
        this.battleManager = new BattleManager();
    }

    updateScene(deltaT: number): void {
        //Handles events
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            switch (event.type) {
                
            }
        }

        // Prevents the player from going out of map
        this.lockPlayer();
        this.subscribeToEvents();
    }

    protected subscribeToEvents(): void {
        this.receiver.subscribe ([
        ]);
    }
    

    protected lockPlayer() : void {
        let x = this.player.position.x;
		let y = this.player.position.y;
		if (x <= 16)
			this.player.position.x = 16;
		else if (x >= (64 * 32) - 16) 
			this.player.position.x = (64 * 32) - 16;

		if (y <= 32)
			this.player.position.y = 32;
		else if (y >= (64 * 32) - 32) 
			this.player.position.y = (64 * 32) - 32;
    }

    protected boundaryCheck(viewportCenter: Vec2, postion: Vec2){
        return (viewportCenter.x + postion.x < 16 
        || viewportCenter.x + postion.x > 64*32-16
        || viewportCenter.y + postion.y < 32 
        || viewportCenter.y + postion.y > 64*32-32);
    }


    protected addEnemy(spriteKey: string): void{
        let enemy = this.add.animatedSprite(spriteKey, "primary");

        enemy.scale.set(2,2);
        enemy.addPhysics();
        enemy.animation.play("Left Move");
        //Randomly select one of the spawnpoints outside the viewport;
        let spawnPointIndex = Math.floor(Math.random() * 4);

        let viewportCenter = this.viewport.getCenter();
        // console.log("x: " + viewportCenter.x, " | y: " + viewportCenter.y);
        //check if spawn position is out of bounds
        while(true){
            if(this.boundaryCheck(viewportCenter, this.enemySpawns[spawnPointIndex])){
                spawnPointIndex = (spawnPointIndex + 1) % 5;
            } else {
                //Find a random x or y of that side
                if(this.enemySpawns[spawnPointIndex].x === 0){
                    //along top or bottom
                    let xOffset = Math.floor(Math.random() * 736) - 368
                    enemy.position.set(viewportCenter.x + xOffset, viewportCenter.y + this.enemySpawns[spawnPointIndex].y);
                } else {
                    let yOffset =Math.floor(Math.random() * 386) - 193
                    enemy.position.set(viewportCenter.x + this.enemySpawns[spawnPointIndex].x,viewportCenter.y + yOffset);
                }
                break;
            }
        }

        let weapon = this.createWeapon("knife");

        let options = {
            health: 1,
            player: this.player,
            speed: 5,
            weapon: weapon
        }

        enemy.addAI(EnemyAI, options);
        enemy.setGroup("enemy");
        this.enemies.push(enemy);
        this.battleManager.setEnemies([<BattlerAI>enemy._ai]);
    }

    /**
     * 
     * Creates and returns a new weapon
     * @param type The weaponType of the weapon, as a string
     */
     createWeapon(type: string): Weapon {

        console.log(this.battleManager + "BATTLE MANAGE FOR " + type);
        
        let weaponType = <WeaponType>RegistryManager.getRegistry("weaponTypes").get(type);

        let sprite = this.add.sprite(weaponType.spriteKey, "primary");

        return new Weapon(sprite, weaponType, this.battleManager);
    }

    /**
     * Initalizes all weapon types based of data from weaponData.json
     */
     initializeWeapons(): void{
        let weaponData = this.load.getObject("weaponData");

        for(let i = 0; i < weaponData.numWeapons; i++){
            let weapon = weaponData.weapons[i];

            // Get the constructor of the prototype
            let constr = RegistryManager.getRegistry("weaponTemplates").get(weapon.weaponType);

            // Create a weapon type
            let weaponType = new constr();

            // Initialize the weapon type
            weaponType.initialize(weapon);

            // Register the weapon type
            RegistryManager.getRegistry("weaponTypes").registerItem(weapon.name, weaponType)
        }
    }


    protected handleCollisions() : void {
        
    }
}