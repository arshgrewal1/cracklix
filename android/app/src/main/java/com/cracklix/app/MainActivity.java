package com.cracklix.app;

import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Default security: screenshots block karna startup te
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        
        // Local Security plugin register karna
        registerPlugin(SecurityPlugin.class);
    }
}

/**
 * Custom Capacitor Plugin to toggle FLAG_SECURE from the web side.
 */
@CapacitorPlugin(name = "Security")
class SecurityPlugin extends Plugin {
    @PluginMethod
    public void setPrivacyScreen(PluginCall call) {
        boolean enabled = call.getBoolean("enabled", true);
        getActivity().runOnUiThread(() -> {
            if (enabled) {
                getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
            } else {
                getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
            }
            call.resolve();
        });
    }
}
