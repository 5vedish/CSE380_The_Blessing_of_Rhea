import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import Timer from "../../../Wolfie2D/Timing/Timer";
import EnemyAI, { EnemyStates } from "../EnemyAI";
import EnemyState from "./EnemyState";
import Stack from "../../../Wolfie2D/DataTypes/Stack";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";

export default class Giant extends EnemyState {
    // Timers for managing this state
    pollTimer: Timer;
    exitTimer: Timer;

    // The return object for this state
    retObj: Record<string, any>;

    currentPath : NavigationPath;
    player : GameNode;
    range: number;

    constructor(parent: EnemyAI, owner: GameNode, player: GameNode, range: number, ) {
        super(parent, owner);
        this.player = player;
        this.range = range * 4;
        
        // Regularly update the player location
        this.pollTimer = new Timer(100);
        this.exitTimer = new Timer(1000);
    }

    onEnter(options: Record<string, any>): void {
        let stack = new Stack<Vec2>();
        stack.push(this.player.position);
        this.currentPath = new NavigationPath(stack);
    }

    handleInput(event: GameEvent): void { }

    update(deltaT: number): void {
        if (Math.sqrt(Math.pow(this.player.position.x - this.owner.position.x, 2) + Math.pow(this.player.position.y - this.owner.position.y, 2)) <= this.range) {
            //Do nothing and just throw rocks
            // if((<AnimatedSprite>this.owner).animation.isPlaying("moving")){
            //     (<AnimatedSprite>this.owner).animation.stop();
            // }
        } else {
            if (this.currentPath.isDone()){
                // if current path is empty
                let stack = new Stack<Vec2>();
                stack.push(this.player.position);
                this.currentPath = new NavigationPath(stack);
            } else {
                let moveSpeed = (this.distanceToPlayer() < 196) ? this.parent.speed * deltaT : this.parent.speed * deltaT * 1.5;
                this.owner.moveOnPath(moveSpeed, this.currentPath);
                if(!(<AnimatedSprite>this.owner).animation.isPlaying("attack") && !(<AnimatedSprite>this.owner).animation.isPlaying("damage")){
                    (<AnimatedSprite>this.owner).animation.playIfNotAlready("moving", true);
                }
                

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