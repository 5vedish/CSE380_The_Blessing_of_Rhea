import Registry from "../../Wolfie2D/Registry/Registries/Registry";
import ResourceManager from "../../Wolfie2D/ResourceManager/ResourceManager";
import LaserGun from "../GameSystems/items/WeaponTypes/Primary/LaserGun";
import Lightning from "../GameSystems/items/WeaponTypes/Primary/Lightning";
import SemiAutoGun from "../GameSystems/items/WeaponTypes/Primary/SemiAutoGun";
import Slice from "../GameSystems/items/WeaponTypes/Primary/Slice";
import WeaponType from "../GameSystems/items/WeaponTypes/WeaponType";

export default class WeaponTemplateRegistry extends Registry<WeaponConstructor> {
    
    public preload(): void {
        const rm = ResourceManager.getInstance();

        // Load sprites
        rm.image("pistol", "project_assets/sprites/pistol.png");
        rm.image("knife", "project_assets/sprites/knife.png");
        rm.image("laserGun", "project_assets/sprites/laserGun.png")
        rm.image("lightning", "project_assets/sprites/lightning.png")

        // Load spritesheets
        rm.spritesheet("slice", "project_assets/spritesheets/slice.json");
        rm.spritesheet("lightning", "project_assets/spritesheets/lightning.json");

        // Register default types
        this.registerItem("slice", Slice);
        this.registerItem("laserGun", LaserGun);
        this.registerItem("semiAutoGun", SemiAutoGun);
        this.registerItem("lightning", Lightning);
    }

    // We don't need this for this assignment
    public registerAndPreloadItem(key: string): void {}

    public registerItem(key: string, constr: WeaponConstructor): void {
        this.add(key, constr);
    }
}

type WeaponConstructor = new (...args: any) => WeaponType;