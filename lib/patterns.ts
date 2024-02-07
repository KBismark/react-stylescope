import {readFileSync} from 'fs';
import {join} from 'path'
import { excapeRegexChars } from "./helpers";

export const nonBreakingCharactersObject = {
    all: [
        ';',':','{','}','(',')','[',']',',','<','>','+','-','*','/','|','&','^','%','!','~','?','=','\\s','.'
    ],
    start: [
        ';',':','{','(',',','[','<','>','+','-','*','/','|','&','%','!','~','?','=','\\s'
    ],
    end: [
        ';','}','(',',',']','<','>','+','-','*','/','|','&','%','!','~','?','=','\\s','.'
    ],
};

export let deviceAssignedName = '';

const working_directory = process.cwd();
const node_modules = `${working_directory}/node_modules`;

try {
    // Read unique device id
    deviceAssignedName = readFileSync(join(node_modules,'/react-stylescope/device.txt'),'utf8');
} catch (error) {
     //If algorithm not supported by platform, generate randomly
     deviceAssignedName = `${Math.random()}`.slice(2, 7)+''+`${Math.random()}`.slice(2, 5);
     deviceAssignedName = Buffer.from(deviceAssignedName).toString('base64').replace(/=/g,'')
}

// RegExp to match scoped style sheets
export const mustPreceed = `(?<=(${nonBreakingCharactersObject.all.map(excapeRegexChars).join('|')}|[^\S])useScopedStyleSheet\\s*\\(\\s*{)`;
export const mustFollow = `(?=}\\s*,\\s*(scoped)\\s*\\))`;
 export const useScopedStyleSheetPattern = RegExp(`(${mustPreceed}(.*?))${mustFollow}`,'gs')
  
// Strings pattern
export const stringsPattern = /('((?<=\\)'|[^'\n])*')|("((?<=\\)"|[^"\n])*")|(`((?<=\\)`|[^`])*`)/gs;

export const stringsWithoutTemplateLiterals = /('((?<=\\)'|[^'\n])*')|("((?<=\\)"|[^"\n])*")/gs;
// Dynamic injections into style sheets pattern
export const dynamicInjectsPattern = /`((?<=\\)`|[^`])*`/gs;

// Comments pattern
export const commentsPattern = /(\/\*(.*?)\*\/)|(\/\/(.*?)\n)/gs;

// Style rules pattern
export const styleRulePattern = /(?<=\s|[^\S])((('((?<=\\)'|[^'\n])*')|("((?<=\\)"|[^"\n])*"))\s*:\s*{.*?}\s*,)/gs;
export const ruleIdentifierHeadPattern = /(?<=\s|[^\S])((('((?<=\\)'|[^'\n])*')|("((?<=\\)"|[^"\n])*"))\s*:\s*{)/gs;
export const individualRulePattern = /((?<=\s|[^\S])(\S.*?\S*\s*:\s*\S.*?\S*))(?=\s*,)/gs;
// Random replacer
export const random = `${Math.random()}${Math.random()}`

// Random string replacer
export const randomString = `rand_str-${random}`