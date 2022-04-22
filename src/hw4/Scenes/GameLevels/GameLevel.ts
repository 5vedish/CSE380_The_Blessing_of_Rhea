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
import { Project_Events } from "../../project_constants";
import WeaponType from "../../GameSystems/items/WeaponTypes/WeaponType";
import RegistryManager from "../../../Wolfie2D/Registry/RegistryManager";
import BattleManager from "../../GameSystems/BattleManager";
import Weapon from "../../GameSystems/items/Weapon";
import BattlerAI from "../../AI/BattlerAI";
import Graphic from "../../../Wolfie2D/Nodes/Graphic";
import CharacterStat from "../../PlayerStatus";
import CanvasNode from "../../../Wolfie2D/Nodes/CanvasNode";
import Hourglass from "../../GameSystems/items/Hourglass";
import HermesSandals from "../../GameSystems/items/HermesSandals";
import Sprite from "../../../Wolfie2D/Nodes/Sprites/Sprite";
import PlayerController from "../../AI/PlayerController";
import Receiver from "../../../Wolfie2D/Events/Receiver";
import Lightning from "../../GameSystems/items/WeaponTypes/Primary/Lightning";
import Layer from "../../../Wolfie2D/Scene/Layer";
import UIElement from "../../../Wolfie2D/Nodes/UIElement";
import Bolt from "../../GameSystems/items/Bolt";

export interface CustomEnemy {
    name: string,
    health: number,
    player: GameNode,
    speed: number,
    weapon: Weapon,
    range: number,
    experience: number
}

export default class GameLevel extends Scene{

    //Each level has a timer
    protected levelTimer: Timer;
    protected invincibilityTimer: Timer;
    protected pauseFlag: boolean = false;

    //Player info
    protected playerSpawn: Vec2;
    protected player: AnimatedSprite;
    protected playerController: PlayerController;
    protected playerStats: CharacterStat

    //Each level has a set number of enemies
    protected enemySpawns: Array<Vec2>;
    protected maxEnemies: number;
    protected currentNumEnemies: number = 0;
    protected enemyArray: Array<AnimatedSprite>;
    protected spawnableEnemies: CustomEnemy[] = []; //List of possible enemies that can be spawned

    // guis
    protected healthBar: Graphic;
    protected levelUI: Label;
    protected expBar: Graphic;

    // leveling
    private levelUpLayer: Layer;
    protected levelChanged: number = 0;
    protected levelReceiver: Receiver;
    protected button1: UIElement;
    protected button2: UIElement;
    protected button3: UIElement;
    protected item1: Sprite;
    protected item2: Sprite;
    protected item3: Sprite;

    // items
    protected itemsArray = ["hourglass", "hermes_sandals", "bolt"];
    protected selectionArray: Array<string> = [];
    protected itemConstructorPairings: Map<string,any> = new Map([["hourglass" , Hourglass], ["hermes_sandals", HermesSandals], ["bolt", Bolt]]);

    //Sprite to hold weapon icon
    protected battleManager: BattleManager;
    protected weaponIcon: Sprite;
    protected weaponIconCoolDown: Graphic;

    // Tilemap walls
    protected walls: OrthogonalTilemap;
    protected tilemap : OrthogonalTilemap;

    loadScene(): void {
        this.load.spritesheet("slice", "project_assets/spritesheets/slice.json");
        this.load.object("weaponData", "project_assets/data/weaponData.json");
        this.load.image("knife", "project_assets/sprites/knife.png");
        this.load.image("laserGun", "project_assets/sprites/laserGun.png");
        this.load.image("pistol", "project_assets/sprites/pistol.png");
        this.load.image("lightning", "project_assets/sprites/lightning.png");
        this.load.spritesheet("lightning", "project_assets/spritesheets/lightning.json");
        this.load.image("pause_screen", "project_assets/screens/pause.png");
        this.load.image("hourglass", "project_assets/sprites/hourglass.png")
        this.load.image("hermes_sandals", "project_assets/sprites/hermes_sandals.png");
        this.load.image("bolt", "project_assets/sprites/Bolt.png")
        //Initialize the possible spawning areas for enemies
        //Each Vec2 holds the pixels that will be added to the center of the viewport so enemies spawn outside
        //View port is 800x450
        this.enemySpawns = new Array<Vec2>();
        this.enemyArray = new Array<AnimatedSprite>();
        this.enemySpawns.push(new Vec2(-450, 0)); //Left of viewport
        this.enemySpawns.push(new Vec2(450, 0)); //Right of viewport
        this.enemySpawns.push(new Vec2(0, -275)); //Top of viewport
        this.enemySpawns.push(new Vec2(0, 275)); //Bottom of viewport      
    }

    startScene(): void {
        this.battleManager = new BattleManager();
        this.levelReceiver = new Receiver();
        this.levelReceiver.subscribe(["one", "two", "three"]);
        this.subscribeToEvents();
        this.addUILayer("gui");

        this.addUILayer("pause").disable();
        let pauseScreen = this.add.sprite("pause_screen", "pause");
        pauseScreen.position.copy(this.viewport.getOrigin());
        pauseScreen.alpha = .5;
        

        //Health Bar
        let healthBarBorder = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(196, 16), 
            size: new Vec2(256, 8)});
        healthBarBorder.alpha = .5;


        //Experience bar
        this.expBar = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(216, 32), 
            size: new Vec2(0, 0)});
        this.expBar.color = Color.BLUE;

        let expBarBorder = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(216, 32), 
            size: new Vec2(216, 4)});
        expBarBorder.color = Color.LIGHTBLUE;
        expBarBorder.alpha = .5;



        //Level up UI
        this.levelUpLayer = this.addUILayer("levelUp");
        let dim = this.add.graphic(GraphicType.RECT, "levelUp", { position: this.viewport.getOrigin(), size: new Vec2(this.viewport.getHalfSize().x*2, 
            this.viewport.getHalfSize().y*2) });
        dim.color = Color.BLACK;
        dim.alpha = .5;
        this.levelUpLayer.disable();
        

        this.button1 = this.add.uiElement(UIElementType.BUTTON, "levelUp", {
            position: new Vec2((this.viewport.getOrigin().x - this.viewport.getHalfSize().x/2), this.viewport.getOrigin().y), text: ""
          });
          this.button1.size.set(144, 144);
          this.button1.borderWidth = 10;
          this.button1.borderRadius = 10;
          this.button1.borderColor = Color.WHITE;
          this.button1.backgroundColor = Color.GRAYISH;
          this.button1.onClickEventId = "one";

          this.button2 = this.add.uiElement(UIElementType.BUTTON, "levelUp", {
            position: new Vec2((this.viewport.getOrigin().x), this.viewport.getOrigin().y), text: ""
          });
          this.button2.size.set(144, 144);
          this.button2.borderWidth = 10;
          this.button2.borderRadius = 10;
          this.button2.borderColor = Color.WHITE;
          this.button2.backgroundColor = Color.GRAYISH;
          this.button2.onClickEventId = "two";

          this.button3 = this.add.uiElement(UIElementType.BUTTON, "levelUp", {
            position: new Vec2((this.viewport.getOrigin().x + this.viewport.getHalfSize().x/2), this.viewport.getOrigin().y), text: ""
          });
          this.button3.size.set(144, 144);
          this.button3.borderWidth = 10;
          this.button3.borderRadius = 10;
          this.button3.borderColor = Color.WHITE;
          this.button3.backgroundColor = Color.GRAYISH;
          this.button3.onClickEventId = "three";

    }

    updateScene(deltaT: number): void {
        // pause via escape
        if (Input.isKeyJustPressed("escape")){
            this.pauseFlag = !this.pauseFlag;

            if (this.pauseFlag){
                this.pauseEntities();
                this.getLayer("pause").enable();
            } else {
                this.unpauseEntities();
                this.getLayer("pause").disable();
            }

        }

        // handle leveling up
        if (this.levelChanged) {
            // level up events
            while(this.levelReceiver.hasNextEvent()){

                let event = this.levelReceiver.getNextEvent();
                
                switch (event.type) {
                        
                    case "one":

                        let item = new (this.itemConstructorPairings.get(this.selectionArray[0]))(new Sprite(this.selectionArray[0]));
                        item.use(this.player, this.playerController.weapon, this.playerStats, this.playerController);
                        break;

                    case "two":

                        let item2 = new (this.itemConstructorPairings.get(this.selectionArray[1]))(new Sprite(this.selectionArray[1]));
                        item2.use(this.player, this.playerController.weapon, this.playerStats, this.playerController);
                        break;

                    case "three":

                        let item3 = new (this.itemConstructorPairings.get(this.selectionArray[2]))(new Sprite(this.selectionArray[2]));
                        item3.use(this.player, this.playerController.weapon, this.playerStats, this.playerController);
                        break;

                }

                this.getLayer("levelUp").removeNode(this.item1);
                this.getLayer("levelUp").removeNode(this.item2);
                this.getLayer("levelUp").removeNode(this.item3);

                this.levelChanged--;
                // accounting for multiple levels
                if (this.selectionArray.length < 3){
                    this.rollItems();
                }  
            }

            if (this.levelChanged === 0){
                this.pauseFlag = !this.pauseFlag;
                this.getLayer("levelUp").disable();
                this.unpauseEntities();        
            }
            
        }

        // main events
        while (this.receiver.hasNextEvent() && !this.pauseFlag) {
            let event = this.receiver.getNextEvent();

            switch (event.type) {

                case Project_Events.ENEMYDIED:
                    // remove enemy from both arrays
                    const enemy = <CanvasNode>event.data.get("enemy");
                    const enemyExperience = (<EnemyAI>enemy._ai).experience;
                    this.battleManager.enemies = this.battleManager.enemies.filter(enemy => enemy !== <BattlerAI>(event.data.get("enemy")._ai));
                    this.enemyArray = this.enemyArray.filter(enemy => enemy !== (event.data.get("enemy")));
                    enemy.destroy();
                    this.currentNumEnemies -= 1;
                    this.playerStats.gainedExperience(enemyExperience); // to-do : scaling

                    //Update the exp bar
                    let reqExp = Math.pow(this.playerStats.level, 1.5);
                    let expPercentage = this.playerStats.experience / (reqExp * 500);
                    this.expBar.size = new Vec2(expPercentage*216, 4);
                    this.expBar.position = new Vec2(108*expPercentage+(216/2), 32);
                    break;

                case Project_Events.DAMAGED:

                    // update health bar
                    const percentage = this.playerStats.stats.health/this.playerStats.stats.maxHealth;
                    // scale by percentage
                    this.healthBar.size = new Vec2(percentage*256, 8);
                    // rebalance position
                    this.healthBar.position = new Vec2(196 + (percentage-1)*128,16);
                    break;

                    case Project_Events.LEVELUP:

                        this.pauseFlag = !this.pauseFlag;
                        this.pauseEntities();
                        //show layer
                        this.getLayer("levelUp").enable();
                        this.levelChanged = event.data.get("levelChange");
                        this.levelUI.text = "Lvl" + this.playerStats.level;
                        
                        this.rollItems();
                        break;

                           
            }
        }    
        
        //Update the weapon cooldown icon
        let weaponTimeLeft = this.playerController.weapon.cooldownTimer.getTimeLeft();
        let weaponTotalTime = this.playerController.weapon.cooldownTimer.getTotalTime();
        let timePercentage = weaponTimeLeft/weaponTotalTime;
        if(timePercentage > 0){
            this.weaponIconCoolDown.alpha = 0.5;
        } else {
            this.weaponIconCoolDown.alpha = 0;
        }
        // this.weaponIconCoolDown.alpha = timePercentage;
        this.weaponIconCoolDown.size = new Vec2(32, (1-timePercentage)*32);
        this.weaponIconCoolDown.position = new Vec2(48, 24+(timePercentage*16));
        // console.log(timePercentage);

        // prevents the player from going out of bounds
        this.lockPlayer();   
    }

    protected pauseEntities(){
        this.enemyArray.map((enemy) => {
            enemy.freeze()
            enemy.setAIActive(false, {});
            enemy.animation.stop();
        });
        this.player.freeze();
        this.player.setAIActive(false, {});
        this.player.animation.stop();
    }

    protected unpauseEntities(){
        this.enemyArray.map((enemy) => {
            enemy.unfreeze();
            enemy.setAIActive(true, {});
            enemy.animation.play("moving", true);
        });
        this.player.unfreeze();
        this.player.setAIActive(true, {});
        this.player.animation.play("idle", true); 
    }

    // main events
    protected subscribeToEvents(): void {
        this.receiver.subscribe ([Project_Events.ENEMYDIED, Project_Events.DAMAGED, Project_Events.LEVELUP
        ]);
    }

    // keeps players in bounds
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

    // check map bounds for spawning enemies
    protected boundaryCheck(viewportCenter: Vec2, postion: Vec2){
        return (viewportCenter.x + postion.x < 16 
        || viewportCenter.x + postion.x > 64*32-16
        || viewportCenter.y + postion.y < 32 
        || viewportCenter.y + postion.y > 64*32-32);
    }

    protected addEnemy(spriteKey: string, options: Record<string, any>): AnimatedSprite{
        let enemy = this.add.animatedSprite(spriteKey, "primary");

        enemy.scale.set(1,1);
        enemy.addPhysics(new AABB(Vec2.ZERO, new Vec2(8, 8)));
        enemy.animation.play("moving");
        enemy.position = options.positon;
        enemy.addAI(EnemyAI, options);
        enemy.setGroup("enemy");
        this.currentNumEnemies += 1;

        if(this.battleManager.enemies === undefined){
            this.battleManager.setEnemies([<BattlerAI>enemy._ai])
        } else {
            this.battleManager.enemies.push(<BattlerAI>enemy._ai);
        }

        return enemy;
    }

    /**
     * 
     * Creates and returns a new weapon
     * @param type The weaponType of the weapon, as a string
     */
    createWeapon(type: string): Weapon {
        
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

    protected rollItems() : void{

        this.selectionArray = [];

        while (this.selectionArray.length < 3){

            this.selectionArray.push(this.itemsArray[Math.floor(Math.random() * this.itemsArray.length)]);

        }
        
        this.item1 = new Sprite(this.selectionArray[0]);
        this.item1.position = new Vec2(this.button1.position.x, this.button1.position.y);
        this.item2 = new Sprite(this.selectionArray[1]);
        this.item2.position = new Vec2(this.button2.position.x, this.button2.position.y);
        this.item3 = new Sprite(this.selectionArray[2]);
        this.item3.position = new Vec2(this.button3.position.x, this.button3.position.y);

        this.getLayer("levelUp").addNode(this.item1);
        this.getLayer("levelUp").addNode(this.item2);
        this.getLayer("levelUp").addNode(this.item3);
  
    }

    protected randomSpawn(): Vec2 {
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
                //Check if spawn positon is a wall
                let spawnTile = this.tilemap.getColRowAt(enemyPosition);
                let tile = this.tilemap.getTileAtRowCol(spawnTile);
                if(!this.tilemap.isTileCollidable(tile)){
                    return enemyPosition;
                }
                
            }
        }
    }

    protected constructButtons() : void{

    }


    protected handleCollisions() : void {
        
    }
}