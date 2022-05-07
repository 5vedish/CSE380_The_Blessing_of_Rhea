import Cutscene from "./Cutscene";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import level_z2 from "../GameLevels/Level_Z2";


export default class Z2_Cutscene extends Cutscene{

    loadScene(): void {
        // load tilemap + dialogue object + player + displayed sprites
        this.load.tilemap("levelZ2", "project_assets/tilemaps/LevelZ2.json");
        this.load.spritesheet("zeus", "project_assets/spritesheets/Zeus.json"); 
        this.load.spritesheet("Bigzeus", "project_assets/spritesheets/BigZeus.json");
        this.load.spritesheet("bigsnake", "project_assets/spritesheets/BigSnake.json");
        this.load.spritesheet("Echidna", "project_assets/spritesheets/echidna.json");
        this.load.spritesheet("giant", "project_assets/spritesheets/Giant.json");
        this.load.object("dialogue", "project_assets/data/level_z2_dialogue.json");
    }

    startScene(): void {

        // simply specify the name of the tile map and the name of the character sprite
        this.tileMapName = "levelZ2";
        this.playerName = "zeus";
        this.nextScene = {next: level_z2}
        super.startScene();

    }



}