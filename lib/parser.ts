import { excapeRegexChars } from "./helpers";
import { commentsPattern, deviceAssignedName, dynamicInjectsPattern, individualRulePattern, randomString, ruleIdentifierHeadPattern, stringsWithoutTemplateLiterals, styleRulePattern, useScopedStyleSheetPattern } from "./patterns";

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
                        ruleIdentifier = `.ss-${deviceAssignedName}-\${scoped}-${variable.slice(1)}`;
                        keyRefs = `${keyRefs}"${variable}":\`${ruleIdentifier}\`,`
                       
                    }else if(ruleIdentifier.startsWith('#')){
                        variable = excapeRegexChars({
                            regexp:/['`"]/g, text: ruleIdentifier, prefix:'\\'
                        });
                        ruleIdentifier = `#ss-${deviceAssignedName}-\${scoped}-${variable.slice(1)}`;
                        keyRefs = `${keyRefs}"${variable}":\`${ruleIdentifier}\`,`

                    }else{
                        variable = excapeRegexChars({
                            regexp:/['`"]/g, text: ruleIdentifier, prefix:'\\'
                        });
                        keyRefs = `${keyRefs}"${variable}":"${variable}",`
                    }
                    
                    // CSS rule start
                    ruleLine = `${ruleIdentifier}:{`

                    // Removes identifier head from rule set
                    ruleSet = ruleSet.replace(ruleIdentifierHeadPattern,'').replace(/(}\s*,)$/,',');

                    // Match out individual rules
                    ruleMathes = `${ruleSet},`.match(individualRulePattern)

                    if(ruleMathes){
                        let ruleName:string;
                        let ruleValue:string;
                        for(let i=0,l=ruleMathes.length;i<l;i++){
                            [ruleName,ruleValue] = ruleMathes[i].split(':');

                            // Remove string qoutes if any
                            ruleName = ruleName.replace(/^("|')/,'').replace(/("|')$/,'');

                            // Convert to a corresponding CSS rule name
                            ruleName = ruleName.replace(/[A-Z]/g,'-$&').toLowerCase();

                            // Check for dynamic injection
                            if(dynamicInjects[ruleValue]){
                                ruleValue = dynamicInjects[ruleValue];
                            }
                            else{
                                // Remove string qoutes if any
                                ruleValue = ruleValue.replace(/^("|')/,'').replace(/("|')$/,'');
                                ruleValue = `${ruleValue};`
                            }
                            
                            // Set rules. Example, margin: 45px;
                            ruleLine = `${ruleLine}${ruleName}:${ruleValue}`
                        }
                    }
                    ruleLine = `${ruleLine}}`;
                    styleSheet = `${styleSheet}${ruleLine}`
                } 
            }
            if(styleSheet){
                styleSheet = `\`${styleSheet}\``
            }
            keyRefs = `${keyRefs}}`
            content = content.replace(matches[i],`sheet:${styleSheet},keys:${keyRefs}`);
        }
    }
    return content;
}