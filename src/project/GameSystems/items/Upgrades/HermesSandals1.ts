import GameNode from "../../../../Wolfie2D/Nodes/GameNode";
import CharacterStat from "../../../PlayerStatus";
import PlayerController from "../../../AI/PlayerController";
import Item from "../Item";
import Weapon from "../Weapon";

export default class HermesSandals1 extends Item {
    
    use(user: GameNode, weapon: Weapon, playerStats: CharacterStat, playerController: PlayerController): void {
        playerStats.stats.speed *= 1.02;
        playerController.setSpeed(playerStats.stats.speed);
    }

}