import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import MainMenu from "./MainMenu";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";

export default class HelpScreen extends Scene {
  private splashScreen: Layer;
  private bg: Sprite;

  private helpScreen: Layer;

  loadScene() {
    this.load.image("splash_screen", "project_assets/Screens/Splash.png");
  }

  startScene() {
    // add splash (filler)
    this.splashScreen = this.addUILayer("splashScreen");
    this.bg = this.add.sprite("splash_screen", "splashScreen");
    this.bg.position.copy(this.viewport.getCenter());

    this.helpScreen = this.addUILayer("helpScreen");

    // Backstory text
    const backstory = this.add.uiElement(
      UIElementType.TEXT_INPUT,
      "helpScreen",
      { position: new Vec2(462, 260), text: "" }
    );
    backstory.size.set(680, 355);
    backstory.borderWidth = 5;
    backstory.borderRadius = 0;
    backstory.borderColor = Color.GRAY;
    backstory.backgroundColor = Color.BROWN;
    // No click event

    const backstoryHeader = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(462, 115),
        text: "Backstory",
      })
    );
    backstoryHeader.fontSize = 36;
    backstoryHeader.textColor = Color.WHITE;

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

    const one = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(462, 164),
        text: line1,
      })
    );
    const two = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(462, 188),
        text: line2,
      })
    );
    const three = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(462, 212),
        text: line3,
      })
    );
    const four = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(462, 236),
        text: line4,
      })
    );
    const five = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(462, 260),
        text: line5,
      })
    );
    const six = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(462, 284),
        text: line6,
      })
    );
    const seven = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(462, 308),
        text: line7,
      })
    );
    const eight = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(462, 332),
        text: line8,
      })
    );
    const nine = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(462, 356),
        text: line9,
      })
    );
    const ten = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(462, 380),
        text: line10,
      })
    );

    one.fontSize =
      two.fontSize =
      three.fontSize =
      four.fontSize =
      five.fontSize =
      six.fontSize =
      seven.fontSize =
      eight.fontSize =
      nine.fontSize =
      ten.fontSize =
        16;
    one.textColor =
      two.textColor =
      three.textColor =
      four.textColor =
      five.textColor =
      six.textColor =
      seven.textColor =
      eight.textColor =
      nine.textColor =
      ten.textColor =
        Color.WHITE;

    // Developers
    const developers = this.add.uiElement(
      UIElementType.TEXT_INPUT,
      "helpScreen",
      { position: new Vec2(457, 625), text: "" }
    );
    developers.size.set(674, 232);
    developers.borderWidth = 5;
    developers.borderRadius = 0;
    developers.borderColor = Color.GRAY;
    developers.backgroundColor = Color.BROWN;
    // No click event

    const devHeader = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(457, 550),
        text: "Developers",
      })
    );
    devHeader.fontSize = 36;
    devHeader.textColor = Color.WHITE;

    const dev1 = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(457, 594),
        text: "Zhi Zhao",
      })
    );
    const dev2 = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(457, 618),
        text: "Jeffery Chen",
      })
    );
    const dev3 = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(457, 642),
        text: "Nelson Tan",
      })
    );

    dev1.fontSize = dev2.fontSize = dev3.fontSize = 16;
    dev1.textColor = dev2.textColor = dev3.textColor = Color.WHITE;

    // Cheats
    const cheats = this.add.uiElement(UIElementType.TEXT_INPUT, "helpScreen", {
      position: new Vec2(1106, 450),
      text: "",
    });
    cheats.size.set(472, 774);
    cheats.borderWidth = 5;
    cheats.borderRadius = 0;
    cheats.borderColor = Color.GRAY;
    cheats.backgroundColor = Color.BROWN;
    // No click event

    const cheatHeader = <Label>(
      this.add.uiElement(UIElementType.LABEL, "helpScreen", {
        position: new Vec2(1106, 112),
        text: "Cheats",
      })
    );
    cheatHeader.fontSize = 48;
    cheatHeader.textColor = Color.WHITE;

    const invincible = this.add.uiElement(UIElementType.BUTTON, "helpScreen", {
      position: new Vec2(1106, 268),
      text: "Invincibility",
    });
    invincible.size.set(384, 128);
    invincible.borderWidth = 5;
    invincible.borderColor = Color.GRAY;
    invincible.backgroundColor = Color.BROWN;
    invincible.onClickEventId = "invincible";

    const unlockLevels = this.add.uiElement(
      UIElementType.BUTTON,
      "helpScreen",
      { position: new Vec2(1106, 424), text: "Unlock All Levels" }
    );
    unlockLevels.size.set(384, 128);
    unlockLevels.borderWidth = 5;
    unlockLevels.borderColor = Color.GRAY;
    unlockLevels.backgroundColor = Color.BROWN;
    unlockLevels.onClickEventId = "unlock";

    const instantKill = this.add.uiElement(UIElementType.BUTTON, "helpScreen", {
      position: new Vec2(1106, 580),
      text: "Instant Kill",
    });
    instantKill.size.set(384, 128);
    instantKill.borderWidth = 5;
    instantKill.borderColor = Color.GRAY;
    instantKill.backgroundColor = Color.BROWN;
    instantKill.onClickEventId = "kill";

    const doubleSpeed = this.add.uiElement(UIElementType.BUTTON, "helpScreen", {
      position: new Vec2(1106, 736),
      text: "Double Speed",
    });
    doubleSpeed.size.set(384, 128);
    doubleSpeed.borderWidth = 5;
    doubleSpeed.borderColor = Color.GRAY;
    doubleSpeed.backgroundColor = Color.BROWN;
    doubleSpeed.onClickEventId = "speed";

    // Back button
    const backHelp = this.add.uiElement(UIElementType.BUTTON, "helpScreen", {
      position: new Vec2(66, 815),
      text: "Back",
    });
    backHelp.size.set(75, 80);
    backHelp.borderWidth = 2;
    backHelp.borderColor = Color.GRAY;
    backHelp.backgroundColor = Color.BROWN;
    backHelp.onClickEventId = "back";

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
        this.sceneManager.changeToScene(MainMenu, {});
      }
    }
  }
}
