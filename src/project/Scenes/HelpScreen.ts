import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import MainMenu from "./MainMenu";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import UIElement from "../../Wolfie2D/Nodes/UIElement";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class HelpScreen extends Scene {
  private splashScreen: Layer;
  private bg: Sprite;
  private backstory: Sprite
  private b1: Sprite;
  private b2: Sprite;
  private b3: Sprite;
  private b4: Sprite;
  private b5: Sprite;
  private b6: Sprite;
  private b7: Sprite;
  private b8: Sprite;
  private b9: Sprite;
  private b10: Sprite;
  private b11: Sprite;
  private back : Sprite;

  private devs: Sprite;
  private z: Sprite;
  private j: Sprite;
  private n: Sprite;

  private cheatsLabel: Sprite;
  private invLabel: Sprite;
  private unlockLabel: Sprite;
  private instantLabel: Sprite;
  private speedLabel: Sprite;

  private helpScreen: Layer;

  private invincible: boolean;
  private unlockAll: boolean;
  private instant_kill: boolean;
  private speedUp: boolean;

  private inv: UIElement;
  private unlockLevels: UIElement;
  private instantKill: UIElement;
  private doubleSpeed: UIElement;
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
    
    this.load.image("backstory", "project_assets/sprites/backstory.png");
    this.load.image("l1", "project_assets/sprites/line1.png");
    this.load.image("l2", "project_assets/sprites/line2.png");
    this.load.image("l3", "project_assets/sprites/line3.png");
    this.load.image("l4", "project_assets/sprites/line4.png");
    this.load.image("l5", "project_assets/sprites/line5.png");
    this.load.image("l6", "project_assets/sprites/line6.png");
    this.load.image("l7", "project_assets/sprites/line7.png");
    this.load.image("l8", "project_assets/sprites/line8.png");
    this.load.image("l9", "project_assets/sprites/line9.png");
    this.load.image("l10", "project_assets/sprites/line10.png");
    this.load.image("l11", "project_assets/sprites/line11.png");

    this.load.image("devs", "project_assets/sprites/devs.png");
    this.load.image("z", "project_assets/sprites/zhi.png");
    this.load.image("j", "project_assets/sprites/jeffery.png");
    this.load.image("n", "project_assets/sprites/nelson.png");

    this.load.image("cheats", "project_assets/sprites/cheats.png");
    this.load.image("inv", "project_assets/sprites/inv.png");
    this.load.image("unlock", "project_assets/sprites/unlock.png");
    this.load.image("instant", "project_assets/sprites/instant.png");
    this.load.image("speed", "project_assets/sprites/speed.png");

    this.load.image("back", "project_assets/sprites/back.png");
    this.load.audio("click", "project_assets/sounds/click.wav");
  }

  startScene() {
    this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "click", loop: false, holdReference: false});
    // add splash (filler)
    this.splashScreen = this.addUILayer("splashScreen");
    this.bg = this.add.sprite("splash_screen", "splashScreen");
    this.bg.position.copy(this.viewport.getCenter());

    this.helpScreen = this.addUILayer("helpScreen");

    // Backstory text
    const backstory = this.add.uiElement(
      UIElementType.LABEL,
      "helpScreen",
      { position: new Vec2(462, 260), text: "" }
    );
    backstory.size.set(680, 355);
    backstory.borderWidth = 5;
    backstory.borderRadius = 0;
    backstory.borderColor = Color.BORDERCOLOR;
    backstory.backgroundColor = Color.GRAYISH;
    // No click event

    const backstoryHeader = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(462, 115),
        text: "",
      })
    );
    backstoryHeader.fontSize = 36;
    backstoryHeader.textColor = Color.WHITE;

    this.backstory = this.add.sprite("backstory", "helpScreen");
    this.backstory.position.copy(backstoryHeader.position);

    // BACKSTORY
    const line1 =
      "The three eldest sons of Kronus are spared from being devoured by";
    const line2 =
      "the mad titan when their mother Rhea deceives him into consuming";
    const line3 =
      "stones instead of their bodies. Zeus, Poseidon, and Hades grow up to ";
    const line4 = "overthrow Kronus and banish him to Tartarus for all of his";
    const line5 =
      "transgressions, ushering a new age of the gods. Now that Kronus had";
    const line6 =
      "been slain and lots had been drawn, they set forth to challenge their";
    const line7 =
      "natural foes and rightfully claim their domains: Zeus will conquer";
    const line8 =
      "The Heavens, Poseidon The Seas, and Hades The Underworld. No";
    const line9 =
      "matter how the looms of fate spin for our three young gods, their";
    const line10 = "mother’s love and blessings will always remain with them.";

    this.b1 = this.add.sprite("l1", "helpScreen");
    this.b1.position = new Vec2(462, 164);

    this.b2 = this.add.sprite("l2", "helpScreen");
    this.b2.position = new Vec2(462, 188);

    this.b3 = this.add.sprite("l3", "helpScreen");
    this.b3.position = new Vec2(462, 212);

    this.b4 = this.add.sprite("l4", "helpScreen");
    this.b4.position = new Vec2(462, 236);

    this.b5 = this.add.sprite("l5", "helpScreen");
    this.b5.position = new Vec2(462, 260);

    this.b6 = this.add.sprite("l6", "helpScreen");
    this.b6.position = new Vec2(462, 284);

    this.b7 = this.add.sprite("l7", "helpScreen");
    this.b7.position = new Vec2(462, 308);

    this.b8 = this.add.sprite("l8", "helpScreen");
    this.b8.position = new Vec2(462, 332);

    this.b9 = this.add.sprite("l9", "helpScreen");
    this.b9.position = new Vec2(462, 356);

    this.b10 = this.add.sprite("l10", "helpScreen");
    this.b10.position = new Vec2(462, 380);

    this.b11 = this.add.sprite("l11", "helpScreen");
    this.b11.position = new Vec2(462, 404);

    // Developers
    const developers = this.add.uiElement(
      UIElementType.LABEL,
      "helpScreen",
      { position: new Vec2(457, 625), text: "" }
    );
    developers.size.set(674, 232);
    developers.borderWidth = 5;
    developers.borderRadius = 0;
    developers.borderColor = Color.BORDERCOLOR;
    developers.backgroundColor = Color.GRAYISH;
    // No click event

    // Devs
    this.devs = this.add.sprite("devs", "helpScreen");
    this.devs.position = new Vec2(457, 550);

    this.z = this.add.sprite("z", "helpScreen");
    this.z.position = new Vec2(457, 614);
    
    this.j = this.add.sprite("j", "helpScreen");
    this.j.position = new Vec2(457, 650);

    this.n = this.add.sprite("n", "helpScreen");
    this.n.position = new Vec2(457, 686);

    // Cheats
    const cheats = this.add.uiElement(UIElementType.LABEL, "helpScreen", {
      position: new Vec2(1106, 450),
      text: "",
    });
    cheats.size.set(472, 774);
    cheats.borderWidth = 5;
    cheats.borderRadius = 0;
    cheats.borderColor = Color.BORDERCOLOR;
    cheats.backgroundColor = Color.GRAYISH;
    // No click event

    this.cheatsLabel = this.add.sprite("cheats", "helpScreen");
    this.cheatsLabel.position = new Vec2(1106, 112);

    this.inv = this.add.uiElement(UIElementType.BUTTON, "helpScreen", {
      position: new Vec2(1106, 268),
      text: "",
    });
    this.inv.size.set(384, 128);
    this.inv.borderWidth = 5;
    this.inv.borderColor = Color.BORDERCOLOR;
    if (this.invincible) this.inv.backgroundColor = Color.BROWN;
    else this.inv.backgroundColor = Color.GRAYISH;
    this.inv.onClickEventId = "invincible";

    this.invLabel = this.add.sprite("inv", "helpScreen");
    this.invLabel.position.copy(this.inv.position);

    this.unlockLevels = this.add.uiElement(UIElementType.BUTTON, "helpScreen", { 
      position: new Vec2(1106, 424),
      text: "" 
    });
    this.unlockLevels.size.set(384, 128);
    this.unlockLevels.borderWidth = 5;
    this.unlockLevels.borderColor = Color.BORDERCOLOR;
    if (this.unlockAll) this.unlockLevels.backgroundColor = Color.BROWN;
    else this.unlockLevels.backgroundColor = Color.GRAYISH;
    this.unlockLevels.onClickEventId = "unlock";

    this.unlockLabel = this.add.sprite("unlock", "helpScreen");
    this.unlockLabel.position.copy(this.unlockLevels.position);

    this.instantKill = this.add.uiElement(UIElementType.BUTTON, "helpScreen", {
      position: new Vec2(1106, 580),
      text: "",
    });
    this.instantKill.size.set(384, 128);
    this.instantKill.borderWidth = 5;
    this.instantKill.borderColor = Color.BORDERCOLOR;
    if (this.instant_kill) this.instantKill.backgroundColor = Color.BROWN;
    else this.instantKill.backgroundColor = Color.GRAYISH;
    this.instantKill.onClickEventId = "kill";

    this.instantLabel = this.add.sprite("instant", "helpScreen");
    this.instantLabel.position.copy(this.instantKill.position);

    this.doubleSpeed = this.add.uiElement(UIElementType.BUTTON, "helpScreen", {
      position: new Vec2(1106, 736),
      text: "",
    });
    this.doubleSpeed.size.set(384, 128);
    this.doubleSpeed.borderWidth = 5;
    this.doubleSpeed.borderColor = Color.BORDERCOLOR;
    if (this.speedUp) this.doubleSpeed.backgroundColor = Color.BROWN;
    else this.doubleSpeed.backgroundColor = Color.GRAYISH;
    this.doubleSpeed.onClickEventId = "speed";

    this.speedLabel = this.add.sprite("speed", "helpScreen");
    this.speedLabel.position.copy(this.doubleSpeed.position);

    // Back button
    const backHelp = this.add.uiElement(UIElementType.BUTTON, "helpScreen", {
      position: new Vec2(66, 815),
      text: "",
    });
    backHelp.size.set(75, 80);
    backHelp.borderWidth = 2;
    backHelp.borderColor = Color.BORDERCOLOR;
    backHelp.backgroundColor = Color.GRAYISH;
    backHelp.onClickEventId = "back";

    this.back = this.add.sprite("back", "helpScreen");
    this.back.position.copy(backHelp.position);
    this.back.position.x += 5;

    this.receiver.subscribe("invincible");
    this.receiver.subscribe("unlock");
    this.receiver.subscribe("kill");
    this.receiver.subscribe("speed");
    this.receiver.subscribe("back");
  }

  updateScene() {
    while (this.receiver.hasNextEvent()) {
      let event = this.receiver.getNextEvent();
      console.log(event);
      
      if (event.type === "back") {
        this.sceneManager.changeToScene(MainMenu, {
          invincible: this.invincible, 
          unlockAll: this.unlockAll,
          instant_kill: this.instant_kill,
          speedUp: this.speedUp, 
          unlockedLevels: this.unlockedLevels
        }, {});
      }

      this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "click", loop: false, holdReference: false});
      
      if (event.type === "invincible") {
        if (this.invincible) {
          this.invincible = false;
          this.inv.backgroundColor = Color.GRAYISH;
        } else {
          this.invincible = true;
          this.inv.backgroundColor = Color.BROWN;
        }
      }

      if (event.type === "unlock") {
        if (this.unlockAll) {
          this.unlockAll = false;
          this.unlockLevels.backgroundColor = Color.GRAYISH;
        } else {
          this.unlockAll = true;
          this.unlockLevels.backgroundColor = Color.BROWN;
        }
      }

      if (event.type === "kill") {
        if (this.instant_kill) {
          this.instant_kill = false;
          this.instantKill.backgroundColor = Color.GRAYISH;
        } else {
          this.instant_kill = true;
          this.instantKill.backgroundColor = Color.BROWN;
        }
      }

      if (event.type === "speed") {
        if (this.speedUp) {
          this.speedUp = false;
          this.doubleSpeed.backgroundColor = Color.GRAYISH;
        } else {
          this.speedUp = true;
          this.doubleSpeed.backgroundColor = Color.BROWN;
        }
      }
    }
  }
}
