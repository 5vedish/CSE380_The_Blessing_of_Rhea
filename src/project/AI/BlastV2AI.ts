import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import ProjectileAI from "./ProjectileAI";
import Timer from "../../Wolfie2D/Timing/Timer";
import PlayerController from "./PlayerController";
import { Project_Events } from "../project_constants";

export default class BlastV2AI extends ProjectileAI{

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this.damage = 50; // should be higher damage

        // 10 Blasts
        this.timeToLive = new Timer(5000, () => {
            this.receiver.unsubscribe(Project_Events.GAMEPAUSE);
            this.receiver.unsubscribe(Project_Events.GAMEUNPAUSE);
            this.owner.position = Vec2.ZERO;
            this.owner.visible = false;
            this.owner.setAIActive(false, {});
        });
    }

    update(deltaT: number): void {
        while(this.receiver.hasNextEvent()){
            this.handleEvent(this.receiver.getNextEvent());
		}
        
        if(this.owner.visible && !this.paused){
            // Update the position
            this.owner.rotation = this.angle;
            this.owner.move(this.dir.scaled(this.current_speed));

            //Check if it hits the player
            if(this.owner.boundary.overlapArea(this.player.boundary)){
                (<PlayerController>this.player._ai).damage(this.damage, true);
                this.receiver.unsubscribe(Project_Events.GAMEPAUSE);
                this.receiver.unsubscribe(Project_Events.GAMEUNPAUSE);
                this.owner.position = Vec2.ZERO;
                this.owner.visible = false;
                this.owner.setAIActive(false, {});
                this.emitter.fireEvent(Project_Events.HEALTHCHANGED);
            }
        }
    }
}