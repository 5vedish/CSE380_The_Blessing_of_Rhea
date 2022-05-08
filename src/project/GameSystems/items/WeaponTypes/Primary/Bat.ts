import Vec2 from "../../../../../Wolfie2D/DataTypes/Vec2";
import GameNode from "../../../../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../../../../../Wolfie2D/Scene/Scene";
import { Project_Events } from "../../../../project_constants";
import WeaponType from "../WeaponType";

export default class Bat extends WeaponType {

    initialize(options: Record<string, any>): void {
        this.damage = options.damage;
        this.cooldown = options.cooldown;
        this.displayName = options.displayName;
        this.spriteKey = options.spriteKey;
        this.useVolume = options.useVolume;
    }

    doAnimation(attacker: GameNode, direction: Vec2, batSprite: AnimatedSprite): void {
        // Rotate this with the game node
        batSprite.rotation = attacker.rotation;

        // Move the slice out from the player
        batSprite.position = attacker.position.clone().add(direction.scaled(32));
        batSprite.rotation = Vec2.UP.angleToCCW(direction);
        
        // Play the slice animation w/o loop, but queue the normal animation
        batSprite.animation.play("SLICE", false, Project_Events.MELEEATTACK);
    }

    createRequiredAssets(scene: Scene): [AnimatedSprite] {
        let slice = scene.add.animatedSprite("batSwing", "primary");
        slice.scale.set(1.5,1.5);
        slice.animation.play("NORMAL", true);

        return [slice];
    }

    hits(node: GameNode, sliceSprite: AnimatedSprite): boolean {
        return sliceSprite.boundary.overlaps(node.collisionShape);
    }

    clone(): WeaponType {
        let newType = new Bat();
        newType.initialize({damage: this.damage, cooldown: this.cooldown, displayName: this.displayName, spriteKey: this.spriteKey, useVolume: this.useVolume});
        return newType;
    }
}