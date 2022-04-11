import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import Timer from "../../../Wolfie2D/Timing/Timer";
import BattlerAI from "../../AI/BattlerAI";
import CharacterStat from "../../PlayerStatus";
import Item from "./Item";
import Weapon from "./Weapon";

export default class Hourglass extends Item {
    
    use(user: GameNode, weapon: Weapon, characterStats: CharacterStat): void {
        weapon.type.cooldown *= .9;
        characterStats.weaponCoolDown = weapon.type.cooldown;
        weapon.cooldownTimer = new Timer(weapon.type.cooldown);
    }
}