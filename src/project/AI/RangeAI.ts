import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../Wolfie2D/Timing/Timer";
import EnemyAI from "./EnemyAI";
import ProjectileAI from "./ProjectileAI";

export default class RangeAI extends EnemyAI{
    
    private projectiles: Array<AnimatedSprite>;

    private attackCooldown: Timer;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>){
        super.initializeAI(owner, options);
        this.projectiles = options.projectiles;
        this.attackCooldown = new Timer(options.cooldown);
    }

    update(deltaT: number){
        super.update(deltaT);

        //Fire when in range;
        if(this.distanceToPlayer() <= this.inRange && this.attackCooldown.isStopped()){
            let projectile: AnimatedSprite = null;
            for (let p of this.projectiles) {
                if (!p.visible) {
                    projectile = p;
                    break;
                }
            }
    
            if (projectile !== null) {
                let dir = this.player.position.clone().sub(this.owner.position.clone()).normalize();
                projectile.visible = true;
                projectile.position = this.owner.position.clone();
                (<ProjectileAI> projectile._ai).setDirection(dir);
                projectile.setAIActive(true, {speed: 4});
            }
            this.attackCooldown.start();
        }
    }

    destroy(): void {
        for(let p of this.projectiles){
            p.destroy();
        }
        super.destroy();
    }


    distanceToPlayer(): number{
        return Math.sqrt(Math.pow(this.player.position.x - this.owner.position.x, 2) + Math.pow(this.player.position.y - this.owner.position.y, 2));
    }


}