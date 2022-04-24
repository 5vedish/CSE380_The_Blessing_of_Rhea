import PlayerController from "../../AI/PlayerController";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import Sprite from "../../../Wolfie2D/Nodes/Sprites/Sprite";
import CharacterStat from "../../PlayerStatus";
import Weapon from "./Weapon";
import Emitter from "../../../Wolfie2D/Events/Emitter";

export default abstract class Item {
    /** The sprite that represents this weapon in the world or in an inventory */
    sprite: Sprite;

    emitter: Emitter;

    constructor(sprite: Sprite){
        this.sprite = sprite;
        this.emitter = new Emitter();
    }

    abstract use(user: GameNode, weapon: Weapon, playerStats: CharacterStat, playerController: PlayerController): void;
}