import Cutscene from "./Cutscene";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import level_p1 from "../GameLevels/Level_P1";


export default class P1_Cutscene extends Cutscene{

    loadScene(): void {
        // load tilemap + dialogue object + player + displayed sprites
        this.load.tilemap("levelP1", "project_assets/tilemaps/LevelP1.json");
        this.load.spritesheet("poseidon", "project_assets/spritesheets/Poseidon.json"); 
        this.load.spritesheet("octopus", "project_assets/spritesheets/Octopus.json");
        this.load.object("dialogue", "project_assets/data/level_p1_dialogue.json");
    }

    startScene(): void {

        // simply specify the name of the tile map and the name of the character sprite
        this.tileMapName = "levelP1";
        this.playerName = "poseidon";
        this.nextScene = {next: level_p1};
        super.startScene();

    }



}