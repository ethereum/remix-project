pragma solidity >= 0.5.0 < 0.8.0;

contract EvenOdd {
    
    /**
     * @dev Tells whether a number is even or odd
     * @param num Number to check
     */

    function check(int num) public pure returns (string memory){
        if(num % 2 == 0)
            return "EVEN";
        return "ODD";
    }
}