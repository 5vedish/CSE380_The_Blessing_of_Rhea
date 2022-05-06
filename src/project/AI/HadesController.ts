import PlayerController from "./PlayerController";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { Project_Events } from "../project_constants";
import Input from "../../Wolfie2D/Input/Input";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Timer from "../../Wolfie2D/Timing/Timer";
import ProjectileAI from "./ProjectileAI";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import FireballAI from "./FireballAI";

export default class HadesController extends PlayerController {

    public static HADESCD: number = 2000; // 1s

    public projectiles: Array<AnimatedSprite>;
    public attackCooldown: Timer;

    public floor: OrthogonalTilemap;

    private lavaCD: Timer;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);

        this.projectiles = options.projectiles;
        this.attackCooldown = new Timer(HadesController.HADESCD);

        this.floor = options.floor;

        this.lavaCD = new Timer(1000);
    }

    handleEvent(event: GameEvent): void {
        switch(event.type){
            case Project_Events.LEVELUP:
                // check for evolved weapon
                if(this.playerStats.level === undefined){
           
                }
        }
    }

    update(deltaT: number): void {

        while(this.receiver.hasNextEvent()){
            this.handleEvent(this.receiver.getNextEvent());
        }

        if (this.lavaCD.isStopped()){
            const tileNum = this.floor.getTileAtRowCol(this.floor.getColRowAt(this.owner.position));
            if (tileNum === 4 || tileNum === 5){
                super.damage(10);
                this.lavaCD.start();
            }
        }

        if (this.inputEnabled && this.playerStats.stats.health > 0) {

            // handle input for player movement
            let verticalAxis = (Input.isPressed('up') ? 1 : 0) + (Input.isPressed('down') ? -1 : 0);
            let horizontalAxis = (Input.isPressed('left') ? -1 : 0) + (Input.isPressed('right') ? 1 : 0);
            let movement = Vec2.UP.scaled(verticalAxis * this.getSpeed());
            movement = movement.add(new Vec2(horizontalAxis * this.getSpeed(), 0));
        
            // scale the diagonal movements to match one directions speed
            (verticalAxis && horizontalAxis) ? this.owner.move(movement.scale(0.75)) : this.owner.move(movement);

            // handles animation based on inputs
            if(!this.owner.animation.isPlaying("damage")){
                if(!this.owner.animation.isPlaying("attacking")){
                    if (this.owner._velocity.x !== 0) {
                        this.flipSprite = this.owner._velocity.x < 0;
                        if (this.flipSprite) (<AnimatedSprite> this.owner).invertX = true;
                        else (<AnimatedSprite> this.owner).invertX = false;
                        this.owner.animation.playIfNotAlready("right");
                    } else if (this.owner._velocity.y !== 0) this.owner.animation.playIfNotAlready("right"); 
                    else this.owner.animation.playIfNotAlready("idle");
                }
            }

            if (Input.isMouseJustPressed()){

                this.owner.animation.play("attacking", false, null);

                let projectile: AnimatedSprite = null;
                    for (let p of this.projectiles) {
                        if (!p.visible) {
                        projectile = p;
                        break;
                    }
                }
    
                if (projectile !== null) {
                    // player to mouse -> write mouse to player
                    let dir = Input.getGlobalMousePosition().clone().sub(this.owner.position.clone()).normalize();
                    projectile.position = this.owner.position.clone();
                    (<ProjectileAI> projectile._ai).setDirection(dir);
                    (<ProjectileAI> projectile._ai).setAngle(Vec2.UP.angleToCCW(dir));
                    projectile.setAIActive(true, {speed: 4});
                    projectile.visible = true;
                    (<FireballAI> projectile._ai).setPierce();
                    (<FireballAI> projectile._ai).checkInvuln();
                }

                this.attackCooldown.start();

            }

        }
    }

}