/*
    Export Bitmap -> Containing Symbols Map

    For every bitmap in the Library:
      - Finds every symbol that directly contains an instance of it.
      - Exports a JSON object:
      
        {
            "bitmapId": [
                "symbolId1",
                "symbolId2"
            ]
        }

    Bitmap and symbol IDs are their full Library item names,
    including folder paths.
*/

(function () {

    var dom = fl.getDocumentDOM();

    if (!dom) {
        alert("No Animate document is open.");
        return;
    }

    var library = dom.library;
    var items = library.items;

    var bitmaps = [];
    var symbols = [];

    // ------------------------------------------------------------
    // Collect bitmap and symbol Library items
    // ------------------------------------------------------------

    for (var i = 0; i < items.length; i++) {

        var item = items[i];

        if (item.itemType === "bitmap") {
            bitmaps.push(item);
        }
        else if (
            item.itemType === "movie clip" ||
            item.itemType === "graphic" ||
            item.itemType === "button"
        ) {
            symbols.push(item);
        }
    }

    // ------------------------------------------------------------
    // Build lookup table
    // bitmap library name -> true
    // ------------------------------------------------------------

    var bitmapLookup = {};

    for (var b = 0; b < bitmaps.length; b++) {
        bitmapLookup[bitmaps[b].name] = true;
    }

    // ------------------------------------------------------------
    // Result
    // ------------------------------------------------------------

    var result = {};

    // Include every bitmap even if nothing uses it.
    for (var b = 0; b < bitmaps.length; b++) {
        result[bitmaps[b].name] = [];
    }

    // ------------------------------------------------------------
    // Scan symbols
    // ------------------------------------------------------------

    for (var s = 0; s < symbols.length; s++) {

        var symbol = symbols[s];
        var timeline = symbol.timeline;

        if (!timeline) {
            continue;
        }

        // Keep track so the same symbol isn't added more than once
        // for the same bitmap.
        var foundInSymbol = {};

        var layers = timeline.layers;

        for (var l = 0; l < layers.length; l++) {

            var layer = layers[l];
            var frames = layer.frames;

            if (!frames) {
                continue;
            }

            /*
                Animate's layer.frames array can contain repeated
                references for frame spans.

                We only need to inspect each keyframe once.
            */

            var lastStartFrame = -1;

            for (var f = 0; f < frames.length; f++) {

                var frame = frames[f];

                if (!frame) {
                    continue;
                }

                // Only process the first frame of a frame span.
                if (frame.startFrame !== f) {
                    continue;
                }

                var elements = frame.elements;

                if (!elements) {
                    continue;
                }

                for (var e = 0; e < elements.length; e++) {

                    var element = elements[e];

                    /*
                        Bitmap instances have elementType "instance"
                        and their libraryItem points to the bitmap.
                    */

                    if (
                        element.elementType === "instance" &&
                        element.libraryItem &&
                        element.libraryItem.itemType === "bitmap"
                    ) {

                        var bitmapName = element.libraryItem.name;

                        if (
                            bitmapLookup[bitmapName] &&
                            !foundInSymbol[bitmapName]
                        ) {
                            result[bitmapName].push(symbol.name);
                            foundInSymbol[bitmapName] = true;
                        }
                    }
                }
            }
        }
    }

    // ------------------------------------------------------------
    // JSON stringify
    //
    // JSON.stringify should exist in modern Animate JSFL,
    // but provide a fallback just in case.
    // ------------------------------------------------------------

    function escapeJSONString(str) {

        return '"' +
            String(str)
                .replace(/\\/g, "\\\\")
                .replace(/"/g, '\\"')
                .replace(/\r/g, "\\r")
                .replace(/\n/g, "\\n")
                .replace(/\t/g, "\\t") +
            '"';
    }

    function stringifyFallback(obj) {

        var parts = [];

        for (var key in obj) {

            if (!obj.hasOwnProperty(key)) {
                continue;
            }

            var arr = obj[key];
            var values = [];

            for (var i = 0; i < arr.length; i++) {
                values.push(escapeJSONString(arr[i]));
            }

            parts.push(
                "  " +
                escapeJSONString(key) +
                ": [\n    " +
                values.join(",\n    ") +
                "\n  ]"
            );
        }

        return "{\n" + parts.join(",\n") + "\n}";
    }

    var json;

    if (
        typeof JSON !== "undefined" &&
        typeof JSON.stringify === "function"
    ) {
        json = JSON.stringify(result, null, 2);
    }
    else {
        json = stringifyFallback(result);
    }

    // ------------------------------------------------------------
    // Ask where to save the JSON
    // ------------------------------------------------------------

	var outputURI = fl.browseForFileURL("save", "Save Bitmap Usage JSON", "JSON Files (*.json)", "json");

    if (!outputURI) {
        return;
    }

    // Add .json if necessary.
    if (!/\.json$/i.test(outputURI)) {
        outputURI += ".json";
    }

    // ------------------------------------------------------------
    // Write file
    // ------------------------------------------------------------

    if (!FLfile.write(outputURI, json)) {
		fl.trace(outputURI);
		fl.trace(json);
        alert("Unable to write JSON file.");
        return;
    }

    alert(
        "Bitmap usage exported successfully.\n\n" +
        "Bitmaps: " + bitmaps.length + "\n" +
        "Symbols scanned: " + symbols.length
    );

})();