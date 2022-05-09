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

    static DASHSPD = 8.5;

    constructor(parent: EnemyAI, owner: GameNode, player: GameNode) {
        super(parent, owner);
        this.player = player;
    }

    onEnter(options: Record<string, any>): void {
        let stack = new Stack<Vec2>();
        const dir = this.player.position.clone().sub(this.owner.position.clone()).normalize(); // get direction
        const pos = this.owner.position.clone().add(dir.scale(this.distanceToPlayer()*1.5)); // scale the direction
        stack.push(pos);
        this.currentPath = new NavigationPath(stack);
        this.owner.isCollidable = false;
        console.log("ENTERING DASH");

        console.log("OUR SPEED" + this.parent.speed);
    }

    handleInput(event: GameEvent): void { }

    update(deltaT: number): void {

        if (this.currentPath.isDone()){

            this.finished(EnemyStates.DEFAULT);

        } else {
            this.owner.moveOnPath(Dash.DASHSPD, this.currentPath);
            (<AnimatedSprite>this.owner).animation.playIfNotAlready("moving", true);

            if ((<AnimatedSprite> this.owner).boundary.overlapArea((<AnimatedSprite> this.player).boundary)){
                this.finished(EnemyStates.DEFAULT);
            }
        }
    }

    distanceToPlayer(): number{
        return Math.sqrt(Math.pow(this.player.position.x - this.owner.position.x, 2) + Math.pow(this.player.position.y - this.owner.position.y, 2));
    }

    onExit(): Record<string, any> {
        console.log("EXITING DASH");
        this.owner.isCollidable = true;
        return this.retObj;
    }

}