contract Sheep {
   string public name;
   string public dna;
   bool g = true;
   constructor(string memory _name, string memory _dna) public {
       name = _name;
       dna = _dna;
    }

    function geneticallyEngineer(string memory _dna) public returns (bool) {
       dna = _dna;
   }
}