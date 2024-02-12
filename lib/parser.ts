import { excapeRegexChars } from "./helpers";
import { 
    commentsPattern, deviceAssignedName, dynamicInjectsPattern, 
    individualRulePattern, randomString, ruleIdentifierHeadPattern, 
    stringsWithoutTemplateLiterals, styleRulePattern, useScopedStyleSheetPattern 
} from "./patterns";

export function ParseScopedStyleSheet(content:string):string{
    // Match all 'useScopedStyleSheet' blocks
    const matches = content.match(useScopedStyleSheetPattern);

    if(matches){
        let styleSheet:string;
        let keyRefs:string;
        let sheetMatch:string;
        let dynamicInjectsMatches: string[]|null;
        let dynMatch: string;
        let dynamicInjects: {[k:string]:string}
        let styleRuleMatches: string[]|null;
        for(let i=0,l=matches.length;i<l;i++){
            styleSheet = '';
            keyRefs = '{';

            // Adds a comma at the end of a match for easy sub-matches
            sheetMatch = `${matches[i]},`;

            // Take comments out of sheetMatch
            sheetMatch = sheetMatch.replace(commentsPattern,' ');
            
            // Match all dynamic value injections
            dynamicInjectsMatches = sheetMatch.match(dynamicInjectsPattern);

            // Dynamic values store
            dynamicInjects = {};

            if(dynamicInjectsMatches){
                // Match and store dynamic values
                for(let i=0,l=dynamicInjectsMatches.length;i<l;i++){
                    dynMatch = dynamicInjectsMatches[i];
                    dynamicInjects[`${randomString}D=${i};`] = dynMatch.replace(/^\S/,'').replace(/\S$/,';');
                    sheetMatch = sheetMatch.replace(dynMatch,`${randomString}D=${i};`)
                }
            }

            // Match all rule sets
            styleRuleMatches = sheetMatch.match(styleRulePattern)

            if(styleRuleMatches){
                let ruleIdentifier:string;
                let ruleSet:string;
                let ruleMathes:string[]|null;
                let ruleLine:string='';
                let variable:any;
                for(let i=0,l=styleRuleMatches.length;i<l;i++){
                    ruleSet = styleRuleMatches[i];

                    // Matches out the identifier
                    ruleIdentifier = (ruleSet.match(stringsWithoutTemplateLiterals) as any)[0];
                    ruleIdentifier = ruleIdentifier.replace(/^["']/,'').replace(/["']$/,'');
                    
                    // Set scoped dynamic refernce
                    if(ruleIdentifier.startsWith('.')){
                        variable = excapeRegexChars({
                            regexp:/['`"]/g, text: ruleIdentifier, prefix:'\\'
                        });
                        ruleIdentifier = `s${deviceAssignedName}\${scoped}${variable.slice(1)}`;
                        // Build keys object
                        keyRefs = `${keyRefs}"${variable}":\`${ruleIdentifier}\`,`
                        // Set as a class name
                        ruleIdentifier = `.${ruleIdentifier}`
                       
                    }else if(ruleIdentifier.startsWith('#')){
                        variable = excapeRegexChars({
                            regexp:/['`"]/g, text: ruleIdentifier, prefix:'\\'
                        });
                        ruleIdentifier = `s${deviceAssignedName}\${scoped}${variable.slice(1)}`;
                        // Build keys object
                        keyRefs = `${keyRefs}"${variable}":\`${ruleIdentifier}\`,`;
                         // Set as a id
                        ruleIdentifier = `#${ruleIdentifier}`

                    }else{
                        // If not an id (#<identifier>) or class name (.<identifier>), leave as it is
                        variable = excapeRegexChars({
                            regexp:/['`"]/g, text: ruleIdentifier, prefix:'\\'
                        });
                         // Set as a class name
                        keyRefs = `${keyRefs}"${variable}":"${variable}",`
                    }
                    
                    // CSS rule start
                    ruleLine = `${ruleIdentifier}{`

                    // Removes identifier head from rule set
                    ruleSet = ruleSet.replace(ruleIdentifierHeadPattern,'').replace(/(}\s*,)$/,',');

                    // Match out individual rules
                    ruleMathes = `${ruleSet},`.match(individualRulePattern)

                    if(ruleMathes){
                        let ruleName:string;
                        let ruleValue:string;
                        let value: string|string[]|null;
                        for(let i=0,l=ruleMathes.length;i<l;i++){
                            value = ruleMathes[i].split(':');
                            ruleValue = value.pop();
                            ruleName = value.join(':');

                            // Remove string qoutes if any
                            value = ruleName.match(stringsWithoutTemplateLiterals)
                            if(value){
                                ruleName = value[0].replace(/^("|')/,'').replace(/("|')$/,'');
                            }

                            // Convert to a corresponding CSS rule name
                            ruleName = ruleName.replace(/[A-Z]/g,'-$&').toLowerCase();

                            // Check for dynamic injection
                            value = ruleValue.match(/rand_str-[0-9.]+D=[0-9]+;/);
                            if (value) {
                                ruleValue = dynamicInjects[value[0]];
                            }
                            else{
                                // Remove string qoutes if any
                                value = ruleValue.match(stringsWithoutTemplateLiterals);
                                if(value){
                                    ruleValue = value[0].replace(/^("|')/, '').replace(/("|')$/, '');
                                }
                                // Add ending semi-colon required by css
                                ruleValue = `${ruleValue};`
                            }
                            
                            // Set rules. Example, margin: 45px;
                            ruleLine = `${ruleLine}${ruleName}:${ruleValue}`
                        }
                    }
                    // End the rules set
                    /**
                     * At the momemnt, we have some 
                     * 
                     * .<identifier>{
                     *     margin: 45px;
                     * }
                     * 
                     * stored in `ruleLine`
                     */
                    ruleLine = `${ruleLine}}`;

                    // Add to style sheet
                    styleSheet = `${styleSheet}${ruleLine}`
                } 
            }
            if(styleSheet){
                /** 
                 * Style sheet is a string that may contain dynamic JavaScript values 
                 * inside string templates "${ some_dynamic value }". Enclose with (`)s
                */ 
                styleSheet = `\`${styleSheet}\``
            }
            // End keys object
            keyRefs = `${keyRefs}}`
            // Replace the style object in the code with derived object
            content = content.replace(matches[i],`sheet:${styleSheet},keys:${keyRefs}`);
        }
    }
    // Return code for further processing by react.
    return content;
}