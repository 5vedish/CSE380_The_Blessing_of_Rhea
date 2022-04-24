import GameNode from "../../../../Wolfie2D/Nodes/GameNode";
import CharacterStat from "../../../PlayerStatus";
import PlayerController from "../../../AI/PlayerController";
import Item from "../Item";
import Weapon from "../Weapon";

export default class HermesSandals3 extends Item {
    
    use(user: GameNode, weapon: Weapon, playerStats: CharacterStat, playerController: PlayerController): void {
        // (<BattlerAI>user._ai).health += 1;
        // playerStats.stats.speed *= 1.05;
        // For Test
        playerStats.stats.speed *= 1.1;
        playerController.setSpeed(playerStats.stats.speed);
    }

}