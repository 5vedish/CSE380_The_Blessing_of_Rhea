import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import LevelSelection from "./LevelSelection";
import ControlScreen from "./ControlScreen";
import HelpScreen from "./HelpScreen";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import level_z1 from "./GameLevels/Level_Z1";

export default class MainMenu extends Scene {
  private splashScreen: Layer;
  private bg: Sprite;
  private logo: Sprite;

  private mainMenu: Layer;

  loadScene() {
    this.load.image("rhea", "project_assets/screens/Rhea.png");
    this.load.image("logo", "project_assets/screens/Logo.png");
  }

  startScene() {
    const origin = new Vec2(192, 64);

    // add splash (filler)
    this.splashScreen = this.addUILayer("splashScreen");
    this.bg = this.add.sprite("rhea", "splashScreen");
    this.bg.position.copy(this.viewport.getCenter());
    this.logo = this.add.sprite("logo", "splashScreen");
    this.logo.position.set(this.viewport.getCenter().x + 300, this.viewport.getCenter().y - 300);

    /* ########## MAIN MENU  ########## */
    this.mainMenu = this.addUILayer("mainMenu");

    // Add start game button
    const play = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {
      position: new Vec2(origin.x + 94, origin.y + 144),
      text: "Start Game",
    });
    play.size.set(384, 128);
    play.borderWidth = 4;
    play.borderRadius = 0;
    play.borderColor = Color.GRAY;
    play.backgroundColor = Color.BROWN;
    play.onClickEventId = "play";

    // Add level select button
    const levels = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {
      position: new Vec2(origin.x + 94, origin.y + 305),
      text: "Level Select",
    });
    levels.size.set(384, 128);
    levels.borderWidth = 4;
    levels.borderRadius = 0;
    levels.borderColor = Color.GRAY;
    levels.backgroundColor = Color.BROWN;
    levels.onClickEventId = "select_levels";

    // Add controls button
    const controls = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {
      position: new Vec2(origin.x + 94, origin.y + 466),
      text: "Controls",
    });
    controls.size.set(384, 128);
    controls.borderWidth = 4;
    controls.borderRadius = 0;
    controls.borderColor = Color.GRAY;
    controls.backgroundColor = Color.BROWN;
    controls.onClickEventId = "control";

    // Add help button
    const help = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {
      position: new Vec2(origin.x + 94, origin.y + 627),
      text: "Help / Cheats",
    });
    help.size.set(384, 128);
    help.borderWidth = 4;
    help.borderRadius = 0;
    help.borderColor = Color.GRAY;
    help.backgroundColor = Color.BROWN;
    help.onClickEventId = "help";

    // Subscribe events
    this.receiver.subscribe("start");
    this.receiver.subscribe("play");
    this.receiver.subscribe("select_levels");
    this.receiver.subscribe("control");
    this.receiver.subscribe("help");
    this.receiver.subscribe("back");
  }

  updateScene() {
    while (this.receiver.hasNextEvent()) {
      let event = this.receiver.getNextEvent();
      console.log(event);

      /* TODO - CHANGE TO SPECIFIED SCENE */
      if (event.type === "play") {
        let physicsOptions = {
            physics: {
                groupNames: ["Wall", "player", "enemy"],
                collisions:
                [
                    [0, 1, 1],
                    [1, 0, 0],
                    [1, 0, 0]
                ]
            }
        }
        this.sceneManager.changeToScene(level_z1, {}, physicsOptions);
      }

      if (event.type === "select_levels") {
        this.sceneManager.changeToScene(LevelSelection, {});
      }

      if (event.type === "control") {
        this.sceneManager.changeToScene(ControlScreen, {});
      }

      if (event.type === "help") {
        this.sceneManager.changeToScene(HelpScreen, {});
      }
      
    }
  }
}
