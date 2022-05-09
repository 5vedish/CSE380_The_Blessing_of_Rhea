import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import ProjectileAI from "./ProjectileAI";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import EnemyAI from "./EnemyAI";
import PlayerController from "./PlayerController";
import { Project_Events } from "../project_constants";
import Timer from "../../Wolfie2D/Timing/Timer";

export default class VenomAi extends ProjectileAI{

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        //Damage will be true damage, 8% of max health
        this.damage = (<PlayerController>this.player._ai).playerStats.stats.maxHealth * 0.08; 

        this.timeToLive = new Timer(1500, () => {
            this.receiver.unsubscribe(Project_Events.GAMEPAUSE);
            this.receiver.unsubscribe(Project_Events.GAMEUNPAUSE);
            this.receiver.ignoreEvents();
            this.owner.position = Vec2.ZERO;
            this.owner.visible = false;
            this.owner.setAIActive(false, {});
        });
        
    }

    update(deltaT: number): void {
        console.log("HERRO")
        while(this.receiver.hasNextEvent()){
            this.handleEvent(this.receiver.getNextEvent());
		}
        
        if(this.owner.visible && !this.paused){
            this.damage = (<PlayerController>this.player._ai).playerStats.stats.maxHealth * 0.08; 
            // Update the position
            this.owner.rotation = this.angle;
            this.owner.move(this.dir.scaled(this.current_speed));

            //Check if it hits the player
            if(this.owner.boundary.overlapArea(this.player.boundary)){
                (<PlayerController>this.player._ai).damage(this.damage, true);
                this.receiver.unsubscribe(Project_Events.GAMEPAUSE);
                this.receiver.unsubscribe(Project_Events.GAMEUNPAUSE);
                this.receiver.ignoreEvents();
                this.owner.position = Vec2.ZERO;
                this.owner.visible = false;
                this.owner.setAIActive(false, {});
                this.emitter.fireEvent(Project_Events.HEALTHCHANGED);
            }

        }
    }
}