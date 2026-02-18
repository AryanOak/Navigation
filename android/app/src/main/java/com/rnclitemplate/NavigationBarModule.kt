package com.rnclitemplate

import android.graphics.Color
import android.os.Build
import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class NavigationBarModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "NavigationBarModule"

    @ReactMethod
    fun setNavigationBarColor(colorString: String, isLight: Boolean) {
        val activity = reactContext.currentActivity ?: return
        
        try {
            val color = Color.parseColor(colorString)
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                activity.window.navigationBarColor = color
            }
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val decorView = activity.window.decorView
                var flags = decorView.systemUiVisibility
                
                if (isLight) {
                    // Light icons (for dark background)
                    flags = flags and View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR.inv()
                } else {
                    // Dark icons (for light background)
                    flags = flags or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
                }
                
                decorView.systemUiVisibility = flags
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
