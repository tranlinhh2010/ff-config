#include <iostream>
#include <map>
#include <string>
#include <variant>
#include <optional>

class SettingsManager {
public:
    using SettingValue = std::variant<int, bool, std::string>;

    void setSetting(const std::string& key, SettingValue value) {
        settings[key] = std::move(value);
    }

    std::optional<SettingValue> getSetting(const std::string& key) const {
        auto it = settings.find(key);
        if (it != settings.end()) {
            return it->second;
        }
        return std::nullopt;
    }

    void applySettings() {
        for (const auto& [key, value] : settings) {
            std::cout << "[Apply] " << key << " = ";
            std::visit([](auto&& val) { std::cout << val; }, value);
            std::cout << std::endl;
        }
    }

    void displaySettings() const {
        std::cout << "\n--- Current Settings ---" << std::endl;
        for (const auto& [key, value] : settings) {
            std::cout << "Key: " << key << " -> Value: ";
            std::visit([](auto&& val) { std::cout << val; }, value);
            std::cout << std::endl;
        }
    }

private:
    std::map<std::string, SettingValue> settings;
};

int main() {
    SettingsManager settingsManager;

    
    settingsManager.setSetting("com.adt_xbaseff64_act.list", 1440);
    settingsManager.setSetting("com.adt_xbaseff64_act.list_enabled", true);

    
    settingsManager.setSetting("com.vzone-vn_sensboost.fast_dyn-autopref.data", true);
    settingsManager.setSetting("com.region-sg_fbacc-vscale-initctrl.plist", true);
    settingsManager.setSetting("com.ctrlzone-th_fbuff-ultrax-autop.data", true);
    settingsManager.setSetting("com.area-jp_touchacc-dynsens-v2.prefplist", true);
    settingsManager.setSetting("com.region-vn_sensboost.highmode-autopref.plist", true);
    settingsManager.setSetting("com.zone-th_touchacc_dynsens-fastapply.data", true);
    settingsManager.setSetting("com.area-sg_3dsensbuff-force_ctrl-v2.plist", true);
    settingsManager.setSetting("com.device-jp_dyntouchscale-autoinit.prefplist", true);
    settingsManager.setSetting("com.zone-vn_fbuff-dynsens_fastx.plist", true);
    settingsManager.setSetting("com.ctrlarea-kr_highsens_3dboost-autoexec.data", true);
    settingsManager.setSetting("com.touchunit-vn_boostsens3d-modeultra.data", true);
    settingsManager.setSetting("com.area-us_fbacc-touchscale-dynctrl.plist", true);
    settingsManager.setSetting("com.region-sg_fbuff_3dplus_vscale.prefdata", true);
    settingsManager.setSetting("com.inputsys-th_tapsensctrl-fbuffx-ultra.plist", true);
    settingsManager.setSetting("com.zone-vn_touchpressure_boostpref-autoload.data", true);
    settingsManager.setSetting("com.region-jp_forcebuffscale-fast_init_ctrl.plist", true);
    settingsManager.setSetting("com.area-id_highsens_fb3d-modefastapply.data", true);
    settingsManager.setSetting("com.ctrlzone-vn_3dinputx-sens_prefboost.plist", true);
    settingsManager.setSetting("com.dynsys-kr_touch3dscale_forcex-ultrasense.plist", true);
    settingsManager.setSetting("com.zone-sg_dyntouchdepth_force_applyctrl.data", true);

    
    settingsManager.applySettings();
    settingsManager.displaySettings();

    return 0;
}
