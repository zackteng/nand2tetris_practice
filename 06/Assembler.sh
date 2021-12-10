#!/usr/bin/env node
const { resolve, parse, format } = require('path');
const { createReadStream } = require('fs');
const { readFile, writeFile } = require('fs/promises');
const { createInterface } = require('readline');

const openFile = async () => {
  const asmPath = resolve(process.cwd(), process.argv[2]);
	const asmPathParsed = parse(asmPath)
	const hackPath = format({ dir: asmPathParsed.dir, name: asmPathParsed.name, ext: '.hack' });
	const asmFile = await readFile(asmPath, { encoding: 'utf-8' });
	const hackFile = await writeFile(hackPath, asmFile);
}

const openFile2 = async () => {
  const asmPath = resolve(process.cwd(), process.argv[2]);
	const fileStream = createReadStream(asmPath);
	const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
 
  for await (const line of rl) {
    console.log(`Line from file: ${line}`);
  }
}


openFile2();