import UIKit
import Firebase
import GoogleMaps

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
   var window: UIWindow? 

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    FirebaseApp.configure()

    let googleMapsKey =
      Bundle.main.object(forInfoDictionaryKey: "GOOGLE_MAP_KEY") as? String ?? ""

    print("GOOGLE_MAP_KEY loaded:", !googleMapsKey.isEmpty)

    GMSServices.provideAPIKey(googleMapsKey)

    return true
  }

  func application(
    _ application: UIApplication,
    configurationForConnecting connectingSceneSession: UISceneSession,
    options: UIScene.ConnectionOptions
  ) -> UISceneConfiguration {

    let config = UISceneConfiguration(
      name: "Default Configuration",
      sessionRole: connectingSceneSession.role
    )

    config.delegateClass = SceneDelegate.self

    return config
  }
}