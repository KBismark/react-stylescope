
const { 
    commentsPattern, useScopedStyleSheetPattern, dynamicInjectsPattern, 
    individualRulePattern, ruleIdentifierHeadPattern, 
    stringsWithoutTemplateLiterals, styleRulePattern, stringsPattern 
} = require("../dist/lib/patterns");

const sampleCode = require('fs').readFileSync(
    require('path').join(__dirname,'./sample.code.txt'),
    'utf8'
) 

describe('Patterns Test',()=>{
    const match = (regexp)=> sampleCode.match(regexp);

    it("Matches a comments in code",()=>{
        expect(sampleCode).toMatch(commentsPattern)
    })

    it("Matches a strings in code",()=>{
        expect(sampleCode).toMatch(stringsPattern)
    })

   describe("Checks if comments are matched correctlly",()=>{
    const matches = match(commentsPattern)
     
    const isReallyComment  = (comment)=>{
        return (comment.startsWith('//')&&comment.endsWith('\n'))||(comment.startsWith('/*')&&comment.endsWith('*/'))
    }

    it('Checks if the first comment matched was right',()=>{
        expect(matches[0]).toEqual(expect.stringMatching(new RegExp('^\\/\\/ Primary color')));
    })

    it.each(matches)('Starts with // and ends on a new line or enclosed in /* and */ MATCHED: %j ',(commentLine)=>{
        expect(isReallyComment(commentLine)).toBe(true)
    })

   })


   describe('Checks if strings are matched coreectly',()=>{
    
    const matches = match(stringsPattern)
    
    /**
     * 
     * @param {string} string 
     * @returns 
     */
    const isReallyString = (string)=>{

        const isQuotedString = (char)=>{
            let result = (string.startsWith(char)&&string.endsWith(char));
            if(result){
                const stringUnQuote = string.substring(1,string.length-2)
                const hasDoubleQuoteStill = stringUnQuote.includes(char);
                if(hasDoubleQuoteStill){
                    // Check if they are escaped
                    // Remove escaped quotes and check if has double qoute still
                    const mustNotIncludeQuote = !(stringUnQuote.replace(`\\${char}`,'').includes(char))
                    result = mustNotIncludeQuote;
                }
            }
            return result;
        }
      
        let isString = (isQuotedString('"')||isQuotedString("'"));

        if(!isString){
            // Check if its enclosed rather in (`)s
            // NEEDS A FIX
            // JavaScript string templates are too complex to match with reqular expressions 
            isString = string.startsWith('`')&&string.endsWith('`')
        }

        return isString;
    }

    it('Checks if the first string matched was right',()=>{
        expect(matches[0]).toBe("'rgb(0,0,0)'");
    })

    it.each(matches)('Is really a string.  MATCHED: %j ',(value)=>{
        expect(isReallyString(value)).toBe(true)
    })

   })

})