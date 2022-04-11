import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import Timer from "../../Wolfie2D/Timing/Timer";
import InventoryManager from "../GameSystems/InventoryManager";
import Healthpack from "../GameSystems/items/Healthpack";
import Item from "../GameSystems/items/Item";
import Weapon from "../GameSystems/items/Weapon";
import { hw4_Events, hw4_Names } from "../hw4_constants";
import BattlerAI from "./BattlerAI";
import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import CharacterStat from "../PlayerStatus";
import Emitter from "../../Wolfie2D/Events/Emitter";
import { Project_Events } from "../../ProjectEnums";


export default class PlayerController extends StateMachineAI implements BattlerAI {
    // Fields from BattlerAI
    health: number;

    // The actual player sprite
    owner: AnimatedSprite;

    // player primary weapon
    weapon: Weapon;

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


    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.lookDirection = Vec2.ZERO;
        this.speed = options.speed;
        this.health = options.health;
        this.inputEnabled = options.inputEnabled;
        this.range = options.range;
        this.playerStats = options.playerStats;
        this.weapon = options.weapon;

        this.items = options.items;
        this.inventory = options.inventory;

        this.receiver = new Receiver();
        // this.receiver.subscribe(hw4_Events.SWAP_PLAYER);
        this.emitter = new Emitter();
    }

    activate(options: Record<string, any>): void { }

    handleEvent(event: GameEvent): void {
        // If our id matches this player, set boolean and update inventory UI
        if (event.type === hw4_Events.SWAP_PLAYER) {
            if (event.data.get("id") === this.owner.id) {
                this.inputEnabled = true;
                this.inventory.setActive(true);
            }
            else {
                this.inputEnabled = false;
                this.inventory.setActive(false);
            }
        }
    }

    update(deltaT: number): void {
        while(this.receiver.hasNextEvent()){
            this.handleEvent(this.receiver.getNextEvent());
        }

        if (this.inputEnabled && this.health > 0) {
            // Handle input for player movement
            let verticalAxis = (Input.isPressed('up') ? 1 : 0) + (Input.isPressed('down') ? -1 : 0);
            let horizontalAxis = (Input.isPressed('left') ? -1 : 0) + (Input.isPressed('right') ? 1 : 0);

            // Handles animation based on inputs
            if(!this.owner.animation.isPlaying("damage")){
                if(!this.owner.animation.isPlaying("attacking")){
                    if(Input.isPressed('left')){
                        this.owner.animation.playIfNotAlready("left");
                    } else if(Input.isPressed('right')){
                        this.owner.animation.playIfNotAlready("right");
                    } else {
                        this.owner.animation.playIfNotAlready("idle");
                    }
                }
            }

            if (Input.isMouseJustPressed()){
                this.weapon.use(this.owner, "player", Input.getGlobalMousePosition(), []);
            }

            // TODO - WILL NEED TO IMPLEMENT PLAYER DIRECTION TO INDICATE WHICH IDLE ANIMATION WE ARE USING

            let movement = Vec2.UP.scaled(verticalAxis * this.speed);
            movement = movement.add(new Vec2(horizontalAxis * this.speed, 0));
            
            // Move the player
            this.owner.move(movement);   
        }
    }

    damage(damage: number): void {
        this.health -= damage;
        this.playerStats.editHealth(damage * -1);
        this.owner.animation.play("damage");

        this.emitter.fireEvent(Project_Events.DAMAGED);
    }

    destroy() {

    }
}