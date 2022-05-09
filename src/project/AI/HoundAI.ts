import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../Wolfie2D/Timing/Timer";
import EnemyAI, { EnemyStates } from "./EnemyAI";
import EnemyState from "./EnemyStates/EnemyState";
import PlayerController from "./PlayerController";
import ProjectileAI from "./ProjectileAI";
import RangeAI from "./RangeAI";

export default class HoundAI extends EnemyAI {

    dashTimer: Timer = new Timer(7000); // 5-10s CD for dash
  

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
    }

    update(deltaT: number): void {
        super.update(deltaT);

        if (this.dashTimer.isStopped()){
            this.changeState(EnemyStates.DASH);
            this.dashTimer.start();
        }
        
    }

}