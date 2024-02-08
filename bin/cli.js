#! /usr/bin/env node

import {appendFileSync,readFileSync,writeFileSync} from 'fs';
import {join} from 'path'
import {createHash} from 'crypto';

const argv = process.argv.slice(2);
if (argv.length !== 2) {
    process.exit(1);
}

const working_directory = process.cwd();
const node_modules = `${working_directory}/node_modules`;
let uniqueDeviceId = '';
let idUpdateSuccessful = false;
try {
    uniqueDeviceId = readFileSync(join(node_modules,'/react-stylescope/device.txt'),'utf8');
} catch (error) {
    uniqueDeviceId = '=10001'
}
if(uniqueDeviceId === '=10001'){
    try {
        uniqueDeviceId = crypto
          .createHash("shake256", { outputLength: 3 })
          .update(`${Math.random()}${Date.now()}${Math.random()}`)
          .digest("hex");
      } catch (error) {
        //If algorithm not supported by platform, generate randomly
        uniqueDeviceId = `${Math.random()}`.slice(2, 7)+''+`${Math.random()}`.slice(2, 5);
        uniqueDeviceId = Buffer.from(uniqueDeviceId).toString('base64').replace(/=/g,'')
      }
    writeFileSync(join(node_modules,'/react-stylescope/device.txt'),uniqueDeviceId);
    idUpdateSuccessful = true;
}

const [source,rootDirectory] = argv;
if(source === '-setup' && rootDirectory === 'react'){
    const webpack_config_file = join(node_modules,'/react-scripts/config/webpack.config.js');
    const webpack_config_mod = `
    // Keep actual config
    var actualConfig = module.exports;
    // Create injection array if not created.
    if(typeof configInjections === 'undefined'){
        var configInjections = [];
    }
    // Add custom config to injection array
    configInjections.push({
        test:/(\.ts|\.js|\.cjs|\.mjs|\.tsx|\.jsx)$/,
        exclude:/node_modules/,
        loader: require.resolve('react-stylescope/dist/lib/loader')
    });
    // Export a shimmed function to extract and return all injected configs plus actual configs
    module.exports = function(){
        const config = actualConfig.call(this,...arguments);
        configInjections.forEach((configObj)=>{
            config.module.rules.push(configObj)
        });
        return config;
    }
    /* This is a circular-posibble workaround for adding webpack configs to create-react-projects */

    `;
    appendFileSync(webpack_config_file,webpack_config_mod);
    console.log('\x1b[1mStylescope is setup successfuly for your react project\x1b[0m');
    process.exit(0);
}
else if(source === '-setup' && rootDirectory === 'device'){
    if(idUpdateSuccessful){
        console.log('\x1b[1mYour project id is updated\x1b[0m');
    }else{
        console.log('\x1b[1mYour project id is confirmed\x1b[0m');
    }
}

process.exit(0);
