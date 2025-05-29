let
  pkgs = import <nixpkgs> { };

  runtimeDependencies = with pkgs; [
    (lib.getLib stdenv.cc.cc)
    openssl
    gtk3
    cairo
    gdk-pixbuf
    glib
    dbus
    librsvg
    libsoup_2_4
    webkitgtk_4_1
    libcxx
    systemd
    libpulseaudio
    libdrm
    mesa
    stdenv.cc.cc
    alsa-lib
    atk
    at-spi2-atk
    at-spi2-core
    cups
    expat
    fontconfig
    freetype
    libgbm
    libnotify
    libuuid
    nspr
    nss
    pango
    systemd
    libappindicator-gtk3
    libdbusmenu
    libxkbcommon
    zlib
    libjack2
    pipewire
    udev
    flite
    libGL
    xorg.libXScrnSaver
    xorg.libXrender
    xorg.libXcursor
    xorg.libXdamage
    xorg.libXext
    xorg.libXfixes
    xorg.libXi
    xorg.libXrandr
    xorg.libX11
    xorg.libXcomposite
    xorg.libxshmfence
    xorg.libXtst
    xorg.libxcb
    xorg.libXxf86vm
  ];
in
pkgs.mkShell {
  packages = with pkgs; [
    pnpm
    cargo-tauri

    pkg-config
  ] ++ runtimeDependencies;

  shellHook = ''
    export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath runtimeDependencies}
  '';
}
