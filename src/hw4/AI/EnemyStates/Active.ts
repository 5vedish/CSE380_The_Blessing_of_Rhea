import AABB from "../../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import OrthogonalTilemap from "../../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import Timer from "../../../Wolfie2D/Timing/Timer";
import { hw4_Names, hw4_Statuses } from "../../hw4_constants";
import EnemyAI, { EnemyStates } from "../EnemyAI";
import EnemyState from "./EnemyState";
import Stack from "../../../Wolfie2D/DataTypes/Stack";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";

export default class Active extends EnemyState {
    // Timers for managing this state
    pollTimer: Timer;
    exitTimer: Timer;

    // The return object for this state
    retObj: Record<string, any>;

    currentPath : NavigationPath;
    player : GameNode;
    range: number;
    
    constructor(parent: EnemyAI, owner: GameNode, player: GameNode) {
        super(parent, owner);
        this.player = player;
        this.range = 10;
        

        // Regularly update the player location
        this.pollTimer = new Timer(100);

        this.exitTimer = new Timer(1000);

    }

    onEnter(options: Record<string, any>): void {
        let stack = new Stack<Vec2>();
        stack.push(this.player.position);
        this.currentPath = new NavigationPath(stack);
        // Reset the return object
        // this.retObj = {};

        // Choose path to last seen player position
        // this.retObj = { target: this.parent.lastPlayerPos }
        // this.parent.path = this.owner.getScene().getNavigationManager().getPath(hw4_Names.NAVMESH, this.owner.position, this.parent.lastPlayerPos, true);
        // this.pickRetreatPath(this.parent.path);
    }

    handleInput(event: GameEvent): void { }

    update(deltaT: number): void {
        if (Math.abs(this.player.position.x - this.owner.position.x) <= this.range && Math.abs(this.player.position.y - this.owner.position.y) <= this.range) {
            this.finished(EnemyStates.ATTACK);
        } else {
            if (this.currentPath.isDone()){
                // if current path is empty
                let stack = new Stack<Vec2>();
                stack.push(this.player.position);
                this.currentPath = new NavigationPath(stack);
            } else {
                // console.log(this.distanceToPlayer());
                let moveSpeed = (this.distanceToPlayer() < 196) ? this.parent.speed * deltaT : this.parent.speed * deltaT * 1.5;
                this.owner.moveOnPath(moveSpeed, this.currentPath);

            }
        }

    }

    distanceToPlayer(): number{
        return Math.sqrt(Math.pow(this.player.position.x - this.owner.position.x, 2) + Math.pow(this.player.position.y - this.owner.position.y, 2));
    }

    onExit(): Record<string, any> {
        return this.retObj;
    }

}