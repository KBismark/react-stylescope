#! /usr/bin/env node

import {appendFileSync} from 'fs';
import {join} from 'path'

const argv = process.argv.slice(2);
if (argv.length !== 2) {
    process.exit(1);
}
const [source,rootDirectory] = argv;
if(source === '--setup' && rootDirectory === 'react'){
    const working_directory = process.cwd();
    const webpack_config_file = join(working_directory,'/node_modules/react-scripts/config/webpack.config.js');
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
        loader: require.resolve('react-scoped-styles/dist/lib/loader')
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
    process.exit(0);
}

process.exit(0);
