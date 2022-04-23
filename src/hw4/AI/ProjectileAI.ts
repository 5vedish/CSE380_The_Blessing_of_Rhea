import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Graphic from "../../Wolfie2D/Nodes/Graphic";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { Project_Events } from "../project_constants";

/**
 * This class controls our bullet behavior. Bullets will start out at a certain speed and then accelerate until they either
 * hit a obstacle or leave the screen.
 */
export default class ProjectileAI implements AI {
    // The owner of this AI
    private owner: AnimatedSprite;

    // The velocity
    private current_speed: number;
    private start_speed: number;
    private dir: Vec2;

    // Stats
    private damage: number = 5;

    // An event emitter and receiver to hook into the event system
    private receiver: Receiver

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;

        this.current_speed = options.speed;;
        
        this.receiver = new Receiver();
    }

    activate(options: Record<string, any>): void {
        this.start_speed = options.speed;
        this.current_speed = this.start_speed;
    }


    handleEvent(event: GameEvent): void {
        // If the bullet used was the same as this bullet, then reset the speed
        if (event.data.get("id") == this.owner.id) {
            this.current_speed = this.start_speed;
        }
    }

    update(deltaT: number): void {
        while(this.receiver.hasNextEvent()){
			this.handleEvent(this.receiver.getNextEvent());
		}
        
        if(this.owner.visible){
            //While this bullet is active, accelerate the bullet to a max speed over time. 
            this.current_speed += 5;
            this.current_speed = MathUtils.clamp(this.current_speed, this.start_speed, 700);

            // Update the position
            this.owner.move(this.dir.scaled(this.current_speed));
            console.log("SCALED DIR: ", this.dir.scaled(this.current_speed));
        }

    }

    setDirection(dir: Vec2): void {
        this.dir = dir;
    }

    destroy(): void {
        
    }

}