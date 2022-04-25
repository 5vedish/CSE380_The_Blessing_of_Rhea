import Vec2 from "../../../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../../../Wolfie2D/Events/Emitter";
import { GameEventType } from "../../../../../Wolfie2D/Events/GameEventType";
import GameNode from "../../../../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../../../../../Wolfie2D/Scene/Scene";
import { Project_Events } from "../../../../project_constants";
import WeaponType from "../WeaponType";

export default class Lightning extends WeaponType {

    protected emitter: Emitter = new Emitter();

    initialize(options: Record<string, any>): void {
        this.damage = options.damage;
        this.cooldown = options.cooldown;
        this.displayName = options.displayName;
        this.spriteKey = options.spriteKey;
        this.useVolume = options.useVolume;
    }

    doAnimation(attacker: GameNode, position: Vec2, zapSprite: AnimatedSprite, options: Record<string,any>): void {

        zapSprite.position = position;
        (<AnimatedSprite>attacker).animation.play("attacking");
        // Move the slice out from the player
        // sliceSprite.position = attacker.position.clone().add(direction.scaled(16));
        
        // Play the slice animation w/o loop, but queue the normal animation
        if(this.spriteKey === "lightningv2") {
            this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "weaponv2", loop: false, holdReference: false});
        } else {
            this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "weapon", loop: false, holdReference: false});
        }
        zapSprite.animation.play("attack", false, Project_Events.PLAYERATTACKED);
        // zapSprite.animation.queue("normal");    
    }

    createRequiredAssets(scene: Scene): [AnimatedSprite] {
        let zap = scene.add.animatedSprite(this.spriteKey, "primary");

        return [zap];
    }

    hits(node: GameNode, zapSprite: AnimatedSprite): boolean {
        return zapSprite.boundary.overlaps(node.collisionShape);
    }

    clone(): WeaponType {
        let newType = new Lightning();
        newType.initialize({damage: this.damage, cooldown: this.cooldown, displayName: this.displayName, spriteKey: this.spriteKey, useVolume: this.useVolume});
        return newType;
    }

}