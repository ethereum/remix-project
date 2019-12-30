const sourceRuntimeMapping = {}
sourceRuntimeMapping.mapping = '0:205:4:-;;;;;;;;;;;;;;;;;;;;;;55:74;;;;;;;;;;;;;;;;;;;;;;;;;;142:61;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;55:74;103:2;99:1;;:6;;;;;120:2;116:1;;:6;;;;;55:74;;;:::o;142:61::-;166:6;174;142:61;;;:::o'
sourceRuntimeMapping.source = `contract test { 
    int x; 
    
    int y; 
    
    function set(int _x, int _y) 
    {
        x = _x; 
        y = _y;
    } 
      
    function get() returns (uint x, uint y) 
    {
        
    }
}`

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
  module.exports = sourceRuntimeMapping
}
