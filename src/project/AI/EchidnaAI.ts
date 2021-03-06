import StateMachineGoapAI from "../../Wolfie2D/AI/StateMachineGoapAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameNode, { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import Weapon from "../GameSystems/items/Weapon";
import BattlerAI from "./BattlerAI";
import Active from "./EnemyStates/Active";
import Attack from "./EnemyStates/Attack";
import { Project_Events } from "../project_constants";
import Emitter from "../../Wolfie2D/Events/Emitter";
import Scene from "../../Wolfie2D/Scene/Scene";
import EnemyAI, { EnemyStates } from "./EnemyAI";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import Timer from "../../Wolfie2D/Timing/Timer";
import ProjectileAI from "./ProjectileAI";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import VenomAi from "./VenomAI";

export default class EchidnaAI extends EnemyAI {

    protected projectiles: Array<AnimatedSprite>;

    protected venomAttackCooldown: Timer = new Timer(4000);

    protected minionsCooldown: Timer = new Timer(10000);

    protected venomRange: number;

    protected bossDead: boolean = false;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this.venomRange = options.venomRange;

        this.speed = options.speed;

        //Create three venoms that will be shot
        this.projectiles = options.projectiles;

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
            onEnd: Project_Events.BOSSDIED,
            onEndData: {enemy: this.owner}
        });

    }

    activate(options: Record<string, any>): void {
        
    }

    damage(damage: number): void {
        if(this.health - damage <= 0){
            this.health = 0;
        } else {
            this.health -= damage;
        }
        this.owner.animation.play("damage");
        this.owner.animation.queue("moving", true);

        if(this.health <= 0 && !this.bossDead){
            this.owner.tweens.play("death");
            this.bossDead = true;
        }
    }

    update(deltaT: number): void {
        //Flip enemy sprites towards the player on the x-axis
        if(!this.bossDead){
            super.update(deltaT);
            let visibleProjectile = false;
            for(let i = 0; i<this.projectiles.length; i++){
                if(this.projectiles[i].visible){
                    visibleProjectile = true;
                    break;
                }
            }

            if(this.distanceToPlayer() <= this.venomRange && this.venomAttackCooldown.isStopped() && !visibleProjectile){
                let dir  = this.player.position.clone().sub(this.owner.position.clone()).normalize();
                let angelLeft = Vec2.UP.angleToCCW(dir) - Math.PI/8;
                let angelStraight = Vec2.UP.angleToCCW(dir);
                let angelRight = Vec2.UP.angleToCCW(dir) + Math.PI/8;

                for(let i = 0; i<this.projectiles.length; i++){
                    if(this.projectiles[i].visible){
                        break;
                    }
                    let projectile = this.projectiles[i];
                    (<ProjectileAI> projectile._ai).receiver.subscribe([Project_Events.GAMEPAUSE, Project_Events.GAMEUNPAUSE]);
                    projectile.position = this.owner.position.clone();
                    if(i === 0){
                        (<ProjectileAI> projectile._ai).setDirection(dir.clone().rotateCCW(Math.PI/8));
                        (<ProjectileAI> projectile._ai).setAngle(angelLeft);
                    } else if (i === 1){
                        (<ProjectileAI> projectile._ai).setDirection(dir);
                        (<ProjectileAI> projectile._ai).setAngle(angelStraight);
                    } else {
                        (<ProjectileAI> projectile._ai).setDirection(dir.clone().rotateCCW(Math.PI/-8));
                        (<ProjectileAI> projectile._ai).setAngle(angelRight);
                    }
                    projectile.setAIActive(true, {speed: 4});
                    this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "shoot", loop: false, holdReference: false});
                    projectile.visible = true;

                }
                this.venomAttackCooldown.start();
            }
            if(this.health/this.maxHealth <= 0.25){
                this.speed = 60;
            }

            //Check if Echidna is at 50% health, if so she can spawn enemies
            if(this.health/this.maxHealth <= 0.5 && this.minionsCooldown.isStopped()){
                (<AnimatedSprite>this.owner).animation.play("spawn_attack");
                this.emitter.fireEvent(Project_Events.BOSSSPAWNENEMIES);
                this.minionsCooldown.start();
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