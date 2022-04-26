import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import Timer from "../../../Wolfie2D/Timing/Timer";
import EnemyAI, { EnemyStates } from "../EnemyAI";
import EnemyState from "./EnemyState";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Emitter from "../../../Wolfie2D/Events/Emitter";

export default class Attack extends EnemyState {
     // Timers for managing this state
     pollTimer: Timer;
     exitTimer: Timer;

     // The return object for this state
     retObj: Record<string, any>;
 
     player : GameNode;
     monsterType: string;
     dir: any;

     emitter: Emitter;
     
     constructor(parent: EnemyAI, owner: GameNode, player: GameNode, monsterType: string, emitter: Emitter) {
         super(parent, owner);
         this.player = player;
         this.monsterType = monsterType;
         this.emitter = emitter;
 
         // Regularly update the player location
         this.pollTimer = new Timer(100);
         this.exitTimer = new Timer(1000);
     }

     onEnter(options: Record<string, any>): void {}

     handleInput(event: GameEvent): void {}

     update(deltaT: number): void {
        // Gets the direction to attack
        this.dir = this.player.position.clone().sub(this.owner.position).normalize();
        if (this.parent.weapon.use(this.owner, "enemy", this.dir, [])) {
            // Play attack animation here
            (<AnimatedSprite> this.owner).animation.stop();
            (<AnimatedSprite> this.owner).animation.play("attack");
        } else this.finished(EnemyStates.DEFAULT);
     }

     onExit(): Record<string, any> {
         return this.retObj;
     }
}