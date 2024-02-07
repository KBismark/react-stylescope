
import React from "react";

const scopedNames:{[k:string]:number} = {};
const leastNumber = -99999999;


type MapReactCSSProperties<S> = {sheet:string;keys:{[K in keyof S]:string}} 
/**
 * Creates a css string from a React CSSProperties object during development. 
 * The function only returns a pre-computed object when your application runs in the browser. 
 * All dirty works (conversion of the styles object to css string) is done before the code gets to the browser.
 * @param styleSheet Styles object.
 * @param marker Pass the `scoped` variable here. Anything other than the varible
 * `scoped` won't work. 
 * 
 * @example
 * const App = ()=>{
 *      const [ theme, setTheme ] = useState('light')
 *      const scoped = useScopedName('App');
 *      const { keys, sheet } = useScopedStyleSheet({
 *          '.container':{
 *              opacity: 0.9,
 *              margin: '10px',
 *              // Dynamic values must be set inside template literals
 *              color: `${theme==='light'?'black':'white'}`
 *          }
 *      },scoped)
 *      // rest of your code...
 * 
 *      return (
 *          <div className={keys['.container']}>
 *              <h1>Hello world</h1>
 *               <ScopedStyleSheet styles={sheet} />
 *          </div>
 *      )
 * }
 */
export function useScopedStyleSheet<S=any>(styleSheet:{[K in keyof S]:React.CSSProperties}|S,marker:'scoped'):MapReactCSSProperties<S>{
    return styleSheet as any;
}

/**
 * Retuens a `scoped` name unique to the calling component. The value returned
 * must be stored in a variable named `scoped`. **This is a requirement**
 * @param name A unique name for the component. It may be the name of the component.
 * 
 * **Do not forget to name your variable `scoped`**
 * 
 * @example 
 *  const App = ()=>{
 *      const scoped = useScopedName('App');
 *      // rest of your code...
 * }
 */
export function useScopedName(name:string): string{
    if(!scopedNames[name] ){
        scopedNames[name] = leastNumber;
    }
    return `${name}-${scopedNames[name]++}`;
}

type ScopedStyleSheetProps = {
    styles:string
}

/**
 * Renders a style element with your style sheet.    
 * @param props.styles Pass the style sheet to the styles prop
 */
export function ScopedStyleSheet({styles}:ScopedStyleSheetProps):React.ReactNode{
    return <style>{styles}</style>
}
