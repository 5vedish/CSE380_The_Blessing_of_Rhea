import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../../Wolfie2D/Scene/Scene";
import Timer from "../../Wolfie2D/Timing/Timer";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import { Project_Events } from "../project_constants";
import EnemyAI from "./EnemyAI";
import ProjectileAI from "./ProjectileAI";

export default class LeviathanAI extends EnemyAI{
    protected projectiles: Array<AnimatedSprite>;
    protected projectilesV2: Array<AnimatedSprite>;
    protected attackCooldown: Timer;
    protected upgradeWeapon: Boolean;
    protected removeProjectiles: Boolean;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>){
        super.initializeAI(owner, options);
        this.weapon.cooldownTimer = new Timer(1000);
        this.projectiles = options.projectiles;
        this.projectilesV2 = options.projectilesV2;
        this.attackCooldown = new Timer(options.cooldown);
        this.upgradeWeapon = false;
        this.removeProjectiles = false;
        this.scene = options.scene;
    }

    update(deltaT: number){
        super.update(deltaT);

        //Fire when in range;
        if(this.distanceToPlayer() <= this.inRange && this.attackCooldown.isStopped()) {
            // If health reaches a certain threshold upgrade weapon
            if (!this.upgradeWeapon && this.health <= this.maxHealth * 0.6) this.upgradeWeapon = true;
            let projectile: AnimatedSprite = null;
            let poolProjectiles = this.upgradeWeapon ? this.projectilesV2: this.projectiles; 
            for (let p of poolProjectiles) {
                if (!p.visible) {
                    projectile = p;
                    break;
                }
            }
    
            if (projectile !== null) {
                let dir = this.player.position.clone().sub(this.owner.position.clone()).normalize();
                projectile.position = this.owner.position.clone();
                (<ProjectileAI> projectile._ai).setDirection(dir);
                (<ProjectileAI> projectile._ai).setAngle(Vec2.UP.angleToCCW(dir));
                projectile.setAIActive(true, {speed: 4});
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "shoot", loop: false, holdReference: false});
                projectile.visible = true;
            }
            this.attackCooldown.start();
        } else if (this.upgradeWeapon && !this.removeProjectiles) {
            // Delete old projectiles after upgrading weapon
            this.removeProjectiles = true;
            for(let p of this.projectiles){
                if (this.scene.getSceneGraph().getNode(p.id) === undefined) {
                    continue;
                } else {
                    p.destroy();
                }
            }
        }
    }

    damage(damage: number): void {
        if (this.health - damage <= 0) this.health = 0; 
        else this.health -= damage;
        this.owner.animation.play("damage");
        this.owner.animation.queue("moving", true);
        
        // If health goes below 0, disable AI and fire enemyDied event
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            // this.owner.visible = false;

            this.owner.tweens.add("death", {
                startDelay: 0,
                duration: 2500,
                effects: [
                    {
                        property: TweenableProperties.alpha,
                        start: 1,
                        end: 0,
                        ease: EaseFunctionType.OUT_SINE
                    },
                    {
                        property: "rotation",
                        resetOnComplete: false,
                        start: 0,
                        end: 16*Math.PI,
                        ease: EaseFunctionType.IN_OUT_QUAD
                    }
    
                ],
                onEnd: Project_Events.BOSSDIED,
                onEndData: {enemy: this.owner}
            });

            this.owner.tweens.play("death");
        }
    }

    destroy(): void {
        for(let p of this.projectiles){
            if(this.scene.getSceneGraph().getNode(p.id) === undefined){
                continue;
            } else {
                p.destroy();
            }
        }

        for(let p2 of this.projectilesV2){
            if(this.scene.getSceneGraph().getNode(p2.id) === undefined){
                continue;
            } else {
                p2.destroy();
            }
        }
        super.destroy();
    }


    distanceToPlayer(): number{
        return Math.sqrt(Math.pow(this.player.position.x - this.owner.position.x, 2) + Math.pow(this.player.position.y - this.owner.position.y, 2));
    }


}