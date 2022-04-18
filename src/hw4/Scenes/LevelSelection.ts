import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import PlayerController from "../../demos/PlatformerPlayerController";
import MainMenu from "./MainMenu";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";

export default class LevelSelection extends Scene {
  private splashScreen: Layer;
  private bg: Sprite;
  private zeus1 : Sprite;

  private levelSelect: Layer;

  loadScene() {
    this.load.image("splash_screen", "project_assets/screens/Splash.png");
    this.load.image("level_z1", "project_assets/tilemaps/LevelZ1Preview.png");
  }

  startScene() {
    const origin = new Vec2(192, 64);

    // add splash (filler)
    this.splashScreen = this.addUILayer("splashScreen");
    this.bg = this.add.sprite("splash_screen", "splashScreen");
    this.bg.position.copy(this.viewport.getCenter());

    this.levelSelect = this.addUILayer("levelSelect");

    // Add Poseidon level buttons
    const levelp1 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(400, origin.y + 135),
      text: "Level 1",
    });
    levelp1.size.set(256, 128);
    levelp1.borderWidth = 2;
    levelp1.borderColor = Color.WHITE;
    levelp1.backgroundColor = Color.TRANSPARENT;
    levelp1.onClickEventId = "poseidon1";

    const levelp2 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(400, origin.y + 361),
      text: "Level 2",
    });
    levelp2.size.set(256, 128);
    levelp2.borderWidth = 2;
    levelp2.borderColor = Color.WHITE;
    levelp2.backgroundColor = Color.TRANSPARENT;
    levelp2.onClickEventId = "poseidon2";

    const levelp3 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(400, origin.y + 587),
      text: "Level 3",
    });
    levelp3.size.set(256, 128);
    levelp3.borderWidth = 2;
    levelp3.borderColor = Color.WHITE;
    levelp3.backgroundColor = Color.TRANSPARENT;
    levelp3.onClickEventId = "poseidon3";

    // Add Zeus level buttons
    const levelz1 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(800, origin.y + 135),
      text: "Level 1",
    });
    levelz1.size.set(256, 128);
    levelz1.borderWidth = 2;
    levelz1.borderColor = Color.WHITE;
    levelz1.backgroundColor = Color.TRANSPARENT;
    levelz1.onClickEventId = "zeus1";

    // Add preview of zeus1
    this.zeus1 = this.add.sprite("level_z1", "splashScreen");
    this.zeus1.position.copy(levelz1.position);

    const levelz2 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(800, origin.y + 361),
      text: "Level 2",
    });
    levelz2.size.set(256, 128);
    levelz2.borderWidth = 2;
    levelz2.borderColor = Color.WHITE;
    levelz2.backgroundColor = Color.TRANSPARENT;
    levelz2.onClickEventId = "zeus2";

    const levelz3 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(800, origin.y + 587),
      text: "Level 3",
    });
    levelz3.size.set(256, 128);
    levelz3.borderWidth = 2;
    levelz3.borderColor = Color.WHITE;
    levelz3.backgroundColor = Color.TRANSPARENT;
    levelz3.onClickEventId = "zeus3";

    // Add Hades level buttons
    const levelh1 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(1200, origin.y + 135),
      text: "Level 1",
    });
    levelh1.size.set(256, 128);
    levelh1.borderWidth = 2;
    levelh1.borderColor = Color.WHITE;
    levelh1.backgroundColor = Color.TRANSPARENT;
    levelh1.onClickEventId = "hades1";

    const levelh2 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(1200, origin.y + 361),
      text: "Level 2",
    });
    levelh2.size.set(256, 128);
    levelh2.borderWidth = 2;
    levelh2.borderColor = Color.WHITE;
    levelh2.backgroundColor = Color.TRANSPARENT;
    levelh2.onClickEventId = "hades2";

    const levelh3 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(1200, origin.y + 587),
      text: "Level 3",
    });
    levelh3.size.set(256, 128);
    levelh3.borderWidth = 2;
    levelh3.borderColor = Color.WHITE;
    levelh3.backgroundColor = Color.TRANSPARENT;
    levelh3.onClickEventId = "hades3";

    // Back button
    const backLevel = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(66, 815),
      text: "Back",
    });
    backLevel.size.set(75, 80);
    backLevel.borderWidth = 2;
    backLevel.borderColor = Color.BORDERCOLOR;
    backLevel.backgroundColor = Color.GRAYISH;
    backLevel.onClickEventId = "back";

    this.receiver.subscribe("back");
  }

  updateScene() {
    while (this.receiver.hasNextEvent()) {
      let event = this.receiver.getNextEvent();
      console.log(event);

      if (event.type === "back") {
        this.sceneManager.changeToScene(MainMenu, {});
      }

      /* TODO - ADD REST OF STAGES */
    }
  }
}
