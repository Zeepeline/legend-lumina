#!/usr/bin/env bash
set -e

echo "=== Memulai Kompilasi Aseprite Asli untuk macOS Apple Silicon (ARM64) ==="

DEPS_DIR="$HOME/aseprite-build"
mkdir -p "$DEPS_DIR"
cd "$DEPS_DIR"

# 1. Unduh pre-built Skia library resmi dari Aseprite
SKIA_DIR="$DEPS_DIR/skia"
if [ ! -d "$SKIA_DIR" ]; then
    echo ">> Mengunduh Skia library resmi Aseprite (macOS arm64)..."
    curl -L -o skia.zip "https://github.com/aseprite/skia/releases/download/m124-08a5439a6b/Skia-macOS-Release-arm64.zip"
    mkdir -p "$SKIA_DIR"
    unzip -q skia.zip -d "$SKIA_DIR"
    rm skia.zip
    echo ">> Skia siap di $SKIA_DIR"
fi

# 2. Clone source code Aseprite versi stabil terbaru (shallow clone agar hemat bandwidth & cepat)
ASEPRITE_SRC="$DEPS_DIR/aseprite"
if [ ! -d "$ASEPRITE_SRC" ]; then
    echo ">> Meng-clone Aseprite source code..."
    git clone --recursive --depth 1 --branch v1.3.14 https://github.com/aseprite/aseprite.git "$ASEPRITE_SRC"
fi

# 3. Konfigurasi CMake & Build dengan Ninja
echo ">> Menyiapkan konfigurasi CMake..."
cd "$ASEPRITE_SRC"
mkdir -p build
cd build

cmake \
  -DCMAKE_BUILD_TYPE=RelWithDebInfo \
  -DCMAKE_OSX_ARCHITECTURES=arm64 \
  -DCMAKE_OSX_DEPLOYMENT_TARGET=11.0 \
  -DLAF_BACKEND=skia \
  -DSKIA_DIR="$SKIA_DIR" \
  -DSKIA_LIBRARY_DIR="$SKIA_DIR/out/Release-arm64" \
  -DSKIA_LIBRARY="$SKIA_DIR/out/Release-arm64/libskia.a" \
  -DPNG_ARM_NEON:STRING=on \
  -G Ninja \
  ..

echo ">> Memulai kompilasi Ninja (ini akan memakan waktu sekitar 3-6 menit)..."
ninja aseprite

echo ">> Kompilasi selesai!"
echo ">> Binary Aseprite berada di: $ASEPRITE_SRC/build/bin/aseprite"

# Buat symbolic link ke /usr/local/bin atau ~/bin
mkdir -p "$HOME/bin"
ln -sf "$ASEPRITE_SRC/build/bin/aseprite" "$HOME/bin/aseprite"
echo ">> Aseprite berhasil ditautkan ke $HOME/bin/aseprite"
