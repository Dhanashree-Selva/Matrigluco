# Hugeicons conversion

Android product icons are generated from the pinned official `@hugeicons/core-free-icons@4.2.1` package. This is the MIT-licensed Hugeicons Free Stroke Rounded catalog. The package is conversion input only, not an application dependency.

1. Pack and extract the pinned package into an ignored temporary directory.
2. Run `convert_hugeicons.ps1 -SourceDirectory <package>/dist/esm -OutputDirectory core/designsystem/src/main/res/drawable`.
3. Run Android resource validation and builds.

Run `validate_hugeicons.ps1` from the Android root before building. It rejects non-canonical names, viewport/size drift, missing paths, inconsistent strokes, and leftover legacy assets.

The converter accepts SVG paths and exactly converts circles to equivalent arc paths on the 24×24 viewport, using the catalog's 1.5 stroke. It fails instead of silently dropping other unsupported primitives or unexpected weights. Names are explicitly mapped for compile-time resource references.
