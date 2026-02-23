package com.rnclitemplate

import android.os.Bundle
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "RNCLITemplate"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    Log.d("LIFECYCLE", "onCreate called")
  }

  override fun onStart() {
    super.onStart()
    Log.d("LIFECYCLE", "onStart called")
  }

  override fun onResume() {
    super.onResume()
    Log.d("LIFECYCLE", "onResume called - HomeScreen refresh animation & Welcome back toast (Profile)")
  }

  override fun onPause() {
    super.onPause()
    Log.d("LIFECYCLE", "onPause called - Draft saved in app state")
  }

  override fun onStop() {
    super.onStop()
    Log.d("LIFECYCLE", "onStop called - App in background")
  }

  override fun onDestroy() {
    super.onDestroy()
    Log.d("LIFECYCLE", "onDestroy called - App state cleared on next restart")
  }

  override fun onRestart() {
    super.onRestart()
    Log.d("LIFECYCLE", "onRestart called - App coming back from background")
  }
}