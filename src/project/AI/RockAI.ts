import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import ProjectileAI from "./ProjectileAI";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import EnemyAI from "./EnemyAI";
import PlayerController from "./PlayerController";
import { Project_Events } from "../project_constants";
import Timer from "../../Wolfie2D/Timing/Timer";

export default class RockAI extends ProjectileAI{
    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this.damage = 35; // should be higher damage

        this.timeToLive = new Timer(5000, () => {
            this.receiver.unsubscribe(Project_Events.GAMEPAUSE);
            this.receiver.unsubscribe(Project_Events.GAMEUNPAUSE);
            this.receiver.ignoreEvents();
            this.owner.position = Vec2.ZERO;
            this.owner.visible = false;
            this.owner.setAIActive(false, {});
        });
    }
}