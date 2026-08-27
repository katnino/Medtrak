package com.medtrak.app;

import com.getcapacitor.BridgeActivity;
import com.medtrak.app.enhancedreminders.EnhancedRemindersPlugin;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(android.os.Bundle savedInstanceState) {
        // Register custom plugin before calling super
        initialPlugins.add(EnhancedRemindersPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
