/* eslint-disable camelcase */

declare module 'yo-yo'{
  interface yo_yo {
    (strings:string[], ...values:any[]):HTMLElement;
    update(element:HTMLElement, element2:HTMLElement);
  }
  var yo:yo_yo
  export = yo;
}

declare module 'dom-css'{
 interface dom_css{
   (element:HTMLElement, css:any):void;
 }

 var css:dom_css
 export = css;
}
