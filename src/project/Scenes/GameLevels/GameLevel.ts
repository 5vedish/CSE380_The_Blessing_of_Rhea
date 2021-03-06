import AABB from "../../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Input from "../../../Wolfie2D/Input/Input";
import GameNode, { TweenableProperties } from "../../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Label, { HAlign } from "../../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../../Wolfie2D/Scene/Scene";
import Timer, { TimerState } from "../../../Wolfie2D/Timing/Timer";
import Color from "../../../Wolfie2D/Utils/Color";
import EnemyAI from "../../AI/EnemyAI";
import { Project_Events } from "../../project_constants";
import WeaponType from "../../GameSystems/items/WeaponTypes/WeaponType";
import RegistryManager from "../../../Wolfie2D/Registry/RegistryManager";
import BattleManager from "../../GameSystems/BattleManager";
import Weapon from "../../GameSystems/items/Weapon";
import BattlerAI from "../../AI/BattlerAI";
import Graphic from "../../../Wolfie2D/Nodes/Graphic";
import CharacterStat from "../../PlayerStatus";
import CanvasNode from "../../../Wolfie2D/Nodes/CanvasNode";
import Hourglass3 from "../../GameSystems/items/Upgrades/Hourglass3";
import Sprite from "../../../Wolfie2D/Nodes/Sprites/Sprite";
import PlayerController from "../../AI/PlayerController";
import Receiver from "../../../Wolfie2D/Events/Receiver";
import Layer from "../../../Wolfie2D/Scene/Layer";
import UIElement from "../../../Wolfie2D/Nodes/UIElement";
import ProjectileAI from "../../AI/ProjectileAI";
import DeathScreen from "../DeathScreen";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import HoneyJar from "../../GameSystems/items/Upgrades/HoneyJar";
import Goblet3 from "../../GameSystems/items/Upgrades/Goblet3";
import Aegis3 from "../../GameSystems/items/Upgrades/Aegis3";
import Hourglass2 from "../../GameSystems/items/Upgrades/Hourglass2";
import HermesSandals2 from "../../GameSystems/items/Upgrades/HermesSandals2";
import Bolt2 from "../../GameSystems/items/Upgrades/Bolt2";
import Goblet2 from "../../GameSystems/items/Upgrades/Goblet2";
import Aegis2 from "../../GameSystems/items/Upgrades/Aegis2";
import HermesSandals3 from "../../GameSystems/items/Upgrades/HermesSandals3";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import Aegis1 from "../../GameSystems/items/Upgrades/Aegis1";
import Goblet1 from "../../GameSystems/items/Upgrades/Goblet1";
import Bolt1 from "../../GameSystems/items/Upgrades/Bolt1";
import HermesSandals1 from "../../GameSystems/items/Upgrades/HermesSandals1";
import Hourglass1 from "../../GameSystems/items/Upgrades/Hourglass1";
import HadesController from "../../AI/HadesController";
import FireballAI from "../../AI/FireballAI";
import CerberusFireballAI from "../../AI/CerberusFireballAI";
import VenomAi from "../../AI/VenomAI";
import BlastAI from "../../AI/BlastAI";
import BlastV2AI from "../../AI/BlastV2AI";
import RockAI from "../../AI/RockAI";
import FracturedAegis from "../../GameSystems/items/Upgrades/FracturedAegis";
import Bolt3 from "../../GameSystems/items/Upgrades/Bolt3";
import PoisonedGoblet from "../../GameSystems/items/Upgrades/PoisonedGoblet";
import ArtemisBow1 from "../../GameSystems/items/Upgrades/ArtemisBow1";
import ArtemisBow2 from "../../GameSystems/items/Upgrades/ArtemisBow2";
import ArtemisBow3 from "../../GameSystems/items/Upgrades/ArtemisBow3";

export interface CustomEnemy {
    name: string,
    health: number,
    player: GameNode,
    speed: number,
    weapon: Weapon,
    range: number,
    experience: number
}

export interface InventoryItemGraphic{
    name: string,
    sprite: Sprite,
    count: number,
    countLabel: Label,
    pos: Vec2
}

export default class GameLevel extends Scene{

    protected enemyConstructorPairings: Map<string,any>;

    protected upgradedWeapon: boolean = false;

    //Timer for levels that require players to survive
    protected startSceneTimer: Timer = new Timer(5000);
    protected startedLevel: boolean = false;
    protected gameTimer: Timer;
    protected gameTime: Label;
    protected changeLevelTimer: Timer = new Timer(5000);

    //Each level has a timer
    protected levelTimer: Timer;
    protected invincibilityTimer: Timer;
    protected pauseFlag: boolean = false;

    //Player info
    protected playerSpawn: Vec2;
    protected player: AnimatedSprite;
    protected playerController: PlayerController;
    protected playerStats: CharacterStat

    //Each level has a set number of enemies
    protected enemySpawns: Array<Vec2>;
    protected maxEnemies: number;
    protected currentNumEnemies: number = 0;
    protected enemyArray: Array<AnimatedSprite>;
    protected spawnableEnemies: CustomEnemy[] = []; //List of possible enemies that can be spawned
    protected bossDefeated: boolean = false;

    // guis
    protected healthBar: Graphic;
    protected healthNumber: Label;
    protected levelUI: Label;
    protected expBar: Graphic;
    protected inventory: Array<InventoryItemGraphic> = [];

    // pause gui
    protected hpHUD: Label;
    protected attHUD: Label;
    protected cdHUD: Label;
    protected defHUD: Label;
    protected spdHUD: Label;
    protected critHUD: Label;

    // leveling
    private levelUpLayer: Layer;
    protected levelChanged: number = 0;
    protected levelReceiver: Receiver;
    protected button1: UIElement;
    protected button2: UIElement;
    protected button3: UIElement;
    protected item1: Sprite;
    protected item2: Sprite;
    protected item3: Sprite;

    finishedLevel: boolean = false;

    protected itemSelectButton: UIElement;
    protected itemSelectButtonLabel: Sprite;

    protected playerDied: boolean = false;

    //Rhea statue
    protected rheaStatue: AnimatedSprite;
    protected rheaStatueCooldown: Timer = new Timer(5000);
    protected rheaStatueZone: Graphic;
    protected rheaStatueHeal: number = 25;
    protected rheaStatueUsed: boolean = false;

    protected levelMusic: string;

    protected projetiles: Array<AnimatedSprite> = [];

    // items
    protected itemsArray = ["honey_jar", "fractured_aegis", "poisoned_goblet",
        "hourglass_", "hermes_sandals_", "bolt_", "goblet_of_dionysus_", "aegis_", "artemis_bow_"]; // "_" means chance to roll 1/2/3
    protected selectionArray: Array<string> = [];
    protected itemConstructorPairings: Map<string,any> = new Map([["honey_jar", HoneyJar], ["fractured_aegis", FracturedAegis], ["poisoned_goblet", PoisonedGoblet],
        ["hourglass_1" , Hourglass1], ["hermes_sandals_1", HermesSandals1], ["bolt_1", Bolt1], ["goblet_of_dionysus_1", Goblet1], ["aegis_1", Aegis1], ["artemis_bow_1", ArtemisBow1],
        ["hourglass_2" , Hourglass2], ["hermes_sandals_2", HermesSandals2], ["bolt_2", Bolt2], ["goblet_of_dionysus_2", Goblet2], ["aegis_2", Aegis2], ["artemis_bow_2", ArtemisBow2],
        ["hourglass_3" , Hourglass3], ["hermes_sandals_3", HermesSandals3], ["bolt_3", Bolt3], ["goblet_of_dionysus_3", Goblet3], ["aegis_3", Aegis3], ["artemis_bow_3", ArtemisBow3],
    ]);

    //Sprite to hold weapon icon
    protected battleManager: BattleManager;
    protected weaponIcon: Sprite;
    protected weaponIconCoolDown: Graphic;

    // Tilemap walls
    protected walls: OrthogonalTilemap;

    //Sprite to hold the challenge
    protected challenge: Sprite;

    // Cheats
    protected invincible: boolean;
    protected unlockAll: boolean;
    protected instant_kill: boolean;
    protected speedUp: boolean;
    protected unlockedLevels: boolean[];

    private numEnemiesLabel: Label;

    loadScene(): void {
        // Objects
        this.load.object("weaponData", "project_assets/data/weaponData.json");

        // Spritesheets
        this.load.spritesheet("slice", "project_assets/spritesheets/slice.json");
        this.load.spritesheet("leaf", "project_assets/spritesheets/Leaf.json");
        this.load.spritesheet("rheaStatue", "project_assets/spritesheets/RheaStatue.json");
        this.load.spritesheet("critText", "project_assets/spritesheets/critText.json");
        
        // Images
        this.load.image("pause_screen", "project_assets/screens/pause.png");
        this.load.image("knife", "project_assets/sprites/knife.png");
        
        // Import upgrade icons
        this.load.image("honey_jar", "project_assets/sprites/honeyJar.png");
        this.load.image("fractured_aegis", "project_assets/sprites/fractured_aegis.png");
        this.load.image("poisoned_goblet", "project_assets/sprites/poisoned_goblet.png");

        this.load.image("aegis_1", "project_assets/sprites/aegis_1.png");
        this.load.image("artemis_bow_1", "project_assets/sprites/artemis_bow1.png");
        this.load.image("bolt_1", "project_assets/sprites/bolt_1.png");
        this.load.image("goblet_of_dionysus_1", "project_assets/sprites/goblet_1.png");
        this.load.image("hermes_sandals_1", "project_assets/sprites/hermes_sandals_1.png");
        this.load.image("hourglass_1", "project_assets/sprites/hourglass_1.png");

        this.load.image("aegis_2", "project_assets/sprites/aegis_2.png");
        this.load.image("artemis_bow_2", "project_assets/sprites/artemis_bow2.png");
        this.load.image("bolt_2", "project_assets/sprites/bolt_2.png");
        this.load.image("goblet_of_dionysus_2", "project_assets/sprites/goblet_2.png");
        this.load.image("hermes_sandals_2", "project_assets/sprites/hermes_sandals_2.png");
        this.load.image("hourglass_2", "project_assets/sprites/hourglass_2.png");


        this.load.image("aegis_3", "project_assets/sprites/aegis_3.png");
        this.load.image("artemis_bow_3", "project_assets/sprites/artemis_bow3.png");
        this.load.image("bolt_3", "project_assets/sprites/bolt_3.png");
        this.load.image("goblet_of_dionysus_3", "project_assets/sprites/goblet_3.png");
        this.load.image("hermes_sandals_3", "project_assets/sprites/hermes_sandals_3.png");
        this.load.image("hourglass_3", "project_assets/sprites/hourglass_3.png");

        this.load.image("evolvedWeapon", "project_assets/sprites/evolved_weapon.png");

        this.load.image("itemSelectButton", "project_assets/sprites/itemSelectButton.png");

        //Load sound effect and music
        this.load.audio("enemyDamaged", "project_assets/sounds/enemyDamage.wav");
        this.load.audio("levelup", "project_assets/sounds/levelup.wav");
        this.load.audio("death", "project_assets/sounds/death.wav");
        this.load.audio("heal", "project_assets/sounds/heal.wav");
        this.load.audio("shoot", "project_assets/sounds/shoot.wav")
    }
    
    
    startScene(): void {
        //Initialize the possible spawning areas for enemies
        //Each Vec2 holds the pixels that will be added to the center of the viewport so enemies spawn outside
        //View port is 800x450
        this.enemySpawns = new Array<Vec2>();
        this.enemyArray = new Array<AnimatedSprite>();
        this.enemySpawns.push(new Vec2(-425, 0)); //Left of viewport
        this.enemySpawns.push(new Vec2(425, 0)); //Right of viewport
        this.enemySpawns.push(new Vec2(0, -245)); //Top of viewport
        this.enemySpawns.push(new Vec2(0, 245)); //Bottom of viewport      
        
        this.battleManager = new BattleManager();
        this.levelReceiver = new Receiver();
        this.levelReceiver.subscribe(["one", "two", "three"]);
        this.subscribeToEvents();
        this.addUILayer("gui");

        this.numEnemiesLabel = <Label>this.add.uiElement(UIElementType.LABEL, "gui", {position: new Vec2(this.viewport.getHalfSize().x, 35), text: `Enemies Left: ${this.currentNumEnemies}`})

        this.addUILayer("pause").disable();
        let pauseScreen = this.add.sprite("pause_screen", "pause");
        pauseScreen.position.copy(this.viewport.getOrigin());
        pauseScreen.alpha = .5;        

        //Level up UI
        this.levelUpLayer = this.addUILayer("levelUp");
        let dim = this.add.graphic(GraphicType.RECT, "levelUp", { position: this.viewport.getOrigin(), size: new Vec2(this.viewport.getHalfSize().x*2, 
            this.viewport.getHalfSize().y*2) });
        dim.color = Color.BLACK;
        dim.alpha = .5;
        this.levelUpLayer.disable();

        //Character health and level
        let healthBarBorder = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(196, 16), 
            size: new Vec2(256, 8)});
        healthBarBorder.alpha = .5;
        let expBarBorder = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(216, 32), 
            size: new Vec2(216, 4)});
        expBarBorder.color = Color.LIGHTBLUE;
        expBarBorder.alpha = .5;
        //Health Bar 
        this.healthBar = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(196, 16), 
            size: new Vec2(256, 8)});
        //Health Bar follows below character

        //Experience bar
        this.expBar = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(216, 32), 
            size: new Vec2(0, 0)});
        this.expBar.color = Color.BLUE;

        // Inventory Box Label
        let inventoryBorder = this.add.graphic(GraphicType.RECT, "gui", {position: new Vec2(this.viewport.getHalfSize().x + 216.5, this.viewport.getHalfSize().y - 179), 
            size: new Vec2(320, 158)});
        inventoryBorder.color = Color.BLACK;
        inventoryBorder.alpha = .5;

        this.button1 = this.add.uiElement(UIElementType.BUTTON, "levelUp", {
            position: new Vec2((this.viewport.getOrigin().x - this.viewport.getHalfSize().x/2), this.viewport.getOrigin().y), text: ""
          });
          this.button1.size.set(144, 144);
          this.button1.borderWidth = 10;
          this.button1.borderRadius = 10;
          this.button1.borderColor = Color.WHITE;
          this.button1.backgroundColor = Color.GRAYISH;
          //this.button1.onClickEventId = "one";
          this.button1.onClick = () => {
              this.button1.borderColor = Color.GOLDEN_YELLOW;
              this.button2.borderColor = Color.WHITE;
              this.button3.borderColor = Color.WHITE;

              this.itemSelectButton.onClickEventId = "one";
          }

          this.button2 = this.add.uiElement(UIElementType.BUTTON, "levelUp", {
            position: new Vec2((this.viewport.getOrigin().x), this.viewport.getOrigin().y), text: ""
          });
          this.button2.size.set(144, 144);
          this.button2.borderWidth = 10;
          this.button2.borderRadius = 10;
          this.button2.borderColor = Color.WHITE;
          this.button2.backgroundColor = Color.GRAYISH;
          //this.button2.onClickEventId = "two";
          this.button2.onClick = () => {
            this.button1.borderColor = Color.WHITE;
            this.button2.borderColor = Color.GOLDEN_YELLOW;
            this.button3.borderColor = Color.WHITE;

            this.itemSelectButton.onClickEventId = "two";
        }

          this.button3 = this.add.uiElement(UIElementType.BUTTON, "levelUp", {
            position: new Vec2((this.viewport.getOrigin().x + this.viewport.getHalfSize().x/2), this.viewport.getOrigin().y), text: ""
          });
          this.button3.size.set(144, 144);
          this.button3.borderWidth = 10;
          this.button3.borderRadius = 10;
          this.button3.borderColor = Color.WHITE;
          this.button3.backgroundColor = Color.GRAYISH;
          //this.button3.onClickEventId = "three";
          this.button3.onClick = () => {
            this.button1.borderColor = Color.WHITE;
            this.button2.borderColor = Color.WHITE;
            this.button3.borderColor = Color.GOLDEN_YELLOW;

            this.itemSelectButton.onClickEventId = "three";
        }

          this.itemSelectButton = this.add.uiElement(UIElementType.BUTTON, "levelUp", {
            position: new Vec2((this.viewport.getOrigin().x), this.viewport.getOrigin().y + 128), text: ""
        });
          this.itemSelectButton.size.set(256, 128);
          this.itemSelectButton.borderWidth = 10;
          this.itemSelectButton.borderRadius = 10;
          this.itemSelectButton.borderColor = Color.WHITE;
          this.itemSelectButton.backgroundColor = Color.GRAYISH;
          this.itemSelectButtonLabel = this.add.sprite("itemSelectButton", "levelUp");
          this.itemSelectButtonLabel.position = new Vec2(this.viewport.getOrigin().x+5, this.itemSelectButton.position.y);

          this.createChallengeLabel("objective");

          let HUD = this.addUILayer("HUD");
          HUD.setDepth(999);
        HUD.disable();

          // player stats HUD
          this.hpHUD = <Label> this.add.uiElement(UIElementType.LABEL, "HUD", { position: new Vec2(this.viewport.getOrigin().x-350,
            this.viewport.getOrigin().y-100), text: "HP: "});
          this.hpHUD.textColor = Color.WHITE;
          this.hpHUD.setHAlign(HAlign.LEFT);

          this.attHUD = <Label> this.add.uiElement(UIElementType.LABEL, "HUD", { position: new Vec2(this.viewport.getOrigin().x-350,
            this.viewport.getOrigin().y-50), text: "ATT: "});
          this.attHUD.textColor = Color.WHITE;
          this.attHUD.setHAlign(HAlign.LEFT);

          this.cdHUD = <Label> this.add.uiElement(UIElementType.LABEL, "HUD", { position: new Vec2(this.viewport.getOrigin().x-350,
            this.viewport.getOrigin().y), text: "CDown: "});
          this.cdHUD.textColor = Color.WHITE;
          this.cdHUD.setHAlign(HAlign.LEFT);

          this.defHUD = <Label> this.add.uiElement(UIElementType.LABEL, "HUD", { position: new Vec2(this.viewport.getOrigin().x-350,
            this.viewport.getOrigin().y+50), text: "DEF: "});
          this.defHUD.textColor = Color.WHITE;
          this.defHUD.setHAlign(HAlign.LEFT);

          this.spdHUD = <Label> this.add.uiElement(UIElementType.LABEL, "HUD", { position: new Vec2(this.viewport.getOrigin().x-350,
            this.viewport.getOrigin().y+100), text: "SPD: "});
          this.spdHUD.textColor = Color.WHITE;
          this.spdHUD.setHAlign(HAlign.LEFT);

          this.critHUD = <Label> this.add.uiElement(UIElementType.LABEL, "HUD", { position: new Vec2(this.viewport.getOrigin().x-350,
            this.viewport.getOrigin().y+150), text: "CRIT: "});
          this.critHUD.textColor = Color.WHITE;
          this.critHUD.setHAlign(HAlign.LEFT);

          this.populateInitInventory();
    
    }

    updateScene(deltaT: number): void {
        // pause via escape
        if (Input.isKeyJustPressed("escape")){
            this.pauseFlag = !this.pauseFlag;

            if (this.pauseFlag){
                this.pauseEntities();
                this.getLayer("pause").enable();
                this.populateHUD();
                this.getLayer("HUD").enable();
            } else {
                this.unpauseEntities();
                this.getLayer("pause").disable();
                this.getLayer("HUD").disable();
            }

        }

        // handle leveling up
        if (this.levelChanged) {
            // level up events
            while(this.levelReceiver.hasNextEvent()){

                let event = this.levelReceiver.getNextEvent();
                
                switch (event.type) {
                        
                    case "one":

                        let item = new (this.itemConstructorPairings.get(this.selectionArray[0]))(new Sprite(this.selectionArray[0]));
                        item.use(this.player, this.playerController.weapon, this.playerStats, this.playerController);
                        this.button1.borderColor = Color.WHITE;
                        this.populateInventory(this.selectionArray[0]);
                        this.removeLunar(this.selectionArray[0]);
                        break;

                    case "two":

                        let item2 = new (this.itemConstructorPairings.get(this.selectionArray[1]))(new Sprite(this.selectionArray[1]));
                        item2.use(this.player, this.playerController.weapon, this.playerStats, this.playerController);
                        this.button2.borderColor = Color.WHITE;
                        this.populateInventory(this.selectionArray[1]);
                        this.removeLunar(this.selectionArray[1]);
                        break;

                    case "three":

                        let item3 = new (this.itemConstructorPairings.get(this.selectionArray[2]))(new Sprite(this.selectionArray[2]));
                        item3.use(this.player, this.playerController.weapon, this.playerStats, this.playerController);
                        this.button3.borderColor = Color.WHITE;
                        this.populateInventory(this.selectionArray[2]);
                        this.removeLunar(this.selectionArray[2]);
                        break;

                }

                this.itemSelectButton.onClickEventId = "";

                this.getLayer("levelUp").removeNode(this.item1);
                this.getLayer("levelUp").removeNode(this.item2);
                this.getLayer("levelUp").removeNode(this.item3);

                this.populateHUD();

                this.levelChanged--;
                // accounting for multiple levels
                if (this.levelChanged){
                    this.rollItems();
                }  
            }

            if (this.levelChanged === 0){
                this.pauseFlag = !this.pauseFlag;
                this.getLayer("levelUp").disable();
                this.unpauseEntities();  
                this.getLayer("HUD").disable();      
            }
            
        }

        // main events
        this.numEnemiesLabel.text = `Enemies Left: ${this.currentNumEnemies}`
        while (this.receiver.hasNextEvent() && !this.pauseFlag) {
            let event = this.receiver.getNextEvent();

            switch (event.type) {

                case Project_Events.ENEMYDIED:
                    // remove enemy from both arrays

                    const enemy = <CanvasNode>event.data.get("enemy");
                    if (!enemy._ai){
                        break;
                    }
                    const enemyExperience = (<EnemyAI>enemy._ai).experience;
                    const scaledExp = Math.pow(this.playerStats.level, 1.05) * enemyExperience; // exp scaling
                    this.battleManager.enemies = this.battleManager.enemies.filter(enemy => enemy !== <BattlerAI>(event.data.get("enemy")._ai));
                    this.enemyArray = this.enemyArray.filter(enemy => enemy !== (event.data.get("enemy")));
                    enemy.destroy();
                    this.currentNumEnemies -= 1;
                    this.playerStats.gainedExperience(scaledExp);

                    //Update the exp bar
                    const reqExp = 1000 * Math.pow(this.playerStats.level, 1.3);
                    let expPercentage = this.playerStats.experience / reqExp;
                    this.expBar.size = new Vec2(expPercentage*216, 4);
                    this.expBar.position = new Vec2(108*expPercentage+(216/2), 32);

                    break;

                case Project_Events.HEALTHCHANGED:

                    // update health bar
                    let percentage = this.playerStats.stats.health/this.playerStats.stats.maxHealth;
                    // scale by percentage
                    this.healthBar.size = new Vec2(percentage*256, 8);
                    // rebalance position
                    this.healthBar.position = new Vec2(196 + (percentage-1)*128,16);
                    this.healthNumber.text = `${this.playerStats.stats.health.toFixed(2)} / ${this.playerStats.stats.maxHealth}`
                    break;

                case Project_Events.LEVELUP:

                    this.pauseFlag = !this.pauseFlag;
                    this.pauseEntities();
                    this.populateHUD();
                    this.getLayer("HUD").enable();

                    //show layer
                    this.getLayer("levelUp").enable();
                    this.levelChanged = event.data.get("levelChange");
                    this.levelUI.text = "Lvl" + this.playerStats.level;
                    this.rollItems();

                    if(this.playerStats.level >= 5 && !this.upgradedWeapon){
                        this.upgradedWeapon = true;
                        this.createChallengeLabel("evolvedWeapon");
                    }
                    break;

                case Project_Events.BOSSDIED:
                    const boss = <CanvasNode>event.data.get("enemy");
                    this.currentNumEnemies -= 1;
                    this.battleManager.enemies = this.battleManager.enemies.filter(enemy => enemy !== <BattlerAI>(boss._ai));
                    this.enemyArray = this.enemyArray.filter(enemy => enemy !== boss);
                    this.bossDefeated = true;
                    boss.destroy();
                    break;
                case Project_Events.MELEEATTACK:
                    //handle removing attack sprite
                    let attackSprite = event.data.get("owner");
                    attackSprite.destroy();     
                    break;
                case Project_Events.CRITHIT:
                    let position = event.data.get("position");
                    position.y -= 32;
                    let crit = this.add.animatedSprite("critText", "primary");
                    crit.position = position;
                    crit.animation.play("crit", false, Project_Events.CRITEND);
                    break;
                case Project_Events.CRITEND:
                    let critText = event.data.get("owner");
                    critText.destroy(); 
                    break;
            }
        }    

        

        //Rhea statue
        if(this.rheaStatueCooldown.isStopped() && !this.rheaStatueUsed){
            if (this.rheaStatueZone.boundary.overlapArea(this.player.boundary) && this.playerStats.stats.health < this.playerStats.stats.maxHealth) {
                this.rheaStatue.animation.play("heal");
                this.rheaStatue.animation.queue("used");
                this.playerStats.editHealth(this.playerStats.stats.maxHealth * 0.2);
                this.emitter.fireEvent(Project_Events.HEALTHCHANGED);
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "heal", loop: false, holdReference: false});
                this.rheaStatueCooldown.start();
            } else this.rheaStatue.animation.playIfNotAlready("idle");
        }
        
        //Update the weapon cooldown icon *** Hades will use a different timer ***
        let timer = this.playerController.weapon === null ? (<HadesController> this.playerController).attackCooldown : this.playerController.weapon.cooldownTimer;
        const weaponTimeLeft = timer.getTimeLeft();
        const weaponTotalTime = timer.getTotalTime();
        const timePercentage = weaponTimeLeft/weaponTotalTime;
        if(timePercentage > 0){
            this.weaponIconCoolDown.alpha = 0.5;
        } else {
            this.weaponIconCoolDown.alpha = 0;
        }

        this.weaponIconCoolDown.size = new Vec2(32, (1-timePercentage)*32);
        this.weaponIconCoolDown.position = new Vec2(48, 24+(timePercentage*16));

        // prevents the player from going out of bounds
        this.lockPlayer();   

        //Check if player died
        if(this.playerStats.stats.health <= 0){
            if(this.changeLevelTimer.isStopped() && !this.playerDied) {
                this.changeLevelTimer = new Timer(5000);
                this.changeLevelTimer.start();
                this.playerDied = true;
                this.pauseEntities();
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "death", loop: false, holdReference: false});
                this.player.tweens.add("flyup", {
                    startDelay: 0,
                    duration: 2000,
                    effects: [
                        {
                            property: TweenableProperties.posY,
                            start: this.player.position.y,
                            end: this.player.position.y-64,
                            ease: EaseFunctionType.OUT_SINE
                        }, 
                    ],
                });
                this.player.tweens.add("spin", {
                    startDelay: 2000,
                    duration: 2500,
                    effects: [
                        {
                            property: TweenableProperties.alpha,
                            start: 1,
                            end: 0,
                            ease: EaseFunctionType.OUT_SINE
                        },
                        {
                            property: "rotation",
                            resetOnComplete: false,
                            start: 0,
                            end: 16*Math.PI,
                            ease: EaseFunctionType.IN_OUT_QUAD
                        }

                    ]
                });
                this.player.tweens.play("flyup");
                this.player.tweens.play("spin");

            }
            
            if(this.changeLevelTimer.getTimeLeft() <= 0) {
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.levelMusic});
                this.viewport.setSize(1600, 900);
                this.cleanUp();
                this.sceneManager.changeToScene(DeathScreen, {
                    invincible: this.invincible, 
                    unlockAll: this.unlockAll,
                    instant_kill: this.instant_kill,
                    speedUp: this.speedUp,
                    unlockedLevels: this.unlockedLevels
                });
            }
        }
    }

    protected pauseEntities(){
        this.startSceneTimer.pause();
        if(this.enemyArray.length > 0){
            this.enemyArray.map((enemy) => {
                enemy.freeze()
                enemy.setAIActive(false, {});
                enemy.animation.stop();
            });
        }
        this.player.freeze();
        this.player.setAIActive(false, {});
        this.player.animation.stop();

        if(this.gameTimer != undefined){
            this.gameTimer.pause();
        }

        if(this.rheaStatueCooldown != undefined) {
            this.rheaStatueCooldown.pause();
        }

        //Freeze all visible projetiles
        for(let p of this.projetiles){
            if(this.sceneGraph.getNode(p.id) != undefined){
                if(p.visible){
                    p.freeze();
                    p.setAIActive(false, {});
                    (<ProjectileAI>p._ai).pause();
                }
            }
        }
        // this.emitter.fireEvent(Project_Events.GAMEPAUSE);
    }

    protected unpauseEntities(){
        console.log("UNPAUSE");
        console.log(this.enemyArray);
        this.startSceneTimer.unpause();

        if(this.enemyArray.length > 0){
            this.enemyArray.map((enemy) => {
                enemy.unfreeze();
                enemy.setAIActive(true, {});
                enemy.animation.play("moving", true);
            });
        }
        
        this.player.unfreeze();
        this.player.setAIActive(true, {});
        this.player.animation.play("idle", true); 

        if(this.gameTimer != undefined){
            this.gameTimer.unpause();
        }

        if(this.rheaStatueCooldown != undefined) {
            this.rheaStatueCooldown.unpause();
        }

        //Unfreeze all projetiles
        //Freeze all visible projetiles
        for(let p of this.projetiles){
            if(this.sceneGraph.getNode(p.id) != undefined){
                if(p.visible){
                    p.unfreeze();
                    p.setAIActive(true, {});
                    (<ProjectileAI>p._ai).unpause();
                }
            }
        }
        // this.emitter.fireEvent(Project_Events.GAMEUNPAUSE);
    }

    protected cleanUp(): void{
        // UI stuff
        // this.healthBar.destroy();
        // this.expBar.destroy();

        //Remove all enemies from the level
        if(this.enemyArray.length > 0){
            this.enemyArray.map((enemy) => {
                enemy.freeze()
                enemy.setAIActive(false, {});
                enemy.animation.stop();
                enemy.visible = false;
                enemy.position = Vec2.ZERO
            });
            this.currentNumEnemies = 0;
            this.battleManager.enemies = [];
        }

        // extraneous things like receivers that must be destroyed
        this.levelReceiver.destroy();
    }

    // main events
    protected subscribeToEvents(): void {
        this.receiver.subscribe ([
            Project_Events.ENEMYDIED, 
            Project_Events.HEALTHCHANGED, 
            Project_Events.LEVELUP,
            Project_Events.BOSSDIED,
            Project_Events.MELEEATTACK,
            Project_Events.CRITHIT,
            Project_Events.CRITEND
        ]);
    }

    // keeps players in bounds
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

    // check map bounds for spawning enemies
    protected boundaryCheck(viewportCenter: Vec2, postion: Vec2){
        return (viewportCenter.x + postion.x < 16 
        || viewportCenter.x + postion.x > 64*32-16
        || viewportCenter.y + postion.y < 32 
        || viewportCenter.y + postion.y > 64*32-32);
    }

    protected addEnemy(spriteKey: string, options: Record<string, any>): AnimatedSprite{
        options.health *= (Math.pow(1.05, this.playerStats.level));
        let enemy = this.add.animatedSprite(spriteKey, "primary");

        enemy.scale.set(1,1);
        // Adjust collision shape size based on type of enemy
        switch (spriteKey) {
            case "snake":
            case "crab":
                enemy.addPhysics(new AABB(Vec2.ZERO, new Vec2(8,8)));
                break;
            case "octopus":
            case "Skull":
            case "harpy":
                enemy.addPhysics(new AABB(Vec2.ZERO, new Vec2(12,12)));
                break;
            case "Witch":
                enemy.addPhysics(new AABB(Vec2.ZERO, new Vec2(12,16)));
                break;
            case "Hellhound":
                enemy.addPhysics(new AABB(Vec2.ZERO, new Vec2(16,12)));
                break;
            case "giant":
            case "cyclops":
                enemy.addPhysics(new AABB(Vec2.ZERO, new Vec2(16,16)));
                break;
            default:
                break;
        }
        
        enemy.animation.play("moving");
        enemy.position = options.position;
        enemy.addAI(options.ai, options);
        enemy.setGroup("enemy");
        this.currentNumEnemies += 1;

        if(this.battleManager.enemies === undefined){
            this.battleManager.setEnemies([<BattlerAI>enemy._ai])
        } else {
            this.battleManager.enemies.push(<BattlerAI>enemy._ai);
        }

        return enemy;
    }

    /**
     * 
     * Creates and returns a new weapon
     * @param type The weaponType of the weapon, as a string
     */
    createWeapon(type: string): Weapon {
        let weaponType = <WeaponType>RegistryManager.getRegistry("weaponTypes").get(type);
        
        let sprite = this.add.sprite(weaponType.spriteKey, "primary");

        return new Weapon(sprite, weaponType, this.battleManager);
    }

    /**
     * Initalizes all weapon types based of data from weaponData.json
     */
    initializeWeapons(): void{
        let weaponData = this.load.getObject("weaponData");

        for(let i = 0; i < weaponData.numWeapons; i++){
            let weapon = weaponData.weapons[i];
            // Get the constructor of the prototype
            let constr = RegistryManager.getRegistry("weaponTemplates").get(weapon.weaponType);

            // Create a weapon type
            let weaponType = new constr();

            // Initialize the weapon type
            weaponType.initialize(weapon);

            // Register the weapon type
            RegistryManager.getRegistry("weaponTypes").registerItem(weapon.name, weaponType)
        }
    }

    createProjectiles(number: number, sprite: string): Array<AnimatedSprite> {
        let ai; // custom projectile support
        let scaleSize = new Vec2(1, 1); // if you want to make projectiles larger
        let hitboxSize = new Vec2(32, 32); // custom hitboxes
        let speed = 3.5; // custom speed base of 4
        switch (sprite){
            case "fireball":
                ai = FireballAI;
                break;
            case "CerberusFireball":
                sprite = "fireball";
                ai = CerberusFireballAI;
                scaleSize.x = 2;
                scaleSize.y = 2;
                speed = 2;
                break;
            case "venom":
                ai= VenomAi;
                speed = 4;
                break;
            case "blast":
                ai = BlastAI;
                speed = 4;
                break;
            case "blastV2":
                ai = BlastV2AI;
                speed = 4;
                break;
            case "feather":
                ai = ProjectileAI;
                break;
            case "ink":
                ai = ProjectileAI;
                break;
            case "Hex":
                ai = ProjectileAI;
                break;
            case "rock":
                ai = RockAI;
                speed = 3
                break;
            default:
                return null;
        }

        let projectiles = new Array(number);
        for (let i = 0; i < number; i++) {
            projectiles[i] = this.add.animatedSprite(sprite, "primary");
            this.projetiles.push(projectiles[i]);
            projectiles[i].position = new Vec2(0, 0);
            projectiles[i].visible = false;
            (<AnimatedSprite>projectiles[i]).scale.set(scaleSize.x, scaleSize.y);
       
            projectiles[i].addAI(ai, {speed: speed, player: this.player, enemies: this.enemyArray});
            projectiles[i].addPhysics(new AABB(Vec2.ZERO, hitboxSize));
            // Check direction of projectile before playing animation
            projectiles[i].animation.playIfNotAlready("shoot", true);
            projectiles[i].setGroup("projectile");
        }
        return projectiles;
    }

    protected rollItems() : void{
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "levelup", loop: false, holdReference: false});
        this.selectionArray = [];

        let rolledItem;
        let tier;
        let dupes = [];

        if(this.playerStats.stats.health >= this.playerStats.stats.maxHealth){ // filter out heal if full hp
            this.itemsArray = this.itemsArray.filter(item => item !== "honey_jar");
            dupes.push("honey_jar");
        }

        while (this.selectionArray.length < 3){
            

            rolledItem = this.itemsArray[Math.floor(Math.random() * this.itemsArray.length)];

            // remove dupe
            this.itemsArray.splice(this.itemsArray.indexOf(rolledItem), 1);
            dupes.push(rolledItem);

            // roll the tier if applicable
            if (rolledItem.charAt(rolledItem.length-1) === "_"){

                tier = Math.random();
                if (tier < .7){
                    rolledItem = rolledItem.concat("1");
                } else if (tier < .9){
                    rolledItem = rolledItem.concat("2");
                } else {
                    rolledItem = rolledItem.concat("3");
                }

            }

            this.selectionArray.push(rolledItem);
        }

        // remerge dupes into choices
        this.itemsArray = this.itemsArray.concat(dupes);
        
        this.item1 = new Sprite(this.selectionArray[0]);
        this.item1.position = new Vec2(this.button1.position.x, this.button1.position.y);
        this.item2 = new Sprite(this.selectionArray[1]);
        this.item2.position = new Vec2(this.button2.position.x, this.button2.position.y);
        this.item3 = new Sprite(this.selectionArray[2]);
        this.item3.position = new Vec2(this.button3.position.x, this.button3.position.y);

        this.getLayer("levelUp").addNode(this.item1);
        this.getLayer("levelUp").addNode(this.item2);
        this.getLayer("levelUp").addNode(this.item3);
  
    }

    protected randomSpawn(): Vec2 {
        // randomly select one of the spawnpoints outside the viewport;
        let spawnPointIndex = Math.floor(Math.random() * 4);
        let viewportCenter = this.viewport.getCenter();
        let enemyPosition;
        // console.log(this.boundaryCheck(viewportCenter, this.enemySpawns[spawnPointIndex]));
        // return this.player.position.clone();
        //check if spawn position is out of bounds
        while(true){
            if(this.boundaryCheck(viewportCenter, this.enemySpawns[spawnPointIndex])){
                spawnPointIndex = (spawnPointIndex + 1) % 4;
            } else {
                // find a random x or y of that side
                if(this.enemySpawns[spawnPointIndex].x === 0){
                    //along top or bottom
                    let xOffset = Math.floor(Math.random() * 736) - 368
                    enemyPosition = new Vec2(viewportCenter.x + xOffset, viewportCenter.y + this.enemySpawns[spawnPointIndex].y);
                } else {
                    let yOffset =Math.floor(Math.random() * 386) - 193
                    enemyPosition = new Vec2(viewportCenter.x + this.enemySpawns[spawnPointIndex].x,viewportCenter.y + yOffset);
                }
                // //Check if spawn positon is a wall
                let spawnTile = this.walls.getColRowAt(enemyPosition);
                let tile = this.walls.getTileAtRowCol(spawnTile);
                if(tile === 0){
                    return enemyPosition;                    
                } else {
                    spawnPointIndex = (spawnPointIndex + 1) % 4;
                }
            }
        }
    }

    protected parseTimeLeft(timeLeft: number): string{
        let seconds = Math.floor((timeLeft / 1000) % 60),
        minutes = Math.floor((timeLeft / (1000 * 60)) % 60)
        return `${minutes}:${(seconds < 10) ? "0" + seconds : seconds}`
    }

    protected createChallengeLabel(key: string): void{
        //make the challenge label
        this.challenge = this.add.sprite(key, "gui");
        this.challenge.position = new Vec2(this.viewport.getHalfSize().x, 100);
        this.challenge.tweens.add("fadeIn",{
            startDelay: 0,
            duration: 2500,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 0,
                    end: 1,
                    ease: EaseFunctionType.OUT_SINE
                }
            ],
        });
        this.challenge.tweens.add("fadeOut",{
            startDelay: 2500,
            duration: 2500,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.OUT_SINE
                }
            ],
        });
        this.challenge.tweens.play("fadeIn");
        this.challenge.tweens.play("fadeOut");
    }

    protected populateHUD(): void{

        const attackString = (this.playerController.weapon) ? this.playerController.weapon.type.damage :
        (<FireballAI>((<HadesController>this.playerController).projectiles[0]._ai)).getDamage();

        const cDownString = (this.playerController.weapon) ? (this.playerController.weapon.type.cooldown/1000) :
        ((<HadesController> this.playerController).attackCooldown.getTotalTime()/1000);

        this.hpHUD.setText("HP: " + this.playerStats.stats.maxHealth.toFixed(2).toString());
        
        this.attHUD.setText("ATT: " + attackString.toFixed(2).toString());

        this.cdHUD.setText("CDOWN: " + cDownString.toFixed(2).toString());

        this.defHUD.setText("DEF: " + this.playerStats.stats.defense.toFixed(2).toString());

        this.spdHUD.setText("SPD: " + this.playerStats.stats.speed.toFixed(2).toString());

        this.critHUD.setText("CRIT: " + this.playerStats.stats.critRate.toFixed(2).toString());
    }

    protected populateInventory(item: string): void {

        if (!this.inventory){
            this.inventory = []; // if undefined
        }
        
        const found = this.inventory.findIndex(i => i.name === item);

        if (found === -1){
            // first pickup

            let startPosx;
            let startPosy;

            if (this.inventory.length === 0){ // first item added to inventory
                startPosx = this.viewport.getHalfSize().x+75;
                startPosy = this.viewport.getHalfSize().y-200;
            } else { // move it over
                startPosx = (this.inventory.length % 8 === 0) ? this.inventory[0].pos.x : this.inventory[this.inventory.length-1].pos.x + 40;
                startPosy = (this.inventory.length % 8 === 0) ? this.inventory[this.inventory.length-1].pos.y + 40 :
                 this.inventory[this.inventory.length-1].pos.y;
            }

            let graphic: InventoryItemGraphic = {
                name: item,
                sprite: this.add.sprite(item, "gui"),
                count: 1,
                countLabel: <Label> this.add.uiElement(UIElementType.LABEL, "gui", { position: new Vec2(startPosx+15, startPosy+15), 
                text: "x1"}),
                pos: new Vec2(startPosx, startPosy)
            }

            graphic.sprite.scale.set(.45, .45); // icon 
            graphic.sprite.position = graphic.pos;

            graphic.countLabel.setTextColor(Color.WHITE); // label
            graphic.countLabel.fontSize = 16;

            this.inventory.push(graphic);
        } else { // increment the count and change the label
            let icon = this.inventory[found];
            icon.count += 1;
            icon.countLabel.destroy();
            icon.countLabel = <Label> this.add.uiElement(UIElementType.LABEL, "gui", { position: new Vec2(
                icon.pos.x + 15, icon.pos.y+15
            ), text: "x" + icon.count });
            icon.countLabel.setTextColor(Color.WHITE);
            icon.countLabel.fontSize = 16;
        }
    }

    protected populateInitInventory(): void{
        if (this.inventory && this.inventory !== []){ // if we carried over an inventory

            for (let item of this.inventory){
                item.sprite = this.add.sprite(item.name, "gui");
                item.sprite.scale.set(.45,.45);
                item.sprite.position = item.pos;

                item.countLabel = <Label> this.add.uiElement(UIElementType.LABEL, "gui", { position: new Vec2(item.pos.x+15, item.pos.y+15), 
                    text: `x${item.count}`}),
                item.countLabel.setTextColor(Color.WHITE);
                item.countLabel.fontSize = 16;
            }

        }
       
    }

    protected removeLunar(item: string): void{
        if (item === "fractured_aegis"){
            this.itemsArray.splice(this.itemsArray.indexOf("fractured_aegis"), 1);
        }

        if (item === "poisoned_goblet"){
            this.itemsArray.splice(this.itemsArray.indexOf("poisoned_goblet"), 1);
        }
    }



}