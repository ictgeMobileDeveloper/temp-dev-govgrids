
package com.govgrids

// import android.graphics.Color
// import android.os.Build
import android.os.Bundle
// import android.view.WindowInsetsController
import androidx.core.view.WindowCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.zoontek.rnbootsplash.RNBootSplash

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "govgrids"

override fun onCreate(savedInstanceState: Bundle?) {
  RNBootSplash.init(this, R.style.BootTheme)
  super.onCreate(savedInstanceState)


  WindowCompat.getInsetsController(window, window.decorView).apply {
  isAppearanceLightStatusBars = true        // dark icons by default
  isAppearanceLightNavigationBars = true
}
}

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
