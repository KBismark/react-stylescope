
// Special character excape for RegExp
export function excapeRegexChars(text:string|{regexp:RegExp;text:string;prefix:string}) {
    if(typeof text!='string'){
        return text.text.replace(text.regexp, `${text.prefix}$&`);
    }
    return text.replace(/[\\[.*+(?{^$|})]/g, "\\$&");
}