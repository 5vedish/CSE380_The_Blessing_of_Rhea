import Cutscene from "./Cutscene";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import level_z1 from "../GameLevels/Level_Z1";


export default class Z1_Cutscene extends Cutscene{

    loadScene(): void {
        // load tilemap + dialogue object + player + displayed sprites
        this.load.tilemap("levelZ1", "project_assets/tilemaps/LevelZ1.json");
        this.load.spritesheet("zeus", "project_assets/spritesheets/Zeus.json"); 
        this.load.spritesheet("snake", "project_assets/spritesheets/Snake.json");
        this.load.object("dialogue", "project_assets/data/level_z1_dialogue.json");
    }

    startScene(): void {

        // simply specify the name of the tile map and the name of the character sprite
        this.tileMapName = "levelZ1";
        this.playerName = "zeus";
        this.nextScene = {next: level_z1}
        super.startScene();

    }



}