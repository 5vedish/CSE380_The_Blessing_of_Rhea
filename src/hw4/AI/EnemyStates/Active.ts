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
    
    constructor(parent: EnemyAI, owner: GameNode) {
        super(parent, owner);

        // Regularly update the player location
        this.pollTimer = new Timer(100);

        this.exitTimer = new Timer(1000);

    }

    onEnter(options: Record<string, any>): void {

        this.player = options.player;

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

    // HOMEWORK 4 - TODO [Complete]
    /**
     * This function is called whenever we're defining a path towards the player, and it should create a path that moves
     * in the complete opposite direction. For example, if the path to the player is moving straight left, this method should create 
     * a retreat path that moves straight right. This path should then be set to retreatPath in EnemyAI.
     * 
     * You'll have to implement this function so you can use retreatPath in the Retreat action.
     */
    pickRetreatPath(pathToPlayer: NavigationPath){

        let nextPoint = new Stack<Vec2>();
        nextPoint.push(new Vec2(this.owner.position.x - (this.parent.lastPlayerPos.x - this.owner.position.x), this.owner.position.y - (this.parent.lastPlayerPos.y - this.owner.position.y)));

        let retreatPath = new NavigationPath(nextPoint);
        this.parent.retreatPath = retreatPath;
    }

    update(deltaT: number): void {
        console.log(this.parent.speed + "adfadf");

        if (this.currentPath.isDone()){
            // if current path is empty
            let stack = new Stack<Vec2>();
            stack.push(this.player.position);
            this.currentPath = new NavigationPath(stack);
        } else {
            this.owner.moveOnPath(this.parent.speed * deltaT, this.currentPath);
        }

    }

    onExit(): Record<string, any> {
        return this.retObj;
    }

}