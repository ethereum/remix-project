pragma solidity >=0.4.9 <0.7.0;

contract Set {
  // We define a new struct datatype that will be used to
  // hold its data in the calling contract.
//   struct Data { uint flags; }

  // Note that the first parameter is of type "storage
  // reference" and thus only its storage address and not
  // its contents is passed as part of the call.  This is a
  // special feature of library functions.  It is idiomatic
  // to call the first parameter 'self', if the function can
  // be seen as a method of that object.
  //function insert(Data memory self, uint value) public
  //    returns (bool)
  //{
//       if (self.flags[value])
//           return false; // already there
//         self.flags[value] = true;

//       return true;
//   }

//   function remove(Data memory self, uint value) public
//       returns (bool)
//   {
//       if (!self.flags[value])
//           return false; // not there
//       self.flags[value] = false;
//       return true;
//   }

  function contains(uint value) public pure
      returns (uint)
  {
      return value;
  }
}


contract C {
    Set x;

    function register(uint value) public {
        // The library functions can be called without a
        // specific instance of the library, since the
        // "instance" will be the current contract.
        address payable a;
        a.send(10 wei);
        //if (!Set.insert(knownValues, value))
         //   revert();
    }

    function tests2() public {
        x = Set(0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c);
        uint y = x.contains(103);
        if(y == 103){
            y++;
        } else {
            y--;
        }
    }
    // In this contract, we can also directly access knownValues.flags, if we want.
}