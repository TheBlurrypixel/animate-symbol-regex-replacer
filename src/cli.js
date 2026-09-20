#!/usr/bin/env node
const {processFiles}=require("./index");let a=process.argv.slice(2),v=n=>{let i=a.indexOf(n);return i<0?undefined:a[i+1]};
if(!a.length||a.includes("--help")){console.log(`Usage:
node src/cli.js --html game.html --map bitmapUsage.json --bitmap "images/bg" --regex "PATTERN" --replace "TEXT" [--flags g] [--output out.html] [--strict]`);process.exit()}
try{let o={htmlFile:v("--html"),mapFile:v("--map"),bitmapId:v("--bitmap"),regexSource:v("--regex"),replacement:v("--replace")||"",regexFlags:v("--flags")||"g",outputFile:v("--output"),strict:a.includes("--strict")};for(let k of["htmlFile","mapFile","bitmapId","regexSource"])if(!o[k])throw Error("Missing "+k);let r=processFiles(o);console.log("Wrote: "+r.outputFile);r.reports.forEach(x=>console.log(`${x.symbolId}: ${x.found?x.replacements+" replacement(s)":"NOT FOUND"}`))}catch(e){console.error("Error: "+e.message);process.exit(1)}
