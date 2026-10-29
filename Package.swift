// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "ShipwrightAcademy",
    platforms: [.macOS("26.0")],
    targets: [
        .executableTarget(
            name: "ShipwrightAcademy",
            resources: [.copy("Resources/curriculum.json")]
        )
    ],
    swiftLanguageModes: [.v5]
)
