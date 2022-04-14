import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import Timer from "../../../Wolfie2D/Timing/Timer";
import BattlerAI from "../../AI/BattlerAI";
import CharacterStat from "../../PlayerStatus";
import Item from "./Item";
import Weapon from "./Weapon";
import PlayerController from "../../AI/PlayerController";

export default class Hourglass extends Item {
    
    use(user: GameNode, weapon: Weapon, playerStats: CharacterStat, playerController: PlayerController): void {
        weapon.type.cooldown *= .1;
        playerStats.weaponCoolDown = weapon.type.cooldown;
        weapon.cooldownTimer = new Timer(weapon.type.cooldown);
    }
}