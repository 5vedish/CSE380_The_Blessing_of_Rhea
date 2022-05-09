import GameNode from "../../../../Wolfie2D/Nodes/GameNode";
import CharacterStat from "../../../PlayerStatus";
import PlayerController from "../../../AI/PlayerController";
import Item from "../Item";
import Weapon from "../Weapon";
import { Project_Events } from "../../../project_constants";

export default class HoneyJar extends Item {
    
    use(user: GameNode, weapon: Weapon, playerStats: CharacterStat, playerController: PlayerController): void {
        playerStats.editHealth(playerStats.stats.maxHealth * 0.15);
        this.emitter.fireEvent(Project_Events.HEALTHCHANGED);
    }

}