import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import ProjectileAI from "./ProjectileAI";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import EnemyAI from "./EnemyAI";

export default class FireballAI extends ProjectileAI{

    protected enemies: Array<AnimatedSprite>;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this.enemies = options.enemies; // receive enemies from GameLevel
        this.damage = 1;
    }

    update(deltaT: number): void {

        while(this.receiver.hasNextEvent()){
            super.handleEvent(this.receiver.getNextEvent())
		}
        
        if(this.owner.visible && !this.paused){

            // update position
            this.owner.rotation = this.angle;
            this.owner.move(this.dir.scaled(this.current_speed));

            // iterate through enemy array and check for collisions

            for (let enemy of this.enemies){

                if (this.owner.boundary.overlapArea(enemy.boundary) && enemy.ai){
                    this.owner.position = Vec2.ZERO;
                    this.owner.visible = false;
                    this.owner.setAIActive(false, {});

                    (<EnemyAI> enemy._ai).damage(this.damage);
                    break;
                }
                
            }

        }

    }

    setEnemies(enemies: Array<AnimatedSprite>): void{
        this.enemies = enemies;
    }

}