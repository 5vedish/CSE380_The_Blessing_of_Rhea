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
import Weapon from "../../GameSystems/items/Weapon";

export default class Attack extends EnemyState {
     // Timers for managing this state
     pollTimer: Timer;
     exitTimer: Timer;
 
     // The return object for this state
     retObj: Record<string, any>;
 
     player : GameNode;
     monsterType: string;
     dir: any;
     
     constructor(parent: EnemyAI, owner: GameNode, player: GameNode, monsterType: string) {
         super(parent, owner);
         this.player = player;
         this.monsterType = monsterType;
 
         // Regularly update the player location
         this.pollTimer = new Timer(100);
         this.exitTimer = new Timer(1000);
     }

     onEnter(options: Record<string, any>): void {}

     handleInput(event: GameEvent): void {}

     update(deltaT: number): void {
        // Gets the direction to attack
        this.dir = this.player.position.clone().sub(this.owner.position).normalize();
        if (this.monsterType === "harpy") this.dir.rotateCCW(Math.PI / 4 * Math.random() - Math.PI/12);
        if (this.parent.weapon.use(this.owner, "enemy", this.dir, [])) {
            // Play attack animation here
            (<AnimatedSprite> this.owner).animation.play("attack");
        } else this.finished(EnemyStates.DEFAULT);
     }

     onExit(): Record<string, any> {
         return this.retObj;
     }
}