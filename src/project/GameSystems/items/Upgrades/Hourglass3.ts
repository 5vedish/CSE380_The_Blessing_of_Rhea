import GameNode from "../../../../Wolfie2D/Nodes/GameNode";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import CharacterStat from "../../../PlayerStatus";
import Item from "../Item";
import Weapon from "../Weapon";
import PlayerController from "../../../AI/PlayerController";
import HadesController from "../../../AI/HadesController";

export default class Hourglass3 extends Item {
    
    use(user: GameNode, weapon: Weapon, playerStats: CharacterStat, playerController: PlayerController): void {
        if (weapon){
            weapon.type.cooldown *= .88;
            playerStats.weaponCoolDown = weapon.type.cooldown;
            weapon.cooldownTimer = new Timer(weapon.type.cooldown);
        } else {
            let castedPlayer = (<HadesController> playerController);
            castedPlayer.attackCooldown = new Timer(castedPlayer.attackCooldown.getTotalTime() * .88);
        }
    }
}