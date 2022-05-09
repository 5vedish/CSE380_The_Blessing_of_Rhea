import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../../Wolfie2D/Scene/Scene";
import Timer from "../../Wolfie2D/Timing/Timer";
import { Project_Events } from "../project_constants";
import EnemyAI from "./EnemyAI";
import ProjectileAI from "./ProjectileAI";

export default class RangeAI extends EnemyAI{
    
    projectiles: Array<AnimatedSprite>;

    protected attackCooldown: Timer;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>){
        super.initializeAI(owner, options);
        this.projectiles = options.projectiles;
        this.attackCooldown = new Timer(options.cooldown);
        this.scene = options.scene;
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
                (<ProjectileAI> projectile._ai).receiver.subscribe([Project_Events.GAMEPAUSE, Project_Events.GAMEUNPAUSE]);
                let dir = this.player.position.clone().sub(this.owner.position.clone()).normalize();
                projectile.position = this.owner.position.clone();
                (<ProjectileAI> projectile._ai).setDirection(dir);
                (<ProjectileAI> projectile._ai).setAngle(Vec2.UP.angleToCCW(dir));
                projectile.setAIActive(true, {speed: 4});
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "shoot", loop: false, holdReference: false});
                projectile.visible = true;
            }
            this.attackCooldown.start();
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