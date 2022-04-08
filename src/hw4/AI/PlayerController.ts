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


export default class PlayerController implements BattlerAI {
    // Fields from BattlerAI
    health: number;

    // The actual player sprite
    owner: AnimatedSprite;

    // Attack range
    range: number;

    // Current targeted enemy
    target: Vec2;

    // Used for swapping control between both players
    inputEnabled: boolean;

    // The inventory of the player
    inventory: InventoryManager;

    /** A list of items in the game world */
    private items: Array<Item>;

    // Movement
    private speed: number;

    private lookDirection: Vec2;
    private path: NavigationPath;

    private receiver: Receiver;


    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.lookDirection = Vec2.ZERO;
        this.speed = options.speed;
        this.health = options.health;
        this.inputEnabled = options.inputEnabled;
        this.range = options.range;

        this.items = options.items;
        this.inventory = options.inventory;

        this.receiver = new Receiver();
        this.receiver.subscribe(hw4_Events.SWAP_PLAYER);
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
            if (Input.isPressed('left')) this.owner.animation.playIfNotAlready("left");
            else if (Input.isPressed('right')) this.owner.animation.playIfNotAlready("right");
            else this.owner.animation.playIfNotAlready("idle");

            // TODO - WILL NEED TO IMPLEMENT PLAYER DIRECTION TO INDICATE WHICH IDLE ANIMATION WE ARE USING

            let movement = Vec2.UP.scaled(verticalAxis * this.speed);
            movement = movement.add(new Vec2(horizontalAxis * this.speed, 0));
            
            // Move the player
            
            this.owner.position.add(movement.scaled(deltaT));

            // Check for slot change
            if (Input.isJustPressed("slot1")) {
                this.inventory.changeSlot(0);
            } else if (Input.isJustPressed("slot2")) {
                this.inventory.changeSlot(1);
            }

            
        }

        //Move on path if selected
        if (this.path != null) {
            if (this.path.isDone()) {
                this.path = null;
            }
            else {
                this.owner.moveOnPath(this.speed * deltaT, this.path);
                this.owner.rotation = Vec2.UP.angleToCCW(this.path.getMoveDirection(this.owner));
            }
        }
        else {
            //Target an enemy and attack
            if (this.target != null) {
                let item = this.inventory.getItem();
                this.lookDirection = this.owner.position.dirTo(this.target);

                // If there is an item in the current slot, use it
                if (item) {
                    item.use(this.owner, "player", this.lookDirection);
                    this.owner.rotation = Vec2.UP.angleToCCW(this.lookDirection);

                    if (item instanceof Healthpack) {
                        // Destroy the used healthpack
                        this.inventory.removeItem();
                        item.sprite.visible = false;
                    }
                }
            }
        }
    }

    damage(damage: number): void {
        this.health -= damage;
    }

    destroy() {

    }
}