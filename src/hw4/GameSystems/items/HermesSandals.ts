import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import BattlerAI from "../../AI/BattlerAI";
import CharacterStat from "../../PlayerStatus";
import PlayerController from "../../AI/PlayerController";
import Item from "./Item";

export default class HermesSandals extends Item {
    
    use(user: GameNode, playerStats: CharacterStat, playerController: PlayerController): void {
        // (<BattlerAI>user._ai).health += 1;
        // playerStats.stats.speed *= 1.05;
        // For Test
        playerStats.stats.speed *= 1.05;
        playerController.setSpeed(playerStats.stats.speed);
    }
}