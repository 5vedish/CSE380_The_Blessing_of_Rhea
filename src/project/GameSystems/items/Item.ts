import PlayerController from "../../AI/PlayerController";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import Sprite from "../../../Wolfie2D/Nodes/Sprites/Sprite";
import CharacterStat from "../../PlayerStatus";
import Weapon from "./Weapon";

export default abstract class Item {
    /** The sprite that represents this weapon in the world or in an inventory */
    sprite: Sprite;

    constructor(sprite: Sprite){
        this.sprite = sprite;
    }

    abstract use(user: GameNode, weapon: Weapon, playerStats: CharacterStat, playerController: PlayerController): void;
}