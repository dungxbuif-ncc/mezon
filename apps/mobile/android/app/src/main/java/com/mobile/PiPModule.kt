package com.mezon.mobile
import android.app.Activity
import android.app.PictureInPictureParams
import android.content.Intent
import android.os.Build
import android.util.Rational
import com.facebook.react.bridge.*
import android.util.Log
import android.content.pm.PackageManager

class PipModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "PipModule"
    private val TAG = "PipModule"

 @ReactMethod
 fun enterPipMode() {
   val activity: Activity? = currentActivity

   if (activity == null) {
     Log.w(TAG, "E_NO_ACTIVITY No active Activity to enter PiP")
     return
   }

   if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
     Log.w(TAG, "enterPipMode aborted: API level too low (${Build.VERSION.SDK_INT})")
     return
   }

   try {
     val ratio = Rational(16, 9)
     val builder = PictureInPictureParams.Builder()
       .setAspectRatio(ratio)

     if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
       val autoEnter = true
       builder.setAutoEnterEnabled(autoEnter)
     }

     val params = builder.build()
     activity.setPictureInPictureParams(params)

     val entered = activity.enterPictureInPictureMode(params)
     Log.d(TAG, "PiP mode enter result: $entered")
   } catch (t: Throwable) {
     Log.e(TAG, "E_ENTER_PIP: ${t.message}", t)
   }
 }

  @ReactMethod
  fun exitPipMode(promise: Promise) {
    val activity: Activity? = currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "No active Activity to exit PiP.")
      return
    }

    try {
      // If we're already not in PiP, just resolve
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && !activity.isInPictureInPictureMode) {
        promise.resolve(true)
        return
      }

      // Bring the existing Activity to the foreground, which expands out of PiP
      val intent = Intent(activity, activity::class.java).apply {
        addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT or Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      activity.startActivity(intent)
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("E_EXIT_PIP", t.message, t)
    }
  }

  @ReactMethod
  fun isPipSupported(promise: Promise) {
    val activity: Activity? = currentActivity

    if (activity == null) {
      promise.resolve(false)
      return
    }

    // Check Android version support (PiP requires Android 8.0/API level 26 or higher)
    val isVersionSupported = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O

    // Check if PiP is supported by the device
    val packageManager = activity.packageManager
    val isPipSupported = isVersionSupported &&
                         packageManager.hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE)

    Log.d(TAG, "PiP support check: version=$isVersionSupported, feature=$isPipSupported")
    promise.resolve(isPipSupported)
  }
}
