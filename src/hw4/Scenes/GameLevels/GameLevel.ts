import AABB from "../../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Debug from "../../../Wolfie2D/Debug/Debug";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import Input from "../../../Wolfie2D/Input/Input";
import GameNode, { TweenableProperties } from "../../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Point from "../../../Wolfie2D/Nodes/Graphics/Point";
import Rect from "../../../Wolfie2D/Nodes/Graphics/Rect";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Label from "../../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../../Wolfie2D/Scene/Scene";
import Timer from "../../../Wolfie2D/Timing/Timer";
import Color from "../../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";

export default class GameLevel extends Scene{
    //Player info
    protected playerSpawn: Vec2;
    protected player: AnimatedSprite;

    //Each level has a timer
    protected levelTimer: Timer;

    //Each level has a set number of enemies
    protected maxEnemies: number;
    protected enemyTypes: Array<AnimatedSprite>;
    protected enemies: Array<AnimatedSprite>;


    updateScene(deltaT: number): void {
        //Handles events

        // Prevents the player from going out of map
        this.lockPlayer();
    }
    

    protected lockPlayer() : void {
        let x = this.player.position.x;
		let y = this.player.position.y;
		if (x <= 16)
			this.player.position.x = 16;
		else if (x >= (64 * 32) - 16) 
			this.player.position.x = (64 * 32) - 16;

		if (y <= 32)
			this.player.position.y = 32;
		else if (y >= (64 * 32) - 32) 
			this.player.position.y = (64 * 32) - 32;
    }


    protected addEnemy(spriteKey: string, player: GameNode): void{
        let enemy = this.add.animatedSprite(spriteKey, "primary");
        enemy.position.set(player.position.x + 10, player.position.y + 10);
    }
}