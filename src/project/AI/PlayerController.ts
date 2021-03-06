import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import InventoryManager from "../GameSystems/InventoryManager";
import Item from "../GameSystems/items/Item";
import Weapon from "../GameSystems/items/Weapon";
import BattlerAI from "./BattlerAI";
import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import CharacterStat from "../PlayerStatus";
import Emitter from "../../Wolfie2D/Events/Emitter";
import { Project_Events } from "../project_constants";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";


export default class PlayerController extends StateMachineAI implements BattlerAI {
    // Fields from BattlerAI
    health: number;

    // The actual player sprite
    owner: AnimatedSprite;

    // player primary weapon
    weapon: Weapon;

    //Version 2 of weapon
    weaponV2: string;

    // Attack range
    range: number;

    // Current targeted enemy
    target: Vec2;

    // Used for swapping control between both players
    inputEnabled: boolean;

    // The inventory of the player
    inventory: InventoryManager;

    playerStats: CharacterStat;

    /** A list of items in the game world */
    private items: Array<Item>;

    // Movement
    private speed: number;

    private lookDirection: Vec2;
    private path: NavigationPath;

    protected receiver: Receiver;
    protected emitter: Emitter;

    protected flipSprite: boolean;

    protected invincible: boolean = false;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.lookDirection = Vec2.ZERO;
        this.speed = options.speed;
        this.health = options.health;
        this.inputEnabled = options.inputEnabled;
        this.range = options.range;
        this.playerStats = options.playerStats;
        this.weapon = options.weapon;
        this.weaponV2 = options.weaponV2;
        this.invincible = options.invincible;

        this.items = options.items;
        this.inventory = options.inventory;

        this.receiver = new Receiver();

        this.receiver.subscribe([Project_Events.PLAYERATTACKED, Project_Events.LEVELUP]);// 
        this.emitter = new Emitter();
    }

    activate(options: Record<string, any>): void { }

    handleEvent(event: GameEvent): void {
        switch(event.type){
            case Project_Events.PLAYERATTACKED:
                    //handle removing attack sprite
                    let attackSpirte = event.data.get("owner");
                    attackSpirte.destroy();     
                    break;
            case Project_Events.LEVELUP:
                //check if leveled up
                if(this.playerStats.level >= 5 && !this.weapon.type.spriteKey.includes("v2")) {
                    this.weapon.type.spriteKey = this.weaponV2;
                    this.weapon.type.damage *= 1.3;
                }
            
        }
    }

    update(deltaT: number): void {
        while(this.receiver.hasNextEvent()){
            this.handleEvent(this.receiver.getNextEvent());
        }


        if (this.inputEnabled && this.playerStats.stats.health > 0) {
            // Handle input for player movement
            let verticalAxis = (Input.isPressed('up') ? 1 : 0) + (Input.isPressed('down') ? -1 : 0);
            let horizontalAxis = (Input.isPressed('left') ? -1 : 0) + (Input.isPressed('right') ? 1 : 0);

            // Handles animation based on inputs
            if(!this.owner.animation.isPlaying("damage")){
                if(!this.owner.animation.isPlaying("attacking")){
                    if (this.owner._velocity.x !== 0) {
                        this.flipSprite = this.owner._velocity.x < 0;
                        if (this.flipSprite) (<AnimatedSprite> this.owner).invertX = true;
                        else (<AnimatedSprite> this.owner).invertX = false;
                        this.owner.animation.playIfNotAlready("right");
                    } else if (this.owner._velocity.y !== 0) this.owner.animation.playIfNotAlready("right"); 
                    else this.owner.animation.playIfNotAlready("idle");
                }
            }

            if (Input.isMouseJustPressed()){
                this.weapon.use(this.owner, "player", Input.getGlobalMousePosition(), []);
            }

            let movement = Vec2.UP.scaled(verticalAxis * this.speed);
            movement = movement.add(new Vec2(horizontalAxis * this.speed, 0));
            
            //Scale the diagonal movements to match one directions speed
            (verticalAxis && horizontalAxis) ? this.owner.move(movement.scale(0.75)) : this.owner.move(movement);
        }
    }

    damage(damage: number, ignoreDef = false): void {
        if(!this.invincible){
            let calcDamage = (damage - this.playerStats.stats.defense <= 0) ? 1 : (damage - this.playerStats.stats.defense);
            if(ignoreDef){
                this.playerStats.editHealth (damage * -1);
                if(this.health - damage < 0){
                    this.health = 0;
                } else {
                    this.health -= damage;
                }
            } else {
                this.playerStats.editHealth(calcDamage * -1);
                this.owner.animation.play("damage");

                if(this.health - calcDamage < 0){
                    this.health = 0;
                } else {
                    this.health -= calcDamage;
                }
            }
            
            
            this.emitter.fireEvent(Project_Events.HEALTHCHANGED);
        }
    }

    destroy() {
        this.receiver.destroy();
        super.destroy(); // destroy the created receiver
    }

    getSpeed(): number{
        return this.speed;
    }

    setSpeed(speed: number) {
        this.speed = speed;
    }
}