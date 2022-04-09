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
import EnemyAI from "../../AI/EnemyAI";
import { hw4_Statuses } from "../../hw4_constants";
import Move from "../../AI/EnemyActions/Move";
import PositionGraph from "../../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Navmesh from "../../../Wolfie2D/Pathfinding/Navmesh";
import { project_Names } from "../../project_constantst";

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
    protected enemySpawns: Array<Vec2>;

    // Tilemap walls
    protected walls: OrthogonalTilemap;

      // The position graph for the navmesh
      private graph: PositionGraph;

    loadScene(): void {
        //Initialize the possible spawning areas for enemies
        //Each Vec2 holds the pixels that will be added to the center of the viewport so enemies spawn outside
        //View port is 800x450
        this.enemySpawns = new Array<Vec2>();
        this.enemyTypes = new Array<AnimatedSprite>();
        this.enemies = new Array<AnimatedSprite>();
        this.enemySpawns.push(new Vec2(-450, 0)); //Left of viewport
        this.enemySpawns.push(new Vec2(450, 0)); //Right of viewport
        this.enemySpawns.push(new Vec2(0, -275)); //Top of viewport
        this.enemySpawns.push(new Vec2(0, 275)); //Bottom of viewport
         // Load the nav mesh
         this.load.object("navmesh", "project_assets/data/navmesh.json");

        
    }

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

    protected boundaryCheck(viewportCenter: Vec2, postion: Vec2){
        return (viewportCenter.x + postion.x < 16 
        || viewportCenter.x + postion.x > 64*32-16
        || viewportCenter.y + postion.y < 32 
        || viewportCenter.y + postion.y > 64*32-32);
    }


    protected addEnemy(spriteKey: string): void{
        let enemy = this.add.animatedSprite(spriteKey, "primary");

        enemy.scale.set(2,2);
        enemy.addPhysics();
        enemy.animation.play("Left Move");
        //Randomly select one of the spawnpoints outside the viewport;
        let spawnPointIndex = Math.floor(Math.random() * 4);

        let viewportCenter = this.viewport.getCenter();
        // console.log("x: " + viewportCenter.x, " | y: " + viewportCenter.y);
        //check if spawn position is out of bounds
        while(true){
            if(this.boundaryCheck(viewportCenter, this.enemySpawns[spawnPointIndex])){
                spawnPointIndex = (spawnPointIndex + 1) % 5;
            } else {
                //Find a random x or y of that side
                if(this.enemySpawns[spawnPointIndex].x === 0){
                    //along top or bottom
                    let xOffset = Math.floor(Math.random() * 736) - 368
                    enemy.position.set(viewportCenter.x + xOffset, viewportCenter.y + this.enemySpawns[spawnPointIndex].y);
                } else {
                    let yOffset =Math.floor(Math.random() * 386) - 193
                    enemy.position.set(viewportCenter.x + this.enemySpawns[spawnPointIndex].x,viewportCenter.y + yOffset);
                }
                break;
            }
        }

        // test state

        let statusArray: Array<string> = [hw4_Statuses.CAN_RETREAT, hw4_Statuses.CAN_BERSERK];

        let actions = [
        new Move(0, [], [hw4_Statuses.IN_RANGE], {inRange: 50}),
        ];

        let enemyOptions = {
            defaultMode: "alert",
            health: 5,
            player: this.player,
            target: this.player,
            goal: hw4_Statuses.REACHED_GOAL,
            status: statusArray,
            actions: actions,
            inRange: 50
        }

        enemy.addAI(EnemyAI, enemyOptions);

        //test state 

        this.enemies.push(enemy);
        enemy.setGroup("enemy");
    }

    createNavmesh(): void {
        // Add a layer to display the graph
        let gLayer = this.addLayer("graph");
        gLayer.setHidden(false);

        let navmeshData = this.load.getObject("navmesh");

         // Create the graph
        this.graph = new PositionGraph();

        // Add all nodes to our graph
        for(let node of navmeshData.nodes){
            this.graph.addPositionedNode(new Vec2(node[0]/2, node[1]/2));
            this.add.graphic(GraphicType.POINT, "graph", {position: new Vec2(node[0]/2, node[1]/2)})
        }

        // Add all edges to our graph
        for(let edge of navmeshData.edges){
            this.graph.addEdge(edge[0], edge[1]);
            this.add.graphic(GraphicType.LINE, "graph", {start: this.graph.getNodePosition(edge[0]), end: this.graph.getNodePosition(edge[1])})
        }

        // Set this graph as a navigable entity
        let navmesh = new Navmesh(this.graph);

        this.navManager.addNavigableEntity(project_Names.NAVMESH, navmesh);
    }


}