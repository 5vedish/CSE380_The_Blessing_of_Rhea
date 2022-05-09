import StateMachineGoapAI from "../../Wolfie2D/AI/StateMachineGoapAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import Weapon from "../GameSystems/items/Weapon";
import BattlerAI from "./BattlerAI";
import Active from "./EnemyStates/Active";
import Attack from "./EnemyStates/Attack";
import { Project_Events } from "../project_constants";
import Emitter from "../../Wolfie2D/Events/Emitter";
import Scene from "../../Wolfie2D/Scene/Scene";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Cerberus from "./EnemyStates/Cerberus";
import Giant from "./EnemyStates/Giant";



export default class EnemyAI extends StateMachineGoapAI implements BattlerAI {
    /** The owner of this AI */
    owner: AnimatedSprite;

    /** The total possible amount of health this entity has */
    maxHealth: number;

    /** The current amount of health this entity has */
    health: number;

    /** The default movement speed of this AI */
    //Speed 100 is a good default speed
    speed: number;

    /** The weapon this AI has */
    weapon: Weapon;

    //Experience the player would gain
    experience: number;

    /** A reference to the player object */
    player: GameNode;

    // The current known position of the player
    playerPos: Vec2;

    // The last known position of the player
    lastPlayerPos: Vec2;

    protected scene: Scene;

    // Attack range
    inRange: number;

    spriteFlipped: boolean = false;

    emitter: Emitter;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.emitter = new Emitter();
        this.inRange = options.range;
        this.addState(EnemyStates.DEFAULT, new Active(this, owner, options.player, options.range));
        
        this.addState(EnemyStates.GIANT, new Giant(this, owner, options.player, options.range));
        this.addState(EnemyStates.ATTACK, new Attack(this, owner, options.player, options.name, this.emitter));
        this.addState(EnemyStates.CERBERUS, new Cerberus(this, owner, options.startingPosition));

        this.maxHealth = options.health;
        this.health = options.health;
        this.player = options.player;
        this.weapon = options.weapon;
        this.experience = options.experience;

        this.speed = options.speed;

        // Initialize to the default state
        this.initialize(EnemyStates.DEFAULT, options);
        // this.initialize(EnemyStates.ATTACK, options);

    }

    activate(options: Record<string, any>): void { }

    damage(damage: number, critHit : boolean = false): void {

        if (critHit){
            damage *= 1.5; 
            const cText = this.scene.add.animatedSprite("critText", "primary");
            cText.position = this.owner.position.clone();
            cText.animation.play("crit", false, Project_Events.CRITHIT);
        }
        this.health -= damage;
        this.owner.animation.play("damage");
        this.owner.animation.queue("moving", true);
        // If health goes below 0, disable AI and fire enemyDied event
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "enemyDamaged", loop: false, holdReference: false});
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;

            this.emitter.fireEvent(Project_Events.ENEMYDIED, {enemy: this.owner})
        }
    }

    update(deltaT: number){
        super.update(deltaT);

        //Flip enemy sprites towards the player on the x-axis
        if(this.owner._velocity.x !== 0)
            (this.owner._velocity.x >= 0.01) ? (this.spriteFlipped = false):(this.spriteFlipped = true);
        (this.spriteFlipped) ? ((<AnimatedSprite>this.owner).invertX = false):((<AnimatedSprite>this.owner).invertX = true);

    }
}

export enum EnemyStates {
    DEFAULT = "default",
    ALERT = "alert",
    TARGETING = "targeting",
    PREVIOUS = "previous",
    ATTACK = "attack",
    MOVEANDATTACK = "move_and_attack",
    CERBERUS = "Cerberus",
    GIANT = "Giant"
}