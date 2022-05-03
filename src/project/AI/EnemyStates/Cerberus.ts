import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import Timer from "../../../Wolfie2D/Timing/Timer";
import EnemyAI, { EnemyStates } from "../EnemyAI";
import EnemyState from "./EnemyState";
import Stack from "../../../Wolfie2D/DataTypes/Stack";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { Cerberus_Positions } from "../../project_constants";

export default class Cerberus extends EnemyState {

    static CERBERUS_SPEED = 2;
    static DISTANCE = 544;
    
    spot: number; // cage number
    currentPath : NavigationPath;
    retObj: Record<string, any>;

    constructor(parent: EnemyAI, owner: GameNode, starting: number) {
        super(parent, owner);
        this.spot = starting;
    }

    onEnter(options: Record<string, any>): void {
        let stack = new Stack<Vec2>();
        this.currentPath = new NavigationPath(stack);
    }

    handleInput(event: GameEvent): void { }

    update(deltaT: number): void {
        
            if (this.currentPath.isDone()){
                // if current path is empty
                let stack = new Stack<Vec2>();

                console.log("BOOM" + this.spot);

                switch (this.spot) {
                    case (Cerberus_Positions.CAGEONE):
                        stack.push(new Vec2(this.owner.position.x + Cerberus.DISTANCE, this.owner.position.y));
                        this.spot = Cerberus_Positions.CAGETWO;
                        break;
                    case (Cerberus_Positions.CAGETWO):
                        stack.push(new Vec2(this.owner.position.x, this.owner.position.y + Cerberus.DISTANCE));
                        this.spot = Cerberus_Positions.CAGETHREE;
                        break;
                    case (Cerberus_Positions.CAGETHREE):
                        stack.push(new Vec2(this.owner.position.x - Cerberus.DISTANCE, this.owner.position.y));
                        this.spot = Cerberus_Positions.CAGEFOUR;
                        break;
                    case (Cerberus_Positions.CAGEFOUR):
                        stack.push(new Vec2(this.owner.position.x, this.owner.position.y - Cerberus.DISTANCE));
                        this.spot = Cerberus_Positions.CAGEONE;
                        break;
                    
                }
          
                this.currentPath = new NavigationPath(stack);

            } else {
                
                this.owner.moveOnPath(Cerberus.CERBERUS_SPEED, this.currentPath);
                if((<AnimatedSprite>this.owner).animation.isPlaying("attack") && (<AnimatedSprite>this.owner).animation.isPlaying("damage")){
                    (<AnimatedSprite>this.owner).animation.queue("moving");
                }
                
            }

    }

    onExit(): Record<string, any> {
        return this.retObj;
    }

}