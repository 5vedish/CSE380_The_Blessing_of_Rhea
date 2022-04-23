import Registry from "../../Wolfie2D/Registry/Registries/Registry";
import ResourceManager from "../../Wolfie2D/ResourceManager/ResourceManager";
import Lightning from "../GameSystems/items/WeaponTypes/Primary/Lightning";
import Slice from "../GameSystems/items/WeaponTypes/Primary/Slice";
import WeaponType from "../GameSystems/items/WeaponTypes/WeaponType";

export default class WeaponTemplateRegistry extends Registry<WeaponConstructor> {
    
    public preload(): void {
        const rm = ResourceManager.getInstance();

        // Load sprites
        rm.image("knife", "project_assets/sprites/knife.png");
        rm.image("lightning", "project_assets/sprites/lightning.png")

        // Load spritesheets
        rm.spritesheet("slice", "project_assets/spritesheets/slice.json");
        rm.spritesheet("lightning", "project_assets/spritesheets/lightning.json");

        // Register default types
        this.registerItem("slice", Slice);
        this.registerItem("lightning", Lightning);
    }

    // We don't need this for this assignment
    public registerAndPreloadItem(key: string): void {}

    public registerItem(key: string, constr: WeaponConstructor): void {
        this.add(key, constr);
    }
}

type WeaponConstructor = new (...args: any) => WeaponType;