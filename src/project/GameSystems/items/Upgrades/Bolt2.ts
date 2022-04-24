import GameNode from "../../../../Wolfie2D/Nodes/GameNode";
import CharacterStat from "../../../PlayerStatus";
import PlayerController from "../../../AI/PlayerController";
import Item from "../Item";
import Weapon from "../Weapon";

export default class Bolt2 extends Item {
    
    use(user: GameNode, weapon: Weapon, playerStats: CharacterStat, playerController: PlayerController): void {
        playerController.weapon.type.damage *= 1.07;
    }

}