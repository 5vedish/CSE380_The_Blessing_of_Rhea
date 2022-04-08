import PlayerController from "../../AI/PlayerController";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../../../Wolfie2D/Scene/Scene";
import { GraphicType } from "../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import OrthogonalTilemap from "../../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import PositionGraph from "../../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Navmesh from "../../../Wolfie2D/Pathfinding/Navmesh";
import {hw4_Events, hw4_Names, hw4_Statuses} from "../../hw4_constants";
import EnemyAI from "../../AI/EnemyAI";
import WeaponType from "../../GameSystems/items/WeaponTypes/WeaponType";
import RegistryManager from "../../../Wolfie2D/Registry/RegistryManager";
import Weapon from "../../GameSystems/items/Weapon";
import Healthpack from "../../GameSystems/items/Healthpack";
import InventoryManager from "../../GameSystems/InventoryManager";
import Item from "../../GameSystems/items/Item";
import AABB from "../../../Wolfie2D/DataTypes/Shapes/AABB";
import BattleManager from "../../GameSystems/BattleManager";
import BattlerAI from "../../AI/BattlerAI";
import Label from "../../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Color from "../../../Wolfie2D/Utils/Color";
import Input from "../../../Wolfie2D/Input/Input";
import GameOver from "../GameOver";
import AttackAction from "../../AI/EnemyActions/AttackAction";
import Move from "../../AI/EnemyActions/Move";
import Retreat from "../../AI/EnemyActions/Retreat";
import { TweenableProperties } from "../../../Wolfie2D/Nodes/GameNode";
import Line from "../../../Wolfie2D/Nodes/Graphics/Line";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import GoapAction from "../../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import GoapActionPlanner from "../../../Wolfie2D/AI/GoapActionPlanner";
import Map from "../../../Wolfie2D/DataTypes/Map";
import Stack from "../../../Wolfie2D/DataTypes/Stack";
import Berserk from "../../AI/EnemyActions/Berserk";
import GameLevel from "./GameLevel";

export default class level_z1 extends GameLevel {

    loadScene(): void {
        //Load Zeus
        this.load.spritesheet("Zeus", "project_assets/Spritesheets/Zeus.json"); 

        //Load Snake
        this.load.spritesheet("snake", "project_assets/Spritesheets/Snake.json")


        //Load tilemap
        this.load.tilemap("levelZ1", "project_assets/Tilemaps/LevelZ1.json");

    }

    startScene(): void {
        this.add.tilemap("levelZ1", new Vec2(2, 2));
        this.viewport.setBounds(0, 0, 64*32, 64*32);
        this.viewport.setCenter(5*32, 14*32);

        this.playerSpawn = new Vec2(5*32, 14*32);
        
        this.maxEnemies = 10;

        //Spawn enemies in
        // for(let i = 0; i<this.maxEnemies; i++){
        //     this.addEnemy("snake", )
        // }
    }   
}