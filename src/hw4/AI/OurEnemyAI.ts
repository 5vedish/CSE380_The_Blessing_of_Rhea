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
import Guard from "./EnemyStates/Guard";
import Patrol from "./EnemyStates/Patrol";
import { EnemyStates } from "./EnemyAI";

export default class OurEnemyAI extends StateMachineGoapAI implements BattlerAI {
    /** The owner of this AI */
    owner: AnimatedSprite;

    /** The current amount of health this entity has */
    health: number;

    speed: number;

    player: GameNode;

    playerPos: Vec2;

    lastPlayerPos: Vec2;

    inRange: number;

    path: NavigationPath;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;

        this.health = options.health;

        this.player = options.player;

        this.inRange = options.inRange;

        this.currentStatus = options.status;

        this.possibleActions = options.actions;

        this.plan = new Stack<GoapAction>();

        this.planner = new GoapActionPlanner();

        this.initialize(OurEnemyStates.DEFAULT);
        
        this.getPlayerPosition();

    }
    
    damage(damage: number){
        this.health -= damage;
        if(this.health <= 0){
            this.owner.setAIActive(false, {});
            this.emitter.fireEvent("enemyDied", {enemy: this.owner});
        }
    }

    getPlayerPosition(): Vec2 {
        return this.player.position;
    }

    update(deltaT: number): void {
        super.update(deltaT);

        
    }
}

export enum OurEnemyStates{
    DEFAULT = "default"
}