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

    protected flipSprite: boolean;


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

        this.receiver.subscribe(Project_Events.PLAYERATTACKED);
        this.emitter = new Emitter();
    }

    activate(options: Record<string, any>): void { }

    handleEvent(event: GameEvent): void {
        switch(event.type){
            case Project_Events.PLAYERATTACKED:
                    //handle removing attack sprite
                    let attackSpirte = event.data.get("owner");
                    attackSpirte.destroy();     
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
                    // if(Input.isPressed('left')){
                    //     this.owner.animation.playIfNotAlready("left");
                    // } else if(Input.isPressed('right')){
                    //     this.owner.animation.playIfNotAlready("right");
                    // } else {
                    //     this.owner.animation.playIfNotAlready("idle");
                    // }

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
            
            // this.owner.move(movement);
            //Scale the diagonal movements to match one directions speed
            (verticalAxis && horizontalAxis) ? this.owner.move(movement.scale(0.75)) : this.owner.move(movement);
        }
    }

    damage(damage: number): void {
        this.health -= damage;
        this.playerStats.editHealth(damage * -1);
        this.owner.animation.play("damage");
        
        this.emitter.fireEvent(Project_Events.DAMAGED);
    }

    destroy() {
        this.receiver.destroy();
    }

    setSpeed(speed: number) {
        this.speed = speed;
    }
}