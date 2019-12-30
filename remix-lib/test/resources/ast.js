const node = {}

node.ast = {"legacyAST":{"children":[{"attributes":{"fullyImplemented":true,"isLibrary":false,"linearizedBaseContracts":[5640396],"name":"test"},"children":[{"attributes":{"name":"x","type":"int256"},"children":[{"attributes":{"name":"int"},"id":5657860,"name":"ElementaryTypeName","src":"21:3:11"}],"id":5658100,"name":"VariableDeclaration","src":"21:5:11"},{"attributes":{"name":"y","type":"int256"},"children":[{"attributes":{"name":"int"},"id":5658180,"name":"ElementaryTypeName","src":"38:3:11"}],"id":5658268,"name":"VariableDeclaration","src":"38:5:11"},{"attributes":{"constant":false,"name":"set","public":true},"children":[{"children":[{"attributes":{"name":"_x","type":"int256"},"children":[{"attributes":{"name":"int"},"id":5658404,"name":"ElementaryTypeName","src":"68:3:11"}],"id":5658492,"name":"VariableDeclaration","src":"68:6:11"}],"id":5658572,"name":"ParameterList","src":"67:8:11"},{"children":[{"attributes":{"name":"_r","type":"int256"},"children":[{"attributes":{"name":"int"},"id":5658628,"name":"ElementaryTypeName","src":"85:3:11"}],"id":5658716,"name":"VariableDeclaration","src":"85:6:11"}],"id":5658796,"name":"ParameterList","src":"84:8:11"},{"children":[{"children":[{"attributes":{"operator":"=","type":"int256"},"children":[{"attributes":{"type":"int256","value":"x"},"id":5658900,"name":"Identifier","src":"108:1:11"},{"attributes":{"type":"int256","value":"_x"},"id":5658980,"name":"Identifier","src":"112:2:11"}],"id":5657492,"name":"Assignment","src":"108:6:11"}],"id":5659028,"name":"ExpressionStatement","src":"108:6:11"},{"children":[{"attributes":{"operator":"=","type":"int256"},"children":[{"attributes":{"type":"int256","value":"y"},"id":5659116,"name":"Identifier","src":"125:1:11"},{"attributes":{"string":null,"type":"int_const 10","value":"10"},"id":5659196,"name":"Literal","src":"129:2:11"}],"id":5659252,"name":"Assignment","src":"125:6:11"}],"id":5659316,"name":"ExpressionStatement","src":"125:6:11"},{"children":[{"attributes":{"operator":"=","type":"int256"},"children":[{"attributes":{"type":"int256","value":"_r"},"id":5659428,"name":"Identifier","src":"141:2:11"},{"attributes":{"type":"int256","value":"x"},"id":5639308,"name":"Identifier","src":"146:1:11"}],"id":5639356,"name":"Assignment","src":"141:6:11"}],"id":5639420,"name":"ExpressionStatement","src":"141:6:11"}],"id":5639516,"name":"Block","src":"97:57:11"}],"id":5639612,"name":"FunctionDefinition","src":"55:99:11"},{"attributes":{"constant":false,"name":"get","public":true},"children":[{"children":[],"id":5639764,"name":"ParameterList","src":"179:2:11"},{"children":[{"attributes":{"name":"x","type":"uint256"},"children":[{"attributes":{"name":"uint"},"id":5639820,"name":"ElementaryTypeName","src":"191:4:11"}],"id":5639908,"name":"VariableDeclaration","src":"191:6:11"},{"attributes":{"name":"y","type":"uint256"},"children":[{"attributes":{"name":"uint"},"id":5639988,"name":"ElementaryTypeName","src":"199:4:11"}],"id":5640076,"name":"VariableDeclaration","src":"199:6:11"}],"id":5640156,"name":"ParameterList","src":"190:16:11"},{"children":[],"id":5640212,"name":"Block","src":"212:17:11"}],"id":5640276,"name":"FunctionDefinition","src":"167:62:11"}],"id":5640396,"name":"ContractDefinition","src":"0:231:11"}],"name":"SourceUnit"}}

node.source = `contract test { 
    int x; 
    
    int y; 
    
    function set(int _x) returns (int _r)
    { 
        x = _x; 
        y = 10;
        _r = x;
    } 
      
    function get() returns (uint x, uint y) 
    {
         
    }
}`

module.exports = node