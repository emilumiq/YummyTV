{
  description = "YummyTV — anime streaming development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
            android_sdk.accept_license = true;
          };
        };

        java = pkgs.jdk17;

        androidComposition = pkgs.androidenv.composeAndroidPackages {
          cmdLineToolsVersion = "latest";
          platformToolsVersion = "latest";
          buildToolsVersions = [ "36.0.0" ];
          platformVersions = [ "37" ];
          abiVersions = [ "arm64-v8a" "x86_64" "armeabi-v7a" "x86" ];
          includeNDK = false;
          includeEmulator = false;
          extraLicenses = [
            "android-sdk-license"
            "android-sdk-preview-license"
          ];
        };

        androidSdk = androidComposition.androidsdk;

        packages = [
          java
          pkgs.kotlin
          pkgs.gradle
          androidSdk
          gradleFhs
          pkgs.git
          pkgs.curl
          pkgs.jq
          pkgs.nodejs
          pkgs.pnpm
        ];

        gradleFhs = pkgs.buildFHSEnv {
          name = "gradle-fhs";
          targetPkgs = pkgs': with pkgs'; [
            androidSdk
            java
            zlib
            glib
            nss
            nspr
            fontconfig
            freetype
            expat
            libdrm
            mesa
            gcc
          ];
          runScript = "./gradlew";
          profile = ''
            export ANDROID_HOME="${androidSdk}/libexec/android-sdk"
            export ANDROID_SDK_ROOT="$ANDROID_HOME"
            export JAVA_HOME="${java}"
          '';
        };

        javaFhs = pkgs.buildFHSEnv {
          name = "java-fhs";
          targetPkgs = pkgs': with pkgs'; [
            java
            zlib
          ];
          runScript = "java";
        };

      in
      {
        devShells.default = pkgs.mkShell {
          name = "yummytv";

          inherit packages;

          JAVA_HOME = "${java}";
          ANDROID_HOME = "${androidSdk}/libexec/android-sdk";
          ANDROID_SDK_ROOT = "${androidSdk}/libexec/android-sdk";

          shellHook = ''
            echo ""
            echo "  yummytv  |  kotlin $(kotlin -version 2>&1 | head -1)"
            echo "  java $(java -version 2>&1 | head -1 | cut -d'"' -f2)"
            echo ""
            echo "  gradle-fhs :app:assembleDebug          — Build debug APK"
            echo "  gradle-fhs :app:assembleRelease        — Build release APK"
            echo ""
            export GRADLE_OPTS="-Xmx2048M -Dfile.encoding=UTF-8"
          '';
        };

        packages.gradle-fhs = gradleFhs;
        packages.java-fhs = javaFhs;
      }
    );
}
