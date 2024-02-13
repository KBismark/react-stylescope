
# react-stylescope ![NPM Version](https://img.shields.io/npm/v/react-stylescope) ![GitHub License](https://img.shields.io/github/license/KBismark/react-stylescope)     

Component based styling for react. Write styles that are scoped to the components where they are created. 
A react implementation of the `@scope` CSS at-rule with support for all browsers that can run JavaScript. 

React allows you to write components to define your app's UI. Every component have its own logic and state 
which allows for a dclarative and mantainable codebase. However, how do we style those components? What if 
the are differnt teams working on different parts of the application? How do we solve the confusion of CSS 
name conflicts easily? Team A sets `.card{ background-color: white;}` Team B thinks `.card{ background-color: blue;}` 
works perfectly for them. Both Teams push to production. What happens next? Disaster!!    

There are solutions like [styled-components](https://github.com/styled-components). Styled-components is one of the 
good solutions out there to help write styles that are scoped or tied to components. However, wouldn't it be easier to write 
styles with auto completions out of the box than writing as strings?   

All you will need to do is `npm install react-stylescope`   

Write your style-scopped component.    
```tsx
import { useScopedStyleSheet, getScopedName, ScopedStyleSheets } from 'react-stylescope'

type CardProps = {backgroundColor: 'white'|'blue',caption:string}

const Card = ({backgroundColor, caption}: CardProps)=>{
    const scoped = getScopedName('Card')
    const { keys, sheet } = useScopedStyleSheet({
        '.card-container': {
            width: '320px',
            backgroundColor: `${backgroundColor}`
        },
        '.card-container img':{
            lineHeight: 1.5,
            display: 'block',
            margin: '10px'
        }
    }, scoped)

    return (
        <div className={keys['.card-container']} >
            <div><img src='image.png' alt='Some text'  /></div>
            <div>{caption}</div>
            <ScopedStyleSheets styles={sheet} />
        </div>
    )
}

```    

Now from the above component, Team A and Team B can use their desired color for background without anymore worries. 

And, relax. The style object passed to `useScopedStyleSheet` does not get to the browser. Hurray! It's transpiled 
into strings before the code gets served to the browser. You get what I'm heading to right? Write the styles with 
code completions and it's converted into strings for you. No more pain writing css in strings.    

## How to use react-stylescope
After installation, if the project was created with `create-react-app` navigate to the project directory and run 
`npx stylescope --setup react`     

Else, add the code below to the end of the `module.rules` array in the `webpack.config.js` and run `npx stylescope --setup device`    
```js
{
    test:/(\.ts|\.js|\.cjs|\.mjs|\.tsx|\.jsx)$/,
    exclude:/node_modules/,
    loader: require.resolve('react-stylescope/dist/lib/loader.js')
}

```  
## Using Vite?
Import the `ScopedStyleVitePlugin` and add to the plugins array in the `vite.config.js` file 
and run `npx stylescope --setup device`  

```js
import { ScopedStyleVitePlugin } from "react-stylescope/dist/lib/vite-loader";

// A possible config may looked like this
export default defineConfig({
  plugins: [react(), ScopedStyleVitePlugin()] // Added to the plugin array
});

```

That is all to configure.    

## API documentation 

### getScopedName
> Returns a `scoped` name unique to the calling component. The value returned 
> must be stored in a variable named `scoped`. **This is a requirement**  
>  
> **@param** `name` A unique name for the component. It may be the name of the component.    
> 
> **Do not forget to name your variable `scoped`**
> 
> ```js 
>  const App = ()=>{
>      // Prevent regeneration of new scoped name on re-render
>      const scoped = useMemo(()=>getScopedName('App'),[]);
>      // rest of your code...
> }
>
>```

### ScopedStyleSheets
> A component that renders a style element with your style sheet.       
> **@param** `props.styles` Pass the style sheet to the styles prop

### useScopedStyleSheet 
> Creates a css string from a React CSSProperties object. The style object passed to `useScopedStyleSheet` 
> does not get to the browser. It's transpiled into strings before the code gets served to the browser. 
> The function only returns a pre-computed object when your application runs in the browser.     
> All dirty works (conversion of the styles object to css string) is done before the code gets to the browser.    
>    
> **@param** `styleSheet` Styles object.    
>
> **@param** `marker` Pass the `scoped` variable here. Anything other than the varible named `scoped` won't work. 
> 
> ```jsx
> const App = ()=>{
>      const [ theme, setTheme ] = useState('light')
>      const color = `${theme==='light'?'black':'white'}`;
>      // Prevent regeneration of new scoped name on re-render
>      const scoped = useMemo(()=>getScopedName('App'),[]);
>      // Get keys and style sheet
>      const { keys, sheet } = useScopedStyleSheet({
>          '.container':{
>              opacity: 0.9,
>              margin: '10px',
>              // Dynamic values must be set inside template literals
>              color: `${color}`
>          }
>      },scoped)
>      // rest of your code...
> 
>      return (
>          <div className={keys['.container']}>
>              <h1>Hello world</h1>
>               <ScopedStyleSheet styles={sheet} />
>          </div>
>      )
> }
>
>```

## Setting style values dynamically
In your style objects passed to `useScopedStyleSheet`, when setting the values dynamically, do so only in template literals.    

> 
> The following are wrong ❌ when setting style object values
>
> **Rule 1**    
> This is wrong.
> ```js
> const styleObject = { /*...*/ };
> const {keys, sheet} = useScopedStyleSheet(styleObject,scoped) 
>  
>```
>
> **Solution:** Do not pass the object dynamically. Do it like below;    
> ```js
> const {keys, sheet} = useScopedStyleSheet({ /*...*/ },scoped)   
>```
>
> **Rule 2**    
> This is wrong.
> ```js
> const className = '.my-class';
> const {keys, sheet} = useScopedStyleSheet({
>    [className]: { /*...*/ }
> },scoped)   
>
>```
>
> **Solution:** Do not set keys dynamically. Do it like below;    
> ```js
> const {keys, sheet} = useScopedStyleSheet({
>    '.my-class': { /*...*/ }
> },scoped)   
>
>```
>
> **Rule 3**    
> This is wrong.
> ```js
> const {keys, sheet} = useScopedStyleSheet({
>   '.my-class': {
>        margin: 10 + 'px'
>    }
> },scoped)   
>
>```
>
> **Solution:** Set dynamic values this way instead. Always have the final value stored in a variable and 
> set using template literals.    
> ```js
> const margin = 10 + 'px';
> const {keys, sheet} = useScopedStyleSheet({
>   '.my-class': {
>        margin: `${margin}`
>    }
> },scoped)   
>
>```

Happy Coding!
