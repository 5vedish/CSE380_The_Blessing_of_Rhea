import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Graphic from "../../Wolfie2D/Nodes/Graphic";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import Timer from "../../Wolfie2D/Timing/Timer";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { Project_Events } from "../project_constants";
import PlayerController from "./PlayerController";

/**
 * This class controls our bullet behavior. Bullets will start out at a certain speed and then accelerate until they either
 * hit a obstacle or leave the screen.
 */
export default class ProjectileAI implements AI {
    // The owner of this AI
    protected owner: AnimatedSprite;

    // The velocity
    protected current_speed: number;
    private start_speed: number;
    protected dir: Vec2;

    protected angle: number;

    protected paused: boolean = true;

    private player: AnimatedSprite;

    // Stats
    protected damage: number = 5;

    protected emitter: Emitter;

    private timeToLive: Timer;

    // An event emitter and receiver to hook into the event system
    protected receiver: Receiver

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;

        this.current_speed = options.speed;;

        this.emitter = new Emitter();

        
        this.receiver = new Receiver();
        this.receiver.subscribe([Project_Events.GAMEPAUSE, Project_Events.GAMEUNPAUSE]);

        this.player = options.player;

        this.timeToLive = new Timer(3000, () => {
            //Reset onEnd
            this.owner.position = Vec2.ZERO;
            this.owner.visible = false;
            this.owner.setAIActive(false, {});
        });
    }

    activate(options: Record<string, any>): void {
        this.timeToLive.start();
        this.paused = false;
    }


    handleEvent(event: GameEvent): void {
        switch (event.type){
            case Project_Events.GAMEPAUSE:
                this.timeToLive.pause();
                this.paused = true;
                break;
            case Project_Events.GAMEUNPAUSE:
                this.paused = false;
                this.timeToLive.unpause();
                break;
        }
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
                (<PlayerController>this.player._ai).damage(this.damage);
                this.owner.position = Vec2.ZERO;
                this.owner.visible = false;
                this.owner.setAIActive(false, {});
                this.emitter.fireEvent(Project_Events.HEALTHCHANGED);
            }

        }

    }

    setDirection(dir: Vec2): void {
        this.dir = dir;
    }

    setAngle(angle: number):void{
        this.angle = angle;
    }

    destroy(): void {
        this.receiver.destroy();
    }

    getDamage(): number{
        return this.damage;
    }

    setDamage(damage: number): void{
        this.damage = damage;
    }

}