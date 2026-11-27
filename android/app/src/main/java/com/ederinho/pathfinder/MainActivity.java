package com.ederinho.pathfinder;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle savedInstanceState) {
        registerPlugin(DevTokenPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
