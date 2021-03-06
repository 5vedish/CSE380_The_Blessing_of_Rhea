import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../Wolfie2D/Timing/Timer";
import { Project_Events } from "../project_constants";
import EnemyAI, { EnemyStates } from "./EnemyAI";
import EnemyState from "./EnemyStates/EnemyState";
import ProjectileAI from "./ProjectileAI";
import RangeAI from "./RangeAI";

export default class GiantAI extends EnemyAI {
    protected changedState: boolean = false;
    protected projectiles: Array<AnimatedSprite>;
    protected attackCooldown: Timer = new Timer(3000);

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        console.log(options)
        this.projectiles = options.projectiles;
    }

    update(deltaT: number): void {
        super.update(deltaT);
        if(this.health/this.maxHealth <= .5 && !this.changedState){
            this.inRange *= 4;
            this.changeState(EnemyStates.GIANT);
            this.changedState = true;
        }
        
        if(this.changedState){
            //Throw rocks
            if(this.distanceToPlayer() <= this.inRange && this.attackCooldown.isStopped()){

                let dir  = this.player.position.clone().sub(this.owner.position.clone()).normalize();
        
                let angle = Vec2.UP.angleToCCW(dir) /** +/- Math.PI/(angle) */;
    
    
                let projectile = this.projectiles[0];

                if (!projectile.visible){
                    (<ProjectileAI> projectile._ai).receiver.subscribe([Project_Events.GAMEPAUSE, Project_Events.GAMEUNPAUSE]);
                    this.owner.animation.stop();
                    this.owner.animation.play("attack");
                    projectile.position = this.owner.position.clone();

                    // set direction and set angle afterwards
                    (<ProjectileAI> projectile._ai).setDirection(dir /**.clone().rotateCCW(Math.PI/<angle>) */);
                    (<ProjectileAI> projectile._ai).setAngle(angle);

                    projectile.setAIActive(true, {});
                    // play sound here
                    projectile.visible = true;
                    this.attackCooldown.start();

                }
            
            }
        }
    }

    destroy(): void {
        for(let p of this.projectiles){
            if(this.scene.getSceneGraph().getNode(p.id) != undefined){
                (<ProjectileAI>p._ai).destroy()
            }
        }
        super.destroy();
    }

    distanceToPlayer(): number{
        return Math.sqrt(Math.pow(this.player.position.x - this.owner.position.x, 2) + Math.pow(this.player.position.y - this.owner.position.y, 2));
    }
}