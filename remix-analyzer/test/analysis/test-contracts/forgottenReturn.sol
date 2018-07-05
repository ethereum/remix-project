contract Sheep {
   string public name;
   string public dna;
   bool g = true;
   function Sheep(string _name, string _dna) {
       name = _name;
       dna = _dna;
    }

    function geneticallyEngineer(string _dna) returns (bool) {
       dna = _dna;
   }
}