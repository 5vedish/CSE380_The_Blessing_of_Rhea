import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameNode, { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { Project_Events } from "../project_constants";
import EnemyAI, { EnemyStates } from "./EnemyAI";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import Timer from "../../Wolfie2D/Timing/Timer";
import ProjectileAI from "./ProjectileAI";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Cerberus from "./EnemyStates/Cerberus";

export default class CerberusAI extends EnemyAI {

    protected projectiles: Array<AnimatedSprite>;
    protected attackCooldown: Timer = new Timer(1000);

    protected dead: boolean = false;
    protected headNum: number;

    protected spawnThreshold = .75 // starts off spawning at 70% hp

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        
        this.projectiles = options.projectiles;
        this.headNum = options.headNum;

        this.initialize(EnemyStates.DEFAULT, options);

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
            onEnd: Project_Events.CERBERUSDIED,
            onEndData: {enemy: this.owner}
        });

        this.changeState(EnemyStates.CERBERUS);

    }

    activate(options: Record<string, any>): void { }

    damage(damage: number): void {
        if(this.health - damage <= 0){
            this.health = 0;
        } else {
            this.health -= damage;
        }
        
        this.owner.animation.play("damage");
        this.owner.animation.queue("moving", true);

        if(this.health <= 0 && !this.dead){
            this.owner.tweens.play("death");
            this.dead = true;
            this.emitter.fireEvent(Project_Events.CERBERUSDAMAGED, { headNum: this.headNum, dead: true });
        } else {
            this.emitter.fireEvent(Project_Events.CERBERUSDAMAGED, { headNum: this.headNum, dead: false });

            if (this.health < this.maxHealth*this.spawnThreshold){
                this.emitter.fireEvent(Project_Events.BOSSSPAWNENEMIES);
                
                while (this.health/this.maxHealth < this.spawnThreshold){
                    this.spawnThreshold -= .25; // round down to the nearest quarter of hp
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

    update(deltaT: number): void {
        super.update(deltaT);

        if(this.distanceToPlayer() <= this.inRange && this.attackCooldown.isStopped()){

            let dir  = this.player.position.clone().sub(this.owner.position.clone()).normalize();
    
            let angle = Vec2.UP.angleToCCW(dir) /** +/- Math.PI/(angle) */;

            for(let i = 0; i<this.projectiles.length; i++){

                let projectile = this.projectiles[i];

                if (!projectile.visible)
                    (<ProjectileAI> projectile._ai).receiver.subscribe([Project_Events.GAMEPAUSE, Project_Events.GAMEUNPAUSE]);{

                    projectile.position = this.owner.position.clone();

                    // set direction and set angle afterwards
                    (<ProjectileAI> projectile._ai).setDirection(dir /**.clone().rotateCCW(Math.PI/<angle>) */);
                    (<ProjectileAI> projectile._ai).setAngle(angle);

                    projectile.setAIActive(true, {speed: 4});
                    // play sound here
                    projectile.visible = true;
                    this.attackCooldown.start();
                    break;

                }
                    
            }
        
        }

        

    }

    distanceToPlayer(): number{
        return Math.sqrt(Math.pow(this.player.position.x - this.owner.position.x, 2) + Math.pow(this.player.position.y - this.owner.position.y, 2));
    }

}