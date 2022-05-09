import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import Timer from "../../../Wolfie2D/Timing/Timer";
import EnemyAI, { EnemyStates } from "../EnemyAI";
import EnemyState from "./EnemyState";
import Stack from "../../../Wolfie2D/DataTypes/Stack";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";

export default class Dash extends EnemyState {
  
    // The return object for this state
    retObj: Record<string, any>;

    currentPath : NavigationPath;
    player : GameNode;

    duration: Timer = new Timer(3000);

    constructor(parent: EnemyAI, owner: GameNode, player: GameNode) {
        super(parent, owner);
        this.player = player;
    }

    onEnter(options: Record<string, any>): void {
        let stack = new Stack<Vec2>();
        stack.push(this.player.position);
        this.currentPath = new NavigationPath(stack);
        this.duration.start();
    }

    handleInput(event: GameEvent): void { }

    update(deltaT: number): void {

            if (this.duration.isStopped()){
                this.finished(EnemyStates.DEFAULT);
            }
        
            if (this.currentPath.isDone()){
                // if current path is empty
                const xVar = Math.random() * ((Math.random() < .5) ? -64 : 64);
                const yVar = Math.random() * ((Math.random() < .5) ? -64 : 64);

                let pos = this.player.position.clone().sub(this.owner.position.clone()).normalize().scale(this.distanceToPlayer() * 2); // unit vector * distance * scaling

                pos = this.player.position.clone().add(new Vec2(xVar, yVar));

                let stack = new Stack<Vec2>();
                stack.push(pos);
                this.currentPath = new NavigationPath(stack);
            } else {
                let moveSpeed = this.parent.speed * (4 - ((this.duration.getTimeLeft()/this.duration.getTotalTime())*2)) * deltaT;
                this.owner.moveOnPath(moveSpeed, this.currentPath);
                (<AnimatedSprite> this.owner).animation.playIfNotAlready("moving");

                if ((<AnimatedSprite>this.owner).boundary.overlapArea((<AnimatedSprite> this.player).boundary)){
                    this.finished(EnemyStates.DEFAULT);
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