let
  pkgs = import <nixpkgs> { };

  libraries = with pkgs;[
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
  ];

  packages = with pkgs; [
    pnpm
    cargo-tauri

    pkg-config
  ];
in
pkgs.mkShell {
  buildInputs = packages;

  shellHook =
    ''
      export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath libraries}:$LD_LIBRARY_PATH
      export XDG_DATA_DIRS=${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}:$XDG_DATA_DIRS
    '';
}
