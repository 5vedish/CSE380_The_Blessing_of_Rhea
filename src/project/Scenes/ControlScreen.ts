import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import MainMenu from "./MainMenu";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Tutorial from "./Tutorial";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class ControlScreen extends Scene {
  private splashScreen: Layer;
  private bg: Sprite;

  private controlScreen: Layer;
  private controlsText: Sprite;
  private WASD: Sprite;
  private click: Sprite;
  private escape: Sprite;
  private tutorial: Sprite;
  private back: Sprite;

  private invincible: boolean;
  private unlockAll: boolean;
  private instant_kill: boolean;
  private speedUp: boolean;
  private unlockedLevels: boolean[];


  initScene(init: Record<string, any>): void {
    this.invincible = init.invincible;
    this.unlockAll = init.unlockAll;
    this.instant_kill = init.instant_kill;
    this.speedUp = init.speedUp;
    this.unlockedLevels = init.unlockedLevels;
  }

  loadScene() {
    this.load.image("splash_screen", "project_assets/screens/Splash.png");
    this.load.image("controlsText", "project_assets/sprites/controlsText.png");
    this.load.image("wasd", "project_assets/sprites/WASD.png");
    this.load.image("click", "project_assets/sprites/click.png");
    this.load.image("escape", "project_assets/sprites/escape.png");
    this.load.image("tutorialLevel", "project_assets/sprites/tutorialLevel.png");
    this.load.image("back", "project_assets/sprites/back.png");
    this.load.audio("click", "project_assets/sounds/click.wav");

    //Item imgs
    this.load.image("aegis_1", "project_assets/sprites/aegis_1.png");
    this.load.image("artemis_bow_1", "project_assets/sprites/artemis_bow1.png");
    this.load.image("bolt_1", "project_assets/sprites/bolt_1.png");
    this.load.image("goblet_of_dionysus_1", "project_assets/sprites/goblet_1.png");
    this.load.image("hermes_sandals_1", "project_assets/sprites/hermes_sandals_1.png");
    this.load.image("hourglass_1", "project_assets/sprites/hourglass_1.png");
    this.load.image("honey_jar", "project_assets/sprites/honeyJar.png");

    //Item Desc
    this.load.image("defense", "project_assets/sprites/defense.png");
    this.load.image("crit", "project_assets/sprites/crit.png");
    this.load.image("damage", "project_assets/sprites/damage.png");
    this.load.image("maxHealth", "project_assets/sprites/maxHealth.png");
    this.load.image("IncSpeed", "project_assets/sprites/IncSpeed.png");
    this.load.image("atkCd", "project_assets/sprites/atkCd.png");
    this.load.image("heal", "project_assets/sprites/heal.png");
  }

  startScene() {
    this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "click", loop: false, holdReference: false});
    // add splash (filler)
    this.splashScreen = this.addUILayer("splashScreen");
    this.bg = this.add.sprite("splash_screen", "splashScreen");
    this.bg.position.copy(this.viewport.getCenter());

    this.controlScreen = this.addUILayer("controls");

    // Controls Border
    const controlBorder = this.add.uiElement(
      UIElementType.LABEL,
      "controls",
      { position: new Vec2(400, 400), text: "" }
    );
    controlBorder.size.set(600, 400);
    controlBorder.borderWidth = 5;
    controlBorder.borderRadius = 0;
    controlBorder.borderColor = Color.BORDERCOLOR;
    controlBorder.backgroundColor = Color.GRAYISH;
    // No click event

    // Text in controls box
    this.controlsText = this.add.sprite("controlsText", "controls");
    this.controlsText.position = new Vec2(400, 264);

    this.WASD = this.add.sprite("wasd", "controls");
    this.WASD.position = new Vec2(400, 360);
    
    this.click = this.add.sprite("click", "controls");
    this.click.position = new Vec2(400, 424);

    this.escape = this.add.sprite("escape", "controls");
    this.escape.position = new Vec2(400, 488);

    const tutorialLevel = this.add.uiElement(UIElementType.BUTTON, "controls", {
      position: new Vec2(800, 700), 
      text: ""
    });
    tutorialLevel.size.set(256, 128);
    tutorialLevel.borderWidth = 2;
    tutorialLevel.borderColor = Color.BORDERCOLOR;
    tutorialLevel.backgroundColor = Color.GRAYISH;
    tutorialLevel.onClickEventId = "tutorial";
    
    this.tutorial = this.add.sprite("tutorialLevel", "controls");
    this.tutorial.position.copy(tutorialLevel.position);

    //Item Descriptions
    let itemDescription = this.add.uiElement(
      UIElementType.LABEL,
      "controls",
      { position: new Vec2(1150, 400), text: "" }
    );
    itemDescription.size.set(800, 400);
    itemDescription.borderWidth = 5;
    itemDescription.borderRadius = 0;
    itemDescription.borderColor = Color.BORDERCOLOR;
    itemDescription.backgroundColor = Color.GRAYISH;

    //Honeyjar
    let honeyJar = this.add.sprite("honey_jar", "controls");
    honeyJar.position = new Vec2(800, 250);
    let heal = this.add.sprite("heal", "controls");
    heal.position = new Vec2(800, 300);

    //Aegis
    let aegis = this.add.sprite("aegis_1", "controls");
    aegis.position = new Vec2(950, 250);
    let defense = this.add.sprite("defense", "controls");
    defense.position = new Vec2(950, 300);

    //Artemis
    let artemis = this.add.sprite("artemis_bow_1", "controls");
    artemis.position = new Vec2(1200, 250);
    let crit = this.add.sprite("crit", "controls");
    crit.position = new Vec2(1200, 300);

    //Bolt
    let bolt = this.add.sprite("bolt_1", "controls");
    bolt.position = new Vec2(1425, 250);
    let damage = this.add.sprite("damage", "controls");
    damage.position = new Vec2(1425, 300);

    //Goblet
    let goblet = this.add.sprite("goblet_of_dionysus_1", "controls");
    goblet.position = new Vec2(950, 400);
    let maxHealth = this.add.sprite("maxHealth", "controls");
    maxHealth.position = new Vec2(950, 450);
    
    //Hourglass 
    let hourglass = this.add.sprite("hourglass_1", "controls");
    hourglass.position = new Vec2(1350, 400);
    let atkCd = this.add.sprite("atkCd", "controls");
    atkCd.position = new Vec2(1350, 450);

    //Hermes hermes_sandals_1
    let hermes = this.add.sprite("hermes_sandals_1", "controls");
    hermes.position = new Vec2(1150, 500);
    let IncSpeed = this.add.sprite("IncSpeed", "controls");
    IncSpeed.position = new Vec2(1150, 550);


    // Back button
    const backControls = this.add.uiElement(UIElementType.BUTTON, "controls", {
      position: new Vec2(66, 815),
      text: "",
    });
    backControls.size.set(75, 80);
    backControls.borderWidth = 2;
    backControls.borderColor = Color.BORDERCOLOR;
    backControls.backgroundColor = Color.GRAYISH;
    backControls.onClickEventId = "back";

    this.back = this.add.sprite("back", "controls");
    this.back.position.copy(backControls.position);
    this.back.position.x += 5;

    this.receiver.subscribe("back");
    this.receiver.subscribe("tutorial");
  }

  updateScene() {
    while (this.receiver.hasNextEvent()) {
      let event = this.receiver.getNextEvent();
      let options = {
        invincible: this.invincible, 
        unlockAll: this.unlockAll,
        instant_kill: this.instant_kill,
        speedUp: this.speedUp, 
        unlockedLevels: this.unlockedLevels
    }

      if (event.type === "back") {
        this.sceneManager.changeToScene(MainMenu, options);
      }
      
      if (event.type === "tutorial") {
        let physicsOptions = {
          physics: {
              groupNames: ["wall", "player", "enemy", "projectile"],
              collisions:
              [
                  [0, 1, 1, 0],
                  [1, 0, 0, 0],
                  [1, 0, 1, 0],
                  [0, 0, 0, 0]
              ]
          }
        } 
        this.sceneManager.changeToScene(Tutorial, options, physicsOptions);
      }
    }
  }
}
