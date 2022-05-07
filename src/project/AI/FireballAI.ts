import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import ProjectileAI from "./ProjectileAI";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import EnemyAI from "./EnemyAI";

export default class FireballAI extends ProjectileAI{

    protected enemies: Array<AnimatedSprite>;
    protected pierce: number;
    protected invuln: Array<AnimatedSprite> = [];

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this.enemies = options.enemies; // receive enemies from GameLevel
        this.damage = 50;
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

                    (<EnemyAI> enemy._ai).damage(this.damage);
                    this.invuln.push(enemy); // to re-add later
                    this.enemies = this.enemies.filter(target => target !== enemy); // remove from array temporarily

                    if (this.pierce === 0){
                        this.owner.position = Vec2.ZERO;
                        this.owner.visible = false;
                        this.owner.setAIActive(false, {});
                    }

                    this.pierce -= 1;
                    
                    break;
                }
                
            }

        }

    }

    setEnemies(enemies: Array<AnimatedSprite>): void{
        this.enemies = enemies;
    }

    setPierce(pierce: number):void{
        this.pierce = pierce;
    }

    checkInvuln():void{
        
        for (let i of this.invuln){
            if (i.active) {
                this.enemies.push(i); // if enemy still exists, push them back
            }
        }

        this.invuln = []; // clear the array
    }

}