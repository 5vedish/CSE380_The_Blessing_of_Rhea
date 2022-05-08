import Cutscene from "./Cutscene";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import level_z3 from "../GameLevels/Level_Z3";


export default class Z3_Cutscene extends Cutscene{

    loadScene(): void {
        // load tilemap + dialogue object + player + displayed sprites
        this.load.tilemap("levelZ3", "project_assets/tilemaps/LevelZ3.json");
        this.load.spritesheet("zeus", "project_assets/spritesheets/Zeus.json"); 
        this.load.spritesheet("Echidna", "project_assets/spritesheets/echidna.json");
        this.load.object("dialogue", "project_assets/data/level_z3_dialogue.json");
    }

    startScene(): void {

        // simply specify the name of the tile map and the name of the character sprite
        this.tileMapName = "levelZ3";
        this.playerName = "zeus";
        this.nextScene = {next: level_z3}
        super.startScene();

    }



}