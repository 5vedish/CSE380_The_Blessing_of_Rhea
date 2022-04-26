import GameNode from "../../../../Wolfie2D/Nodes/GameNode";
import CharacterStat from "../../../PlayerStatus";
import PlayerController from "../../../AI/PlayerController";
import Item from "../Item";
import Weapon from "../Weapon";
import HadesController from "../../../AI/HadesController";
import ProjectileAI from "../../../AI/ProjectileAI";
export default class Bolt2 extends Item {
    
    use(user: GameNode, weapon: Weapon, playerStats: CharacterStat, playerController: PlayerController): void {
        if (playerController.weapon){
            playerController.weapon.type.damage *= 1.07;
        } else {
            const fireballs = (<HadesController> playerController).projectiles;

            for (let f of fireballs){
                const castedF = (<ProjectileAI> f._ai);
                castedF.setDamage(castedF.getDamage() * 1.07);
            }
        }
        
    }

}