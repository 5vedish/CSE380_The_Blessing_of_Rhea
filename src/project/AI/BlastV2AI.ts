import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import ProjectileAI from "./ProjectileAI";
import Timer from "../../Wolfie2D/Timing/Timer";

export default class BlastV2AI extends ProjectileAI{

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this.damage = 150; // should be higher damage

        // 10 Blasts
        this.timeToLive = new Timer(5000, () => {
            this.owner.position = Vec2.ZERO;
            this.owner.visible = false;
            this.owner.setAIActive(false, {});
        });
    }
}