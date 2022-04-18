import GoapActionPlanner from "../../Wolfie2D/AI/GoapActionPlanner";
import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import StateMachineGoapAI from "../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Stack from "../../Wolfie2D/DataTypes/Stack";
import State from "../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import Weapon from "../GameSystems/items/Weapon";
import { hw4_Events, hw4_Names, hw4_Statuses } from "../hw4_constants";
import BattlerAI from "./BattlerAI";
import Alert from "./EnemyStates/Alert";
import Active from "./EnemyStates/Active";
import Attack from "./EnemyStates/Attack";
import { Project_Events } from "../project_constants";



export default class EnemyAI extends StateMachineGoapAI implements BattlerAI {
    /** The owner of this AI */
    owner: AnimatedSprite;

    /** The total possible amount of health this entity has */
    maxHealth: number;

    /** The current amount of health this entity has */
    health: number;

    /** The default movement speed of this AI */
    speed: number = 100;

    /** The weapon this AI has */
    weapon: Weapon;

    /** A reference to the player object */
    player: GameNode;

    // The current known position of the player
    playerPos: Vec2;

    // The last known position of the player
    lastPlayerPos: Vec2;

    // Attack range
    inRange: number;

    // Path to player
    path: NavigationPath;

    // Path away from player
    retreatPath: NavigationPath;

    spriteFlipped: boolean = false;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        
        this.addState(EnemyStates.DEFAULT, new Active(this, owner, options.player));
        this.addState(EnemyStates.ATTACK, new Attack(this, owner, options.player));

        this.health = options.health;
        this.player = options.player;
        this.weapon = options.weapon;

        // Initialize to the default state
        this.initialize(EnemyStates.DEFAULT, options);
        // this.initialize(EnemyStates.ATTACK, options);

        this.getPlayerPosition();
    }

    activate(options: Record<string, any>): void { }

    damage(damage: number): void {
        this.health -= damage;
        this.owner.animation.play("damage");
        this.owner.animation.queue("moving", true);
        // If health goes below 0, disable AI and fire enemyDied event
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            // this.owner.visible = false;

            this.emitter.fireEvent(Project_Events.ENEMYDIED, {enemy: this.owner})
        }
    }
    isPlayerVisible(pos: Vec2): Vec2{
        //Check if one player is visible, taking into account walls

        // Get the new player location
        let start = this.owner.position.clone();
        let delta = pos.clone().sub(start);

        // Iterate through the tilemap region until we find a collision
        let minX = Math.min(start.x, pos.x);
        let maxX = Math.max(start.x, pos.x);
        let minY = Math.min(start.y, pos.y);
        let maxY = Math.max(start.y, pos.y);

        // Get the wall tilemap
        let walls = <OrthogonalTilemap>this.owner.getScene().getLayer("Wall").getItems()[0];

        let minIndex = walls.getColRowAt(new Vec2(minX, minY));
        let maxIndex = walls.getColRowAt(new Vec2(maxX, maxY));

        let tileSize = walls.getTileSize();

        for (let col = minIndex.x; col <= maxIndex.x; col++) {
            for (let row = minIndex.y; row <= maxIndex.y; row++) {
                if (walls.isTileCollidable(col, row)) {
                    // Get the position of this tile
                    let tilePos = new Vec2(col * tileSize.x + tileSize.x / 2, row * tileSize.y + tileSize.y / 2);

                    // Create a collider for this tile
                    let collider = new AABB(tilePos, tileSize.scaled(1 / 2));

                    let hit = collider.intersectSegment(start, delta, Vec2.ZERO);

                    if (hit !== null && start.distanceSqTo(hit.pos) < start.distanceSqTo(pos)) {
                        // We hit a wall, we can't see the player
                        return null;
                    }
                }
            }
        }

        return pos;
    }

    getPlayerPosition(): Vec2 {
        //Get the position of the closest player in sight
        return this.player.position;
    }

    update(deltaT: number){
        super.update(deltaT);

        // This is the plan that is executed in the Active state, so whenever we don't have a plan, acquire a new one given the current statuses the enemy has
        // if (this.plan.isEmpty()) {
        //     //get a new plan
        //     this.plan = this.planner.plan(hw4_Statuses.REACHED_GOAL, this.possibleActions, this.currentStatus, null);
        // }
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
    ATTACK = "attack"
}