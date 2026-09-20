# Animate Symbol Regex Replacer

Uses the bitmap-to-symbol JSON exported by the JSFL script to restrict a regular-expression replacement to the generated Adobe Animate `lib` definitions for symbols associated with one bitmap.

## Example

```bash
node src/cli.js --html game.html --map bitmapUsage.json --bitmap "images/bg" --regex "this\.alpha=0\.5" --replace "this.alpha=1"
```

The default output is `game_symbols_replaced.html`. Use `--output` to choose another path.

The app:
1. Reads the symbol IDs under the selected bitmap key.
2. Finds each `lib.Symbol = function(...) { ... }` constructor in the Animate HTML.
3. Uses balanced-brace scanning (while ignoring strings/comments) to isolate the definition rather than globally modifying the HTML.
4. Applies the supplied regex only to that definition.
5. Splices it back into the original HTML, preserving everything else.

Use `--flags` for RegExp flags and `--strict` to fail when a listed symbol cannot be found.

Note: if Animate's generated JavaScript identifier differs from the Library item name/path exported by JSFL, that symbol will be reported as NOT FOUND. In that case the JSFL exporter should emit Animate linkage/export IDs or the Node app should be given an explicit name map.
