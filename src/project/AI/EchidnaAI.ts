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

export default class EchidnaAI extends EnemyAI {

    protected projectiles: Array<AnimatedSprite>;

    protected venomAttackCooldown: Timer = new Timer(10000);

    protected minions: Array<AnimatedSprite>;

    protected meleeRange: number;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.emitter = new Emitter();
        this.inRange = options.venomRange;
        this.meleeRange = options.meleeRange;

        this.addState(EnemyStates.DEFAULT, new Active(this, owner, options.player, options.meleeRange));
        this.addState(EnemyStates.ATTACK, new Attack(this, owner, options.player, options.name, this.emitter));

        this.health = options.health;
        this.player = options.player;
        this.weapon = options.tailWhip;
        this.experience = options.experience;

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

            ]
        });

    }

    activate(options: Record<string, any>): void {
        
    }

    damage(damage: number): void {
        this.health -= damage;
        this.owner.animation.play("damage");
        this.owner.animation.queue("moving", true);

        if(this.health <= 0){
            this.owner.tweens.play("death");
        }
    }

    update(deltaT: number): void {
        //Flip enemy sprites towards the player on the x-axis
        if(this.owner._velocity.x !== 0)
            (this.owner._velocity.x >= 0.01) ? (this.spriteFlipped = false):(this.spriteFlipped = true);
        (this.spriteFlipped) ? ((<AnimatedSprite>this.owner).invertX = false):((<AnimatedSprite>this.owner).invertX = true);

        if(this.distanceToPlayer() <= this.inRange && this.venomAttackCooldown.isStopped()){
            let dir  = this.player.position.clone().sub(this.owner.position.clone()).normalize();
            let angelLeft = Vec2.UP.angleToCCW(dir) + Math.PI/4;
            let angelStraight = Vec2.UP.angleToCCW(dir);
            let angelRight = Vec2.UP.angleToCCW(dir) - Math.PI/4;

            for(let i = 0; i<this.projectiles.length; i++){
                if(this.projectiles[i].visible){
                    break;
                }
                let projectile = this.projectiles[i];
                projectile.position = this.owner.position.clone();
                if(i === 0){
                    (<ProjectileAI> projectile._ai).setDirection(dir.rotateCCW(Math.PI/4));
                    (<ProjectileAI> projectile._ai).setAngle(angelLeft);
                } else if (i === 1){
                    (<ProjectileAI> projectile._ai).setDirection(dir);
                    (<ProjectileAI> projectile._ai).setAngle(angelStraight);
                } else {
                    (<ProjectileAI> projectile._ai).setDirection(dir.rotateCCW(Math.PI/-4));
                    (<ProjectileAI> projectile._ai).setAngle(angelRight);
                }
                projectile.setAIActive(true, {speed: 4});
                projectile.visible = true;

            }
            this.venomAttackCooldown.start();
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
        super.destroy();
    }

    distanceToPlayer(): number{
        return Math.sqrt(Math.pow(this.player.position.x - this.owner.position.x, 2) + Math.pow(this.player.position.y - this.owner.position.y, 2));
    }

}